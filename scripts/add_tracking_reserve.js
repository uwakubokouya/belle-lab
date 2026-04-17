const fs = require('fs');

let c = fs.readFileSync('src/app/cast/[id]/page.tsx', 'utf-8');

const target = `          ) : (
            <Link href={\`/reserve/\${id}\`} className="premium-btn w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest">
               <Calendar size={18} className="stroke-[1.5]" />
               このキャストを予約する
            </Link>
          )}`;

const replacement = `          ) : (
            <Link 
              href={\`/reserve/\${id}\`} 
              className="premium-btn w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest"
              onClick={() => {
                if (!id) return;
                const TRACK_KEY = \`last_reserve_click_\${id}\`;
                const lastTracked = sessionStorage.getItem(TRACK_KEY);
                const now = Date.now();
                if (!lastTracked || now - parseInt(lastTracked) > 600000) {
                  sessionStorage.setItem(TRACK_KEY, now.toString());
                  try {
                      const sessionObj = localStorage.getItem('anon_session_id');
                      supabase.from('page_views').insert({
                          page_type: 'reserve_click',
                          target_id: id,
                          viewer_id: user?.id || null,
                          session_id: sessionObj
                      }).then(() => {});
                  } catch(e) {}
                }
              }}
            >
               <Calendar size={18} className="stroke-[1.5]" />
               このキャストを予約する
            </Link>
          )}`;

let newC = c.split(target).join(replacement);
if (newC === c) {
    newC = c.split(target.replace(/\n/g, '\r\n')).join(replacement.replace(/\n/g, '\r\n'));
}

fs.writeFileSync('src/app/cast/[id]/page.tsx', newC);
console.log('reserve button tracking added');
