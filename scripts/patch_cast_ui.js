const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/app/cast/[id]/page.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Add isNonCastProfile definition
if (!content.includes('const isNonCastProfile =')) {
    content = content.replace(
        '  return (\n    <>',
        "  const isNonCastProfile = profileData.role === 'system' || profileData.role === 'store' || profileData.isAdmin || (profileData.name && (profileData.name.toLowerCase().includes('system') || profileData.name.includes('運営')));\n\n  return (\n    <>"
    );
}

// 2. Hide CAST DATA buttons
content = content.replace(
    /<button onClick=\{\(\) => setShowPreferencesModal\(true\)\} className="px-4 py-1.5 mb-2 border border-\[\#E5E5E5\] text-black bg-white hover:bg-\[\#F9F9F9\] transition-colors flex flex-col items-center justify-center tracking-widest gap-0.5">\s*<span className="text-\[10px\] font-medium leading-none tracking-\[0.1em\]">CAST<\/span>\s*<span className="text-\[8px\] font-bold leading-none tracking-\[0.1em\]">DATA<\/span>\s*<\/button>/g,
    '{!isNonCastProfile && (\n                    <button onClick={() => setShowPreferencesModal(true)} className="px-4 py-1.5 mb-2 border border-[#E5E5E5] text-black bg-white hover:bg-[#F9F9F9] transition-colors flex flex-col items-center justify-center tracking-widest gap-0.5">\n                        <span className="text-[10px] font-medium leading-none tracking-[0.1em]">CAST</span>\n                        <span className="text-[8px] font-bold leading-none tracking-[0.1em]">DATA</span>\n                    </button>\n                )}'
);

// 3. Hide ステータス (Status)
const statusStr = `<div className="flex gap-1 items-center">
                ステータス: 
                <span className="text-black font-medium inline-flex items-center whitespace-nowrap">
                    {cast.status}
                    {profileData.nextAvailableTime && (
                        <span className="text-[10px] ml-1 font-normal text-[#777777]">
                            ({
                                profileData.nextAvailableTime === '待機中' ? '待機中' :
                                profileData.nextAvailableTime.startsWith('次回出勤') ? profileData.nextAvailableTime :
                                \`次回\${profileData.nextAvailableTime}〜\`
                            })
                        </span>
                    )}
                </span>
            </div>`;

if (content.includes(statusStr)) {
    content = content.replace(statusStr, '{!isNonCastProfile && (\n            ' + statusStr.replace(/\n/g, '\n            ') + '\n        )}');
}

// 4. Hide 出勤情報 (Shifts Tab)
const shiftsTabStr = `<button 
             onClick={() => setActiveTab('shifts')}
             className={\`flex-1 py-4 text-[11px] tracking-widest relative transition-colors \${activeTab === 'shifts' ? 'font-bold text-black bg-[#F9F9F9]' : 'font-normal text-[#777777] hover:bg-[#F9F9F9]'}\`}
          >
            出勤情報
            {activeTab === 'shifts' && <div className="absolute top-0 w-full h-[1px] bg-black"></div>}
          </button>`;

if (content.includes(shiftsTabStr)) {
    content = content.replace(shiftsTabStr, '{!isNonCastProfile && (\n          ' + shiftsTabStr.replace(/\n/g, '\n          ') + '\n          )}');
}

// 5. Hide Reserve button
const reserveStr = `) : (
            <Link href={\`/reserve/\${id}\`} className="premium-btn w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest">
               <Calendar size={18} className="stroke-[1.5]" />
               このキャストを予約する
            </Link>
          )}`;

if (content.includes(reserveStr)) {
    content = content.replace(reserveStr, `) : !isNonCastProfile ? (
            <Link href={\`/reserve/\${id}\`} className="premium-btn w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest">
               <Calendar size={18} className="stroke-[1.5]" />
               このキャストを予約する
            </Link>
          ) : null}`);
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully patched src/app/cast/[id]/page.tsx');
