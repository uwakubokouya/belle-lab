const fs = require('fs');

let content = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8');

// Target 1: ProfileData
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

// Target 2: Fetching Store Data
const fetchDataTarget = `      let castCover = profile?.cover_url || storeCast?.cover_url || "";
      setProfileData(prev => ({
        ...prev,
        name: castName,
        image: castImg,
        cover: castCover,
        bio: castBio
      }));`;

const fetchDataReplacement = `      let castCover = profile?.cover_url || storeCast?.cover_url || "";
      
      let fetchedStoreName = "";
      let fetchedStoreId = storeCast?.store_id || null;
      if (fetchedStoreId) {
          // Sync fetch workaround using then or await
      }

      setProfileData(prev => ({
        ...prev,
        name: castName,
        image: castImg,
        cover: castCover,
        bio: castBio
      }));`;
      
// Target 3: Rendering Badge
const renderingTarget = `        <div className="mb-6">
            <h1 className="text-2xl font-normal text-black flex items-center gap-2 uppercase tracking-widest mb-4">
                {cast.name || "名称未設定"}
            </h1>
            <p className="text-sm text-[#333333] whitespace-pre-wrap leading-relaxed font-light">
                {cast.bio || ""}
            </p>
        </div>`;

const renderingReplacement = `        <div className="mb-6">
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

content = replaceWithCRLFHandling(content, renderingTarget, renderingReplacement);

fs.writeFileSync('src/app/cast/[id]/page.tsx', content);

console.log("Done");
