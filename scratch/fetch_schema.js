const fs = require('fs');
const envRaw = fs.readFileSync('.env.local', 'utf8');
const env = {};
envRaw.split('\n').forEach(line => {
    if(line.includes('=')) {
        const [a, ...b] = line.split('=');
        env[a.trim()] = b.join('=').trim().replace(/["']/g, '');
    }
});

const url = env['NEXT_PUBLIC_SUPABASE_URL'] + '/rest/v1/?apikey=' + (env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY']);

fetch(url, { headers: { 'apikey': env['SUPABASE_SERVICE_ROLE_KEY'], 'Authorization': 'Bearer ' + env['SUPABASE_SERVICE_ROLE_KEY'] } })
.then(res => res.json())
.then(data => {
    fs.writeFileSync('schema2.json', JSON.stringify(data, null, 2));
    console.log("Schema saved to schema2.json");
})
.catch(err => console.error("Error:", err));
