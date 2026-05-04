const fs = require('fs');
const path = require('path');

const historyDir = path.join(process.env.APPDATA, 'Code', 'User', 'History');

function searchHistory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            searchHistory(fullPath);
        } else if (stat.isFile()) {
            const timeDiff = Date.now() - stat.mtimeMs;
            const hoursDiff = timeDiff / (1000 * 60 * 60);
            if (hoursDiff < 6 && stat.size > 70000 && stat.size < 85000) {
                console.log(fullPath, stat.size, stat.mtime);
            }
        }
    }
}

searchHistory(historyDir);
