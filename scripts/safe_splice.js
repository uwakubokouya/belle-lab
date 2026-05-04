const fs = require('fs');

let lines = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8').split(/\r?\n/);

let idx_isNonCastProfile = -1;
let idx_castData1 = -1;
let idx_castData1_end = -1;
let idx_castData2 = -1;
let idx_castData2_end = -1;
let idx_status = -1;
let idx_status_end = -1;
let idx_shifts = -1;
let idx_shifts_end = -1;
let idx_reserve = -1;
let idx_reserve_end = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i] === '  return (' && lines[i+1] === '    <>') {
        idx_isNonCastProfile = i;
    }
    
    if (idx_castData1 === -1 && lines[i].includes('setShowPreferencesModal(true)') && lines[i-1].includes('gap-2')) {
        idx_castData1 = i;
    }
    if (idx_castData1 !== -1 && idx_castData1_end === -1 && lines[i].includes('</button>') && i > idx_castData1) {
        idx_castData1_end = i;
    }
    
    // castData2 is the SECOND occurrence
    if (idx_castData1 !== -1 && idx_castData2 === -1 && lines[i].includes('setShowPreferencesModal(true)') && i > idx_castData1_end) {
        idx_castData2 = i;
    }
    if (idx_castData2 !== -1 && idx_castData2_end === -1 && lines[i].includes('</button>') && i > idx_castData2) {
        idx_castData2_end = i;
    }
    
    if (idx_status === -1 && lines[i].includes('<div className="flex gap-1 items-center">') && lines[i+1].includes('ステータス:')) {
        idx_status = i;
    }
    if (idx_status !== -1 && idx_status_end === -1 && lines[i].includes('</div>') && lines[i-1].includes('</span>') && i > idx_status) {
        idx_status_end = i;
    }
    
    if (idx_shifts === -1 && lines[i].includes("setActiveTab('shifts')")) {
        idx_shifts = i - 1; // <button
    }
    if (idx_shifts !== -1 && idx_shifts_end === -1 && lines[i].includes('</button>') && i > idx_shifts) {
        idx_shifts_end = i;
    }
    
    if (idx_reserve === -1 && lines[i].includes(') : (') && lines[i+1].includes('reserve/${id}')) {
        idx_reserve = i;
    }
    if (idx_reserve !== -1 && idx_reserve_end === -1 && lines[i].includes(')}') && i > idx_reserve) {
        idx_reserve_end = i;
    }
}

// Ensure all are found
if ([idx_isNonCastProfile, idx_castData1, idx_castData1_end, idx_castData2, idx_castData2_end, idx_status, idx_status_end, idx_shifts, idx_shifts_end, idx_reserve, idx_reserve_end].includes(-1)) {
    console.log('Failed to find all targets!');
    console.log({idx_isNonCastProfile, idx_castData1, idx_castData1_end, idx_castData2, idx_castData2_end, idx_status, idx_status_end, idx_shifts, idx_shifts_end, idx_reserve, idx_reserve_end});
    process.exit(1);
}

// splice from BOTTOM to TOP to avoid shifting indices

// Reserve
lines[idx_reserve] = '          ) : !isNonCastProfile ? (';
lines[idx_reserve_end] = '          ) : null}';

// Shifts
lines.splice(idx_shifts_end + 1, 0, '          )}');
lines.splice(idx_shifts, 0, '          {!isNonCastProfile && (');

// Status
lines.splice(idx_status_end + 1, 0, '            )}');
lines.splice(idx_status, 0, '            {!isNonCastProfile && (');

// CastData 2
lines.splice(idx_castData2_end + 1, 0, '                    )}');
lines.splice(idx_castData2, 0, '                    {!isNonCastProfile && (');

// CastData 1
lines.splice(idx_castData1_end + 1, 0, '                    )}');
lines.splice(idx_castData1, 0, '                    {!isNonCastProfile && (');

// isNonCastProfile
lines.splice(idx_isNonCastProfile, 0, "  const isNonCastProfile = profileData.role === 'system' || profileData.role === 'store' || profileData.isAdmin || (profileData.name && (profileData.name.toLowerCase().includes('system') || profileData.name.includes('運営')));", "");

fs.writeFileSync('src/app/cast/[id]/page.tsx', lines.join('\n'), 'utf8');
console.log('Safe patch completed successfully');
