const fs = require('fs');

let content = fs.readFileSync('src/app/[prefecture]/page.tsx', 'utf-8');

if (!content.includes('import AdminHomeContent')) {
  content = content.replace(
    'import PostCard from "@/components/feed/PostCard";',
    'import PostCard from "@/components/feed/PostCard";\nimport AdminHomeContent from "@/components/admin/AdminHomeContent";'
  );
}

content = content.replace(
  "const [activeTab, setActiveTab] = useState<'official' | 'following' | 'recommended' | 'working'>('official');",
  "const [activeTab, setActiveTab] = useState<string>('official');\n  useEffect(() => { if (user?.is_admin && ['official', 'following', 'recommended', 'working'].includes(activeTab)) { setActiveTab('summary'); } }, [user, activeTab]);"
);

const oldTabsStr = `<button 
            onClick={() => setActiveTab('official')} `;
const newTabsStr = `{user?.is_admin ? (
            <>
              {[
                { id: 'summary', label: 'サマリー' },
                { id: 'users', label: '顧客管理' },
                { id: 'moderation', label: '監視' },
                { id: 'settings', label: '設定' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={\`flex-1 flex justify-center py-3 text-xs tracking-widest transition-colors border-r border-[#E5E5E5] relative \${activeTab === tab.id ? 'font-bold text-black bg-[#F9F9F9]' : 'text-[#777777] hover:bg-[#F9F9F9]'}\`}
                >
                  {tab.label}
                  {activeTab === tab.id && <div className="absolute top-0 w-full h-[1px] bg-black"></div>}
                </button>
              ))}
            </>
          ) : (
            <>
              <button 
                onClick={() => setActiveTab('official')} `;

content = content.replace(oldTabsStr, newTabsStr);

// Close the React Fragment for tabs
const tabsCloseStr = `</button>
        </div>
      </header>`;
const newTabsCloseStr = `</button>
            </>
          )}
        </div>
      </header>`;
content = content.replace(tabsCloseStr, newTabsCloseStr);

// Feed List replace
const oldFeedStr = `<div className="pb-20">
          {isLoading ? (`;
const newFeedStr = `{user?.is_admin ? (
          <AdminHomeContent activeTab={activeTab} />
        ) : (
          <div className="pb-20">
            {isLoading ? (`;

content = content.replace(oldFeedStr, newFeedStr);

const feedCloseStr = `</div>
      
      {/* Loader Mock */}`;
const newFeedCloseStr = `</div>
        )}
      
      {/* Loader Mock */}`;
content = content.replace(feedCloseStr, newFeedCloseStr);

fs.writeFileSync('src/app/[prefecture]/page.tsx', content, 'utf-8');
console.log('src/app/[prefecture]/page.tsx updated.');
