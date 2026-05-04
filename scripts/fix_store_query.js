const fs = require('fs');

let lines = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8').split(/\r?\n/);

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("await supabase.from('profiles').select('username, full_name').eq('store_id', storeCast.store_id).maybeSingle();")) {
        lines[i] = lines[i].replace(".maybeSingle()", ".eq('role', 'admin').maybeSingle()");
        console.log("Added .eq('role', 'admin') at line", i + 1);
        break;
    }
}

fs.writeFileSync('src/app/cast/[id]/page.tsx', lines.join('\n'), 'utf8');
console.log('Done fix profiles query');
