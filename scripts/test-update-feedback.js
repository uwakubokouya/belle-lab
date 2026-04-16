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

async function testUpdate() {
  const { data, error } = await supabase
    .from('sns_feedbacks')
    .update({ status: 'read' })
    .neq('id', '00000000-0000-0000-0000-000000000000') // dummy condition to see if we get error
    .select();
  
  if (error) {
     console.error('Update Error:', JSON.stringify(error, null, 2));
  } else {
     console.log('Update Success:', data.length, 'rows');
  }
}
testUpdate();
