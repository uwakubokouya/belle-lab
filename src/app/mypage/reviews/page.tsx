"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, X, Star, Lock, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/providers/UserProvider";
import Link from 'next/link';

export default function MypageReviewsPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [reviews, setReviews] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, reviewId: string | null, newStatus: 'approved' | 'rejected' | null}>({
    isOpen: false,
    reviewId: null,
    newStatus: null
  });
  const [messageModal, setMessageModal] = useState<{isOpen: boolean, message: string}>({isOpen: false, message: ""});

  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [isSubmittingReply, setIsSubmittingReply] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isLoading || !user) return;
    if (!user.is_admin && user.role !== 'store') {
      router.push('/mypage');
      return;
    }

    fetchReviews();
  }, [user, isLoading, activeTab]);

  const fetchReviews = async () => {
    setIsFetching(true);
    try {
      let query = supabase
        .from('sns_reviews')
        .select(`
          id, rating, score, visited_date, content, created_at, visibility, status, reply_content, reply_created_at,
          reviewer_id, target_cast_id,
          sns_profiles!sns_reviews_reviewer_id_fkey(name, avatar_url, is_vip)
        `)
        .eq('status', activeTab)
        .order('created_at', { ascending: false });

      // 店舗の場合は、自店舗のキャストへの口コミのみを取得する
      if (user?.role === 'store') {
        let myStoreId = null;
        
        // まずsns_profilesから試す
        const { data: snsProfile } = await supabase.from('sns_profiles').select('store_id').eq('id', user.id).maybeSingle();
        if (snsProfile?.store_id) {
            myStoreId = snsProfile.store_id;
        } else if (user.phone) {
            // なければprofilesテーブルからphone(username)で探す
            const { data: dbProfile } = await supabase.from('profiles').select('store_id').eq('username', user.phone).eq('role', 'admin').maybeSingle();
            if (dbProfile?.store_id) {
                myStoreId = dbProfile.store_id;
            }
        }

        if (myStoreId) {
            const { data: castsInStore } = await supabase.from('sns_profiles').select('id').eq('store_id', myStoreId);
            const castIds = castsInStore ? castsInStore.map(c => c.id) : [];
            
            // sns_profilesにいない場合（旧castテーブルのみの場合）も考慮してcastsテーブルからもIDを取得
            const { data: legacyCasts } = await supabase.from('casts').select('id').eq('store_id', myStoreId);
            if (legacyCasts) {
                legacyCasts.forEach(lc => castIds.push(lc.id));
            }
            
            if (castIds.length > 0) {
                query = query.in('target_cast_id', castIds);
            } else {
                query = query.eq('id', '00000000-0000-0000-0000-000000000000');
            }
        } else {
            // 店舗設定がない場合は何も表示しない
            query = query.eq('id', '00000000-0000-0000-0000-000000000000');
        }
        
        // VIP限定口コミ（secret）は運営のみが承認するため、店舗画面からは除外する
        query = query.eq('visibility', 'public');
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching reviews:", error);
      } else if (data) {
        // Fetch cast information manually
        const enrichedReviews = await Promise.all(data.map(async (review) => {
            let castInfo = { name: "不明", store_id: null };
            
            const { data: profileCast } = await supabase.from('sns_profiles').select('name, store_id').eq('id', review.target_cast_id).maybeSingle();
            if (profileCast) {
                castInfo = profileCast;
            } else {
                const { data: legacyCasts } = await supabase.rpc('get_cast_names_by_ids', { p_cast_ids: [review.target_cast_id] });
                const legacyCast = legacyCasts && legacyCasts.length > 0 ? legacyCasts[0] : null;
                if (legacyCast) {
                    castInfo = legacyCast;
                }
            }
            
            return {
                ...review,
                casts: castInfo
            };
        }));
        
        setReviews(enrichedReviews);
        
        // Reply Inputsの初期化
        const newReplyInputs: Record<string, string> = {};
        enrichedReviews.forEach(r => {
           if (r.reply_content) newReplyInputs[r.id] = r.reply_content;
        });
        setReplyInputs(newReplyInputs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleUpdateStatus = async (reviewId: string, newStatus: 'approved' | 'rejected') => {
    try {
      if (!user) return;
      const targetReview = reviews.find(r => r.id === reviewId);
      if (!targetReview) return;

      const { data: updatedData, error } = await supabase
        .from('sns_reviews')
        .update({ status: newStatus })
        .eq('id', reviewId)
        .select();

      if (error || !updatedData || updatedData.length === 0) {
        setMessageModal({ isOpen: true, message: "更新に失敗しました。権限がありません。\n（運営アカウントの更新権限（RLS）が設定されていない可能性があります）" });
        console.error(error || "RLSにより更新がブロックされました");
        setConfirmModal({ isOpen: false, reviewId: null, newStatus: null });
        return;
      }

      // 承認時の追加処理: ポイント付与と自動通知メッセージ送信 (pending -> approvedの場合のみ)
      if (newStatus === 'approved' && activeTab === 'pending') {
        try {
          // キャストが新人（入店30日以内）かどうかを判定し、ポイントを振り分け
          let pointsToAward = 5;
          const { data: castData } = await supabase
            .from('casts')
            .select('join_date')
            .eq('id', targetReview.target_cast_id)
            .maybeSingle();

          if (castData?.join_date) {
            const joinDate = new Date(castData.join_date);
            const nowTs = new Date();
            const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
            if (nowTs.getTime() - joinDate.getTime() < thirtyDaysMs) {
                pointsToAward = 10;
            }
          }

          // ポイント付与
          await supabase.rpc('add_review_points', { p_user_id: targetReview.reviewer_id, p_points: pointsToAward });
          
          // 自動通知メッセージを送信（送信者: 現在ログイン中の店舗アカウント sns_profiles.id）
          await supabase.from('sns_messages').insert({
            sender_id: user.id,
            receiver_id: targetReview.reviewer_id,
            content: `【自動通知】\nご来店および口コミのご投稿ありがとうございます。\n先ほど、以下の口コミが審査を通過し、${pointsToAward}ポイントが付与されました！\n引き続きよろしくお願いいたします。\n\n[REVIEW:${targetReview.id}]口コミはこちら`,
            is_read: false
          });
        } catch (postApproveErr) {
          console.error("承認後の追加処理エラー:", postApproveErr);
        }
      }

      setReviews(prev => prev.filter(r => r.id !== reviewId));
      setMessageModal({ isOpen: true, message: "ステータスを更新しました。" });
    } catch (err) {
      console.error(err);
      setMessageModal({ isOpen: true, message: "エラーが発生しました" });
    } finally {
      setConfirmModal({ isOpen: false, reviewId: null, newStatus: null });
    }
  };

  const submitReply = async (reviewId: string) => {
    const text = replyInputs[reviewId]?.trim();
    if (!text) return;
    
    setIsSubmittingReply(prev => ({...prev, [reviewId]: true}));
    try {
       const { error } = await supabase
         .from('sns_reviews')
         .update({ 
            reply_content: text, 
            reply_created_at: new Date().toISOString() 
         })
         .eq('id', reviewId);
         
       if (error) {
          setMessageModal({ isOpen: true, message: "返信の保存に失敗しました。" });
       } else {
          setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply_content: text } : r));
          setMessageModal({ isOpen: true, message: "返信を保存しました。" });
       }
    } catch (e) {
       console.error(e);
       setMessageModal({ isOpen: true, message: "エラーが発生しました" });
    } finally {
       setIsSubmittingReply(prev => ({...prev, [reviewId]: false}));
    }
  };

  const openConfirmModal = (reviewId: string, status: 'approved' | 'rejected') => {
    setConfirmModal({ isOpen: true, reviewId, newStatus: status });
  };

  if (!user?.is_admin && user?.role !== 'store') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-24 font-light">
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] px-6 py-4 flex items-center">
        <button onClick={() => router.back()} className="mr-4 hover:opacity-70 transition-opacity">
          <ChevronLeft size={24} className="stroke-[1.5]" />
        </button>
        <h1 className="text-sm font-bold tracking-widest uppercase">口コミ審査</h1>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-[#E5E5E5] flex">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-4 text-xs font-bold tracking-widest transition-colors ${activeTab === 'pending' ? 'border-b-2 border-black text-black' : 'text-[#777]'}`}
        >
          審査待ち
        </button>
        <button 
          onClick={() => setActiveTab('approved')}
          className={`flex-1 py-4 text-xs font-bold tracking-widest transition-colors ${activeTab === 'approved' ? 'border-b-2 border-black text-black' : 'text-[#777]'}`}
        >
          承認済み
        </button>
        <button 
          onClick={() => setActiveTab('rejected')}
          className={`flex-1 py-4 text-xs font-bold tracking-widest transition-colors ${activeTab === 'rejected' ? 'border-b-2 border-black text-black' : 'text-[#777]'}`}
        >
          非表示
        </button>
      </div>

      <main className="p-6">
        <div className="mb-6 border-b border-[#E5E5E5] pb-4">
          <p className="text-xs text-[#777] tracking-widest">
            {activeTab === 'pending' ? '承認待ちの口コミ一覧' : (activeTab === 'approved' ? '承認済みの口コミ一覧（返信・非表示）' : '非表示にされた口コミ一覧')}
          </p>
        </div>

        {isFetching ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white border border-[#E5E5E5] p-10 text-center">
            <p className="text-xs text-[#777] tracking-widest">該当する口コミはありません。</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white border border-[#E5E5E5] p-6 relative overflow-hidden shadow-sm">
                {review.visibility === 'secret' && (
                  <div className="absolute top-0 right-0 bg-[#111] text-[#D4AF37] text-[10px] font-bold px-3 py-1 flex items-center gap-1 tracking-widest border-b border-l border-[#E5E5E5]">
                    <Lock size={12} />
                    VIP限定
                  </div>
                )}
                
                <div className="flex flex-col gap-4 mb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] text-[#777] mb-2 tracking-widest uppercase border border-[#E5E5E5] bg-[#F9F9F9] inline-block px-2 py-0.5">
                        対象: <span className="text-black font-bold">{review.casts?.name || "不明"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {review.reviewer_id ? (
                            <Link href={`/cast/${review.reviewer_id}`} className="shrink-0 hover:opacity-80 transition-opacity block">
                                <img 
                                  src={review.sns_profiles?.avatar_url || "/images/no-photo.jpg"} 
                                  alt="User" 
                                  className="w-8 h-8 border border-[#E5E5E5] object-cover p-0.5"
                                />
                            </Link>
                        ) : (
                            <img 
                              src={review.sns_profiles?.avatar_url || "/images/no-photo.jpg"} 
                              alt="User" 
                              className="w-8 h-8 border border-[#E5E5E5] object-cover p-0.5 shrink-0"
                            />
                        )}
                        <div className="flex flex-col">
                            {review.reviewer_id ? (
                                <Link href={`/cast/${review.reviewer_id}`} className="text-xs font-bold tracking-widest flex items-center gap-1 hover:underline">
                                    {review.sns_profiles?.name || "匿名ユーザー"}
                                    {review.sns_profiles?.is_vip && (
                                        <img src="/images/vip-crown.png" alt="VIP" className="h-4 object-contain ml-1" />
                                    )}
                                </Link>
                            ) : (
                                <span className="text-xs font-bold tracking-widest flex items-center gap-1">
                                    {review.sns_profiles?.name || "匿名ユーザー"}
                                    {review.sns_profiles?.is_vip && (
                                        <img src="/images/vip-crown.png" alt="VIP" className="h-4 object-contain ml-1" />
                                    )}
                                </span>
                            )}
                            <span className="text-[10px] text-[#777] tracking-widest mt-0.5">{new Date(review.created_at).toLocaleDateString('ja-JP')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className="flex text-[#D4AF37] mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < review.rating ? "fill-[#D4AF37]" : "fill-transparent text-[#E5E5E5]"} />
                        ))}
                      </div>
                      {review.score !== null && (
                        <span className="text-xs font-bold tracking-widest text-black border border-[#E5E5E5] px-2 bg-[#F9F9F9]">{review.score} <span className="text-[10px] font-normal">点</span></span>
                      )}
                    </div>
                  </div>
                  
                  {review.visited_date && (
                    <div className="text-[10px] text-[#777] tracking-widest">
                      来店日: {review.visited_date}
                    </div>
                  )}

                  <div className="bg-[#F9F9F9] p-4 border border-[#E5E5E5]">
                    <p className="text-xs leading-relaxed whitespace-pre-wrap text-[#333]">{review.content}</p>
                  </div>
                </div>

                {activeTab === 'approved' && (
                  <div className="mb-6 bg-[#FAFAFA] border border-[#E5E5E5] p-4">
                     <div className="flex items-center gap-2 mb-2 text-[#777]">
                        <MessageCircle size={14} />
                        <span className="text-[10px] font-bold tracking-widest uppercase">店舗からの返信</span>
                     </div>
                     <textarea
                        value={replyInputs[review.id] || ''}
                        onChange={(e) => setReplyInputs(prev => ({...prev, [review.id]: e.target.value}))}
                        placeholder="口コミへの返信を入力..."
                        className="w-full text-xs p-3 border border-[#E5E5E5] focus:border-black outline-none resize-none h-20 mb-2"
                     />
                     <div className="flex justify-end">
                        <button 
                           onClick={() => submitReply(review.id)}
                           disabled={isSubmittingReply[review.id]}
                           className="px-4 py-2 bg-black text-white text-[10px] tracking-widest font-bold disabled:bg-[#ccc]"
                        >
                           {isSubmittingReply[review.id] ? '保存中...' : (review.reply_content ? '返信を更新' : '返信を保存')}
                        </button>
                     </div>
                  </div>
                )}

                <div className="flex gap-4">
                  {activeTab === 'pending' ? (
                     <>
                      <button 
                        onClick={() => openConfirmModal(review.id, 'rejected')}
                        className="flex-1 py-3 border border-[#E5E5E5] bg-white text-[#777] hover:bg-[#F9F9F9] hover:text-black transition-colors flex items-center justify-center gap-2 text-xs tracking-widest font-bold"
                      >
                        <X size={16} />
                        非承認
                      </button>
                      <button 
                        onClick={() => openConfirmModal(review.id, 'approved')}
                        className="flex-1 py-3 border border-black bg-black text-white hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2 text-xs tracking-widest font-bold"
                      >
                        <Check size={16} />
                        承認する
                      </button>
                     </>
                  ) : activeTab === 'approved' ? (
                     <button 
                        onClick={() => openConfirmModal(review.id, 'rejected')}
                        className="flex-1 py-3 border border-[#E5E5E5] bg-white text-[#E02424] hover:bg-[#F9F9F9] transition-colors flex items-center justify-center gap-2 text-xs tracking-widest font-bold"
                      >
                        <X size={16} />
                        非表示にする (削除)
                      </button>
                  ) : (
                     <button 
                        onClick={() => openConfirmModal(review.id, 'approved')}
                        className="flex-1 py-3 border border-black bg-black text-white hover:bg-[#333] transition-colors flex items-center justify-center gap-2 text-xs tracking-widest font-bold"
                      >
                        <Check size={16} />
                        再表示する (承認)
                      </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* カスタム確認モーダル */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm border border-[#E5E5E5] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-sm font-bold tracking-widest text-center mb-4">
              {confirmModal.newStatus === 'approved' ? (activeTab === 'rejected' ? '口コミを再表示しますか？' : '口コミを承認しますか？') : (activeTab === 'pending' ? '口コミを非承認にしますか？' : '口コミを非表示にしますか？')}
            </h3>
            <p className="text-xs text-[#777777] text-center mb-6 leading-relaxed whitespace-pre-wrap">
              {confirmModal.newStatus === 'approved' 
                ? (activeTab === 'rejected' ? '再表示すると、再びキャストのプロフィールに公開されます。' : '承認すると、キャストのプロフィールに公開され、ユーザーにポイントが付与されます。')
                : '非承認（非表示）にすると、この口コミは公開されなくなります。'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ isOpen: false, reviewId: null, newStatus: null })}
                className="flex-1 py-3 text-xs tracking-widest border border-[#E5E5E5] hover:bg-[#F9F9F9] transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => confirmModal.reviewId && confirmModal.newStatus && handleUpdateStatus(confirmModal.reviewId, confirmModal.newStatus)}
                className={`flex-1 py-3 text-xs tracking-widest text-white transition-colors ${
                  confirmModal.newStatus === 'approved' ? 'bg-black hover:bg-black/80' : 'bg-[#E02424] hover:bg-[#E02424]/90'
                }`}
              >
                {confirmModal.newStatus === 'approved' ? (activeTab === 'rejected' ? '再表示する' : '承認する') : '非表示にする'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* カスタムメッセージモーダル (アラートの代わり) */}
      {messageModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm border border-[#E5E5E5] p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
             <h3 className="text-sm font-bold tracking-widest mb-4">確認</h3>
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

    </div>
  );
}
