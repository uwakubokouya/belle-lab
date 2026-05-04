const fs = require('fs');

let content = fs.readFileSync('src/app/admin/analytics/page.tsx', 'utf-8');

// 1. PREFECTURES 定数の追加
const targetImports = `export default function AnalyticsAdminPage() {`;
const replaceImports = `const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

export default function AnalyticsAdminPage() {`;

if (content.includes(targetImports) && !content.includes('const PREFECTURES =')) {
    content = content.replace(targetImports, replaceImports);
}

// 2. ステートの変更 (selectedCastId -> selectedArea, castAreaMap の追加)
content = content.replace(
    /const \[selectedCastId, setSelectedCastId\] = useState\('all'\);/g,
    `const [selectedArea, setSelectedArea] = useState('all');\n    const [castAreaMap, setCastAreaMap] = useState<Map<string, string>>(new Map());`
);

// 3. initContext での castAreaMap 生成
const targetInitContext = `            } else {
                const { data } = await supabase.from('sns_profiles').select('id, name').eq('role', 'cast');
                if (data) setCasts(data);
            }`;
            
const replaceInitContext = `            } else {
                const { data } = await supabase.from('sns_profiles').select('id, name, phone').eq('role', 'cast');
                if (data) {
                    setCasts(data);
                    
                    // キャストの都道府県を解決するためのマップを作成
                    const { data: allProfiles } = await supabase.from('profiles').select('store_id, prefecture');
                    const storePrefMap = new Map();
                    if (allProfiles) {
                        allProfiles.forEach(p => {
                            storePrefMap.set(p.store_id, p.prefecture);
                        });
                    }
                    
                    const { data: allCasts } = await supabase.from('casts').select('login_id, store_id');
                    const areaMap = new Map();
                    if (allCasts) {
                        data.forEach(snsCast => {
                            const ctiCast = allCasts.find(c => c.login_id === snsCast.phone);
                            if (ctiCast && ctiCast.store_id) {
                                const pref = storePrefMap.get(ctiCast.store_id);
                                if (pref) {
                                    // prefが「福岡県博多区」などの場合があるので、最初の「都・道・府・県」までを抽出するか、PREFECTURESに含まれるか確認
                                    const matchedPref = PREFECTURES.find(p => pref.startsWith(p)) || pref;
                                    areaMap.set(snsCast.id, matchedPref);
                                }
                            }
                        });
                    }
                    setCastAreaMap(areaMap);
                }
            }`;

if (content.includes(targetInitContext)) {
    content = content.replace(targetInitContext, replaceInitContext);
}

// 4. filteredViews の絞り込みと、ランキングの作成条件の変更
const targetFilteredViews = `    let filteredViews = pageViews;
    if (activeTab === 'cast' && selectedCastId !== 'all') {
        filteredViews = pageViews.filter(v => v.target_id === selectedCastId);
    }`;

const replaceFilteredViews = `    let filteredViews = pageViews;
    if (activeTab === 'cast' && selectedArea !== 'all') {
        filteredViews = pageViews.filter(v => castAreaMap.get(v.target_id) === selectedArea);
    }`;

if (content.includes(targetFilteredViews)) {
    content = content.replace(targetFilteredViews, replaceFilteredViews);
}

// 5. ランキング作成の条件変更
const targetRanking = `    const castRanking = new Map<string, {pv: number, reserve: number}>();
    if (activeTab === 'cast' && selectedCastId === 'all') {`;

const replaceRanking = `    const castRanking = new Map<string, {pv: number, reserve: number}>();
    if (activeTab === 'cast') {`;

if (content.includes(targetRanking)) {
    content = content.replace(targetRanking, replaceRanking);
}

// 6. プルダウンのUI変更
const targetSelectUI = `                            <label className="text-[10px] uppercase tracking-widest text-[#777777] mb-2 block">対象キャスト</label>
                            <div className="relative">
                                <select 
                                    value={selectedCastId}
                                    onChange={e => setSelectedCastId(e.target.value)}
                                    className="w-full border border-[#E5E5E5] p-3 text-sm outline-none focus:border-black transition-colors bg-white appearance-none cursor-pointer"
                                >
                                    <option value="all">キャスト全体（ランキング）</option>
                                    {casts.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>`;

const replaceSelectUI = `                            <label className="text-[10px] uppercase tracking-widest text-[#777777] mb-2 block">対象エリア</label>
                            <div className="relative">
                                <select 
                                    value={selectedArea}
                                    onChange={e => setSelectedArea(e.target.value)}
                                    className="w-full border border-[#E5E5E5] p-3 text-sm outline-none focus:border-black transition-colors bg-white appearance-none cursor-pointer"
                                >
                                    <option value="all">全国エリア（総合ランキング）</option>
                                    {PREFECTURES.map(pref => (
                                        <option key={pref} value={pref}>{pref}</option>
                                    ))}
                                </select>`;

if (content.includes(targetSelectUI)) {
    content = content.replace(targetSelectUI, replaceSelectUI);
}

// 7. 総PV部分の表示テキストの変更
content = content.replace(
    `activeTab === 'cast' && selectedCastId === 'all' ? '全体合計 PV' : '月間合計 PV'`,
    `activeTab === 'cast' ? (selectedArea === 'all' ? '全体合計 PV' : 'エリア合計 PV') : '月間合計 PV'`
);

// 8. キャストランキングの表示条件変更と日別リストの非表示
content = content.replace(
    `{/* Cast Ranking - show only if Cast tab and 'all' is selected */}
                        {activeTab === 'cast' && selectedCastId === 'all' && (`,
    `{/* Cast Ranking - show only if Cast tab */}
                        {activeTab === 'cast' && (`
);

const targetHideList = `{/* Daily List - Hide when showing all cast ranking */}
                        {!(activeTab === 'cast' && selectedCastId === 'all') && (`;

const replaceHideList = `{/* Daily List - Hide on Cast tab as we show ranking instead */}
                        {activeTab !== 'cast' && (`;

if (content.includes(targetHideList)) {
    content = content.replace(targetHideList, replaceHideList);
}

fs.writeFileSync('src/app/admin/analytics/page.tsx', content);
console.log('Analytics page updated for area based ranking.');
