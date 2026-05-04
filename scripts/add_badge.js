const fs = require('fs');
const file = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const nameRegex = /(<h1 className="text-2xl font-normal text-black flex items-center gap-2 uppercase tracking-widest mb-4">\s*\{cast\.name \|\| "名称未設定"\}\s*<\/h1>)/;
const replacement = `$1
          {storeInfo && storeInfo.name && (
              <Link href={\`/cast/\${storeInfo.id}\`} className="inline-block mb-4 mt-1">
                  <span className="text-[10px] text-[#777777] bg-[#F9F9F9] border border-[#E5E5E5] px-2 py-0.5 tracking-widest hover:bg-[#E5E5E5] transition-colors">
                      {storeInfo.name}
                  </span>
              </Link>
          )}`;

content = content.replace(nameRegex, replacement);

fs.writeFileSync(file, content);
console.log('Badge added below name');
