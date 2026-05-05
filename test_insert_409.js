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
  const { data: revs } = await s.from('sns_reviews').select('*').order('created_at', { ascending: false }).limit(1);
  if (!revs || revs.length === 0) return console.log("No reviews");
  const rev = revs[0];

  const { data: profile } = await s.from('sns_profiles').select('store_id').eq('id', rev.target_cast_id).single();
  let store_id = profile?.store_id;

  if (!store_id) {
    console.log("No store_id in profile, using fallback");
    store_id = 'ef92279f-3f19-47e7-b542-69de5906ab9b'; // dummy fallback for test
  }

  console.log("Inserting notification for store_id:", store_id);
  const { data, error } = await s.from('sns_notifications').insert({
      user_id: store_id,
      title: '新しい口コミ',
      content: 'test',
      type: '重要'
  });
  console.log("Insert result:", data, "Error:", error);
}
run();
