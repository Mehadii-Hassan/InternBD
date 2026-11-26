import requests, json

r = requests.get('https://api.lever.co/v0/postings/fieldnation?mode=json', timeout=15)
data = r.json()

internships = []
for job in data:
    text = (job.get('text', '') + ' ' + job.get('additionalPlain', '') + ' ' + job.get('descriptionPlain', '')).lower()
    title = job.get('text', '')
    categories = job.get('categories', {}) or {}
    location = categories.get('location', '') if categories else ''
    commitment = categories.get('commitment', '') if categories else ''
    workplace = job.get('workplaceType', '')
    
    is_intern = any(kw in text for kw in ['intern', 'internship', 'trainee', 'apprentice'])
    is_bd = 'bangladesh' in location.lower() or 'dhaka' in location.lower() or 'uttara' in location.lower()
    
    if is_intern and is_bd:
        internships.append({
            'title': title,
            'location': location,
            'commitment': commitment,
            'workplace': workplace,
            'url': job.get('hostedUrl', ''),
            'applyUrl': job.get('applyUrl', ''),
        })

print(f"Field Nation internships in Bangladesh: {len(internships)}")
for inv in internships:
    print(f"  - {inv['title']} | {inv['location']} | {inv['commitment']} | {inv['url']}")

# Also check RWS for Bangladesh internships
r2 = requests.get('https://api.lever.co/v0/postings/rws?mode=json', timeout=15)
data2 = r2.json()
rws_internships = []
for job in data2:
    text = (job.get('text', '') + ' ' + job.get('additionalPlain', '') + ' ' + job.get('descriptionPlain', '')).lower()
    title = job.get('text', '')
    categories = job.get('categories', {}) or {}
    location = categories.get('location', '') if categories else ''
    country = job.get('country', '')
    
    is_intern = any(kw in text for kw in ['intern', 'internship', 'trainee', 'apprentice'])
    is_bd = 'bangladesh' in location.lower() or 'dhaka' in location.lower() or country == 'Bangladesh'
    
    if is_intern and is_bd:
        rws_internships.append({
            'title': title,
            'location': location,
            'country': country,
            'url': job.get('hostedUrl', ''),
        })

print(f"\nRWS internships in Bangladesh: {len(rws_internships)}")
for inv in rws_internships:
    print(f"  - {inv['title']} | {inv['location']} | {inv['country']}")
