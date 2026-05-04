const fs = require('fs');
const path = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `<div className="mb-6">
            <h1 className="text-2xl font-normal text-black flex items-center gap-2 uppercase tracking-widest mb-4">
                {cast.name || "名称未設定"}
            </h1>
            <p className="text-sm text-[#333333] whitespace-pre-wrap leading-relaxed font-light">
                {cast.bio || ""}
            </p>
        </div>`;

const targetStrCRLF = targetStr.replace(/\n/g, '\r\n');

const replacement = `<div className="mb-6">
            <h1 className="text-2xl font-normal text-black flex items-center gap-2 uppercase tracking-widest mb-3">
                {cast.name || "名称未設定"}
            </h1>
          {storeInfo && storeInfo.name && (
              <Link href={\`/cast/\${storeInfo.id}\`} className="inline-block mt-0 mb-3">
                  <span className="text-[10px] text-[#777777] bg-[#F9F9F9] border border-[#E5E5E5] px-2 py-0.5 tracking-widest hover:bg-[#E5E5E5] transition-colors">
                      {storeInfo.name}
                  </span>
              </Link>
          )}
          {cast.bio && (
            <p className="text-sm text-[#333333] whitespace-pre-wrap leading-relaxed font-light">
                {cast.bio}
            </p>
          )}
        </div>`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Success (LF)");
} else if (content.includes(targetStrCRLF)) {
    content = content.replace(targetStrCRLF, replacement.replace(/\n/g, '\r\n'));
    fs.writeFileSync(path, content, 'utf8');
    console.log("Success (CRLF)");
} else {
    console.log("Not found");
}
