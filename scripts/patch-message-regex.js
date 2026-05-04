const fs = require('fs');
const path = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /  const handleMessage = \(\) => \{\s*\/\/\s*自身のプレビュー時は何も起きない\s*if \(user\?\.id === id\) return;\s*if \(!acceptsDms\) \{\s*setShowDMDisabledModal\(true\);\s*return;\s*\}/;

const replaceStr = `  const handleMessage = () => {
    // 自身のプレビュー時は何も起きない
    if (user?.id === id) return;

    // 店舗プロフィールの場合は無条件でメッセージ画面へ遷移
    if (isStoreProfile) {
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

if (content.match(regex)) {
    content = content.replace(regex, replaceStr);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Successfully updated handleMessage logic.");
} else {
    console.log("Target regex not found in the file.");
}
