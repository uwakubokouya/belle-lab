const fs = require('fs');
let text = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8').replace(/\r\n/g, '\n');

function replaceStr(find, replace) {
    let index = text.indexOf(find);
    if (index === -1) {
        console.log("NOT FOUND: \n" + find.substring(0, 80));
        process.exit(1);
    }
    text = text.substring(0, index) + replace + text.substring(index + find.length);
}

// 1. isNonCastProfile
replaceStr(
    "  return (\n    <>",
    "  const isNonCastProfile = profileData.role === 'system' || profileData.role === 'store' || profileData.isAdmin || (profileData.name && (profileData.name.toLowerCase().includes('system') || profileData.name.includes('運営')));\n\n  return (\n    <>"
);

// 2. CAST DATA 1
replaceStr(
    `<button onClick={() => setShowPreferencesModal(true)} className="px-4 py-1.5 mb-2 border border-[#E5E5E5] text-black bg-white hover:bg-[#F9F9F9] transition-colors flex flex-col items-center justify-center tracking-widest gap-0.5">\n                        <span className="text-[10px] font-medium leading-none tracking-[0.1em]">CAST</span>\n                        <span className="text-[8px] font-bold leading-none tracking-[0.1em]">DATA</span>\n                    </button>`,
    `{!isNonCastProfile && (\n                        <button onClick={() => setShowPreferencesModal(true)} className="px-4 py-1.5 mb-2 border border-[#E5E5E5] text-black bg-white hover:bg-[#F9F9F9] transition-colors flex flex-col items-center justify-center tracking-widest gap-0.5">\n                            <span className="text-[10px] font-medium leading-none tracking-[0.1em]">CAST</span>\n                            <span className="text-[8px] font-bold leading-none tracking-[0.1em]">DATA</span>\n                        </button>\n                    )}`
);

// 3. CAST DATA 2
replaceStr(
    `<button onClick={() => setShowPreferencesModal(true)} className="px-4 py-1.5 mb-2 border border-[#E5E5E5] text-black bg-white hover:bg-[#F9F9F9] transition-colors flex flex-col items-center justify-center tracking-widest gap-0.5">\n                        <span className="text-[10px] font-medium leading-none tracking-[0.1em]">CAST</span>\n                        <span className="text-[8px] font-bold leading-none tracking-[0.1em]">DATA</span>\n                    </button>`,
    `{!isNonCastProfile && (\n                        <button onClick={() => setShowPreferencesModal(true)} className="px-4 py-1.5 mb-2 border border-[#E5E5E5] text-black bg-white hover:bg-[#F9F9F9] transition-colors flex flex-col items-center justify-center tracking-widest gap-0.5">\n                            <span className="text-[10px] font-medium leading-none tracking-[0.1em]">CAST</span>\n                            <span className="text-[8px] font-bold leading-none tracking-[0.1em]">DATA</span>\n                        </button>\n                    )}`
);

// 4. Status
replaceStr(
    `            <div className="flex gap-1 items-center">\n                ステータス: \n                <span className="text-black font-medium inline-flex items-center whitespace-nowrap">\n                    {cast.status}\n                    {profileData.nextAvailableTime && (\n                        <span className="text-[10px] ml-1 font-normal text-[#777777]">\n                            ({\n                                profileData.nextAvailableTime === '待機中' ? '待機中' :\n                                profileData.nextAvailableTime.startsWith('次回出勤') ? profileData.nextAvailableTime :\n                                \`次回\${profileData.nextAvailableTime}〜\`\n                            })\n                        </span>\n                    )}\n                </span>\n            </div>`,
    `            {!isNonCastProfile && (\n                <div className="flex gap-1 items-center">\n                    ステータス: \n                    <span className="text-black font-medium inline-flex items-center whitespace-nowrap">\n                        {cast.status}\n                        {profileData.nextAvailableTime && (\n                            <span className="text-[10px] ml-1 font-normal text-[#777777]">\n                                ({\n                                    profileData.nextAvailableTime === '待機中' ? '待機中' :\n                                    profileData.nextAvailableTime.startsWith('次回出勤') ? profileData.nextAvailableTime :\n                                    \`次回\${profileData.nextAvailableTime}〜\`\n                                })\n                            </span>\n                        )}\n                    </span>\n                </div>\n            )}`
);

// 5. Shifts Tab
replaceStr(
    `          <button \n             onClick={() => setActiveTab('shifts')}\n             className={\`flex-1 py-4 text-[11px] tracking-widest relative transition-colors \${activeTab === 'shifts' ? 'font-bold text-black bg-[#F9F9F9]' : 'font-normal text-[#777777] hover:bg-[#F9F9F9]'}\`}\n          >\n            出勤情報\n            {activeTab === 'shifts' && <div className="absolute top-0 w-full h-[1px] bg-black"></div>}\n          </button>`,
    `          {!isNonCastProfile && (\n              <button \n                 onClick={() => setActiveTab('shifts')}\n                 className={\`flex-1 py-4 text-[11px] tracking-widest relative transition-colors \${activeTab === 'shifts' ? 'font-bold text-black bg-[#F9F9F9]' : 'font-normal text-[#777777] hover:bg-[#F9F9F9]'}\`}\n              >\n                出勤情報\n                {activeTab === 'shifts' && <div className="absolute top-0 w-full h-[1px] bg-black"></div>}\n              </button>\n          )}`
);

// 6. Reserve Button
replaceStr(
    `          ) : (\n            <Link href={\`/reserve/\${id}\`} className="premium-btn w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest">\n               <Calendar size={18} className="stroke-[1.5]" />\n               このキャストを予約する\n            </Link>\n          )}`,
    `          ) : !isNonCastProfile ? (\n            <Link href={\`/reserve/\${id}\`} className="premium-btn w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest">\n               <Calendar size={18} className="stroke-[1.5]" />\n               このキャストを予約する\n            </Link>\n          ) : null}`
);

fs.writeFileSync('src/app/cast/[id]/page.tsx', text, 'utf8');
console.log("Success");
