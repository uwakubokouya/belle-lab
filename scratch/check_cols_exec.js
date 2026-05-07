const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const envRaw = fs.readFileSync('.env.local', 'utf8');
const lines = envRaw.split('\n');
const env = {};
for(const line of lines) {
    if(line.includes('=')) {
        const [a, ...b] = line.split('=');
        env[a.trim()] = b.join('=').trim().replace(/["']/g, '');
    }
}
const s = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY']);

async function run() {
  const { data, error } = await s.rpc('exec_sql', { sql_query: "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name IN ('sales', 'sns_reservations') ORDER BY table_name, ordinal_position;" });
  console.log("Exec SQL Result:", data ? JSON.stringify(data, null, 2) : error);
}
run();
