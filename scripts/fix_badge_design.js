const fs = require('fs');
const file = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. storeInfo のセット部分の修正
const regex1 = /setStoreInfo\(\{ id: linkId, name: storeProfile\.full_name \|\| "公式" \}\);/;
const replacement1 = `setStoreInfo({ id: linkId, name: storeProfile.full_name || storeProfile.username || "" });`;
content = content.replace(regex1, replacement1);

// 2. バッジの表示部分の修正
const regex2 = /<Link href=\{\`\/cast\/\$\{storeInfo\.id\}\`\} className="inline-flex items-center gap-1 px-2\.5 py-1 border border-black text-black text-\[10px\] tracking-widest mb-4 hover:bg-black hover:text-white transition-colors">\s*\{storeInfo\.name\} 公式\s*<\/Link>/;
const replacement2 = `<Link href={\`/cast/\${storeInfo.id}\`} className="inline-block mb-4">
                    <span className="text-[10px] text-[#777777] bg-[#F9F9F9] border border-[#E5E5E5] px-2 py-0.5 tracking-widest hover:bg-[#E5E5E5] transition-colors">
                        {storeInfo.name}
                    </span>
                </Link>`;
content = content.replace(regex2, replacement2);

fs.writeFileSync(file, content);
console.log('Fixed badge design and name');
