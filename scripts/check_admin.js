const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const url = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);

async function check() {
    const { data: pData } = await supabase.from('profiles').select('id, store_id, role, contact_phone, phone, prefecture').eq('role', 'admin');
    console.log("admin profiles:", pData);
    
    const { data: sData } = await supabase.from('sns_profiles').select('id, name, phone, is_admin').eq('is_admin', true);
    console.log("admin sns_profiles:", sData);
}
check();
