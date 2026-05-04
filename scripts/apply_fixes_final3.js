const fs = require('fs');

let content = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8');

// 1. ProfileData
content = content.replace(
    /_avatarFile\?:\s*File;\r?\n\s*_coverFile\?:\s*File;\r?\n\s*\}/,
    `_avatarFile?: File;\n    _coverFile?: File;\n    storeName?: string;\n    storeId?: string;\n    storeProfileId?: string;\n    isAdmin?: boolean;\n  }`
);

// 2. select('id, name, avatar_url, accepts_dms, phone') -> 追加
content = content.replace(
    /select\('id, name, avatar_url, accepts_dms, phone'\)/g,
    "select('id, name, avatar_url, cover_url, accepts_dms, phone, is_admin')"
);

// 3. fetchStoreData (let castImg... の直前に挿入)
content = content.replace(
    /let castImg = profile\?\.avatar_url \|\| storeCast\?\.profile_image_url \|\| storeCast\?\.avatar_url \|\| "\/images\/no-photo\.jpg";/,
    `let fetchedStoreName = "";
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
      }

      let castImg = profile?.avatar_url || storeCast?.profile_image_url || storeCast?.avatar_url || "/images/no-photo.jpg";
      let castCover = profile?.cover_url || "";`
);

// 4. setProfileData (187行目付近)
content = content.replace(
    /setProfileData\(prev => \(\{\r?\n\s*\.\.\.prev,\r?\n\s*name: castName,\r?\n\s*image: castImg,\r?\n\s*bio: castBio\r?\n\s*\}\)\);/,
    `setProfileData(prev => ({
        ...prev,
        name: castName,
        image: castImg,
        cover: castCover,
        bio: castBio,
        storeName: fetchedStoreName,
        storeId: fetchedStoreId,
        storeProfileId: fetchedStoreProfileId,
        isAdmin: profile?.is_admin || false
      }));`
);

// 5. isPrivileged の定義
// const actualCastId = profile ? profile.id : id; (200行目付近)
content = content.replace(
    /const actualCastId = profile \? profile\.id : id;/,
    `const actualCastId = profile ? profile.id : id;\n      const isPriv = profile?.is_admin || user?.id === actualCastId;\n`
);

// render 側で isPrivileged を使うために、コンポーネントのトップレベルに定義したいが、
// `profileData` と `user.id` を使えば render 内で直接判定できる。
// const isPrivileged = profileData.isAdmin || user?.id === id;

// 6. カバー画像の表示
content = content.replace(
    /<img src=\{cast\.cover\} alt="Cover" className="w-full h-full object-cover opacity-50 mix-blend-overlay" \/>/,
    `<img src={cast.cover} alt="Cover" className="absolute inset-0 w-full h-full object-cover z-0" />`
);

// 7. 店舗バッジ (cast.name の直下)
content = content.replace(
    /\{cast\.name \|\| "名称未設定"\}\r?\n\s*<\/h1>/,
    `{cast.name || "名称未設定"}\n            </h1>\n            {profileData.storeName && (profileData.storeProfileId || profileData.storeId) && (
                <Link href={\`/cast/\${profileData.storeProfileId || profileData.storeId}\`} className="inline-block mb-4">
                  <span className="text-[10px] text-[#777777] bg-[#F9F9F9] border border-[#E5E5E5] px-2 py-0.5 tracking-widest hover:bg-[#E5E5E5] transition-colors">
                    {profileData.storeName}
                  </span>
                </Link>
            )}`
);

// 8. CAST DATA ボタン 1つ目 (967行目付近)
content = content.replace(
    /<button onClick=\{\(\) => setShowPreferencesModal\(true\)\} className="px-4 py-1\.5 mb-2 border border-\[#E5E5E5\] text-black bg-white hover:bg-\[#F9F9F9\] transition-colors flex flex-col items-center justify-center tracking-widest gap-0\.5">\r?\n\s*<span className="text-\[10px\] font-medium leading-none tracking-\[0\.1em\]">CAST<\/span>\r?\n\s*<span className="text-\[8px\] font-bold leading-none tracking-\[0\.1em\]">DATA<\/span>\r?\n\s*<\/button>/g,
    `{(profileData.isAdmin || user?.id === id) && (
                      <button onClick={() => setShowPreferencesModal(true)} className="px-4 py-1.5 mb-2 border border-[#E5E5E5] text-black bg-white hover:bg-[#F9F9F9] transition-colors flex flex-col items-center justify-center tracking-widest gap-0.5">
                          <span className="text-[10px] font-medium leading-none tracking-[0.1em]">CAST</span>
                          <span className="text-[8px] font-bold leading-none tracking-[0.1em]">DATA</span>
                      </button>
                    )}`
);

// 9. ステータス (1028行目付近)
content = content.replace(
    /<div className="flex gap-1 items-center">\r?\n\s*ステータス:\r?\n\s*<span className="text-black font-medium inline-flex items-center whitespace-nowrap">\r?\n\s*\{cast\.status\}\r?\n\s*\{profileData\.nextAvailableTime && \(\r?\n\s*<span className="text-\[10px\] ml-1 font-normal text-\[#777777\]">\r?\n\s*\(\{\r?\n\s*profileData\.nextAvailableTime === '待機中' \? '待機中' :\r?\n\s*profileData\.nextAvailableTime\.startsWith\('次回出勤'\) \? profileData\.nextAvailableTime :\r?\n\s*`次回\$\{profileData\.nextAvailableTime\}〜`\r?\n\s*\}\)\r?\n\s*<\/span>\r?\n\s*\)\}\r?\n\s*<\/span>\r?\n\s*<\/div>/,
    `{(profileData.isAdmin || user?.id === id) && (
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
            )}`
);

// 10. 出勤情報タブ (1063行目付近)
content = content.replace(
    /<button\r?\n\s*onClick=\{\(\) => setActiveTab\('shifts'\)\}\r?\n\s*className=\{`flex-1 py-4 text-\[11px\] tracking-widest relative transition-colors \$\{activeTab === 'shifts' \? 'font-bold text-black bg-\\[#F9F9F9\\]' : 'font-normal text-\\[#777777\\] hover:bg-\\[#F9F9F9\\]'\}`\}\r?\n\s*>\r?\n\s*出勤情報\r?\n\s*\{activeTab === 'shifts' && <div className="absolute top-0 w-full h-\[1px\] bg-black"><\/div>\}\r?\n\s*<\/button>/,
    `{(profileData.isAdmin || user?.id === id) && (
            <button 
               onClick={() => setActiveTab('shifts')}
               className={\`flex-1 py-4 text-[11px] tracking-widest relative transition-colors \${activeTab === 'shifts' ? 'font-bold text-black bg-[#F9F9F9]' : 'font-normal text-[#777777] hover:bg-[#F9F9F9]'}\`}
            >
              出勤情報
              {activeTab === 'shifts' && <div className="absolute top-0 w-full h-[1px] bg-black"></div>}
            </button>
          )}`
);

// 11. 予約ボタン Fixed 領域 (1162行目付近)
content = content.replace(
    /<div className="fixed bottom-\[72px\] left-0 right-0 max-w-md mx-auto p-4 z-40 bg-white border-t border-\[#E5E5E5\]">\r?\n\s*\{user\?\.id === id \? \(\r?\n\s*<button onClick=\{\(\) => setIsEditingProfile\(true\)\} className="premium-btn w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest">\r?\n\s*<UserPlus size=\{18\} className="stroke-\[1\.5\]" \/>\r?\n\s*プロフィールを設定・編集する\r?\n\s*<\/button>\r?\n\s*\) : \(\r?\n\s*<Link href=\{`\/reserve\/\$\{id\}`\} className="premium-btn w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest">\r?\n\s*<Calendar size=\{18\} className="stroke-\[1\.5\]" \/>\r?\n\s*このキャストを予約する\r?\n\s*<\/Link>\r?\n\s*\)\}\r?\n\s*<\/div>/,
    `{(profileData.isAdmin || user?.id === id) && (
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
      )}`
);

fs.writeFileSync('src/app/cast/[id]/page.tsx', content);
console.log("Successfully applied all fixes.");
