const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('', '');

async function check() {
    const { data: pData } = await supabase.from('profiles').select('id, name, prefecture, sns_enabled, store_id, cast_id, phone').limit(5);
    console.log("profiles sample:", pData);
    
    const { data: sData } = await supabase.from('sns_profiles').select('id, name, phone').limit(5);
    console.log("sns_profiles sample:", sData);
}
check();
