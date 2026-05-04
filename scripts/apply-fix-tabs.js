const fs = require('fs');

let c = fs.readFileSync('src/app/[prefecture]/page.tsx', 'utf8');
let fixScript = fs.readFileSync('scripts/fix-home-tabs.js', 'utf8');

let newFetchSplit = fixScript.split('const newFetchPosts = `');
if (newFetchSplit.length > 1) {
    let newFetch = newFetchSplit[1].split('`;')[0];
    
    let startIdx = c.indexOf('const fetchPosts = async');
    let endIdx = c.indexOf('  useEffect(() => {\n    if (isUserLoading) return;');
    
    if(startIdx !== -1 && endIdx !== -1) { 
        c = c.slice(0, startIdx) + newFetch + '\n\n' + c.slice(endIdx); 
        fs.writeFileSync('src/app/[prefecture]/page.tsx', c); 
        console.log('Replaced fetchPosts successfully'); 
    } else { 
        console.log('Could not find start or end index', startIdx, endIdx); 
    }
} else {
    console.log('Could not find newFetchPosts string in fix-home-tabs.js');
}

// Also replace the filtered posts part
const filteredPostsStr = `  // フィルタリング
  const getFilteredPosts = () => {`;
const filteredEndStr = `  };

  const activePosts = getFilteredPosts();`;

let filterStartIdx = c.indexOf(filteredPostsStr);
let filterEndIdx = c.indexOf(filteredEndStr);
if (filterStartIdx !== -1 && filterEndIdx !== -1) {
    let newFilterStr = `  // フィルタリングはサーバー側（fetchPosts）で完了しているためそのまま返す\n  const activePosts = posts || [];`;
    c = c.slice(0, filterStartIdx) + newFilterStr + c.slice(filterEndIdx + filteredEndStr.length);
    fs.writeFileSync('src/app/[prefecture]/page.tsx', c); 
    console.log('Replaced filteredPosts successfully');
}
