import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
let supabaseUrl = '';
let supabaseKey = '';

envContent.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('sns_shifts').select('*').limit(1);
  console.log("sns_shifts:", data || error);
  
  const { data: c, error: ce } = await supabase.from('shifts').select('*').limit(1);
  console.log("shifts:", c || ce);
  
  const { data: d, error: de } = await supabase.from('reservations').select('*').limit(1);
  console.log("reservations:", d || de);
}

run();
