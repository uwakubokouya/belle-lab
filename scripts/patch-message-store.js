const fs = require('fs');
const path = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `  const handleMessage = () => {
    // 自身のプレビュー時は何も起きない
    if (user?.id === id) return;

    if (!acceptsDms) {
      setShowDMDisabledModal(true);
      return;
    }`;

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

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replaceStr);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Successfully updated handleMessage logic.");
} else {
    console.log("Target string not found in the file.");
}
