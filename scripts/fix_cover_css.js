const fs = require('fs');

let lines = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8').split(/\r?\n/);

// Remove typography
let startIdx = -1;
let endIdx = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('{/* Typography over cover */}')) {
        startIdx = i;
        // Find the closing div
        let depth = 0;
        let foundDiv = false;
        for (let j = i + 1; j < lines.length; j++) {
            if (lines[j].includes('<div')) {
                depth++;
                foundDiv = true;
            }
            if (lines[j].includes('</div')) {
                depth--;
            }
            if (foundDiv && depth === 0) {
                endIdx = j;
                break;
            }
        }
        break;
    }
}

if (startIdx !== -1 && endIdx !== -1) {
    lines.splice(startIdx, endIdx - startIdx + 1);
    console.log('Removed E-GIRLS typography');
}

// Remove opacity-50 mix-blend-overlay
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('opacity-50 mix-blend-overlay') && lines[i].includes('alt="Cover"')) {
        lines[i] = lines[i].replace(' opacity-50 mix-blend-overlay', '');
        console.log('Removed opacity from cover image');
        break;
    }
}

fs.writeFileSync('src/app/cast/[id]/page.tsx', lines.join('\n'), 'utf8');
console.log('Done fix cover image CSS');
