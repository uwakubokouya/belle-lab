const fs = require('fs');
const file = 'src/app/[prefecture]/search/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `      console.log("Fetched casts raw:", activeCasts); // Debug log to see if any casts are returned
      if (activeCasts) {
        // SNSのプロフィール画像（sns_profilesテーブル）を取得して結合する
        const phones = activeCasts.map(c => c.login_id).filter(Boolean);
        let profilesData: any[] = [];
        
        if (phones.length > 0) {
            const { data: pData } = await supabase
              .from('sns_profiles')
              .select('id, phone, avatar_url')
              .in('phone', phones);
            if (pData) profilesData = pData;
        }

        let prefsData: any[] = [];
        if (profilesData.length > 0) {
            const profileIds = profilesData.map(p => p.id);`;

const replace1 = `      console.log("Fetched casts raw:", activeCasts); // Debug log to see if any casts are returned
      if (activeCasts) {
        let prefsData: any[] = [];
        if (profilesData.length > 0) {
            const profileIds = profilesData.map(p => p.id);`;

// Convert CRLF to LF for consistent replacing
content = content.replace(/\r\n/g, '\n');
const target1LF = target1.replace(/\r\n/g, '\n');
const replace1LF = replace1.replace(/\r\n/g, '\n');

if (content.includes(target1LF)) {
    content = content.replace(target1LF, replace1LF);
    fs.writeFileSync(file, content);
    console.log('Success');
} else {
    console.log('Target not found');
}
