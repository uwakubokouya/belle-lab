const fs = require('fs');
let content = fs.readFileSync('src/app/admin/analytics/page.tsx', 'utf-8');

const targetStr = `                    if (storeCastIds.length > 0) {
                        query = query.in('target_id', storeCastIds);
                    } else {
                        query = query.eq('target_id', 'none');
                    }`;

const replaceStr = `                    if (storeCastIds.length > 0) {
                        query = query.in('target_id', storeCastIds);
                    } else {
                        query = query.eq('target_id', '00000000-0000-0000-0000-000000000000');
                    }`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replaceStr);
    
    // エラーログをもっと詳細に出すように変更
    const targetLog = `console.error("Fetch analytics error:", e);`;
    const replaceLog = `console.error("Fetch analytics error:", JSON.stringify(e, null, 2), e);`;
    content = content.replace(targetLog, replaceLog);
    
    fs.writeFileSync('src/app/admin/analytics/page.tsx', content);
    console.log("Analytics page query fixed.");
} else {
    console.log("Target string not found.");
}
