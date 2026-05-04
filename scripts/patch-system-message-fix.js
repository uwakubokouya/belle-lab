const fs = require('fs');
const path = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /\/\/ 店舗プロフィールの場合は無条件でメッセージ画面へ遷移\s*if \(isStoreProfile\) \{\s*router\.push\(`\/messages\/\$\{id\}`\);\s*return;\s*\}/;

const replaceStr = `// システムプロフィールの場合は無条件でDM無効モーダル（案内文）を表示
    if (isSystemProfile) {
      setShowDMDisabledModal(true);
      return;
    }

    // 店舗プロフィールの場合は無条件でメッセージ画面へ遷移
    if (isStoreProfile) {
      router.push(\`/messages/\${id}\`);
      return;
    }`;

if (content.match(regex)) {
    content = content.replace(regex, replaceStr);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Successfully fixed system message handling.");
} else {
    console.log("Target regex not found in the file.");
}
