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

async function checkTableCols() {
  const { data, error } = await supabase
    .from('sns_feedbacks')
    .insert({ content: 'Test' })
    .select();
  
  if (error) {
     console.error('Error inserting content:', error);
  } else {
     console.log('Inserted:', data);
  }
}
checkTableCols();
