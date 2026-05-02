-- Create global_app_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.global_app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.global_app_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid errors
DROP POLICY IF EXISTS "Anyone can read global_app_settings" ON public.global_app_settings;
DROP POLICY IF EXISTS "Only system and admins can update global_app_settings" ON public.global_app_settings;

-- Policy: Anyone can read system settings
CREATE POLICY "Anyone can read global_app_settings"
ON public.global_app_settings
FOR SELECT
USING (true);

-- Policy: Only system/admin users can update system settings
-- This uses sns_profiles to check the role of the current user
CREATE POLICY "Only system and admins can update global_app_settings"
ON public.global_app_settings
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.sns_profiles
        WHERE sns_profiles.id = auth.uid()
        AND sns_profiles.role IN ('system', 'admin')
    )
);

-- Insert initial fukuoka test mode data if it doesn't exist
INSERT INTO public.global_app_settings (key, value)
SELECT 'fukuoka_test_mode', '{"enabled": false}'::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM public.global_app_settings WHERE key = 'fukuoka_test_mode'
);
