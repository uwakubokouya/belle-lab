const fs = require('fs');
const file = 'src/app/[prefecture]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `import { Heart, MessageCircle, Share2, MoreHorizontal, CheckCircle, ChevronDown, MapPin, X } from 'lucide-react';`;
const replace1 = `import { Heart, MessageCircle, Share2, MoreHorizontal, CheckCircle, ChevronDown, MapPin, X, ArrowLeft } from 'lucide-react';`;

const target2 = `      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E5E5E5]">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-widest">{decodedPrefecture}</h1>
            <span className="text-[10px] text-[#777777] border border-[#E5E5E5] px-2 py-0.5 rounded-full">PORTAL</span>
          </div>`;

const replace2 = `      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E5E5E5]">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-1 hover:bg-[#F9F9F9] transition-colors rounded-full text-[#777777]">
              <ArrowLeft size={20} className="stroke-2" />
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-widest">{decodedPrefecture}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="text-[10px] border border-[#E5E5E5] px-2 py-1 flex items-center gap-1 hover:bg-[#F9F9F9] text-[#777777] transition-colors">
              <MapPin size={10} className="stroke-[2]" />
              エリア変更
            </Link>
          </div>`;

content = content.replace(/\r\n/g, '\n');
const t1 = target1.replace(/\r\n/g, '\n');
const r1 = replace1.replace(/\r\n/g, '\n');
const t2 = target2.replace(/\r\n/g, '\n');
const r2 = replace2.replace(/\r\n/g, '\n');

let updated = false;
if (content.includes(t1)) {
    content = content.replace(t1, r1);
    updated = true;
}

if (content.includes(t2)) {
    // Need to make sure Link is imported
    if (!content.includes("import Link from 'next/link';")) {
         content = `import Link from 'next/link';\n` + content;
    }
    // Remove the old <div className="flex items-center gap-3"> that was after the target to avoid duplication
    const t2Full = t2 + `\n          <div className="flex items-center gap-3">`;
    const r2Full = replace2 + `\n          <div className="flex items-center gap-3">`;
    if (content.includes(t2Full)) {
        content = content.replace(t2Full, r2Full);
    } else {
        content = content.replace(t2, replace2);
    }
    updated = true;
}

if (updated) {
    fs.writeFileSync(file, content);
    console.log('Success adding Area Change button to header');
} else {
    console.log('Target not found for Area Change button');
}
