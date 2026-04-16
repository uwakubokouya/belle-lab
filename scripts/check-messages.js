require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data: footprints } = await supabase.from('sns_footprints').select('*').limit(1);
  console.log("sns_footprints limit 1:", footprints);
  
  const { data: messages } = await supabase.from('sns_messages').select('*').limit(1);
  console.log("sns_messages limit 1:", messages);
}

run();
