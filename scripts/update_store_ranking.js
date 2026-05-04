const fs = require('fs');

let content = fs.readFileSync('src/app/admin/analytics/page.tsx', 'utf-8');

// 1. Add stores and castStoreMap states
content = content.replace(
    `const [castAreaMap, setCastAreaMap] = useState<Map<string, string>>(new Map());`,
    `const [castAreaMap, setCastAreaMap] = useState<Map<string, string>>(new Map());\n    const [stores, setStores] = useState<any[]>([]);\n    const [castStoreMap, setCastStoreMap] = useState<Map<string, string>>(new Map());`
);

// 2. Update initContext to populate stores and castStoreMap
const targetInitContext = `                    const { data: allProfiles } = await supabase.from('profiles').select('store_id, prefecture').not('prefecture', 'is', null);
                    const storePrefMap = new Map();
                    if (allProfiles) {
                        allProfiles.forEach(p => {
                            if (p.prefecture) {
                                storePrefMap.set(p.store_id, p.prefecture);
                            }
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
                    setCastAreaMap(areaMap);`;

const replaceInitContext = `                    const { data: allProfiles } = await supabase.from('profiles').select('store_id, prefecture, username').not('prefecture', 'is', null);
                    const storePrefMap = new Map();
                    if (allProfiles) {
                        setStores(allProfiles);
                        allProfiles.forEach(p => {
                            if (p.prefecture) {
                                storePrefMap.set(p.store_id, p.prefecture);
                            }
                        });
                    }
                    
                    const { data: allCasts } = await supabase.from('casts').select('login_id, store_id');
                    const areaMap = new Map();
                    const storeMap = new Map();
                    if (allCasts) {
                        data.forEach(snsCast => {
                            const ctiCast = allCasts.find(c => c.login_id === snsCast.phone);
                            if (ctiCast && ctiCast.store_id) {
                                storeMap.set(snsCast.id, ctiCast.store_id);
                                const pref = storePrefMap.get(ctiCast.store_id);
                                if (pref) {
                                    const matchedPref = PREFECTURES.find(p => pref.startsWith(p)) || pref;
                                    areaMap.set(snsCast.id, matchedPref);
                                }
                            }
                        });
                    }
                    setCastAreaMap(areaMap);
                    setCastStoreMap(storeMap);`;

if (content.includes(targetInitContext)) {
    content = content.replace(targetInitContext, replaceInitContext);
}

// 3. Update fetchData to only fetch cast_profile and reserve_click for home and cast tabs
const targetFetchData = `                if (user?.role === 'store') {
                    if (storeCastIds.length > 0) {
                        query = query.in('target_id', storeCastIds);
                    } else {
                        query = query.eq('target_id', '00000000-0000-0000-0000-000000000000');
                    }
                    query = query.in('page_type', ['cast_profile', 'reserve_click']);
                } else {
                    query = query.in('page_type', activeTab === 'home' ? ['home', 'reserve_click'] : ['cast_profile', 'reserve_click']);
                }`;

const replaceFetchData = `                if (user?.role === 'store') {
                    if (storeCastIds.length > 0) {
                        query = query.in('target_id', storeCastIds);
                    } else {
                        query = query.eq('target_id', '00000000-0000-0000-0000-000000000000');
                    }
                    query = query.in('page_type', ['cast_profile', 'reserve_click']);
                } else {
                    query = query.in('page_type', ['cast_profile', 'reserve_click']);
                }`;

if (content.includes(targetFetchData)) {
    content = content.replace(targetFetchData, replaceFetchData);
}

// 4. Update filteredViews logic for both tabs
const targetFilteredViews = `    let filteredViews = pageViews;
    if (activeTab === 'cast' && selectedArea !== 'all') {
        filteredViews = pageViews.filter(v => castAreaMap.get(v.target_id) === selectedArea);
    }`;

const replaceFilteredViews = `    let filteredViews = pageViews;
    if ((activeTab === 'cast' || activeTab === 'home') && selectedArea !== 'all') {
        filteredViews = pageViews.filter(v => castAreaMap.get(v.target_id) === selectedArea);
    }`;

if (content.includes(targetFilteredViews)) {
    content = content.replace(targetFilteredViews, replaceFilteredViews);
}

// 5. Update ranking calculation
const targetRanking = `    const castRanking = new Map<string, {pv: number, reserve: number}>();
    if (activeTab === 'cast') {
        filteredViews.forEach(v => {
            if (v.target_id) {
                const current = castRanking.get(v.target_id) || {pv: 0, reserve: 0};
                if (v.page_type === 'reserve_click') {
                    current.reserve++;
                } else {
                    current.pv++;
                }
                castRanking.set(v.target_id, current);
            }
        });
    }
    const rankedCasts = Array.from(castRanking.entries())
        .sort((a, b) => b[1].pv - a[1].pv)
        .map(([id, counts]) => {
            const cast = casts.find(c => c.id === id);
            return { name: cast ? cast.name : 'Unknown', count: counts.pv, reserve: counts.reserve, id };
        });`;

const replaceRanking = `    const castRanking = new Map<string, {pv: number, reserve: number}>();
    const storeRanking = new Map<string, {pv: number, reserve: number}>();
    
    if (activeTab === 'cast' || activeTab === 'home') {
        filteredViews.forEach(v => {
            if (v.target_id) {
                if (activeTab === 'cast') {
                    const current = castRanking.get(v.target_id) || {pv: 0, reserve: 0};
                    if (v.page_type === 'reserve_click') {
                        current.reserve++;
                    } else {
                        current.pv++;
                    }
                    castRanking.set(v.target_id, current);
                } else if (activeTab === 'home') {
                    const storeId = castStoreMap.get(v.target_id);
                    if (storeId) {
                        const current = storeRanking.get(storeId) || {pv: 0, reserve: 0};
                        if (v.page_type === 'reserve_click') {
                            current.reserve++;
                        } else {
                            current.pv++;
                        }
                        storeRanking.set(storeId, current);
                    }
                }
            }
        });
    }

    const rankedCasts = Array.from(castRanking.entries())
        .sort((a, b) => b[1].pv - a[1].pv)
        .map(([id, counts]) => {
            const cast = casts.find(c => c.id === id);
            return { name: cast ? cast.name : 'Unknown', count: counts.pv, reserve: counts.reserve, id };
        });

    const rankedStores = Array.from(storeRanking.entries())
        .sort((a, b) => b[1].pv - a[1].pv)
        .map(([id, counts]) => {
            const store = stores.find(s => s.store_id === id);
            return { name: store ? store.username : 'Unknown Store', count: counts.pv, reserve: counts.reserve, id };
        });`;

if (content.includes(targetRanking)) {
    content = content.replace(targetRanking, replaceRanking);
}

// 6. Update UI: Show area select for 'home' tab too
content = content.replace(
    `{activeTab === 'cast' && (`,
    `{(activeTab === 'cast' || activeTab === 'home') && (`
);

// 7. Update UI: Total PV text
content = content.replace(
    `{activeTab === 'cast' ? (selectedArea === 'all' ? '全体合計 PV' : 'エリア合計 PV') : '月間合計 PV'}`,
    `{(activeTab === 'cast' || activeTab === 'home') ? (selectedArea === 'all' ? '全体合計 PV' : 'エリア合計 PV') : '月間合計 PV'}`
);

// 8. Update UI: Add Store Ranking below Cast Ranking logic
const targetUILists = `{/* Cast Ranking - show only if Cast tab */}
                        {activeTab === 'cast' && (
                            <div className="bg-white border border-[#E5E5E5]">
                                <div className="p-4 border-b border-[#E5E5E5] bg-[#F9F9F9]">
                                    <h3 className="text-xs font-bold tracking-widest flex items-center gap-2">
                                        <BarChart2 size={14} className="stroke-[2]" />
                                        キャスト別 PVランキング
                                    </h3>
                                </div>
                                <div>
                                    {rankedCasts.length > 0 ? (
                                        rankedCasts.map((c, idx) => (
                                            <div 
                                                key={c.id} 
                                                onClick={() => setSelectedCastId(c.id)}
                                                className="flex items-center justify-between text-[10px] uppercase bg-[#F9F9F9] px-2 py-1.5 border-b border-[#E5E5E5] last:border-b-0 hover:bg-white transition-colors cursor-pointer"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className={\`w-3.5 h-3.5 rounded-none shrink-0 flex items-center justify-center text-[8px] font-bold \${idx < 3 ? 'bg-black text-white' : 'bg-[#E5E5E5] text-[#777777]'}\`}>{idx + 1}</span>
                                                    <span className="text-[#777777] font-bold truncate max-w-[120px]">{c.name}</span>
                                                </div>
                                                <div className="font-bold text-black flex items-center gap-2">
                                                    <span className="w-14 text-right">{c.count.toLocaleString()} <span className="text-[8px] font-normal text-[#777777]">PV</span></span>
                                                    <span className="w-16 text-right text-[#777777]">予約: {c.reserve.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-xs text-[#777777] tracking-widest">データがありません</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Daily List - Hide on Cast tab as we show ranking instead */}
                        {activeTab !== 'cast' && (`;

const replaceUILists = `{/* Cast Ranking - show only if Cast tab */}
                        {activeTab === 'cast' && (
                            <div className="bg-white border border-[#E5E5E5]">
                                <div className="p-4 border-b border-[#E5E5E5] bg-[#F9F9F9]">
                                    <h3 className="text-xs font-bold tracking-widest flex items-center gap-2">
                                        <BarChart2 size={14} className="stroke-[2]" />
                                        キャスト別 PVランキング
                                    </h3>
                                </div>
                                <div>
                                    {rankedCasts.length > 0 ? (
                                        rankedCasts.map((c, idx) => (
                                            <div 
                                                key={c.id} 
                                                className="flex items-center justify-between text-[10px] uppercase bg-[#F9F9F9] px-2 py-1.5 border-b border-[#E5E5E5] last:border-b-0 hover:bg-white transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className={\`w-3.5 h-3.5 rounded-none shrink-0 flex items-center justify-center text-[8px] font-bold \${idx < 3 ? 'bg-black text-white' : 'bg-[#E5E5E5] text-[#777777]'}\`}>{idx + 1}</span>
                                                    <span className="text-[#777777] font-bold truncate max-w-[120px]">{c.name}</span>
                                                </div>
                                                <div className="font-bold text-black flex items-center gap-2">
                                                    <span className="w-14 text-right">{c.count.toLocaleString()} <span className="text-[8px] font-normal text-[#777777]">PV</span></span>
                                                    <span className="w-16 text-right text-[#777777]">予約: {c.reserve.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-xs text-[#777777] tracking-widest">データがありません</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Store Ranking - show only if Home tab */}
                        {activeTab === 'home' && (
                            <div className="bg-white border border-[#E5E5E5]">
                                <div className="p-4 border-b border-[#E5E5E5] bg-[#F9F9F9]">
                                    <h3 className="text-xs font-bold tracking-widest flex items-center gap-2">
                                        <BarChart2 size={14} className="stroke-[2]" />
                                        店舗別 PVランキング
                                    </h3>
                                </div>
                                <div>
                                    {rankedStores.length > 0 ? (
                                        rankedStores.map((s, idx) => (
                                            <div 
                                                key={s.id} 
                                                className="flex items-center justify-between text-[10px] uppercase bg-[#F9F9F9] px-2 py-1.5 border-b border-[#E5E5E5] last:border-b-0 hover:bg-white transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className={\`w-3.5 h-3.5 rounded-none shrink-0 flex items-center justify-center text-[8px] font-bold \${idx < 3 ? 'bg-black text-white' : 'bg-[#E5E5E5] text-[#777777]'}\`}>{idx + 1}</span>
                                                    <span className="text-[#777777] font-bold truncate max-w-[120px]">{s.name}</span>
                                                </div>
                                                <div className="font-bold text-black flex items-center gap-2">
                                                    <span className="w-14 text-right">{s.count.toLocaleString()} <span className="text-[8px] font-normal text-[#777777]">PV</span></span>
                                                    <span className="w-16 text-right text-[#777777]">予約: {s.reserve.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-xs text-[#777777] tracking-widest">データがありません</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Daily List - Show for all tabs to see total trend */}
                        {(activeTab === 'cast' || activeTab === 'home' || activeTab === 'users') && activeTab !== 'users' && (`;

if (content.includes(targetUILists)) {
    content = content.replace(targetUILists, replaceUILists);
} else {
    console.log("Could not find targetUILists. Checking alternative...");
    // maybe setSelectedCastId was already removed or modified
    const fallbackTarget = `{/* Cast Ranking - show only if Cast tab */}
                        {activeTab === 'cast' && (`;
    if (content.includes(fallbackTarget)) {
        console.log("Fallback target found.");
    }
}

// Also rename "店舗アクセス" to "店舗別" in the tabs UI
content = content.replace(`店舗アクセス\n                    </button>`, `店舗別\n                    </button>`);

fs.writeFileSync('src/app/admin/analytics/page.tsx', content);
console.log('Done.');
