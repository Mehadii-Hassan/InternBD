import requests

# Test Workable API format
urls = [
    'https://apply.workable.com/api/v1/accounts/cimmyt-1/jobs',
    'https://apply.workable.com/api/v1/accounts/d-ploy/jobs',
    'https://apply.workable.com/api/v1/accounts/wateraid/jobs',
]

for url in urls:
    try:
        r = requests.get(url, headers={'User-Agent': 'InternBD-Scraper/1.0'}, timeout=15)
        print(f'{url} -> {r.status_code} ({len(r.text)} bytes)')
        if r.status_code == 200:
            data = r.json()
            if isinstance(data, dict) and 'jobs' in data:
                jobs = data['jobs']
                print(f'  Jobs count: {len(jobs)}')
                for j in jobs[:3]:
                    print(f'  - {j.get("title", "N/A")} | {j.get("location", "N/A")} | {j.get("short_description", "")[:60]}')
            elif isinstance(data, list):
                print(f'  List with {len(data)} items')
        print(f'  Preview: {r.text[:150]}')
    except Exception as e:
        print(f'{url} -> ERROR: {e}')
    print()
