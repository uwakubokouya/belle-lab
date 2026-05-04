const fs = require('fs');
const path = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<h1 className="text-2xl font-normal text-black flex items-center gap-2 uppercase tracking-widest mb-4">([\s\S]*?)<\/h1>\s*<p className="text-sm text-\[#333333\] whitespace-pre-wrap leading-relaxed font-light">([\s\S]*?)<\/p>/;

const match = content.match(regex);
if (match) {
    const castNamePart = match[1];
    const castBioPart = match[2];

    const replacement = `<h1 className="text-2xl font-normal text-black flex items-center gap-2 uppercase tracking-widest mb-3">${castNamePart}</h1>
          {storeInfo && storeInfo.name && (
              <Link href={\`/cast/\${storeInfo.id}\`} className="inline-block mt-0 mb-3">
                  <span className="text-[10px] text-[#777777] bg-[#F9F9F9] border border-[#E5E5E5] px-2 py-0.5 tracking-widest hover:bg-[#E5E5E5] transition-colors">
                      {storeInfo.name}
                  </span>
              </Link>
          )}
          {cast.bio && (
            <p className="text-sm text-[#333333] whitespace-pre-wrap leading-relaxed font-light">${castBioPart}</p>
          )}`;

    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Success");
} else {
    console.log("Not found");
}
