import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
const env = {};
for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^"|"$/g, '');
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
sb.from('information_schema.columns').select('column_name').eq('table_name', 'internships').order('ordinal_position').then(r => {
  console.log('internships columns:', r.data?.map(c => c.column_name).join(', ') || 'none');
}).catch(e => console.log('Error:', e.message));
sb.from('information_schema.columns').select('column_name').eq('table_name', 'companies').order('ordinal_position').then(r => {
  console.log('companies columns:', r.data?.map(c => c.column_name).join(', ') || 'none');
}).catch(e => console.log('Error:', e.message));