const fs = require('fs');
const file = 'src/components/auth/AgeGuard.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `  const handleEnter = () => {
    localStorage.setItem('age_verified', 'true');
    setIsVerified(true);
    // ユーザーの要望により、年齢認証後は必ずエリア選択画面(/)へ飛ばす
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  };`;

const replace = `  const handleEnter = () => {
    localStorage.setItem('age_verified', 'true');
    setIsVerified(true);
  };`;

content = content.replace(/\r\n/g, '\n');
const t = target.replace(/\r\n/g, '\n');
const r = replace.replace(/\r\n/g, '\n');

if (content.includes(t)) {
    content = content.replace(t, r);
    fs.writeFileSync(file, content);
    console.log('Success reverting AgeGuard redirect');
} else {
    console.log('Target not found in AgeGuard');
}
