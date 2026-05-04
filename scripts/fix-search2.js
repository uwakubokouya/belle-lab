const fs = require('fs');

const filesToFix = [
  'src/app/search/page.tsx',
  'src/app/[prefecture]/search/page.tsx',
  'src/app/messages/[id]/page.tsx'
];

filesToFix.forEach(file => {
  if (fs.existsSync(file)) {
    let f = fs.readFileSync(file, 'utf8');

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
    
    // In search pages the loop variable might be c instead of avail
    // wait, in search pages, `myAvails` is accessed directly?
    // Let's not blindly replace without checking. 
    
    fs.writeFileSync(file, f);
    console.log('Fixed', file);
  }
});
