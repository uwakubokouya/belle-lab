const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
let NEXT_PUBLIC_SUPABASE_URL = '';
let NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

env.split('\n').forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) NEXT_PUBLIC_SUPABASE_URL = line.split('=')[1].trim();
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) NEXT_PUBLIC_SUPABASE_ANON_KEY = line.split('=')[1].trim();
});

async function query(table, select = '*') {
    const res = await fetch(`${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?select=${select}&limit=100`, {
        headers: {
            'apikey': NEXT_PUBLIC_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
    });
    return res.json();
}

async function checkUnknownCasts() {
  const pageViews = await query('page_views', 'target_id,page_type');
  if (!pageViews || pageViews.length === 0) return;

  const uniqueTargetIds = [...new Set(pageViews.filter(pv => pv.page_type === 'cast_profile' || pv.page_type === 'reserve_click').map(pv => pv.target_id).filter(Boolean))];

  const profilesRes = await fetch(`${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sns_profiles?select=id,name,role&id=in.(${uniqueTargetIds.join(',')})`, {
        headers: {
            'apikey': NEXT_PUBLIC_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
  });
  const profiles = await profilesRes.json() || [];
  const foundInSns = new Set(profiles.map(p => p.id));
  
  const castsRes = await fetch(`${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/casts?select=id,name,login_id&id=in.(${uniqueTargetIds.join(',')})`, {
        headers: {
            'apikey': NEXT_PUBLIC_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
  });
  const ctiCasts = await castsRes.json() || [];
  const foundInCti = new Set(ctiCasts.map(c => c.id));

  const stillMissing = uniqueTargetIds.filter(id => !foundInSns.has(id) && !foundInCti.has(id));
  console.log("Completely missing target IDs (deleted casts?):", stillMissing);
  
  // pageViews の中での回数を集計
  const counts = {};
  pageViews.forEach(pv => {
      if (!counts[pv.target_id]) counts[pv.target_id] = 0;
      counts[pv.target_id]++;
  });
  
  console.log("\nTop 5 missing target IDs by PV count:");
  stillMissing.sort((a,b) => counts[b] - counts[a]).slice(0, 5).forEach(id => {
      console.log(`${id}: ${counts[id]} PVs`);
  });
}

checkUnknownCasts();
