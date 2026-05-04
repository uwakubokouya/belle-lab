const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const envRaw = fs.readFileSync('.env.local', 'utf8');
const lines = envRaw.split('\n');
const env = {};
for(const line of lines) {
    if(line.includes('=')) {
        const [a, ...b] = line.split('=');
        env[a.trim()] = b.join('=').trim().replace(/['"]/g, '');
    }
}
const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['NEXT_PUBLIC_SUPABASE_ANON_KEY']);

async function fetchBusinessEndTime() {
    const { data, error } = await supabase.from('store_settings').select('business_end_time').eq('store_id', 'ef92279f-3f19-47e7-b542-69de5906ab9b').maybeSingle();
    if (!data) return { hour: 6, min: 0 };
    const [h, m] = data.business_end_time.split(':');
    return { hour: parseInt(h, 10), min: parseInt(m, 10) };
}

function getLogicalBusinessDate(now, endHour, endMin) {
    let d = new Date(now);
    const m = d.getHours() * 60 + d.getMinutes();
    const eM = endHour * 60 + endMin;
    if (m < eM) {
        d.setDate(d.getDate() - 1);
    }
    return d.toLocaleDateString('sv-SE').split('T')[0];
}

async function run() {
    const storeId = 'ef92279f-3f19-47e7-b542-69de5906ab9b';
    
    const { data: activeCasts } = await supabase
        .from('casts')
        .select('*')
        .eq('store_id', storeId)
        .eq('status', 'active');
    
    if (!activeCasts || activeCasts.length === 0) {
        console.log("No active casts");
        return;
    }
    
    const phones = activeCasts.map(c => c.login_id).filter(Boolean);
    let profilesData = [];
    if (phones.length > 0) {
        const { data: pData } = await supabase
            .from('sns_profiles')
            .select('id, phone, avatar_url, name, bio')
            .in('phone', phones);
        if (pData) profilesData = pData;
    }
    
    console.log("Profiles data length:", profilesData.length);
    
    // Test the RPC call
    const now = new Date();
    const businessEndTime = await fetchBusinessEndTime();
    const todayStr = getLogicalBusinessDate(now, businessEndTime.hour, businessEndTime.min);
    
    const { data: availabilityData, error } = await supabase
        .rpc('get_public_availability', {
            p_store_id: storeId,
            p_date: todayStr
        });
        
    console.log("Availability:", availabilityData?.length, "Error:", error);
    
    // Sort simulation
    const mergedCasts = activeCasts.map(cast => {
        const profile = profilesData.find(p => p.phone === cast.login_id);
        return {
            ...cast,
            sns_name: profile?.name,
            sns_bio: profile?.bio
        };
    });
    console.log("Merged casts:", mergedCasts.length);
}
run();
