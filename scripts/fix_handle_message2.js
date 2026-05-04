const fs = require('fs');
const file = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetLF = '  const handleMessage = () => {\n    // 自身のプレビュー時は何も起きない\n    if (user?.id === id) return;\n\n    if (!acceptsDms) {\n      setShowDMDisabledModal(true);\n      return;\n    }';
const targetCRLF = '  const handleMessage = () => {\r\n    // 自身のプレビュー時は何も起きない\r\n    if (user?.id === id) return;\r\n\r\n    if (!acceptsDms) {\r\n      setShowDMDisabledModal(true);\r\n      return;\r\n    }';

const replacement = `  const handleMessage = () => {
    // 自身のプレビュー時は何も起きない
    if (user?.id === id) return;

    // 店舗または運営の場合は、DM設定やフォロー制限を無視して直接チャットへ
    if (profileRole === 'store' || profileRole === 'system') {
      if (!user) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('authRedirect', \`/cast/\${id}\`);
        }
        setShowAuthPrompt(true);
        return;
      }
      router.push(\`/messages/\${id}\`);
      return;
    }

    if (!acceptsDms) {
      setShowDMDisabledModal(true);
      return;
    }`;

if (content.includes(targetLF)) {
  content = content.replace(targetLF, replacement);
  console.log('Replaced LF');
} else if (content.includes(targetCRLF)) {
  content = content.replace(targetCRLF, replacement);
  console.log('Replaced CRLF');
} else {
  console.log('Target not found');
}

fs.writeFileSync(file, content);
console.log('Done');
