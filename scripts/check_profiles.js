const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const url = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);

async function check() {
    const { data: pData } = await supabase.from('profiles').select('id, name, prefecture, sns_enabled, store_id, cast_id, role');
    console.log("profiles:", pData.filter(p => p.prefecture !== null || p.sns_enabled === true));
}
check();
