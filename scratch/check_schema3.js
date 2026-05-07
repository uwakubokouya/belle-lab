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
  const { data: cols, error } = await supabase.rpc('get_schema_info', {});
  if (error) {
      console.log("RPC get_schema_info failed", error);
      // fallback: raw query not possible from JS client unless we use postgres connection
      // Wait, let's just insert a dummy row or fetch with count. No, that won't give columns if empty.
  } else {
      console.log(cols);
  }
}
run();
