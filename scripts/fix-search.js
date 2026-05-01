const fs = require('fs');
let f = fs.readFileSync('src/app/[prefecture]/page.tsx', 'utf8');

f = f.replace(
  /if \(adjCurrentMin >= eMin\) \{\s*statusText = "受付終了";\s*nextAvailableTime = "次回出勤: 未定";\s*\}/g,
  `if (adjCurrentMin >= eMin) {
                        statusText = "受付終了";
                        if (avail.next_shift_date) {
                            const dt = new Date(avail.next_shift_date);
                            nextAvailableTime = \`次回出勤: \${dt.getMonth() + 1}/\${dt.getDate()}\`;
                        } else {
                            nextAvailableTime = "次回出勤: 未定";
                        }
                    }`
);

f = f.replace(
  /if \(am >= seM\) \{ statusText = "受付終了"; \} else \{ statusText = "ご予約完売"; \}\s*nextAvailableTime = "次回出勤: 未定";/g,
  `if (am >= seM) { statusText = "受付終了"; } else { statusText = "ご予約完売"; }
                        if (avail.next_shift_date) {
                            const dt = new Date(avail.next_shift_date);
                            nextAvailableTime = \`次回出勤: \${dt.getMonth() + 1}/\${dt.getDate()}\`;
                        } else {
                            nextAvailableTime = "次回出勤: 未定";
                        }`
);

fs.writeFileSync('src/app/[prefecture]/page.tsx', f);
console.log('Fixed');
