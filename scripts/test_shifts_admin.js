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

// USE SERVICE_ROLE KEY TO BYPASS RLS
const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

async function testFetchPosts() {
    const now = new Date();
    // In src/app/[prefecture]/page.tsx: 
    // const businessEndTime = await fetchBusinessEndTime(supabase);
    // const todayStr = getLogicalBusinessDate(now, businessEndTime.hour, businessEndTime.min);
    
    // Let's check dates that exist
    const { data: allShifts } = await supabase
        .from('shifts')
        .select('date')
        .order('date', { ascending: false })
        .limit(10);
        
    console.log("Recent shifts dates in DB (with service_role):", [...new Set(allShifts?.map(s => s.date))]);
}

testFetchPosts();
