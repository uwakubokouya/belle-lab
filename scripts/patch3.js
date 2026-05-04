const fs = require('fs');

let lines = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8').split(/\r?\n/);

// 5. カバー画像
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<img src={cast.cover} alt="Cover" className="w-full h-full object-cover opacity-50 mix-blend-overlay" />')) {
        lines[i] = lines[i].replace('<img src={cast.cover} alt="Cover" className="w-full h-full object-cover opacity-50 mix-blend-overlay" />', '<img src={cast.cover} alt="Cover" className="absolute inset-0 w-full h-full object-cover z-0" />');
        console.log("Fixed cover");
    }
}

// 6. バッジ
for (let i = 0; i < lines.length; i++) {
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
}

// 7. CAST DATA ボタン
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('onClick={() => setShowPreferencesModal(true)}') && lines[i].includes('CAST')) {
        if (!lines[i-1].includes('!profileData.isAdmin')) {
            lines.splice(i, 0, '                    {!profileData.isAdmin && (');
            for(let j=i+1; j<i+10; j++) {
                if (lines[j] && lines[j].includes('</button>')) {
                    lines.splice(j+1, 0, '                    )}');
                    console.log("Fixed CAST DATA button");
                    break;
                }
            }
            // 配列長が変わるので i を調整
            i++;
        }
    }
}

// 8. ステータス (1060行目付近)
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('ステータス:')) {
        if (!lines[i-2].includes('!profileData.isAdmin')) {
            lines.splice(i-1, 0, '            {!profileData.isAdmin && (');
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
}

// 9. 出勤情報タブ (1095行目付近)
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("onClick={() => setActiveTab('shifts')}")) {
        if (!lines[i-2].includes('!profileData.isAdmin')) {
            lines.splice(i-1, 0, '          {!profileData.isAdmin && (');
            for(let j=i+1; j<i+10; j++) {
                if (lines[j] && lines[j].includes('</button>')) {
                    lines.splice(j+1, 0, '          )}');
                    console.log("Fixed shifts tab");
                    break;
                }
            }
        }
    }
}

// 10. 予約ボタン (1200行目付近)
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('className="fixed bottom-[72px] left-0 right-0 max-w-md mx-auto p-4 z-40 bg-white border-t border-[#E5E5E5]"')) {
        if (!lines[i-1].includes('!profileData.isAdmin')) {
            lines.splice(i, 0, '      {!profileData.isAdmin && (');
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
