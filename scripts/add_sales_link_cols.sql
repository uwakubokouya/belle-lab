-- Add columns to sales table for linking with sns_reservations and CTI
DO $$
BEGIN
    -- Add sns_reservation_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales' AND column_name='sns_reservation_id') THEN
        ALTER TABLE public.sales ADD COLUMN sns_reservation_id UUID REFERENCES public.sns_reservations(id) ON DELETE SET NULL;
    END IF;

    -- Add customer_phone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales' AND column_name='customer_phone') THEN
        ALTER TABLE public.sales ADD COLUMN customer_phone VARCHAR;
    END IF;
END $$;
