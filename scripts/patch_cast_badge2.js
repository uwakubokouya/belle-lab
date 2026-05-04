const fs = require('fs');
let content = fs.readFileSync('src/app/[prefecture]/page.tsx', 'utf-8');

// 1. storeProfiles の select に full_name を追加
const targetStoreProfiles = `    const { data: storeProfiles } = await supabase
      .from('profiles')
      .select('id, store_id, username')
      .ilike('prefecture', \`\${prefecture}%\`)`;

const replaceStoreProfiles = `    const { data: storeProfiles } = await supabase
      .from('profiles')
      .select('id, store_id, username, full_name')
      .ilike('prefecture', \`\${prefecture}%\`)`;

content = content.replace(targetStoreProfiles, replaceStoreProfiles);

// 2. storeProfileMap の持ち方を変更
const targetMap = `    const storeProfileMap = new Map();
    storeProfiles.forEach(p => {
        storeProfileMap.set(p.store_id, p.username);
    });`;

const replaceMap = `    const storeProfileMap = new Map();
    storeProfiles.forEach(p => {
        storeProfileMap.set(p.store_id, p);
    });`;

content = content.replace(targetMap, replaceMap);

// 3. currentStoreName のロジック変更
const targetReturn = `            if (isStore) {
                currentStoreName = post.sns_profiles?.name || "公式";
                currentStoreProfileId = post.cast_id;
            } else if (matchedStoreCast) {
                const storeUsername = storeProfileMap.get(matchedStoreCast.store_id);
                if (storeUsername && snsStoreMap.has(storeUsername)) {
                    const storeInfo = snsStoreMap.get(storeUsername);
                    currentStoreName = storeInfo.name;
                    currentStoreProfileId = storeInfo.id;
                }
            }`;

const replaceReturn = `            if (isStore) {
                currentStoreName = post.sns_profiles?.name || "公式";
                currentStoreProfileId = post.cast_id;
            } else if (matchedStoreCast) {
                const storeProfile = storeProfileMap.get(matchedStoreCast.store_id);
                if (storeProfile) {
                    currentStoreName = storeProfile.full_name || storeProfile.username || "公式";
                    if (snsStoreMap.has(storeProfile.username)) {
                        currentStoreProfileId = snsStoreMap.get(storeProfile.username).id;
                    }
                }
            }`;

content = content.replace(targetReturn, replaceReturn);

fs.writeFileSync('src/app/[prefecture]/page.tsx', content);
console.log("Timeline cast badge logic patched successfully with full_name.");
