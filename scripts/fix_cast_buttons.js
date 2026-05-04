const fs = require('fs');
const file = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// CAST DATA ボタンの非表示化
content = content.replace(
  /<button onClick=\{\(\) => setShowPreferencesModal\(true\)\} className="px-4 py-1.5 mb-2 border border-\[#E5E5E5\] text-black bg-white hover:bg-\[#F9F9F9\] transition-colors flex flex-col items-center justify-center tracking-widest gap-0\.5\">\s*<span className="text-\[10px\] font-medium leading-none tracking-\[0\.1em\]">CAST<\/span>\s*<span className="text-\[8px\] font-bold leading-none tracking-\[0\.1em\]">DATA<\/span>\s*<\/button>/g,
  '{!isPlatformAdmin && (<button onClick={() => setShowPreferencesModal(true)} className="px-4 py-1.5 mb-2 border border-[#E5E5E5] text-black bg-white hover:bg-[#F9F9F9] transition-colors flex flex-col items-center justify-center tracking-widest gap-0.5"><span className="text-[10px] font-medium leading-none tracking-[0.1em]">CAST</span><span className="text-[8px] font-bold leading-none tracking-[0.1em]">DATA</span></button>)}'
);

// 予約ボタンの非表示化
content = content.replace(
  /\) : \(\s*<Link href=\{\`\/reserve\/\$\{id\}\`\} className="premium-btn w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest\">\s*<Calendar size=\{18\} className="stroke-\[1\.5\]" \/>\s*このキャストを予約する\s*<\/Link>\s*\)\}/g,
  ') : !isPlatformAdmin ? ( <Link href={`/reserve/${id}`} className="premium-btn w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest"><Calendar size={18} className="stroke-[1.5]" />このキャストを予約する</Link> ) : null}'
);

fs.writeFileSync(file, content);
console.log('Fixed');
