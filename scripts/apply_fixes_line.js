const fs = require('fs');

const lines = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8').split('\n');

for(let i = 0; i < lines.length; i++) {
    // 1. ProfileData の修正
    if (lines[i].includes('    _coverFile?: File;')) {
        if (lines[i+1].includes('  }') && !lines[i+2].includes('storeName?: string;')) {
            lines[i+1] = '    storeName?: string;';
            lines.splice(i+2, 0, '    storeId?: string;', '    storeProfileId?: string;', '    isAdmin?: boolean;', '  }');
            console.log("Fixed ProfileData");
        }
    }
    
    // 2. select('... is_admin') 追加
    if (lines[i].includes("select('id, name, avatar_url, cover_url, accepts_dms, phone')")) {
        lines[i] = lines[i].replace("select('id, name, avatar_url, cover_url, accepts_dms, phone')", "select('id, name, avatar_url, cover_url, accepts_dms, phone, is_admin')");
        console.log("Fixed select is_admin");
    }

    // 3. fetchStoreData (約285行目付近)
    if (lines[i].includes('let fetchedStoreId = storeCast?.store_id || null;')) {
        if (!lines[i+1].includes('fetchedStoreProfileId')) {
            lines.splice(i+1, 0, '      let fetchedStoreProfileId = "";');
            
            // 下の const { data: storeData } を探す
            for(let j=i+1; j<i+20; j++) {
                if (lines[j] && lines[j].includes("const { data: storeData } = await supabase.from('profiles').select('full_name, username').eq('store_id', fetchedStoreId).eq('role', 'admin').maybeSingle();")) {
                    lines.splice(j+3, 0, "              const { data: snsStore } = await supabase.from('sns_profiles').select('id').eq('phone', storeData.username).maybeSingle();");
                    lines.splice(j+4, 0, "              if (snsStore) {");
                    lines.splice(j+5, 0, "                  fetchedStoreProfileId = snsStore.id;");
                    lines.splice(j+6, 0, "              } else {");
                    lines.splice(j+7, 0, "                  fetchedStoreProfileId = fetchedStoreId;");
                    lines.splice(j+8, 0, "              }");
                    console.log("Fixed fetchStoreData");
                    break;
                }
            }
        }
    }

    // 4. setProfileData
    if (lines[i].includes('storeId: fetchedStoreId')) {
        if (!lines[i+1].includes('storeProfileId')) {
            lines[i] = '        storeId: fetchedStoreId,';
            lines.splice(i+1, 0, '        storeProfileId: fetchedStoreProfileId,');
            lines.splice(i+2, 0, '        isAdmin: profile?.is_admin || false');
            console.log("Fixed setProfileData");
        }
    }

    // 5. カバー画像
    if (lines[i].includes('<img src={cast.cover} alt="Cover" className="w-full h-full object-cover opacity-50 mix-blend-overlay" />')) {
        lines[i] = lines[i].replace('<img src={cast.cover} alt="Cover" className="w-full h-full object-cover opacity-50 mix-blend-overlay" />', '<img src={cast.cover} alt="Cover" className="absolute inset-0 w-full h-full object-cover z-0" />');
        console.log("Fixed cover");
    }

    // 6. バッジ
    if (lines[i].includes('{profileData.storeName && profileData.storeId && (')) {
        lines[i] = lines[i].replace('{profileData.storeName && profileData.storeId && (', '{profileData.storeName && (profileData.storeProfileId || profileData.storeId) && (');
        
        for(let j=i+1; j<i+10; j++) {
            if (lines[j] && lines[j].includes('href={`/store/${profileData.storeId}`}')) {
                lines[j] = lines[j].replace('href={`/store/${profileData.storeId}`}', 'href={`/cast/${profileData.storeProfileId || profileData.storeId}`}');
            }
            if (lines[j] && lines[j].includes('className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F9F9F9] border border-[#E5E5E5] text-[10px] tracking-widest text-black hover:bg-black hover:text-white transition-colors mb-4"')) {
                lines[j] = lines[j].replace('className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F9F9F9] border border-[#E5E5E5] text-[10px] tracking-widest text-black hover:bg-black hover:text-white transition-colors mb-4"', 'className="inline-block mb-4"');
            }
            if (lines[j] && lines[j].includes('{profileData.storeName}')) {
                lines.splice(j, 0, '                  <span className="text-[10px] text-[#777777] bg-[#F9F9F9] border border-[#E5E5E5] px-2 py-0.5 tracking-widest hover:bg-[#E5E5E5] transition-colors">');
                lines.splice(j+2, 0, '                  </span>');
            }
            if (lines[j] && lines[j].includes('<ArrowRight')) {
                lines.splice(j, 1);
                console.log("Fixed badge");
                break;
            }
        }
    }

    // 7. CAST DATA ボタン (1016行目と1026行目付近)
    if (lines[i].includes('onClick={() => setShowPreferencesModal(true)}') && lines[i].includes('CAST')) {
        // すでに囲まれているかチェック
        if (!lines[i-1].includes('!profileData.isAdmin')) {
            lines.splice(i, 0, '                    {!profileData.isAdmin && (');
            // </button> を探す
            for(let j=i+1; j<i+10; j++) {
                if (lines[j] && lines[j].includes('</button>')) {
                    lines.splice(j+1, 0, '                    )}');
                    console.log("Fixed CAST DATA button");
                    break;
                }
            }
        }
    }

    // 8. ステータス (1060行目付近)
    if (lines[i].includes('ステータス:')) {
        if (!lines[i-2].includes('!profileData.isAdmin')) {
            lines.splice(i-1, 0, '            {!profileData.isAdmin && (');
            // </div> を探す
            let divCount = 1;
            for(let j=i+1; j<i+20; j++) {
                if (lines[j] && lines[j].includes('<div')) divCount++;
                if (lines[j] && lines[j].includes('</div')) divCount--;
                if (divCount === 0) {
                    lines.splice(j+1, 0, '            )}');
                    console.log("Fixed status");
                    break;
                }
            }
        }
    }

    // 9. 出勤情報タブ (1095行目付近)
    if (lines[i].includes("onClick={() => setActiveTab('shifts')}")) {
        if (!lines[i-2].includes('!profileData.isAdmin')) {
            lines.splice(i-1, 0, '          {!profileData.isAdmin && (');
            // </button> を探す
            for(let j=i+1; j<i+10; j++) {
                if (lines[j] && lines[j].includes('</button>')) {
                    lines.splice(j+1, 0, '          )}');
                    console.log("Fixed shifts tab");
                    break;
                }
            }
        }
    }

    // 10. 予約ボタン (1200行目付近)
    if (lines[i].includes('className="fixed bottom-[72px] left-0 right-0 max-w-md mx-auto p-4 z-40 bg-white border-t border-[#E5E5E5]"')) {
        if (!lines[i-1].includes('!profileData.isAdmin')) {
            lines.splice(i, 0, '      {!profileData.isAdmin && (');
            // </div> を探す
            let divCount = 1;
            for(let j=i+2; j<i+30; j++) {
                if (lines[j] && lines[j].includes('<div')) divCount++;
                if (lines[j] && lines[j].includes('</div')) divCount--;
                if (divCount === 0) {
                    lines.splice(j+1, 0, '      )}');
                    console.log("Fixed reserve btn");
                    break;
                }
            }
        }
    }
}

fs.writeFileSync('src/app/cast/[id]/page.tsx', lines.join('\n'));
console.log("Script execution complete.");
