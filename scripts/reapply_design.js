const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/app/cast/[id]/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Owner Header
const headerStr = `      {/* Custom Header for cast owner */}
      {(user?.id === id || user?.id === resolvedCastId) && (
        <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-widest text-[#E02424] flex items-center gap-1">
              <Crown size={16} className="fill-[#E02424]" />
              HimeMatch
            </h1>
            <span className="text-[8px] text-[#777777] tracking-widest mt-1">彼女のリアルとマッチする。</span>
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

      {/* Header / Cover */}`;
content = content.replace(`      {/* Header / Cover */}`, headerStr);

// 2. Fix Images
const imgTarget = `<img src={cast.cover} alt="Cover" className="w-full h-full object-cover opacity-50 mix-blend-overlay" />`;
const imgReplacement = `<img src={cast.cover} alt="Cover" className="absolute inset-0 w-full h-full object-cover z-0" />`;
content = content.replace(imgTarget, imgReplacement);

const divTarget = `<div className="w-full h-full bg-[#E5E5E5] opacity-20"></div>`;
const divReplacement = `<div className="absolute inset-0 w-full h-full bg-[#E5E5E5] opacity-20 z-0"></div>`;
content = content.replace(divTarget, divReplacement);

// 3. Remove E-GIRLS text
const eGirlsRegex = /\s*\{\/\* Typography over cover \*\/\}\s*<div className="absolute inset-0 flex items-center justify-center text-center">\s*<h1 className="text-4xl font-light tracking-\[0\.3em\] uppercase text-black\/20 mix-blend-overlay">E-GIRLS<\/h1>\s*<\/div>/;
content = content.replace(eGirlsRegex, '');

// 4. Hide top bar controls for owner
const topBarTarget = `{/* Top bar controls */}
        <div className="absolute top-0 w-full p-4 flex justify-between items-center z-10">`;
const topBarReplacement = `{/* Top bar controls */}
        {!(user?.id === id || user?.id === resolvedCastId) && (
        <div className="absolute top-0 w-full p-4 flex justify-between items-center z-10">`;
content = content.replace(topBarTarget, topBarReplacement);

const endTopBarTarget = `                </button>
            </div>
        </div>
      </div>`;
const endTopBarReplacement = `                </button>
            </div>
        </div>
        )}
      </div>`;
content = content.replace(endTopBarTarget, endTopBarReplacement);

fs.writeFileSync(pagePath, content, 'utf8');
console.log('Successfully reapplied design fixes');
