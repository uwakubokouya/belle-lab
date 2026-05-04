const fs = require('fs');

let content = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8');

function replaceOnce(regex, replacement, name) {
    if (content.match(regex)) {
        content = content.replace(regex, replacement);
        console.log("Success: " + name);
    } else {
        console.log("Failed to match: " + name);
    }
}

// 1. sns_profiles の select に is_admin を追加
replaceOnce(/select\('id, name, avatar_url, cover_url, accepts_dms, phone'\)/, 
            "select('id, name, avatar_url, cover_url, accepts_dms, phone, is_admin')", "is_admin select");

// 2. fetchFollowData 内の変数定義と店舗情報取得部分の更新
const fetchStoreRegex = /let fetchedStoreName = "";\r?\n\s*let fetchedStoreId = storeCast\?\.store_id \|\| null;\r?\n\s*if \(fetchedStoreId\) \{\r?\n\s*const \{ data: storeData \} = await supabase\.from\('profiles'\)\.select\('full_name, username'\)\.eq\('store_id', fetchedStoreId\)\.eq\('role', 'admin'\)\.maybeSingle\(\);\r?\n\s*if \(storeData\) \{\r?\n\s*fetchedStoreName = storeData\.full_name \|\| storeData\.username \|\| "";\r?\n\s*\}\r?\n\s*\}/;
const fetchStoreRep = `let fetchedStoreName = "";
      let fetchedStoreId = storeCast?.store_id || null;
      let fetchedStoreProfileId = "";
      
      if (fetchedStoreId) {
          const { data: storeData } = await supabase.from('profiles').select('full_name, username').eq('store_id', fetchedStoreId).eq('role', 'admin').maybeSingle();
          if (storeData) {
              fetchedStoreName = storeData.full_name || storeData.username || "";
              const { data: snsStore } = await supabase.from('sns_profiles').select('id').eq('phone', storeData.username).maybeSingle();
              if (snsStore) {
                  fetchedStoreProfileId = snsStore.id;
              } else {
                  fetchedStoreProfileId = fetchedStoreId;
              }
          }
      }`;
replaceOnce(fetchStoreRegex, fetchStoreRep, "fetchStore");

// 3. setProfileData の更新
const setProfileDataRegex = /setProfileData\(prev => \(\{\r?\n\s*\.\.\.prev,\r?\n\s*name: castName,\r?\n\s*image: castImg,\r?\n\s*cover: castCover,\r?\n\s*bio: castBio,\r?\n\s*storeName: fetchedStoreName,\r?\n\s*storeId: fetchedStoreId\r?\n\s*\}\)\);/;
const setProfileDataRep = `setProfileData(prev => ({
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
replaceOnce(setProfileDataRegex, setProfileDataRep, "setProfileData");

// 4. カバー画像の透過削除
replaceOnce(/<img src=\{cast\.cover\} alt="Cover" className="w-full h-full object-cover opacity-50 mix-blend-overlay" \/>/,
'<img src={cast.cover} alt="Cover" className="absolute inset-0 w-full h-full object-cover z-0" />', "cover opacity");

// 5. バッジのリンクとスタイル
const badgeRegex = /\{profileData\.storeName && profileData\.storeId && \(\r?\n\s*<Link\r?\n\s*href=\{`\/store\/\$\{profileData\.storeId\}`\}\r?\n\s*className="inline-flex items-center gap-1\.5 px-3 py-1 bg-\[#F9F9F9\] border border-\[#E5E5E5\] text-\[10px\] tracking-widest text-black hover:bg-black hover:text-white transition-colors mb-4"\r?\n\s*>\r?\n\s*\{profileData\.storeName\}\r?\n\s*<ArrowRight size=\{10\} className="stroke-\[1\.5\]" \/>\r?\n\s*<\/Link>\r?\n\s*\)\}/;
const badgeRep = `{profileData.storeName && (profileData.storeProfileId || profileData.storeId) && (
                <Link href={\`/cast/\${profileData.storeProfileId || profileData.storeId}\`} className="inline-block mb-4">
                  <span className="text-[10px] text-[#777777] bg-[#F9F9F9] border border-[#E5E5E5] px-2 py-0.5 tracking-widest hover:bg-[#E5E5E5] transition-colors">
                    {profileData.storeName}
                  </span>
                </Link>
            )}`;
replaceOnce(badgeRegex, badgeRep, "badge link");

// 6. CAST DATA ボタン 1つ目
const castDataRegex1 = /<button onClick=\{\(\) => setShowPreferencesModal\(true\)\} className="px-4 py-1\.5 mb-2 border border-\[#E5E5E5\] text-black bg-white hover:bg-\[#F9F9F9\] transition-colors flex flex-col items-center justify-center tracking-widest gap-0\.5">\r?\n\s*<span className="text-\[10px\] font-medium leading-none tracking-\[0\.1em\]">CAST<\/span>\r?\n\s*<span className="text-\[8px\] font-bold leading-none tracking-\[0\.1em\]">DATA<\/span>\r?\n\s*<\/button>/;
const castDataRep1 = `{!profileData.isAdmin && (
                      <button onClick={() => setShowPreferencesModal(true)} className="px-4 py-1.5 mb-2 border border-[#E5E5E5] text-black bg-white hover:bg-[#F9F9F9] transition-colors flex flex-col items-center justify-center tracking-widest gap-0.5">
                          <span className="text-[10px] font-medium leading-none tracking-[0.1em]">CAST</span>
                          <span className="text-[8px] font-bold leading-none tracking-[0.1em]">DATA</span>
                      </button>
                    )}`;
replaceOnce(castDataRegex1, castDataRep1, "CAST DATA 1");

// CAST DATA ボタン 2つ目
replaceOnce(castDataRegex1, castDataRep1, "CAST DATA 2");

// 7. ステータス表示
const statusRegex = /<div className="flex gap-1 items-center">\r?\n\s*ステータス:\r?\n\s*<span className="text-black font-medium inline-flex items-center whitespace-nowrap">\r?\n\s*\{cast\.status\}\r?\n\s*\{profileData\.nextAvailableTime && \(\r?\n\s*<span className="text-\[10px\] ml-1 font-normal text-\[#777777\]">\r?\n\s*\(\{\r?\n\s*profileData\.nextAvailableTime === '待機中' \? '待機中' :\r?\n\s*profileData\.nextAvailableTime\.startsWith\('次回出勤'\) \? profileData\.nextAvailableTime :\r?\n\s*`次回\$\{profileData\.nextAvailableTime\}〜`\r?\n\s*\}\)\r?\n\s*<\/span>\r?\n\s*\)\}\r?\n\s*<\/span>\r?\n\s*<\/div>/;
const statusRep = `{!profileData.isAdmin && (
              <div className="flex gap-1 items-center">
                  ステータス: 
                  <span className="text-black font-medium inline-flex items-center whitespace-nowrap">
                      {cast.status}
                      {profileData.nextAvailableTime && (
                          <span className="text-[10px] ml-1 font-normal text-[#777777]">
                              ({
                                  profileData.nextAvailableTime === '待機中' ? '待機中' :
                                  profileData.nextAvailableTime.startsWith('次回出勤') ? profileData.nextAvailableTime :
                                  \`次回\${profileData.nextAvailableTime}〜\`
                              })
                          </span>
                      )}
                  </span>
              </div>
            )}`;
replaceOnce(statusRegex, statusRep, "status");

// 8. 出勤情報タブ
const shiftsTabRegex = /<button\r?\n\s*onClick=\{\(\) => setActiveTab\('shifts'\)\}\r?\n\s*className=\{`flex-1 py-4 text-\[11px\] tracking-widest relative transition-colors \$\{activeTab === 'shifts' \? 'font-bold text-black bg-\\[#F9F9F9\\]' : 'font-normal text-\\[#777777\\] hover:bg-\\[#F9F9F9\\]'\}`\}\r?\n\s*>\r?\n\s*出勤情報\r?\n\s*\{activeTab === 'shifts' && <div className="absolute top-0 w-full h-\[1px\] bg-black"><\/div>\}\r?\n\s*<\/button>/;
const shiftsTabRep = `{!profileData.isAdmin && (
            <button 
               onClick={() => setActiveTab('shifts')}
               className={\`flex-1 py-4 text-[11px] tracking-widest relative transition-colors \${activeTab === 'shifts' ? 'font-bold text-black bg-[#F9F9F9]' : 'font-normal text-[#777777] hover:bg-[#F9F9F9]'}\`}
            >
              出勤情報
              {activeTab === 'shifts' && <div className="absolute top-0 w-full h-[1px] bg-black"></div>}
            </button>
          )}`;
replaceOnce(shiftsTabRegex, shiftsTabRep, "shifts tab");

// 9. 予約ボタン Fixed 領域
const reserveBtnRegex = /<div className="fixed bottom-\[72px\] left-0 right-0 max-w-md mx-auto p-4 z-40 bg-white border-t border-\[#E5E5E5\]">\r?\n\s*\{user\?\.id === id \? \(\r?\n\s*<button onClick=\{\(\) => setIsEditingProfile\(true\)\} className="premium-btn w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest">\r?\n\s*<UserPlus size=\{18\} className="stroke-\[1\.5\]" \/>\r?\n\s*プロフィールを設定・編集する\r?\n\s*<\/button>\r?\n\s*\) : \(\r?\n\s*<Link href=\{`\/reserve\/\$\{id\}`\} className="premium-btn w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest">\r?\n\s*<Calendar size=\{18\} className="stroke-\[1\.5\]" \/>\r?\n\s*このキャストを予約する\r?\n\s*<\/Link>\r?\n\s*\)\}\r?\n\s*<\/div>/;
const reserveBtnRep = `{!profileData.isAdmin && (
        <div className="fixed bottom-[72px] left-0 right-0 max-w-md mx-auto p-4 z-40 bg-white border-t border-[#E5E5E5]">
            {user?.id === id ? (
              <button onClick={() => setIsEditingProfile(true)} className="premium-btn w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest">
                 <UserPlus size={18} className="stroke-[1.5]" />
                 プロフィールを設定・編集する
              </button>
            ) : (
              <Link href={\`/reserve/\${id}\`} className="premium-btn w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest">
                 <Calendar size={18} className="stroke-[1.5]" />
                 このキャストを予約する
              </Link>
            )}
        </div>
      )}`;
replaceOnce(reserveBtnRegex, reserveBtnRep, "reserve btn");

fs.writeFileSync('src/app/cast/[id]/page.tsx', content);
console.log("Safe patch applied.");
