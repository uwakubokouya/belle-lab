const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/app/cast/[id]/page.tsx');
let lines = fs.readFileSync(targetPath, 'utf8').split(/\r?\n/);

let newLines = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. Insert isNonCastProfile definition right before "return ("
    if (line === '  return (' && lines[i+1] === '    <>') {
        newLines.push("  const isNonCastProfile = profileData.role === 'system' || profileData.role === 'store' || profileData.isAdmin || (profileData.name && (profileData.name.toLowerCase().includes('system') || profileData.name.includes('運営')));");
        newLines.push("");
        newLines.push(line);
        continue;
    }

    // 2. Hide CAST DATA button 1 (Inside user?.id === id)
    // 3. Hide CAST DATA button 2 (Inside else branch)
    if (line.includes('<button onClick={() => setShowPreferencesModal(true)}') && lines[i+1] && lines[i+1].includes('CAST')) {
        newLines.push('                    {!isNonCastProfile && (');
        newLines.push(line);
        continue;
    }
    if (line.includes('DATA</span>') && lines[i+1] && lines[i+1].includes('</button>')) {
        newLines.push(line);
        newLines.push(lines[i+1]);
        newLines.push('                    )}');
        i++; 
        continue;
    }

    // 4. Hide Status
    if (line.includes('<div className="flex gap-1 items-center">') && lines[i+1] && lines[i+1].includes('ステータス:')) {
        newLines.push('            {!isNonCastProfile && (');
        newLines.push(line);
        continue;
    }
    if (line.includes('</span>') && lines[i+1] && lines[i+1] === '            </div>' && lines[i-1] && lines[i-1].includes(')}')) {
        newLines.push(line);
        newLines.push(lines[i+1]);
        newLines.push('            )}');
        i++;
        continue;
    }

    // 5. Hide Shifts Tab
    if (line.includes('<button') && lines[i+1] && lines[i+1].includes("onClick={() => setActiveTab('shifts')}")) {
        newLines.push('          {!isNonCastProfile && (');
        newLines.push(line);
        continue;
    }
    if (line.includes('出勤情報') && lines[i+1] && lines[i+1].includes('bg-black"></div>}')) {
        newLines.push(line);
        newLines.push(lines[i+1]);
        newLines.push(lines[i+2]); // </button>
        newLines.push('          )}');
        i += 2;
        continue;
    }

    // 6. Hide Reserve Button
    if (line === '          ) : (' && lines[i+1] && lines[i+1].includes('reserve/${id}')) {
        newLines.push('          ) : !isNonCastProfile ? (');
        continue;
    }
    if (line.includes('このキャストを予約する') && lines[i+1] && lines[i+1].includes('</Link>') && lines[i+2] && lines[i+2].includes(')}')) {
        newLines.push(line);
        newLines.push(lines[i+1]);
        newLines.push('          ) : null}');
        i += 2;
        continue;
    }

    newLines.push(line);
}

fs.writeFileSync(targetPath, newLines.join('\n'), 'utf8');
console.log('Patch completed successfully');
