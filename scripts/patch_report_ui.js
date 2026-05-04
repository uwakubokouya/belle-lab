const fs = require('fs');

const file = 'src/app/messages/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Insert states
const stateInjectionPoint = 'const [unsendCandidate, setUnsendCandidate] = useState<string | null>(null);';
const newStates = `const [unsendCandidate, setUnsendCandidate] = useState<string | null>(null);

  // Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCategory, setReportCategory] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const reportOptions = [
    "暴言・誹謗中傷",
    "ドタキャン・無断キャンセル",
    "迷惑行為",
    "その他"
  ];`;
content = content.replace(stateInjectionPoint, newStates);

// 2. Change the button onClick
const buttonOld = `<button onClick={() => setShowMenu(false)} className="flex items-center gap-3 w-full text-left p-4 hover:bg-[#F9F9F9] transition-colors text-red-600">
                              <Flag size={16} className="stroke-[1.5] text-red-600" />
                              通報する / 報告する
                           </button>`;
const buttonNew = `<button onClick={() => { setShowMenu(false); setShowReportModal(true); }} className="flex items-center gap-3 w-full text-left p-4 hover:bg-[#F9F9F9] transition-colors text-red-600">
                              <Flag size={16} className="stroke-[1.5] text-red-600" />
                              通報する / 報告する
                           </button>`;
content = content.replace(buttonOld, buttonNew);

// 3. Inject the modal
const modalInjectionPoint = `{/* Partner Profile Modal */}`;
const reportModalCode = `{/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-sm p-6 border border-[#E5E5E5] flex flex-col relative shadow-sm">
             <button 
               onClick={() => setShowReportModal(false)}
               className="absolute top-4 right-4 text-black hover:text-[#777777] transition-colors"
             >
               <X size={20} className="stroke-[1.5]" />
             </button>
             
             <div className="flex items-center justify-center mb-6">
                <div className="w-10 h-10 border border-[#E02424] flex items-center justify-center text-[#E02424]">
                   <Flag size={18} className="stroke-[1.5]" />
                </div>
             </div>
             
             <h3 className="text-sm font-bold tracking-widest mb-4 uppercase text-center text-black border-b border-[#E5E5E5] pb-4">
               通報・報告する
             </h3>
             <p className="text-[10px] text-[#777777] tracking-widest leading-relaxed mb-6 text-center">
               運営に通報を送信します。<br />
               対象ユーザーの通報回数が加算され、運営が悪質と判断した場合はアカウント停止措置等を行います。
             </p>
             
             <div className="space-y-5 mb-8">
                <div className="space-y-3">
                   <label className="text-[10px] uppercase tracking-widest text-[#777777] block mb-2">Category (理由)</label>
                   {reportOptions.map(opt => (
                     <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                       <div className="relative flex items-center justify-center">
                         <input 
                           type="radio" 
                           name="report_category"
                           value={opt}
                           checked={reportCategory === opt}
                           onChange={(e) => setReportCategory(e.target.value)}
                           className="peer appearance-none w-4 h-4 border border-black checked:bg-black transition-colors cursor-pointer rounded-full"
                         />
                         <div className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"></div>
                       </div>
                       <span className="text-xs tracking-widest text-[#333333] group-hover:text-black transition-colors">{opt}</span>
                     </label>
                   ))}
                </div>
                
                <div className="space-y-2 pt-4 border-t border-[#E5E5E5]">
                   <label className="text-[10px] uppercase tracking-widest text-[#777777] block">Details (詳細)</label>
                   <textarea 
                     value={reportDetails}
                     onChange={e => setReportDetails(e.target.value)}
                     placeholder="詳細な理由をご記入ください..."
                     className="w-full border-b border-[#E5E5E5] pb-2 pt-2 min-h-[80px] text-sm outline-none focus:border-black transition-colors bg-transparent rounded-none resize-none leading-relaxed"
                   />
                </div>
             </div>
             
             <button 
               onClick={async () => {
                  if (!user || !id || !reportCategory) return;
                  const finalReason = \`\${reportCategory}\n詳細: \${reportDetails.trim() || 'なし'}\`;
                  
                  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
                  if (!isUuid) {
                      alert("無効なユーザーIDです。");
                      setShowReportModal(false);
                      return;
                  }

                  // RPC呼び出し
                  const { error } = await supabase.rpc('report_user', {
                      p_target_id: id,
                      p_reporter_id: user.id,
                      p_reason: finalReason
                  });

                  if (!error) {
                      alert("通報を受け付けました。運営にて確認いたします。");
                      setShowReportModal(false);
                      setReportCategory("");
                      setReportDetails("");
                  } else {
                      alert("通報の送信に失敗しました。");
                      console.error("Report error:", error);
                  }
               }}
               disabled={!reportCategory}
               className="premium-btn w-full py-4 text-xs tracking-widest flex items-center justify-center bg-[#E02424] text-white hover:bg-[#C81E1E] transition-colors disabled:opacity-50 disabled:bg-[#E5E5E5] disabled:text-[#777777]"
             >
               通報を送信する
             </button>
           </div>
        </div>
      )}

      {/* Partner Profile Modal */}`;

content = content.replace(modalInjectionPoint, reportModalCode);

fs.writeFileSync(file, content);
console.log('Patched report UI successfully');
