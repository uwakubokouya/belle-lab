const fs = require('fs');

let lines = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8').split(/\r?\n/);

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('  return (') && lines[i+1].includes('    <>')) console.log(`isNonCast: ${i}`);
    if (lines[i].includes('setShowPreferencesModal(true)') && lines[i].includes('CAST')) console.log(`castData: ${i}`);
    if (lines[i].includes('ステータス:')) console.log(`status: ${i}`);
    if (lines[i].includes("setActiveTab('shifts')")) console.log(`shifts: ${i}`);
    if (lines[i].includes('このキャストを予約する')) console.log(`reserve: ${i}`);
}
