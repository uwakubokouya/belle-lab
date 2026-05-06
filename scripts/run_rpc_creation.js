const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

if(urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());
  const sql = fs.readFileSync('scripts/create_rpc_admin_delete_review.sql', 'utf8');
  
  // Use query instead of sql_query because I saw both being used
  supabase.rpc('exec_sql', { query: sql })
    .then(res => {
        if(res.error) {
            console.error("Failed with query:", res.error);
            // Try the other one
            supabase.rpc('exec_sql', { sql_query: sql })
              .then(res2 => console.log("Result with sql_query:", res2))
              .catch(console.error);
        } else {
            console.log("Success with query:", res);
            // Force schema reload
            supabase.rpc('admin_delete_review', { p_review_id: '00000000-0000-0000-0000-000000000000', p_admin_id: '00000000-0000-0000-0000-000000000000' }).catch(() => {});
        }
    })
    .catch(console.error);
} else {
  console.log('not found');
}
