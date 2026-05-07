import { supabase } from '../src/lib/supabase';

async function run() {
  const { data, error } = await supabase.from('casts').select('id, name').limit(1);
  console.log("Casts data:", data);
  console.log("Casts error:", error);
}

run();
