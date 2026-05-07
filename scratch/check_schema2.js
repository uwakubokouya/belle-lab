const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const envRaw = fs.readFileSync('.env.local', 'utf8');
const env = {};
envRaw.split('\n').forEach(line => {
    if(line.includes('=')) {
        const [a, ...b] = line.split('=');
        env[a.trim()] = b.join('=').trim().replace(/["']/g, '');
    }
});
const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY']);

async function run() {
  const { data: resData, error: resErr } = await supabase.from('sns_reservations').select('*').limit(1);
  console.log('sns_reservations:', resData ? Object.keys(resData[0] || {}) : resErr);

  const { data: salesData, error: salesErr } = await supabase.from('sales').select('*').limit(1);
  console.log('sales:', salesData ? Object.keys(salesData[0] || {}) : salesErr);
}
run();
