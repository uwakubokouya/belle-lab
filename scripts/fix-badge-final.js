const fs = require('fs');
const path = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. 店舗名のフェッチロジック修正（"公式"になってしまう問題の解決）
const targetFetch = `      if (storeCast?.store_id) {
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

const replaceFetch = `      if (storeCast?.store_id) {
          let resolvedStoreName = "公式";
          let resolvedStoreId = storeCast.store_id;
          
          // Fetch raw store name as fallback
          const { data: rawStore } = await supabase.from('stores').select('name').eq('id', storeCast.store_id).maybeSingle();
          if (rawStore?.name) resolvedStoreName = rawStore.name;

          const { data: storeProfile } = await supabase.from('profiles').select('username, full_name').eq('store_id', storeCast.store_id).maybeSingle();
          if (storeProfile) {
              resolvedStoreName = storeProfile.full_name || storeProfile.username || resolvedStoreName;
              
              const { data: snsStore } = await supabase.from('sns_profiles').select('id, name').eq('phone', storeProfile.username).maybeSingle();
              if (snsStore) {
                  resolvedStoreName = snsStore.name;
                  resolvedStoreId = snsStore.id;
              }
          }
          
          setStoreInfo({ id: resolvedStoreId, name: resolvedStoreName });
      }`;

if (content.includes(targetFetch)) {
    content = content.replace(targetFetch, replaceFetch);
    console.log("Updated fetch logic exactly");
} else {
    // Regex fallback for fetch logic
    const fetchRegex = /if\s*\(storeCast\?\.store_id\)\s*\{[\s\S]*?setStoreInfo\(\{ id: resolvedStoreId, name: resolvedStoreName \}\);\s*\}/;
    content = content.replace(fetchRegex, replaceFetch);
    console.log("Updated fetch logic via regex");
}


// 2. 余白の修正
const targetJSX = `<div className="mb-6">
            <h1 className="text-2xl font-normal text-black flex items-center gap-2 uppercase tracking-widest mb-3">
                {cast.name || "名称未設定"}
            </h1>
          {storeInfo && storeInfo.name && (
              <Link href={\`/cast/\${storeInfo.id}\`} className="inline-block mt-0 mb-3">
                  <span className="text-[10px] text-[#777777] bg-[#F9F9F9] border border-[#E5E5E5] px-2 py-0.5 tracking-widest hover:bg-[#E5E5E5] transition-colors">
                      {storeInfo.name}
                  </span>
              </Link>
          )}
          {cast.bio && (
            <p className="text-sm text-[#333333] whitespace-pre-wrap leading-relaxed font-light">
                {cast.bio}
            </p>
          )}
        </div>`;

const replaceJSX = `<div className="mb-3">
            <h1 className="text-2xl font-normal text-black flex items-center gap-2 uppercase tracking-widest mb-3">
                {cast.name || "名称未設定"}
            </h1>
          {storeInfo && storeInfo.name && (
              <Link href={\`/cast/\${storeInfo.id}\`} className="inline-block mt-0">
                  <span className="text-[10px] text-[#777777] bg-[#F9F9F9] border border-[#E5E5E5] px-2 py-0.5 tracking-widest hover:bg-[#E5E5E5] transition-colors">
                      {storeInfo.name}
                  </span>
              </Link>
          )}
          {cast.bio && (
            <p className="text-sm text-[#333333] whitespace-pre-wrap leading-relaxed font-light mt-3">
                {cast.bio}
            </p>
          )}
        </div>`;

if (content.includes(targetJSX)) {
    content = content.replace(targetJSX, replaceJSX);
    console.log("Updated JSX exactly");
} else {
    // Regex fallback for JSX
    const jsxRegex = /<div className="mb-6">\s*<h1 className="text-2xl font-normal text-black flex items-center gap-2 uppercase tracking-widest mb-3">\s*\{cast\.name \|\| "名称未設定"\}\s*<\/h1>[\s\S]*?<\/div>/;
    content = content.replace(jsxRegex, replaceJSX);
    console.log("Updated JSX via regex");
}

fs.writeFileSync(path, content, 'utf8');
console.log('Done');
