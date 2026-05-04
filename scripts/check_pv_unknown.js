const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUnknownCasts() {
  // 1. 最近のページビューを取得
  const { data: pageViews } = await supabase
    .from('page_views')
    .select('target_id')
    .limit(100);
  
  if (!pageViews || pageViews.length === 0) {
    console.log("No page views found.");
    return;
  }

  const uniqueTargetIds = [...new Set(pageViews.map(pv => pv.target_id).filter(Boolean))];
  console.log("Unique target IDs in page_views:", uniqueTargetIds.length);

  // 2. それらの target_id に該当する sns_profiles を取得
  const { data: profiles } = await supabase
    .from('sns_profiles')
    .select('id, name, role')
    .in('id', uniqueTargetIds);
    
  console.log("Matching profiles in sns_profiles:", profiles?.length);
  
  if (profiles) {
    const foundIds = profiles.map(p => p.id);
    const missingIds = uniqueTargetIds.filter(id => !foundIds.includes(id));
    console.log("Missing target IDs:", missingIds);
    
    console.log("Sample missing IDs (first 5):", missingIds.slice(0, 5));
    
    // Check if these missing IDs exist in `casts` table instead
    if (missingIds.length > 0) {
        const { data: ctiCasts } = await supabase
            .from('casts')
            .select('id, name, login_id')
            .in('id', missingIds);
        console.log("Matching casts in cti `casts` table:", ctiCasts?.length);
        if (ctiCasts && ctiCasts.length > 0) {
            console.log("Sample CTI Casts:", ctiCasts.slice(0, 5));
        }
    }
  }
}

checkUnknownCasts();
