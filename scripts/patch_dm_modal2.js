const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/app/cast/[id]/page.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

content = content.replace(
    "{profileData.role === 'system' ? (",
    "{profileData.role === 'system' || profileData.isAdmin || (profileData.name && profileData.name.toLowerCase().includes('system')) ? ("
);

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Condition patched successfully.');
