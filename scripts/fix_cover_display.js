const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/app/cast/[id]/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Fix setProfileData to include cover
const profileTarget = `      setProfileData(prev => ({
        ...prev,
        name: castName,
        image: castImg,
        bio: castBio
      }));`;
const profileReplacement = `      // カバー画像（sns_profiles側に設定されている場合はそれを最優先、無ければ店舗側のプロフィール）
      let castCover = profile?.cover_url || storeCast?.cover_url || "";

      setProfileData(prev => ({
        ...prev,
        name: castName,
        image: castImg,
        cover: castCover,
        bio: castBio
      }));`;
content = content.replace(profileTarget, profileReplacement);

// 2. Hide top bar controls for owner
const topBarTarget = `{/* Top bar controls */}
        <div className="absolute top-0 w-full p-4 flex justify-between items-center z-10">
            <button onClick={() => router.back()} className="bg-white p-2 rounded-none text-black border border-black hover:bg-black hover:text-white transition-colors">`;
const topBarReplacement = `{/* Top bar controls */}
        {!(user?.id === id || user?.id === resolvedCastId) && (
        <div className="absolute top-0 w-full p-4 flex justify-between items-center z-10">
            <button onClick={() => router.back()} className="bg-white p-2 rounded-none text-black border border-black hover:bg-black hover:text-white transition-colors">`;
content = content.replace(topBarTarget, topBarReplacement);

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
content = content.replace(endTopBarTarget, endTopBarReplacement);

fs.writeFileSync(pagePath, content, 'utf8');
console.log('Successfully fixed cover image assignment and top bar visibility');
