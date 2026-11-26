import requests

urls = [
    'https://api.ashbyhq.com/1/companies/commure/jobs',
    'https://jobs.ashbyhq.com/commure',
    'https://api.lever.co/v0/postings/fieldnation?mode=json',
    'https://api.lever.co/v0/postings/rws?mode=json',
]

for url in urls:
    try:
        r = requests.get(url, headers={'User-Agent': 'InternBD-Scraper/1.0'}, timeout=15)
        print(f'{url} -> {r.status_code} ({len(r.text)} bytes)')
        if r.status_code == 200:
            try:
                data = r.json()
                if isinstance(data, list):
                    print(f'  List with {len(data)} items')
                    if data and isinstance(data[0], dict):
                        print(f'  First item keys: {list(data[0].keys())[:10]}')
                elif isinstance(data, dict):
                    print(f'  Dict keys: {list(data.keys())[:10]}')
                    if 'jobs' in data:
                        print(f'  Jobs count: {len(data["jobs"])}')
                print(f'  Preview: {r.text[:150]}')
            except Exception as e:
                print(f'  Not JSON: {r.text[:150]}')
    except Exception as e:
        print(f'{url} -> ERROR: {e}')
    print()
