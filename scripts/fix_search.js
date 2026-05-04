const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/app/[prefecture]/search/page.tsx');
let content = fs.readFileSync(file, 'utf8');

const oldLines = [
"      const { data: activeCasts } = await supabase",
"        .from('casts')",
"        .select('*')",
"        .eq('store_id', 'ef92279f-3f19-47e7-b542-69de5906ab9b')",
"        .eq('status', 'active');"
];

const newLines = [
"      const { data: profilesDataResult } = await supabase",
"        .from('sns_profiles')",
"        .select('id, phone, avatar_url')",
"        .eq('prefecture', prefecture)",
"        .eq('sns_enabled', true);",
"",
"      let profilesData = profilesDataResult || [];",
"      if (profilesData.length === 0) {",
"        setCasts([]);",
"        setIsLoading(false);",
"        return;",
"      }",
"",
"      const phones = profilesData.map(p => p.phone).filter(Boolean);",
"",
"      const { data: activeCasts } = await supabase",
"        .from('casts')",
"        .select('*')",
"        .in('login_id', phones)",
"        .eq('status', 'active');"
];

const oldContentCRLF = oldLines.join('\r\n');
const newContentCRLF = newLines.join('\r\n');
const oldContentLF = oldLines.join('\n');
const newContentLF = newLines.join('\n');

if (content.includes(oldContentCRLF)) {
    content = content.replace(oldContentCRLF, newContentCRLF);
} else if (content.includes(oldContentLF)) {
    content = content.replace(oldContentLF, newContentLF);
} else {
    console.log("Target not found!");
}

fs.writeFileSync(file, content);
console.log('Done');
