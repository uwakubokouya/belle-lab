const fs = require('fs');
const file = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('DATA</span>')) {
    if (i + 1 < lines.length && lines[i+1].includes('</button>')) {
      if (!lines[i+1].includes(')}')) {
         lines[i+1] = lines[i+1].replace('</button>', '</button>)}');
      }
    }
  }
}
fs.writeFileSync(file, lines.join('\n'));
console.log('Fixed button closing tags');
