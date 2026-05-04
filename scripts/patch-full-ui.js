const fs = require('fs');
const path = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. useState
content = content.replace(
    /const \[storeInfo, setStoreInfo\] = useState<\{ id: string, name: string \} \| null>\(null\);/,
    'const [storeInfo, setStoreInfo] = useState<{ id: string, name: string } | null>(null);\n  const [isStoreProfile, setIsStoreProfile] = useState(false);'
);

// 2. fetchData - Store fetch logic
const fetchLogicTarget = /let resolvedStoreName = null;\s*let resolvedStoreId = null;[\s\S]*?setStoreInfo\(null\);\s*\}/;

const fetchLogicReplace = `let resolvedStoreName = null;
      let resolvedStoreId = null;

      let castPhone = profile?.phone;
      if (!castPhone && storeCast?.login_id) castPhone = storeCast.login_id;
      
      let targetStoreId = storeCast?.store_id;
      if (!targetStoreId && castPhone) {
          const { data: castProfile } = await supabase.from('profiles').select('store_id').eq('username', castPhone).limit(1).maybeSingle();
          if (castProfile?.store_id) {
              targetStoreId = castProfile.store_id;
          }
      }

      if (targetStoreId) {
          const { data: storeProfile } = await supabase.from('profiles').select('username, full_name').eq('id', targetStoreId).maybeSingle();
          if (storeProfile) {
              const { data: snsStore } = await supabase.from('sns_profiles').select('id, name').eq('phone', storeProfile.username).maybeSingle();
              if (snsStore) {
                  resolvedStoreName = snsStore.name;
                  resolvedStoreId = snsStore.id;
              } else {
                  resolvedStoreName = storeProfile.full_name || storeProfile.username;
                  resolvedStoreId = targetStoreId;
              }
          }
      }
      
      if (resolvedStoreName && resolvedStoreId) {
          setStoreInfo({ id: resolvedStoreId, name: resolvedStoreName });
      } else {
          setStoreInfo(null);
      }

      setIsStoreProfile(!storeCast);`;

content = content.replace(fetchLogicTarget, fetchLogicReplace);

// 3. DM Button
content = content.replace(
  /if \(!acceptsDms\) \{/g,
  'if (!acceptsDms && !isStoreProfile) {'
);

// 4. CAST DATA Button
const castDataRegex = /<button onClick=\{\(\) => setShowPreferencesModal\(true\)\} className="px-4 py-1\.5 mb-2 border border-\[#E5E5E5\] text-black bg-white hover:bg-\[#F9F9F9\] transition-colors flex flex-col items-center justify-center tracking-widest gap-0\.5">\s*<span className="text-\[10px\] font-medium leading-none tracking-\[0\.1em\]">CAST<\/span>\s*<span className="text-\[8px\] font-bold leading-none tracking-\[0\.1em\]">DATA<\/span>\s*<\/button>/g;

content = content.replace(castDataRegex, (match) => {
    return `{!isStoreProfile && (\n                        ${match.replace(/\n/g, '\n                        ')}\n                    )}`;
});

// 5. Shifts Tab
const shiftsTabRegex = /<button \s*onClick=\{\(\) => setActiveTab\('shifts'\)\}\s*className=\{`flex-1 py-4 text-\[11px\] tracking-widest relative transition-colors \$\{activeTab === 'shifts' \? 'font-bold text-black bg-\[#F9F9F9\]' : 'font-normal text-\[#777777\] hover:bg-\[#F9F9F9\]'\}`\}\s*>\s*出勤情報\s*\{activeTab === 'shifts' && <div className="absolute top-0 w-full h-\[1px\] bg-black"><\/div>\}\s*<\/button>/g;

content = content.replace(shiftsTabRegex, (match) => {
    return `{!isStoreProfile && (\n          ${match.replace(/\n/g, '\n          ')}\n          )}`;
});

// 6. Reserve Button
const reserveRegex = /<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-\[#E5E5E5\] p-4 flex justify-center pb-24 z-40 max-w-md mx-auto">\s*<button\s*className="w-full bg-black text-white py-4 font-bold tracking-widest flex items-center justify-center gap-2 hover:bg-black\/90 transition-colors"\s*onClick=\{\(\) => \{\s*if \(storeCast\?\.id\) \{\s*router\.push\(`\/reserve\?cast_id=\$\{storeCast\.id\}`\);\s*\}\s*\}\}\s*>\s*<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">\s*<rect x="3" y="4" width="18" height="18" rx="0" ry="0"><\/rect>\s*<line x1="16" y1="2" x2="16" y2="6"><\/line>\s*<line x1="8" y1="2" x2="8" y2="6"><\/line>\s*<line x1="3" y1="10" x2="21" y2="10"><\/line>\s*<\/svg>\s*このキャストを予約する\s*<\/button>\s*<\/div>/g;

content = content.replace(reserveRegex, (match) => {
    return `{!isStoreProfile && (\n      ${match.replace(/\n/g, '\n      ')}\n      )}`;
});

fs.writeFileSync(path, content, 'utf8');
console.log("Full fix applied");
