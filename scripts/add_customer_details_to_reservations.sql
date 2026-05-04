-- Add customer_name and customer_phone to sns_reservations
ALTER TABLE public.sns_reservations 
ADD COLUMN IF NOT EXISTS customer_name VARCHAR,
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR;
