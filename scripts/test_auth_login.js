const { createClient } = require('@supabase/supabase-js');
const url = "https://qyynkpoxgtmjbxpyclxx.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5eW5rcG94Z3RtamJ4cHljbHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NTc1NjQsImV4cCI6MjA4NjAzMzU2NH0.Xel-jwlytQDq8mOTaPZrvyrk4JJw01dWDJDWotEJKqs";
const supabase = createClient(url, key);

async function run() {
    let res = await supabase.auth.signInWithPassword({
        email: "e.girls.recruit@gmail.com",
        password: "31503150"
    });
    console.log("Login with email:", res.data?.user?.email, "Error:", res.error?.message);

    res = await supabase.auth.signInWithPassword({
        email: "E-girls@sns.local",
        password: "31503150"
    });
    console.log("Login with E-girls@sns.local:", res.data?.user?.email, "Error:", res.error?.message);
    
    res = await supabase.auth.signInWithPassword({
        email: "E-girls@crownia.local",
        password: "31503150"
    });
    console.log("Login with E-girls@crownia.local:", res.data?.user?.email, "Error:", res.error?.message);
}
run();
