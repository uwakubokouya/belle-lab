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

// --- 4. Custom Header & Remove E-GIRLS ---
const headerTarget = `      {/* Header / Cover */}
      <div 
        className={\`relative h-56 bg-[#F9F9F9] border-b border-[#E5E5E5] flex items-center justify-center overflow-hidden \${cast.cover ? 'cursor-pointer' : ''}\`}
        onClick={() => {
            if (cast.cover) setFullscreenImage(cast.cover);
        }}
      >
        {cast.cover ? (
           /* eslint-disable-next-line @next/next/no-img-element */
           <img src={cast.cover} alt="Cover" className="w-full h-full object-cover opacity-50 mix-blend-overlay" />
        ) : (
           <div className="w-full h-full bg-[#E5E5E5] opacity-20"></div>
        )}
        
        {/* Typography over cover */}
        <div className="absolute inset-0 flex items-center justify-center text-center">
             <h1 className="text-4xl font-light tracking-[0.3em] uppercase text-black/20 mix-blend-overlay">E-GIRLS</h1>
        </div>

        {/* Top bar controls */}
        <div className="absolute top-0 w-full p-4 flex justify-between items-center z-10">`;

const headerReplacement = `      {/* Custom Header for cast owner */}
      {(user?.id === id || user?.id === resolvedCastId) && (
        <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] px-6 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/images/logo2.png" alt="HimeMatch" className="h-16 object-contain" />
          </div>
          <button 
            onClick={() => {
              if (logout) {
                logout();
              } else {
                router.push('/login');
              }
            }}
            className="text-[10px] font-medium tracking-widest border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors"
          >
            LOGOUT
          </button>
        </header>
      )}

      {/* Header / Cover */}
      <div 
        className={\`relative h-56 bg-[#F9F9F9] border-b border-[#E5E5E5] flex items-center justify-center overflow-hidden \${cast.cover ? 'cursor-pointer' : ''}\`}
        onClick={() => {
            if (cast.cover) setFullscreenImage(cast.cover);
        }}
      >
        {cast.cover ? (
           /* eslint-disable-next-line @next/next/no-img-element */
           <img src={cast.cover} alt="Cover" className="absolute inset-0 w-full h-full object-cover z-0" />
        ) : (
           <div className="absolute inset-0 w-full h-full bg-[#E5E5E5] opacity-20 z-0"></div>
        )}

        {/* Top bar controls */}
        {!(user?.id === id || user?.id === resolvedCastId) && (
        <div className="absolute top-0 w-full p-4 flex justify-between items-center z-10">`;

if (content.includes(headerTarget)) {
    content = content.replace(headerTarget, headerReplacement);
}

// --- 5. Close the conditional Top bar controls ---
const endTopBarTarget = `                </button>
            </div>
        </div>
      </div>

      {/* Profile Info */}`;
const endTopBarReplacement = `                </button>
            </div>
        </div>
        )}
      </div>

      {/* Profile Info */}`;
if (content.includes(endTopBarTarget)) {
    content = content.replace(endTopBarTarget, endTopBarReplacement);
}

fs.writeFileSync(pagePath, content, 'utf8');
console.log('Final fix applied successfully.');
