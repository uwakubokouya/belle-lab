const fs = require('fs');

let lines = fs.readFileSync('src/utils/businessTime.ts', 'utf8').split(/\r?\n/);

let changed = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('.single();')) {
        lines[i] = lines[i].replace('.single();', '.maybeSingle();');
        console.log('Replaced .single() with .maybeSingle() at line', i + 1);
        changed = true;
    }
}

if (changed) {
    fs.writeFileSync('src/utils/businessTime.ts', lines.join('\n'), 'utf8');
    console.log('Done fixing businessTime.ts');
} else {
    console.log('No .single() found');
}
