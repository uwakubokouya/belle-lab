const fs = require('fs');
const path = require('path');

const file_path = path.join(__dirname, '..', 'src', 'app', 'cast', '[id]', 'page.tsx');
let content = fs.readFileSync(file_path, 'utf8');

// 1. Add states
if (!content.includes('const [reviewSortMode')) {
    content = content.replace(
        'const [showReviewWarning, setShowReviewWarning] = useState(false);',
        `const [showReviewWarning, setShowReviewWarning] = useState(false);
  const [reviewSortMode, setReviewSortMode] = useState<'newest' | 'highest' | 'lowest'>('newest');
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());
  const [reviewLikesCount, setReviewLikesCount] = useState<Record<string, number>>({});`
    );
}

// 2. Fetch Review changes (reply_content, etc)
content = content.replace(
    'id, rating, score, visited_date, content, created_at, reviewer_id, visibility, status,',
    'id, rating, score, visited_date, content, created_at, reviewer_id, visibility, status, reply_content, reply_created_at,'
);

// 3. Likes Fetching in fetchReviews
if (!content.includes('const { data: likesData }')) {
    content = content.replace(
        'setReviewStats({ average: Math.round(avg * 10) / 10, count: finalRevs.length });\n         } else {\n            setReviews([]);\n            setReviewStats({ average: 0, count: 0 });\n         }',
        `setReviewStats({ average: Math.round(avg * 10) / 10, count: finalRevs.length });
            
            // Fetch likes
            const { data: likesData } = await supabase.from('sns_review_likes').select('review_id, user_id');
            if (likesData) {
                const counts: Record<string, number> = {};
                const myLikes = new Set<string>();
                likesData.forEach(like => {
                    counts[like.review_id] = (counts[like.review_id] || 0) + 1;
                    if (user && user.id === like.user_id) myLikes.add(like.review_id);
                });
                setReviewLikesCount(counts);
                setLikedReviews(myLikes);
            }

         } else {
            setReviews([]);
            setReviewStats({ average: 0, count: 0 });
         }`
    );
}

// 4. Action Functions
if (!content.includes('toggleReviewLike')) {
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

  const handleReportReview = async (reviewId: string) => {
    if (!user) {
        setShowAuthPrompt(true);
        return;
    }
    const reason = window.prompt("通報する理由を入力してください:");
    if (!reason) return;

    await supabase.rpc('report_review', { p_review_id: reviewId, p_reporter_id: user.id, p_reason: reason });
    alert("通報を送信しました。");
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!user) return;
    const confirm = window.confirm("本当にこの口コミを削除しますか？");
    if (!confirm) return;

    await supabase.from('sns_reviews').delete().eq('id', reviewId).eq('reviewer_id', user.id);
    setPostedReviews(prev => prev.filter(r => r.id !== reviewId));
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  const handleMessage = () => {`
    );
}

// 5. Review render logic (activeTab === 'reviews')
if (!content.includes('const sortedReviews = [...reviews].sort(')) {
    content = content.replace(
        `{reviews.length === 0 ? (
                 <div className="bg-[#F9F9F9] border border-[#E5E5E5] p-10 flex flex-col items-center text-center">
                   <Star className="text-[#E5E5E5] mb-4 stroke-[1.5]" size={32} />
                   <p className="text-xs text-[#777] tracking-widest mb-4">まだ口コミはありません</p>
                   {(!user || user.role === 'customer') && (
                     <button 
                       onClick={() => setShowReviewWarning(true)}
                       className="px-6 py-3 bg-black text-white text-xs tracking-widest hover:bg-[#333] transition-colors"
                     >
                       最初の口コミを投稿する
                     </button>
                   )}
                 </div>
               ) : (
                 <div className="space-y-6">
                   {reviews.map((review: any) => (`,
        `{reviews.length === 0 ? (
                 <div className="bg-[#F9F9F9] border border-[#E5E5E5] p-10 flex flex-col items-center text-center">
                   <Star className="text-[#E5E5E5] mb-4 stroke-[1.5]" size={32} />
                   <p className="text-xs text-[#777] tracking-widest mb-4">まだ口コミはありません</p>
                   {(!user || user.role === 'customer') && (
                     <button 
                       onClick={() => setShowReviewWarning(true)}
                       className="px-6 py-3 bg-black text-white text-xs tracking-widest hover:bg-[#333] transition-colors"
                     >
                       最初の口コミを投稿する
                     </button>
                   )}
                 </div>
               ) : (
                 <>
                 <div className="flex justify-between items-center mb-4">
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
                 <div className="space-y-6">
                   {(() => {
                       const sortedReviews = [...reviews].sort((a, b) => {
                           if (a.is_dummy || b.is_dummy) return 0;
                           if (reviewSortMode === 'highest') return b.rating - a.rating;
                           if (reviewSortMode === 'lowest') return a.rating - b.rating;
                           return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                       });
                       return sortedReviews.map((review: any) => (`
    );
    
    // Close the IIFE parenthesis for map
    // We need to replace the closing `))}</div>` with `}))}</div></>` for the activeTab === 'reviews'
    // Let's use regex
    content = content.replace(
        /\{\/\* Reply Section \*\/\}[\s\S]*?\}\)\}\n\s*<\/div>/, // if already there? no
        `{/* Reply Section */}
                   {review.reply_content && (
                       <div className="mt-4 bg-[#FAFAFA] p-4 border border-[#E5E5E5] relative ml-4">
                           <div className="absolute -left-2 top-4 w-2 h-2 border-t border-r border-[#E5E5E5] bg-[#FAFAFA] transform -rotate-135"></div>
                           <div className="flex items-center gap-2 mb-2 text-[#D4AF37]">
                               <MessageCircle size={14} />
                               <span className="text-[10px] font-bold tracking-widest uppercase">店舗からの返信</span>
                           </div>
                           <p className="text-xs leading-relaxed whitespace-pre-wrap text-[#333]">{review.reply_content}</p>
                       </div>
                   )}

                   {/* Action Buttons */}
                   {!review.is_dummy && (
                       <div className="mt-4 flex items-center justify-between border-t border-[#E5E5E5] pt-3">
                           <button 
                               onClick={() => toggleReviewLike(review.id)}
                               className={\`flex items-center gap-1 text-[10px] tracking-widest font-bold transition-colors \${likedReviews.has(review.id) ? 'text-[#E02424]' : 'text-[#777] hover:text-black'}\`}
                           >
                               <Heart size={14} className={likedReviews.has(review.id) ? 'fill-[#E02424]' : ''} />
                               参考になった {reviewLikesCount[review.id] || 0}
                           </button>
                           {user && user.id !== review.reviewer_id && (
                               <button 
                                   onClick={() => handleReportReview(review.id)}
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
               </>`
    );
    
    // Wait, let's just find the exact spot. 
    // The previous replace inserted `{(() => { const sortedReviews ... return sortedReviews.map((review: any) => (`
    // Now we need to append the action buttons inside the loop.
    // In `src/app/cast/[id]/page.tsx`, the review rendering has:
    // ` <div className="bg-[#F9F9F9] p-4 border border-[#E5E5E5]">`
    // `   <p className="text-xs leading-relaxed whitespace-pre-wrap text-[#333]">{review.content}</p>`
    // ` </div>`
    // `</div>`
    // `))}</div>`
    
    content = content.replace(
        `                   <div className="bg-[#F9F9F9] p-4 border border-[#E5E5E5]">
                     <p className="text-xs leading-relaxed whitespace-pre-wrap text-[#333]">{review.content}</p>
                   </div>
                 </div>
               ))}
                 </div>
               )}`,
        `                   <div className="bg-[#F9F9F9] p-4 border border-[#E5E5E5]">
                     <p className="text-xs leading-relaxed whitespace-pre-wrap text-[#333]">{review.content}</p>
                   </div>
                   
                   {/* Reply Section */}
                   {review.reply_content && (
                       <div className="mt-4 bg-[#FAFAFA] p-4 border border-[#E5E5E5] relative ml-4">
                           <div className="absolute -left-2 top-4 w-2 h-2 border-t border-r border-[#E5E5E5] bg-[#FAFAFA] transform -rotate-[135deg]"></div>
                           <div className="flex items-center gap-2 mb-2 text-[#D4AF37]">
                               <MessageCircle size={14} />
                               <span className="text-[10px] font-bold tracking-widest uppercase">店舗からの返信</span>
                           </div>
                           <p className="text-xs leading-relaxed whitespace-pre-wrap text-[#333]">{review.reply_content}</p>
                       </div>
                   )}

                   {/* Action Buttons */}
                   {!review.is_dummy && (
                       <div className="mt-4 flex items-center justify-between border-t border-[#E5E5E5] pt-3">
                           <button 
                               onClick={() => toggleReviewLike(review.id)}
                               className={\`flex items-center gap-1 text-[10px] tracking-widest font-bold transition-colors \${likedReviews.has(review.id) ? 'text-[#E02424]' : 'text-[#777] hover:text-black'}\`}
                           >
                               <Heart size={14} className={likedReviews.has(review.id) ? 'fill-[#E02424]' : 'stroke-[1.5]'} />
                               参考になった {reviewLikesCount[review.id] || 0}
                           </button>
                           {user && user.id !== review.reviewer_id && (
                               <button 
                                   onClick={() => handleReportReview(review.id)}
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
               )}`
    );
}

// 6. Delete Button in Customer posted_reviews
if (!content.includes('削除する')) {
    content = content.replace(
        `                   <div className="bg-[#F9F9F9] p-4 border border-[#E5E5E5]">
                     <p className="text-xs leading-relaxed whitespace-pre-wrap text-[#333]">{review.content}</p>
                   </div>
                 </div>
               ))}
             </div>`,
        `                   <div className="bg-[#F9F9F9] p-4 border border-[#E5E5E5]">
                     <p className="text-xs leading-relaxed whitespace-pre-wrap text-[#333]">{review.content}</p>
                   </div>
                   
                   {review.reply_content && (
                       <div className="mt-4 bg-[#FAFAFA] p-4 border border-[#E5E5E5] relative ml-4">
                           <div className="absolute -left-2 top-4 w-2 h-2 border-t border-r border-[#E5E5E5] bg-[#FAFAFA] transform -rotate-[135deg]"></div>
                           <div className="flex items-center gap-2 mb-2 text-[#D4AF37]">
                               <MessageCircle size={14} />
                               <span className="text-[10px] font-bold tracking-widest uppercase">店舗からの返信</span>
                           </div>
                           <p className="text-xs leading-relaxed whitespace-pre-wrap text-[#333]">{review.reply_content}</p>
                       </div>
                   )}

                   {user && user.id === review.reviewer_id && (
                       <div className="mt-4 flex items-center justify-end border-t border-[#E5E5E5] pt-3">
                           <button 
                               onClick={() => handleDeleteReview(review.id)}
                               className="flex items-center gap-1 text-[10px] tracking-widest text-[#E02424] hover:text-red-700 transition-colors font-bold"
                           >
                               <X size={14} />
                               削除する
                           </button>
                       </div>
                   )}
                 </div>
               ))}
             </div>`
    );
}

fs.writeFileSync(file_path, content);
console.log('Patched page.tsx successfully!');
