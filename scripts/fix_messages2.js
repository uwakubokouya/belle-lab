const fs = require('fs');
const file = 'src/app/messages/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /const isMatch = messages\.some\(m => m\.content\?\.startsWith\('\[SYSTEM_ACCEPT\]'\)\) \|\| partnerProfile\?\.role === 'store' \|\| partnerProfile\?\.role === 'system';/;

const replacement = "const isMatch = messages.some(m => m.content?.startsWith('[SYSTEM_ACCEPT]')) || partnerProfile?.role === 'store' || partnerProfile?.role === 'system' || user?.role === 'store' || user?.role === 'system';";

content = content.replace(regex, replacement);

fs.writeFileSync(file, content);
console.log('Fixed isMatch condition');
