const fs = require('fs');
const file = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<button \s*onClick=\{\(\) => setActiveTab\('shifts'\)\}\s*className=\{`flex-1 py-4 text-\[11px\] tracking-widest relative transition-colors \$\{activeTab === 'shifts' \? 'font-bold text-black bg-\[#F9F9F9\]' : 'font-normal text-\[#777777\] hover:bg-\[#F9F9F9\]'\}`\}\s*>\s*出勤情報\s*\{activeTab === 'shifts' && <div className="absolute top-0 w-full h-\[1px\] bg-black"><\/div>\}\s*<\/button>/;

const replacement = `{!(profileRole === "system" || profileRole === "store") && (
          <button 
             onClick={() => setActiveTab('shifts')}
             className={\`flex-1 py-4 text-[11px] tracking-widest relative transition-colors \${activeTab === 'shifts' ? 'font-bold text-black bg-[#F9F9F9]' : 'font-normal text-[#777777] hover:bg-[#F9F9F9]'}\`}
          >
            出勤情報
            {activeTab === 'shifts' && <div className="absolute top-0 w-full h-[1px] bg-black"></div>}
          </button>
          )}`;

content = content.replace(regex, replacement);

fs.writeFileSync(file, content);
console.log('Fixed shifts tab visibility');
