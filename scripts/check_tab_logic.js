const fs = require('fs');
const file = 'src/app/[prefecture]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const match = content.match(/const displayedPosts = posts\.filter\(post => \{([\s\S]*?)\}\);/);
if (match) {
    console.log(match[0]);
} else {
    // try finding by usage of activeTab
    const tabMatch = content.match(/activeTab === 'official'[\s\S]*?return/);
    console.log("Tab logic:", tabMatch ? tabMatch[0] : "Not found");
}
