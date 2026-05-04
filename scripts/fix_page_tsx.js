const fs = require('fs');
const file = 'src/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /React\.useEffect\(\(\) => \{\s*\}\, \[user\, isLoading\, router\]\);\s*/,
  ''
);

const autoResumeLogic = `  const [lastArea, setLastArea] = React.useState<string | null>(null);
  React.useEffect(() => {
    const saved = localStorage.getItem('last_prefecture');
    if (saved === '全国') {
      localStorage.removeItem('last_prefecture');
    } else if (saved) {
      setLastArea(saved);
    }
  }, []);`;

content = content.replace(
  /  const \[lastArea, setLastArea\] = React\.useState<string \| null>\(null\);\s*React\.useEffect\(\(\) => \{\s*const saved = localStorage\.getItem\('last_prefecture'\);\s*if \(saved\) \{\s*setLastArea\(saved\);\s*\}\s*\}, \[\]\);/,
  autoResumeLogic
);

fs.writeFileSync(file, content);
console.log('Fixed page.tsx completely');
