const fs = require('fs');
const path = require('path');
const dir = 'supabase/migrations';
const files = fs.readdirSync(dir);
files.forEach(file => {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    if (content.includes('sns_profiles') && content.includes('CREATE POLICY')) {
        console.log('--- ' + file + ' ---');
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].toLowerCase().includes('create policy') && lines[i].includes('sns_profiles')) {
                console.log(lines.slice(Math.max(0, i-2), Math.min(lines.length, i+15)).join('\n'));
            }
        }
    }
});
