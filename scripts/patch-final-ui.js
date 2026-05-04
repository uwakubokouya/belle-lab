const fs = require('fs');
const path = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add state variables (if not present)
if (!content.includes('const [isStoreProfile, setIsStoreProfile] = useState(false);')) {
    content = content.replace(
        /const \[showPreferencesModal, setShowPreferencesModal\] = useState\(false\);/,
        'const [showPreferencesModal, setShowPreferencesModal] = useState(false);\n  const [storeInfo, setStoreInfo] = useState<{ id: string, name: string } | null>(null);\n  const [isStoreProfile, setIsStoreProfile] = useState(false);'
    );
}

// 2. Add fetchData logic (if not present)
const fetchTarget = `      // Fetch sns_user_preferences`;
const fetchReplace = `      let resolvedStoreName = null;
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

      setIsStoreProfile(!storeCast);

      // Fetch sns_user_preferences`;

if (!content.includes('setIsStoreProfile(!storeCast);')) {
    content = content.replace(fetchTarget, fetchReplace);
}

// 3. Add badge UI (with gap-1.5 tight margins)
const badgeTargetRegex = /<div className="mb-3 flex flex-col items-start gap-3">\s*<h1 className="text-2xl font-normal text-black flex items-center gap-2 uppercase tracking-widest">\s*\{cast\.name \|\| "名称未設定"\}\s*<\/h1>\s*<p className="text-sm text-\[#333333\] whitespace-pre-wrap leading-relaxed font-light">\s*\{cast\.bio \|\| ""\}\s*<\/p>\s*<\/div>/;
const badgeReplace = `<div className="flex flex-col items-start gap-1.5 mb-4">
            <h1 className="text-2xl font-normal text-black flex items-center gap-2 uppercase tracking-widest">
                {cast.name || "名称未設定"}
            </h1>
          {storeInfo && storeInfo.name && (
              <Link href={\`/cast/\${storeInfo.id}\`} className="inline-block">
                  <span className="text-[10px] text-[#777777] bg-[#F9F9F9] border border-[#E5E5E5] px-2 py-0.5 tracking-widest hover:bg-[#E5E5E5] transition-colors">
                      {storeInfo.name}
                  </span>
              </Link>
          )}
          {cast.bio && (
            <p className="text-sm text-[#333333] whitespace-pre-wrap leading-relaxed font-light mt-1.5">
                {cast.bio}
            </p>
          )}
        </div>`;

// Fallback regex if it's already using mb-4 but without storeInfo
const badgeFallbackRegex = /<h1 className="text-2xl font-normal text-black flex items-center gap-2 uppercase tracking-widest mb-4">\s*\{cast\.name \|\| "名称未設定"\}\s*<\/h1>\s*<p className="text-sm text-\[#333333\] whitespace-pre-wrap leading-relaxed font-light">\s*\{cast\.bio \|\| ""\}\s*<\/p>/;

if (!content.includes('{storeInfo && storeInfo.name && (')) {
    if (content.match(badgeTargetRegex)) {
        content = content.replace(badgeTargetRegex, badgeReplace);
    } else if (content.match(badgeFallbackRegex)) {
        content = content.replace(badgeFallbackRegex, badgeReplace);
    }
}

// 4. Hide CAST DATA
const castDataRegex = /<button onClick=\{\(\) => setShowPreferencesModal\(true\)\} className="px-4 py-1\.5 mb-2 border border-\[#E5E5E5\] text-black bg-white hover:bg-\[#F9F9F9\] transition-colors flex flex-col items-center justify-center tracking-widest gap-0\.5">\s*<span className="text-\[10px\] font-medium leading-none tracking-\[0\.1em\]">CAST<\/span>\s*<span className="text-\[8px\] font-bold leading-none tracking-\[0\.1em\]">DATA<\/span>\s*<\/button>/g;
if (!content.includes('{!isStoreProfile && (\n<button onClick={() => setShowPreferencesModal(true)}')) {
    content = content.replace(castDataRegex, (match) => {
        // Only wrap if not already wrapped
        if (!match.includes('!isStoreProfile')) {
            return `{!isStoreProfile && (\n                        ${match.replace(/\n/g, '\n                        ')}\n                    )}`;
        }
        return match;
    });
}

// 5. Hide Shifts Tab
const shiftsTabRegex = /<button \s*onClick=\{\(\) => setActiveTab\('shifts'\)\}\s*className=\{`flex-1 py-4 text-\[11px\] tracking-widest relative transition-colors \$\{activeTab === 'shifts' \? 'font-bold text-black bg-\[#F9F9F9\]' : 'font-normal text-\[#777777\] hover:bg-\[#F9F9F9\]'\}`\}\s*>\s*出勤情報\s*\{activeTab === 'shifts' && <div className="absolute top-0 w-full h-\[1px\] bg-black"><\/div>\}\s*<\/button>/g;
if (!content.includes('{!isStoreProfile && (\n<button \n                 onClick={() => setActiveTab(\'shifts\')}')) {
    content = content.replace(shiftsTabRegex, (match) => {
        // Only wrap if not already wrapped
        if (!match.includes('!isStoreProfile')) {
            return `{!isStoreProfile && (\n          ${match.replace(/\n/g, '\n          ')}\n          )}`;
        }
        return match;
    });
}

// 6. Hide Fixed Sticky CTA Bottom
const stickyCTARegex = /\{\/\* Fixed Sticky CTA Bottom for Cast Profile \*\/\}\s*<div className="fixed bottom-\[72px\] left-0 right-0 max-w-md mx-auto p-4 z-40 bg-white border-t border-\[#E5E5E5\]">([\s\S]*?)<\/div>/;
const stickyMatch = content.match(stickyCTARegex);
if (stickyMatch && !content.includes('{!isStoreProfile && (\n        <div className="fixed bottom-[72px] left-0 right-0 max-w-md mx-auto p-4 z-40 bg-white border-t border-[#E5E5E5]">')) {
    content = content.replace(stickyCTARegex, '{/* Fixed Sticky CTA Bottom for Cast Profile */}\n      {!isStoreProfile && (\n        <div className="fixed bottom-[72px] left-0 right-0 max-w-md mx-auto p-4 z-40 bg-white border-t border-[#E5E5E5]">' + stickyMatch[1] + '</div>\n      )}');
}

fs.writeFileSync(path, content, 'utf8');
console.log("Applied final fixes.");
