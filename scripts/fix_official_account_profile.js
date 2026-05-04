const fs = require('fs');
const file = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `if (!storeCast && !profile) {
            const { data: castFromDb } = await supabase.from('casts').select('*').eq('id', id).maybeSingle();
            storeCast = castFromDb;
            
            // 店舗（公式アカウント）の場合のフォールバック
            if (!storeCast) {
                const { data: storeData } = await supabase.from('profiles').select('full_name, role, avatar_url').eq('id', id).maybeSingle();
                if (storeData) {
                    castName = storeData.full_name || "公式アカウント";
                    castImg = storeData.avatar_url || "/images/no-photo.jpg";
                    setProfileRole(storeData.role);
                }
            }
        }`;

content = content.replace(
  /if \(!storeCast && !profile\) \{\s*const \{ data: castFromDb \} = await supabase\.from\('casts'\)\.select\('\*'\)\.eq\('id', id\)\.maybeSingle\(\);\s*storeCast = castFromDb;\s*\}/,
  replacement
);

fs.writeFileSync(file, content);
console.log('Added fallback for store profiles');
