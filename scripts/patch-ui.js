const fs = require('fs');
const path = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. DM Button
content = content.replace(
  /if \(!acceptsDms\) \{/g,
  'if (!acceptsDms && !isStoreProfile) {'
);

// 2. CAST DATA
content = content.replace(
  /<button onClick=\{\(\) => setShowPreferencesModal\(true\)\} className="px-4 py-1\.5 mb-2 border border-\[#E5E5E5\] text-black bg-white hover:bg-\[#F9F9F9\] transition-colors flex flex-col items-center justify-center tracking-widest gap-0\.5">\s*<span className="text-\[10px\] font-medium leading-none tracking-\[0\.1em\]">CAST<\/span>\s*<span className="text-\[8px\] font-bold leading-none tracking-\[0\.1em\]">DATA<\/span>\s*<\/button>/g,
  '{!isStoreProfile && (\n<button onClick={() => setShowPreferencesModal(true)} className="px-4 py-1.5 mb-2 border border-[#E5E5E5] text-black bg-white hover:bg-[#F9F9F9] transition-colors flex flex-col items-center justify-center tracking-widest gap-0.5">\n<span className="text-[10px] font-medium leading-none tracking-[0.1em]">CAST</span>\n<span className="text-[8px] font-bold leading-none tracking-[0.1em]">DATA</span>\n</button>\n)}'
);

// 3. Shifts Tab
content = content.replace(
  /<button \s*onClick=\{\(\) => setActiveTab\('shifts'\)\}\s*className=\{`flex-1 py-4 text-\[11px\] tracking-widest relative transition-colors \$\{activeTab === 'shifts' \? 'font-bold text-black bg-\[#F9F9F9\]' : 'font-normal text-\[#777777\] hover:bg-\[#F9F9F9\]'\}`\}\s*>\s*出勤情報\s*\{activeTab === 'shifts' && <div className="absolute top-0 w-full h-\[1px\] bg-black"><\/div>\}\s*<\/button>/g,
  '{!isStoreProfile && (\n<button onClick={() => setActiveTab(\'shifts\')} className={`flex-1 py-4 text-[11px] tracking-widest relative transition-colors ${activeTab === \'shifts\' ? \'font-bold text-black bg-[#F9F9F9]\' : \'font-normal text-[#777777] hover:bg-[#F9F9F9]\'}`}>\n出勤情報\n{activeTab === \'shifts\' && <div className="absolute top-0 w-full h-[1px] bg-black"></div>}\n</button>\n)}'
);

// 4. Reserve Button
const reserveRegex = /<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-\[#E5E5E5\] p-4 flex justify-center pb-24 z-40 max-w-md mx-auto">([\s\S]*?)<\/div>/;
const match = content.match(reserveRegex);
if (match) {
    content = content.replace(reserveRegex, '{!isStoreProfile && (\n<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E5E5] p-4 flex justify-center pb-24 z-40 max-w-md mx-auto">' + match[1] + '</div>\n)}');
}

fs.writeFileSync(path, content, 'utf8');
console.log("Patch applied");
