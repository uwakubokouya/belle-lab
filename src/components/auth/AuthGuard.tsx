"use client";
import { useUser } from "@/providers/UserProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from 'next/link';
import { Lock, ArrowRight, UserPlus, ArrowLeft } from 'lucide-react';

const protectedRoutes = ['/mypage/settings', '/mypage/system-settings', '/mypage/notifications', '/reserve'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isMounted, isLoading, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthRoute = pathname === '/login' || pathname === '/register';
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  useEffect(() => {
    if (!isMounted || isLoading) return;
    
    if (user && isAuthRoute) {
      router.replace('/');
    }
  }, [user, isMounted, isLoading, router, pathname, isProtectedRoute, isAuthRoute]);

  if (!isMounted || (isProtectedRoute && isLoading)) {
    return <div className="min-h-screen bg-white flex items-center justify-center"></div>;
  }

  if (isProtectedRoute && !user) {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('authRedirect', pathname);
    }
    
    return (
      <>
        <div className="pointer-events-none select-none filter blur-[3px] opacity-70 transition-all duration-500">
          {children}
        </div>
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="absolute top-6 left-6 border border-white/50 bg-white/50 rounded-full z-10">
             <button 
               onClick={() => router.back()} 
               className="flex items-center justify-center w-10 h-10 text-black hover:bg-black hover:text-white transition-colors rounded-full shadow-sm"
             >
               <ArrowLeft size={16} className="stroke-[2]" />
             </button>
           </div>
           <div className="bg-white w-full max-w-sm p-6 border border-[#E5E5E5] flex flex-col items-center shadow-sm relative">
             <div className="w-12 h-12 border border-black flex items-center justify-center mb-6 text-black">
               <Lock size={20} className="stroke-[1.5]" />
             </div>
             <h3 className="text-sm font-bold tracking-widest mb-2 uppercase text-black">Members Only</h3>
             <p className="text-[10px] text-[#777777] mb-6 tracking-widest">これより先は会員登録が必要です</p>
             
             <div className="w-full bg-[#F9F9F9] border border-[#E5E5E5] p-5 mb-8 text-left space-y-4">
                 <p className="text-[11px] font-bold tracking-widest border-b border-[#E5E5E5] pb-2 mb-4 text-black uppercase">無料会員登録のメリット</p>
                 <div className="flex items-center gap-3 text-xs tracking-widest text-[#333333]">
                    <span className="w-4 h-4 bg-black text-white flex items-center justify-center text-[8px] font-bold shrink-0">1</span>
                    会員・フォロワー限定の<br/>写真・動画が見放題
                 </div>
                 <div className="flex items-center gap-3 text-xs tracking-widest text-[#333333]">
                    <span className="w-4 h-4 bg-black text-white flex items-center justify-center text-[8px] font-bold shrink-0">2</span>
                    お気に入りのキャストと<br/>メッセージでやり取り可能
                 </div>
                 <div className="flex items-center gap-3 text-xs tracking-widest text-[#333333]">
                    <span className="w-4 h-4 bg-black text-white flex items-center justify-center text-[8px] font-bold shrink-0">3</span>
                    予約管理や店舗からの<br/>特別なお知らせを受け取れる
                 </div>
             </div>

             <div className="w-full space-y-3">
               <Link href="/register" className="premium-btn w-full py-4 text-xs tracking-widest flex items-center justify-center bg-black text-white">
                 無料会員登録に進む
               </Link>
               <Link href="/login" className="w-full py-4 flex items-center justify-center text-xs tracking-widest text-[#777777] border border-[#E5E5E5] bg-white hover:bg-[#F9F9F9] transition-colors">
                 ログイン
               </Link>
             </div>

             {/* Fallback button for ghost authentication state */}
             <button 
               onClick={() => logout()}
               className="w-full py-2 text-[10px] text-[#777777] underline tracking-widest mt-4 hover:text-black transition-colors"
             >
               ログイン状態をリセットする（不具合用）
             </button>
           </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
}
