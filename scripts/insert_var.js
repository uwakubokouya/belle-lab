const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/app/cast/[id]/page.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

if (!content.includes('const isNonCastProfile =')) {
    content = content.replace(
        /const galleryItems = [^;]+;/,
        match => `${match}\n\n  const isNonCastProfile = profileData.role === 'system' || profileData.role === 'store' || profileData.isAdmin || (profileData.name && (profileData.name.toLowerCase().includes('system') || profileData.name.includes('運営')));`
    );
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Inserted isNonCastProfile variable');
