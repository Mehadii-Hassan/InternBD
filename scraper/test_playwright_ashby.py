from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.set_extra_http_headers({
        'User-Agent': 'InternBD-Scraper/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
    })
    page.goto('https://jobs.ashbyhq.com/commure', timeout=30000, wait_until="networkidle")
    page.wait_for_timeout(5000)
    
    # Get page title
    title = page.title()
    print(f"Page title: {title}")
    
    # Get all links with /jobs/ in href
    job_links = page.query_selector_all('a[href*="/jobs/"]')
    print(f"Job links found: {len(job_links)}")
    
    for link in job_links[:10]:
        href = link.get_attribute('href') or ''
        text = (link.inner_text() or '').strip()
        print(f"  '{text[:60]}' -> {href[:80]}")
    
    # Check for internship keyword in page text
    page_text = page.inner_text('body')
    intern_count = page_text.lower().count('intern')
    print(f"\nIntern mentions in page text: {intern_count}")
    
    browser.close()
