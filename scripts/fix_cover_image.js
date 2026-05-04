const fs = require('fs');

let lines = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8').split(/\r?\n/);

let changes = 0;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(".select('id, name, avatar_url, accepts_dms, phone, role, is_admin')")) {
        lines[i] = lines[i].replace(
            ".select('id, name, avatar_url, accepts_dms, phone, role, is_admin')",
            ".select('id, name, avatar_url, cover_url, accepts_dms, phone, role, is_admin')"
        );
        console.log("Added cover_url to select at line", i + 1);
        changes++;
    }
}

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('storeProfileId: sProfileId')) {
        lines[i] = lines[i] + ',';
        lines.splice(i+1, 0, '        cover: profile?.cover_url || ""');
        console.log("Added cover: profile?.cover_url to setProfileData at line", i + 1);
        changes++;
        break;
    }
}

if (changes > 0) {
    fs.writeFileSync('src/app/cast/[id]/page.tsx', lines.join('\n'), 'utf8');
    console.log('Done fix cover image');
} else {
    console.log('No changes made');
}
