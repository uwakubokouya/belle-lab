const fs = require('fs');

let c = fs.readFileSync('src/app/reserve/[castId]/page.tsx', 'utf-8');

const tCourse = `                            {selectedCourseItem && (
                                <div className="flex justify-between border-b border-[#E5E5E5] pb-2">
                                    <span className="text-[#777777]">コース</span>
                                    <span>{selectedCourseItem.label || selectedCourseItem.name}</span>
                                </div>
                            )}`;

const rCourse = `                            {selectedCourseItem && (
                                <div className="flex justify-between border-b border-[#E5E5E5] pb-2 text-[11px]">
                                    <span className="text-[#777777]">コース</span>
                                    <span>{selectedCourseItem.label || selectedCourseItem.name}</span>
                                </div>
                            )}
                            {selectedNomination && (
                                <div className="flex justify-between border-b border-[#E5E5E5] pb-2 text-[11px]">
                                    <span className="text-[#777777]">指名</span>
                                    <span>{selectedNomination.label || selectedNomination.name}</span>
                                </div>
                            )}
                            {selectedOptions.length > 0 && (
                                <div className="flex flex-col border-b border-[#E5E5E5] pb-2 space-y-1 text-[11px]">
                                    <span className="text-[#777777]">オプション</span>
                                    {selectedOptions.map(o => (
                                        <div key={o.id} className="flex justify-end">
                                            <span>{o.label || o.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {selectedDiscount && (
                                <div className="flex justify-between border-b border-[#E5E5E5] pb-2 text-[#e23c3c] text-[11px]">
                                    <span>割引</span>
                                    <span>{selectedDiscount.label || selectedDiscount.name}</span>
                                </div>
                            )}
                            {customerNotes && (
                                <div className="flex flex-col border-b border-[#E5E5E5] pb-2 space-y-1 text-[11px]">
                                    <span className="text-[#777777]">ご要望・備考</span>
                                    <span className="whitespace-pre-wrap text-left break-words leading-relaxed">{customerNotes}</span>
                                </div>
                            )}`;

let newC = c.split(tCourse).join(rCourse);
if (newC === c) {
    newC = c.split(tCourse.replace(/\n/g, '\r\n')).join(rCourse.replace(/\n/g, '\r\n'));
}

fs.writeFileSync('src/app/reserve/[castId]/page.tsx', newC);
console.log('Appended missed details to confirm modal');
