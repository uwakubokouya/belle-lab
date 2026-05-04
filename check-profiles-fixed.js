const { createClient } = require('@supabase/supabase-js');

// env を手動で読み込むか、ハードコードする
// .env.local をパースする
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
const envMap = {};
env.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length > 0) {
        envMap[key.trim()] = vals.join('=').trim().replace(/^"|"$/g, '');
    }
});

const supabase = createClient(
  envMap['NEXT_PUBLIC_SUPABASE_URL'],
  envMap['NEXT_PUBLIC_SUPABASE_ANON_KEY']
);

async function test() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'admin')
    .limit(1);

  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}
test();
