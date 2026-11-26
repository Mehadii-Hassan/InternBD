# InternBD Scraper

Automatic daily internship scraper for Bangladeshi sources. Collects internships from company career pages, ATS platforms, and job boards, and writes them to Supabase.

## Source Types

| Type | Description | Example |
|------|-------------|---------|
| `ats_json` | Lever public JSON API | `api.lever.co/v0/postings/{site}?mode=json` |
| `ashby_html` | Ashby careers page (JS-rendered, uses Playwright) | `jobs.ashbyhq.com/{company}` |
| `html` | Generic HTML career page scraping | Any company career page |

## Adding a New Source

Edit `scraper/sources.json` and add a source entry:

```json
{
  "name": "Company Name",
  "url": "https://company.com/careers",
  "type": "html",
  "is_trusted": true,
  "lever_site": "company-slug",
  "verified_on": "2026-11-26"
}
```

- `name`: Display name for the source
- `url`: URL to scrape
- `type`: One of `ats_json`, `ashby_html`, `html`
- `is_trusted`: If true, auto-approves internships; if false, they go to pending for admin review
- `lever_site`: Required for `ats_json` type - the Lever site identifier
- `verified_on`: Date you verified the source returns real data

## Running the Scraper

### Locally
```bash
cd scraper
pip install -r requirements.txt
playwright install chromium  # Required for ashby_html sources
python scraper.py
```

### GitHub Actions
Runs daily at 06:00 Bangladesh time (00:00 UTC) via `.github/workflows/scrape.yml`. Also triggerable manually from the Actions tab.

## Verified Sources (as of 2026-11-26)

| Source | Type | Trusted | Status |
|--------|------|---------|--------|
| Commure Bangladesh | ashby_html | Yes | Working - returns internships |
| Bangladesh Software Solution | html | Yes | Working - returns internships |
| Field Nation (Lever) | ats_json | Yes | Working API, no internships in BD |
| RWS TrainAI (Lever) | ats_json | Yes | Working API, no internships in BD |
| BDJobs Live Internships | html | No | Working - posts go to pending |
| Novara Engineering | html | No | No internships found |
| CIMMYT (Workable) | html | No | JS-rendered, returns 0 |
| D-ploy (Workable) | html | No | JS-rendered, returns 0 |
| WaterAid Bangladesh | html | No | JS-rendered, returns 0 |
| Plivix Technologies | html | No | No internship links found |

## Removed Sources

None yet.

## Requirements

- Python 3.11+
- `requests`, `beautifulsoup4`, `supabase`
- `playwright` with Chromium (for `ashby_html` sources)
- Supabase project with schema applied

## Environment Variables

See `.env.example` for required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
