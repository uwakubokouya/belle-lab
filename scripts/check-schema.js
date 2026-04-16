const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
// wait we need the actual env vars
// Let's just import them from .env.local
const envContents = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = envContents.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envContents.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function checkSchema() {
  const { data, error } = await supabase.from('sns_profiles').select('*').limit(1);
  if (error) console.error(error);
  else console.log(Object.keys(data[0]));
}

checkSchema();
