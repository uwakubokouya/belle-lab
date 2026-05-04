const fs = require('fs');
const file = 'src/providers/UserProvider.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetFetchProfile = `        // キャストでアイコン未設定の場合はマスターデータからフォールバック
        if (!finalAvatarUrl && data.role === 'cast') {
          const { data: storeCast } = await supabase.from('casts').select('profile_image_url, avatar_url').eq('id', userId).maybeSingle();
          if (storeCast) {
            finalAvatarUrl = storeCast.profile_image_url || storeCast.avatar_url;
          }
          if (!finalAvatarUrl) {
            finalAvatarUrl = "/images/no-photo.jpg";
          }
        }`;

const replaceFetchProfile = `        // キャストでアイコン未設定の場合はマスターデータからフォールバック
        if (!finalAvatarUrl && data.role === 'cast') {
          // castsテーブルに画像URLカラムは存在しないため削除
          finalAvatarUrl = "/images/no-photo.jpg";
        }`;

if (content.includes(targetFetchProfile)) {
    content = content.replace(targetFetchProfile, replaceFetchProfile);
    fs.writeFileSync(file, content);
    console.log('Success removing bad column select in UserProvider');
} else {
    // maybe we already modified it with console logs
    const regex = /\/\/ キャストでアイコン未設定の場合はマスターデータからフォールバック[\s\S]*?finalAvatarUrl = "\/images\/no-photo\.jpg";\s*\}/;
    if (regex.test(content)) {
        content = content.replace(regex, replaceFetchProfile);
        fs.writeFileSync(file, content);
        console.log('Success removing bad column select in UserProvider (regex)');
    } else {
        console.log('Target not found');
    }
}
