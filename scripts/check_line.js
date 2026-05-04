const fs = require('fs');
const content = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('名称未設定')) {
    console.log(lines.slice(i-2, i+6).join('\n'));
  }
});
