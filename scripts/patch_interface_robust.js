const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/app/cast/[id]/page.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// Use a RegExp to match the lines regardless of exact spacing and CRLF
const regex = /_avatarFile\?:\s*File;[\r\n\s]*_coverFile\?:\s*File;[\r\n\s]*\}/g;

if (regex.test(content)) {
    content = content.replace(
        regex,
        '_avatarFile?: File;\n    _coverFile?: File;\n    role?: string;\n    isAdmin?: boolean;\n  }'
    );
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log('Interface successfully updated with role and isAdmin');
} else {
    console.log('Regex did not match!');
    
    // Fallback: find ProfileData and insert
    const lines = content.split(/\r?\n/);
    const newLines = [];
    let insideProfileData = false;
    let injected = false;
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('interface ProfileData {')) {
            insideProfileData = true;
        }
        if (insideProfileData && lines[i].includes('}') && !injected) {
            newLines.push('    role?: string;');
            newLines.push('    isAdmin?: boolean;');
            injected = true;
            insideProfileData = false;
        }
        newLines.push(lines[i]);
    }
    fs.writeFileSync(targetPath, newLines.join('\n'), 'utf8');
    console.log('Fallback: interface updated.');
}
