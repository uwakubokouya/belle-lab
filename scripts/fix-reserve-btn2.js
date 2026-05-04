const fs = require('fs');
const path = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /\{\/\* Fixed Sticky CTA Bottom for Cast Profile \*\/\}\s*<div className="fixed bottom-\[72px\] left-0 right-0 max-w-md mx-auto p-4 z-40 bg-white border-t border-\[#E5E5E5\]">([\s\S]*?)<\/div>/;
const match = content.match(regex);

if (match && !content.includes('{!isStoreProfile && (\n        <div className="fixed bottom-[72px] left-0 right-0 max-w-md mx-auto p-4 z-40 bg-white border-t border-[#E5E5E5]">')) {
    content = content.replace(regex, '{/* Fixed Sticky CTA Bottom for Cast Profile */}\n      {!isStoreProfile && (\n        <div className="fixed bottom-[72px] left-0 right-0 max-w-md mx-auto p-4 z-40 bg-white border-t border-[#E5E5E5]">' + match[1] + '</div>\n      )}');
    fs.writeFileSync(path, content, 'utf8');
    console.log("Successfully replaced the reserve button.");
} else {
    console.log("Target string not found or already replaced.");
}
