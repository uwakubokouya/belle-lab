const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/app/cast/[id]/page.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

content = content.replace(
    /\{profileData\.role === 'system'.*?\? \(/,
    "{profileData.role === 'system' || profileData.isAdmin || (profileData.name && (profileData.name.toLowerCase().includes('system') || profileData.name.includes('運営'))) ? ("
);

// Add a console log right above the return statement to debug
if (!content.includes('console.log("DM Modal Render State"')) {
    content = content.replace(
        '  return (\n    <>',
        '  console.log("DM Modal Render State:", { role: profileData.role, isAdmin: profileData.isAdmin, name: profileData.name, acceptsDms: acceptsDms, showDMDisabledModal: showDMDisabledModal });\n  return (\n    <>'
    );
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Condition patched with 運営 and console log.');
