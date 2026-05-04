const fs = require('fs');
const file = 'src/components/layout/BottomNav.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const { user, hasUnreadNotifications, hasUnreadMessages, hasUnreadFeedbacks } = useUser();
  const role = user?.role;
  const pathname = usePathname();
  
  if (pathname === '/login' || pathname === '/register') return null;

  return (
    <nav className="fixed bottom-0 w-full max-w-md mx-auto bg-white border-t border-[#E5E5E5] z-50 px-6 py-3 pb-8 flex justify-around items-center text-[#777777]">
      <Link href="/" className="flex flex-col items-center gap-1 hover:text-black transition-colors">
        <Home size={20} className={pathname === '/' ? 'text-black stroke-[2.5]' : 'stroke-2'} />
        <span className={\`text-[10px] font-normal tracking-widest \${pathname === '/' ? 'text-black font-bold' : ''}\`}>ホーム</span>
      </Link>`;

const replace1 = `import { usePathname, useParams } from 'next/navigation';

export default function BottomNav() {
  const { user, hasUnreadNotifications, hasUnreadMessages, hasUnreadFeedbacks } = useUser();
  const role = user?.role;
  const pathname = usePathname();
  const params = useParams();
  const prefecture = params?.prefecture as string | undefined;
  
  const homePath = prefecture ? \`/\${prefecture}\` : '/';
  const searchPath = prefecture ? \`/\${prefecture}/search\` : '/search';
  
  if (pathname === '/login' || pathname === '/register') return null;

  return (
    <nav className="fixed bottom-0 w-full max-w-md mx-auto bg-white border-t border-[#E5E5E5] z-50 px-6 py-3 pb-8 flex justify-around items-center text-[#777777]">
      <Link href={homePath} className="flex flex-col items-center gap-1 hover:text-black transition-colors">
        <Home size={20} className={pathname === homePath || pathname === '/' ? 'text-black stroke-[2.5]' : 'stroke-2'} />
        <span className={\`text-[10px] font-normal tracking-widest \${pathname === homePath || pathname === '/' ? 'text-black font-bold' : ''}\`}>ホーム</span>
      </Link>`;

const target2 = `      {role === 'cast' ? (
        <Link href="/messages" className="flex flex-col items-center gap-1 hover:text-black transition-colors">
          <div className="relative">
             <MessageSquare size={20} className={pathname === '/messages' ? 'text-black stroke-[2.5]' : 'stroke-2'} />
             {hasUnreadMessages && (
               <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#E02424] border-2 border-white rounded-full"></div>
             )}
          </div>
          <span className={\`text-[10px] font-normal tracking-widest \${pathname === '/messages' ? 'text-black font-bold' : ''}\`}>メッセージ</span>
        </Link>
      ) : (
        <Link href="/search" className="flex flex-col items-center gap-1 hover:text-black transition-colors">
          <Search size={20} className={pathname === '/search' ? 'text-black stroke-[2.5]' : 'stroke-2'} />
          <span className={\`text-[10px] font-normal tracking-widest \${pathname === '/search' ? 'text-black font-bold' : ''}\`}>探す</span>
        </Link>
      )}`;

const replace2 = `      {role === 'cast' ? (
        <Link href="/messages" className="flex flex-col items-center gap-1 hover:text-black transition-colors">
          <div className="relative">
             <MessageSquare size={20} className={pathname === '/messages' ? 'text-black stroke-[2.5]' : 'stroke-2'} />
             {hasUnreadMessages && (
               <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#E02424] border-2 border-white rounded-full"></div>
             )}
          </div>
          <span className={\`text-[10px] font-normal tracking-widest \${pathname === '/messages' ? 'text-black font-bold' : ''}\`}>メッセージ</span>
        </Link>
      ) : (
        <Link href={searchPath} className="flex flex-col items-center gap-1 hover:text-black transition-colors">
          <Search size={20} className={pathname === searchPath || pathname === '/search' ? 'text-black stroke-[2.5]' : 'stroke-2'} />
          <span className={\`text-[10px] font-normal tracking-widest \${pathname === searchPath || pathname === '/search' ? 'text-black font-bold' : ''}\`}>探す</span>
        </Link>
      )}`;

content = content.replace(/\r\n/g, '\n');
const t1 = target1.replace(/\r\n/g, '\n');
const r1 = replace1.replace(/\r\n/g, '\n');
const t2 = target2.replace(/\r\n/g, '\n');
const r2 = replace2.replace(/\r\n/g, '\n');

if (content.includes(t1) && content.includes(t2)) {
    content = content.replace(t1, r1);
    content = content.replace(t2, r2);
    fs.writeFileSync(file, content);
    console.log('Success');
} else {
    if (!content.includes(t1)) console.log('Target 1 not found');
    if (!content.includes(t2)) console.log('Target 2 not found');
}
