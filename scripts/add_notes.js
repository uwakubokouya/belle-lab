const fs = require('fs');

let c = fs.readFileSync('src/app/reserve/[castId]/page.tsx', 'utf-8');

// 1. Add useState
const tState = `    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);\n    const [errorMsg, setErrorMsg] = useState<string | null>(null);`;
const rState = `    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);\n    const [customerNotes, setCustomerNotes] = useState("");\n    const [errorMsg, setErrorMsg] = useState<string | null>(null);`;

let newC = c.split(tState).join(rState);
if (newC === c) {
    newC = c.split(tState.replace(/\n/g, '\r\n')).join(rState.replace(/\n/g, '\r\n'));
}
c = newC;

// 2. Add textarea UI
const tUI = `                            </div>\n                        </div>\n\n                        <div className="bg-black p-5 text-[10px] text-white tracking-widest leading-relaxed font-light text-left space-y-3">`;
const rUI = `                            </div>\n                        </div>\n\n                        <div className="space-y-3 pt-4">\n                            <label className="text-sm font-normal tracking-widest flex items-center gap-2">\n                                希望連絡時間やその他備考\n                            </label>\n                            <textarea \n                                className="w-full border border-[#E5E5E5] bg-[#F9F9F9] p-4 text-xs tracking-widest leading-relaxed focus:outline-none focus:border-black transition-colors resize-none"\n                                rows={4}\n                                placeholder="ご希望の連絡時間帯や、お店へのご要望などをご自由にお書きください。"\n                                value={customerNotes}\n                                onChange={(e) => setCustomerNotes(e.target.value)}\n                            ></textarea>\n                        </div>\n\n                        <div className="bg-black p-5 text-[10px] text-white tracking-widest leading-relaxed font-light text-left space-y-3">`;

newC = c.split(tUI).join(rUI);
if (newC === c) {
    newC = c.split(tUI.replace(/\n/g, '\r\n')).join(rUI.replace(/\n/g, '\r\n'));
}
c = newC;

fs.writeFileSync('src/app/reserve/[castId]/page.tsx', c);
console.log('Added notes textarea in step 4');
