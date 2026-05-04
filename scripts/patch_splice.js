const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/app/cast/[id]/page.tsx');
let lines = fs.readFileSync(targetPath, 'utf8').split(/\r?\n/);

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. isNonCastProfile
    if (line === '  return (' && lines[i+1] === '    <>') {
        lines.splice(i, 0,
            "  const isNonCastProfile = profileData.role === 'system' || profileData.role === 'store' || profileData.isAdmin || (profileData.name && (profileData.name.toLowerCase().includes('system') || profileData.name.includes('運営')));",
            ""
        );
        i += 2;
        continue;
    }

    // 2. CAST DATA 1
    if (line.includes('<button onClick={() => setShowPreferencesModal(true)}') && lines[i+1] && lines[i+1].includes('CAST')) {
        lines.splice(i, 0, '                    {!isNonCastProfile && (');
        i++;
        
        // Find closing button
        while (!lines[i].includes('</button>')) i++;
        lines.splice(i + 1, 0, '                    )}');
        i++;
        continue;
    }

    // 4. Status
    if (line.includes('<div className="flex gap-1 items-center">') && lines[i+1] && lines[i+1].includes('ステータス:')) {
        lines.splice(i, 0, '            {!isNonCastProfile && (');
        i++;
        
        // The div closes at `</div>` 2 lines after `</span>`
        while (!lines[i].includes('</div>') || !lines[i-1].includes('</span>')) i++;
        // Now lines[i] is `</div>`
        lines.splice(i + 1, 0, '            )}');
        i++;
        continue;
    }

    // 5. Shifts Tab
    if (line.includes('<button') && lines[i+1] && lines[i+1].includes("onClick={() => setActiveTab('shifts')}")) {
        lines.splice(i, 0, '          {!isNonCastProfile && (');
        i++;
        
        // Find closing button
        while (!lines[i].includes('</button>')) i++;
        lines.splice(i + 1, 0, '          )}');
        i++;
        continue;
    }

    // 6. Reserve Button
    if (line === '          ) : (' && lines[i+1] && lines[i+1].includes('reserve/${id}')) {
        lines[i] = '          ) : !isNonCastProfile ? (';
        continue;
    }
    if (line.includes('このキャストを予約する') && lines[i+1] && lines[i+1].includes('</Link>') && lines[i+2] && lines[i+2].includes(')}')) {
        lines[i+2] = '          ) : null}';
        i += 2;
        continue;
    }
}

fs.writeFileSync(targetPath, lines.join('\n'), 'utf8');
console.log('Script patched lines correctly');
