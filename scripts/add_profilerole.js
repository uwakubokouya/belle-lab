const fs = require('fs');
const file = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('const [profileRole, setProfileRole]')) {
  content = content.replace(
    /const \[resolvedCastId, setResolvedCastId\] = useState<string>\(id\);/,
    "const [profileRole, setProfileRole] = useState<string | null>(null);\n  const [resolvedCastId, setResolvedCastId] = useState<string>(id);"
  );
  fs.writeFileSync(file, content);
  console.log('Added profileRole state.');
} else {
  console.log('profileRole already exists.');
}
