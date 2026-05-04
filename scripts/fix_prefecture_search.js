const fs = require('fs');
const file = 'src/app/[prefecture]/search/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `    const fetchCasts = async () => {
      const { data: profilesDataResult } = await supabase
        .from('sns_profiles')
        .select('id, phone, avatar_url')
        .eq('prefecture', prefecture)
        .eq('sns_enabled', true);

      let profilesData = profilesDataResult || [];
      if (profilesData.length === 0) {
        setCasts([]);
        setIsLoading(false);
        return;
      }

      const phones = profilesData.map(p => p.phone).filter(Boolean);

      const { data: activeCasts } = await supabase
        .from('casts')
        .select('*')
        .in('login_id', phones)
        .eq('status', 'active');
      
      console.log("Fetched casts raw:", activeCasts); // Debug log to see if any casts are returned
      if (activeCasts) {
        let prefsData: any[] = [];
        if (profilesData.length > 0) {
            const profileIds = profilesData.map(p => p.id);`;

const replace1 = `    const fetchCasts = async () => {
      // 1. 指定された都道府県名に一致する店舗(admin)の store_id を取得
      const { data: storeProfiles } = await supabase
        .from('profiles')
        .select('store_id')
        .ilike('prefecture', \`\${prefecture}%\`)
        .eq('sns_enabled', true);

      if (!storeProfiles || storeProfiles.length === 0) {
        setCasts([]);
        setIsLoading(false);
        return;
      }
      const storeIds = storeProfiles.map(p => p.store_id).filter(Boolean);

      // 2. 該当店舗に所属するキャストを取得
      const { data: activeCasts } = await supabase
        .from('casts')
        .select('*')
        .in('store_id', storeIds)
        .eq('status', 'active');
      
      console.log("Fetched casts raw:", activeCasts); // Debug log to see if any casts are returned
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

content = content.replace(/\r\n/g, '\n');
const t1 = target1.replace(/\r\n/g, '\n');
const r1 = replace1.replace(/\r\n/g, '\n');

if (content.includes(t1)) {
    content = content.replace(t1, r1);
    fs.writeFileSync(file, content);
    console.log('Success search/page.tsx');
} else {
    console.log('Target not found in search/page.tsx');
}
