const fs = require('fs');

let content = fs.readFileSync('src/app/mypage/page.tsx', 'utf-8');

// Replace post creation action and add announcement
const targetPostAction = `        {/* Post Creation Action (Cast & Admin Only) */}
        {(user?.role === 'cast' || user?.is_admin) && (
          <Link href="/post" className="premium-btn w-full py-4 text-sm tracking-widest flex items-center justify-center gap-2">
            <MessageSquare size={18} className="stroke-[1.5]" />
            新しい投稿を作成
          </Link>
        )}`;

const replacePostAction = `        {/* Post Creation Action (Cast & Admin Only) */}
        <div className="space-y-4">
          {(user?.role === 'cast' || user?.is_admin) && (
            <Link href="/post" className="premium-btn w-full py-4 text-sm tracking-widest flex items-center justify-center gap-2">
              <MessageSquare size={18} className="stroke-[1.5]" />
              新しい投稿を作成
            </Link>
          )}
          {user?.is_admin && user?.role !== 'store' && (
            <Link href="/admin/announcement" className="bg-white border border-black text-black w-full py-4 text-sm tracking-widest flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-colors">
              <Bell size={18} className="stroke-[1.5]" />
              全店舗・ユーザー向けのお知らせ配信
            </Link>
          )}
        </div>`;

if (content.includes(targetPostAction)) {
    content = content.replace(targetPostAction, replacePostAction);
}

// Remove Admin Links
const targetAdminLinks = `        {/* Admin Links */}
        {user?.is_admin && (
          <Link href="/admin" className="w-full premium-btn py-4 flex items-center justify-center gap-3">
            <ShieldAlert size={18} className="stroke-[1.5]" />
            <span className="text-sm tracking-widest">【運営】管理ダッシュボードを開く</span>
          </Link>
        )}`;

if (content.includes(targetAdminLinks)) {
    content = content.replace(targetAdminLinks, '');
}

fs.writeFileSync('src/app/mypage/page.tsx', content);
console.log("mypage updated.");
