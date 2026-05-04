const fs = require('fs');
const file = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /const \{ data: storeProfile \} = await supabase\.from\('profiles'\)\.select\('full_name'\)\.eq\('id', storeId\)\.maybeSingle\(\);\s*if \(storeProfile\) \{\s*setStoreInfo\(\{ id: storeId, name: storeProfile\.full_name \|\| "公式" \}\);\s*\}/;

const replacement = `const { data: storeProfile } = await supabase.from('profiles').select('full_name, username').eq('id', storeId).maybeSingle();
            if (storeProfile) {
                let linkId = storeId;
                if (storeProfile.username) {
                    const { data: snsStoreProfile } = await supabase.from('sns_profiles').select('id').eq('phone', storeProfile.username).maybeSingle();
                    if (snsStoreProfile) {
                        linkId = snsStoreProfile.id;
                    }
                }
                setStoreInfo({ id: linkId, name: storeProfile.full_name || "公式" });
            }`;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
console.log('Fixed badge link ID');
