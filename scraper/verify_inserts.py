import os
from supabase import create_client
# Load env from .env.local
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env.local')
env = {}
with open(env_path, 'r') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            key, value = line.split('=', 1)
            env[key.strip()] = value.strip()

SUPABASE_URL = env.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = env.get('SUPABASE_SERVICE_ROLE_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Get all non-sample approved internships
result = supabase.table('internships').select('*').eq('status', 'approved').eq('is_sample', False).execute()

print(f"Non-sample approved internships: {len(result.data)}")
print()
for inv in result.data:
    print(f"Title: {inv['title']}")
    print(f"  Company: {inv['company_name']}")
    print(f"  Location: {inv['location']} | Dept: {inv['department']} | Cat: {inv['category']}")
    print(f"  Mode: {inv['work_mode']} | Paid: {inv['is_paid']} | Stipend: {inv['stipend']}")
    print(f"  Deadline: {inv['deadline']} | Source: {inv['source_name']}")
    print(f"  Apply: {inv['apply_link']}")
    print(f"  Source URL: {inv['source_url']}")
    print()
