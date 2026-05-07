const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    env[key.trim()] = values.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  const customerId = '788f5392-a913-49cf-964d-c110ec7792ec'; // sales.customer_id
  const castId = '2946c702-a271-4da3-8683-e5075c27a36a'; // sales.cast_id
  const date = '2026-05-07'; // sales.date
  
  console.log('--- 1. Check sns_profiles for this cti_customer_id ---');
  let { data: profiles, error: err1 } = await supabase
    .from('sns_profiles')
    .select('id, name, phone, cti_customer_id')
    .eq('cti_customer_id', customerId);
  console.log(profiles, err1);

  console.log('\n--- 2. Check sns_reservations for this specific user (bc3aec2a...) ---');
  let { data: res1, error: err2 } = await supabase
    .from('sns_reservations')
    .select('id, status, customer_id, cast_id, reserve_date')
    .eq('id', 'c792c07e-d8d8-449c-8026-be63a9e06c71');
  console.log(res1, err2);

  console.log('\n--- 3. Check trigger condition A (using cti_customer_id) ---');
  // Does the profile associated with this reservation have the cti_customer_id?
  let { data: res2, error: err3 } = await supabase
    .from('sns_profiles')
    .select('id, name, phone, cti_customer_id')
    .eq('id', 'bc3aec2a-d2e9-44a0-9965-8da5a50deaf1');
  console.log(res2, err3);

  console.log('\n--- 4. Check points_history ---');
  let { data: ph, error: err4 } = await supabase
    .from('points_history')
    .select('*')
    .eq('action_type', 'reservation_c792c07e-d8d8-449c-8026-be63a9e06c71');
  console.log(ph, err4);
}

verify();
