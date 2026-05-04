const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/app/cast/[id]/page.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. isNonCastProfile
content = content.replace(
`  const galleryItems = posts.flatMap(post => 
      (post.images || []).map((imgUrl: string) => ({ imgUrl, post }))
  );

  return (
    <>`,
`  const galleryItems = posts.flatMap(post => 
      (post.images || []).map((imgUrl: string) => ({ imgUrl, post }))
  );

  const isNonCastProfile = profileData.role === 'system' || profileData.role === 'store' || profileData.isAdmin || (profileData.name && (profileData.name.toLowerCase().includes('system') || profileData.name.includes('運営')));

  return (
    <>`
);

// 2. CAST DATA 1
content = content.replace(
`            {user?.id === id ? (
                <div className="flex gap-2">
                    <button onClick={() => setShowPreferencesModal(true)} className="px-4 py-1.5 mb-2 border border-[#E5E5E5] text-black bg-white hover:bg-[#F9F9F9] transition-colors flex flex-col items-center justify-center tracking-widest gap-0.5">
                        <span className="text-[10px] font-medium leading-none tracking-[0.1em]">CAST</span>
                        <span className="text-[8px] font-bold leading-none tracking-[0.1em]">DATA</span>
                    </button>
                    <button onClick={() => setIsEditingProfile(true)} className="px-6 py-2 text-[11px] mb-2 font-medium tracking-widest transition-colors premium-btn-outline">
                        設定・編集
                    </button>
                </div>
            ) : (`,
`            {user?.id === id ? (
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
            ) : (`
);

// 3. CAST DATA 2
content = content.replace(
`            ) : (
                <div className="flex gap-2">
                    <button onClick={() => setShowPreferencesModal(true)} className="px-4 py-1.5 mb-2 border border-[#E5E5E5] text-black bg-white hover:bg-[#F9F9F9] transition-colors flex flex-col items-center justify-center tracking-widest gap-0.5">
                        <span className="text-[10px] font-medium leading-none tracking-[0.1em]">CAST</span>
                        <span className="text-[8px] font-bold leading-none tracking-[0.1em]">DATA</span>
                    </button>
                    <button `,
`            ) : (
                <div className="flex gap-2">
                    {!isNonCastProfile && (
                        <button onClick={() => setShowPreferencesModal(true)} className="px-4 py-1.5 mb-2 border border-[#E5E5E5] text-black bg-white hover:bg-[#F9F9F9] transition-colors flex flex-col items-center justify-center tracking-widest gap-0.5">
                            <span className="text-[10px] font-medium leading-none tracking-[0.1em]">CAST</span>
                            <span className="text-[8px] font-bold leading-none tracking-[0.1em]">DATA</span>
                        </button>
                    )}
                    <button `
);

// 4. Status
content = content.replace(
`            <div className="flex gap-1 items-center">
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
        </div>`,
`            {!isNonCastProfile && (
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
        </div>`
);

// 5. Shifts Tab
content = content.replace(
`          <button 
             onClick={() => setActiveTab('shifts')}
             className={\`flex-1 py-4 text-[11px] tracking-widest relative transition-colors \${activeTab === 'shifts' ? 'font-bold text-black bg-[#F9F9F9]' : 'font-normal text-[#777777] hover:bg-[#F9F9F9]'}\`}
          >
            出勤情報
            {activeTab === 'shifts' && <div className="absolute top-0 w-full h-[1px] bg-black"></div>}
          </button>`,
`          {!isNonCastProfile && (
              <button 
                 onClick={() => setActiveTab('shifts')}
                 className={\`flex-1 py-4 text-[11px] tracking-widest relative transition-colors \${activeTab === 'shifts' ? 'font-bold text-black bg-[#F9F9F9]' : 'font-normal text-[#777777] hover:bg-[#F9F9F9]'}\`}
              >
                出勤情報
                {activeTab === 'shifts' && <div className="absolute top-0 w-full h-[1px] bg-black"></div>}
              </button>
          )}`
);

// 6. Reserve Button
content = content.replace(
`          ) : (
            <Link href={\`/reserve/\${id}\`} className="premium-btn w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest">
               <Calendar size={18} className="stroke-[1.5]" />
               このキャストを予約する
            </Link>
          )}`,
`          ) : !isNonCastProfile ? (
            <Link href={\`/reserve/\${id}\`} className="premium-btn w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest">
               <Calendar size={18} className="stroke-[1.5]" />
               このキャストを予約する
            </Link>
          ) : null}`
);

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Replaces done!');
