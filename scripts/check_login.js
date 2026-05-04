const fs = require('fs');
const file = 'src/app/login/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetMatch = content.match(/const handleLogin = async.*?{([\s\S]*?)};/);
if (targetMatch) {
    console.log(targetMatch[0]);
} else {
    console.log('Not found');
}
