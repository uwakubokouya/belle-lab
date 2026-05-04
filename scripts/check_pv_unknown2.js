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
  const pageViews = await query('page_views', 'target_id');
  if (!pageViews || pageViews.length === 0) {
    console.log("No page views found.");
    return;
  }

  const uniqueTargetIds = [...new Set(pageViews.map(pv => pv.target_id).filter(Boolean))];
  console.log("Unique target IDs in page_views:", uniqueTargetIds.length);

  const profilesRes = await fetch(`${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sns_profiles?select=id,name,role&id=in.(${uniqueTargetIds.join(',')})`, {
        headers: {
            'apikey': NEXT_PUBLIC_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
  });
  const profiles = await profilesRes.json();
  console.log("Matching profiles in sns_profiles:", profiles?.length);
  
  if (profiles) {
    const foundIds = profiles.map(p => p.id);
    const missingIds = uniqueTargetIds.filter(id => !foundIds.includes(id));
    console.log("Missing target IDs count:", missingIds.length);
    console.log("Sample missing IDs (first 5):", missingIds.slice(0, 5));

    if (missingIds.length > 0) {
        const castsRes = await fetch(`${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/casts?select=id,name,login_id&id=in.(${missingIds.join(',')})`, {
            headers: {
                'apikey': NEXT_PUBLIC_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}`
            }
        });
        const ctiCasts = await castsRes.json();
        console.log("Matching casts in cti `casts` table:", ctiCasts?.length);
        if (ctiCasts && ctiCasts.length > 0) {
            console.log("Sample CTI Casts:", ctiCasts.slice(0, 5));
        }
    }
  }
}

checkUnknownCasts();
