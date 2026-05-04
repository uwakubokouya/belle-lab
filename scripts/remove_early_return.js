const fs = require('fs');
const file = 'src/app/[prefecture]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `    // 2. 該当店舗に所属するキャストのログインIDを取得
    const { data: activeCasts } = await supabase
      .from('casts')
      .select('login_id')
      .in('store_id', storeIds)
      .eq('status', 'active');
      
    if (!activeCasts || activeCasts.length === 0) {
      setPosts([]);
      setIsLoading(false);
      return;
    }
    const loginIds = activeCasts.map(c => c.login_id).filter(Boolean);`;

const replace1 = `    // 2. 該当店舗に所属するキャストのログインIDを取得
    const { data: activeCasts } = await supabase
      .from('casts')
      .select('login_id')
      .in('store_id', storeIds)
      .eq('status', 'active');
      
    const loginIds = activeCasts ? activeCasts.map(c => c.login_id).filter(Boolean) : [];`;

content = content.replace(/\r\n/g, '\n');
const t1 = target1.replace(/\r\n/g, '\n');
const r1 = replace1.replace(/\r\n/g, '\n');

if (content.includes(t1)) {
    content = content.replace(t1, r1);
    fs.writeFileSync(file, content);
    console.log('Success removing early return for empty casts');
} else {
    console.log('Target not found for early return removal');
}
