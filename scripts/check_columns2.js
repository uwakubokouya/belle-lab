const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://qyynkpoxgtmjbxpyclxx.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5eW5rcG94Z3RtamJ4cHljbHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NTc1NjQsImV4cCI6MjA4NjAzMzU2NH0.Xel-jwlytQDq8mOTaPZrvyrk4JJw01dWDJDWotEJKqs');

async function check() {
    const { data: pData, error: pErr } = await supabase.from('profiles').select('*').limit(1);
    console.log("profiles:", pData ? Object.keys(pData[0] || {}) : pErr);
    
    const { data: sData, error: sErr } = await supabase.from('sns_profiles').select('*').limit(1);
    console.log("sns_profiles:", sData ? Object.keys(sData[0] || {}) : sErr);
    
    const { data: cData, error: cErr } = await supabase.from('casts').select('*').limit(1);
    console.log("casts:", cData ? Object.keys(cData[0] || {}) : cErr);
}
check();
