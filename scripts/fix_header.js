const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/cast/[id]/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Header / Cover を追加する処理は成功したか？（念のため正規表現で再度確認）
const headerRegex = /\{\/\* Header \/ Cover \*\/\}/g;
if (!content.includes('Top Header - Only for own profile')) {
    content = content.replace(headerRegex, `      {/* Top Header - Only for own profile */}
      {(user?.id === id || user?.id === resolvedCastId) && (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E5E5E5]">
          <div className="flex px-4 py-4 items-center justify-between">
            <div className="flex flex-col items-center gap-1">
              <button 
                onClick={() => {
                  localStorage.removeItem('age_verified');
                  window.location.reload();
                }}
                className="block"
              >
                <img src="/images/logo2.png" alt="HimeMatch" className="h-16 object-contain" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={async () => {
                  if (typeof logout === 'function') await logout();
                  localStorage.removeItem('age_verified');
                  window.location.reload();
                }}
                className="text-[10px] tracking-widest font-medium uppercase border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Header / Cover */}`);
}

// Top bar controls の置換
const topBarStartRegex = /(\{\/\* Top bar controls \*\/\}\s*<div className="absolute top-0 w-full p-4 flex justify-between items-center z-10">)/;
const matchStart = content.match(topBarStartRegex);

if (matchStart) {
    content = content.replace(topBarStartRegex, `        {/* Top bar controls */}
        {!(user?.id === id || user?.id === resolvedCastId) && (
        <div className="absolute top-0 w-full p-4 flex justify-between items-center z-10">`);
        
    // 終わりの </div> </div> </div> を見つける
    const endRegex = /(<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* Profile Info \*\/\})/;
    const matchEnd = content.match(endRegex);
    if (matchEnd) {
        content = content.replace(endRegex, `            </div>
        </div>
        )}
      </div>

      {/* Profile Info */}`);
        console.log("Successfully replaced Top bar controls");
    } else {
        console.log("Could not find end of top bar controls div");
    }
} else {
    console.log("Could not find Top bar controls start");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('done');
