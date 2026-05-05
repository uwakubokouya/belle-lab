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
  const { data: stores } = await s.from('sns_profiles').select('*').eq('role', 'store');
  console.log("Stores:", stores.map(st => ({id: st.id, name: st.name})));
  
  if (stores.length > 0) {
      const storeId = stores[0].id;
      const { data: latestNotif } = await s
        .from('sns_notifications')
        .select('id, created_at, user_id, title')
        .or(`user_id.is.null,user_id.eq.${storeId}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      console.log("Latest Notif for Store:", latestNotif);

      const { data: footprints } = await s
          .from('sns_footprints')
          .select('viewer_id')
          .eq('cast_id', storeId);
      console.log("Footprints for Store:", footprints);
  }
}
run();
