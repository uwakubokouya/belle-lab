const fs = require('fs');
let content = fs.readFileSync('src/app/[prefecture]/page.tsx', 'utf-8');

// 1. snsStoreProfiles で name と phone も取得するように変更
const targetSnsStore = `    const { data: snsStoreProfiles } = await supabase
      .from('sns_profiles')
      .select('id')
      .in('phone', storeUsernames);`;

const replaceSnsStore = `    const { data: snsStoreProfiles } = await supabase
      .from('sns_profiles')
      .select('id, name, phone')
      .in('phone', storeUsernames);
      
    const storeProfileMap = new Map();
    storeProfiles.forEach(p => {
        storeProfileMap.set(p.store_id, p.username);
    });

    const snsStoreMap = new Map();
    if (snsStoreProfiles) {
        snsStoreProfiles.forEach(p => {
            if (p.phone) snsStoreMap.set(p.phone, { id: p.id, name: p.name });
        });
    }`;

content = content.replace(targetSnsStore, replaceSnsStore);

// 2. mappedPosts の中で currentStoreName を決定する処理を追加
const targetReturn = `            const type = post.post_type || "全員";
            const isStore = storeAccountIds.includes(post.cast_id);
             let result = { 
                 ...post, 
                 isWorkingToday, 
                 slotsLeft, 
                 nextAvailableTime,
                 statusText,
                 isFollowing, 
                 isLocked: false, 
                 lockReason: "",
                 isStore,
                 isMyStoreCast,
                 storeName: isStore ? (post.sns_profiles?.name || "公式") : (adminProfile?.name || "公式"),
                 storeProfileId: isStore ? post.cast_id : adminProfile?.id
             };`;

const replaceReturn = `            const type = post.post_type || "全員";
            const isStore = storeAccountIds.includes(post.cast_id);
            
            let currentStoreName = adminProfile?.name || "公式";
            let currentStoreProfileId = adminProfile?.id;

            if (isStore) {
                currentStoreName = post.sns_profiles?.name || "公式";
                currentStoreProfileId = post.cast_id;
            } else if (matchedStoreCast) {
                const storeUsername = storeProfileMap.get(matchedStoreCast.store_id);
                if (storeUsername && snsStoreMap.has(storeUsername)) {
                    const storeInfo = snsStoreMap.get(storeUsername);
                    currentStoreName = storeInfo.name;
                    currentStoreProfileId = storeInfo.id;
                }
            }

             let result = { 
                 ...post, 
                 isWorkingToday, 
                 slotsLeft, 
                 nextAvailableTime,
                 statusText,
                 isFollowing, 
                 isLocked: false, 
                 lockReason: "",
                 isStore,
                 isMyStoreCast,
                 storeName: currentStoreName,
                 storeProfileId: currentStoreProfileId
             };`;

content = content.replace(targetReturn, replaceReturn);

fs.writeFileSync('src/app/[prefecture]/page.tsx', content);
console.log("Timeline cast badge logic patched successfully.");
