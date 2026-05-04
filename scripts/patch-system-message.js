const fs = require('fs');
const path = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add isSystemProfile state
if (!content.includes('const [isSystemProfile, setIsSystemProfile] = useState(false);')) {
    content = content.replace(
        /const \[isStoreProfile, setIsStoreProfile\] = useState\(false\);/,
        'const [isStoreProfile, setIsStoreProfile] = useState(false);\n  const [isSystemProfile, setIsSystemProfile] = useState(false);'
    );
}

// 2. Add role to select query
const selectRegex = /\.from\('sns_profiles'\)\s*\.select\('id,\s*name,\s*avatar_url,\s*accepts_dms,\s*phone'\)/;
if (content.match(selectRegex)) {
    content = content.replace(selectRegex, ".from('sns_profiles').select('id, name, avatar_url, accepts_dms, phone, role')");
}

// 3. Set isSystemProfile
if (!content.includes('setIsSystemProfile(profile?.role === \'system\');')) {
    content = content.replace(
        /setIsStoreProfile\(!storeCast\);/,
        'setIsStoreProfile(!storeCast);\n      setIsSystemProfile(profile?.role === \'system\');'
    );
}

// 4. Add UI message
const uiTargetRegex = /<p className="text-sm text-\[#333333\] whitespace-pre-wrap leading-relaxed font-light mt-1\.5">\s*\{cast\.bio\}\s*<\/p>\s*\)\}/;
const uiReplace = `<p className="text-sm text-[#333333] whitespace-pre-wrap leading-relaxed font-light mt-1.5">
                {cast.bio}
            </p>
          )}
          {isSystemProfile && (
            <div className="mt-4 p-4 bg-[#F9F9F9] border border-[#E5E5E5] text-[10px] text-[#333333] tracking-widest leading-relaxed w-full">
              運営へのご意見やご要望につきましては、メニュータブ内の「ご意見」フォームよりお寄せいただけますと幸いです。<br />
              皆様からのお声を参考に、より良いサービス作りに努めてまいります。
            </div>
          )}`;

if (content.match(uiTargetRegex) && !content.includes('運営へのご意見やご要望につきましては')) {
    content = content.replace(uiTargetRegex, uiReplace);
} else if (!content.includes('運営へのご意見やご要望につきましては')) {
    console.log("Could not find the UI target regex.");
}

fs.writeFileSync(path, content, 'utf8');
console.log("Successfully added system message logic.");
