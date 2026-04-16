require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase.from('reservations').select('*').limit(1);
  console.log("Reservations:", data || error);

  const { data: shifts, error: shiftsError } = await supabase.from('sns_shifts').select('*').limit(1).catch(()=>({data:null}));
  console.log("sns_shifts:", shifts || shiftsError);
  
  const { data: cast_s, error: csError } = await supabase.from('cast_shifts').select('*').limit(1).catch(()=>({data:null}));
  console.log("cast_shifts:", cast_s || csError);
}
checkSchema();
