const fs = require('fs');
const file = 'src/components/layout/BottomNav.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `import { usePathname, useParams } from 'next/navigation';

export default function BottomNav() {
  const { user, hasUnreadNotifications, hasUnreadMessages, hasUnreadFeedbacks } = useUser();
  const role = user?.role;
  const pathname = usePathname();
  const params = useParams();
  const prefecture = params?.prefecture as string | undefined;
  
  const homePath = prefecture ? \`/\${prefecture}\` : '/';
  const searchPath = prefecture ? \`/\${prefecture}/search\` : '/search';`;

const replace1 = `import { usePathname, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function BottomNav() {
  const { user, hasUnreadNotifications, hasUnreadMessages, hasUnreadFeedbacks } = useUser();
  const role = user?.role;
  const pathname = usePathname();
  const params = useParams();
  const prefecture = params?.prefecture as string | undefined;
  
  const [savedPrefecture, setSavedPrefecture] = useState<string | null>(null);

  useEffect(() => {
    if (prefecture) {
      localStorage.setItem('last_prefecture', prefecture);
      setSavedPrefecture(prefecture);
    } else {
      const saved = localStorage.getItem('last_prefecture');
      if (saved) setSavedPrefecture(saved);
    }
  }, [prefecture]);

  const currentPrefecture = prefecture || savedPrefecture;
  
  const homePath = currentPrefecture ? \`/\${currentPrefecture}\` : '/';
  const searchPath = currentPrefecture ? \`/\${currentPrefecture}/search\` : '/search';`;

content = content.replace(/\r\n/g, '\n');
const t1 = target1.replace(/\r\n/g, '\n');
const r1 = replace1.replace(/\r\n/g, '\n');

if (content.includes(t1)) {
    content = content.replace(t1, r1);
    fs.writeFileSync(file, content);
    console.log('Success in BottomNav.tsx');
} else {
    console.log('Target not found in BottomNav.tsx');
}
