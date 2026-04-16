"use client";
import Link from 'next/link';
import { Home, Search, SquarePen, User, Menu, Bell, MessageSquare } from 'lucide-react';
import { useUser } from '@/providers/UserProvider';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const { user, hasUnreadNotifications, hasUnreadMessages, hasUnreadFeedbacks } = useUser();
  const role = user?.role;
  const pathname = usePathname();
  
  if (pathname === '/login' || pathname === '/register') return null;

  return (
    <nav className="fixed bottom-0 w-full max-w-md mx-auto bg-white border-t border-[#E5E5E5] z-50 px-6 py-3 pb-8 flex justify-around items-center text-[#777777]">
      <Link href="/" className="flex flex-col items-center gap-1 hover:text-black transition-colors">
        <Home size={20} className={pathname === '/' ? 'text-black stroke-[2.5]' : 'stroke-2'} />
        <span className={`text-[10px] font-normal tracking-widest ${pathname === '/' ? 'text-black font-bold' : ''}`}>ホーム</span>
      </Link>
      
      {role === 'cast' ? (
        <Link href="/messages" className="flex flex-col items-center gap-1 hover:text-black transition-colors">
          <div className="relative">
             <MessageSquare size={20} className={pathname === '/messages' ? 'text-black stroke-[2.5]' : 'stroke-2'} />
             {hasUnreadMessages && (
               <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#E02424] border-2 border-white rounded-full"></div>
             )}
          </div>
          <span className={`text-[10px] font-normal tracking-widest ${pathname === '/messages' ? 'text-black font-bold' : ''}`}>メッセージ</span>
        </Link>
      ) : (
        <Link href="/search" className="flex flex-col items-center gap-1 hover:text-black transition-colors">
          <Search size={20} className={pathname === '/search' ? 'text-black stroke-[2.5]' : 'stroke-2'} />
          <span className={`text-[10px] font-normal tracking-widest ${pathname === '/search' ? 'text-black font-bold' : ''}`}>探す</span>
        </Link>
      )}
      
      {role === 'cast' && (
        <Link href="/post" className="flex flex-col items-center gap-1 hover:text-black transition-colors relative">
          <SquarePen size={20} className={pathname === '/post' ? 'text-black stroke-[2.5]' : 'stroke-2'} />
          <span className={`text-[10px] font-normal tracking-widest ${pathname === '/post' ? 'text-black font-bold' : ''}`}>投稿</span>
        </Link>
      )}

      {user?.is_admin && (
        <Link href="/admin/feedback" className="flex flex-col items-center gap-1 hover:text-black transition-colors">
          <div className="relative">
             <MessageSquare size={20} className={pathname === '/admin/feedback' ? 'text-black stroke-[2.5]' : 'stroke-2'} />
             {hasUnreadFeedbacks && (
               <div className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E02424] opacity-50"></span>
                 <span className="relative inline-flex rounded-full h-4 w-4 bg-[#E02424] border-2 border-white flex items-center justify-center">
                   <span className="text-[8px] text-white font-bold leading-none shrink-0" style={{ transform: 'scale(0.8)' }}>N</span>
                 </span>
               </div>
             )}
          </div>
          <span className={`text-[10px] font-normal tracking-widest ${pathname === '/admin/feedback' ? 'text-black font-bold' : ''}`}>ご意見</span>
        </Link>
      )}
      
      <Link href="/mypage" className="flex flex-col items-center gap-1 hover:text-black transition-colors relative">
        <div className="relative">
          <Menu size={20} className="stroke-2" />
          {hasUnreadNotifications && (
            <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full">
              <Bell size={12} className="text-[#E02424] fill-[#E02424] animate-ring origin-top" />
            </div>
          )}
        </div>
        <span className="text-[10px] font-normal tracking-widest">メニュー</span>
      </Link>
    </nav>
  );
}
