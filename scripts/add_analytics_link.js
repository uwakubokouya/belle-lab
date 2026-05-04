const fs = require('fs');

let content = fs.readFileSync('src/app/mypage/page.tsx', 'utf8');

// 1. Import BarChart3
if (!content.includes('BarChart3')) {
    content = content.replace('Footprints', 'Footprints, BarChart3');
}

// 2. Add the Analytics button for store
const targetPoint = "{user?.is_admin && user?.role !== 'store' && (";
const newButton = `
          {user?.role === 'store' && (
            <Link href="/admin/analytics" className="bg-white border border-black text-black w-full py-4 text-sm tracking-widest flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-colors">
              <BarChart3 size={18} className="stroke-[1.5]" />
              店舗アクセス解析
            </Link>
          )}
          ${targetPoint}`;

content = content.replace(targetPoint, newButton);

fs.writeFileSync('src/app/mypage/page.tsx', content, 'utf8');
console.log('Added store analytics link to mypage');
