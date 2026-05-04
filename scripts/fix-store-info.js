const fs = require('fs');
const path = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add useState
const targetState = '  const [castPreferences, setCastPreferences] = useState<any>(null);';
const replaceState = `  const [castPreferences, setCastPreferences] = useState<any>(null);
  const [storeInfo, setStoreInfo] = useState<{ id: string, name: string } | null>(null);`;

if (content.includes(targetState) && !content.includes('const [storeInfo, setStoreInfo]')) {
    content = content.replace(targetState, replaceState);
    console.log('Added useState');
}

// 2. Add fetch logic
// Find the place inside fetchData where storeCast is resolved
const targetFetch = `      const actualCastId = profile ? profile.id : id;`;
const replaceFetch = `      if (storeCast?.store_id) {
          const { data: storeProfile } = await supabase.from('profiles').select('username, full_name').eq('store_id', storeCast.store_id).maybeSingle();
          if (storeProfile) {
              const { data: snsStore } = await supabase.from('sns_profiles').select('id, name').eq('phone', storeProfile.username).maybeSingle();
              if (snsStore) {
                  setStoreInfo({ id: snsStore.id, name: snsStore.name });
              } else {
                  setStoreInfo({ id: storeCast.store_id, name: storeProfile.full_name || storeProfile.username || "公式" });
              }
          }
      }

      const actualCastId = profile ? profile.id : id;`;

if (content.includes(targetFetch) && !content.includes('setStoreInfo({ id: snsStore.id, name: snsStore.name })')) {
    content = content.replace(targetFetch, replaceFetch);
    console.log('Added fetch logic');
}

fs.writeFileSync(path, content, 'utf8');
console.log('Done');
