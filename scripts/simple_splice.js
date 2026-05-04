const fs = require('fs');

let lines = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8').split(/\r?\n/);

let c1=-1, c2=-1, s1=-1, s2=-1, t1=-1, t2=-1, r1=-1, r2=-1, b1=-1, b2=-1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('  return (') && lines[i+1].includes('<>')) {
        lines.splice(i, 0, "  const isNonCastProfile = profileData.role === 'system' || profileData.role === 'store' || profileData.isAdmin || (profileData.name && (profileData.name.toLowerCase().includes('system') || profileData.name.includes('運営')));", "");
        break;
    }
}

for (let i = 0; i < lines.length; i++) {
    // Cast Data 1
    if (c1 === -1 && lines[i].includes('setShowPreferencesModal(true)') && lines[i].includes('flex-col')) {
        c1 = i;
        while (!lines[i].includes('</button>')) i++;
        c2 = i;
    }
    // Cast Data 2
    else if (c1 !== -1 && s1 === -1 && lines[i].includes('setShowPreferencesModal(true)') && lines[i].includes('flex-col')) {
        s1 = i;
        while (!lines[i].includes('</button>')) i++;
        s2 = i;
    }
    // Status
    else if (t1 === -1 && lines[i].includes('<div') && lines[i].includes('flex gap-1 items-center')) {
        t1 = i;
        while (!lines[i].includes('</div>') || !lines[i-1].includes('</span>')) i++;
        t2 = i;
    }
    // Shifts
    else if (r1 === -1 && lines[i].includes('<button') && lines[i+1] && lines[i+1].includes("setActiveTab('shifts')")) {
        r1 = i;
        while (!lines[i].includes('</button>')) i++;
        r2 = i;
    }
    // Reserve
    else if (b1 === -1 && lines[i].includes(') : (') && lines[i+1] && lines[i+1].includes('reserve/${id}')) {
        b1 = i;
        while (!lines[i].includes(')}')) i++;
        b2 = i;
    }
}

if ([c1, c2, s1, s2, t1, t2, r1, r2, b1, b2].includes(-1)) {
    console.log("Missing indices!", {c1, c2, s1, s2, t1, t2, r1, r2, b1, b2});
    process.exit(1);
}

// Splice bottom-up
lines[b2] = '          ) : null}';
lines[b1] = '          ) : !isNonCastProfile ? (';

lines.splice(r2+1, 0, '          )}');
lines.splice(r1, 0, '          {!isNonCastProfile && (');

lines.splice(t2+1, 0, '            )}');
lines.splice(t1, 0, '            {!isNonCastProfile && (');

lines.splice(s2+1, 0, '                    )}');
lines.splice(s1, 0, '                    {!isNonCastProfile && (');

lines.splice(c2+1, 0, '                    )}');
lines.splice(c1, 0, '                    {!isNonCastProfile && (');

fs.writeFileSync('src/app/cast/[id]/page.tsx', lines.join('\n'), 'utf8');
console.log("Done");
