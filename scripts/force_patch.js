const fs = require('fs');
let content = fs.readFileSync('src/app/[prefecture]/page.tsx', 'utf-8');

const targetStr = content.substring(
    content.indexOf('const type = post.post_type || "全員";'),
    content.indexOf('if (type === "会員" && !user) {')
).trim();

const replaceStr = `const type = post.post_type || "全員";
            const isStore = storeAccountIds.includes(post.cast_id);
            
            let currentStoreName = adminProfile?.name || "公式";
            let currentStoreProfileId = adminProfile?.id;

            if (isStore) {
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

content = content.replace(targetStr, replaceStr);

fs.writeFileSync('src/app/[prefecture]/page.tsx', content);
console.log("Forced replacement successful.");
