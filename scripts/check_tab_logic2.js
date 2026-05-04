const fs = require('fs');
const file = 'src/app/[prefecture]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const match = content.match(/const displayedPosts = posts\.filter\(\(post.*?\) => \{([\s\S]*?)\}\);/);
if (match) {
    console.log(match[0]);
} else {
    // 別の変数名かもしれないので、filterで探す
    const filterMatches = content.match(/posts\.filter\([\s\S]*?\)/g);
    if (filterMatches) {
        console.log(filterMatches[0]);
    }
}
