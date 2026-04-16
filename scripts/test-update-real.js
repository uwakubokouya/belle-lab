const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) env[key.trim()] = val.join('=').trim();
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdateReal() {
  const { data: fetch, error: e1 } = await supabase.from('sns_feedbacks').select('id').limit(1);
  if (!fetch || fetch.length === 0) return console.log('No data to update');

  const targetId = fetch[0].id;
  const { data, error } = await supabase
    .from('sns_feedbacks')
    .update({ status: 'read' })
    .eq('id', targetId)
    .select();
  
  if (error) {
     console.error('Update Error:', JSON.stringify(error, null, 2));
  } else {
     console.log('Update Success. Updated rows count:', data.length, 'Data:', data);
  }
}
testUpdateReal();
