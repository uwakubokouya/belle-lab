const fs = require('fs');
const file = 'src/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `export default function AreaSelectionPage() {`;
const replace1 = `export default function AreaSelectionPage() {
  // --- Start Added Logic for Auto-Resume ---
  const [lastArea, setLastArea] = React.useState<string | null>(null);
  React.useEffect(() => {
    const saved = localStorage.getItem('last_prefecture');
    if (saved) {
      setLastArea(saved);
    }
  }, []);
  // --- End Added Logic ---`;

const target2 = `        <div className="mb-12 text-center">
          <h2 className="text-sm tracking-widest font-bold mb-4 uppercase">Area Selection</h2>
          <p className="text-xs tracking-widest text-[#777777] leading-loose">
            ご覧になりたいエリアを選択してください。<br/>
            全国の厳選されたキャスト情報をお届けします。
          </p>
        </div>`;

const replace2 = `        <div className="mb-12 text-center">
          <h2 className="text-sm tracking-widest font-bold mb-4 uppercase">Area Selection</h2>
          <p className="text-xs tracking-widest text-[#777777] leading-loose">
            ご覧になりたいエリアを選択してください。<br/>
            全国の厳選されたキャスト情報をお届けします。
          </p>
        </div>

        {lastArea && (
          <div className="mb-12 animate-in fade-in zoom-in duration-500">
            <Link href={\`/\${lastArea}\`} className="block w-full border border-black bg-black text-white p-6 text-center group hover:bg-white hover:text-black transition-colors">
              <p className="text-[10px] tracking-widest mb-2 opacity-80 uppercase">Last Selected Area</p>
              <p className="text-lg tracking-[0.2em] font-bold group-hover:scale-105 transition-transform inline-block">
                前回選択したエリア ({lastArea}) に戻る
              </p>
            </Link>
          </div>
        )}`;

content = content.replace(/\r\n/g, '\n');
const t1 = target1.replace(/\r\n/g, '\n');
const r1 = replace1.replace(/\r\n/g, '\n');
const t2 = target2.replace(/\r\n/g, '\n');
const r2 = replace2.replace(/\r\n/g, '\n');

if (content.includes(t1) && content.includes(t2)) {
    if (!content.includes("import React")) {
        content = `import React from 'react';\n` + content;
    }
    content = content.replace(t1, r1).replace(t2, r2);
    // Remove default "use client" if it's there
    if (!content.includes('"use client"')) {
        content = '"use client";\n' + content;
    }
    fs.writeFileSync(file, content);
    console.log('Success adding last area shortcut to page.tsx');
} else {
    console.log('Target not found in page.tsx');
}
