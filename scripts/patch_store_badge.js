const fs = require('fs');
let lines = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8').split(/\r?\n/);

// 1. Add to ProfileData
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('isAdmin?: boolean;')) {
        if (!lines[i+1].includes('storeName?: string;')) {
            lines.splice(i+1, 0, "    storeName?: string;", "    storeProfileId?: string;");
        }
        break;
    }
}

// 2. Fetch store details inside fetchFollowData
// We will find `let castBio = /* profile?.bio || */ "";`
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('let castBio = /* profile?.bio || */ "";')) {
        const fetchCode = `
      // Fetch Store Info for Badge
      let sName = "";
      let sProfileId = "";
      if (storeCast && storeCast.store_id) {
          const { data: sProfile } = await supabase.from('store_profiles').select('username, full_name').eq('store_id', storeCast.store_id).maybeSingle();
          if (sProfile) {
              sName = sProfile.full_name || sProfile.username || "公式";
              const { data: sSnsProfile } = await supabase.from('sns_profiles').select('id, name').eq('phone', sProfile.username).maybeSingle();
              if (sSnsProfile) {
                  sProfileId = sSnsProfile.id;
              } else {
                  // Fallback to store profile ID if sns_profile doesn't exist? Actually store_profiles id is not sns_profiles id.
              }
          }
      }
`;
        if (!lines[i+1].includes('let sName = "";')) {
            lines.splice(i+1, 0, ...fetchCode.split('\n'));
        }
        break;
    }
}

// 3. Add to setProfileData
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('isAdmin: profile?.is_admin')) {
        if (!lines[i+1].includes('storeName: sName,')) {
            lines[i] = lines[i] + ',';
            lines.splice(i+1, 0, "        storeName: sName,", "        storeProfileId: sProfileId");
        }
        break;
    }
}

// 4. Render in the UI
// Look for `{cast.name || "名称未設定"}`
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('{cast.name || "名称未設定"}')) {
        // It's inside an <h1>. We should put it right after the </h1>.
        // Wait, the h1 is: <h1 className="..."> \n {cast.name} \n </h1>
        if (lines[i+1].includes('</h1>')) {
            const badgeCode = `
            {profileData.storeName && profileData.storeProfileId && (
                <Link href={\`/cast/\${profileData.storeProfileId}\`} className="inline-block mt-1 mb-2">
                  <span className="text-[10px] text-[#777777] bg-[#F9F9F9] border border-[#E5E5E5] px-2 py-0.5 tracking-widest hover:bg-[#E5E5E5] transition-colors">
                    {profileData.storeName}
                  </span>
                </Link>
            )}`;
            if (!lines[i+2].includes('profileData.storeName')) {
                lines.splice(i+2, 0, ...badgeCode.split('\n'));
            }
            break;
        }
    }
}

fs.writeFileSync('src/app/cast/[id]/page.tsx', lines.join('\n'), 'utf8');
console.log('Done patch store badge');
