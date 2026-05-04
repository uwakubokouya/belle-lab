const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const env = {};
envLocal.split('\n').forEach(line => {
    if (line.includes('=')) {
        const [key, val] = line.split('=');
        env[key.trim()] = val.trim();
    }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function investigate() {
    // 1. Find 'あゆ' in casts or sns_profiles
    const { data: profiles } = await supabase.from('sns_profiles').select('id, name, phone').like('name', '%あゆ%');
    console.log("sns_profiles matches for 'あゆ':", profiles);

    if (!profiles || profiles.length === 0) return;

    for (let profile of profiles) {
        console.log(`\nInvestigating cast: ${profile.name} (phone: ${profile.phone})`);
        
        // 2. Find cast in 'casts' table
        const { data: castData } = await supabase.from('casts').select('id, store_id, login_id, name').eq('login_id', profile.phone);
        console.log("casts matches:", castData);

        if (castData && castData.length > 0) {
            for (let c of castData) {
                console.log(`\nChecking store_id: ${c.store_id}`);
                
                // 3. Find store in 'profiles' table
                const { data: sProfile, error: err1 } = await supabase.from('profiles').select('id, store_id, username, full_name').eq('store_id', c.store_id);
                console.log("profiles matches:", sProfile, "error:", err1);

                if (sProfile && sProfile.length > 0) {
                    for (let sp of sProfile) {
                        console.log(`\nChecking sns_profile for store username: ${sp.username}`);
                        // 4. Find store in 'sns_profiles'
                        const { data: sSnsProfile, error: err2 } = await supabase.from('sns_profiles').select('id, name, phone').eq('phone', sp.username);
                        console.log("sns_profiles for store:", sSnsProfile, "error:", err2);
                    }
                }
            }
        }
    }
}
investigate();
