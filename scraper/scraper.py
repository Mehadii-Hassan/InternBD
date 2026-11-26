#!/usr/bin/env python3
"""
InternBD Automatic Daily Scraper
Scrapes internship listings from verified Bangladeshi sources and writes to Supabase.

Source types:
  ats_json  - Lever public JSON API (api.lever.co/v0/postings/{site}?mode=json)
  ashby_html - Ashby careers page (jobs.ashbyhq.com/{company})
  html      - Generic HTML career page scraping
"""

import json
import re
import time
import sys
import os
import hashlib
from datetime import datetime, timezone, timedelta
from urllib.parse import urljoin, urlparse, urlunparse
from urllib.robotparser import RobotFileParser

import requests
from bs4 import BeautifulSoup

try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from supabase import create_client


def load_env():
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env.local')
    env = {}
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env[key.strip()] = value.strip()
    return env


ENV = load_env()
SUPABASE_URL = ENV.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_SERVICE_KEY = ENV.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("ERROR: Missing Supabase credentials in .env.local")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

SOURCES_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sources.json')
with open(SOURCES_PATH, 'r', encoding='utf-8') as f:
    SOURCES_CONFIG = json.load(f)

SOURCES = SOURCES_CONFIG['sources']
SETTINGS = SOURCES_CONFIG.get('settings', {})

REQUEST_DELAY = SETTINGS.get('request_delay_seconds', 2)
TIMEOUT = SETTINGS.get('timeout_seconds', 15)
MAX_RETRIES = SETTINGS.get('max_retries', 3)
USER_AGENT = SETTINGS.get('user_agent', 'InternBD-Scraper/1.0')

HEADERS = {
    'User-Agent': USER_AGENT,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
}

INTERNSHIP_KEYWORDS = [
    'intern', 'internship', 'trainee', 'apprentice', 'industrial attachment',
    'অনুশীলন', 'ইন্টার্নশিপ', 'প্রশিক্ষণ생',
]

DIVISION_MAP = {
    'dhaka': 'Dhaka',
    'chattogram': 'Chattogram',
    'chittagong': 'Chattogram',
    'rajshahi': 'Rajshahi',
    'sylhet': 'Sylhet',
    'khulna': 'Khulna',
    'barishal': 'Barishal',
    'barisal': 'Barishal',
    'rangpur': 'Rangpur',
    'mymensingh': 'Mymensingh',
    'remote': 'Remote',
}

DEPT_KEYWORDS = {
    'CSE': ['computer', 'cse', 'software', 'it ', 'information technology', 'frontend', 'backend', 'full stack', 'web developer', 'mobile developer', 'react', 'node', 'python', 'javascript', 'devops', 'cybersecurity', 'ai', 'ml', 'data science'],
    'EEE': ['eee', 'electrical', 'electronics', 'power', 'telecom', 'communication engineering'],
    'BBA': ['bba', 'business', 'management', 'marketing', 'hr', 'human resource', 'operations', 'supply chain', 'project management', 'product'],
    'Marketing': ['marketing', 'digital marketing', 'seo', 'social media', 'brand', 'content'],
    'Finance': ['finance', 'accounting', 'accountant', 'audit', 'tax', 'investment', 'banking', 'financial'],
    'Accounting': ['accounting', 'accountant', 'audit', 'bookkeeping', 'tax'],
    'English': ['english', 'content writing', 'copywriter', 'technical writer', 'editor', 'proofreader'],
    'Law': ['law', 'legal', 'counsel', 'advocate'],
    'Pharmacy': ['pharmacy', 'pharma', 'medical', 'clinical'],
    'Civil': ['civil', 'construction', 'site engineer', 'structural'],
    'Mechanical': ['mechanical', 'machine', 'manufacturing', 'production'],
    'Textile': ['textile', 'garments', 'rmg', 'apparel', 'fashion'],
    'Architecture': ['architecture', 'architect', 'interior design'],
    'Design': ['design', 'ui/ux', 'ux designer', 'ui designer', 'graphic', 'visual'],
    'Media': ['media', 'video', 'video editor', 'filmmaker', 'journalist', 'reporter'],
}

CATEGORY_KEYWORDS = {
    'Software/IT': ['software', 'developer', 'engineer', 'it ', 'web', 'app', 'tech', 'frontend', 'backend', 'full stack', 'devops', 'data', 'ai', 'ml', 'cybersecurity'],
    'Marketing': ['marketing', 'seo', 'social media', 'brand', 'digital marketing', 'growth'],
    'Design': ['design', 'ui/ux', 'ux', 'ui', 'graphic', 'visual', 'creative'],
    'Finance': ['finance', 'accounting', 'accountant', 'audit', 'investment', 'banking'],
    'HR': ['hr', 'human resource', 'recruitment', 'talent', 'people'],
    'Business': ['business', 'management', 'operations', 'supply chain', 'project', 'product'],
    'Data/AI': ['data', 'ai', 'ml', 'analytics', 'data science', 'machine learning'],
    'Content Writing': ['content', 'writing', 'copywriter', 'editor', 'technical writer'],
    'Engineering': ['engineer', 'civil', 'mechanical', 'electrical', 'eee'],
    'Others': [],
}


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def today_bd():
    bd_tz = timezone(timedelta(hours=6))
    return datetime.now(bd_tz).date()


def check_robots_txt(source_url):
    try:
        parsed = urlparse(source_url)
        robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
        rp = RobotFileParser()
        rp.set_url(robots_url)
        rp.read()
        allowed = rp.can_fetch(USER_AGENT, source_url)
        return allowed, None
    except Exception as e:
        return True, f"Could not read robots.txt: {str(e)}"


def fetch_page(url):
    for attempt in range(MAX_RETRIES):
        try:
            resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT, allow_redirects=True)
            if resp.status_code == 200:
                return resp.text, None
            elif resp.status_code in (403, 404):
                return None, f"HTTP {resp.status_code}"
            else:
                time.sleep(REQUEST_DELAY * (attempt + 1))
        except requests.exceptions.Timeout:
            time.sleep(REQUEST_DELAY * (attempt + 1))
        except requests.exceptions.ConnectionError:
            time.sleep(REQUEST_DELAY * (attempt + 1))
        except Exception as e:
            return None, str(e)
    return None, f"Max retries ({MAX_RETRIES}) exceeded"


def is_internship(text):
    text_lower = text.lower()
    # Use word-boundary-ish matching to avoid "internal" matching "intern"
    for kw in INTERNSHIP_KEYWORDS:
        # Check for keyword as standalone word or preceded by space/hyphen
        if kw in text_lower:
            # For "intern" specifically, require word boundary
            if kw == 'intern':
                import re as _re
                if not _re.search(r'\bintern\b', text_lower):
                    continue
            return True
    return False


def detect_department(text):
    text_lower = text.lower()
    scores = {}
    for dept, keywords in DEPT_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[dept] = score
    return max(scores, key=scores.get) if scores else 'Others'


def detect_category(text):
    text_lower = text.lower()
    scores = {}
    for cat, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[cat] = score
    return max(scores, key=scores.get) if scores else 'Others'


def detect_location(text):
    text_lower = text.lower()
    for key, division in DIVISION_MAP.items():
        if key in text_lower:
            return division
    return 'Dhaka'


def detect_paid(text):
    text_lower = text.lower()
    unpaid = ['unpaid', 'volunteer', 'no stipend', 'no salary']
    paid = ['paid', 'stipend', 'salary', 'allowance', 'tk', '৳', 'per month']
    if any(kw in text_lower for kw in unpaid):
        return 'Unpaid'
    if any(kw in text_lower for kw in paid):
        return 'Paid'
    return 'Paid'


def detect_work_mode(text):
    text_lower = text.lower()
    if 'hybrid' in text_lower:
        return 'Hybrid'
    if 'remote' in text_lower or 'work from home' in text_lower or 'wfh' in text_lower:
        return 'Remote'
    return 'On-site'


def normalize_deadline(text):
    text = text.strip()
    patterns = [
        r'(\d{1,2})[-/](\d{1,2})[-/](\d{4})',
        r'(\d{4})[-/](\d{1,2})[-/](\d{1,2})',
        r'(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})',
    ]
    months = {'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
              'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12}
    for pattern in patterns:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            try:
                groups = m.groups()
                if len(groups) == 3:
                    if groups[1].lower()[:3] in months:
                        day = int(groups[0])
                        month = months[groups[1].lower()[:3]]
                        year = int(groups[2])
                    elif int(groups[0]) > 31:
                        year = int(groups[0])
                        month = int(groups[1])
                        day = int(groups[2])
                    else:
                        day = int(groups[0])
                        month = int(groups[1])
                        year = int(groups[2])
                    return f"{year:04d}-{month:02d}-{day:02d}"
            except (ValueError, IndexError):
                continue
    bd_tz = timezone(timedelta(hours=6))
    default = datetime.now(bd_tz) + timedelta(days=30)
    return default.date().isoformat()


def extract_text(element):
    if element is None:
        return ''
    return element.get_text(separator=' ', strip=True)


def normalize_url(url, base_url):
    if not url:
        return None
    try:
        full = urljoin(base_url, url)
        parsed = urlparse(full)
        return urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, parsed.query, ''))
    except Exception:
        return None


def ensure_company(name, slug_override=None, website=None, career_url=None, logo_url=None, is_trusted=False):
    """Ensure company exists in DB, return company_slug."""
    if not name:
        name = 'Unknown Company'
    slug = slug_override or name.lower().replace(' ', '-')[:50]
    slug = re.sub(r'[^a-z0-9-]', '-', slug)

    try:
        existing = supabase.table('companies').select('slug').eq('slug', slug).execute()
        if existing.data:
            return slug
    except Exception:
        pass

    try:
        supabase.table('companies').insert({
            'name': name,
            'slug': slug,
            'website': website,
            'career_url': career_url,
            'logo_url': logo_url,
            'is_trusted': is_trusted,
            'is_sample': False,
        }).execute()
        return slug
    except Exception as e:
        # Try with hash suffix
        slug = f"{slug}-{hashlib.md5(name.encode()).hexdigest()[:8]}"
        try:
            supabase.table('companies').insert({
                'name': name,
                'slug': slug,
                'website': website,
                'career_url': career_url,
                'logo_url': logo_url,
                'is_trusted': is_trusted,
                'is_sample': False,
            }).execute()
            return slug
        except Exception as e2:
            print(f"    COMPANY INSERT ERROR: {e2}")
            return None


def parse_lever_json(site_name, source_url):
    """Parse Lever public JSON API."""
    api_url = f"https://api.lever.co/v0/postings/{site_name}?mode=json"
    html, error = fetch_page(api_url)
    if error:
        return [], [f"{source_url}: {error}"]

    try:
        data = json.loads(html)
    except json.JSONDecodeError:
        return [], [f"{source_url}: Invalid JSON from Lever API"]

    internships = []
    for job in data:
        title = job.get('text', '') or ''
        categories = job.get('categories') or {}
        location = categories.get('location', '') or ''
        description = job.get('descriptionPlain', '') or ''
        additional = job.get('additionalPlain', '') or ''
        combined_text = f"{title} {description} {additional}".lower()

        if not is_internship(combined_text):
            continue

        # Check Bangladesh location
        is_bd = ('bangladesh' in location.lower() or 'dhaka' in location.lower()
                 or 'chattogram' in location.lower() or 'chittagong' in location.lower()
                 or 'uttara' in location.lower())

        if not is_bd:
            continue

        apply_url = job.get('applyUrl', '') or ''
        hosted_url = job.get('hostedUrl', '') or ''
        apply_link = apply_url or hosted_url

        full_text = f"{title} {description} {additional}"
        internship = {
            'title': title.strip()[:200] or 'Internship Position',
            'company_name': 'Field Nation' if site_name == 'fieldnation' else 'RWS TrainAI',
            'location': detect_location(location) or 'Dhaka',
            'department': detect_department(full_text),
            'category': detect_category(full_text),
            'work_mode': detect_work_mode(full_text),
            'is_paid': detect_paid(full_text),
            'stipend': '',
            'deadline': normalize_deadline(full_text),
            'description': full_text[:2000],
            'requirements': [],
            'responsibilities': [],
            'apply_link': apply_link,
            'apply_email': None,
            'source_name': 'Field Nation' if site_name == 'fieldnation' else 'RWS TrainAI',
            'source_url': apply_link or source_url,
        }
        email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', full_text)
        if email_match:
            internship['apply_email'] = email_match.group(0)

        internships.append(internship)

    return internships, []


def parse_ashby_html(company_name, source_url):
    """Parse Ashby careers page using Playwright for JavaScript rendering."""
    if not PLAYWRIGHT_AVAILABLE:
        return [], [f"{source_url}: Playwright not available for Ashby JS rendering"]

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_extra_http_headers(HEADERS)
            page.goto(source_url, timeout=TIMEOUT * 1000, wait_until="networkidle")
            page.wait_for_timeout(3000)  # Wait for JS to render jobs

            # Get all links (Ashby uses /{company}/{uuid} pattern for jobs)
            job_links = page.query_selector_all('a')
            seen_urls = set()
            internships = []

            for link in job_links:
                try:
                    href = link.get_attribute('href') or ''
                    link_text = (link.inner_text() or '').strip()
                    full_url = normalize_url(href, source_url)

                    if not full_url or full_url in seen_urls:
                        continue
                    seen_urls.add(full_url)

                    if not re.search(r'/[a-z-]+/[a-f0-9-]+', full_url):
                        continue

                    combined_text = f"{link_text} {href}".lower()
                    if not is_internship(combined_text):
                        continue

                    title = link_text[:200] or 'Internship Position'
                    if title.lower() in ('apply', 'view', 'click here', 'read more', 'details', 'more', 'job', 'position'):
                        continue
                    if len(title) < 5:
                        continue

                    # Get parent context for location/department info
                    parent = link.evaluate_handle('element => element.parentElement')
                    full_text = (parent.inner_text() if parent else link_text)[:2000]

                    internship = {
                        'title': title,
                        'company_name': company_name,
                        'location': detect_location(full_text) or 'Dhaka',
                        'department': detect_department(full_text),
                        'category': detect_category(full_text),
                        'work_mode': detect_work_mode(full_text),
                        'is_paid': detect_paid(full_text),
                        'stipend': '',
                        'deadline': normalize_deadline(full_text),
                        'description': full_text[:2000],
                        'requirements': [],
                        'responsibilities': [],
                        'apply_link': full_url,
                        'apply_email': None,
                        'source_name': company_name,
                        'source_url': full_url,
                    }
                    email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', full_text)
                    if email_match:
                        internship['apply_email'] = email_match.group(0)

                    internships.append(internship)
                except Exception:
                    continue

            browser.close()
            return internships, []
    except Exception as e:
        return [], [f"{source_url}: Playwright error: {str(e)}"]


def parse_html_generic(source_name, source_url):
    """Parse generic HTML career page for internship links."""
    html, error = fetch_page(source_url)
    if error:
        return [], [f"{source_url}: {error}"]

    soup = BeautifulSoup(html, 'html.parser')
    internships = []

    for tag in soup(['script', 'style', 'nav', 'footer', 'header']):
        tag.decompose()

    links = soup.find_all('a', href=True)
    seen_urls = set()

    for link in links:
        href = link.get('href', '').strip()
        link_text = extract_text(link)
        full_url = normalize_url(href, source_url)

        if not full_url or full_url in seen_urls:
            continue
        seen_urls.add(full_url)

        combined_text = f"{link_text} {href}".lower()
        if not is_internship(combined_text):
            continue

        skip_patterns = ['facebook', 'twitter', 'linkedin', 'instagram', 'youtube', 'mailto:', 'tel:', '#', 'javascript:']
        if any(p in full_url.lower() for p in skip_patterns):
            continue

        title = link_text.strip()[:200] or 'Internship Position'
        # Skip generic/useless titles
        if title.lower() in ('apply', 'view', 'click here', 'read more', 'details', 'more', 'job', 'position'):
            continue
        if len(title) < 5:
            continue
        parent = link.parent
        context = extract_text(parent) if parent else link_text

        internship = {
            'title': title,
            'company_name': source_name,
            'location': detect_location(context) or 'Dhaka',
            'department': detect_department(context),
            'category': detect_category(context),
            'work_mode': detect_work_mode(context),
            'is_paid': detect_paid(context),
            'stipend': '',
            'deadline': normalize_deadline(context),
            'description': context[:2000],
            'requirements': [],
            'responsibilities': [],
            'apply_link': full_url,
            'apply_email': None,
            'source_name': source_name,
            'source_url': full_url,
        }
        email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', context)
        if email_match:
            internship['apply_email'] = email_match.group(0)

        internships.append(internship)

    return internships, []


def deduplicate(internships, existing_urls):
    seen = set(existing_urls)
    result = []
    for inv in internships:
        url = inv.get('source_url')
        if url and url in seen:
            continue
        key = (inv.get('company_name', '').lower().strip(),
               re.sub(r'\W+', '', inv.get('title', '').lower().strip())[:50])
        if key in seen:
            continue
        seen.add(key)
        if url:
            seen.add(url)
        result.append(inv)
    return result


def quality_gate(internships, is_trusted):
    approved = []
    pending = []
    for inv in internships:
        has_title = bool(inv.get('title'))
        has_company = bool(inv.get('company_name'))
        has_apply = bool(inv.get('apply_link') or inv.get('apply_email'))

        if is_trusted and has_title and has_company and has_apply:
            inv['status'] = 'approved'
            inv['is_verified'] = True
            approved.append(inv)
        else:
            inv['status'] = 'pending'
            inv['is_verified'] = False
            pending.append(inv)
    return approved, pending


def seed_scrape_sources():
    for source in SOURCES:
        try:
            existing = supabase.table('scrape_sources').select('id').eq('name', source['name']).execute()
            if existing.data:
                continue
            supabase.table('scrape_sources').insert({
                'name': source['name'],
                'url': source['url'],
                'type': source.get('type', 'html'),
                'is_active': True,
                'is_trusted': source.get('is_trusted', False),
            }).execute()
        except Exception as e:
            print(f"  WARNING: Could not insert scrape source '{source['name']}': {e}")


def record_scrape_run(source_name, started_at, finished_at, found, inserted, skipped, errors, status):
    try:
        supabase.table('scrape_runs').insert({
            'source_name': source_name,
            'started_at': started_at.isoformat(),
            'finished_at': finished_at.isoformat() if finished_at else None,
            'found': found,
            'inserted': inserted,
            'skipped_duplicates': skipped,
            'errors': errors,
            'status': status,
        }).execute()
    except Exception as e:
        print(f"  WARNING: Could not record scrape run for '{source_name}': {e}")


def auto_expire():
    today = today_bd().isoformat()
    try:
        result = supabase.table('internships').update({
            'status': 'expired',
        }).eq('status', 'approved').lt('deadline', today).execute()
        count = len(result.data) if result.data else 0
        if count > 0:
            print(f"  Auto-expired {count} internships with past deadlines")
    except Exception as e:
        print(f"  WARNING: Auto-expire failed: {e}")


def insert_internship(inv):
    """Insert a single internship into Supabase. Returns True on success."""
    try:
        company_slug = ensure_company(inv['company_name'])
        if not company_slug:
            return False

        supabase.table('internships').insert({
            'title': inv['title'],
            'company_name': inv['company_name'],
            'company_slug': company_slug,
            'company_logo_url': None,
            'company_email': inv.get('apply_email'),
            'category': inv['category'],
            'department': inv['department'],
            'location': inv['location'],
            'division': inv['location'],
            'work_mode': inv['work_mode'],
            'is_paid': inv['is_paid'],
            'stipend': inv.get('stipend'),
            'duration': '3 months',
            'deadline': inv['deadline'],
            'description': inv.get('description', ''),
            'requirements': inv.get('requirements', []),
            'responsibilities': inv.get('responsibilities', []),
            'apply_link': inv.get('apply_link'),
            'apply_email': inv.get('apply_email'),
            'source': 'scraped',
            'source_name': inv.get('source_name'),
            'source_url': inv.get('source_url'),
            'status': inv['status'],
            'is_verified': inv['is_verified'],
            'is_featured': False,
            'is_sample': False,
            'scraped_at': now_iso(),
        }).execute()
        return True
    except Exception as e:
        print(f"    INSERT ERROR: {e}")
        return False


def main():
    print(f"InternBD Scraper - {now_iso()}")
    print(f"Sources to scrape: {len(SOURCES)}")
    print()

    seed_scrape_sources()
    auto_expire()

    existing_urls = set()
    try:
        result = supabase.table('internships').select('source_url').execute()
        if result.data:
            existing_urls = {r['source_url'] for r in result.data if r.get('source_url')}
    except Exception as e:
        print(f"  WARNING: Could not fetch existing URLs: {e}")

    results_table = []
    total_found = 0
    total_inserted = 0
    total_skipped = 0
    total_errors = 0

    for source in SOURCES:
        started = datetime.now(timezone.utc)
        source_type = source.get('type', 'html')
        source_name = source['name']
        source_url = source['url']
        is_trusted = source.get('is_trusted', False)

        print(f"  Scraping: {source_name} ({source_type})")

        internships = []
        errors = []

        try:
            if source_type == 'ats_json':
                site_name = source.get('lever_site', source_name.lower().split(' ')[0])
                internships, errors = parse_lever_json(site_name, source_url)
            elif source_type == 'ashby_html':
                internships, errors = parse_ashby_html(source_name, source_url)
            elif source_type == 'html':
                internships, errors = parse_html_generic(source_name, source_url)
            else:
                errors.append(f"Unknown source type: {source_type}")
        except Exception as e:
            errors.append(f"Unexpected error: {str(e)}")
            print(f"    ERROR: {e}")

        finished = datetime.now(timezone.utc)
        found = len(internships)
        total_found += found
        total_errors += len(errors)

        deduped = deduplicate(internships, existing_urls)
        skipped = found - len(deduped)
        total_skipped += skipped

        approved, pending = quality_gate(deduped, is_trusted)

        inserted = 0
        for inv in approved:
            if insert_internship(inv):
                inserted += 1
                total_inserted += 1
                if inv['source_url']:
                    existing_urls.add(inv['source_url'])

        for inv in pending:
            if insert_internship(inv):
                total_inserted += 1
                if inv['source_url']:
                    existing_urls.add(inv['source_url'])

        status = 'completed' if not errors else 'completed_with_errors'
        record_scrape_run(source_name, started, finished, found, inserted, skipped, len(errors), status)

        results_table.append({
            'source': source_name,
            'type': source_type,
            'status': status,
            'found': found,
            'inserted': inserted,
            'skipped': skipped,
            'errors': len(errors),
        })

        print(f"    Found: {found}, Inserted: {inserted}, Skipped: {skipped}, Errors: {len(errors)}")
        time.sleep(REQUEST_DELAY)

    print()
    print("=" * 70)
    print(f"{'Source':<40} {'Type':<12} {'Status':<25} {'Found':<6} {'Inserted':<9} {'Skipped':<8} {'Errors':<7}")
    print("-" * 70)
    for r in results_table:
        print(f"{r['source']:<40} {r['type']:<12} {r['status']:<25} {r['found']:<6} {r['inserted']:<9} {r['skipped']:<8} {r['errors']:<7}")
    print("=" * 70)
    print(f"Total found: {total_found}")
    print(f"Total inserted: {total_inserted}")
    print(f"Total skipped (duplicates): {total_skipped}")
    print(f"Total errors: {total_errors}")

    try:
        result = supabase.table('internships').select('*', count='exact').eq('status', 'approved').execute()
        print(f"Approved internships in DB: {result.count}")
    except Exception as e:
        print(f"Could not verify final count: {e}")


if __name__ == '__main__':
    main()
