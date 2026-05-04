const fs = require('fs');
const file = 'src/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `              <p className="text-lg tracking-[0.2em] font-bold group-hover:scale-105 transition-transform inline-block">
                前回選択したエリア ({lastArea}) に戻る
              </p>`;

const replace = `              <p className="text-lg tracking-[0.2em] font-bold group-hover:scale-105 transition-transform inline-block">
                前回選択したエリア ({decodeURIComponent(lastArea)}) に戻る
              </p>`;

content = content.replace(/\r\n/g, '\n');
const t = target.replace(/\r\n/g, '\n');
const r = replace.replace(/\r\n/g, '\n');

if (content.includes(t)) {
    content = content.replace(t, r);
    fs.writeFileSync(file, content);
    console.log('Success decoding last area in page.tsx');
} else {
    console.log('Target not found in page.tsx');
}
