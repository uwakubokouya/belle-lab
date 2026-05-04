const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/app/cast/[id]/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// --- 1. Update Profile (add cover_url) ---
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
if (content.includes(updateTarget)) {
    content = content.replace(updateTarget, updateReplacement);
}

// --- 2. Select cover_url ---
const selectTarget = `.select('id, name, avatar_url, accepts_dms, phone')`;
const selectReplacement = `.select('id, name, avatar_url, cover_url, accepts_dms, phone')`;
content = content.split(selectTarget).join(selectReplacement);

// --- 3. Use profile.cover_url in setProfileData ---
const profileTarget = `      // 画像は「四角いSNSアイコン」側を最優先し、無ければ店舗の公式写真（casts）、それでも無ければデフォルト
      let castImg = profile?.avatar_url || storeCast?.profile_image_url || storeCast?.avatar_url || "/images/no-photo.jpg";

      // 名前のフォールバック
      if (!castName && storeCast) {
          castName = storeCast.name || "";
      }

      setProfileData(prev => ({
        ...prev,
        name: castName,
        image: castImg,
        bio: castBio
      }));`;

const profileReplacementText = `      // 画像は「四角いSNSアイコン」側を最優先し、無ければ店舗の公式写真（casts）、それでも無ければデフォルト
      let castImg = profile?.avatar_url || storeCast?.profile_image_url || storeCast?.avatar_url || "/images/no-photo.jpg";

      // カバー画像（sns_profiles側に設定されている場合はそれを最優先、無ければ店舗側のプロフィール）
      let castCover = profile?.cover_url || storeCast?.cover_url || "";

      // 名前のフォールバック
      if (!castName && storeCast) {
          castName = storeCast.name || "";
      }

      setProfileData(prev => ({
        ...prev,
        name: castName,
        image: castImg,
        cover: castCover,
        bio: castBio
      }));`;
if (content.includes(profileTarget)) {
    content = content.replace(profileTarget, profileReplacementText);
}

fs.writeFileSync(pagePath, content, 'utf8');
console.log('Successfully added cover_url DB mapping and setProfileData assignment.');
