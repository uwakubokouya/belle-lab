const fs = require('fs');
const file = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// replace isPlatformAdmin with profileRole
content = content.replace('const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);', 'const [profileRole, setProfileRole] = useState<string | null>(null);');

// update state setting logic
content = content.replace(
  /if \(profile && profile\.role === 'system'\) \{ setIsPlatformAdmin\(true\); \} else \{ setIsPlatformAdmin\(false\); \}/g,
  'if (profile && profile.role) { setProfileRole(profile.role); }'
);

// update DM modal text logic
content = content.replace(
  /\{isPlatformAdmin \? "運営へのご意見・ご要望はメニュータブの「ご意見」からお送りください。" : "このキャストは現在DM機能が有効ではありません。"\}/g,
  '{profileRole === "system" ? "運営へのご意見・ご要望はメニュータブの「ご意見」からお送りください。" : "このキャストは現在DM機能が有効ではありません。"}'
);

// update CAST DATA buttons condition
content = content.replace(/\{!isPlatformAdmin && \(/g, '{!(profileRole === "system" || profileRole === "store") && (');

// update Reserve button condition
content = content.replace(/\) : !isPlatformAdmin \? \(/g, ') : !(profileRole === "system" || profileRole === "store") ? (');

fs.writeFileSync(file, content);
console.log('Fixed profileRole logic');
