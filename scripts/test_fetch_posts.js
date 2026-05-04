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
    console.log("Starting test for E-girls store account...");
    const userPhone = 'E-girls';
    const activeTab = 'working';

    const { data: dbProfile } = await supabase
        .from('profiles')
        .select('store_id')
        .eq('username', userPhone)
        .eq('role', 'admin')
        .maybeSingle();

    console.log("Store Profile:", dbProfile);

    if (!dbProfile) {
        console.log("Store profile not found in profiles table.");
        return;
    }

    const myStoreId = dbProfile.store_id;

    const { data: myCasts } = await supabase
        .from('casts')
        .select('id, login_id, store_id')
        .eq('store_id', myStoreId)
        .eq('status', 'active');

    console.log("My Active Casts count:", myCasts?.length || 0);
    
    let myStoreLoginIds = myCasts ? myCasts.map(c => c.login_id).filter(Boolean) : [];
    console.log("My Store Login IDs:", myStoreLoginIds);

    const now = new Date();
    const todayStr = new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString().split('T')[0];
    console.log("Today string:", todayStr);

    const { data: todayShifts } = await supabase
        .from('shifts')
        .select('cast_id, attendance_status')
        .eq('date', todayStr);

    let workingCastIds = new Set();
    if (todayShifts) {
        todayShifts.forEach(s => {
            if (s.attendance_status !== 'absent') workingCastIds.add(s.cast_id);
        });
    }

    let workingCastLoginIds = myCasts
        ? myCasts.filter(c => workingCastIds.has(c.id)).map(c => c.login_id).filter(Boolean)
        : [];
        
    console.log("Working Cast Login IDs:", workingCastLoginIds);

    let orFilters = [];
    if (myStoreLoginIds.length > 0) {
        orFilters.push(`phone.in.(${myStoreLoginIds.join(',')})`);
    }

    let query = supabase.from('sns_profiles').select('id, phone');
    if (orFilters.length > 0) {
        query = query.or(orFilters.join(','));
        const { data: profilesData } = await query;
        console.log("Profiles Data count:", profilesData?.length || 0);

        let targetSnsIds = profilesData
            .filter(p => p.phone && myStoreLoginIds.includes(p.phone) && workingCastLoginIds.includes(p.phone))
            .map(p => p.id);
            
        console.log("Target SNS IDs:", targetSnsIds);
        
        if (targetSnsIds.length > 0) {
            const { data: postsData, error } = await supabase
                .from('sns_posts')
                .select('id, cast_id, content')
                .in('cast_id', targetSnsIds);
                
            console.log("Posts Data count:", postsData?.length || 0);
            if (error) console.error("Posts Error:", error);
        } else {
            console.log("No Target SNS IDs. Posts will be empty.");
        }
    }
}

testFetchPosts();
