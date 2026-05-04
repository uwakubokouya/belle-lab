const fs = require('fs');
const path = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetFetch = `      if (storeCast?.store_id) {
          const { data: storeProfile } = await supabase.from('profiles').select('username, full_name').eq('store_id', storeCast.store_id).maybeSingle();
          if (storeProfile) {
              const { data: snsStore } = await supabase.from('sns_profiles').select('id, name').eq('phone', storeProfile.username).maybeSingle();
              if (snsStore) {
                  setStoreInfo({ id: snsStore.id, name: snsStore.name });
              } else {
                  setStoreInfo({ id: storeCast.store_id, name: storeProfile.full_name || storeProfile.username || "公式" });
              }
          }
      }`;

const replaceFetch = `      if (storeCast?.store_id) {
          let resolvedStoreName = "公式";
          let resolvedStoreId = storeCast.store_id;
          
          // Fetch raw store name as fallback
          const { data: rawStore } = await supabase.from('stores').select('name').eq('id', storeCast.store_id).maybeSingle();
          if (rawStore?.name) resolvedStoreName = rawStore.name;

          const { data: storeProfile } = await supabase.from('profiles').select('username, full_name').eq('store_id', storeCast.store_id).maybeSingle();
          if (storeProfile) {
              if (storeProfile.full_name) resolvedStoreName = storeProfile.full_name;
              
              const { data: snsStore } = await supabase.from('sns_profiles').select('id, name').eq('phone', storeProfile.username).maybeSingle();
              if (snsStore) {
                  resolvedStoreName = snsStore.name;
                  resolvedStoreId = snsStore.id;
              }
          }
          
          setStoreInfo({ id: resolvedStoreId, name: resolvedStoreName });
      }`;

if (content.includes('const { data: storeProfile } = await supabase.from(\'profiles\')')) {
    // We might have formatting differences, so let's use regex if exact replace fails
    if (content.includes(targetFetch)) {
        content = content.replace(targetFetch, replaceFetch);
        console.log("Replaced exactly");
    } else {
        // Fallback to regex replacement
        const regex = /if\s*\(storeCast\?\.store_id\)\s*\{[\s\S]*?setStoreInfo\(\{[\s\S]*?\}\);\s*\}\s*\}/;
        content = content.replace(regex, replaceFetch);
        console.log("Replaced via regex");
    }
    fs.writeFileSync(path, content, 'utf8');
} else {
    console.log("Target not found");
}
