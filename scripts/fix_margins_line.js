const fs = require('fs');
const file = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{cast.name || "名称未設定"}')) {
    // 1行上の <h1> の mb-4 を mb-2 に変更
    if (lines[i-1].includes('mb-4')) {
      lines[i-1] = lines[i-1].replace('mb-4', 'mb-2');
    }
    // 2行下の <Link> の mb-4 mt-1 を mt-0 mb-4 に変更
    for (let j = 1; j <= 5; j++) {
      if (lines[i+j] && lines[i+j].includes('<Link href={`/cast/${storeInfo.id}`}')) {
        lines[i+j] = lines[i+j].replace('mb-4 mt-1', 'mt-0 mb-4');
        lines[i+j] = lines[i+j].replace('mb-4', 'mt-0 mb-4'); // もし mt-1 が無かった場合
        // 重複して mt-0 mt-0 にならないように
        lines[i+j] = lines[i+j].replace('mt-0 mt-0', 'mt-0');
        break;
      }
    }
  }
}

fs.writeFileSync(file, lines.join('\n'));
console.log('Margins updated correctly by line');
