const fs = require('fs');

let lines = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8').split(/\r?\n/);

let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('店舗外で会おうと誘う行為や連絡先を聞く行為等は禁止させて頂いております。違反が発覚した際は当社顧問弁護士の指導のもと、厳格な対処を取らせて頂きます。')) {
        startIdx = i - 1; // <p className="...">
        endIdx = i + 1; // </p>
        break;
    }
}

if (startIdx !== -1) {
    const newContent = `            <div className="text-xs text-[#333333] leading-relaxed mb-6 bg-[#F9F9F9] p-4 text-justify">
              {profileData.role === 'store' ? (
                <>
                  お問い合わせいただきありがとうございます。<br />
                  本窓口では、店舗に関するお問い合わせを承っております。<br />
                  お送りいただいた内容によっては、お返事を差し上げることが難しい場合もございます。<br />
                  あらかじめご容赦いただけますと幸いです。<br />
                  なお、ご予約や空き状況の確認につきましては、お電話またはネット予約にて迅速に対応させていただきます。<br />
                  ぜひそちらをご利用くださいませ。
                </>
              ) : (
                "店舗外で会おうと誘う行為や連絡先を聞く行為等は禁止させて頂いております。違反が発覚した際は当社顧問弁護士の指導のもと、厳格な対処を取らせて頂きます。"
              )}
            </div>`;
    
    lines.splice(startIdx, endIdx - startIdx + 1, ...newContent.split('\n'));
    fs.writeFileSync('src/app/cast/[id]/page.tsx', lines.join('\n'), 'utf8');
    console.log('Done fix store DM warning modal');
} else {
    console.log('Could not find store DM warning message');
}
