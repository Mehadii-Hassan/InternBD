#!/usr/bin/env python3
"""
InternBD Automatic Daily Scraper
Scrapes internship listings from Bangladeshi sources and writes to Supabase.
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

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase import create_client

# Load environment variables from .env.local
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

# Division mapping for Bangladesh locations
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

# Keyword rules for department detection
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

# Keyword rules for category detection
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
    """Today's date in Bangladesh timezone (UTC+6)."""
    bd_tz = timezone(timedelta(hours=6))
    return datetime.now(bd_tz).date()


def get_domain(url):
    return urlparse(url).netloc.lower()


def check_robots_txt(source_url):
    """Check if scraping is allowed by robots.txt. Returns (allowed, reason)."""
    try:
        parsed = urlparse(source_url)
        robots_url = urlunparse((parsed.scheme, parsed.netloc, '/robots.txt', '', '', ''))
        rp = RobotFileParser()
        rp.set_url(robots_url)
        rp.read()
        allowed = rp.can_fetch(USER_AGENT, source_url)
        return allowed, None
    except Exception as e:
        # If we can't read robots.txt, be conservative but allow
        return True, f"Could not read robots.txt: {str(e)}"


def fetch_page(url):
    """Fetch a page with retries and polite delays."""
    for attempt in range(MAX_RETRIES):
        try:
            resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT, allow_redirects=True)
            if resp.status_code == 200:
                return resp.text, None
            elif resp.status_code == 403:
                return None, f"HTTP 403 Forbidden"
            elif resp.status_code == 404:
                return None, f"HTTP 404 Not Found"
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
    """Check if text contains internship-related keywords."""
    text_lower = text.lower()
    return any(kw in text_lower for kw in INTERNSHIP_KEYWORDS)


def detect_department(text):
    """Auto-detect department using keyword rules."""
    text_lower = text.lower()
    scores = {}
    for dept, keywords in DEPT_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[dept] = score
    if scores:
        return max(scores, key=scores.get)
    return 'Others'


def detect_category(text):
    """Auto-detect category using keyword rules."""
    text_lower = text.lower()
    scores = {}
    for cat, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[cat] = score
    if scores:
        return max(scores, key=scores.get)
    return 'Others'


def detect_location(text):
    """Normalize location to a Bangladesh division or Remote."""
    text_lower = text.lower()
    for key, division in DIVISION_MAP.items():
        if key in text_lower:
            return division
    return None


def detect_paid(text):
    """Detect if internship is paid or unpaid."""
    text_lower = text.lower()
    paid_indicators = ['paid', 'stipend', 'salary', 'allowance', 'tk', '৳', 'bd per month', 'per month']
    unpaid_indicators = ['unpaid', 'volunteer', 'no stipend', 'no salary']
    if any(kw in text_lower for kw in unpaid_indicators):
        return 'Unpaid'
    if any(kw in text_lower for kw in paid_indicators):
        return 'Paid'
    return 'Paid'  # Default to paid if unclear


def detect_work_mode(text):
    """Detect work mode: On-site, Remote, or Hybrid."""
    text_lower = text.lower()
    if 'hybrid' in text_lower:
        return 'Hybrid'
    if 'remote' in text_lower or 'work from home' in text_lower or 'wfh' in text_lower:
        return 'Remote'
    return 'On-site'


def normalize_deadline(text):
    """Parse deadline text into YYYY-MM-DD format."""
    text = text.strip()
    # Try common date formats
    date_patterns = [
        r'(\d{1,2})[-/](\d{1,2})[-/](\d{4})',  # DD-MM-YYYY or MM-DD-YYYY
        r'(\d{4})[-/](\d{1,2})[-/](\d{1,2})',  # YYYY-MM-DD
        r'(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})',
    ]
    months = {'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
              'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12}

    for pattern in date_patterns:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            try:
                groups = m.groups()
                if len(groups) == 3:
                    if groups[1] in months or groups[1].lower() in months:
                        # DD Mon YYYY format
                        day = int(groups[0])
                        month = months[groups[1].lower()[:3]]
                        year = int(groups[2])
                    elif int(groups[0]) > 31:
                        # YYYY-MM-DD
                        year = int(groups[0])
                        month = int(groups[1])
                        day = int(groups[2])
                    else:
                        # DD-MM-YYYY (assume day first for BD context)
                        day = int(groups[0])
                        month = int(groups[1])
                        year = int(groups[2])
                    return f"{year:04d}-{month:02d}-{day:02d}"
            except (ValueError, IndexError):
                continue
    return None


def extract_text(element):
    """Extract clean text from a BeautifulSoup element."""
    if element is None:
        return ''
    return element.get_text(separator=' ', strip=True)


def normalize_url(url, base_url):
    """Normalize a URL relative to base."""
    if not url:
        return None
    try:
        full = urljoin(base_url, url)
        parsed = urlparse(full)
        # Remove fragments
        return urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, parsed.query, ''))
    except Exception:
        return None


def hash_ip(ip):
    """Hash an IP address for privacy."""
    return hashlib.sha256(ip.encode()).hexdigest()[:16]


def scrape_source(source):
    """Scrape a single source for internships. Returns (internships, errors)."""
    name = source['name']
    url = source['url']
    is_trusted = source.get('is_trusted', False)

    print(f"  Scraping: {name} ({url})")

    # Check robots.txt
    allowed, reason = check_robots_txt(url)
    if not allowed:
        print(f"    SKIPPED: robots.txt disallows scraping ({reason})")
        return [], [f"{name}: robots.txt disallows"]

    # Fetch page
    html, error = fetch_page(url)
    if error:
        print(f"    ERROR: {error}")
        return [], [f"{name}: {error}"]

    soup = BeautifulSoup(html, 'html.parser')

    internships = []
    errors = []

    # Generic link extraction - look for links that might be internship postings
    links = soup.find_all('a', href=True)
    seen_urls = set()

    for link in links:
        href = link.get('href', '').strip()
        link_text = extract_text(link)
        full_url = normalize_url(href, url)

        if not full_url or full_url in seen_urls:
            continue
        seen_urls.add(full_url)

        combined_text = (link_text + ' ' + href).lower()

        # Check if this looks like an internship posting
        if not is_internship(combined_text):
            continue

        # Skip external links that aren't job-related
        skip_patterns = ['facebook', 'twitter', 'linkedin', 'instagram', 'youtube', 'mailto:', 'tel:', '#', 'javascript:']
        if any(p in full_url.lower() for p in skip_patterns):
            continue

        # Extract details from surrounding context
        parent = link.parent
        context = extract_text(parent) if parent else link_text

        title = link_text.strip() if link_text.strip() else 'Internship Position'
        if len(title) > 200:
            title = title[:200]

        company = name  # Default to source name
        location = detect_location(context) or 'Dhaka'
        department = detect_department(context)
        category = detect_category(context)
        work_mode = detect_work_mode(context)
        is_paid = detect_paid(context)
        stipend = ''  # Can't easily extract from generic scraping
        deadline = normalize_deadline(context)
        description = context[:2000] if context else ''
        requirements = []
        responsibilities = []
        apply_link = full_url
        apply_email = None

        # Extract email from context
        email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', context)
        if email_match:
            apply_email = email_match.group(0)

        internship = {
            'title': title,
            'company_name': company,
            'location': location,
            'department': department,
            'category': category,
            'work_mode': work_mode,
            'is_paid': is_paid,
            'stipend': stipend,
            'deadline': deadline,
            'description': description,
            'requirements': requirements,
            'responsibilities': responsibilities,
            'apply_link': apply_link,
            'apply_email': apply_email,
            'source_name': name,
            'source_url': full_url,
        }
        internships.append(internship)

    # Polite delay between sources
    time.sleep(REQUEST_DELAY)

    return internships, errors


def deduplicate(internships, existing_urls):
    """Remove duplicates: same source_url, or same company + similar title."""
    seen = set(existing_urls)
    result = []
    for inv in internships:
        url = inv.get('source_url')
        if url and url in seen:
            continue
        # Near-duplicate check: same company + similar title
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
    """Split into auto-approved and pending based on trust."""
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
    """Ensure all sources from sources.json exist in scrape_sources table."""
    for source in SOURCES:
        try:
            # Check if source already exists
            existing = supabase.table('scrape_sources').select('id').eq('name', source['name']).execute()
            if existing.data:
                continue
            supabase.table('scrape_sources').insert({
                'name': source['name'],
                'url': source['url'],
                'type': source.get('type', 'website'),
                'is_active': True,
                'is_trusted': source.get('is_trusted', False),
            }).execute()
        except Exception as e:
            print(f"  WARNING: Could not insert scrape source '{source['name']}': {e}")


def record_scrape_run(source_name, started_at, finished_at, found, inserted, skipped, errors, status):
    """Record a scrape run in the database."""
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
    """Mark internships with past deadlines as expired."""
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


def main():
    print(f"InternBD Scraper - {now_iso()}")
    print(f"Sources to scrape: {len(SOURCES)}")
    print()

    seed_scrape_sources()
    auto_expire()

    # Get existing source URLs for dedup
    existing_urls = set()
    try:
        result = supabase.table('internships').select('source_url').execute()
        if result.data:
            existing_urls = {r['source_url'] for r in result.data if r.get('source_url')}
    except Exception as e:
        print(f"  WARNING: Could not fetch existing URLs: {e}")

    all_approved = []
    all_pending = []
    total_found = 0
    total_inserted = 0
    total_skipped = 0
    total_errors = 0

    for source in SOURCES:
        started = datetime.now(timezone.utc)
        internships, errors = scrape_source(source)
        finished = datetime.now(timezone.utc)

        found = len(internships)
        total_found += found
        total_errors += len(errors)

        # Deduplicate against existing and within batch
        deduped = deduplicate(internships, existing_urls)
        skipped = found - len(deduped)
        total_skipped += skipped

        # Quality gate
        is_trusted = source.get('is_trusted', False)
        approved, pending = quality_gate(deduped, is_trusted)

        # Insert approved internships
        inserted = 0
        for inv in approved:
            try:
                supabase.table('internships').insert({
                    'title': inv['title'],
                    'company_name': inv['company_name'],
                    'company_slug': inv['company_name'].lower().replace(' ', '-')[:50],
                    'location': inv['location'],
                    'department': inv['department'],
                    'category': inv['category'],
                    'work_mode': inv['work_mode'],
                    'is_paid': inv['is_paid'],
                    'stipend': inv['stipend'],
                    'duration': '3 months',
                    'deadline': inv['deadline'] or '2026-12-31',
                    'description': inv['description'],
                    'requirements': inv['requirements'],
                    'responsibilities': inv['responsibilities'],
                    'apply_link': inv['apply_link'],
                    'apply_email': inv['apply_email'],
                    'source': 'scraped',
                    'source_name': inv['source_name'],
                    'source_url': inv['source_url'],
                    'status': inv['status'],
                    'is_verified': inv['is_verified'],
                    'is_featured': False,
                    'is_sample': False,
                    'scraped_at': now_iso(),
                }).execute()
                inserted += 1
                total_inserted += 1
                # Track URL for dedup within this run
                if inv['source_url']:
                    existing_urls.add(inv['source_url'])
            except Exception as e:
                total_errors += 1
                print(f"    INSERT ERROR: {e}")

        # Insert pending internships (for HR review)
        for inv in pending:
            try:
                supabase.table('internships').insert({
                    'title': inv['title'],
                    'company_name': inv['company_name'],
                    'company_slug': inv['company_name'].lower().replace(' ', '-')[:50],
                    'location': inv['location'],
                    'department': inv['department'],
                    'category': inv['category'],
                    'work_mode': inv['work_mode'],
                    'is_paid': inv['is_paid'],
                    'stipend': inv['stipend'],
                    'duration': '3 months',
                    'deadline': inv['deadline'] or '2026-12-31',
                    'description': inv['description'],
                    'requirements': inv['requirements'],
                    'responsibilities': inv['responsibilities'],
                    'apply_link': inv['apply_link'],
                    'apply_email': inv['apply_email'],
                    'source': 'scraped',
                    'source_name': inv['source_name'],
                    'source_url': inv['source_url'],
                    'status': 'pending',
                    'is_verified': False,
                    'is_featured': False,
                    'is_sample': False,
                    'scraped_at': now_iso(),
                }).execute()
                total_inserted += 1
                if inv['source_url']:
                    existing_urls.add(inv['source_url'])
            except Exception as e:
                total_errors += 1
                print(f"    INSERT ERROR (pending): {e}")

        status = 'completed' if not errors else 'completed_with_errors'
        record_scrape_run(source['name'], started, finished, found, inserted, skipped, len(errors), status)

        print(f"    Found: {found}, Inserted: {inserted}, Skipped: {skipped}, Errors: {len(errors)}")

    print()
    print(f"=== Summary ===")
    print(f"Total found: {total_found}")
    print(f"Total inserted: {total_inserted}")
    print(f"Total skipped (duplicates): {total_skipped}")
    print(f"Total errors: {total_errors}")

    # Verify final count
    try:
        result = supabase.table('internships').select('*', count='exact').eq('status', 'approved').execute()
        print(f"Approved internships in DB: {result.count}")
    except Exception as e:
        print(f"Could not verify final count: {e}")


if __name__ == '__main__':
    main()
