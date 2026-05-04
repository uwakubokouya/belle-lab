const fs = require('fs');

let content = fs.readFileSync('src/app/admin/analytics/page.tsx', 'utf8');

// 1. Add X import
if (content.includes('import { ChevronLeft, ChevronRight, BarChart2 } from "lucide-react";')) {
    content = content.replace(
        'import { ChevronLeft, ChevronRight, BarChart2 } from "lucide-react";', 
        'import { ChevronLeft, ChevronRight, BarChart2, X } from "lucide-react";'
    );
}

// 2. Add state
const stateTarget = `const [isFetching, setIsFetching] = useState(false);`;
const stateReplace = `const [isFetching, setIsFetching] = useState(false);\n    const [selectedCastForModal, setSelectedCastForModal] = useState<{id: string, name: string} | null>(null);`;
content = content.replace(stateTarget, stateReplace);

// 3. Add modal daily calculation
const calcTarget = `const dailyUserCounts = new Array(daysInMonth).fill(0);`;
const calcReplace = `const modalDailyCounts = new Array(daysInMonth).fill(0);\n    const modalDailyReserves = new Array(daysInMonth).fill(0);\n    if (selectedCastForModal) {\n        pageViews.filter(v => v.target_id === selectedCastForModal.id).forEach(v => {\n            const d = new Date(v.created_at);\n            const dayIdx = d.getDate() - 1;\n            if (dayIdx >= 0 && dayIdx < daysInMonth) {\n                if (v.page_type === 'reserve_click') {\n                    modalDailyReserves[dayIdx]++;\n                } else {\n                    modalDailyCounts[dayIdx]++;\n                }\n            }\n        });\n    }\n\n    const dailyUserCounts = new Array(daysInMonth).fill(0);`;
content = content.replace(calcTarget, calcReplace);

// 4. Make rankedCasts row clickable
const rowTarget = `className="flex items-center justify-between text-[10px] uppercase bg-[#F9F9F9] px-2 py-1.5 border-b border-[#E5E5E5] last:border-b-0 hover:bg-white transition-colors"`;
const rowReplace = `onClick={() => setSelectedCastForModal({ id: c.id, name: c.name || 'Unknown' })}\n                                                className="flex items-center justify-between text-[10px] uppercase bg-[#F9F9F9] px-2 py-1.5 border-b border-[#E5E5E5] last:border-b-0 hover:bg-white transition-colors cursor-pointer"`;
content = content.replace(rowTarget, rowReplace);

// 5. Add Modal UI before the end of main
const modalUI = `
            {/* Selected Cast Modal */}
            {selectedCastForModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm border border-black shadow-2xl relative max-h-[80vh] flex flex-col">
                        <button onClick={() => setSelectedCastForModal(null)} className="absolute top-4 right-4 p-2 bg-[#F9F9F9] text-[#777] hover:text-black transition-colors z-10">
                            <X size={18} />
                        </button>
                        <div className="p-6 pb-4 border-b border-[#E5E5E5] shrink-0">
                            <h2 className="text-sm font-bold tracking-widest text-center truncate pr-8">{selectedCastForModal.name}</h2>
                            <p className="text-[10px] text-center text-[#777777] mt-1 tracking-widest uppercase">{selectedDate.getFullYear()}年 {selectedDate.getMonth() + 1}月 日別アクセス</p>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {modalDailyCounts.map((count, i) => {
                                const isToday = new Date().getDate() === (i + 1) && new Date().getMonth() === selectedDate.getMonth();
                                return (
                                <div key={i} className={\`flex items-center justify-between text-[10px] uppercase px-4 py-2 border-b border-[#E5E5E5] last:border-b-0 \${isToday ? 'bg-white' : 'bg-[#F9F9F9]'}\`}>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[#777777] font-bold">{i + 1}日 {isToday && <span className="bg-black text-white px-1 ml-1 text-[8px] rounded-none">TODAY</span>}</span>
                                    </div>
                                    <div className="font-bold text-black flex items-center gap-2">
                                        <span className="w-14 text-right">{count.toLocaleString()} <span className="text-[8px] font-normal text-[#777777] ml-0.5">PV</span></span>
                                        <span className="w-18 text-right text-[#777777] border-l border-[#E5E5E5] pl-2">予約: {modalDailyReserves[i].toLocaleString()}</span>
                                    </div>
                                </div>
                            )})}
                        </div>
                        <div className="bg-[#F9F9F9] p-4 border-t border-[#E5E5E5] shrink-0">
                            <button onClick={() => setSelectedCastForModal(null)} className="w-full bg-black text-white py-3 text-[11px] font-bold tracking-widest hover:bg-[#333] transition-colors uppercase">
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            )}
`;

const endTarget = `</main>\n        </div>`;
content = content.replace(endTarget, `${modalUI}            </main>\n        </div>`);

fs.writeFileSync('src/app/admin/analytics/page.tsx', content, 'utf8');
console.log('Done adding cast modal');
