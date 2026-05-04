const fs = require('fs');
const file = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /let castName = profile\?\.name \|\| "";\s*let castBio = \/\* profile\?\.bio \|\| \*\/ ""; \/\/ bio doesn't exist in schema\s*if \(!storeCast && !profile\) \{\s*const \{ data: castFromDb \} = await supabase\.from\('casts'\)\.select\('\*'\)\.eq\('id', id\)\.maybeSingle\(\);\s*storeCast = castFromDb;\s*\/\/ 店舗（公式アカウント）の場合のフォールバック\s*if \(!storeCast\) \{\s*const \{ data: storeData \} = await supabase\.from\('profiles'\)\.select\('full_name, role, avatar_url'\)\.eq\('id', id\)\.maybeSingle\(\);\s*if \(storeData\) \{\s*castName = storeData\.full_name \|\| "公式アカウント";\s*castImg = storeData\.avatar_url \|\| "\/images\/no-photo\.jpg";\s*setProfileRole\(storeData\.role\);\s*\}\s*\}\s*\}\s*\/\/ 画像は「四角いSNSアイコン」側を最優先し、無ければ店舗の公式写真（casts）、それでも無ければデフォルト\s*let castImg = profile\?\.avatar_url \|\| storeCast\?\.profile_image_url \|\| storeCast\?\.avatar_url \|\| "\/images\/no-photo\.jpg";/;

const replacement = `let castName = profile?.name || "";
let castBio = /* profile?.bio || */ ""; // bio doesn't exist in schema
let castImg = ""; // 初期化を追加

if (!storeCast && !profile) {
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
}

// 画像は「四角いSNSアイコン」側を最優先し、無ければ店舗の公式写真（casts）、それでも無ければデフォルト
if (!castImg) {
    castImg = profile?.avatar_url || storeCast?.profile_image_url || storeCast?.avatar_url || "/images/no-photo.jpg";
}`;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
console.log('Fixed castImg reference error');
