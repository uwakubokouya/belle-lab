const fs = require('fs');

let content = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8');

const fetchDataTarget = `      let castCover = profile?.cover_url || storeCast?.cover_url || "";
      setProfileData(prev => ({
        ...prev,
        name: castName,
        image: castImg,
        cover: castCover,
        bio: castBio
      }));`;

const fetchDataReplacement = `      let castCover = profile?.cover_url || storeCast?.cover_url || "";

      let fetchedStoreName = "";
      let fetchedStoreId = storeCast?.store_id || null;
      if (fetchedStoreId) {
          const { data: storeData } = await supabase.from('profiles').select('full_name, username').eq('store_id', fetchedStoreId).maybeSingle();
          if (storeData) {
              fetchedStoreName = storeData.full_name || storeData.username || "";
          }
      }

      setProfileData(prev => ({
        ...prev,
        name: castName,
        image: castImg,
        cover: castCover,
        bio: castBio,
        storeName: fetchedStoreName,
        storeId: fetchedStoreId
      }));`;

function replaceWithCRLFHandling(content, target, replacement) {
    const regex = new RegExp(target.replace(/[.*+?^$\{\}\(\)\|\[\]\\]/g, '\\$&').replace(/\r?\n/g, '\\r?\\n'), 'g');
    return content.replace(regex, replacement);
}

content = replaceWithCRLFHandling(content, fetchDataTarget, fetchDataReplacement);

fs.writeFileSync('src/app/cast/[id]/page.tsx', content);

console.log("Done2");
