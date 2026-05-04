const fs = require('fs');
function update(file) {
    let c = fs.readFileSync(file, 'utf8');
    c = c.replace(/lockReason: p\.lockReason,\s*post_type: p\.post_type\s*};/g, 'lockReason: p.lockReason,\n                 post_type: p.post_type,\n                 storeName: adminProfile?.name || "公式",\n                 storeProfileId: adminProfile?.id\n             };');
    c = c.replace(/lockReason: ""\s*};\s*/g, 'lockReason: "",\n                storeName: adminProfile?.name || "公式",\n                storeProfileId: adminProfile?.id\n            };\n            ');
    fs.writeFileSync(file, c);
}
update('src/app/[prefecture]/page.tsx');
update('src/app/cast/[id]/page.tsx');
