const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('sns_messages').select('*').like('content', '[SYSTEM_LIKE]%').order('created_at', { ascending: false }).limit(5);
  console.log("Likes:", JSON.stringify(data, null, 2));
}
run();
