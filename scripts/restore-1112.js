const fs = require('fs');

let c = fs.readFileSync('src/app/[prefecture]/page.tsx', 'utf8');

// 1. update_prefecture_page.js logic
if (!c.includes('import AdminHomeContent')) {
  c = c.replace(
    'import PostCard from "@/components/feed/PostCard";',
    'import PostCard from "@/components/feed/PostCard";\nimport AdminHomeContent from "@/components/admin/AdminHomeContent";'
  );
}

c = c.replace(
  "const [activeTab, setActiveTab] = useState<'official' | 'following' | 'recommended' | 'working'>('official');",
  "const [activeTab, setActiveTab] = useState<string>('official');\n  useEffect(() => { if (user?.is_admin && ['official', 'following', 'recommended', 'working'].includes(activeTab)) { setActiveTab('summary'); } }, [user, activeTab]);"
);

const oldTabsStr = `<button \n            onClick={() => setActiveTab('official')} `;
const newTabsStr = `{user?.is_admin && user?.role !== 'store' ? (\n            <>\n              {[\n                { id: 'summary', label: 'サマリー' },\n                { id: 'users', label: '顧客管理' },\n                { id: 'moderation', label: '監視' },\n                { id: 'settings', label: '設定' }\n              ].map((tab) => (\n                <button\n                  key={tab.id}\n                  onClick={() => setActiveTab(tab.id)}\n                  className={\`flex-1 flex justify-center py-3 text-xs tracking-widest transition-colors border-r border-[#E5E5E5] relative \${activeTab === tab.id ? 'font-bold text-black bg-[#F9F9F9]' : 'text-[#777777] hover:bg-[#F9F9F9]'}\`}\n                >\n                  {tab.label}\n                  {activeTab === tab.id && <div className="absolute top-0 w-full h-[1px] bg-black"></div>}\n                </button>\n              ))}\n            </>\n          ) : (\n            <>\n              <button \n                onClick={() => setActiveTab('official')} `;
c = c.replace(oldTabsStr, newTabsStr);

const tabsCloseStr = `</button>\n        </div>\n      </header>`;
const newTabsCloseStr = `</button>\n            </>\n          )}\n        </div>\n      </header>`;
c = c.replace(tabsCloseStr, newTabsCloseStr);

const oldFeedStr = `<div className="pb-20">\n          {isLoading ? (`;
const newFeedStr = `{user?.is_admin && user?.role !== 'store' ? (\n        <AdminHomeContent activeTab={activeTab} />\n      ) : (\n        <div className="pb-20">\n          {isLoading ? (`;
c = c.replace(oldFeedStr, newFeedStr);

const feedCloseStr = `</div>\n      \n      {/* Loader Mock */}`;
const newFeedCloseStr = `</div>\n      )}\n      \n      {/* Loader Mock */}`;
c = c.replace(feedCloseStr, newFeedCloseStr);


// 2. fix-home-tabs.js logic
let fixHomeTabs = fs.readFileSync('scripts/fix-home-tabs.js', 'utf8');
let newFetchMatch = fixHomeTabs.split('const newFetchPosts = `');
if (newFetchMatch.length > 1) {
  let newFetchPosts = newFetchMatch[1].split('`;\n\nconst filteredPostsRegex')[0];
  
  // replace fetchPosts
  let startIdx = c.indexOf('  const fetchPosts = async');
  let endIdx = c.indexOf('  useEffect(() => {\n    if (isUserLoading) return;');
  if (startIdx !== -1 && endIdx !== -1) {
    c = c.slice(0, startIdx) + newFetchPosts + '\n\n' + c.slice(endIdx);
  }
}

// replace filter logic
let filterStart = c.indexOf('  // フィルタリング\n  const getFilteredPosts = () => {');
let filterEndStr = '  const activePosts = getFilteredPosts();';
let filterEndIdx = c.indexOf(filterEndStr);
if (filterStart !== -1 && filterEndIdx !== -1) {
  c = c.slice(0, filterStart) + '  // フィルタリングはサーバー側（fetchPosts）で完了しているためそのまま返す\n  const activePosts = posts || [];' + c.slice(filterEndIdx + filterEndStr.length);
}

fs.writeFileSync('src/app/[prefecture]/page.tsx', c);
console.log('Restored to 11:12 state successfully!');
