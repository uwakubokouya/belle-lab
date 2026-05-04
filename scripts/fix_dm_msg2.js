const fs = require('fs');
const file = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = '{profileRole === "system" ? "運営へのご意見・ご要望はメニュータブの「ご意見」からお送りください。" : "このキャストは現在DM機能が有効ではありません。"}';

const replacement = `{profileRole === "system" ? (
  <>
    運営へのご意見やご要望につきましては、メニュータブ内の「ご意見」フォームよりお寄せいただけますと幸いです。<br />
    皆様からのお声を参考に、より良いサービス作りに努めてまいります。
  </>
) : (
  "このキャストは現在DM機能が有効ではありません。"
)}`;

content = content.replace(target, replacement);

fs.writeFileSync(file, content);
console.log('Fixed message wording');
