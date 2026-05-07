"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Star, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/providers/UserProvider';
import Link from 'next/link';

interface Review {
  id: string;
  target_cast_id: string;
  rating: number;
  score: number;
  visited_date: string;
  content: string;
  visibility: 'public' | 'secret';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reply_content?: string;
  reply_created_at?: string;
  casts?: {
      name: string;
      avatar_url?: string;
  };
}

export default function MyReviewsPage() {
  const router = useRouter();
  const { user, isMounted } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, reviewId: string | null}>({ isOpen: false, reviewId: null });

  useEffect(() => {
    if (!isMounted) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchMyReviews = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('sns_reviews')
          .select('*')
          .eq('reviewer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
            // Fetch cast names
            const castIds = [...new Set(data.map(r => r.target_cast_id))];
            
            // 1. target_cast_id で sns_profiles と casts を両方検索
            const { data: profilesById } = await supabase.from('sns_profiles').select('*').in('id', castIds);
            const { data: castsById } = await supabase.from('casts').select('*').in('id', castIds);
            
            // 2. profiles に phone があれば、紐づく casts も取得 (旧画像フォールバック用)
            const phones = profilesById?.map(p => p.phone).filter(Boolean) || [];
            const { data: castsByPhone } = phones.length > 0 ? await supabase.from('casts').select('*').in('login_id', phones) : { data: [] };
            
            // 3. マッピング構築
            const profileMap = new Map();
            castIds.forEach(id => {
               let name = "不明なキャスト";
               let avatar_url = null;
               
               const pMatch = profilesById?.find(p => p.id === id);
               const cMatch = castsById?.find(c => c.id === id);
               
               if (pMatch) {
                   name = pMatch.name;
                   avatar_url = pMatch.avatar_url;
                   // sns_profilesに画像がない場合、紐づくcastsテーブルから画像を探す
                   if (!avatar_url) {
                       const linkedCast = castsByPhone?.find(c => c.login_id === pMatch.phone);
                       if (linkedCast) {
                           avatar_url = linkedCast.sns_avatar_url || linkedCast.profile_image_url || linkedCast.avatar_url;
                       }
                   }
               } else if (cMatch) {
                   name = cMatch.name;
                   avatar_url = cMatch.sns_avatar_url || cMatch.profile_image_url || cMatch.avatar_url;
               }
               
               profileMap.set(id, { id, name, avatar_url });
            });

            const enriched = data.map(review => ({
                ...review,
                casts: profileMap.get(review.target_cast_id) || { name: '不明なキャスト', avatar_url: null }
            }));
            
            setReviews(enriched);
        } else {
            setReviews([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyReviews();
  }, [user, isMounted, router]);

  const handleDelete = async (reviewId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('sns_reviews').delete().eq('id', reviewId).eq('reviewer_id', user.id);
      if (error) throw error;
      
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      setConfirmModal({ isOpen: false, reviewId: null });
    } catch (err) {
      console.error(err);
      alert("削除に失敗しました。");
    }
  };

  if (!isMounted || isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] flex items-center px-4 py-4">
          <div className="w-10"></div>
          <h1 className="flex-1 text-center font-medium text-sm tracking-widest uppercase">自分が投稿した口コミ</h1>
          <div className="w-10"></div>
        </header>
        <div className="flex-1 flex items-center justify-center">
            <span className="text-xs text-[#777777] tracking-widest">読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F9F9] font-light">
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] flex items-center px-4 py-4">
        <button onClick={() => router.back()} className="text-black hover:text-[#777777] p-2 -ml-2 transition-colors w-10">
          <ChevronLeft size={24} className="stroke-[1.5]" />
        </button>
        <h1 className="flex-1 text-center font-medium text-sm tracking-widest uppercase">自分が投稿した口コミ</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto pb-32 space-y-4">
        {reviews.length === 0 ? (
           <div className="text-center py-20 bg-white border border-[#E5E5E5] p-6">
              <p className="text-xs text-[#777777] tracking-widest leading-relaxed">
                 投稿した口コミはありません。<br/>
                 ご来店後、キャストのプロフィールから口コミをご投稿いただけます。
              </p>
           </div>
        ) : (
           reviews.map(review => (
             <div key={review.id} className="bg-white border border-[#E5E5E5] p-5">
               <div className="flex justify-between items-start border-b border-[#E5E5E5] pb-3 mb-3">
                  <div className="flex items-center gap-3">
                     <Link href={`/cast/${review.target_cast_id}`} className="w-10 h-10 border border-[#E5E5E5] bg-[#F9F9F9] overflow-hidden hover:opacity-80 transition-opacity">
                         <img 
                            src={review.casts?.avatar_url || "/images/no-photo.jpg"} 
                            alt="Profile" 
                            className="w-full h-full object-cover" 
                         />
                     </Link>
                     <div>
                         <Link href={`/cast/${review.target_cast_id}`} className="text-xs font-bold tracking-widest hover:underline decoration-black underline-offset-4">
                            {review.casts?.name}
                         </Link>
                         <p className="text-[10px] text-[#777777] tracking-widest mt-0.5">訪問日: {review.visited_date}</p>
                     </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                      <span className={`text-[10px] tracking-widest px-2 py-0.5 ${
                          review.status === 'approved' ? 'bg-[#E5F5E5] text-[#2E7D32]' : 
                          review.status === 'rejected' ? 'bg-[#FFEBEE] text-[#C62828]' : 
                          'bg-[#FFFBF0] text-[#D4AF37] border border-[#D4AF37]'
                      }`}>
                          {review.status === 'approved' ? '公開中' : review.status === 'rejected' ? '非表示' : '審査待ち'}
                      </span>
                      {review.visibility === 'secret' && (
                          <span className="text-[9px] bg-black text-white px-1.5 py-0.5 tracking-widest">VIP</span>
                      )}
                  </div>
               </div>
               
               <div className="flex items-center gap-2 mb-3">
                   <div className="flex">
                     {[1, 2, 3, 4, 5].map((s) => (
                       <Star key={s} size={14} className={s <= review.rating ? 'fill-black text-black' : 'fill-transparent text-[#E5E5E5]'} />
                     ))}
                   </div>
                   <span className="text-xs font-bold">{review.score}点</span>
               </div>
               
               <p className="text-xs text-[#333333] whitespace-pre-wrap leading-relaxed mb-4">
                   {review.content}
               </p>
               
               {review.reply_content && (
                  <div className="bg-[#F9F9F9] border border-[#E5E5E5] p-3 mb-4">
                     <p className="text-[10px] font-bold tracking-widest mb-1">店舗からの返信</p>
                     <p className="text-[11px] text-[#333333] whitespace-pre-wrap leading-relaxed">
                        {review.reply_content}
                     </p>
                  </div>
               )}
               
               <div className="flex justify-end pt-3 border-t border-[#E5E5E5]">
                   <button 
                     onClick={() => setConfirmModal({ isOpen: true, reviewId: review.id })}
                     className="flex items-center gap-1.5 text-[10px] tracking-widest text-[#E02424] hover:opacity-70 transition-opacity"
                   >
                       <Trash2 size={12} className="stroke-[1.5]" />
                       口コミを削除する
                   </button>
               </div>
             </div>
           ))
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setConfirmModal({ isOpen: false, reviewId: null })}>
           <div className="bg-white w-full max-w-sm p-6 border border-[#E5E5E5] flex flex-col relative shadow-sm text-center" onClick={e => e.stopPropagation()}>
             <h3 className="text-sm font-bold tracking-widest mb-4">口コミの削除</h3>
             <p className="text-xs text-[#333333] leading-relaxed mb-6">
               この口コミを削除してもよろしいですか？<br/>
               削除すると復元できません。
             </p>
             <div className="flex gap-3">
               <button 
                 onClick={() => setConfirmModal({ isOpen: false, reviewId: null })}
                 className="flex-1 py-3 border border-[#E5E5E5] text-xs tracking-widest text-[#777777] hover:bg-[#F9F9F9] transition-colors"
               >
                 キャンセル
               </button>
               <button 
                 onClick={() => confirmModal.reviewId && handleDelete(confirmModal.reviewId)}
                 className="flex-1 py-3 bg-[#E02424] text-white text-xs tracking-widest hover:bg-[#C81E1E] transition-colors"
               >
                 削除する
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
