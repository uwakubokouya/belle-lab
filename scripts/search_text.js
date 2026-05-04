const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/app/cast/[id]/page.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

const lines = content.split(/\r?\n/);
lines.forEach((line, index) => {
    if (line.includes('ステータス:')) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
    }
});
