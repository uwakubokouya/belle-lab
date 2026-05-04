const fs = require('fs');
const content = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes("await supabase.from('sns_profiles').update({")) {
    console.log(i + 1, line.trim());
    console.log(lines.slice(Math.max(0, i-5), i+5).join('\n'));
  }
});
