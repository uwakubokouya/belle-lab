const fs = require('fs');
const file = 'src/app/[prefecture]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `          <button 
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              // fetchPosts(); // Optionally refresh
              // For demonstration, clicking title reloads or navigates top
              localStorage.removeItem('age_verified');
              window.location.reload();
            }}
            className="text-lg font-normal tracking-[0.2em] uppercase"
          >
            {prefecture || "総合"}ポータル
          </button>`;

const replace = `          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                localStorage.removeItem('age_verified');
                window.location.reload();
              }}
              className="text-lg font-normal tracking-[0.2em] uppercase"
            >
              {prefecture || "総合"}ポータル
            </button>
            <Link 
              href="/"
              className="text-[10px] tracking-widest text-[#777777] hover:text-black border border-[#E5E5E5] hover:border-black px-2 py-1 transition-colors ml-1"
            >
              エリア変更
            </Link>
          </div>`;

content = content.replace(/\r\n/g, '\n');
const t1 = target.replace(/\r\n/g, '\n');
const r1 = replace.replace(/\r\n/g, '\n');

if (content.includes(t1)) {
    content = content.replace(t1, r1);
    fs.writeFileSync(file, content);
    console.log('Success in page.tsx');
} else {
    console.log('Target not found in page.tsx');
}
