const fs = require('fs');

const targetPath = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(targetPath, 'utf8');

// 1. isNonCastProfile
let search1 = /const galleryItems = posts\.flatMap\(post =>[\s\S]*?\(post\.images \|\| \[\]\)\.map\(\(imgUrl: string\) => \(\{ imgUrl, post \}\)\)\s*\);\s*return \(\s*<>/;
let replace1 = `const galleryItems = posts.flatMap(post => 
      (post.images || []).map((imgUrl: string) => ({ imgUrl, post }))
  );

  const isNonCastProfile = profileData.role === 'system' || profileData.role === 'store' || profileData.isAdmin || (profileData.name && (profileData.name.toLowerCase().includes('system') || profileData.name.includes('運営')));

  return (
    <>`;
if (search1.test(content)) {
    content = content.replace(search1, replace1);
    console.log('Replaced 1');
} else { console.log('Failed 1'); }

// 2. CAST DATA 1
let search2 = /\{user\?\.id === id \? \([\s\S]*?<div className="flex gap-2">[\s\S]*?<button onClick=\{\(\) => setShowPreferencesModal\(true\)\} className="px-4 py-1\.5 mb-2 border border-\[\#E5E5E5\] text-black bg-white hover:bg-\[\#F9F9F9\] transition-colors flex flex-col items-center justify-center tracking-widest gap-0\.5">[\s\S]*?<span className="text-\[10px\] font-medium leading-none tracking-\[0\.1em\]">CAST<\/span>[\s\S]*?<span className="text-\[8px\] font-bold leading-none tracking-\[0\.1em\]">DATA<\/span>[\s\S]*?<\/button>[\s\S]*?<button onClick=\{\(\) => setIsEditingProfile\(true\)\} className="px-6 py-2 text-\[11px\] mb-2 font-medium tracking-widest transition-colors premium-btn-outline">[\s\S]*?設定・編集[\s\S]*?<\/button>[\s\S]*?<\/div>[\s\S]*?\) : \(/;
let replace2 = `{user?.id === id ? (
                <div className="flex gap-2">
                    {!isNonCastProfile && (
                        <button onClick={() => setShowPreferencesModal(true)} className="px-4 py-1.5 mb-2 border border-[#E5E5E5] text-black bg-white hover:bg-[#F9F9F9] transition-colors flex flex-col items-center justify-center tracking-widest gap-0.5">
                            <span className="text-[10px] font-medium leading-none tracking-[0.1em]">CAST</span>
                            <span className="text-[8px] font-bold leading-none tracking-[0.1em]">DATA</span>
                        </button>
                    )}
                    <button onClick={() => setIsEditingProfile(true)} className="px-6 py-2 text-[11px] mb-2 font-medium tracking-widest transition-colors premium-btn-outline">
                        設定・編集
                    </button>
                </div>
            ) : (`;
if (search2.test(content)) {
    content = content.replace(search2, replace2);
    console.log('Replaced 2');
} else { console.log('Failed 2'); }

// 3. CAST DATA 2
let search3 = /\) : \([\s\S]*?<div className="flex gap-2">[\s\S]*?<button onClick=\{\(\) => setShowPreferencesModal\(true\)\} className="px-4 py-1\.5 mb-2 border border-\[\#E5E5E5\] text-black bg-white hover:bg-\[\#F9F9F9\] transition-colors flex flex-col items-center justify-center tracking-widest gap-0\.5">[\s\S]*?<span className="text-\[10px\] font-medium leading-none tracking-\[0\.1em\]">CAST<\/span>[\s\S]*?<span className="text-\[8px\] font-bold leading-none tracking-\[0\.1em\]">DATA<\/span>[\s\S]*?<\/button>[\s\S]*?<button\s*onClick=\{handleFollow\}/;
let replace3 = `) : (
                <div className="flex gap-2">
                    {!isNonCastProfile && (
                        <button onClick={() => setShowPreferencesModal(true)} className="px-4 py-1.5 mb-2 border border-[#E5E5E5] text-black bg-white hover:bg-[#F9F9F9] transition-colors flex flex-col items-center justify-center tracking-widest gap-0.5">
                            <span className="text-[10px] font-medium leading-none tracking-[0.1em]">CAST</span>
                            <span className="text-[8px] font-bold leading-none tracking-[0.1em]">DATA</span>
                        </button>
                    )}
                    <button 
                      onClick={handleFollow}`;
if (search3.test(content)) {
    content = content.replace(search3, replace3);
    console.log('Replaced 3');
} else { console.log('Failed 3'); }

// 4. Status
let search4 = /<div className="flex gap-1 items-center">[\s\S]*?ステータス:[\s\S]*?<span className="text-black font-medium inline-flex items-center whitespace-nowrap">[\s\S]*?\{cast\.status\}[\s\S]*?\{profileData\.nextAvailableTime && \([\s\S]*?<span className="text-\[10px\] ml-1 font-normal text-\[\#777777\]">[\s\S]*?\(\{[\s\S]*?profileData\.nextAvailableTime === '待機中' \? '待機中' :[\s\S]*?profileData\.nextAvailableTime\.startsWith\('次回出勤'\) \? profileData\.nextAvailableTime :[\s\S]*?`次回\$\{profileData\.nextAvailableTime\}〜`[\s\S]*?\}\)[\s\S]*?<\/span>[\s\S]*?\)\}[\s\S]*?<\/span>[\s\S]*?<\/div>\s*<\/div>/;
let replace4 = `{!isNonCastProfile && (
                <div className="flex gap-1 items-center">
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
                </div>
            )}
        </div>`;
if (search4.test(content)) {
    content = content.replace(search4, replace4);
    console.log('Replaced 4');
} else { console.log('Failed 4'); }

// 5. Shifts Tab
let search5 = /<button\s*onClick=\{\(\) => setActiveTab\('shifts'\)\}[\s\S]*?className=\{`flex-1 py-4 text-\[11px\] tracking-widest relative transition-colors \$\{activeTab === 'shifts' \? 'font-bold text-black bg-\[\#F9F9F9\]' : 'font-normal text-\[\#777777\] hover:bg-\[\#F9F9F9\]'\}`\}[\s\S]*?>[\s\S]*?出勤情報[\s\S]*?\{activeTab === 'shifts' && <div className="absolute top-0 w-full h-\[1px\] bg-black"><\/div>\}[\s\S]*?<\/button>/;
let replace5 = `{!isNonCastProfile && (
              <button 
                 onClick={() => setActiveTab('shifts')}
                 className={\`flex-1 py-4 text-[11px] tracking-widest relative transition-colors \${activeTab === 'shifts' ? 'font-bold text-black bg-[#F9F9F9]' : 'font-normal text-[#777777] hover:bg-[#F9F9F9]'}\`}
              >
                出勤情報
                {activeTab === 'shifts' && <div className="absolute top-0 w-full h-[1px] bg-black"></div>}
              </button>
          )}`;
if (search5.test(content)) {
    content = content.replace(search5, replace5);
    console.log('Replaced 5');
} else { console.log('Failed 5'); }

// 6. Reserve Button
let search6 = /\) : \([\s\S]*?<Link href=\{`\/reserve\/\$\{id\}`\} className="premium-btn w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest">[\s\S]*?<Calendar size=\{18\} className="stroke-\[1\.5\]" \/>[\s\S]*?このキャストを予約する[\s\S]*?<\/Link>[\s\S]*?\)\}/;
let replace6 = `) : !isNonCastProfile ? (
            <Link href={\`/reserve/\${id}\`} className="premium-btn w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest">
               <Calendar size={18} className="stroke-[1.5]" />
               このキャストを予約する
            </Link>
          ) : null}`;
if (search6.test(content)) {
    content = content.replace(search6, replace6);
    console.log('Replaced 6');
} else { console.log('Failed 6'); }

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Regex patch finished');
