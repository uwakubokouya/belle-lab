require('fs').readFileSync('.env.local', 'utf-8').split('\n').forEach(line => {if(line.startsWith('NEXT_PUBLIC_SUPABASE_URL')) process.env.NEXT_PUBLIC_SUPABASE_URL=line.split('=')[1].trim(); if(line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY')) process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY=line.split('=')[1].trim();});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
    const { data: d1, error: e1 } = await supabase.from('sns_reviews').select('id, sns_profiles!target_cast_id(name)').limit(1);
    console.log("With !target_cast_id:", e1 || "SUCCESS");
    
    const { data: d2, error: e2 } = await supabase.from('sns_reviews').select('id, sns_profiles!sns_reviews_target_id_fkey(name)').limit(1);
    console.log("With !sns_reviews_target_id_fkey:", e2 || "SUCCESS");

    // Let's try fetching the schema via OpenAPI
    const resp = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/?apikey=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`);
    const swagger = await resp.json();
    console.log("Foreign keys in sns_reviews:");
    // Print all foreign keys for sns_reviews, we need to inspect the definitions
    if (swagger.definitions && swagger.definitions.sns_reviews) {
         console.log("Description (where fks might be):", swagger.definitions.sns_reviews.description);
    }
}
test();
