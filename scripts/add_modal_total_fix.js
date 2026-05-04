const fs = require('fs');

let content = fs.readFileSync('src/app/admin/analytics/page.tsx', 'utf8');

const target = `                                </div>
                            )})}
                        </div>`;
const totalRow = `                                </div>
                            )})}
                            {/* Total Row */}
                            <div className="flex items-center justify-between text-[10px] uppercase px-4 py-3 bg-black text-white">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold tracking-widest text-white">合計</span>
                                </div>
                                <div className="font-bold flex items-center gap-2">
                                    <span className="w-14 text-right">{modalDailyCounts.reduce((a, b) => a + b, 0).toLocaleString()} <span className="text-[8px] font-normal text-[#AAAAAA] ml-0.5">PV</span></span>
                                    <span className="w-18 text-right text-[#AAAAAA] border-l border-[#555555] pl-2">予約: {modalDailyReserves.reduce((a, b) => a + b, 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>`;

if (content.includes(target)) {
    content = content.replace(target, totalRow);
    console.log("Added total row to modal.");
} else {
    console.log("Could not find target in file.");
    
    // try fallback
    let lines = content.split(/\r?\n/);
    let count = 0;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('modalDailyReserves[i].toLocaleString()')) {
            for (let j = i; j < i + 5; j++) {
                if (lines[j].includes(')})}')) {
                    lines.splice(j + 1, 0, `                            {/* Total Row */}
                            <div className="flex items-center justify-between text-[10px] uppercase px-4 py-3 bg-black text-white">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold tracking-widest text-white">合計</span>
                                </div>
                                <div className="font-bold flex items-center gap-2">
                                    <span className="w-14 text-right">{modalDailyCounts.reduce((a, b) => a + b, 0).toLocaleString()} <span className="text-[8px] font-normal text-[#AAAAAA] ml-0.5">PV</span></span>
                                    <span className="w-18 text-right text-[#AAAAAA] border-l border-[#555555] pl-2">予約: {modalDailyReserves.reduce((a, b) => a + b, 0).toLocaleString()}</span>
                                </div>
                            </div>`);
                    count++;
                    break;
                }
            }
            break;
        }
    }
    
    if (count > 0) {
        content = lines.join('\n');
        console.log("Added total row to modal (fallback).");
    } else {
        console.log("Failed completely.");
    }
}

fs.writeFileSync('src/app/admin/analytics/page.tsx', content, 'utf8');
console.log('Done modifying analytics page');
