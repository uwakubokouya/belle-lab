const fs = require('fs');
const path = require('path');
const dir = 'C:\\Users\\guang\\OneDrive\\Desktop\\アンチ\\supabase\\migrations';
const files = fs.readdirSync(dir);
files.forEach(file => {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    if (content.toLowerCase().includes('sns_profiles') && content.toLowerCase().includes('policy')) {
        console.log('--- ' + file + ' ---');
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].toLowerCase().includes('policy') && lines[i].toLowerCase().includes('sns_profiles')) {
                console.log(lines.slice(Math.max(0, i-2), Math.min(lines.length, i+15)).join('\n'));
            }
        }
    }
});
