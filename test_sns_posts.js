const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function main() {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const env = {};
  for (const line of envContent.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k && v.length) {
      env[k.trim()] = v.join('=').trim().replace(/['"]/g, '');
    }
  }

  const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['NEXT_PUBLIC_SUPABASE_ANON_KEY']);
  
  // fetch all posts
  const { data: posts, error } = await supabase.from('sns_posts').select('*');
  console.log("Total posts in sns_posts:", posts?.length, error);

  if (posts?.length > 0) {
    for (const post of posts) {
       console.log("Checking post:", post.id, "with cast_id:", post.cast_id);
       const { data: fetchViaEq, error: eqErr } = await supabase.from('sns_posts').select('*').eq('cast_id', post.cast_id);
       console.log("-> eq('cast_id', id) result length:", fetchViaEq?.length, eqErr);
    }
  }
}

main().catch(console.error);
