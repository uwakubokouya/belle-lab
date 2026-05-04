const fs = require('fs');

let lines = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8').split(/\r?\n/);

// Reserve Button
// 1149:           ) : (
// 1154:           )}
lines[1154] = '          ) : null}';
lines[1149] = '          ) : !isNonCastProfile ? (';

// Shifts Tab
// 1045:           <button 
// 1051:           </button>
lines.splice(1052, 0, '          )}');
lines.splice(1045, 0, '          {!isNonCastProfile && (');

// Status
// 1011:             <div className="flex gap-1 items-center">
// 1025:             </div>
lines.splice(1026, 0, '            )}');
lines.splice(1011, 0, '            {!isNonCastProfile && (');

// CastData 2
// 972:                     <button onClick={() => setShowPreferencesModal(true)} ...
// 975:                     </button>
lines.splice(976, 0, '                    )}');
lines.splice(972, 0, '                    {!isNonCastProfile && (');

// CastData 1
// 962:                     <button onClick={() => setShowPreferencesModal(true)} ...
// 965:                     </button>
lines.splice(966, 0, '                    )}');
lines.splice(962, 0, '                    {!isNonCastProfile && (');

// isNonCastProfile
// 665:   return (
lines.splice(665, 0, "  const isNonCastProfile = profileData.role === 'system' || profileData.role === 'store' || profileData.isAdmin || (profileData.name && (profileData.name.toLowerCase().includes('system') || profileData.name.includes('運営')));", "");

fs.writeFileSync('src/app/cast/[id]/page.tsx', lines.join('\n'), 'utf8');
console.log('Safe patch completed successfully');
