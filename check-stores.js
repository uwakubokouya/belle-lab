const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
const envMap = {};
env.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length > 0) {
        envMap[key.trim()] = vals.join('=').trim().replace(/^"|"$/g, '');
    }
});
const supabase = createClient(envMap['NEXT_PUBLIC_SUPABASE_URL'], envMap['NEXT_PUBLIC_SUPABASE_ANON_KEY']);

async function test() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, role, is_admin')
    .eq('role', 'admin')
    .eq('is_admin', false)
    .limit(5);
  console.log(JSON.stringify(data, null, 2));
}
test();
