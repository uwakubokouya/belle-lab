const fs = require('fs');
const file = 'src/app/[prefecture]/cast/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. params の型とデコード
const target1 = `export default function CastProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();`;

const replace1 = `export default function CastProfilePage({ params }: { params: Promise<{ prefecture: string, id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const prefecture = decodeURIComponent(resolvedParams.prefecture || "");
  const router = useRouter();`;

// 2. get_public_availability のハードコード修正
const target2 = `          const { data: availabilityData } = await supabase
            .rpc('get_public_availability', {
                p_store_id: 'ef92279f-3f19-47e7-b542-69de5906ab9b',
                p_date: todayStr
            });`;

const replace2 = `          const { data: availabilityData } = await supabase
            .rpc('get_public_availability', {
                p_store_id: storeCast.store_id || 'ef92279f-3f19-47e7-b542-69de5906ab9b',
                p_date: todayStr
            });`;

content = content.replace(/\r\n/g, '\n');
const t1 = target1.replace(/\r\n/g, '\n');
const r1 = replace1.replace(/\r\n/g, '\n');
const t2 = target2.replace(/\r\n/g, '\n');
const r2 = replace2.replace(/\r\n/g, '\n');

if (content.includes(t1) && content.includes(t2)) {
    content = content.replace(t1, r1);
    content = content.replace(t2, r2);
    fs.writeFileSync(file, content);
    console.log('Success');
} else {
    if (!content.includes(t1)) console.log('Target 1 not found');
    if (!content.includes(t2)) console.log('Target 2 not found');
}
