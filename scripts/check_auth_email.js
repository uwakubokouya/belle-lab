const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
let key = "";
try {
    const env = fs.readFileSync('.env.local', 'utf-8');
    const match = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
    if (match) key = match[1].trim();
} catch (e) {}

const url = "https://qyynkpoxgtmjbxpyclxx.supabase.co";
const supabase = createClient(url, key);

async function run() {
    const { data, error } = await supabase.auth.admin.getUserById('ef92279f-3f19-47e7-b542-69de5906ab9b');
    console.log("Email:", data?.user?.email, "Error:", error);
}
run();
