const fs = require('fs');
const path = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /  const handleMessage = \(\) => \{\s*\/\/\s*自身のプレビュー時は何も起きない\s*if \(user\?\.id === id\) return;\s*\/\/\s*店舗プロフィールの場合は無条件でメッセージ画面へ遷移\s*if \(isStoreProfile\) \{\s*if \(!user\) \{\s*if \(typeof window !== 'undefined'\) \{\s*sessionStorage\.setItem\('authRedirect', `\/cast\/\$\{id\}`\);\s*\}\s*setShowAuthPrompt\(true\);\s*return;\s*\}\s*router\.push\(`\/messages\/\$\{id\}`\);\s*return;\s*\}\s*if \(!acceptsDms\) \{\s*setShowDMDisabledModal\(true\);\s*return;\s*\}\s*\/\/\s*ゲスト（未ログイン）の場合はメンバーズオンリーを表示\s*if \(!user\) \{\s*if \(typeof window !== 'undefined'\) \{\s*sessionStorage\.setItem\('authRedirect', `\/cast\/\$\{id\}`\);\s*\}\s*setShowAuthPrompt\(true\);\s*return;\s*\}/;

const replaceStr = `  const handleMessage = () => {
    // 自身のプレビュー時は何も起きない
    if (user?.id === id) return;

    // ゲスト（未ログイン）の場合はメンバーズオンリーを最優先で表示
    if (!user) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('authRedirect', \`/cast/\${id}\`);
      }
      setShowAuthPrompt(true);
      return;
    }

    // 店舗プロフィールの場合は無条件でメッセージ画面へ遷移
    if (isStoreProfile) {
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
    console.log("Successfully updated handleMessage order.");
} else {
    console.log("Target regex not found in the file.");
}
