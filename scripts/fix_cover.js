const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/app/cast/[id]/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. absoluteの復元
const imgTarget = `<img src={cast.cover} alt="Cover" className="w-full h-full object-cover" />`;
const divTarget = `<div className="w-full h-full bg-[#E5E5E5] opacity-20"></div>`;

content = content.replace(imgTarget, `<img src={cast.cover} alt="Cover" className="absolute inset-0 w-full h-full object-cover z-0" />`);
content = content.replace(divTarget, `<div className="absolute inset-0 w-full h-full bg-[#E5E5E5] opacity-20 z-0"></div>`);

// 2. setProfileData の修正 (cover_url)
const profileTarget = `      setProfileData(prev => ({
        ...prev,
        name: castName,
        image: castImg,
        bio: castBio
      }));`;

const profileReplacement = `      // カバー画像（店舗側のプロフィールに設定されている場合はそれを使う）
      let castCover = storeCast?.cover_url || "";

      setProfileData(prev => ({
        ...prev,
        name: castName,
        image: castImg,
        cover: castCover,
        bio: castBio
      }));`;

content = content.replace(profileTarget, profileReplacement);

fs.writeFileSync(pagePath, content, 'utf8');
console.log('Cover image fix applied');
