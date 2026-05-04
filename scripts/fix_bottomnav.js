const fs = require('fs');
const file = 'src/components/layout/BottomNav.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `  const params = useParams();
  const prefecture = params?.prefecture as string | undefined;
  
  const homePath = prefecture ? \`/\${prefecture}\` : '/';
  const searchPath = prefecture ? \`/\${prefecture}/search\` : '/search';`;

const replace1 = `  const params = useParams();
  const prefecture = params?.prefecture as string | undefined;
  
  const [savedPref, setSavedPref] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (prefecture) {
      localStorage.setItem('last_prefecture', prefecture);
      setSavedPref(prefecture);
    } else {
      const saved = localStorage.getItem('last_prefecture');
      if (saved) {
        setSavedPref(saved);
      }
    }
  }, [prefecture]);

  const currentPref = prefecture || savedPref;
  
  const homePath = currentPref ? \`/\${currentPref}\` : '/';
  const searchPath = currentPref ? \`/\${currentPref}/search\` : '/search';`;

content = content.replace(/\r\n/g, '\n');
const t1 = target1.replace(/\r\n/g, '\n');
const r1 = replace1.replace(/\r\n/g, '\n');

if (content.includes(t1)) {
    // Need to add React import if it's not there
    if (!content.includes("import React")) {
        content = content.replace(`import Link from 'next/link';`, `import React from 'react';\nimport Link from 'next/link';`);
    }
    content = content.replace(t1, r1);
    fs.writeFileSync(file, content);
    console.log('Success fixing BottomNav state persistence');
} else {
    console.log('Target not found in BottomNav.tsx');
}
