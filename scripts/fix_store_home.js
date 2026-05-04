const fs = require('fs');

let lines = fs.readFileSync('src/app/[prefecture]/page.tsx', 'utf8').split(/\r?\n/);

let changed = 0;
for (let i = 0; i < lines.length; i++) {
    // Header tabs
    if (lines[i].includes('{user?.is_admin ? (') && lines[i+1]?.includes('<>')) {
        lines[i] = lines[i].replace('{user?.is_admin ? (', '{user?.is_admin && user?.role !== \'store\' ? (');
        console.log("Fixed header tabs at line", i + 1);
        changed++;
    }

    // Feed List
    if (lines[i].includes('{user?.is_admin ? (') && lines[i+1]?.includes('<AdminHomeContent')) {
        lines[i] = lines[i].replace('{user?.is_admin ? (', '{user?.is_admin && user?.role !== \'store\' ? (');
        console.log("Fixed Feed List rendering at line", i + 1);
        changed++;
    }
}

if (changed > 0) {
    fs.writeFileSync('src/app/[prefecture]/page.tsx', lines.join('\n'), 'utf8');
    console.log('Done fixing store home screen');
} else {
    console.log('No matches found');
}
