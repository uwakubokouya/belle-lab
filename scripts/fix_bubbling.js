const fs = require('fs');

let lines = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8').split(/\r?\n/);

let changed = 0;
for (let i = 0; i < lines.length; i++) {
    // Top bar controls z-index
    if (lines[i].includes('<div className="absolute top-0 w-full p-4 flex justify-between items-center z-10">')) {
        lines[i] = lines[i].replace('z-10', 'z-50');
        console.log("Changed z-10 to z-50 at line", i + 1);
        changed++;
    }

    // router.back() button
    if (lines[i].includes('onClick={() => router.back()}') && lines[i].includes('<button')) {
        lines[i] = lines[i].replace('onClick={() => router.back()}', 'onClick={(e) => { e.stopPropagation(); router.back(); }}');
        console.log("Added stopPropagation to back button at line", i + 1);
        changed++;
    }

    // handleMessage button
    if (lines[i].includes('onClick={handleMessage}')) {
        lines[i] = lines[i].replace('onClick={handleMessage}', 'onClick={(e) => { e.stopPropagation(); handleMessage(); }}');
        console.log("Added stopPropagation to DM button at line", i + 1);
        changed++;
    }
}

if (changed > 0) {
    fs.writeFileSync('src/app/cast/[id]/page.tsx', lines.join('\n'), 'utf8');
    console.log('Done fixing button bubbling');
} else {
    console.log('No lines matched');
}
