const fs = require('fs');

let lines = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf8').split(/\r?\n/);

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("await supabase.from('store_profiles')")) {
        lines[i] = lines[i].replace("'store_profiles'", "'profiles'");
        console.log("Replaced 'store_profiles' with 'profiles' at line", i + 1);
        break;
    }
}

fs.writeFileSync('src/app/cast/[id]/page.tsx', lines.join('\n'), 'utf8');
console.log('Done fix profiles table name');
