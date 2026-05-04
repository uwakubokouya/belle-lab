const fs = require('fs');
const lines = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8').split('\n');

const newLines = [];
let skip = false;

for(let i=0; i<lines.length; i++) {
    if(i === 954) {
        newLines.push(lines[i]); // ChevronLeft
        newLines.push('            </button>');
        newLines.push('            <div className="flex gap-2">');
        newLines.push('                <button');
        newLines.push('                  onClick={handleMessage}');
        newLines.push('                  className={`p-2 rounded-none border transition-colors flex items-center justify-center ${');
        newLines.push('                    acceptsDms');
        newLines.push('                      ? "bg-white text-black border-black hover:bg-black hover:text-white"');
        newLines.push('                      : "bg-[#F9F9F9] text-[#CCC] border-[#E5E5E5]"');
        newLines.push('                  }`}');
        newLines.push('                >');
        newLines.push('                    <MessageCircle size={18} className="stroke-[1.5]" />');
        newLines.push('                </button>');
        newLines.push('            </div>');
        newLines.push('        </div>');
        newLines.push('      </div>');
        newLines.push('');
        skip = true;
    }
    
    if(skip && lines[i].includes('Profile Info')) {
        skip = false;
    }
    
    if(!skip) {
        newLines.push(lines[i]);
    }
}

fs.writeFileSync('src/app/cast/[id]/page.tsx', newLines.join('\n'));
console.log("Syntax fixed");
