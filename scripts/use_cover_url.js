const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/app/cast/[id]/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Update Profile (add cover_url)
const updateTarget = `await supabase.from('sns_profiles').update({ 
            name: editForm.name,
            bio: editForm.bio,
            avatar_url: finalAvatarUrl,
        }).eq('id', user.id);`;
const updateReplacement = `await supabase.from('sns_profiles').update({ 
            name: editForm.name,
            bio: editForm.bio,
            avatar_url: finalAvatarUrl,
            cover_url: finalCoverUrl,
        }).eq('id', user.id);`;
content = content.replace(updateTarget, updateReplacement);

// 2. Select cover_url in fetchFollowData (sns_profiles mapping)
const selectTarget1 = `.select('id, name, avatar_url, accepts_dms, phone')`;
const selectReplacement1 = `.select('id, name, avatar_url, cover_url, accepts_dms, phone')`;
content = content.split(selectTarget1).join(selectReplacement1);

// 3. Use profile.cover_url in setProfileData
const profileTarget = `// カバー画像（店舗側のプロフィールに設定されている場合はそれを使う）
      let castCover = storeCast?.cover_url || "";`;
const profileReplacement = `// カバー画像（sns_profiles側に設定されている場合はそれを最優先、無ければ店舗側のプロフィール）
      let castCover = profile?.cover_url || storeCast?.cover_url || "";`;
content = content.replace(profileTarget, profileReplacement);

fs.writeFileSync(pagePath, content, 'utf8');
console.log('Successfully updated page.tsx to use cover_url from sns_profiles');
