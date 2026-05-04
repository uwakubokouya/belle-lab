const fs = require('fs');
let lines = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8').split(/\r?\n/);

// 1. Add role and isAdmin to ProfileData interface
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('  interface ProfileData {')) {
        let j = i;
        while (!lines[j].includes('  }')) j++;
        // Insert before closing brace
        if (!lines[j-1].includes('role?: string')) {
            lines.splice(j, 0, "    role?: string;", "    isAdmin?: boolean;");
        }
        break;
    }
}

// 2. Add role, is_admin to select queries
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(".select('id, name, avatar_url, accepts_dms, phone')")) {
        lines[i] = lines[i].replace(".select('id, name, avatar_url, accepts_dms, phone')", ".select('id, name, avatar_url, accepts_dms, phone, role, is_admin')");
    }
}

// 3. Add role, isAdmin to setProfileData
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('image: storeCast?.image_url || profile?.avatar_url || "",') && lines[i+1].includes('cover:')) {
        if (!lines[i+2].includes('role: profile?.role')) {
            lines.splice(i+2, 0, "           role: profile?.role,", "           isAdmin: profile?.is_admin,");
        }
    }
}

// 4. Re-add profileData.role logic to isNonCastProfile
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const isNonCastProfile =')) {
        lines[i] = "  const isNonCastProfile = profileData.role === 'system' || profileData.role === 'store' || profileData.isAdmin || (profileData.name && (profileData.name.toLowerCase().includes('system') || profileData.name.includes('運営')));";
        break;
    }
}

fs.writeFileSync('src/app/cast/[id]/page.tsx', lines.join('\n'), 'utf8');
console.log('Done');
