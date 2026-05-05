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
  const { data: reviews } = await s.from('sns_reviews').select('*').eq('status', 'pending');
  console.log("Pending Reviews:", reviews);

  if(reviews && reviews.length > 0) {
      const castId = reviews[0].target_cast_id;
      const { data: castProfile } = await s.from('sns_profiles').select('*').eq('id', castId).maybeSingle();
      console.log("Target Cast in sns_profiles:", castProfile);
      
      const { data: legacyCast } = await s.from('casts').select('*').eq('id', castId).maybeSingle();
      console.log("Target Cast in legacy casts:", legacyCast);
  }
}
run();
