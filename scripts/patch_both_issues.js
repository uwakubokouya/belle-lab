const fs = require('fs');
let content = fs.readFileSync('src/app/[prefecture]/page.tsx', 'utf-8');

// 1. officialSnsIdsToFetch の修正
const targetOfficial = `    let officialSnsIdsToFetch: string[] = [];
    if (user?.id) {
        officialSnsIdsToFetch = storeAccountIds.filter(id => followingIds.has(id));
    } else {
        officialSnsIdsToFetch = storeAccountIds;
    }`;

const replaceOfficial = `    let officialSnsIdsToFetch: string[] = [];
    if (user?.id) {
        officialSnsIdsToFetch = storeAccountIds.filter(id => {
            return followingIds.has(id) || id === user.id;
        });
    } else {
        officialSnsIdsToFetch = storeAccountIds;
    }`;

if (content.includes(targetOfficial)) {
    content = content.replace(targetOfficial, replaceOfficial);
}

// 2. バッジのロジックを確実にするためにもう一度書き直す（ログも出すように）
const targetReturnStr = content.substring(
    content.indexOf('const type = post.post_type || "全員";'),
    content.indexOf('if (type === "会員" && !user) {')
).trim();

const replaceReturnStr = `const type = post.post_type || "全員";
            const isStore = storeAccountIds.includes(post.cast_id);
            
            let currentStoreName = adminProfile?.name || "公式";
            let currentStoreProfileId = adminProfile?.id;

            if (isStore) {
                currentStoreName = post.sns_profiles?.name || "公式";
                currentStoreProfileId = post.cast_id;
            } else if (matchedStoreCast) {
                // キャストの所属店舗の store_id
                const sId = matchedStoreCast.store_id;
                const storeProfile = storeProfileMap.get(sId);
                
                if (storeProfile) {
                    currentStoreName = storeProfile.full_name || storeProfile.username || "公式";
                    if (snsStoreMap.has(storeProfile.username)) {
                        currentStoreProfileId = snsStoreMap.get(storeProfile.username).id;
                    } else {
                        // フォールバック
                        currentStoreProfileId = storeProfile.id; 
                    }
                } else {
                    // もし storeProfileMap に見つからなかった場合、ログに出力して原因調査
                    console.log("[DEBUG] Store profile not found for cast:", matchedStoreCast.login_id, "store_id:", sId);
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
            };
            
            `;

if (content.includes(targetReturnStr)) {
    content = content.replace(targetReturnStr, replaceReturnStr);
}

fs.writeFileSync('src/app/[prefecture]/page.tsx', content);
console.log("Both issues patched.");
