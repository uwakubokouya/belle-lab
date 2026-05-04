const fs = require('fs');

let lines = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8').split(/\r?\n/);

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('setProfileData(prev => ({') && lines[i+2].includes('name: castName,')) {
        // We found the block
        // find bio: castBio
        let j = i;
        while (!lines[j].includes('bio: castBio')) j++;
        lines[j] = lines[j].replace('bio: castBio', 'bio: castBio,');
        lines.splice(j + 1, 0, "        role: profile?.role,", "        isAdmin: profile?.is_admin");
        break;
    }
}

fs.writeFileSync('src/app/cast/[id]/page.tsx', lines.join('\n'), 'utf8');
console.log('Done role insertion');
