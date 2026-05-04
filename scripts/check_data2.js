const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const url = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);

async function check() {
    const { data: pData } = await supabase.from('profiles').select('id, name, prefecture, sns_enabled, store_id, cast_id, phone').limit(5);
    console.log("profiles sample:", pData);
    
    const { data: sData } = await supabase.from('sns_profiles').select('id, name, phone').limit(5);
    console.log("sns_profiles sample:", sData);
    
    const { data: cData } = await supabase.from('casts').select('id, login_id').limit(5);
    console.log("casts sample:", cData);
}
check();
