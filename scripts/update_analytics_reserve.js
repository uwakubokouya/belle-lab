const fs = require('fs');

let c = fs.readFileSync('src/app/admin/analytics/page.tsx', 'utf-8');

// 1. Fetch query modification
c = c.replace(
    `.eq('page_type', activeTab === 'home' ? 'home' : 'cast_profile')`,
    `.in('page_type', activeTab === 'home' ? ['home'] : ['cast_profile', 'reserve_click'])`
);

// add 'page_type' to select
c = c.replace(
    `.select('created_at, target_id')`,
    `.select('created_at, target_id, page_type')`
);

// 2. Aggregations modification
const aggOld = `    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const dailyCounts = new Array(daysInMonth).fill(0);
    
    let filteredViews = pageViews;
    if (activeTab === 'cast' && selectedCastId !== 'all') {
        filteredViews = pageViews.filter(v => v.target_id === selectedCastId);
    }
    
    filteredViews.forEach(v => {
        const d = new Date(v.created_at);
        // timezone adjustments might be needed depending on DB, but assume UTC->Local works fine here
        const dayIdx = d.getDate() - 1; 
        if (dayIdx >= 0 && dayIdx < daysInMonth) {
            dailyCounts[dayIdx]++;
        }
    });

    const totalViews = dailyCounts.reduce((sum, count) => sum + count, 0);`;

const aggNew = `    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const dailyCounts = new Array(daysInMonth).fill(0);
    const dailyReserveCounts = new Array(daysInMonth).fill(0);
    
    let filteredViews = pageViews;
    if (activeTab === 'cast' && selectedCastId !== 'all') {
        filteredViews = pageViews.filter(v => v.target_id === selectedCastId);
    }
    
    filteredViews.forEach(v => {
        const d = new Date(v.created_at);
        const dayIdx = d.getDate() - 1; 
        if (dayIdx >= 0 && dayIdx < daysInMonth) {
            if (v.page_type === 'reserve_click') {
                dailyReserveCounts[dayIdx]++;
            } else {
                dailyCounts[dayIdx]++;
            }
        }
    });

    const totalViews = dailyCounts.reduce((sum, count) => sum + count, 0);
    const totalReserves = dailyReserveCounts.reduce((sum, count) => sum + count, 0);`;

c = c.split(aggOld).join(aggNew);
c = c.split(aggOld.replace(/\n/g, '\r\n')).join(aggNew.replace(/\n/g, '\r\n'));

// 3. Ranking calculation modification
const rankOld = `    // If 'all' casts is selected, we can also show a ranking
    const castRanking = new Map<string, number>();
    if (activeTab === 'cast' && selectedCastId === 'all') {
        filteredViews.forEach(v => {
            if (v.target_id) {
                castRanking.set(v.target_id, (castRanking.get(v.target_id) || 0) + 1);
            }
        });
    }
    const rankedCasts = Array.from(castRanking.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([id, count]) => {
            const cast = casts.find(c => c.id === id);
            return { name: cast ? cast.name : 'Unknown', count, id };
        });`;

const rankNew = `    // If 'all' casts is selected, we can also show a ranking
    const castRanking = new Map<string, {pv: number, reserve: number}>();
    if (activeTab === 'cast' && selectedCastId === 'all') {
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

c = c.split(rankOld).join(rankNew);
c = c.split(rankOld.replace(/\n/g, '\r\n')).join(rankNew.replace(/\n/g, '\r\n'));

// 4. Summarize view modification
const sumOld = `                        {/* Summary Card */}
                        <div className="bg-black text-white p-6 flex flex-col items-center justify-center text-center">
                            <p className="text-[10px] tracking-widest uppercase text-[#AAAAAA] mb-2">
                                {activeTab === 'cast' && selectedCastId === 'all' ? '全体合計 PV' : '月間合計 PV'}
                            </p>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-light tracking-wider">{totalViews.toLocaleString()}</span>
                                <span className="text-xs mb-1 tracking-widest text-[#CCCCCC]">PV</span>
                            </div>
                        </div>`;

const sumNew = `                        {/* Summary Card */}
                        <div className="bg-black text-white p-6 flex flex-col items-center justify-center text-center">
                            <p className="text-[10px] tracking-widest uppercase text-[#AAAAAA] mb-2">
                                {activeTab === 'cast' && selectedCastId === 'all' ? '全体合計 PV' : '月間合計 PV'}
                            </p>
                            <div className="flex items-end gap-2 mb-4">
                                <span className="text-4xl font-light tracking-wider">{totalViews.toLocaleString()}</span>
                                <span className="text-xs mb-1 tracking-widest text-[#CCCCCC]">PV</span>
                            </div>
                            {activeTab === 'cast' && (
                            <div className="flex items-center gap-2 text-[#AAAAAA] text-[10px] tracking-widest border-t border-white/20 pt-4 w-full justify-center">
                                予約クリック合計: <span className="text-white font-bold text-xs">{totalReserves.toLocaleString()}</span> 回
                            </div>
                            )}
                        </div>`;

c = c.split(sumOld).join(sumNew);
c = c.split(sumOld.replace(/\n/g, '\r\n')).join(sumNew.replace(/\n/g, '\r\n'));

// 5. Ranking item modification
const riOld = `                                                <div className="flex items-end gap-1">
                                                    <span className="text-lg font-medium tracking-wider">{c.count.toLocaleString()}</span>
                                                    <span className="text-[10px] text-[#777777] mb-[2px]">PV</span>
                                                </div>`;

const riNew = `                                                <div className="flex flex-col items-end gap-1">
                                                    <div className="flex items-end gap-1">
                                                        <span className="text-lg font-medium tracking-wider">{c.count.toLocaleString()}</span>
                                                        <span className="text-[10px] text-[#777777] mb-[2px]">PV</span>
                                                    </div>
                                                    <div className="text-[9px] text-[#AAAAAA] tracking-widest">
                                                        予約へ: {c.reserve.toLocaleString()}
                                                    </div>
                                                </div>`;

c = c.split(riOld).join(riNew);
c = c.split(riOld.replace(/\n/g, '\r\n')).join(riNew.replace(/\n/g, '\r\n'));

// 6. Daily List item modification
const diOld = `                                            <div className="flex items-end gap-1">
                                                <span className={\`text-base tracking-wider \${isToday ? 'font-bold' : ''}\`}>
                                                    {count.toLocaleString()}
                                                </span>
                                                <span className="text-[10px] text-[#777777]">PV</span>
                                            </div>`;

const diNew = `                                            <div className="flex shrink-0 items-center justify-end gap-3 min-w-[80px]">
                                                <div className="flex items-end gap-1 w-16 justify-end">
                                                    <span className={\`text-base tracking-wider \${isToday ? 'font-bold' : ''}\`}>
                                                        {count.toLocaleString()}
                                                    </span>
                                                    <span className="text-[10px] text-[#777777] mb-[2px]">PV</span>
                                                </div>
                                                {activeTab === 'cast' && (
                                                <div className="flex items-end gap-1 w-20 justify-end border-l border-[#E5E5E5] pl-3">
                                                    <span className="text-base tracking-wider text-[#777777]">
                                                        {dailyReserveCounts[i].toLocaleString()}
                                                    </span>
                                                    <span className="text-[10px] text-[#AAAAAA] mb-[2px]">予約</span>
                                                </div>
                                                )}
                                            </div>`;

c = c.split(diOld).join(diNew);
c = c.split(diOld.replace(/\n/g, '\r\n')).join(diNew.replace(/\n/g, '\r\n'));

fs.writeFileSync('src/app/admin/analytics/page.tsx', c);
console.log('analytics updated to include reserve_click');
