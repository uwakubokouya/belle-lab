const fs = require('fs');
const file = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const badBlock = `{user?.id === id ? (
                <div className="flex gap-2">
                    {!(profileRole === "system" || profileRole === "store") ? (
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
            )}
      </div>`;

const correctBlock = `{user?.id === id ? (
                <div className="flex gap-2">
                    <button onClick={() => setIsEditingProfile(true)} className="px-6 py-2 bg-black text-white text-[10px] tracking-widest font-bold border border-black hover:bg-transparent hover:text-black transition-colors rounded-none">
                        EDIT
                    </button>
                    <button onClick={handleLogout} className="px-4 py-2 border border-[#E5E5E5] text-[#777777] text-[10px] tracking-widest font-bold hover:bg-[#F9F9F9] transition-colors rounded-none">
                        LOGOUT
                    </button>
                </div>
            ) : (
                <div className="flex gap-2">
                    <button 
                      onClick={handleFollow}
                      disabled={isLoadingFollow}
                      className={\`min-w-[120px] px-6 py-2 text-[10px] tracking-widest font-bold transition-colors rounded-none flex items-center justify-center gap-1 border \${
                        isFollowing 
                          ? 'bg-white text-black border-black hover:bg-[#F9F9F9]' 
                          : 'bg-black text-white border-black hover:bg-transparent hover:text-black'
                      } disabled:opacity-50\`}
                    >
                        {isLoadingFollow ? '...' : isFollowing ? 'フォロー中' : 'フォローする'}
                    </button>
                </div>
            )}`;

content = content.replace(badBlock, correctBlock);

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

fs.writeFileSync(file, content);
console.log('Fixed syntax error and applied tabs');
