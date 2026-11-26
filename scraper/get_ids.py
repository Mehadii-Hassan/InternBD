import os
from supabase import create_client
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env.local')
env = {}
with open(env_path, 'r') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            key, value = line.split('=', 1)
            env[key.strip()] = value.strip()

supabase = create_client(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'])

result = supabase.table('internships').select('id,title,company_name').eq('status','approved').eq('is_sample',False).limit(3).execute()
for d in result.data:
    print(f"{d['id']} | {d['title']} | {d['company_name']}")
