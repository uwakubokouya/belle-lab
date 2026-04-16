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

async function checkLikes() {
  const { data, error } = await supabase
    .from('sns_messages')
    .select('*, sender:sns_profiles!sender_id(*)')
    .like('content', '[SYSTEM_LIKE]%')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (error) {
     console.error('Error:', error);
  } else {
     console.log('Recent likes:', JSON.stringify(data, null, 2));
  }
}
checkLikes();
