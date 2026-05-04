const fs = require('fs');
const file = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\}\n\s*const storeId = storeCast\?\.store_id \|\| 'ef92279f-3f19-47e7-b542-69de5906ab9b';/;

content = content.replace(regex, '}');
fs.writeFileSync(file, content);
console.log('Fixed double storeId');
