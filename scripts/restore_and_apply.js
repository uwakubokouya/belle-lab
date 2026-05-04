const fs = require('fs');
const file = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. activeTab 型の変更
content = content.replace(
    /const \[activeTab, setActiveTab\] = useState<'timeline' \| 'gallery' \| 'shifts'>\('timeline'\);/,
    "const [activeTab, setActiveTab] = useState<'timeline' | 'gallery' | 'shifts' | 'casts'>('timeline');"
);

// 2. 状態変数の追加
content = content.replace(
    /const \[castPreferences, setCastPreferences\] = useState<any>\(null\);/,
    "const [castPreferences, setCastPreferences] = useState<any>(null);\n  const [storeInfo, setStoreInfo] = useState<{ id: string, name: string } | null>(null);\n  const [storeCastsList, setStoreCastsList] = useState<any[]>([]);\n  const [isLoadingCasts, setIsLoadingCasts] = useState(false);"
);

// 3. fetchStoreCasts の useEffect を追加
const useEffectCasts = `
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
          const phones = castsData.map(c => c.login_id).filter(Boolean);
          let profilesData = [];
          if (phones.length > 0) {
            const { data } = await supabase.from('sns_profiles').select('phone, name, avatar_url, bio').in('phone', phones);
            if (data) profilesData = data;
          }
          const profileMap = new Map();
          profilesData.forEach(p => profileMap.set(p.phone, p));

          const now = new Date();
          const d2 = new Date(now.getTime());
          if (d2.getHours() < 5) d2.setDate(d2.getDate() - 1);
          const todayStr = d2.toLocaleDateString('sv-SE').split('T')[0];

          let availabilityData = [];
          const { data: availData } = await supabase.rpc('get_public_availability', { p_store_id: storeInfo.id, p_date: todayStr });
          if (availData) availabilityData = availData;

          const availabilityMap = new Map();
          availabilityData.forEach(row => {
            if (!availabilityMap.has(row.cast_id)) {
              availabilityMap.set(row.cast_id, { shift_start: row.shift_start, attendance_status: row.attendance_status });
            }
          });

          const mergedCasts = castsData.map(c => {
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

          mergedCasts.sort((a, b) => {
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
content = content.replace(
    /useEffect\(\(\) => \{\s*if \(isEditingProfile\) \{/,
    useEffectCasts + "\n  useEffect(() => {\n    if (isEditingProfile) {"
);

// 4. storeInfo の取得処理を追加
const fetchStoreInfoStr = `
        const storeId = storeCast?.store_id || 'ef92279f-3f19-47e7-b542-69de5906ab9b';
        const { data: storeProfile } = await supabase.from('profiles').select('full_name, username').eq('id', storeId).maybeSingle();
        if (storeProfile) {
            let linkId = storeId;
            if (storeProfile.username) {
                const { data: snsStoreProfile } = await supabase.from('sns_profiles').select('id').eq('phone', storeProfile.username).maybeSingle();
                if (snsStoreProfile) linkId = snsStoreProfile.id;
            }
            setStoreInfo({ id: linkId, name: storeProfile.full_name || storeProfile.username || "" });
        }
`;
content = content.replace(
    /const weekDays = \["日", "月", "火", "水", "木", "金", "土"\];\s*const storeId = storeCast\?\.store_id \|\| 'ef92279f-3f19-47e7-b542-69de5906ab9b';/,
    "const weekDays = [\"日\", \"月\", \"火\", \"水\", \"木\", \"金\", \"土\"];\n" + fetchStoreInfoStr
);

// 5. castImg と storeData のフォールバックを追加
const castImgRegex = /let castName = profile\?\.name \|\| "";\s*let castBio = \/\* profile\?\.bio \|\| \*\/ ""; \/\/ bio doesn't exist in schema\s*if \(\!storeCast && \!profile\) \{\s*const \{ data: castFromDb \} = await supabase\.from\('casts'\)\.select\('\*'\)\.eq\('id', id\)\.maybeSingle\(\);\s*storeCast = castFromDb;\s*\}\s*let castImg = profile\?\.avatar_url \|\| storeCast\?\.profile_image_url \|\| storeCast\?\.avatar_url \|\| "\/images\/no-photo\.jpg";/;

const newCastImgBlock = `let castName = profile?.name || "";
        let castBio = /* profile?.bio || */ ""; // bio doesn't exist in schema
        let castImg = "";

        if (!storeCast && !profile) {
            const { data: castFromDb } = await supabase.from('casts').select('*').eq('id', id).maybeSingle();
            storeCast = castFromDb;
            if (!storeCast) {
                const { data: storeData } = await supabase.from('profiles').select('full_name, role, avatar_url').eq('id', id).maybeSingle();
                if (storeData) {
                    castName = storeData.full_name || "公式アカウント";
                    castImg = storeData.avatar_url || "/images/no-photo.jpg";
                    setProfileRole(storeData.role);
                }
            }
        }
        if (!castImg) {
            castImg = profile?.avatar_url || storeCast?.profile_image_url || storeCast?.avatar_url || "/images/no-photo.jpg";
        }`;
content = content.replace(castImgRegex, newCastImgBlock);

// 6. UI: バッジの追加
const badgeRegex = /<h1 className="text-xl font-light tracking-\[0\.2em\] mb-4">\{profileData\.name\}<\/h1>/;
const badgeBlock = `<h1 className="text-xl font-light tracking-[0.2em] mb-4">{profileData.name}</h1>
            {storeInfo && storeInfo.name && (
                <Link href={\`/cast/\${storeInfo.id}\`} className="inline-block mb-4">
                    <span className="text-[10px] text-[#777777] bg-[#F9F9F9] border border-[#E5E5E5] px-2 py-0.5 tracking-widest hover:bg-[#E5E5E5] transition-colors">
                        {storeInfo.name}
                    </span>
                </Link>
            )}`;
content = content.replace(badgeRegex, badgeBlock);

// 7. UI: タブの置換
const tabsRegex = /\{\!\(profileRole === "system" \|\| profileRole === "store"\) && \(\s*<button\s*onClick=\{[^>]+>\s*出勤情報[\s\S]*?<\/button>\s*\)\}/;
const newTabsBlock = `{!(profileRole === "system" || profileRole === "store") ? (
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
content = content.replace(tabsRegex, newTabsBlock);

// 8. UI: タブコンテンツの追加
const contentRegex = /\) : activeTab === 'shifts' \? \(/;
const newContentBlock = `) : activeTab === 'casts' ? (
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
content = content.replace(contentRegex, newContentBlock);

fs.writeFileSync(file, content);
console.log('Restored all modifications correctly.');
