const fs = require('fs');
const path = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// The exact string we want to replace
const targetStr = `      {/* Fixed Sticky CTA Bottom for Cast Profile */}
      <div className="fixed bottom-[72px] left-0 right-0 max-w-md mx-auto p-4 z-40 bg-white border-t border-[#E5E5E5]">
          {user?.id === id ? (
            <button onClick={() => setIsEditingProfile(true)} className="premium-btn w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest">
               <UserPlus size={18} className="stroke-[1.5]" />
               プロフィールを設定・編集する
            </button>
          ) : (
            <Link href={\`/reserve/\${id}\`} className="premium-btn w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest">
               <Calendar size={18} className="stroke-[1.5]" />
               このキャストを予約する
            </Link>
          )}
      </div>`;

const replacementStr = `      {/* Fixed Sticky CTA Bottom for Cast Profile */}
      {!isStoreProfile && (
        <div className="fixed bottom-[72px] left-0 right-0 max-w-md mx-auto p-4 z-40 bg-white border-t border-[#E5E5E5]">
            {user?.id === id ? (
              <button onClick={() => setIsEditingProfile(true)} className="premium-btn w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest">
                 <UserPlus size={18} className="stroke-[1.5]" />
                 プロフィールを設定・編集する
              </button>
            ) : (
              <Link href={\`/reserve/\${id}\`} className="premium-btn w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest">
                 <Calendar size={18} className="stroke-[1.5]" />
                 このキャストを予約する
              </Link>
            )}
        </div>
      )}`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Successfully replaced the reserve button.");
} else {
    console.log("Target string not found in the file.");
}
