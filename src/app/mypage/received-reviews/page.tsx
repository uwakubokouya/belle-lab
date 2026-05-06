"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Star, PenLine } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/providers/UserProvider';
import Link from 'next/link';

interface Review {
  id: string;
  reviewer_id: string;
  rating: number;
  score: number;
  visited_date: string;
  content: string;
  created_at: string;
  reply_content?: string;
  reply_created_at?: string;
  sns_profiles?: {
      name: string;
      avatar_url?: string;
      is_vip?: boolean;
  };
}

export default function ReceivedReviewsPage() {
  const router = useRouter();
  const { user, isMounted, markReviewsAsRead } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const createThankYouUrl = (review: Review) => {
    return `/post?quoted_review_id=${review.id}`;
  };

  useEffect(() => {
    if (!isMounted) return;
    if (!user || user.role !== 'cast') {
      router.push('/mypage');
      return;
    }

    const fetchReceivedReviews = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('sns_reviews')
          .select(`
            id, rating, score, visited_date, content, created_at, reply_content, reply_created_at,
            reviewer_id, visibility, status,
            sns_profiles!sns_reviews_reviewer_id_fkey(name, avatar_url, is_vip)
          `)
          .eq('target_cast_id', user.id)
          .eq('status', 'approved')
          .eq('visibility', 'public')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          markReviewsAsRead();
            setReviews(data as any);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceivedReviews();
  }, [user, isMounted, router]);

  if (!isMounted || isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] flex items-center px-4 py-4">
          <div className="w-10"></div>
          <h1 className="flex-1 text-center font-medium text-sm tracking-widest uppercase">自分への口コミ</h1>
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
        <h1 className="flex-1 text-center font-medium text-sm tracking-widest uppercase">自分への口コミ</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto pb-32 space-y-4">
        {reviews.length === 0 ? (
           <div className="text-center py-20 bg-white border border-[#E5E5E5] p-6">
              <p className="text-xs text-[#777777] tracking-widest leading-relaxed">
                 まだ口コミがありません。
              </p>
           </div>
        ) : (
           reviews.map(review => (
             <div key={review.id} className="bg-white border border-[#E5E5E5] p-5">
               <div className="flex justify-between items-start border-b border-[#E5E5E5] pb-3 mb-3">
                  <div className="flex items-center gap-3">
                     <Link href={`/cast/${review.reviewer_id}`} className="w-10 h-10 border border-[#E5E5E5] bg-[#F9F9F9] overflow-hidden hover:opacity-80 transition-opacity">
                         <img 
                            src={review.sns_profiles?.avatar_url || "/images/no-photo.jpg"} 
                            alt="Profile" 
                            className="w-full h-full object-cover" 
                         />
                     </Link>
                     <div>
                         <Link href={`/cast/${review.reviewer_id}`} className="text-xs font-bold tracking-widest flex items-center gap-1 hover:underline decoration-black underline-offset-4">
                            {review.sns_profiles?.name || "退会したユーザー"}
                            {review.sns_profiles?.is_vip && (
                                <img src="/images/vip-crown.png" alt="VIP" className="h-4 object-contain ml-0.5" />
                            )}
                         </Link>
                         <p className="text-[10px] text-[#777777] tracking-widest mt-0.5">訪問日: {review.visited_date}</p>
                     </div>
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
                   <Link href={createThankYouUrl(review)} className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-black border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors">
                       <PenLine size={12} className="stroke-[1.5]" />
                       お礼を投稿する
                   </Link>
               </div>
             </div>
           ))
        )}
      </main>
    </div>
  );
}
