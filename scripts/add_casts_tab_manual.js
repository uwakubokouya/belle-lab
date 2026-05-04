const fs = require('fs');

let content = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8');

// 1. Add 'casts' to activeTab and storeCastsList state
content = content.replace(
  /const \[activeTab, setActiveTab\] = useState<'timeline' \| 'gallery' \| 'shifts'>\('timeline'\);/,
  `const [activeTab, setActiveTab] = useState<'timeline' | 'gallery' | 'shifts' | 'casts'>('timeline');\n  const [storeCastsList, setStoreCastsList] = useState<any[]>([]);`
);

// 2. Add fetch logic for storeCastsList
// Find the end of `if (storeCast?.id) {` block where `workingToday` is calculated.
// Look for `setProfileData(prev => ({ ...prev, workingToday: isWorkingToday, slotsLeft: slotsLeft, nextAvailableTime: nextAvailableTime, statusText: statusText }));`
const fetchCastsLogic = `
          // Fetch Store Casts if this is a store profile
          if (profile?.role === 'store') {
              const { data: castsData } = await supabase.from('casts').select('*').eq('store_id', storeCast.store_id);
              if (castsData && castsData.length > 0) {
                  const loginIds = castsData.map(c => c.login_id).filter(Boolean);
                  const { data: snsProfiles } = await supabase.from('sns_profiles').select('id, name, avatar_url, bio, phone').in('phone', loginIds);
                  
                  const cList = [];
                  for (const c of castsData) {
                      const cProfile = snsProfiles?.find(p => p.phone === c.login_id);
                      if (!cProfile) continue;
                      
                      let statusText = "お休み";
                      let score = 0;
                      let nextShiftStr = "";

                      if (c.is_new) score += 1000000;

                      const myAvails = availabilityData?.filter((a: any) => a.cast_id === c.id) || [];
                      if (myAvails.length > 0) {
                          const shift_start = myAvails[0].shift_start;
                          const shift_end = myAvails[0].shift_end;
                          const isAbsent = myAvails[0].attendance_status === 'absent';
                          
                          if (isAbsent) {
                              statusText = "お休み";
                              score += 0;
                          } else {
                              const startH = parseInt((shift_start || '00:00').split(':')[0] || '0', 10);
                              const endH = parseInt((shift_end || '00:00').split(':')[0] || '0', 10);
                              const startM = startH * 60 + parseInt((shift_start || '00:00').split(':')[1] || '0', 10);
                              let endM = endH * 60 + parseInt((shift_end || '00:00').split(':')[1] || '0', 10);
                              if (endH < businessEndTime.hour) endM += 24 * 60;
                              
                              const currentH = now.getHours();
                              let adjH = currentH;
                              if (currentH < businessEndTime.hour) adjH += 24;
                              const currentM = adjH * 60 + now.getMinutes();
                              
                              if (currentM >= startM && currentM < endM) {
                                  statusText = "本日出勤中";
                                  score += 500000;
                              } else if (currentM < startM) {
                                  statusText = "本日出勤";
                                  score += 300000;
                                  nextShiftStr = shift_start;
                              } else {
                                  statusText = "受付終了";
                              }
                          }
                      }
                      
                      cList.push({
                          id: cProfile.id,
                          name: cProfile.name,
                          avatar_url: cProfile.avatar_url,
                          bio: cProfile.bio,
                          statusText: statusText,
                          score: score,
                          nextShift: nextShiftStr
                      });
                  }
                  cList.sort((a, b) => b.score - a.score);
                  setStoreCastsList(cList);
              }
          }
`;

content = content.replace(
  /nextAvailableTime: nextAvailableTime,\s*statusText: statusText\s*\}\)\);\s*\}\s*\}\s*\}/,
  `nextAvailableTime: nextAvailableTime,
                      statusText: statusText
                  }));
              }
          }
${fetchCastsLogic}
      }`
);

// 3. Add tab button
const tabButtonCode = `
          {profileData.role === 'store' && (
              <button 
                 onClick={() => setActiveTab('casts')}
                 className={\`flex-1 py-4 text-[11px] tracking-widest border-r border-[#E5E5E5] relative transition-colors \${activeTab === 'casts' ? 'font-bold text-black bg-[#F9F9F9]' : 'font-normal text-[#777777] hover:bg-[#F9F9F9]'}\`}
              >
                キャスト一覧
                {activeTab === 'casts' && <div className="absolute top-0 w-full h-[1px] bg-black"></div>}
              </button>
          )}`;

content = content.replace(
  /(<button \s*onClick=\{\(\) => setActiveTab\('shifts'\)\}[\s\S]*?出勤情報[\s\S]*?<\/button>)/,
  `${tabButtonCode}\n          $1`
);

// 4. Add tab content
const tabContentCode = `
        ) : activeTab === 'casts' && profileData.role === 'store' ? (
            <div className="bg-[#F9F9F9] min-h-[300px]">
                {storeCastsList.length > 0 ? (
                    <div className="flex flex-col">
                        {storeCastsList.map((c, idx) => (
                            <Link key={idx} href={\`/cast/\${c.id}\`} className="flex items-center gap-4 p-4 bg-white border-b border-[#E5E5E5] hover:bg-[#F9F9F9] transition-colors">
                                <div className="shrink-0 w-16 h-16 bg-[#E5E5E5] border border-black overflow-hidden relative">
                                    <img src={c.avatar_url || "/images/no-photo.jpg"} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-sm tracking-widest text-black truncate">{c.name || "名称未設定"}</h4>
                                        {c.statusText === "本日出勤中" && (
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#E02424] text-white tracking-widest">本日出勤中</span>
                                        )}
                                        {c.statusText === "本日出勤" && c.nextShift && (
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 border border-black text-black tracking-widest">{c.nextShift}〜</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-[#777777] leading-relaxed line-clamp-2">{c.bio || "自己紹介文はまだありません。"}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-[#777777]">
                        <p className="text-xs tracking-widest">キャストが登録されていません</p>
                    </div>
                )}
            </div>
`;

content = content.replace(
  /(\) : \((\s*<div className="bg-white p-6 min-h-\[300px\]">[\s\S]*?出勤予定[\s\S]*?※枠の最新の空き状況は「予約する」ボタンよりご確認ください。[\s\S]*?<\/div>\s*)\))/,
  `${tabContentCode}        $1`
);

fs.writeFileSync('src/app/cast/[id]/page.tsx', content, 'utf8');
console.log('Casts tab added successfully.');
