const fs = require('fs');

let content = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8');

const target = `    statusText?: string;
    _avatarFile?: File;
    _coverFile?: File;
  }`;

const replacement = `    statusText?: string;
    _avatarFile?: File;
    _coverFile?: File;
    storeName?: string;
    storeId?: string;
  }`;

function replaceWithCRLFHandling(content, target, replacement) {
    const regex = new RegExp(target.replace(/[.*+?^$\{\}\(\)\|\[\]\\]/g, '\\$&').replace(/\r?\n/g, '\\r?\\n'), 'g');
    return content.replace(regex, replacement);
}

content = replaceWithCRLFHandling(content, target, replacement);

fs.writeFileSync('src/app/cast/[id]/page.tsx', content);

console.log("Done3");
