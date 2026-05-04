const fs = require('fs');
const content = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes("activeTab === 'shifts' ? (")) {
    console.log(i + 1, line.trim());
  }
});
