"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Star } from 'lucide-react';
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsSubmitting(true);
    setErrorMsg("");

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
      alert(visibility === 'secret' 
        ? "VIP口コミを送信しました。運営の確認後に公開されます。" 
        : "口コミを送信しました。承認後に公開されます。");
      onReviewSubmitted();
      setContent("");
      setRating(5);
      setScore('');
      setVisitedDate('');
      onClose();
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
    </div>
  );
}
