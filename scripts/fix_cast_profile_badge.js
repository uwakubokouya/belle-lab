const fs = require('fs');
const file = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// useState を追加
content = content.replace(
  /const \[castPreferences, setCastPreferences\] = useState<any>\(null\);/,
  `const [castPreferences, setCastPreferences] = useState<any>(null);
  const [storeInfo, setStoreInfo] = useState<{ id: string, name: string } | null>(null);`
);

// storeProfile の取得を追加
content = content.replace(
  /const storeId = storeCast\?\.store_id \|\| 'ef92279f-3f19-47e7-b542-69de5906ab9b';/,
  `const storeId = storeCast?.store_id || 'ef92279f-3f19-47e7-b542-69de5906ab9b';
            const { data: storeProfile } = await supabase.from('profiles').select('full_name').eq('id', storeId).maybeSingle();
            if (storeProfile) {
                setStoreInfo({ id: storeId, name: storeProfile.full_name || "公式" });
            }`
);

// バッジの表示を追加
content = content.replace(
  /<h1 className="text-2xl font-normal text-black flex items-center gap-2 uppercase tracking-widest mb-4">\s*\{cast\.name \|\| "名称未設定"\}\s*<\/h1>/,
  `<h1 className="text-2xl font-normal text-black flex items-center gap-2 uppercase tracking-widest mb-2">
                {cast.name || "名称未設定"}
            </h1>
            {storeInfo && (
                <Link href={\`/cast/\${storeInfo.id}\`} className="inline-flex items-center gap-1 px-2.5 py-1 border border-black text-black text-[10px] tracking-widest mb-4 hover:bg-black hover:text-white transition-colors">
                    {storeInfo.name} 公式
                </Link>
            )}`
);

fs.writeFileSync(file, content);
console.log('Fixed cast/[id]/page.tsx');
