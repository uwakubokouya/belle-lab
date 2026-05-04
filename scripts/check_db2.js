const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://qyynkpoxgtmjbxpyclxx.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5eW5rcG94Z3RtamJ4cHljbHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NTc1NjQsImV4cCI6MjA4NjAzMzU2NH0.Xel-jwlytQDq8mOTaPZrvyrk4JJw01dWDJDWotEJKqs');

async function check() {
    const { data, error } = await supabase.from('sns_profiles').select('id, name, prefecture, sns_enabled');
    console.log(JSON.stringify(data, null, 2));
    if (error) console.error(error);
}
check();
