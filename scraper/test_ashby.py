import requests, re
from bs4 import BeautifulSoup

url = 'https://jobs.ashbyhq.com/commure'
r = requests.get(url, headers={'User-Agent': 'InternBD-Scraper/1.0'}, timeout=15)
print(f'Status: {r.status_code}, Length: {len(r.text)}')

# Look for embedded JSON data
patterns = [
    r'window\.__INITIAL_STATE__\s*=\s*(\{.*?\});',
    r'__NEXT_DATA__\s*=\s*(\{.*?\})',
]

for pattern in patterns:
    matches = re.findall(pattern, r.text, re.DOTALL)
    if matches:
        print(f'Pattern found {len(matches)} matches')
        print(f'  Preview: {matches[0][:200]}')

# Check for job links in the raw HTML
job_links = re.findall(r'href="([^"]*/jobs/[a-f0-9-]+[^"]*)"', r.text)
print(f'\nJob links found: {len(job_links)}')
for link in job_links[:5]:
    print(f'  {link}')

# Check for internship keywords in the raw text
text = BeautifulSoup(r.text, 'html.parser').get_text()
intern_count = text.lower().count('intern')
print(f'\nIntern mentions in page text: {intern_count}')
