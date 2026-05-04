const fs = require('fs');
const file = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const regexTabs = /\{\!\(profileRole === "system" \|\| profileRole === "store"\) && \([\s\S]*?出勤情報[\s\S]*?<\/button>\s*\)\}/;

const newTabs = `{!(profileRole === "system" || profileRole === "store") ? (
                <button
                    onClick={() => setActiveTab('shifts')}
                    className={\`flex-1 py-4 text-[11px] tracking-widest relative transition-colors \${activeTab === 'shifts' ? 'font-bold text-black bg-[#F9F9F9]' : 'font-normal text-[#777777] hover:bg-[#F9F9F9]'}\`}
                >
                    出勤情報
                    {activeTab === 'shifts' && <div className="absolute top-0 w-full h-[1px] bg-black"></div>}
                </button>
            ) : (
                <button
                    onClick={() => setActiveTab('casts')}
                    className={\`flex-1 py-4 text-[11px] tracking-widest relative transition-colors \${activeTab === 'casts' ? 'font-bold text-black bg-[#F9F9F9]' : 'font-normal text-[#777777] hover:bg-[#F9F9F9]'}\`}
                >
                    キャスト一覧
                    {activeTab === 'casts' && <div className="absolute top-0 w-full h-[1px] bg-black"></div>}
                </button>
            )}`;

content = content.replace(regexTabs, newTabs);

const regexContent = /\) : activeTab === 'shifts' \? \(/;
const newContent = `) : activeTab === 'casts' ? (
                isLoadingCasts ? (
                    <div className="py-20 text-center text-[#777777]">
                        <p className="text-xs tracking-widest">読み込み中...</p>
                    </div>
                ) : storeCastsList.length > 0 ? (
                    <div className="flex flex-col bg-white">
                        {storeCastsList.map((c: any) => (
                            <Link key={c.id} href={\`/cast/\${c.id}\`} className="flex gap-4 p-4 border-b border-[#E5E5E5] hover:bg-[#F9F9F9] transition-colors items-start">
                                <div className="relative shrink-0">
                                    <img src={c.avatar_url || "/images/no-photo.jpg"} alt={c.name} className="w-[60px] h-[60px] rounded-none object-cover border border-[#E5E5E5]" />
                                    {c.statusText === "本日出勤" && (
                                        <div className="absolute -bottom-1 -right-1 bg-white p-[2px] rounded-full">
                                            <div className="w-2.5 h-2.5 bg-[#22C55E] rounded-full border border-white"></div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-[13px] text-black tracking-widest uppercase truncate">{c.name}</span>
                                        {c.isNew && <span className="text-[8px] bg-[#22C55E] text-white px-1 py-0.5 tracking-widest">NEW</span>}
                                    </div>
                                    <p className="text-xs text-[#777777] line-clamp-2 leading-relaxed font-light">{c.bio || "自己紹介がありません"}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center text-[#777777]">
                        <p className="text-xs tracking-widest">キャストがいません</p>
                    </div>
                )
            ) : activeTab === 'shifts' ? (`;

content = content.replace(regexContent, newContent);

fs.writeFileSync(file, content);
console.log('Fixed tabs and content');
