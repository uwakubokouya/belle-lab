const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

let supabaseUrl = '';
let supabaseKey = '';

envContent.split('\n').forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: pData } = await supabase.from('sns_profiles').select('id, name, is_admin, role').ilike('name', '%運営%');
    console.log("Profiles with 運営:");
    console.log(pData);
    
    const { data: cData } = await supabase.from('casts').select('id, name, store_id, login_id').ilike('name', '%運営%');
    console.log("Casts with 運営:");
    console.log(cData);
}

check();
