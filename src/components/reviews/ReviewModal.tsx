"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Star, Check } from 'lucide-react';
import { useUser } from '@/providers/UserProvider';
import { useRouter } from 'next/navigation';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCastId: string;
  castName: string;
  onReviewSubmitted: () => void;
}

export default function ReviewModal({ isOpen, onClose, targetCastId, castName, onReviewSubmitted }: ReviewModalProps) {
  const { user } = useUser();
  const router = useRouter();

  const [rating, setRating] = useState<number>(5);
  const [score, setScore] = useState<number | ''>('');
  const [visitedDate, setVisitedDate] = useState<string>('');
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<'public' | 'secret'>('public');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  if (!isOpen) return null;

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg("口コミを投稿するにはログインが必要です。");
      return;
    }
    if (score === '' || Number(score) < 0 || Number(score) > 100) {
      setErrorMsg("点数は0〜100の間で入力してください。");
      return;
    }
    if (!visitedDate) {
      setErrorMsg("訪問日を選択してください。");
      return;
    }
    if (!content.trim()) {
      setErrorMsg("口コミ本文を入力してください。");
      return;
    }
    if (visibility === 'secret' && !user.is_vip) {
      setErrorMsg("VIP口コミはVIP会員のみ投稿可能です。");
      return;
    }

    setErrorMsg("");
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);

    const { error } = await supabase
      .from('sns_reviews')
      .insert({
        target_cast_id: targetCastId,
        reviewer_id: user.id,
        rating,
        score: Number(score),
        visited_date: visitedDate,
        content: content.trim(),
        visibility,
        status: 'pending' // 常にpendingで登録し、運営・店舗の承認待ちとする
      });

    setIsSubmitting(false);

    if (error) {
      console.error("口コミ投稿エラー:", error);
      setErrorMsg("エラーが発生しました。もう一度お試しください。");
    } else {
      // 店舗への通知
      try {
        let targetStoreId = null;
        let storeSnsProfileId = null;
        
        // 1. 口コミ対象キャストの所属店舗(store_id)を特定する
        const { data: profileData } = await supabase.from('sns_profiles').select('store_id').eq('id', targetCastId).maybeSingle();
        if (profileData?.store_id) {
            targetStoreId = profileData.store_id;
        } else {
            const { data: castData } = await supabase.from('casts').select('store_id').eq('id', targetCastId).maybeSingle();
            if (castData?.store_id) {
                targetStoreId = castData.store_id;
            }
        }

        // 2. 通知先を決定する
        let notificationTargetId = null;

        if (visibility === 'secret') {
            // VIP口コミは運営（admin/system）に通知
            const { data: adminProfile } = await supabase.from('sns_profiles')
                .select('id')
                .in('role', ['admin', 'system'])
                .is('store_id', null)
                .limit(1)
                .maybeSingle();
                
            if (adminProfile?.id) {
                notificationTargetId = adminProfile.id;
            }
        } else {
            // 通常口コミは店舗に通知
            if (targetStoreId) {
                const { data: storeProfile } = await supabase.from('sns_profiles')
                    .select('id')
                    .eq('store_id', targetStoreId)
                    .eq('role', 'store')
                    .maybeSingle();
                    
                if (storeProfile?.id) {
                    notificationTargetId = storeProfile.id;
                }
            }
        }

        // 3. 通知を発行
        if (notificationTargetId) {
          await supabase.from('sns_notifications').insert({
            user_id: notificationTargetId,
            title: visibility === 'secret' ? 'VIP限定の新しい口コミ' : '新しい口コミ',
            content: `${castName}さん宛に新しい口コミが投稿されました。審査画面から確認して承認を行ってください。`,
            type: '重要'
          });
        }
      } catch (notifErr) {
        console.error("店舗通知エラー:", notifErr);
      }

      setShowConfirm(false);
      setShowSuccessModal(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md border border-[#E5E5E5] flex flex-col relative animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E5E5E5]">
          <h2 className="text-sm font-bold tracking-widest uppercase">口コミを投稿する</h2>
          <button onClick={onClose} className="text-[#777777] hover:text-black transition-colors">
            <X size={20} className="stroke-[1.5]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          <div className="text-xs text-[#333333] text-center mb-6">
            <p className="font-bold">{castName} さんへの口コミ</p>
          </div>

          {errorMsg && (
            <div className="text-[10px] text-red-500 bg-red-50 p-2 text-center mb-4">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handlePreSubmit} className="flex flex-col gap-6">
            {/* Visibility Toggle */}
            <div className="flex border border-[#E5E5E5] bg-[#FAFAFA] p-1">
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`flex-1 py-2 text-xs tracking-widest font-bold transition-colors ${visibility === 'public' ? 'bg-black text-white' : 'text-[#777777] hover:text-black'}`}
              >
                口コミ
              </button>
              <button
                type="button"
                onClick={() => setVisibility('secret')}
                className={`flex-1 py-2 text-xs tracking-widest font-bold transition-colors ${visibility === 'secret' ? 'bg-[#D4AF37] text-white' : 'text-[#777777] hover:text-[#D4AF37]'}`}
              >
                VIP口コミ
              </button>
            </div>

            {visibility === 'secret' && !user?.is_vip && (
               <div className="p-4 border border-[#D4AF37] bg-[#FFFBF0] text-xs text-[#333333] text-center">
                 <p className="font-bold text-[#D4AF37] mb-1 uppercase tracking-widest">VIP Members Only</p>
                 <p className="mb-3 text-[10px]">VIP口コミの投稿・閲覧にはVIP会員登録が必要です。</p>
                 <button 
                   type="button"
                   onClick={() => { onClose(); router.push('/vip'); }}
                   className="px-4 py-2 bg-[#D4AF37] text-white tracking-widest hover:bg-[#B5952F] transition-colors"
                 >
                   VIP会員になる
                 </button>
               </div>
            )}

            <div className={`flex flex-col gap-6 transition-opacity duration-300 ${(visibility === 'secret' && !user?.is_vip) ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              {/* Rating */}
              <div className="flex flex-col items-center gap-2">
                <p className="text-[10px] tracking-widest text-[#777777] uppercase">おすすめ度</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        size={32} 
                        className={`stroke-[1] ${rating >= star ? (visibility === 'secret' ? 'fill-[#D4AF37] text-[#D4AF37]' : 'fill-black text-black') : 'fill-transparent text-[#E5E5E5]'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Score */}
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] tracking-widest text-[#777777] uppercase">点数 (0-100)</p>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={score}
                    onChange={(e) => setScore(e.target.value ? Number(e.target.value) : '')}
                    placeholder="例: 90"
                    className="w-full p-3 border border-[#E5E5E5] text-xs focus:border-black focus:outline-none transition-colors"
                  />
                </div>

                {/* Visited Date */}
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] tracking-widest text-[#777777] uppercase">訪問日</p>
                  <input
                    type="date"
                    value={visitedDate}
                    onChange={(e) => setVisitedDate(e.target.value)}
                    className="w-full p-3 border border-[#E5E5E5] text-xs focus:border-black focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Text Content */}
              <div className="flex flex-col gap-2">
                <p className="text-[10px] tracking-widest text-[#777777] uppercase">口コミ内容 (自由記入)</p>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="接客や施術の感想をご自由にご記入ください..."
                  className="w-full h-32 p-3 border border-[#E5E5E5] text-xs leading-relaxed focus:border-black focus:outline-none resize-none transition-colors"
                />
              </div>

              {/* Actions */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || (visibility === 'secret' && !user?.is_vip)}
                  className={`w-full py-4 text-xs tracking-widest transition-colors font-bold ${
                    isSubmitting 
                      ? 'bg-[#E5E5E5] text-[#777777]' 
                      : (visibility === 'secret' 
                          ? 'bg-[#D4AF37] text-white hover:bg-[#B5952F]' 
                          : 'bg-black text-white hover:bg-[#333333]')
                  }`}
                >
                  {isSubmitting ? '送信中...' : '投稿する'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowConfirm(false)}>
          <div className="bg-white w-full max-w-sm border border-[#E5E5E5] flex flex-col p-6 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold tracking-widest text-center mb-4">投稿確認</h3>
            <p className="text-xs text-[#333333] leading-relaxed mb-4 text-center">
              以下の内容で口コミを投稿してもよろしいですか？<br/>
              <span className="text-[10px] text-[#777777]">※投稿内容は運営・店舗の確認後に公開されます。</span>
            </p>
            
            <div className="bg-[#F9F9F9] border border-[#E5E5E5] p-4 mb-6 flex flex-col gap-3 text-xs text-[#333333] max-h-[40vh] overflow-y-auto">
               <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-2">
                 <span className="text-[10px] text-[#777777] tracking-widest uppercase">公開設定</span>
                 <span className="font-bold">{visibility === 'secret' ? 'VIP口コミ' : '通常口コミ'}</span>
               </div>
               <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-2">
                 <span className="text-[10px] text-[#777777] tracking-widest uppercase">評価 / 点数</span>
                 <span className="font-bold flex items-center gap-1">
                    <span className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={12} className={star <= rating ? (visibility === 'secret' ? 'fill-[#D4AF37] text-[#D4AF37]' : 'fill-black text-black') : 'fill-transparent text-[#E5E5E5]'} />
                      ))}
                    </span>
                    <span className="ml-1">{score}点</span>
                 </span>
               </div>
               <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-2">
                 <span className="text-[10px] text-[#777777] tracking-widest uppercase">訪問日</span>
                 <span className="font-bold">{visitedDate}</span>
               </div>
               <div className="pt-1">
                 <span className="text-[10px] text-[#777777] tracking-widest uppercase block mb-2">口コミ内容</span>
                 <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
               </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 border border-[#E5E5E5] text-xs tracking-widest text-[#777777] hover:bg-[#FAFAFA] transition-colors"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={confirmSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-black text-white text-xs tracking-widest hover:bg-[#333333] transition-colors disabled:bg-[#E5E5E5]"
              >
                {isSubmitting ? '送信中...' : '投稿する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => {
          setShowSuccessModal(false);
          onReviewSubmitted();
          setContent("");
          setRating(5);
          setScore('');
          setVisitedDate('');
          onClose();
        }}>
          <div className="bg-white w-full max-w-sm border border-[#E5E5E5] flex flex-col p-8 animate-in zoom-in-95 duration-200 items-center text-center" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full border border-black flex items-center justify-center mb-4 text-black">
              <Check size={24} className="stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-bold tracking-widest mb-4">送信完了</h3>
            <p className="text-xs text-[#333333] leading-relaxed mb-6 whitespace-pre-wrap">
              {visibility === 'secret' 
                ? 'VIP口コミを送信しました！\n運営・店舗の確認後に公開され、ポイントが付与されます。' 
                : '口コミを送信しました！\n承認後に公開され、ポイントが付与されます。'}
            </p>
            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                onReviewSubmitted();
                setContent("");
                setRating(5);
                setScore('');
                setVisitedDate('');
                onClose();
              }}
              className="w-full py-3 bg-black text-white text-xs tracking-widest hover:bg-[#333333] transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
