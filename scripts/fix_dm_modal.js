const fs = require('fs');

let lines = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8').split(/\r?\n/);

let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('このキャストは現在DM機能が有効ではありません。')) {
        startIdx = i - 1; // <p className="...">
        endIdx = i + 1; // </p>
        break;
    }
}

if (startIdx !== -1) {
    const newContent = `            <div className="text-xs text-[#333333] leading-relaxed mb-8 bg-[#F9F9F9] p-4 text-center text-left">
              {profileData.role === 'system' ? (
                <>
                  運営へのご意見やご要望につきましては、メニュータブ内の「ご意見」フォームよりお寄せいただけますと幸いです。<br />
                  皆様からのお声を参考に、より良いサービス作りに努めてまいります。
                </>
              ) : (
                "このキャストは現在DM機能が有効ではありません。"
              )}
            </div>`;
    
    lines.splice(startIdx, endIdx - startIdx + 1, ...newContent.split('\n'));
    fs.writeFileSync('src/app/cast/[id]/page.tsx', lines.join('\n'), 'utf8');
    console.log('Done fix DM modal');
} else {
    console.log('Could not find DM message');
}
