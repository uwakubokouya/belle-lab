const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkSchema() {
  const { data: resData, error: resErr } = await supabase.from('sns_reservations').select('*').limit(1);
  console.log('sns_reservations columns:', resData ? Object.keys(resData[0] || {}) : resErr);

  const { data: salesData, error: salesErr } = await supabase.from('sales').select('*').limit(1);
  console.log('sales columns:', salesData ? Object.keys(salesData[0] || {}) : salesErr);
}

checkSchema();
