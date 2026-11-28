import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
const env = {};
for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^"|"$/g, '');
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
// Add how_to_apply column to internships table
sb.rpc('exec_sql', { sql: 'ALTER TABLE public.internships ADD COLUMN IF NOT EXISTS how_to_apply TEXT' })
  .then(r => console.log('Add how_to_apply column:', r.error || 'SUCCESS'))
  .catch(e => console.log('Error:', e.message));