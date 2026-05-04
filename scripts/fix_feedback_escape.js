const fs = require('fs');
let c = fs.readFileSync('src/app/admin/feedback/page.tsx', 'utf-8');
c = c.replace(/\\`/g, '`').replace(/\\\$/g, '$');
c = c.replace(/\\\\n/g, '\\n');
fs.writeFileSync('src/app/admin/feedback/page.tsx', c, 'utf-8');
console.log('Fixed.');
