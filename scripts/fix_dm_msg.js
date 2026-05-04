const fs = require('fs');
const file = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// DM無効メッセージの置換
content = content.replace(
  'このキャストは現在DM機能が有効ではありません。',
  '{profileRole === "system" ? "運営へのご意見・ご要望はメニュータブの「ご意見」からお送りください。" : "このキャストは現在DM機能が有効ではありません。"}'
);

fs.writeFileSync(file, content);
console.log('Fixed DM message');
