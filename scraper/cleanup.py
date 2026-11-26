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

SUPABASE_URL = env.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = env.get('SUPABASE_SERVICE_ROLE_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Delete all non-sample internships (keep the 30 sample ones)
result = supabase.table('internships').delete().eq('is_sample', False).execute()
print(f"Deleted {len(result.data) if result.data else 0} non-sample internships")

# Also delete companies that are not sample
result2 = supabase.table('companies').delete().eq('is_sample', False).execute()
print(f"Deleted {len(result2.data) if result2.data else 0} non-sample companies")

# Verify remaining count
result3 = supabase.table('internships').select('*', count='exact').eq('status', 'approved').eq('is_sample', True).execute()
print(f"Remaining sample approved internships: {result3.count}")
