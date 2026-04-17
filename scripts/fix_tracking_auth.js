const fs = require('fs');

// 1. fix page.tsx tracking
let c1 = fs.readFileSync('src/app/page.tsx', 'utf-8');
const t1 = `      const now = Date.now();
      
      // Track once per hour per session`;
const r1 = `      const now = Date.now();
      
      if (user?.role === 'cast' || user?.is_admin) return;
      
      // Track once per hour per session`;
c1 = c1.split(t1).join(r1);
if(c1 === fs.readFileSync('src/app/page.tsx', 'utf-8')) {
    c1 = c1.split(t1.replace(/\n/g, '\r\n')).join(r1.replace(/\n/g, '\r\n'));
}
fs.writeFileSync('src/app/page.tsx', c1);


// 2. fix cast page tracking (page load pv)
let c2 = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf-8');
const t2 = `      if (!id) return;
      const TRACK_KEY = \`last_pv_cast_\${id}\`;
      const lastTracked = sessionStorage.getItem(TRACK_KEY);`;
const r2 = `      if (!id) return;
      if (user?.role === 'cast' || user?.is_admin) return;
      const TRACK_KEY = \`last_pv_cast_\${id}\`;
      const lastTracked = sessionStorage.getItem(TRACK_KEY);`;
let newC2 = c2.split(t2).join(r2);
if(newC2 === c2) {
    newC2 = c2.split(t2.replace(/\n/g, '\r\n')).join(r2.replace(/\n/g, '\r\n'));
}
c2 = newC2;

// 3. fix cast page tracking (reserve button)
const t3 = `                if (!id) return;
                const TRACK_KEY = \`last_reserve_click_\${id}\`;
                const lastTracked = sessionStorage.getItem(TRACK_KEY);`;
const r3 = `                if (!id) return;
                if (user?.role === 'cast' || user?.is_admin) return;
                const TRACK_KEY = \`last_reserve_click_\${id}\`;
                const lastTracked = sessionStorage.getItem(TRACK_KEY);`;
newC2 = c2.split(t3).join(r3);
if(newC2 === c2) {
    newC2 = c2.split(t3.replace(/\n/g, '\r\n')).join(r3.replace(/\n/g, '\r\n'));
}
fs.writeFileSync('src/app/cast/[id]/page.tsx', newC2);

console.log('tracking excludes cast/admin');
