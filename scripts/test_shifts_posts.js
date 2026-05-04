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
    console.log("My Store has " + myStoreLoginIds.length + " casts.");
    
    let query = supabase.from('sns_profiles').select('id, phone, name');
    query = query.or(`phone.in.(${myStoreLoginIds.join(',')})`);
    
    const { data: profilesData } = await query;
    let targetSnsIds = profilesData.map(p => p.id);
    
    const { data: postsData } = await supabase
        .from('sns_posts')
        .select('id, content, cast_id')
        .in('cast_id', targetSnsIds);
        
    console.log(`Found ${postsData?.length || 0} posts from My Store casts.`);
    
    // Who made these posts?
    const postedCastIds = [...new Set(postsData.map(p => p.cast_id))];
    const postedProfiles = profilesData.filter(p => postedCastIds.includes(p.id));
    console.log("Casts who made these posts:", postedProfiles.map(p => p.phone + " (" + p.name + ")"));
    
    // Do these specific casts have shifts today?
    const now = new Date();
    // Logical date
    const todayStr = new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const postedCastLoginIds = postedProfiles.map(p => p.phone);
    const actualCasts = myCasts.filter(c => postedCastLoginIds.includes(c.login_id));
    const castIdsToCheck = actualCasts.map(c => c.id);
    
    const { data: todayShifts } = await supabase
        .from('shifts')
        .select('cast_id, attendance_status, date')
        .eq('date', todayStr)
        .in('cast_id', castIdsToCheck);
        
    console.log(`Shifts today for the casts who have posted:`, todayShifts);
}

testFetchPosts();
