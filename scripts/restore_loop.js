const fs = require('fs');
const file = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const badCode = `            setStoreInfo({ id: linkId, name: storeProfile.full_name || storeProfile.username || "" });
        
        const { data } = await supabase.rpc('get_public_availability', {
            p_store_id: storeId,
            p_date: dateStr`;

const goodCode = `            setStoreInfo({ id: linkId, name: storeProfile.full_name || storeProfile.username || "" });
        }

        const next14DaysPromises = Array.from({length: 14}, async (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const dateStr = d.toLocaleDateString('sv-SE').split('T')[0];

            const { data } = await supabase.rpc('get_public_availability', {
                p_store_id: storeId,
                p_date: dateStr`;

content = content.replace(badCode, goodCode);
fs.writeFileSync(file, content);
console.log('Restored loop start and fixed brace');
