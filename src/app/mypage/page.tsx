"use client";
import { useUser } from "@/providers/UserProvider";
import { LogOut, ChevronRight, User as UserIcon, Settings, Bell, CircleHelp, MessageSquare, ShieldAlert, Footprints, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MyPage() {
  const { user, logout, hasUnreadNotifications, hasUnreadFootprints } = useUser();
  const [isGachaLoading, setIsGachaLoading] = useState(false);

  const handleDailyGacha = async () => {
    if (!user) return;
    setIsGachaLoading(true);
    try {
      const { data, error } = await supabase.rpc('claim_daily_gacha_points', { p_user_id: user.id });
      if (error) throw error;
      
      if (data.success) {
         alert(`ガチャ成功！ ${data.points_added}ポイント獲得しました！\n現在のポイント: ${data.new_total}pt`);
         window.location.reload();
      } else if (data.error === 'ALREADY_CLAIMED') {
         alert('本日のガチャは既に引いています。また明日挑戦してください！');
      } else {
         alert('エラーが発生しました。');
      }
    } catch (err) {
      console.error(err);
      alert('エラーが発生しました。');
    } finally {
      setIsGachaLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-24 font-light">
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] px-6 py-4">
        <h1 className="text-sm font-normal tracking-widest font-bold">マイページ</h1>
      </header>

      <main className="p-6 space-y-6">
        {/* User Card */}
        <div className="bg-white border border-[#E5E5E5] p-6 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 border border-black p-0.5 overflow-hidden">
              {user?.avatar_url ? (
                 <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                 <div className="w-full h-full bg-[#E5E5E5] flex items-center justify-center text-[#777777]">
                   <UserIcon size={24} className="stroke-[1.5]" />
                 </div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-normal tracking-widest uppercase mb-1 flex items-center gap-2">
                {user?.name || "ゲスト"}
                {user?.is_vip && (
                  <img src="/images/vip-crown.png" alt="VIP" className="h-5 object-contain" />
                )}
              </h2>
              <div className="flex gap-2">
                <p className="text-[10px] text-[#777777] tracking-widest bg-[#F9F9F9] inline-block px-2 py-0.5 border border-[#E5E5E5]">
                  {user?.is_admin ? "ADMIN" : user?.role === "cast" ? "キャスト" : "お客様"}
                </p>
                {user?.role === 'customer' && user?.rank && user.rank !== 'Standard' && (
                  <p className="text-[10px] text-white tracking-widest bg-black inline-block px-2 py-0.5 border border-black">
                    {user.rank}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Points & Rank section for customers */}
          {user?.role === 'customer' && (
             <div className="border-t border-[#E5E5E5] pt-4 mt-2">
                <div className="flex justify-between items-end mb-4">
                   <div className="text-[11px] tracking-widest text-[#777777]">現在のポイント</div>
                   <div className="text-xl font-light tracking-widest">{user?.points || 0} <span className="text-xs">pt</span></div>
                </div>
                
                {/* Gacha Button */}
                <button 
                  onClick={handleDailyGacha}
                  disabled={isGachaLoading}
                  className="w-full py-3 bg-[#111] text-white text-xs tracking-widest border border-black hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {isGachaLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "今日のログインガチャを引く"
                  )}
                </button>
             </div>
          )}
        </div>

        {/* Post Creation Action (Cast & Admin Only) */}
        <div className="space-y-4">
          {(user?.role === 'cast' || user?.is_admin) && (
            <Link href="/post" className="premium-btn w-full py-4 text-sm tracking-widest flex items-center justify-center gap-2">
              <MessageSquare size={18} className="stroke-[1.5]" />
              新しい投稿を作成
            </Link>
          )}
          
          {user?.role === 'store' && (
            <Link href="/admin/analytics" className="bg-white border border-black text-black w-full py-4 text-sm tracking-widest flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-colors">
              <BarChart3 size={18} className="stroke-[1.5]" />
              店舗アクセス解析
            </Link>
          )}
          {user?.is_admin && user?.role !== 'store' && (
            <Link href="/admin/announcement" className="bg-white border border-black text-black w-full py-4 text-sm tracking-widest flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-colors">
              <Bell size={18} className="stroke-[1.5]" />
              全店舗・ユーザー向けのお知らせ配信
            </Link>
          )}
        </div>

        {/* Menu Links */}
        <div className="bg-white border border-[#E5E5E5]">
          {user?.role === 'cast' || user?.role === 'store' ? (
            <Link href={`/cast/${user.id}`} className="w-full px-6 py-4 flex items-center justify-between border-b border-[#E5E5E5] hover:bg-[#F9F9F9] transition-colors">
              <div className="flex items-center gap-3">
                <UserIcon size={18} className="stroke-[1.5]" />
                <span className="text-xs tracking-widest">プロフィール確認</span>
              </div>
              <ChevronRight size={16} className="text-[#777777]" />
            </Link>
          ) : (
            <Link href="/mypage/settings" className="w-full px-6 py-4 flex items-center justify-between border-b border-[#E5E5E5] hover:bg-[#F9F9F9] transition-colors">
              <div className="flex items-center gap-3">
                <UserIcon size={18} className="stroke-[1.5]" />
                <span className="text-xs tracking-widest">アカウント設定</span>
              </div>
              <ChevronRight size={16} className="text-[#777777]" />
            </Link>
          )}
          {user?.role !== 'cast' && user?.role !== 'store' && (
            <Link href="/mypage/notifications" className="w-full px-6 py-4 flex items-center justify-between border-b border-[#E5E5E5] hover:bg-[#F9F9F9] transition-colors">
              <div className="flex items-center gap-3 relative">
                <div className="relative">
                  {hasUnreadNotifications ? (
                    <Bell size={18} className="stroke-[1.5] text-[#E02424] fill-[#E02424] animate-ring origin-top" />
                  ) : (
                    <Bell size={18} className="stroke-[1.5]" />
                  )}
                </div>
                <span className="text-xs tracking-widest">お知らせ</span>
              </div>
              <ChevronRight size={16} className="text-[#777777]" />
            </Link>
          )}
          {user?.role === 'cast' ? (
            <Link href="/mypage/settings?open=pref" className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F9F9F9] transition-colors">
              <div className="flex items-center gap-3">
                <Settings size={18} className="stroke-[1.5]" />
                <span className="text-xs tracking-widest">推しポイント設定</span>
              </div>
              <ChevronRight size={16} className="text-[#777777]" />
            </Link>
          ) : (
            <Link href="/mypage/system-settings" className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F9F9F9] transition-colors">
              <div className="flex items-center gap-3">
                <Settings size={18} className="stroke-[1.5]" />
                <span className="text-xs tracking-widest">各種設定</span>
              </div>
              <ChevronRight size={16} className="text-[#777777]" />
            </Link>
          )}

          {user?.role === 'cast' && (
            <Link href="/mypage/dm-settings" className="w-full px-6 py-4 flex items-center justify-between border-t border-[#E5E5E5] hover:bg-[#F9F9F9] transition-colors">
              <div className="flex items-center gap-3">
                <MessageSquare size={18} className="stroke-[1.5]" />
                <span className="text-xs tracking-widest">DM受信設定</span>
              </div>
              <ChevronRight size={16} className="text-[#777777]" />
            </Link>
          )}

          {user?.role === 'cast' && (
            <Link href="/mypage/footprints" className="w-full px-6 py-4 flex items-center justify-between border-t border-[#E5E5E5] hover:bg-[#F9F9F9] transition-colors">
              <div className="flex items-center gap-3 relative">
                <div className="relative">
                  <Footprints size={18} className="stroke-[1.5] text-[#777777]" />
                  {hasUnreadFootprints && (
                    <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full">
                      <Bell size={12} className="text-[#E02424] fill-[#E02424] animate-ring origin-top" />
                    </div>
                  )}
                </div>
                <span className="text-xs tracking-widest">足跡履歴</span>
              </div>
              <ChevronRight size={16} className="text-[#777777]" />
            </Link>
          )}
        </div>



        {/* Support Links */}
        <div className="bg-white border border-[#E5E5E5]">
          <Link href="/mypage/help" className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F9F9F9] transition-colors">
            <div className="flex items-center gap-3">
              <CircleHelp size={18} className="stroke-[1.5]" />
              <span className="text-xs tracking-widest">ヘルプとサポート</span>
            </div>
            <ChevronRight size={16} className="text-[#777777]" />
          </Link>
          <Link href="/mypage/feedback" className="w-full px-6 py-4 flex items-center justify-between border-t border-[#E5E5E5] hover:bg-[#F9F9F9] transition-colors">
            <div className="flex items-center gap-3">
              <MessageSquare size={18} className="stroke-[1.5]" />
              <span className="text-xs tracking-widest">ご意見・ご要望</span>
            </div>
            <ChevronRight size={16} className="text-[#777777]" />
          </Link>
        </div>

        {/* Logout / Login Button */}
        <div className="pt-4">
          {user ? (
            <button 
              onClick={() => logout()}
              className="w-full py-4 border border-black bg-white text-black hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2 group"
            >
              <LogOut size={16} className="stroke-[1.5]" />
              <span className="text-[10px] font-medium tracking-widest uppercase">ログアウト</span>
            </button>
          ) : (
            <Link 
              href="/login"
              className="w-full py-4 border border-black bg-black text-white hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2 group"
            >
              <span className="text-[10px] font-medium tracking-widest uppercase">ログイン / 新規会員登録</span>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
