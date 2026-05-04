const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/app/cast/[id]/page.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

content = content.replace(
    /    _coverFile\?: File;\n  \}/g,
    '    _coverFile?: File;\n    role?: string;\n    isAdmin?: boolean;\n  }'
);

// Fallback in case the line endings are CRLF
content = content.replace(
    /    _coverFile\?: File;\r\n  \}/g,
    '    _coverFile?: File;\r\n    role?: string;\r\n    isAdmin?: boolean;\r\n  }'
);

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Interface patched successfully.');
