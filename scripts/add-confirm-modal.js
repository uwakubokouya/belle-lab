const fs = require('fs');

let c = fs.readFileSync('src/app/reserve/[castId]/page.tsx', 'utf-8');

// 1. Add state showConfirmModal
const tState = `    const [isSuccess, setIsSuccess] = useState(false);`;
const rState = `    const [isSuccess, setIsSuccess] = useState(false);\n    const [showConfirmModal, setShowConfirmModal] = useState(false);`;
c = c.split(tState).join(rState);

// 2. Add Error Modal and Confirm Modal
const tModal = `                            閉じる\n                        </button>\n                    </div>\n                </div>\n            )}\n\n            {/* Bottom Actions Fixed */}`;

const rModal = `                            閉じる\n                        </button>\n                    </div>\n                </div>\n            )}

            {showConfirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white p-6 shadow-xl max-w-sm w-full text-center space-y-6 border border-[#E5E5E5]">
                        <div className="text-black text-sm font-bold tracking-widest pb-3 border-b border-[#E5E5E5]">
                            最終確認
                        </div>
                        <p className="text-sm tracking-widest leading-loose py-2">
                            この内容で予約リクエストを送信します。<br/>
                            よろしいですか？
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowConfirmModal(false)}
                                disabled={isSubmitting}
                                className="premium-btn flex-1 py-3 bg-white text-black border border-[#E5E5E5] text-xs tracking-widest disabled:opacity-50"
                            >
                                キャンセル
                            </button>
                            <button 
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    handleSubmit();
                                }}
                                disabled={isSubmitting}
                                className="premium-btn flex-1 py-3 bg-black text-white border border-black text-xs tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    '送信する'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}\n\n            {/* Bottom Actions Fixed */}`;
c = c.split(tModal).join(rModal);

// 3. Change Confirm button onClick
const tBtn = `                    <button \n                        onClick={handleSubmit}\n                        disabled={isSubmitting}\n                        className="premium-btn py-4 flex items-center justify-center gap-3 w-full text-sm tracking-widest bg-black text-white hover:bg-white hover:text-black hover:border-black border transition-all disabled:opacity-50">\n                        {isSubmitting ? (\n                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>\n                        ) : (\n                            <><Check size={18} className="stroke-[1.5]" />予約を確定する</>\n                        )}\n                    </button>`;

const rBtn = `                    <button \n                        onClick={() => setShowConfirmModal(true)}\n                        className="premium-btn py-4 flex items-center justify-center gap-3 w-full text-sm tracking-widest bg-black text-white hover:bg-white hover:text-black hover:border-black border transition-all">\n                        <Check size={18} className="stroke-[1.5]" />\n                        予約を確定する\n                    </button>`;

c = c.split(tBtn).join(rBtn);

fs.writeFileSync('src/app/reserve/[castId]/page.tsx', c);
console.log('Added confirm modal');
