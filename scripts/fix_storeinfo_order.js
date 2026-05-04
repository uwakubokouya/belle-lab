const fs = require('fs');
const file = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// fetchStoreCasts の useEffect を特定する
const regex = /useEffect\(\(\) => \{\s*if \(activeTab === 'casts' && storeCastsList\.length === 0 && storeInfo\) \{[\s\S]*?\}\s*\}, \[activeTab, storeInfo\]\);/;

const match = content.match(regex);
if (match) {
    const effectStr = match[0];
    // 元の場所から削除
    content = content.replace(effectStr, '');
    
    // storeInfo 宣言の後ろに挿入
    const insertTarget = 'const [storeInfo, setStoreInfo] = useState<{ id: string, name: string } | null>(null);';
    content = content.replace(insertTarget, insertTarget + '\n\n' + effectStr);
    
    fs.writeFileSync(file, content);
    console.log('Moved useEffect successfully.');
} else {
    console.log('useEffect not found.');
}
