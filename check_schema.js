const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://qyynkpoxgtmjbxpyclxx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5eW5rcG94Z3RtamJ4cHljbHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NTc1NjQsImV4cCI6MjA4NjAzMzU2NH0.Xel-jwlytQDq8mOTaPZrvyrk4JJw01dWDJDWotEJKqs';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { error } = await supabase.from('sns_posts').insert([{ cast_id: 'fake', content: 'test', REALLY_FAKE_COLUMN: 'yes' }]);
  console.log(error);
}
check();
