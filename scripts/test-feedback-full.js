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

async function testFeedbackFull() {
  const { data, error } = await supabase
    .from('sns_feedbacks')
    .insert({
      user_id: null,
      name: 'Test Name',
      phone: '1234567890',
      email: 'test@example.com',
      content: 'This is a test feedback from Anon.',
      status: 'unread'
    })
    .select();
  
  if (error) {
     console.error('Error:', JSON.stringify(error, null, 2));
  } else {
     console.log('Success:', JSON.stringify(data, null, 2));
  }
}
testFeedbackFull();
