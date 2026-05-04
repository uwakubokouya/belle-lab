"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, X, Star, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/providers/UserProvider";

export default function AdminReviewsPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [reviews, setReviews] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (isLoading || !user) return;
    if (!user.is_admin && user.role !== 'store') {
      router.push('/mypage');
      return;
    }

    fetchPendingReviews();
  }, [user, isLoading]);

  const fetchPendingReviews = async () => {
    setIsFetching(true);
    try {
      let query = supabase
        .from('sns_reviews')
        .select(`
          id, rating, score, visited_date, content, created_at, visibility, status,
          reviewer_id, target_cast_id,
          sns_profiles!sns_reviews_reviewer_id_fkey(name, avatar_url, is_vip),
          casts!sns_reviews_target_cast_id_fkey(name, store_id)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      // 店舗の場合は public のみ（自店舗のキャストのみに絞るなら .eq('casts.store_id', user.store_id) が必要ですが、
      // 試作段階のため public のものを表示します）
      if (user?.role === 'store') {
        query = query.eq('visibility', 'public');
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching reviews:", error);
      } else if (data) {
        setReviews(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleUpdateStatus = async (reviewId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('sns_reviews')
        .update({ status: newStatus })
        .eq('id', reviewId);

      if (error) {
        alert("更新に失敗しました");
        console.error(error);
      } else {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
      }
    } catch (err) {
      console.error(err);
      alert("エラーが発生しました");
    }
  };

  if (!user?.is_admin && user?.role !== 'store') {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-light selection:bg-white selection:text-black">
      <header className="sticky top-0 z-40 bg-black border-b border-[#333] flex items-center px-4 py-4">
        <button onClick={() => router.push('/admin')} className="text-white hover:text-[#AAA] p-2 -ml-2 transition-colors">
          <ChevronLeft size={24} className="stroke-[1.5]" />
        </button>
        <h1 className="text-sm font-bold tracking-widest absolute left-1/2 -translate-x-1/2 uppercase">口コミ審査</h1>
      </header>

      <main className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-normal tracking-[0.2em] uppercase mb-2">Reviews</h2>
          <p className="text-xs text-[#777] tracking-widest">承認待ちの口コミ一覧</p>
        </div>

        {isFetching ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="border border-[#333] bg-[#111] p-10 text-center">
            <p className="text-xs text-[#777] tracking-widest">現在、承認待ちの口コミはありません。</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border border-[#333] bg-[#111] p-6 relative overflow-hidden">
                {review.visibility === 'secret' && (
                  <div className="absolute top-0 right-0 bg-[#D4AF37] text-black text-[10px] font-bold px-3 py-1 flex items-center gap-1 tracking-widest">
                    <Lock size={12} />
                    VIP限定
                  </div>
                )}
                
                <div className="flex flex-col gap-4 mb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[11px] text-[#777] mb-1">
                        対象キャスト: <span className="text-white font-bold">{review.casts?.name || "不明"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <img 
                          src={review.sns_profiles?.avatar_url || "/images/no-photo.jpg"} 
                          alt="User" 
                          className="w-6 h-6 rounded-full border border-[#333] object-cover"
                        />
                        <span className="text-xs font-bold tracking-widest flex items-center gap-2">
                          {review.sns_profiles?.name || "匿名ユーザー"}
                          {review.sns_profiles?.is_vip && (
                            <img src="/images/vip-crown.png" alt="VIP" className="h-4 object-contain" />
                          )}
                        </span>
                        <span className="text-[10px] text-[#777] ml-2">{new Date(review.created_at).toLocaleDateString('ja-JP')}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className="flex text-[#D4AF37] mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < review.rating ? "fill-[#D4AF37]" : "fill-transparent text-[#333]"} />
                        ))}
                      </div>
                      {review.score !== null && (
                        <span className="text-xs font-bold tracking-widest text-[#D4AF37]">{review.score}点</span>
                      )}
                    </div>
                  </div>
                  
                  {review.visited_date && (
                    <div className="text-[10px] text-[#777] tracking-widest">
                      訪問日: {review.visited_date}
                    </div>
                  )}

                  <div className="bg-black p-4 border border-[#333]">
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{review.content}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => handleUpdateStatus(review.id, 'rejected')}
                    className="flex-1 py-3 border border-[#333] text-[#777] hover:bg-[#222] hover:text-white transition-colors flex items-center justify-center gap-2 text-xs tracking-widest"
                  >
                    <X size={16} />
                    非承認
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(review.id, 'approved')}
                    className="flex-1 py-3 bg-white text-black hover:bg-[#CCC] transition-colors flex items-center justify-center gap-2 text-xs font-bold tracking-widest"
                  >
                    <Check size={16} />
                    承認する
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
