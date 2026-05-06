const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'cast', '[id]', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add MessageModal & PromptModal states if not present
if (!content.includes('const [messageModal')) {
    content = content.replace(
        'const [postedReviews, setPostedReviews] = useState<any[]>([]);',
        `const [postedReviews, setPostedReviews] = useState<any[]>([]);
  const [messageModal, setMessageModal] = useState<{isOpen: boolean, message: string}>({isOpen: false, message: ""});
  const [promptModal, setPromptModal] = useState<{isOpen: boolean, reviewId: string | null}>({isOpen: false, reviewId: null});
  const [reportReason, setReportReason] = useState("");
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, reviewId: string | null}>({isOpen: false, reviewId: null});`
    );
}

// 2. Action functions
if (!content.includes('const toggleReviewLike = async')) {
    // Insert before handleMessage
    content = content.replace(
        'const handleMessage = () => {',
        `const toggleReviewLike = async (reviewId: string) => {
    if (!user) {
        setShowAuthPrompt(true);
        return;
    }
    const isLiked = likedReviews.has(reviewId);
    
    setLikedReviews(prev => {
        const next = new Set(prev);
        if (isLiked) next.delete(reviewId);
        else next.add(reviewId);
        return next;
    });
    setReviewLikesCount(prev => ({
        ...prev,
        [reviewId]: Math.max(0, (prev[reviewId] || 0) + (isLiked ? -1 : 1))
    }));

    if (isLiked) {
        await supabase.from('sns_review_likes').delete().eq('review_id', reviewId).eq('user_id', user.id);
    } else {
        await supabase.from('sns_review_likes').insert({ review_id: reviewId, user_id: user.id });
    }
  };

  const handleReportReview = async () => {
    const reviewId = promptModal.reviewId;
    if (!user || !reviewId || !reportReason) return;

    await supabase.rpc('report_review', { p_review_id: reviewId, p_reporter_id: user.id, p_reason: reportReason });
    setPromptModal({isOpen: false, reviewId: null});
    setReportReason("");
    setMessageModal({isOpen: true, message: "通報を送信しました。運営にて確認いたします。"});
  };

  const handleDeleteReview = async () => {
    const reviewId = confirmModal.reviewId;
    if (!user || !reviewId) return;

    await supabase.from('sns_reviews').delete().eq('id', reviewId).eq('reviewer_id', user.id);
    setPostedReviews(prev => prev.filter(r => r.id !== reviewId));
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    setConfirmModal({isOpen: false, reviewId: null});
    setMessageModal({isOpen: true, message: "口コミを削除しました。"});
  };

  const handleMessage = () => {`
    );
}

// 3. Modals UI
if (!content.includes('{/* Report Prompt Modal */}')) {
    // Append modals at the very end before the last closing div.
    content = content.replace(
        '      {/* Auth Prompt Overlay (Glassmorphism) */})',
        `      {/* Auth Prompt Overlay (Glassmorphism) */})`
    ); // Fix typo in previous comments if any

    content = content.replace(
        '      {/* Auth Prompt Overlay (Glassmorphism) */}',
        `      {/* Report Prompt Modal */}
      {promptModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm border border-[#E5E5E5] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
             <h3 className="text-sm font-bold tracking-widest mb-4 flex items-center gap-2"><AlertTriangle size={16} /> 通報する</h3>
             <p className="text-[10px] text-[#777] mb-4">通報する理由を入力してください。</p>
             <textarea
               value={reportReason}
               onChange={(e) => setReportReason(e.target.value)}
               className="w-full h-24 border border-[#E5E5E5] p-3 text-xs outline-none focus:border-black mb-6 resize-none"
               placeholder="理由..."
             />
             <div className="flex gap-3">
               <button onClick={() => setPromptModal({isOpen: false, reviewId: null})} className="flex-1 py-3 text-xs tracking-widest border border-[#E5E5E5] hover:bg-[#F9F9F9] transition-colors">キャンセル</button>
               <button onClick={handleReportReview} disabled={!reportReason.trim()} className="flex-1 py-3 bg-black text-white text-xs tracking-widest hover:bg-[#333] transition-colors disabled:bg-[#E5E5E5]">送信する</button>
             </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm border border-[#E5E5E5] p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
             <h3 className="text-sm font-bold tracking-widest mb-4">口コミの削除</h3>
             <p className="text-xs text-[#333] mb-6 leading-relaxed">本当にこの口コミを削除しますか？<br/>削除した口コミは元に戻せません。</p>
             <div className="flex gap-3">
               <button onClick={() => setConfirmModal({isOpen: false, reviewId: null})} className="flex-1 py-3 text-xs tracking-widest border border-[#E5E5E5] hover:bg-[#F9F9F9] transition-colors">キャンセル</button>
               <button onClick={handleDeleteReview} className="flex-1 py-3 bg-[#E02424] text-white text-xs tracking-widest hover:bg-[#E02424]/90 transition-colors">削除する</button>
             </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {messageModal.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm border border-[#E5E5E5] p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
             <h3 className="text-sm font-bold tracking-widest mb-4 text-[#D4AF37]">確認</h3>
             <p className="text-xs text-[#333] mb-6 whitespace-pre-wrap leading-relaxed">{messageModal.message}</p>
             <button
               onClick={() => setMessageModal({ isOpen: false, message: "" })}
               className="w-full py-3 bg-black text-white text-xs tracking-widest font-bold hover:bg-[#333] transition-colors"
             >
               閉じる
             </button>
          </div>
        </div>
      )}

      {/* Auth Prompt Overlay (Glassmorphism) */}`
    );
}

// 4. Update the ActiveTab === 'reviews' Sort Dropdown & Loop
if (!content.includes('value={reviewSortMode}')) {
    // Find the opening of the reviews loop.
    // It looks like:
    // {reviews.length > 0 ? (
    //     <div className="space-y-[1px] bg-[#E5E5E5]">
    //         {reviews.map(review => (
    const target1 = `{reviews.length > 0 ? (
                    <div className="space-y-[1px] bg-[#E5E5E5]">
                        {reviews.map(review => (`

    const replacement1 = `{reviews.length > 0 ? (
                    <>
                    <div className="flex justify-between items-center mb-4 px-4 pt-4">
                        <span className="text-xs text-[#777]">全 {reviewStats.count} 件</span>
                        <select 
                            value={reviewSortMode} 
                            onChange={(e) => setReviewSortMode(e.target.value as any)}
                            className="text-xs border border-[#E5E5E5] p-2 bg-white outline-none"
                        >
                            <option value="newest">新着順</option>
                            <option value="highest">評価が高い順</option>
                            <option value="lowest">評価が低い順</option>
                        </select>
                    </div>
                    <div className="space-y-[1px] bg-[#E5E5E5]">
                        {(() => {
                            const sortedReviews = [...reviews].sort((a, b) => {
                                if (a.is_dummy || b.is_dummy) return 0;
                                if (reviewSortMode === 'highest') return b.rating - a.rating;
                                if (reviewSortMode === 'lowest') return a.rating - b.rating;
                                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                            });
                            return sortedReviews.map(review => (`;

    if (content.includes(target1)) {
        content = content.replace(target1, replacement1);
    }
}

// 5. Action Buttons & Reply Content for Reviews
if (!content.includes('店舗からの返信')) {
    const target2 = `                                <p className={\`text-xs leading-relaxed whitespace-pre-wrap \${review.is_dummy ? 'text-[#E5E5E5] select-none' : 'text-[#333333]'}\`}>
                                    {review.is_dummy ? "この内容はダミーです。VIP会員になると実際のリアルな口コミテキストを閲覧できます。この内容はダミーです。" : review.content}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (`

    const replacement2 = `                                <p className={\`text-xs leading-relaxed whitespace-pre-wrap \${review.is_dummy ? 'text-[#E5E5E5] select-none' : 'text-[#333333]'}\`}>
                                    {review.is_dummy ? "この内容はダミーです。VIP会員になると実際のリアルな口コミテキストを閲覧できます。この内容はダミーです。" : review.content}
                                </p>
                                
                                {/* 店舗からの返信 */}
                                {review.reply_content && (
                                    <div className="mt-4 bg-[#FAFAFA] p-4 border border-[#E5E5E5] relative ml-4">
                                        <div className="absolute -left-2 top-4 w-2 h-2 border-t border-r border-[#E5E5E5] bg-[#FAFAFA] transform -rotate-[135deg]"></div>
                                        <div className="flex items-center gap-2 mb-2 text-[#D4AF37]">
                                            <MessageCircle size={14} />
                                            <span className="text-[10px] font-bold tracking-widest uppercase">店舗からの返信</span>
                                        </div>
                                        <p className="text-[11px] leading-relaxed whitespace-pre-wrap text-[#333]">{review.reply_content}</p>
                                    </div>
                                )}
                                
                                {/* いいね & 通報ボタン */}
                                {!review.is_dummy && (
                                    <div className="mt-4 flex items-center justify-between border-t border-[#E5E5E5] pt-3">
                                        <button 
                                            onClick={() => toggleReviewLike(review.id)}
                                            className={\`flex items-center gap-1 text-[10px] tracking-widest font-bold transition-colors \${likedReviews.has(review.id) ? 'text-[#E02424]' : 'text-[#777] hover:text-black'}\`}
                                        >
                                            <Heart size={14} className={likedReviews.has(review.id) ? 'fill-[#E02424] text-[#E02424]' : 'stroke-[1.5]'} />
                                            参考になった {reviewLikesCount[review.id] || 0}
                                        </button>
                                        {user && user.id !== review.reviewer_id && (
                                            <button 
                                                onClick={() => {
                                                    if (!user) {
                                                        setShowAuthPrompt(true);
                                                        return;
                                                    }
                                                    setPromptModal({isOpen: true, reviewId: review.id});
                                                }}
                                                className="flex items-center gap-1 text-[10px] tracking-widest text-[#777] hover:text-[#E02424] transition-colors"
                                            >
                                                <AlertTriangle size={14} />
                                                通報
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ));
                        })()}
                    </div>
                    </>
                ) : (`

    if (content.includes(target2)) {
        content = content.replace(target2, replacement2);
    }
}

// 6. Customer posted_reviews: Add Delete Button and Reply Display
if (!content.includes('削除する')) {
    const target3 = `                                <p className={\`text-[11px] text-[#333333] leading-relaxed whitespace-pre-wrap font-light mb-3 break-words w-full \${review.is_dummy ? 'select-none blur-[4px] text-[#D4AF37] opacity-80 pointer-events-none' : ''}\`}>
                                    {review.content}
                                </p>
                                
                                <div className="w-full flex justify-between items-center text-[9px] text-[#777777] tracking-widest">
                                    <span>{new Date(review.created_at).toLocaleDateString('ja-JP')}</span>
                                    {review.visibility === 'secret' && (
                                        <span className="text-[#D4AF37] font-bold flex items-center gap-1">
                                            <Lock size={10} /> VIP限定
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (`

    const replacement3 = `                                <p className={\`text-[11px] text-[#333333] leading-relaxed whitespace-pre-wrap font-light mb-3 break-words w-full \${review.is_dummy ? 'select-none blur-[4px] text-[#D4AF37] opacity-80 pointer-events-none' : ''}\`}>
                                    {review.content}
                                </p>
                                
                                {/* 店舗からの返信 */}
                                {review.reply_content && (
                                    <div className="mt-2 mb-3 bg-[#FAFAFA] p-3 border border-[#E5E5E5] relative ml-2">
                                        <div className="absolute -left-1.5 top-3 w-1.5 h-1.5 border-t border-r border-[#E5E5E5] bg-[#FAFAFA] transform -rotate-[135deg]"></div>
                                        <div className="flex items-center gap-2 mb-1 text-[#D4AF37]">
                                            <MessageCircle size={10} />
                                            <span className="text-[9px] font-bold tracking-widest uppercase">店舗からの返信</span>
                                        </div>
                                        <p className="text-[10px] leading-relaxed whitespace-pre-wrap text-[#333]">{review.reply_content}</p>
                                    </div>
                                )}
                                
                                <div className="w-full flex justify-between items-center text-[9px] text-[#777777] tracking-widest">
                                    <span>{new Date(review.created_at).toLocaleDateString('ja-JP')}</span>
                                    {review.visibility === 'secret' && (
                                        <span className="text-[#D4AF37] font-bold flex items-center gap-1">
                                            <Lock size={10} /> VIP限定
                                        </span>
                                    )}
                                </div>
                                
                                {/* 削除ボタン */}
                                {user && user.id === review.reviewer_id && (
                                    <div className="mt-3 flex items-center justify-end border-t border-[#E5E5E5] pt-2">
                                        <button 
                                            onClick={() => setConfirmModal({isOpen: true, reviewId: review.id})}
                                            className="flex items-center gap-1 text-[10px] tracking-widest text-[#E02424] hover:text-[#B91C1C] transition-colors font-bold"
                                        >
                                            <X size={12} className="stroke-[2]" />
                                            削除する
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (`

    if (content.includes(target3)) {
        content = content.replace(target3, replacement3);
    }
}

fs.writeFileSync(filePath, content);
console.log("Successfully patched cast/[id]/page.tsx using exact string replacements.");
