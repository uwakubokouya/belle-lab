const fs = require('fs');
let content = fs.readFileSync('src/app/[prefecture]/page.tsx', 'utf-8');

const targetStr = `    const storeIds = storeProfiles.map(p => p.store_id).filter(Boolean);
    const storeAccountIds = storeProfiles.map(p => p.id).filter(Boolean);

    // 2. 該当店舗に所属するキャストのログインIDを取得
    const { data: activeCasts } = await supabase
      .from('casts')
      .select('login_id')
      .in('store_id', storeIds)
      .eq('status', 'active');
      
    const loginIds = activeCasts ? activeCasts.map(c => c.login_id).filter(Boolean) : [];`;

const replaceStr = `    const storeIds = storeProfiles.map(p => p.store_id).filter(Boolean);
    const storeUsernames = storeProfiles.map(p => p.username).filter(Boolean);

    // Get the actual SNS auth user IDs for these stores by matching their username to sns_profiles.phone
    const { data: snsStoreProfiles } = await supabase
      .from('sns_profiles')
      .select('id')
      .in('phone', storeUsernames);
    
    const storeAccountIds = snsStoreProfiles ? snsStoreProfiles.map(p => p.id) : [];

    // 2. 該当店舗に所属するキャストのログインIDを取得
    const { data: activeCasts } = await supabase
      .from('casts')
      .select('login_id')
      .in('store_id', storeIds)
      .eq('status', 'active');
      
    const loginIds = activeCasts ? activeCasts.map(c => c.login_id).filter(Boolean) : [];`;

const normalize = (str) => str.replace(/\r\n/g, '\n');

if (normalize(content).includes(normalize(targetStr))) {
    content = normalize(content).replace(normalize(targetStr), replaceStr);
    
    // Select も変更する必要がある
    const targetSelect = `      .select('id, store_id')`;
    const replaceSelect = `      .select('id, store_id, username')`;
    content = normalize(content).replace(normalize(targetSelect), replaceSelect);
    
    fs.writeFileSync('src/app/[prefecture]/page.tsx', content);
    console.log("Success");
} else {
    console.log("Target string not found.");
}
