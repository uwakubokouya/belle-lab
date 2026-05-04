const { createClient } = require('@supabase/supabase-js');
const url = "https://qyynkpoxgtmjbxpyclxx.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5eW5rcG94Z3RtamJ4cHljbHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NTc1NjQsImV4cCI6MjA4NjAzMzU2NH0.Xel-jwlytQDq8mOTaPZrvyrk4JJw01dWDJDWotEJKqs";
const supabase = createClient(url, key);

async function run() {
    const { data, error } = await supabase.from('profiles').select('*').eq('role', 'admin').limit(5);
    console.log(data, error);
}
run();
