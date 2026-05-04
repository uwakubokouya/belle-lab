const fs = require('fs');

let content = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8');

const target1 = `      setProfileData(prev => ({
        ...prev,
        name: castName,
        image: castImg,
        bio: castBio
      }));`;

const replacement1 = `      let castCover = profile?.cover_url || storeCast?.cover_url || "";
      
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

const target2 = `.select('id, name, avatar_url, accepts_dms, phone')`;
const replacement2 = `.select('id, name, avatar_url, cover_url, accepts_dms, phone')`;

const target3 = `        <div className="mb-6">
            <h1 className="text-2xl font-normal text-black flex items-center gap-2 uppercase tracking-widest mb-4">
                {cast.name || "名称未設定"}
            </h1>
            <p className="text-sm text-[#333333] whitespace-pre-wrap leading-relaxed font-light">
                {cast.bio || ""}
            </p>
        </div>`;

const replacement3 = `        <div className="mb-6">
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

function replaceWithCRLFHandling(content, target, replacement) {
    const regex = new RegExp(target.replace(/[.*+?^$\{\}\(\)\|\[\]\\]/g, '\\$&').replace(/\r?\n/g, '\\r?\\n'), 'g');
    return content.replace(regex, replacement);
}

content = replaceWithCRLFHandling(content, target1, replacement1);
content = content.replace(target2, replacement2);
content = replaceWithCRLFHandling(content, target3, replacement3);

fs.writeFileSync('src/app/cast/[id]/page.tsx', content);

console.log("Script 2 done.");
