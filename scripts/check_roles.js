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

async function check() {
    const { data: data1 } = await supabase.from('sns_profiles').select('name, role, is_admin').like('name', '%運営%');
    console.log("HIMEMATCH:", data1);

    const { data: data2 } = await supabase.from('sns_profiles').select('name, role, is_admin').like('name', '%博多%');
    console.log("E-GIRLS:", data2);
}
check();
