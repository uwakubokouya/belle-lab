const fs = require('fs');
const file = 'src/app/[prefecture]/reserve/[castId]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `export default function ReservationPage({ params }: { params: Promise<{ castId: string }> }) {
    const { castId } = use(params);`;

const replace1 = `export default function ReservationPage({ params }: { params: Promise<{ prefecture: string, castId: string }> }) {
    const resolvedParams = use(params);
    const castId = resolvedParams.castId;
    const prefecture = decodeURIComponent(resolvedParams.prefecture || "");`;

content = content.replace(/\r\n/g, '\n');
const t1 = target1.replace(/\r\n/g, '\n');
const r1 = replace1.replace(/\r\n/g, '\n');

if (content.includes(t1)) {
    content = content.replace(t1, r1);
    fs.writeFileSync(file, content);
    console.log('Success');
} else {
    console.log('Target 1 not found');
}
