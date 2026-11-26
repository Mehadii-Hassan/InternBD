from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    page.set_extra_http_headers({
        'User-Agent': 'InternBD-Scraper/1.0',
    })
    page.goto('https://jobs.ashbyhq.com/commure', timeout=30000, wait_until="networkidle")
    page.wait_for_timeout(5000)
    
    # Get ALL links
    all_links = page.query_selector_all('a')
    print(f"Total links: {len(all_links)}")
    
    for link in all_links[:30]:
        href = link.get_attribute('href') or ''
        text = (link.inner_text() or '').strip()[:50]
        if href:
            print(f"  '{text}' -> {href[:100]}")
    
    # Check page text for internship mentions
    page_text = page.inner_text('body')
    lines = [l.strip() for l in page_text.split('\n') if l.strip()]
    for line in lines:
        if 'intern' in line.lower():
            print(f"\nINTERN LINE: {line[:200]}")
    
    browser.close()
