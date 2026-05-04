const fs = require('fs');

let content = fs.readFileSync('src/app/admin/analytics/page.tsx', 'utf8');

const target = `                        {/* Daily List - Show for all tabs to see total trend */}
                        {(activeTab === 'cast' || activeTab === 'home') && (
                            <div className="bg-white border border-[#E5E5E5]">
                                <div className="p-4 border-b border-[#E5E5E5] bg-[#F9F9F9]">
                                    <h3 className="text-xs font-bold tracking-widest flex items-center gap-2">`;
const replace = `                        {/* Daily List - Show for home tab only */}
                        {activeTab === 'home' && (
                            <div className="bg-white border border-[#E5E5E5]">
                                <div className="p-4 border-b border-[#E5E5E5] bg-[#F9F9F9]">
                                    <h3 className="text-xs font-bold tracking-widest flex items-center gap-2">`;

if (content.includes(target)) {
    content = content.replace(target, replace);
    console.log("Updated daily list visibility.");
} else {
    // try fallback
    const fallbackTarget = `{(activeTab === 'cast' || activeTab === 'home') && (\n                            <div className="bg-white border border-[#E5E5E5]">\n                                <div className="p-4 border-b border-[#E5E5E5] bg-[#F9F9F9]">\n                                    <h3 className="text-xs font-bold tracking-widest flex items-center gap-2">\n                                        <BarChart2 size={14} className="stroke-[2]" />\n                                        日別アクセス数\n                                    </h3>`;
    const fallbackReplace = `{activeTab === 'home' && (\n                            <div className="bg-white border border-[#E5E5E5]">\n                                <div className="p-4 border-b border-[#E5E5E5] bg-[#F9F9F9]">\n                                    <h3 className="text-xs font-bold tracking-widest flex items-center gap-2">\n                                        <BarChart2 size={14} className="stroke-[2]" />\n                                        日別アクセス数\n                                    </h3>`;
    if (content.includes(fallbackTarget)) {
        content = content.replace(fallbackTarget, fallbackReplace);
        console.log("Updated daily list visibility (fallback).");
    } else {
        console.log("Could not find daily list target. Let's try line by line.");
        let lines = content.split(/\r?\n/);
        let changed = false;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes("{(activeTab === 'cast' || activeTab === 'home') && (") && lines[i-1] && lines[i-1].includes('Daily List')) {
                lines[i] = lines[i].replace("{(activeTab === 'cast' || activeTab === 'home') && (", "{activeTab === 'home' && (");
                console.log("Updated daily list at line", i+1);
                changed = true;
                break;
            }
        }
        if (changed) {
            content = lines.join('\n');
        } else {
            console.log("Failed completely");
        }
    }
}

fs.writeFileSync('src/app/admin/analytics/page.tsx', content, 'utf8');
console.log('Done modifying analytics page');
