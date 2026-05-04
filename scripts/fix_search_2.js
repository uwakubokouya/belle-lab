const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/app/[prefecture]/search/page.tsx');
let content = fs.readFileSync(file, 'utf8');

const oldLines = [
"      console.log("Fetched casts raw:", activeCasts); // Debug log to see if any casts are returned",
"      if (activeCasts) {",
"        // SNSのプロフィール画像（sns_profilesテーブル）を取得して結合する",
"        const phones = activeCasts.map(c => c.login_id).filter(Boolean);",
"        let profilesData: any[] = [];",
"        ",
"        if (phones.length > 0) {",
"            const { data: pData } = await supabase",
"              .from('sns_profiles')",
"              .select('id, phone, avatar_url')",
"              .in('phone', phones);",
"            if (pData) profilesData = pData;",
"        }",
"",
"        let prefsData: any[] = [];"
];

const newLines = [
"      console.log("Fetched casts raw:", activeCasts); // Debug log to see if any casts are returned",
"      if (activeCasts) {",
"        let prefsData: any[] = [];"
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
