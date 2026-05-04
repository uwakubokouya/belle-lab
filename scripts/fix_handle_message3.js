const fs = require('fs');
const file = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /const handleMessage = \(\) => \{\s*\/\/[^\n]*\s*if \(user\?\.id === id\) return;\s*if \(\!acceptsDms\) \{/;
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

    if (!acceptsDms) {`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
  console.log('Fixed using regex');
} else {
  console.log('Regex did not match');
}
