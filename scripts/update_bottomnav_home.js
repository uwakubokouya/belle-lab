const fs = require('fs');
const file = 'src/components/layout/BottomNav.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `  // ホームタブは常にエリア選択画面(/)に戻るようにする（ユーザー要望）
  const homePath = '/';
  // 探すタブは、選択中のエリアまたは前回選択したエリアの検索画面にする
  const searchPath = currentPref ? \`/\${currentPref}/search\` : '/search';`;

const replace = `  // ユーザー要望により、ホームタブは選択中のエリア(タイムライン)とする
  const homePath = currentPref ? \`/\${currentPref}\` : '/';
  const searchPath = currentPref ? \`/\${currentPref}/search\` : '/search';`;

content = content.replace(/\r\n/g, '\n');
const t = target.replace(/\r\n/g, '\n');
const r = replace.replace(/\r\n/g, '\n');

if (content.includes(t)) {
    content = content.replace(t, r);
    fs.writeFileSync(file, content);
    console.log('Success updating BottomNav homePath');
} else {
    console.log('Target not found in BottomNav.tsx');
}
