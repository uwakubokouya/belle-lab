const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const env = {};
envLocal.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1]] = match[2];
    }
});

const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['NEXT_PUBLIC_SUPABASE_ANON_KEY']);

async function testFetchPosts() {
    const userPhone = 'E-girls';
    const { data: dbProfile } = await supabase
        .from('profiles')
        .select('store_id')
        .eq('username', userPhone)
        .eq('role', 'admin')
        .maybeSingle();

    const myStoreId = dbProfile.store_id;
    const { data: myCasts } = await supabase
        .from('casts')
        .select('id, login_id')
        .eq('store_id', myStoreId)
        .eq('status', 'active');
        
    let myStoreLoginIds = myCasts ? myCasts.map(c => c.login_id).filter(Boolean) : [];
    
    let query = supabase.from('sns_profiles').select('id, phone');
    query = query.or(`phone.in.(${myStoreLoginIds.join(',')})`);
    
    const { data: profilesData } = await query;
    let targetSnsIds = profilesData.map(p => p.id);
    
    console.log("My Store SNS IDs:", targetSnsIds.length);
    
    if (targetSnsIds.length > 0) {
        const { data: postsData } = await supabase
            .from('sns_posts')
            .select('id, content')
            .in('cast_id', targetSnsIds);
            
        console.log(`Found ${postsData?.length || 0} posts from My Store casts`);
        console.log(postsData);
    }
}

testFetchPosts();
