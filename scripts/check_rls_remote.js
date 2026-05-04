const fetch = require('node-fetch');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const url = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

async function checkRLS() {
    try {
        const res = await fetch(url + '/rest/v1/', {
            headers: {
                'apikey': key,
                'Authorization': 'Bearer ' + key
            }
        });
        // This won't easily dump RLS, we need pg_policies from postgres
        console.log('Use a direct Postgres connection to see RLS');
    } catch (e) {
    }
}
checkRLS();
