const fs = require('fs');
const file = 'src/components/auth/AgeGuard.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `  const handleEnter = () => {
    localStorage.setItem('age_verified', 'true');
    setIsVerified(true);
  };`;

const replace1 = `  const handleEnter = () => {
    localStorage.setItem('age_verified', 'true');
    setIsVerified(true);
    // ユーザーの要望により、年齢認証後は必ずエリア選択画面(/)へ飛ばす
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  };`;

const target2 = `<h1 className="text-2xl tracking-[0.3em] font-normal uppercase">E-girls博多</h1>`;
const replace2 = `<h1 className="text-2xl tracking-[0.3em] font-normal uppercase">E-GIRLS</h1>
            <p className="text-[10px] tracking-widest mt-2 text-[#777777] uppercase">National Portal</p>`;

content = content.replace(/\r\n/g, '\n');
const t1 = target1.replace(/\r\n/g, '\n');
const r1 = replace1.replace(/\r\n/g, '\n');
const t2 = target2.replace(/\r\n/g, '\n');
const r2 = replace2.replace(/\r\n/g, '\n');

if (content.includes(t1) && content.includes(t2)) {
    content = content.replace(t1, r1).replace(t2, r2);
    fs.writeFileSync(file, content);
    console.log('Success updating AgeGuard');
} else {
    console.log('Target not found in AgeGuard');
}
