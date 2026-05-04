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
    const now = new Date();
    const todayStr = new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    console.log("Checking shifts for:", todayStr);
    
    const { data: todayShifts } = await supabase
        .from('shifts')
        .select('*')
        .eq('date', todayStr);
        
    console.log(`Found ${todayShifts?.length || 0} shifts for today`);
    if (todayShifts && todayShifts.length > 0) {
        console.log(todayShifts.slice(0, 5));
    }
    
    // Check all shifts
    const { data: allShifts } = await supabase
        .from('shifts')
        .select('date')
        .order('date', { ascending: false })
        .limit(10);
        
    console.log("Recent shifts dates in DB:", [...new Set(allShifts?.map(s => s.date))]);
}

testFetchPosts();
