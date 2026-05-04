"use client";

import React, { useState } from 'react';
import { useUser } from '@/providers/UserProvider';
import { useRouter } from 'next/navigation';
import { Sparkles, Check, ArrowLeft, Shield } from 'lucide-react';

export default function VipPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  if (isLoading) {
    return <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleSubscribe = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.phone ? `${user.phone}@dummy.com` : undefined // fallback email
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'エラーが発生しました');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-light pb-20">
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-[#E5E5E5] flex items-center justify-between p-4">
        <button onClick={() => router.back()} className="text-black p-2 -ml-2 hover:bg-[#F9F9F9] transition-colors rounded-full">
          <ArrowLeft size={20} className="stroke-[1.5]" />
        </button>
        <h1 className="text-xs font-bold tracking-widest uppercase">VIP Membership</h1>
        <div className="w-8"></div>
      </div>

      <div className="max-w-md mx-auto p-6 flex flex-col items-center">
        <div className="w-16 h-16 bg-[#D4AF37] text-white flex items-center justify-center mb-6 mt-8 shadow-xl">
          <Sparkles size={28} className="stroke-[1.5]" />
        </div>
        
        <h2 className="text-2xl font-normal tracking-[0.2em] mb-2 text-center leading-relaxed">
          VIP会員プログラム
        </h2>
        <p className="text-xs text-[#777777] mb-10 tracking-widest text-center">
          選ばれたお客様のための特別な体験
        </p>

        {user.is_vip ? (
          <div className="w-full border border-[#D4AF37] p-6 text-center bg-[#FFFBF0] mb-8">
            <h3 className="text-sm font-bold tracking-widest text-[#D4AF37] mb-2 uppercase">You are a VIP</h3>
            <p className="text-xs text-[#333333] leading-relaxed">
              すでにVIP会員にご登録いただいております。<br/>
              特別なサービスをお楽しみください。
            </p>
          </div>
        ) : (
          <>
            <div className="w-full border border-[#E5E5E5] p-6 mb-8 bg-[#F9F9F9]">
              <h3 className="text-center text-lg tracking-widest font-bold mb-6">¥1,980 <span className="text-[10px] font-normal text-[#777777]">/ 月</span></h3>
              
              <ul className="space-y-4">
                <li className="flex gap-3 items-start">
                  <Check size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold tracking-widest mb-1">VIP口コミの閲覧・投稿</h4>
                    <p className="text-[10px] text-[#777777] leading-relaxed">店舗に見られない、VIP会員だけの本音の口コミ（シークレット掲示板）を閲覧・投稿できます。</p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <Check size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold tracking-widest mb-1">優先予約・特別なご案内</h4>
                    <p className="text-[10px] text-[#777777] leading-relaxed">人気のキャストの優先予約枠や、VIP限定の特別なシークレットイベントにご招待します。</p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <Check size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold tracking-widest mb-1">広告非表示・機能解放</h4>
                    <p className="text-[10px] text-[#777777] leading-relaxed">アプリ内の広告を完全に非表示にし、さらに足あと等の高度な機能をご利用いただけます。</p>
                  </div>
                </li>
              </ul>
            </div>

            <button 
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="w-full bg-[#D4AF37] hover:bg-[#B5952F] text-white py-4 tracking-[0.2em] text-sm font-bold transition-colors flex items-center justify-center disabled:bg-gray-300 shadow-lg"
            >
              {isProcessing ? '処理中...' : 'VIP会員にアップグレード'}
            </button>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-[#777777] tracking-widest">
              <Shield size={12} />
              <span>安心のStripe決済を利用しています</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
