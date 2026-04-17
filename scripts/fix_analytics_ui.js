const fs = require('fs');

let c = fs.readFileSync('src/app/admin/analytics/page.tsx', 'utf-8');

// 1. Casts filter by 'casts' table
const tCasts = `    // Fetch casts for dropdown
    useEffect(() => {
        const fetchCasts = async () => {
            const { data } = await supabase.from('sns_profiles').select('id, name');
            if (data) {
                setCasts(data);
                // Also get actual casts table to merge real cast status if needed, but sns_profiles is enough for name mapping
            }
        };
        fetchCasts();
    }, []);`;

const rCasts = `    // Fetch casts for dropdown
    useEffect(() => {
        const fetchCasts = async () => {
            const { data } = await supabase.from('sns_profiles').select('id, name');
            if (data) {
                const { data: castsData } = await supabase.from('casts').select('id');
                const castIds = new Set(castsData?.map(c => c.id) || []);
                setCasts(data.filter(c => castIds.has(c.id)));
            }
        };
        fetchCasts();
    }, []);`;

c = c.split(tCasts).join(rCasts);
if(c === fs.readFileSync('src/app/admin/analytics/page.tsx', 'utf-8') && !c.includes(rCasts)) {
    c = c.split(tCasts.replace(/\n/g, '\r\n')).join(rCasts.replace(/\n/g, '\r\n'));
}

// 2. Rename tab from ホーム画面 to 店舗アクセス
const tTab = `                    <button 
                        onClick={() => setActiveTab('home')}
                        className={\`flex-1 py-3 text-xs tracking-widest uppercase transition-colors \${activeTab === 'home' ? 'bg-black text-white font-medium' : 'bg-white text-black hover:bg-[#F9F9F9]'}\`}
                    >
                        ホーム画面
                    </button>`;
const rTab = `                    <button 
                        onClick={() => setActiveTab('home')}
                        className={\`flex-1 py-3 text-xs tracking-widest uppercase transition-colors \${activeTab === 'home' ? 'bg-black text-white font-medium' : 'bg-white text-black hover:bg-[#F9F9F9]'}\`}
                    >
                        店舗アクセス
                    </button>`;
c = c.split(tTab).join(rTab);
if (!c.includes("店舗アクセス")) {
    c = c.split(tTab.replace(/\n/g, '\r\n')).join(rTab.replace(/\n/g, '\r\n'));
}

// 3. Show reserve summary for both tabs
const tSumm = `                            {activeTab === 'cast' && (
                            <div className="flex items-center gap-2 text-[#AAAAAA] text-[10px] tracking-widest border-t border-white/20 pt-4 w-full justify-center">
                                予約クリック合計: <span className="text-white font-bold text-xs">{totalReserves.toLocaleString()}</span> 回
                            </div>
                            )}`;
const rSumm = `                            <div className="flex items-center gap-2 text-[#AAAAAA] text-[10px] tracking-widest border-t border-white/20 pt-4 w-full justify-center">
                                予約クリック合計: <span className="text-white font-bold text-xs">{totalReserves.toLocaleString()}</span> 回
                            </div>`;
c = c.split(tSumm).join(rSumm);
if (!c.includes(rSumm)) {
    c = c.split(tSumm.replace(/\n/g, '\r\n')).join(rSumm.replace(/\n/g, '\r\n'));
}

// 4. Show reserve items for both tabs in daily list
const tItem = `                                                {activeTab === 'cast' && (
                                                <div className="flex items-end gap-1 w-20 justify-end border-l border-[#E5E5E5] pl-3">
                                                    <span className="text-base tracking-wider text-[#777777]">
                                                        {dailyReserveCounts[i].toLocaleString()}
                                                    </span>
                                                    <span className="text-[10px] text-[#AAAAAA] mb-[2px]">予約</span>
                                                </div>
                                                )}`;
const rItem = `                                                <div className="flex items-end gap-1 w-20 justify-end border-l border-[#E5E5E5] pl-3">
                                                    <span className="text-base tracking-wider text-[#777777]">
                                                        {dailyReserveCounts[i].toLocaleString()}
                                                    </span>
                                                    <span className="text-[10px] text-[#AAAAAA] mb-[2px]">予約</span>
                                                </div>`;
c = c.split(tItem).join(rItem);
if (!c.includes(rItem)) {
    c = c.split(tItem.replace(/\n/g, '\r\n')).join(rItem.replace(/\n/g, '\r\n'));
}

fs.writeFileSync('src/app/admin/analytics/page.tsx', c);
console.log('analytics UI updated');
