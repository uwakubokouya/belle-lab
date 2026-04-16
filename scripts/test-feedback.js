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

async function testFeedback() {
  const { data, error } = await supabase
    .from('sns_feedbacks')
    .insert({
      name: 'Test',
      email: 'test@example.com',
      content: 'This is a test feedback from Anon.',
      status: 'unread'
    })
    .select();
  
  if (error) {
     console.error('Error:', error);
  } else {
     console.log('Success:', JSON.stringify(data, null, 2));
  }
}
testFeedback();
