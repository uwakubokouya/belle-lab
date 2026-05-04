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
const s = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['NEXT_PUBLIC_SUPABASE_ANON_KEY']);
async function run() {
    // We want to see what is profileData.phone in our app.
    // The profile shown is 'E-GIRLS博多'
    const { data: storeSnsProfile } = await s.from('sns_profiles').select('*').eq('name', 'E-GIRLS博多');
    console.log('E-GIRLS博多 sns_profiles:', storeSnsProfile);
    
    if (storeSnsProfile && storeSnsProfile.length > 0) {
        const phone = storeSnsProfile[0].phone;
        const { data: storeProfile } = await s.from('profiles').select('*').eq('username', phone);
        console.log('profiles where username=', phone, ':', storeProfile);
        
        if (storeProfile && storeProfile.length > 0) {
            const storeId = storeProfile[0].store_id;
            console.log('Extracted store_id:', storeId);
            
            const { data: casts } = await s.from('casts').select('*').eq('store_id', storeId).eq('status', 'active');
            console.log('Casts in this store:', casts?.length);
        }
    }
}
run();
