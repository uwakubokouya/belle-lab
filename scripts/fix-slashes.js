const fs = require('fs');
let c = fs.readFileSync('src/app/[prefecture]/page.tsx', 'utf8');
c = c.split('\\\\${').join('${');
c = c.split('\\\\`').join('\`');
fs.writeFileSync('src/app/[prefecture]/page.tsx', c);
console.log('Fixed backslashes');
