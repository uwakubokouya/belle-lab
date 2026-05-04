const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/app/cast/[id]/page.tsx');
const lines = fs.readFileSync(targetPath, 'utf8').split(/\r?\n/);

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('return (') || line.includes('CAST DATA') || line.includes('ステータス') || line.includes('出勤情報') || line.includes('このキャストを予約する') || line.includes('galleryItems')) {
        console.log(`Line ${i + 1}: ${line.trim()}`);
    }
}
