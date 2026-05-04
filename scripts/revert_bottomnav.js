const fs = require('fs');
const file = 'src/components/layout/BottomNav.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `  const currentPref = prefecture || savedPref;
  
  const homePath = currentPref ? \`/\${currentPref}\` : '/';
  const searchPath = currentPref ? \`/\${currentPref}/search\` : '/search';`;

const replace1 = `  const currentPref = prefecture || savedPref;
  
  // ホームタブは常にエリア選択画面(/)に戻るようにする（ユーザー要望）
  const homePath = '/';
  // 探すタブは、選択中のエリアまたは前回選択したエリアの検索画面にする
  const searchPath = currentPref ? \`/\${currentPref}/search\` : '/search';`;

content = content.replace(/\r\n/g, '\n');
const t1 = target1.replace(/\r\n/g, '\n');
const r1 = replace1.replace(/\r\n/g, '\n');

if (content.includes(t1)) {
    content = content.replace(t1, r1);
    fs.writeFileSync(file, content);
    console.log('Success reverting BottomNav homePath');
} else {
    console.log('Target not found for BottomNav homePath revert');
}
