import requests, re
from bs4 import BeautifulSoup

urls = [
    'https://apply.workable.com/cimmyt-1',
    'https://apply.workable.com/d-ploy',
    'https://apply.workable.com/wateraid',
    'https://www.plivix-tech.com/internships',
]

for url in urls:
    try:
        r = requests.get(url, headers={'User-Agent': 'InternBD-Scraper/1.0'}, timeout=15)
        print(f'{url} -> {r.status_code} ({len(r.text)} bytes)')
        soup = BeautifulSoup(r.text, 'html.parser')
        title = soup.title.string.strip() if soup.title else 'NO TITLE'
        print(f'  Title: {title[:100]}')
        
        # Look for internship keywords in links
        intern_links = 0
        for link in soup.find_all('a', href=True):
            link_text = link.get_text(strip=True)
            combined = f"{link_text} {link['href']}".lower()
            if any(kw in combined for kw in ['intern', 'internship', 'trainee', 'apprentice']):
                intern_links += 1
                if intern_links <= 3:
                    print(f'  Intern link: {link_text[:60]} | {link["href"][:80]}')
        print(f'  Total intern links: {intern_links}')
    except Exception as e:
        print(f'{url} -> ERROR: {e}')
    print()
