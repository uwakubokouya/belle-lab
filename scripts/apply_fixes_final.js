const fs = require('fs');

let content = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8');

// 1. sns_profiles の select に is_admin を追加
content = content.replace(/select\('id, name, avatar_url, cover_url, accepts_dms, phone'\)/g, "select('id, name, avatar_url, cover_url, accepts_dms, phone, is_admin')");

// 2. ProfileData インターフェースの更新
const profileDataRegex = /storeId\?: string;[\s\r\n]*}/;
content = content.replace(profileDataRegex, "storeId?: string;\n    storeProfileId?: string;\n    isAdmin?: boolean;\n  }");

// 3. fetchFollowData 内の変数定義と店舗情報取得部分の更新
const fetchStoreRegex = /let fetchedStoreName = "";[\s\r\n]*let fetchedStoreId = storeCast\?\.store_id \|\| null;[\s\r\n]*if \(fetchedStoreId\) \{[\s\r\n]*const \{ data: storeData \} = await supabase\.from\('profiles'\)\.select\('full_name, username'\)\.eq\('store_id', fetchedStoreId\)\.eq\('role', 'admin'\)\.maybeSingle\(\);[\s\r\n]*if \(storeData\) \{[\s\r\n]*fetchedStoreName = storeData\.full_name \|\| storeData\.username \|\| "";[\s\r\n]*\}[\s\r\n]*\}/;
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
content = content.replace(fetchStoreRegex, fetchStoreRep);

// 4. setProfileData の更新
const setProfileDataRegex = /setProfileData\(prev => \(\{[\s\r\n]*\.\.\.prev,[\s\r\n]*name: castName,[\s\r\n]*image: castImg,[\s\r\n]*cover: castCover,[\s\r\n]*bio: castBio,[\s\r\n]*storeName: fetchedStoreName,[\s\r\n]*storeId: fetchedStoreId[\s\r\n]*\}\)\);/;
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
content = content.replace(setProfileDataRegex, setProfileDataRep);

// 5. カバー画像の透過削除
content = content.replace(/<img src=\{cast\.cover\} alt="Cover" className="w-full h-full object-cover opacity-50 mix-blend-overlay" \/>/,
'<img src={cast.cover} alt="Cover" className="absolute inset-0 w-full h-full object-cover z-0" />');

// 6. バッジのリンクとスタイル
const badgeRegex = /\{profileData\.storeName && profileData\.storeId && \([\s\r\n]*<Link[\s\r\n]*href=\{`\/store\/\$\{profileData\.storeId\}`\}[\s\r\n]*className="inline-flex items-center gap-1\.5 px-3 py-1 bg-\[#F9F9F9\] border border-\[#E5E5E5\] text-\[10px\] tracking-widest text-black hover:bg-black hover:text-white transition-colors mb-4"[\s\r\n]*>[\s\r\n]*\{profileData\.storeName\}[\s\r\n]*<ArrowRight size=\{10\} className="stroke-\[1\.5\]" \/>[\s\r\n]*<\/Link>[\s\r\n]*\)\}/;
const badgeRep = `{profileData.storeName && (profileData.storeProfileId || profileData.storeId) && (
                <Link href={\`/cast/\${profileData.storeProfileId || profileData.storeId}\`} className="inline-block mb-4">
                  <span className="text-[10px] text-[#777777] bg-[#F9F9F9] border border-[#E5E5E5] px-2 py-0.5 tracking-widest hover:bg-[#E5E5E5] transition-colors">
                    {profileData.storeName}
                  </span>
                </Link>
            )}`;
content = content.replace(badgeRegex, badgeRep);

// 7. CAST DATA ボタン (1つ目)
const castDataRegex1 = /<button onClick=\{\(\) => setShowPreferencesModal\(true\)\} className="px-4 py-1\.5 mb-2 border border-\[#E5E5E5\] text-black bg-white hover:bg-\[#F9F9F9\] transition-colors flex flex-col items-center justify-center tracking-widest gap-0\.5">[\s\r\n]*<span className="text-\[10px\] font-medium leading-none tracking-\[0\.1em\]">CAST<\/span>[\s\r\n]*<span className="text-\[8px\] font-bold leading-none tracking-\[0\.1em\]">DATA<\/span>[\s\r\n]*<\/button>/;
const castDataRep1 = `{!profileData.isAdmin && (
                      <button onClick={() => setShowPreferencesModal(true)} className="px-4 py-1.5 mb-2 border border-[#E5E5E5] text-black bg-white hover:bg-[#F9F9F9] transition-colors flex flex-col items-center justify-center tracking-widest gap-0.5">
                          <span className="text-[10px] font-medium leading-none tracking-[0.1em]">CAST</span>
                          <span className="text-[8px] font-bold leading-none tracking-[0.1em]">DATA</span>
                      </button>
                    )}`;
content = content.replace(castDataRegex1, castDataRep1);

// CAST DATA ボタン (2つ目)
content = content.replace(castDataRegex1, castDataRep1);

// 8. ステータス表示
const statusRegex = /<div className="flex gap-1 items-center">[\s\r\n]*ステータス:[\s\r\n]*<span className="text-black font-medium inline-flex items-center whitespace-nowrap">[\s\r\n]*\{cast\.status\}[\s\r\n]*\{profileData\.nextAvailableTime && \([\s\r\n]*<span className="text-\[10px\] ml-1 font-normal text-\[#777777\]">[\s\r\n]*\(\{[\s\r\n]*profileData\.nextAvailableTime === '待機中' \? '待機中' :[\s\r\n]*profileData\.nextAvailableTime\.startsWith\('次回出勤'\) \? profileData\.nextAvailableTime :[\s\r\n]*`次回\$\{profileData\.nextAvailableTime\}〜`[\s\r\n]*\}\)[\s\r\n]*<\/span>[\s\r\n]*\)\}[\s\r\n]*<\/span>[\s\r\n]*<\/div>/;
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
content = content.replace(statusRegex, statusRep);

// 9. 出勤情報タブ
const shiftsTabRegex = /<button[\s\r\n]*onClick=\{\(\) => setActiveTab\('shifts'\)\}[\s\r\n]*className=\{`flex-1 py-4 text-\[11px\] tracking-widest relative transition-colors \$\{activeTab === 'shifts' \? 'font-bold text-black bg-\\[#F9F9F9\\]' : 'font-normal text-\\[#777777\\] hover:bg-\\[#F9F9F9\\]'\}`\}[\s\r\n]*>[\s\r\n]*出勤情報[\s\r\n]*\{activeTab === 'shifts' && <div className="absolute top-0 w-full h-\[1px\] bg-black"><\/div>\}[\s\r\n]*<\/button>/;
const shiftsTabRep = `{!profileData.isAdmin && (
            <button 
               onClick={() => setActiveTab('shifts')}
               className={\`flex-1 py-4 text-[11px] tracking-widest relative transition-colors \${activeTab === 'shifts' ? 'font-bold text-black bg-[#F9F9F9]' : 'font-normal text-[#777777] hover:bg-[#F9F9F9]'}\`}
            >
              出勤情報
              {activeTab === 'shifts' && <div className="absolute top-0 w-full h-[1px] bg-black"></div>}
            </button>
          )}`;
content = content.replace(shiftsTabRegex, shiftsTabRep);

// 10. 予約ボタン Fixed 領域
const reserveBtnRegex = /<div className="fixed bottom-\[72px\] left-0 right-0 max-w-md mx-auto p-4 z-40 bg-white border-t border-\[#E5E5E5\]">[\s\r\n]*\{user\?\.id === id \? \([\s\r\n]*<button onClick=\{\(\) => setIsEditingProfile\(true\)\} className="premium-btn w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest">[\s\r\n]*<UserPlus size=\{18\} className="stroke-\[1\.5\]" \/>[\s\r\n]*プロフィールを設定・編集する[\s\r\n]*<\/button>[\s\r\n]*\) : \([\s\r\n]*<Link href=\{`\/reserve\/\$\{id\}`\} className="premium-btn w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest">[\s\r\n]*<Calendar size=\{18\} className="stroke-\[1\.5\]" \/>[\s\r\n]*このキャストを予約する[\s\r\n]*<\/Link>[\s\r\n]*\)\}[\s\r\n]*<\/div>/;
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
content = content.replace(reserveBtnRegex, reserveBtnRep);

fs.writeFileSync('src/app/cast/[id]/page.tsx', content);
console.log("Applied final fixes.");
