const fs = require('fs');
const path = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove fixed UI
const fixedUiRegex = /\{isSystemProfile && \(\s*<div className="mt-4 p-4 bg-\[#F9F9F9\] border border-\[#E5E5E5\] text-\[10px\] text-\[#333333\] tracking-widest leading-relaxed w-full">\s*運営へのご意見やご要望につきましては、メニュータブ内の「ご意見」フォームよりお寄せいただけますと幸いです。<br \/>\s*皆様からのお声を参考に、より良いサービス作りに努めてまいります。\s*<\/div>\s*\)\}/;

if (content.match(fixedUiRegex)) {
    content = content.replace(fixedUiRegex, '');
} else {
    console.log("Fixed UI block not found. Skipping removal.");
}

// 2. Modify DM Disabled Modal
const modalTargetRegex = /<p className="text-xs text-\[#333333\] leading-relaxed mb-8 bg-\[#F9F9F9\] p-4 text-center">\s*このキャストは現在DM機能が有効ではありません。\s*<\/p>/;
const modalReplaceStr = `<p className={\`text-xs text-[#333333] leading-relaxed mb-8 bg-[#F9F9F9] p-4 \${isSystemProfile ? 'text-left' : 'text-center'}\`}>
              {isSystemProfile ? (
                <>
                  運営へのご意見やご要望につきましては、メニュータブ内の「ご意見」フォームよりお寄せいただけますと幸いです。<br />
                  皆様からのお声を参考に、より良いサービス作りに努めてまいります。
                </>
              ) : (
                "このキャストは現在DM機能が有効ではありません。"
              )}
            </p>`;

if (content.match(modalTargetRegex)) {
    content = content.replace(modalTargetRegex, modalReplaceStr);
    console.log("Successfully replaced modal content.");
} else {
    console.log("Modal target string not found.");
}

fs.writeFileSync(path, content, 'utf8');
