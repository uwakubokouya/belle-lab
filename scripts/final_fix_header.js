const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/app/cast/[id]/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

const replacement = `      {/* Custom Header for cast owner */}
      {(user?.id === id || user?.id === resolvedCastId) && (
        <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] px-6 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/images/logo2.png" alt="HimeMatch" className="h-16 object-contain" />
          </div>
          <button 
            onClick={() => {
              if (logout) {
                logout();
              } else {
                router.push('/login');
              }
            }}
            className="text-[10px] font-medium tracking-widest border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors"
          >
            LOGOUT
          </button>
        </header>
      )}

      {/* Header / Cover */}
      <div 
        className={\`relative h-56 bg-[#F9F9F9] border-b border-[#E5E5E5] flex items-center justify-center overflow-hidden \${cast.cover ? 'cursor-pointer' : ''}\`}
        onClick={() => {
            if (cast.cover) setFullscreenImage(cast.cover);
        }}
      >
        {cast.cover ? (
           /* eslint-disable-next-line @next/next/no-img-element */
           <img src={cast.cover} alt="Cover" className="absolute inset-0 w-full h-full object-cover z-0" />
        ) : (
           <div className="absolute inset-0 w-full h-full bg-[#E5E5E5] opacity-20 z-0"></div>
        )}

        {/* Top bar controls */}
        {!(user?.id === id || user?.id === resolvedCastId) && (
        <div className="absolute top-0 w-full p-4 flex justify-between items-center z-10">
            <button onClick={() => router.back()} className="bg-white p-2 rounded-none text-black border border-black hover:bg-black hover:text-white transition-colors">
                <ChevronLeft size={20} className="stroke-[1.5]" />
            </button>
            <div className="flex gap-2">
                <button 
                  onClick={handleMessage} 
                  className={\`p-2 rounded-none border transition-colors flex items-center justify-center \${
                    acceptsDms 
                      ? 'bg-white text-black border-black hover:bg-black hover:text-white' 
                      : 'bg-[#F9F9F9] text-[#CCC] border-[#E5E5E5]'
                  }\`}
                >
                    <MessageCircle size={18} className="stroke-[1.5]" />
                </button>
            </div>
        </div>
        )}
      </div>`;

// 正規表現で、`{/* Header / Cover */}` から `</div>` までを抽出して置換する
const regex = /\{\/\* Header \/ Cover \*\/\}[\s\S]*?\{\/\* Profile Info \*\/\}/g;
content = content.replace(regex, replacement + '\n\n      {/* Profile Info */}');

fs.writeFileSync(pagePath, content, 'utf8');
console.log('Successfully replaced header and cover section.');
