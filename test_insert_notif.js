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
  const { data: cast, error: castErr } = await s.from('casts').select('store_id').eq('id', 'b3fa41ab-e8fb-4fd9-8971-f1e9a05089b4').single();
  console.log("Cast:", cast, "Err:", castErr);

  if (cast && cast.store_id) {
     const { data, error } = await s.from('sns_notifications').insert({
            user_id: cast.store_id,
            title: '新しい口コミ',
            content: `testさん宛に新しい口コミが投稿されました。審査画面から確認して承認を行ってください。`,
            type: '重要'
          });
     console.log("Insert Notif Data:", data, "Error:", error);
  }
}
run();
