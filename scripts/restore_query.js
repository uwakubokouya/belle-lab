const fs = require('fs');
const file = 'src/app/[prefecture]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `    // 3. SNSプロフィールからキャストIDを取得
    const { data: profilesData } = await supabase
      .from('sns_profiles')
      .select('id')
      .in('phone', loginIds);`;

const replace1 = `    // 3. SNSプロフィールからキャストIDを取得 + 公式アカウントも取得
    let query = supabase.from('sns_profiles').select('id');
    if (loginIds.length > 0) {
        query = query.or(\`phone.in.(\${loginIds.join(',')}),is_admin.eq.true\`);
    } else {
        query = query.eq('is_admin', true);
    }
    
    const { data: profilesData } = await query;`;

content = content.replace(/\r\n/g, '\n');
const t1 = target1.replace(/\r\n/g, '\n');
const r1 = replace1.replace(/\r\n/g, '\n');

if (content.includes(t1)) {
    content = content.replace(t1, r1);
    fs.writeFileSync(file, content);
    console.log('Success restoring official accounts query');
} else {
    console.log('Target not found in [prefecture]/page.tsx');
}
