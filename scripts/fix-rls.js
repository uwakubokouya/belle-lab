const fs = require('fs');

let content = fs.readFileSync('src/app/[prefecture]/page.tsx', 'utf8');

// Part 1: Fix workingCastLoginIds generation
const fetchShiftsRegex = /const \{ data: todayShifts \} = await supabase\s*\.from\('shifts'\)\s*\.select\('cast_id, attendance_status'\)\s*\.eq\('date', todayStr\);\s*let workingCastIds = new Set\(\);\s*if \(todayShifts\) \{\s*todayShifts\.forEach\(s => \{\s*if \(s\.attendance_status !== 'absent'\) workingCastIds\.add\(s\.cast_id\);\s*\}\);\s*\}/m;

const newFetchShifts = `let availabilityData: any[] = [];
        const storesToFetch = user?.role === 'store' && myStoreLoginIds.length > 0 
            ? storeProfiles.filter(p => p.username === user.phone).map(p => p.store_id)
            : storeIds;
            
        await Promise.all(storesToFetch.map(async (sid) => {
            if (!sid) return;
            const { data } = await supabase.rpc('get_public_availability', { p_store_id: sid, p_date: todayStr });
            if (data) availabilityData = availabilityData.concat(data);
        }));

        let workingCastIds = new Set();
        availabilityData.forEach(row => {
            if (row.attendance_status !== 'absent') workingCastIds.add(row.cast_id);
        });`;

content = content.replace(fetchShiftsRegex, newFetchShifts);

// Part 2: Fix availabilityMap generation
const availabilityMapRegex = /let shiftsData: any\[\] = \[\];\s*let salesData: any\[\] = \[\];\s*if \(castIdsForPosts\.length > 0\) \{\s*const \{ data: sData \} = await supabase\.from\('shifts'\)\.select\('\*'\)\.eq\('date', todayStr\)\.in\('cast_id', castIdsForPosts\);\s*if \(sData\) shiftsData = sData;\s*const \{ data: saData \} = await supabase\.from\('sales'\)\.select\('\*'\)\.eq\('date', todayStr\)\.in\('cast_id', castIdsForPosts\)\.neq\('status', 'cancelled'\);\s*if \(saData\) salesData = saData;\s*\}\s*const availabilityMap = new Map\(\);\s*castsForPosts\.forEach\(\(c: any\) => \{\s*const shift = shiftsData\.find\(\(s: any\) => s\.cast_id === c\.id\);\s*if \(shift\) \{\s*const bookings = salesData\.filter\(\(sa: any\) => sa\.cast_id === c\.id\)\.map\(\(sa: any\) => \(\{ start: sa\.start_time, end: sa\.end_time \}\)\);\s*availabilityMap\.set\(c\.id, \{\s*shift_start: shift\.start_time,\s*shift_end: shift\.end_time,\s*attendance_status: shift\.attendance_status,\s*next_shift_date: null,\s*bookings\s*\}\);\s*\}\s*\}\);/m;

const newAvailabilityMap = `const storeIdsForPosts = [...new Set(castsForPosts.map((c: any) => c.store_id).filter(Boolean))];
       let availabilityDataForPosts: any[] = [];
       await Promise.all(storeIdsForPosts.map(async (sid) => {
           if (!sid) return;
           const { data } = await supabase.rpc('get_public_availability', { p_store_id: sid, p_date: todayStr });
           if (data) availabilityDataForPosts = availabilityDataForPosts.concat(data);
       }));

       const availabilityMap = new Map();
       availabilityDataForPosts.forEach((row: any) => {
           if (!availabilityMap.has(row.cast_id)) {
               availabilityMap.set(row.cast_id, {
                   shift_start: row.shift_start,
                   shift_end: row.shift_end,
                   attendance_status: row.attendance_status,
                   next_shift_date: row.next_shift_date,
                   bookings: []
               });
           }
           if (row.booked_start) {
               availabilityMap.get(row.cast_id).bookings.push({ start: row.booked_start, end: row.booked_end });
           }
       });`;

content = content.replace(availabilityMapRegex, newAvailabilityMap);

fs.writeFileSync('src/app/[prefecture]/page.tsx', content);
console.log('Replaced RLS direct queries with get_public_availability RPC.');
