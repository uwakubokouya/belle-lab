const fs = require('fs');
let lines = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8').split(/\r?\n/);

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const isNonCastProfile =')) {
        lines[i] = "  const isNonCastProfile = profileData.role === 'system' || profileData.role === 'store';";
        break;
    }
}

fs.writeFileSync('src/app/cast/[id]/page.tsx', lines.join('\n'), 'utf8');
console.log('Done');
