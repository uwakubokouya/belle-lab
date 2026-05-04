const fs = require('fs');
let content = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8');

// 1. sns_profiles select に cover_url を追加
content = content.replace(
  /.select\('id, name, avatar_url, cover_url, accepts_dms, phone'\)/g, 
  `.select('id, name, avatar_url, cover_url, accepts_dms, phone')`
);
content = content.replace(
  /.select\('id, name, avatar_url, accepts_dms, phone'\)/g, 
  `.select('id, name, avatar_url, cover_url, accepts_dms, phone')`
);

// 2. ProfileData に cover, storeName, storeId を追加 (cover は元からあるかもしれないが念のため)
const profileDataTarget = `    statusText?: string;
    _avatarFile?: File;
    _coverFile?: File;
  }`;

const profileDataReplacement = `    statusText?: string;
    _avatarFile?: File;
    _coverFile?: File;
    storeName?: string;
    storeId?: string;
  }`;

if (content.includes(profileDataTarget)) {
    content = content.replace(profileDataTarget, profileDataReplacement);
}

// 3. fetchFollowData 内で cover と storeName を取得してセットする
const setDataTarget = `      let castImg = profile?.avatar_url || storeCast?.profile_image_url || storeCast?.avatar_url || "/images/no-photo.jpg";

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

const setDataReplacement = `      let castImg = profile?.avatar_url || storeCast?.profile_image_url || storeCast?.avatar_url || "/images/no-photo.jpg";

      // 名前のフォールバック
      if (!castName && storeCast) {
          castName = storeCast.name || "";
      }

      let castCover = profile?.cover_url || storeCast?.cover_url || "";
      
      let fetchedStoreName = "";
      let fetchedStoreId = storeCast?.store_id || null;
      if (fetchedStoreId) {
          const { data: storeData } = await supabase.from('profiles').select('full_name, username').eq('store_id', fetchedStoreId).eq('role', 'admin').maybeSingle();
          if (storeData) {
              fetchedStoreName = storeData.full_name || storeData.username || "";
          }
      }

      setProfileData(prev => ({
        ...prev,
        name: castName,
        image: castImg,
        cover: castCover,
        bio: castBio,
        storeName: fetchedStoreName,
        storeId: fetchedStoreId
      }));`;

if (content.includes(setDataTarget)) {
    content = content.replace(setDataTarget, setDataReplacement);
} else {
    // cover_url が既にあるパターン
    const setDataTarget2 = `      let castCover = profile?.cover_url || storeCast?.cover_url || "";
      setProfileData(prev => ({
        ...prev,
        name: castName,
        image: castImg,
        cover: castCover,
        bio: castBio
      }));`;
    if (content.includes(setDataTarget2)) {
        content = content.replace(setDataTarget2, setDataReplacement);
    }
}

// 4. バッジの表示を追加
const renderTarget = `        <div className="mb-6">
            <h1 className="text-2xl font-normal text-black flex items-center gap-2 uppercase tracking-widest mb-4">
                {cast.name || "名称未設定"}
            </h1>
            <p className="text-sm text-[#333333] whitespace-pre-wrap leading-relaxed font-light">
                {cast.bio || ""}
            </p>
        </div>`;

const renderReplacement = `        <div className="mb-6">
            <h1 className="text-2xl font-normal text-black flex items-center gap-2 uppercase tracking-widest mb-2">
                {cast.name || "名称未設定"}
            </h1>
            
            {profileData.storeName && profileData.storeId && (
                <Link 
                  href={\`/store/\${profileData.storeId}\`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F9F9F9] border border-[#E5E5E5] text-[10px] tracking-widest text-black hover:bg-black hover:text-white transition-colors mb-4"
                >
                    {profileData.storeName}
                    <ArrowRight size={10} className="stroke-[1.5]" />
                </Link>
            )}

            <p className="text-sm text-[#333333] whitespace-pre-wrap leading-relaxed font-light">
                {cast.bio || ""}
            </p>
        </div>`;

// 改行コードの違いを吸収して置換する関数
function replaceWithCRLFHandling(content, target, replacement) {
    const regex = new RegExp(target.replace(/[.*+?^$\{\}\(\)\|\[\]\\]/g, '\\$&').replace(/\r?\n/g, '\\r?\\n'), 'g');
    return content.replace(regex, replacement);
}

content = replaceWithCRLFHandling(content, renderTarget, renderReplacement);

fs.writeFileSync('src/app/cast/[id]/page.tsx', content);

console.log("Fixes applied successfully.");
