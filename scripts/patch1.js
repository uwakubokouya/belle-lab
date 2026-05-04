const fs = require('fs');

let lines = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8').split(/\r?\n/);

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('    _coverFile?: File;')) {
        if (lines[i+1] && lines[i+1].includes('  }')) {
            lines.splice(i+1, 0, '    storeName?: string;', '    storeId?: string;', '    storeProfileId?: string;', '    isAdmin?: boolean;');
            console.log("ProfileData updated");
            break;
        }
    }
}

fs.writeFileSync('src/app/cast/[id]/page.tsx', lines.join('\n'));
