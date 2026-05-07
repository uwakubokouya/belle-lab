const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const envLocal = fs.readFileSync('.env.local', 'utf8');
const env = {};
envLocal.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1]] = match[2].trim().replace(/['"]/g, '');
    }
});
const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['NEXT_PUBLIC_SUPABASE_ANON_KEY']);

async function getSales() {
    const { data } = await supabase.from('sales').select('*').limit(1);
    console.log("Sales columns:", data && data.length > 0 ? Object.keys(data[0]) : "No rows found");
}
getSales();
