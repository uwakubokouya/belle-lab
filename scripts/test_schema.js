require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkSchema() {
  // Query information schema for shifts table
  const { data, error } = await supabase.from('shifts').select('*').limit(1);
  console.log("Shifts data:", data, "Error:", error);
  
  const { data: cast_shifts, error: cError } = await supabase.from('cast_shifts').select('*').limit(1).catch(()=>({data:null}));
  console.log("cast_shifts:", cast_shifts, "Error:", cError);
}
checkSchema();
