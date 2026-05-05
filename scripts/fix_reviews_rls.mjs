import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load .env.local
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1]] = match[2].trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const sql = `
        DROP POLICY IF EXISTS "Stores can update public reviews." ON public.sns_reviews;
        DROP POLICY IF EXISTS "Stores can update any review for their casts." ON public.sns_reviews;
        CREATE POLICY "Stores can update any review for their casts." 
        ON public.sns_reviews FOR UPDATE 
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('store', 'admin', 'management')
            )
        );
    `;

    const { data, error } = await supabase.rpc('exec_sql', { query: sql });
    console.log("RLS Update Result:", error || "Success");
}
run();
