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
const s = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['NEXT_PUBLIC_SUPABASE_ANON_KEY']);
async function run() {
  const { data: n, error } = await s.from('sns_notifications').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("Error:", error);
  console.log("Recent Notifications:", n);
  
  const { data: r, err2 } = await s.from('sns_reviews').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("Recent Reviews:", r);
}
run();
