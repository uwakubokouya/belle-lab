const fs = require('fs');
const file = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const ctaRegexBad = /\{\!\(profileRole === "system" \|\| profileRole === "store"\) && \((<Link href=\{`\/reserve\/\$\{id\}`\} className="premium-btn w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest">[\s\S]*?このキャストを予約する\s*<\/Link>)\)\}/g;

content = content.replace(ctaRegexBad, `<>{!(profileRole === "system" || profileRole === "store") && ($1)}</>`);

fs.writeFileSync(file, content);
console.log('Fixed Fragment for CTA');
