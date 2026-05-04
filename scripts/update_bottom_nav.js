const fs = require('fs');

let content = fs.readFileSync('src/components/layout/BottomNav.tsx', 'utf-8');

// 1. Add BarChart3 to imports
if (!content.includes('BarChart3')) {
    content = content.replace('MessageSquare } from \'lucide-react\';', 'MessageSquare, BarChart3 } from \'lucide-react\';');
}

// 2. Replace the search/message tab logic
const targetLogic = `      {role === 'cast' || role === 'store' ? (
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

const replacementLogic = `      {user?.is_admin && role !== 'store' ? (
        <Link href="/admin/analytics" className="flex flex-col items-center gap-1 hover:text-black transition-colors">
          <BarChart3 size={20} className={pathname === '/admin/analytics' ? 'text-black stroke-[2.5]' : 'stroke-2'} />
          <span className={\`text-[10px] font-normal tracking-widest \${pathname === '/admin/analytics' ? 'text-black font-bold' : ''}\`}>解析</span>
        </Link>
      ) : role === 'cast' || role === 'store' ? (
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

if (content.includes(targetLogic)) {
    content = content.replace(targetLogic, replacementLogic);
}

fs.writeFileSync('src/components/layout/BottomNav.tsx', content);
console.log("BottomNav updated.");
