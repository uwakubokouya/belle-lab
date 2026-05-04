const fs = require('fs');
let content = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8');

// 1. sns_profiles select に cover_url を追加
content = content.replace(/select\('id, name, avatar_url, accepts_dms, phone'\)/g, "select('id, name, avatar_url, cover_url, accepts_dms, phone')");

// 2. ProfileData インターフェースの更新
const profileRegex = /statusText\?: string;[\s\r\n]*_avatarFile\?: File;[\s\r\n]*_coverFile\?: File;[\s\r\n]*}/;
const profileRep = `statusText?: string;
    _avatarFile?: File;
    _coverFile?: File;
    storeName?: string;
    storeId?: string;
  }`;
content = content.replace(profileRegex, profileRep);

// 3. fetchFollowData 内の処理更新
const setDataRegex = /setProfileData\(prev => \(\{[\s\r\n]*\.\.\.prev,[\s\r\n]*name: castName,[\s\r\n]*image: castImg,[\s\r\n]*bio: castBio[\s\r\n]*\}\)\);/;
const setDataRep = `let castCover = profile?.cover_url || storeCast?.cover_url || "";
      
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
content = content.replace(setDataRegex, setDataRep);

// 4. バッジの表示を追加
const renderRegex = /<div className="mb-6">[\s\r\n]*<h1 className="text-2xl font-normal text-black flex items-center gap-2 uppercase tracking-widest mb-4">[\s\r\n]*\{cast\.name \|\| "名称未設定"\}[\s\r\n]*<\/h1>[\s\r\n]*<p className="text-sm text-\[#333333\] whitespace-pre-wrap leading-relaxed font-light">[\s\r\n]*\{cast\.bio \|\| ""\}[\s\r\n]*<\/p>[\s\r\n]*<\/div>/;
const renderRep = `<div className="mb-6">
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
content = content.replace(renderRegex, renderRep);

fs.writeFileSync('src/app/cast/[id]/page.tsx', content);

console.log("Fixes with RegExp applied.");
