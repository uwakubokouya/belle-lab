const fs = require('fs');
const file = 'src/app/[prefecture]/search/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add storeIds state
content = content.replace(
  'const [workingCastIdsForDate, setWorkingCastIdsForDate] = useState<string[]>([]);',
  'const [workingCastIdsForDate, setWorkingCastIdsForDate] = useState<string[]>([]);\n  const [storeIds, setStoreIds] = useState<string[]>([]);'
);

// 2. Fix prefecture filtering and storeIds assignment
const targetPrefecture = `      // 1. 指定された都道府県名に一致する店舗(admin)の store_id を取得
      const { data: storeProfiles } = await supabase
        .from('profiles')
        .select('store_id')
        .ilike('prefecture', \`\${prefecture}%\`)
        .eq('sns_enabled', true);`;

const replacementPrefecture = `      // 1. 指定された都道府県名に一致する店舗(admin)の store_id を取得
      let query = supabase.from('profiles').select('store_id').eq('sns_enabled', true);
      if (prefecture !== '全国') {
        query = query.ilike('prefecture', \`\${prefecture}%\`);
      }
      const { data: storeProfiles } = await query;`;

content = content.replace(targetPrefecture, replacementPrefecture);

content = content.replace(
  'const storeIds = storeProfiles.map(p => p.store_id).filter(Boolean);',
  'const fetchedStoreIds = storeProfiles.map(p => p.store_id).filter(Boolean);\n      setStoreIds(fetchedStoreIds);\n      const storeIds = fetchedStoreIds;'
);

// 3. Fix get_public_availability for today
const targetAvailability = `        const { data: availabilityData } = await supabase
           .rpc('get_public_availability', {
               p_store_id: 'ef92279f-3f19-47e7-b542-69de5906ab9b',
               p_date: todayStr
           });`;

const replacementAvailability = `        let availabilityData: any[] = [];
        await Promise.all(fetchedStoreIds.map(async (sid) => {
            const { data } = await supabase.rpc('get_public_availability', { p_store_id: sid, p_date: todayStr });
            if (data) availabilityData = availabilityData.concat(data);
        }));`;

content = content.replace(targetAvailability, replacementAvailability);

// 4. Fix next7DaysPromises
const targetNext7Days = `        const next7DaysPromises = Array.from({length: 14}, async (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i + 1); // 明日からの14日間
            const dateStr = d.toLocaleDateString('sv-SE').split('T')[0];
            const { data } = await supabase.rpc('get_public_availability', {
               p_store_id: 'ef92279f-3f19-47e7-b542-69de5906ab9b',
               p_date: dateStr
            });
            return { dateStr, data };
        });`;

const replacementNext7Days = `        const next7DaysPromises = Array.from({length: 14}, async (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i + 1); // 明日からの14日間
            const dateStr = d.toLocaleDateString('sv-SE').split('T')[0];
            let dayAvails: any[] = [];
            await Promise.all(fetchedStoreIds.map(async (sid) => {
                const { data } = await supabase.rpc('get_public_availability', { p_store_id: sid, p_date: dateStr });
                if (data) dayAvails = dayAvails.concat(data);
            }));
            return { dateStr, data: dayAvails };
        });`;

content = content.replace(targetNext7Days, replacementNext7Days);

// 5. Fix custom date selection availability
const targetCustomDate = `         const fetchShiftsForDate = async () => {
             const { data: availabilityData } = await supabase
               .rpc('get_public_availability', {
                   p_store_id: 'ef92279f-3f19-47e7-b542-69de5906ab9b',
                   p_date: selectedDate
               });
             if (availabilityData) {`;

const replacementCustomDate = `         const fetchShiftsForDate = async () => {
             if (storeIds.length === 0) return;
             let availabilityData: any[] = [];
             await Promise.all(storeIds.map(async (sid) => {
                 const { data } = await supabase.rpc('get_public_availability', { p_store_id: sid, p_date: selectedDate });
                 if (data) availabilityData = availabilityData.concat(data);
             }));
             if (availabilityData && availabilityData.length > 0) {`;

content = content.replace(targetCustomDate, replacementCustomDate);

fs.writeFileSync(file, content);
console.log('Fixed search page logic');
