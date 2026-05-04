const fs = require('fs');

let lines = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8').split(/\r?\n/);

let c1=-1, c2=-1, s1=-1, s2=-1, t1=-1, t2=-1, r1=-1, r2=-1, b1=-1, b2=-1;

// 1. Find isNonCastProfile index and remove it if it exists
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const isNonCastProfile =')) {
        lines.splice(i, 1);
        i--;
    }
}

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('  return (') && lines[i+1] && lines[i+1].includes('<>')) {
        lines.splice(i, 0, "  const isNonCastProfile = profileData.name && (profileData.name.toLowerCase().includes('system') || profileData.name.includes('運営'));", "");
        break;
    }
}

// Write back
fs.writeFileSync('src/app/cast/[id]/page.tsx', lines.join('\n'), 'utf8');
console.log("Fixed isNonCastProfile");
