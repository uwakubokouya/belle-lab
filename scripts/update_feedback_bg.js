const fs = require('fs');

let content = fs.readFileSync('src/app/admin/feedback/page.tsx', 'utf-8');

content = content.replace(
  `className="min-h-screen bg-black text-white flex flex-col font-light selection:bg-white selection:text-black"`,
  `className="min-h-screen bg-white text-black flex flex-col font-light selection:bg-black selection:text-white"`
);

content = content.replace(
  `className="sticky top-0 z-40 bg-black border-b border-[#333] flex items-center px-4 py-4"`,
  `className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] flex items-center px-4 py-4"`
);

content = content.replace(
  `className="text-white hover:text-[#AAA] p-2 -ml-2 transition-colors"`,
  `className="text-black hover:text-[#777] p-2 -ml-2 transition-colors"`
);

content = content.replace(
  `className="flex border border-[#333]"`,
  `className="flex border border-[#E5E5E5]"`
);

content = content.replace(
  `className={\`px-4 py-2 text-[10px] tracking-widest transition-colors \${filter === 'all' ? 'bg-white text-black font-bold' : 'bg-transparent text-[#777] hover:text-white'}\`}`,
  `className={\`px-4 py-2 text-[10px] tracking-widest transition-colors \${filter === 'all' ? 'bg-black text-white font-bold' : 'bg-transparent text-[#777] hover:text-black'}\`}`
);

content = content.replace(
  `className={\`px-4 py-2 text-[10px] tracking-widest transition-colors border-l border-[#333] \${filter === 'unread' ? 'bg-white text-black font-bold' : 'bg-transparent text-[#777] hover:text-white'}\`}`,
  `className={\`px-4 py-2 text-[10px] tracking-widest transition-colors border-l border-[#E5E5E5] \${filter === 'unread' ? 'bg-black text-white font-bold' : 'bg-transparent text-[#777] hover:text-black'}\`}`
);

content = content.replace(
  `className="w-5 h-5 border border-white border-t-transparent rounded-full animate-spin"`,
  `className="w-5 h-5 border border-black border-t-transparent rounded-full animate-spin"`
);

content = content.replace(
  `className="border border-[#333] p-12 text-center"`,
  `className="border border-[#E5E5E5] p-12 text-center"`
);

content = content.replace(
  `className={\`border p-6 transition-colors \${fb.status === 'unread' ? 'border-white bg-[#111]' : 'border-[#333] bg-black opacity-70'}\`}`,
  `className={\`border p-6 transition-colors \${fb.status === 'unread' ? 'border-black bg-white' : 'border-[#E5E5E5] bg-[#F9F9F9]'}\`}`
);

content = content.replace(
  `className="bg-white text-black text-[9px] px-1.5 py-0.5 rounded-sm"`,
  `className="bg-black text-white text-[9px] px-1.5 py-0.5 rounded-none"`
);

content = content.replace(
  `className={\`mt-4 px-3 py-1.5 text-[10px] tracking-widest border transition-colors flex items-center gap-1 ml-auto \${fb.status === 'unread' ? 'border-white text-white hover:bg-white hover:text-black' : 'border-[#555] text-[#777] hover:border-[#AAA] hover:text-[#AAA]'}\`}`,
  `className={\`mt-4 px-3 py-1.5 text-[10px] tracking-widest border transition-colors flex items-center gap-1 ml-auto \${fb.status === 'unread' ? 'border-black text-black hover:bg-black hover:text-white' : 'border-[#E5E5E5] text-[#777] hover:border-[#AAA] hover:text-black'}\`}`
);

content = content.replace(
  `className="border-t border-[#333] pt-4 mt-2"`,
  `className="border-t border-[#E5E5E5] pt-4 mt-2"`
);

fs.writeFileSync('src/app/admin/feedback/page.tsx', content);
console.log("Feedback page updated.");
