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
  const { data: revs } = await s.from('sns_reviews').select('*').order('created_at', { ascending: false }).limit(1);
  if (!revs || revs.length === 0) return console.log("No reviews");
  const rev = revs[0];
  console.log("Review target_cast_id:", rev.target_cast_id);

  const { data: cast } = await s.from('casts').select('*').eq('id', rev.target_cast_id).single();
  console.log("Cast:", cast);
}
run();
