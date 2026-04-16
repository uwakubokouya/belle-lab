import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const getEnv = (key) => envContent.split('\n').find(l => l.startsWith(key))?.split('=')[1].trim();

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

const sql = `
CREATE OR REPLACE FUNCTION get_public_availability(p_store_id uuid, p_date date)
RETURNS TABLE (
  cast_id uuid,
  shift_start text,
  shift_end text,
  booked_start text,
  booked_end text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.cast_id,
    s.start_time as shift_start,
    s.end_time as shift_end,
    sa.start_time as booked_start,
    sa.end_time as booked_end
  FROM public.shifts s
  LEFT JOIN public.sales sa 
    ON s.cast_id = sa.cast_id 
    AND sa.date = p_date 
    AND sa.store_id = p_store_id
    AND sa.status != 'cancelled'
  WHERE s.store_id = p_store_id AND s.date = p_date;
END;
$$;
`;

// To execute SQL via Supabase JS with anon key, we'd normally use an edge function. 
// Since we don't have one, we MUST output the SQL for the user to run in the SQL Editor.
console.log(sql);
