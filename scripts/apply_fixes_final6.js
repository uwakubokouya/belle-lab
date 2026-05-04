const fs = require('fs');
let lines = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8').split(/\r?\n/);

for (let i = 0; i < lines.length; i++) {
    // 1. ProfileData
    if (lines[i].includes('    _coverFile?: File;')) {
        if (lines[i+1] && lines[i+1].includes('  }') && !lines[i+2].includes('storeName?: string;')) {
            lines.splice(i+1, 0, '    storeName?: string;', '    storeId?: string;', '    storeProfileId?: string;', '    isAdmin?: boolean;');
            console.log("Fixed ProfileData");
            break;
        }
    }
}

for (let i = 0; i < lines.length; i++) {
    // 2. select('id, name, avatar_url, accepts_dms, phone') -> 追加
    if (lines[i].includes("select('id, name, avatar_url, accepts_dms, phone')")) {
        lines[i] = lines[i].replace("select('id, name, avatar_url, accepts_dms, phone')", "select('id, name, avatar_url, cover_url, accepts_dms, phone, is_admin')");
        console.log("Fixed select is_admin");
    }
}

for (let i = 0; i < lines.length; i++) {
    // 3. fetchStoreData
    if (lines[i].includes('let castImg = profile?.avatar_url || storeCast?.profile_image_url || storeCast?.avatar_url || "/images/no-photo.jpg";')) {
        if (!lines[i-1].includes('fetchedStoreProfileId')) {
            lines.splice(i, 0,
                '      let fetchedStoreName = "";',
                '      let fetchedStoreId = storeCast?.store_id || null;',
                '      let fetchedStoreProfileId = "";',
                '      ',
                '      if (fetchedStoreId) {',
                '          const { data: storeData } = await supabase.from("profiles").select("full_name, username").eq("store_id", fetchedStoreId).eq("role", "admin").maybeSingle();',
                '          if (storeData) {',
                '              fetchedStoreName = storeData.full_name || storeData.username || "";',
                '              const { data: snsStore } = await supabase.from("sns_profiles").select("id").eq("phone", storeData.username).maybeSingle();',
                '              if (snsStore) {',
                '                  fetchedStoreProfileId = snsStore.id;',
                '              } else {',
                '                  fetchedStoreProfileId = fetchedStoreId;',
                '              }',
                '          }',
                '      }',
                '      let castCover = profile?.cover_url || "";'
            );
            console.log("Fixed fetchStoreData");
            break;
        }
    }
}

for (let i = 0; i < lines.length; i++) {
    // 4. setProfileData
    if (lines[i].includes('        image: castImg,') && lines[i+1] && lines[i+1].includes('        bio: castBio')) {
        if (!lines[i+2].includes('storeName')) {
            lines.splice(i+1, 0,
                '        cover: castCover,',
                '        storeName: fetchedStoreName,',
                '        storeId: fetchedStoreId,',
                '        storeProfileId: fetchedStoreProfileId,',
                '        isAdmin: profile?.is_admin || false,'
            );
            console.log("Fixed setProfileData");
            break;
        }
    }
}

for (let i = 0; i < lines.length; i++) {
    // 6. カバー画像の表示
    if (lines[i].includes('<img src={cast.cover} alt="Cover" className="w-full h-full object-cover opacity-50 mix-blend-overlay" />')) {
        lines[i] = lines[i].replace('<img src={cast.cover} alt="Cover" className="w-full h-full object-cover opacity-50 mix-blend-overlay" />', '<img src={cast.cover} alt="Cover" className="absolute inset-0 w-full h-full object-cover z-0" />');
        console.log("Fixed cover image");
        break;
    }
}

for (let i = 0; i < lines.length; i++) {
    // 7. 店舗バッジ
    if (lines[i].includes('{cast.name || "名称未設定"}')) {
        if (lines[i+1].includes('</h1>') && !lines[i+2].includes('profileData.storeName')) {
            lines.splice(i+2, 0,
                '            {profileData.storeName && (profileData.storeProfileId || profileData.storeId) && !profileData.isAdmin && (',
                '                <Link href={`/cast/${profileData.storeProfileId || profileData.storeId}`} className="inline-block mb-4">',
                '                  <span className="text-[10px] text-[#777777] bg-[#F9F9F9] border border-[#E5E5E5] px-2 py-0.5 tracking-widest hover:bg-[#E5E5E5] transition-colors">',
                '                    {profileData.storeName}',
                '                  </span>',
                '                </Link>',
                '            )}'
            );
            console.log("Fixed badge");
            break;
        }
    }
}

// 別ループで囲み処理を行う (後ろから処理して行番号のズレを防ぐ)
function wrapBlockReverse(keyword, startOffset, endFinder, wrapperStart, wrapperEnd, name) {
    for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].includes(keyword)) {
            if (!lines[i+startOffset-1] || !lines[i+startOffset-1].includes(wrapperStart.trim())) {
                let endIndex = -1;
                let count = endFinder.initialCount || 0;
                for (let j = i + startOffset + 1; j < lines.length; j++) {
                    if (endFinder.inc && lines[j].includes(endFinder.inc)) count++;
                    if (endFinder.dec && lines[j].includes(endFinder.dec)) count--;
                    if (endFinder.match && lines[j].includes(endFinder.match)) count--;
                    if (count === 0) {
                        endIndex = j;
                        break;
                    }
                }
                if (endIndex !== -1) {
                    lines.splice(endIndex + 1, 0, wrapperEnd);
                    lines.splice(i+startOffset, 0, wrapperStart);
                    console.log("Fixed " + name);
                } else {
                    console.log("Failed to find end for " + name);
                }
            }
        }
    }
}

// 8. CAST DATA ボタン
wrapBlockReverse(
    'onClick={() => setShowPreferencesModal(true)}', 
    0, 
    { initialCount: 1, dec: '</button>' }, 
    '                    {!profileData.isAdmin && (', 
    '                    )}', 
    'CAST DATA'
);

// 9. ステータス
wrapBlockReverse(
    'ステータス:', 
    -1, 
    { initialCount: 1, inc: '<div', dec: '</div' }, 
    '            {!profileData.isAdmin && (', 
    '            )}', 
    'status'
);

// 10. 出勤情報タブ
wrapBlockReverse(
    "onClick={() => setActiveTab('shifts')}", 
    -1, 
    { initialCount: 1, dec: '</button>' }, 
    '          {!profileData.isAdmin && (', 
    '          )}', 
    'shifts tab'
);

// 11. 予約ボタン
wrapBlockReverse(
    'className="fixed bottom-[72px] left-0 right-0 max-w-md mx-auto p-4 z-40 bg-white border-t border-[#E5E5E5]"', 
    0, 
    { initialCount: 1, inc: '<div', dec: '</div' }, 
    '      {!profileData.isAdmin && (', 
    '      )}', 
    'reserve btn'
);

fs.writeFileSync('src/app/cast/[id]/page.tsx', lines.join('\n'));
