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
    const storeId = 'ef92279f-3f19-47e7-b542-69de5906ab9b';
    const { data: casts, error } = await s.from('casts').select('*').eq('store_id', storeId).eq('status', 'active');
    console.log('Casts:', casts?.length, 'Error:', error);
}
run();
