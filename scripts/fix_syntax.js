const fs = require('fs');
const file = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const regexCTA = /\) : \(\s*\{\!\(profileRole === "system" \|\| profileRole === "store"\) && \(\<Link href=\{`\/reserve\/\$\{id\}`\} className="premium-btn w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest">\s*<Calendar size=\{18\} className="stroke-\[1\.5\]" \/>\s*このキャストを予約する\s*<\/Link>\)\}\s*\)\}/;

const newCTA = `) : !(profileRole === "system" || profileRole === "store") ? (
            <Link href={\`/reserve/\${id}\`} className="premium-btn w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest">
              <Calendar size={18} className="stroke-[1.5]" />
              このキャストを予約する
            </Link>
          ) : null}`;

content = content.replace(regexCTA, newCTA);

content = content.replace('{/* Auth Prompt Overlay (Glassmorphism) */})', '{/* Auth Prompt Overlay (Glassmorphism) */}');

fs.writeFileSync(file, content);
console.log('Syntax error fixed.');
