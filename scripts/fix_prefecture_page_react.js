const fs = require('fs');
const file = 'src/app/[prefecture]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /const prefecture = params\.prefecture \? decodeURIComponent\(params\.prefecture as string\) : "";\s*\/\/[^\n]*\n\s*React\.useEffect\(\(\) => \{\s*if \(prefecture === '全国'\) \{\s*router\.replace\('\/'\);\s*\}\s*\}, \[prefecture, router\]\);/;

const replacement = `const prefecture = params.prefecture ? decodeURIComponent(params.prefecture as string) : "";
  const router = useRouter();

  // 「全国」エリアを廃止し、アクセスされた場合はトップ（エリア選択）へリダイレクト
  useEffect(() => {
    if (prefecture === '全国') {
      router.replace('/');
    }
  }, [prefecture, router]);`;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
console.log('Fixed React.useEffect in [prefecture]/page.tsx');
