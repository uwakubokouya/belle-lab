const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('', '');

async function check() {
    const { data: pData, error: pErr } = await supabase.from('profiles').select('*').limit(1);
    console.log("profiles:", pData ? Object.keys(pData[0] || {}) : pErr);
    
    const { data: sData, error: sErr } = await supabase.from('sns_profiles').select('*').limit(1);
    console.log("sns_profiles:", sData ? Object.keys(sData[0] || {}) : sErr);
    
    const { data: cData, error: cErr } = await supabase.from('casts').select('*').limit(1);
    console.log("casts:", cData ? Object.keys(cData[0] || {}) : cErr);
}
check();
