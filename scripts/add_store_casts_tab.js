const fs = require('fs');
const file = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. activeTab の型に 'casts' を追加
content = content.replace(
  /const \[activeTab, setActiveTab\] = useState<'timeline' \| 'gallery' \| 'shifts'>\('timeline'\);/,
  "const [activeTab, setActiveTab] = useState<'timeline' | 'gallery' | 'shifts' | 'casts'>('timeline');\n    const [storeCastsList, setStoreCastsList] = useState<any[]>([]);\n    const [isLoadingCasts, setIsLoadingCasts] = useState(false);"
);

// 2. useEffect を追加してキャスト一覧をフェッチする
const fetchCastsEffect = `
    useEffect(() => {
        if (activeTab === 'casts' && storeCastsList.length === 0 && storeInfo) {
            const fetchStoreCasts = async () => {
                setIsLoadingCasts(true);
                try {
                    const { data: castsData } = await supabase.from('casts').select('*').eq('store_id', storeInfo.id).eq('status', 'active');
                    if (!castsData || castsData.length === 0) {
                        setStoreCastsList([]);
                        return;
                    }
                    
                    const phones = castsData.map((c: any) => c.login_id).filter(Boolean);
                    let profilesData: any[] = [];
                    if (phones.length > 0) {
                        const { data } = await supabase.from('sns_profiles').select('phone, name, avatar_url, bio').in('phone', phones);
                        if (data) profilesData = data;
                    }
                    
                    const profileMap = new Map();
                    profilesData.forEach(p => profileMap.set(p.phone, p));
                    
                    const now = new Date();
                    const d2 = new Date(now.getTime());
                    if (d2.getHours() < 5) {
                        d2.setDate(d2.getDate() - 1);
                    }
                    const todayStr = d2.toLocaleDateString('sv-SE').split('T')[0];
                    
                    let availabilityData: any[] = [];
                    const { data: availData } = await supabase.rpc('get_public_availability', { p_store_id: storeInfo.id, p_date: todayStr });
                    if (availData) availabilityData = availData;
                    
                    const availabilityMap = new Map();
                    availabilityData.forEach((row: any) => {
                        if (!availabilityMap.has(row.cast_id)) {
                            availabilityMap.set(row.cast_id, {
                                shift_start: row.shift_start,
                                attendance_status: row.attendance_status
                            });
                        }
                    });
                    
                    const mergedCasts = castsData.map((c: any) => {
                        const p = profileMap.get(c.login_id) || {};
                        const a = availabilityMap.get(c.id);
                        
                        let statusText = "お休み";
                        let startM = 9999;
                        if (a && a.attendance_status !== 'absent' && a.shift_start) {
                            statusText = "本日出勤";
                            const [hh, mm] = a.shift_start.split(':');
                            startM = parseInt(hh) * 60 + parseInt(mm);
                        }
                        
                        return {
                            id: c.id,
                            name: p.name || c.name || "名称未設定",
                            avatar_url: p.avatar_url || c.profile_image_url || c.avatar_url,
                            bio: p.bio || "",
                            statusText,
                            startM,
                            isNew: c.is_new || false
                        };
                    });
                    
                    mergedCasts.sort((a: any, b: any) => {
                        if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
                        if (a.statusText === "本日出勤" && b.statusText !== "本日出勤") return -1;
                        if (a.statusText !== "本日出勤" && b.statusText === "本日出勤") return 1;
                        if (a.statusText === "本日出勤" && b.statusText === "本日出勤") return a.startM - b.startM;
                        return 0;
                    });
                    
                    setStoreCastsList(mergedCasts);
                } catch (e) {
                    console.error(e);
                } finally {
                    setIsLoadingCasts(false);
                }
            };
            fetchStoreCasts();
        }
    }, [activeTab, storeInfo]);
`;

// useEffect を追加する場所を見つける（useEffect が複数あるので、最後に追加する）
content = content.replace(
  /const \[likedFollowerIds, setLikedFollowerIds\] = useState<Set<string>>\(new Set\(\)\);/,
  `const [likedFollowerIds, setLikedFollowerIds] = useState<Set<string>>(new Set());\n${fetchCastsEffect}`
);

// 3. タブの表示部分の修正
const regexTabs = /\{\!\(profileRole === "system" \|\| profileRole === "store"\) && \(\s*<button\s*onClick=\{([^}]+)\}\s*className=\{([^}]+)\}\s*>\s*出勤情報\s*\{([^}]+)\}\s*<\/button>\s*\)\}/;

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

// 4. タブコンテンツの表示部分の修正
// `) : activeTab === 'shifts' ? (` を探してその前にキャスト一覧のUIを挿入
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
console.log('Added Casts tab for Store profiles');
