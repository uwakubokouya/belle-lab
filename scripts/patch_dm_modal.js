const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/app/cast/[id]/page.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Add role to ProfileData
content = content.replace(
    /_avatarFile\?: File;\r?\n\s*_coverFile\?: File;\r?\n\s*\}/g,
    '_avatarFile?: File;\n    _coverFile?: File;\n    role?: string;\n  }'
);

// 2. Fetch role from sns_profiles (first occurrence)
content = content.replace(
    /\.select\('id, name, avatar_url, accepts_dms, phone'\)/g,
    ".select('id, name, avatar_url, accepts_dms, phone, role')"
);

// 3. Set role in setProfileData
content = content.replace(
    /name: castName,\r?\n\s*image: castImg,\r?\n\s*bio: castBio\r?\n\s*\}\)\);/g,
    "name: castName,\n        image: castImg,\n        bio: castBio,\n        role: profile?.role || ''\n      }));"
);

// 4. Update the DM Disabled Modal Overlay text
content = content.replace(
  /<p className="text-xs text-\[#333333\] leading-relaxed mb-8 bg-\[#F9F9F9\] p-4 text-center">[\s\S]*?このキャストは現在DM機能が有効ではありません。[\s\S]*?<\/p>/,
  `<div className="text-xs text-[#333333] leading-relaxed mb-8 bg-[#F9F9F9] p-4 text-center w-full">
              {profileData.role === 'system' ? (
                <>
                  運営へのご意見やご要望につきましては、メニュータブ内の「ご意見」フォームよりお寄せいただけますと幸いです。<br/>
                  皆様からのお声を参考に、より良いサービス作りに努めてまいります。
                </>
              ) : (
                <>このキャストは現在DM機能が有効ではありません。</>
              )}
            </div>`
);

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Patch applied successfully.');
