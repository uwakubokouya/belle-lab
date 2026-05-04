const fs = require('fs');

let content = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8');

// 1. sns_profiles の select に is_admin を追加
content = content.replace(/select\('id, name, avatar_url, cover_url, accepts_dms, phone'\)/g, "select('id, name, avatar_url, cover_url, accepts_dms, phone, is_admin')");

// 2. ProfileData インターフェースに isAdmin を追加
const profileRegex = /storeProfileId\?: string;[\s\r\n]*}/;
if (content.match(profileRegex)) {
    content = content.replace(profileRegex, "storeProfileId?: string;\n    isAdmin?: boolean;\n  }");
}

// 3. fetchFollowData 内で isAdmin を取得し setProfileData に追加
const setDataRegex = /setProfileData\(prev => \(\{[\s\r\n]*\.\.\.prev,[\s\r\n]*name: castName,[\s\r\n]*image: castImg,[\s\r\n]*cover: castCover,[\s\r\n]*bio: castBio,[\s\r\n]*storeName: fetchedStoreName,[\s\r\n]*storeId: fetchedStoreId,[\s\r\n]*storeProfileId: fetchedStoreProfileId[\s\r\n]*\}\)\);/;
const setDataRep = `setProfileData(prev => ({
        ...prev,
        name: castName,
        image: castImg,
        cover: castCover,
        bio: castBio,
        storeName: fetchedStoreName,
        storeId: fetchedStoreId,
        storeProfileId: fetchedStoreProfileId,
        isAdmin: profile?.is_admin || false
      }));`;
content = content.replace(setDataRegex, setDataRep);

// 4. "CAST DATA" ボタンを非表示に
content = content.replace(/<button onClick=\{\(\) => setShowMetricsModal\(true\)\} className="px-3 py-1 border border-black text-\[10px\] tracking-widest hover:bg-black hover:text-white transition-colors bg-white font-medium flex flex-col items-center leading-none justify-center h-8">/g, 
`{!profileData.isAdmin && <button onClick={() => setShowMetricsModal(true)} className="px-3 py-1 border border-black text-[10px] tracking-widest hover:bg-black hover:text-white transition-colors bg-white font-medium flex flex-col items-center leading-none justify-center h-8">`);
content = content.replace(/<span>DATA<\/span>[\s\r\n]*<\/button>/g, `<span>DATA</span>\n                </button>}`);

// 5. ステータス (ステータス: ... ) の非表示
const statusRegex = /<span className="text-\[10px\] tracking-widest text-\[#777777\]">ステータス:<\/span>[\s\r\n]*<span className=\{`text-xs font-bold tracking-widest \$\{cast\.status === "本日出勤" \? 'text-black' : 'text-\[#333333\]'\}`\}>[\s\r\n]*\{cast\.status \|\| ""\}[\s\r\n]*<\/span>/;
const statusRep = `{!profileData.isAdmin && (
                <>
                  <span className="text-[10px] tracking-widest text-[#777777]">ステータス:</span>
                  <span className={\`text-xs font-bold tracking-widest \${cast.status === "本日出勤" ? 'text-black' : 'text-[#333333]'}\`}>
                    {cast.status || ""}
                  </span>
                </>
              )}`;
content = content.replace(statusRegex, statusRep);

// 6. 「出勤情報」タブの非表示
content = content.replace(/<button[\s\r\n]*onClick=\{\(\) => setActiveTab\('shifts'\)\}[\s\r\n]*className=\{`flex-1 py-4 text-xs tracking-widest text-center transition-colors \$\{[\s\r\n]*activeTab === 'shifts'[\s\r\n]*\? 'bg-white text-black border-t border-x border-black border-b border-b-transparent'[\s\r\n]*: 'bg-\[#F9F9F9\] text-\[#777777\] border-b border-\[#E5E5E5\] hover:bg-\[#F0F0F0\]'[\s\r\n]*\}`\}[\s\r\n]*>[\s\r\n]*出勤情報[\s\r\n]*<\/button>/,
`{!profileData.isAdmin && (
            <button
              onClick={() => setActiveTab('shifts')}
              className={\`flex-1 py-4 text-xs tracking-widest text-center transition-colors \${
                activeTab === 'shifts'
                  ? 'bg-white text-black border-t border-x border-black border-b border-b-transparent'
                  : 'bg-[#F9F9F9] text-[#777777] border-b border-[#E5E5E5] hover:bg-[#F0F0F0]'
              }\`}
            >
              出勤情報
            </button>
          )}`);

// 7. 予約ボタンの非表示
const reserveRegex = /<div className="fixed bottom-0 left-0 right-0 p-4 bg-white\/90 backdrop-blur-md border-t border-\[#E5E5E5\] z-40 max-w-3xl mx-auto flex items-center justify-center gap-4">/;
const reserveRep = `{!profileData.isAdmin && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-[#E5E5E5] z-40 max-w-3xl mx-auto flex items-center justify-center gap-4">`;

if (content.includes('<div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-[#E5E5E5] z-40 max-w-3xl mx-auto flex items-center justify-center gap-4">')) {
    content = content.replace(reserveRegex, reserveRep);
    // 閉じタグを追加
    // そのdivは <button onClick={handleReservation} ... >...</button> </div> で終わっている
    const endReserveRegex = /<span>このキャストを予約する<\/span>[\s\r\n]*<\/button>[\s\r\n]*<\/div>/;
    const endReserveRep = `<span>このキャストを予約する</span>\n          </button>\n        </div>\n      )}`;
    content = content.replace(endReserveRegex, endReserveRep);
}

// 8. ギャラリータブの幅調整 ("ギャラリー"のクラスから flex-1 を外すのは不要かもしれないが、2つになると幅が広がるのでそのままでもいい)

fs.writeFileSync('src/app/cast/[id]/page.tsx', content);

console.log("Admin account UI hidden successfully.");
