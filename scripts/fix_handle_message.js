const fs = require('fs');
const file = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /const handleMessage = \(\) => \{\n\s*\/\/ 自身のプレビュー時は何も起きない\n\s*if \(user\?\.id === id\) return;\n\n\s*if \(\!acceptsDms\) \{\n\s*setShowDMDisabledModal\(true\);\n\s*return;\n\s*\}/;

const replacement = `const handleMessage = () => {
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

content = content.replace(regex, replacement);

fs.writeFileSync(file, content);
console.log('Fixed handleMessage in cast page');
