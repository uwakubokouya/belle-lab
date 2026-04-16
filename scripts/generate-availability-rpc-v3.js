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
DROP FUNCTION IF EXISTS get_public_availability(uuid, date);

CREATE OR REPLACE FUNCTION get_public_availability(p_store_id uuid, p_date date)
RETURNS TABLE (
  cast_id uuid,
  shift_start text,
  shift_end text,
  booked_start text,
  booked_end text,
  attendance_status text,
  next_shift_date date
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
    sa.end_time as booked_end,
    s.attendance_status as attendance_status,
    (
        SELECT MIN(s2.date) 
        FROM public.shifts s2 
        WHERE s2.cast_id = s.cast_id 
          AND s2.store_id = p_store_id 
          AND s2.date > p_date 
          AND (s2.attendance_status IS NULL OR s2.attendance_status != 'absent')
    ) as next_shift_date
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

console.log(sql);
