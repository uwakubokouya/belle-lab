const fs = require('fs');

let lines = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8').split(/\r?\n/);

// 2. select is_admin
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("select('id, name, avatar_url, cover_url, accepts_dms, phone')")) {
        lines[i] = lines[i].replace("select('id, name, avatar_url, cover_url, accepts_dms, phone')", "select('id, name, avatar_url, cover_url, accepts_dms, phone, is_admin')");
        console.log("select updated");
    }
}

// 3. fetchStoreData
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('let fetchedStoreId = storeCast?.store_id || null;')) {
        if (!lines[i+1].includes('fetchedStoreProfileId')) {
            lines.splice(i+1, 0, '      let fetchedStoreProfileId = "";');
            for(let j=i+1; j<i+20; j++) {
                if (lines[j] && lines[j].includes("const { data: storeData } = await supabase.from('profiles').select('full_name, username').eq('store_id', fetchedStoreId).eq('role', 'admin').maybeSingle();")) {
                    lines.splice(j+3, 0, "              const { data: snsStore } = await supabase.from('sns_profiles').select('id').eq('phone', storeData.username).maybeSingle();");
                    lines.splice(j+4, 0, "              if (snsStore) {");
                    lines.splice(j+5, 0, "                  fetchedStoreProfileId = snsStore.id;");
                    lines.splice(j+6, 0, "              } else {");
                    lines.splice(j+7, 0, "                  fetchedStoreProfileId = fetchedStoreId;");
                    lines.splice(j+8, 0, "              }");
                    console.log("fetchStoreData updated");
                    break;
                }
            }
        }
    }
}

// 4. setProfileData
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('storeId: fetchedStoreId')) {
        if (!lines[i+1].includes('storeProfileId')) {
            lines[i] = '        storeId: fetchedStoreId,';
            lines.splice(i+1, 0, '        storeProfileId: fetchedStoreProfileId,', '        isAdmin: profile?.is_admin || false');
            console.log("setProfileData updated");
            break;
        }
    }
}

fs.writeFileSync('src/app/cast/[id]/page.tsx', lines.join('\n'));
