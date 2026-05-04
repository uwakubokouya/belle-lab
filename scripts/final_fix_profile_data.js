const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/app/cast/[id]/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// replace setProfileData assignment
const regex = /setProfileData\(prev => \(\{\s*\.\.\.prev,\s*name: castName,\s*image: castImg,\s*bio: castBio\s*\}\)\);/g;
const replacement = `let castCover = profile?.cover_url || storeCast?.cover_url || "";
      setProfileData(prev => ({
        ...prev,
        name: castName,
        image: castImg,
        cover: castCover,
        bio: castBio
      }));`;

content = content.replace(regex, replacement);

fs.writeFileSync(pagePath, content, 'utf8');
console.log('Successfully added cover logic to setProfileData.');
