const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const url = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

async function testFetch() {
    console.log('Testing PostgREST...');
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => { controller.abort(); }, 5000);
        
        const res = await fetch(url + '/rest/v1/sns_profiles?select=id', {
            headers: {
                'apikey': key,
                'Authorization': 'Bearer ' + key
            },
            signal: controller.signal
        });
        clearTimeout(timeout);
        
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Data sample:', data.slice(0, 2));
    } catch (e) {
        console.error('Fetch error:', e.message);
    }
}

testFetch();
