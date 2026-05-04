const fs = require('fs');
let content = fs.readFileSync('src/app/admin/analytics/page.tsx', 'utf-8');

// 1. Fetch casts logic replace
const targetFetchCasts = `    // Fetch casts for dropdown
    useEffect(() => {
        const fetchCasts = async () => {
            const { data } = await supabase.from('sns_profiles').select('id, name').eq('role', 'cast');
            if (data) {
                setCasts(data);
            }
        };
        fetchCasts();
    }, []);`;

const replaceFetchCasts = `    // Fetch user context and target casts
    const [storeCastIds, setStoreCastIds] = useState<string[]>([]);
    
    useEffect(() => {
        if (!user || (!user.is_admin && user.role !== 'store')) return;

        const initContext = async () => {
            if (user.role === 'store') {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('store_id, id')
                    .eq('username', user.phone)
                    .maybeSingle();

                if (profileData && profileData.store_id) {
                    const { data: castsData } = await supabase
                        .from('casts')
                        .select('login_id')
                        .eq('store_id', profileData.store_id);
                    
                    const loginIds = castsData?.map(c => c.login_id).filter(Boolean) || [];

                    let query = supabase.from('sns_profiles').select('id, name').in('role', ['cast', 'store']);
                    let orFilters = [\`id.eq.\${user.id}\`];
                    if (loginIds.length > 0) {
                        orFilters.push(\`phone.in.(\${loginIds.join(',')})\`);
                    }
                    query = query.or(orFilters.join(','));
                    
                    const { data: snsCasts } = await query;
                    if (snsCasts) {
                        setCasts(snsCasts);
                        setStoreCastIds(snsCasts.map(c => c.id));
                    }
                }
            } else {
                const { data } = await supabase.from('sns_profiles').select('id, name').eq('role', 'cast');
                if (data) setCasts(data);
            }
        };
        initContext();
    }, [user]);`;

content = content.replace(targetFetchCasts, replaceFetchCasts);

// 2. Auth redirect fix (allow store)
const targetAuth = `            } else if (!user.is_admin) {`;
const replaceAuth = `            } else if (!user.is_admin && user.role !== 'store') {`;
content = content.replace(targetAuth, replaceAuth);

// 3. fetchData deps fix
const targetFetchDataCondition = `    // Fetch analytics data
    useEffect(() => {
        if (!user?.is_admin) return;`;
const replaceFetchDataCondition = `    // Fetch analytics data
    useEffect(() => {
        if (!user || (!user.is_admin && user.role !== 'store')) return;`;
content = content.replace(targetFetchDataCondition, replaceFetchDataCondition);

// 4. Query logic fix
const targetQuery = `                let query = supabase
                    .from('page_views')
                    .select('created_at, target_id, page_type')
                    .in('page_type', activeTab === 'home' ? ['home', 'reserve_click'] : ['cast_profile', 'reserve_click'])
                    .gte('created_at', startDate.toISOString())
                    .lte('created_at', endDate.toISOString());`;
const replaceQuery = `                let query = supabase
                    .from('page_views')
                    .select('created_at, target_id, page_type')
                    .gte('created_at', startDate.toISOString())
                    .lte('created_at', endDate.toISOString());

                if (user?.role === 'store') {
                    if (storeCastIds.length > 0) {
                        query = query.in('target_id', storeCastIds);
                    } else {
                        query = query.eq('target_id', 'none');
                    }
                    query = query.in('page_type', ['cast_profile', 'reserve_click']);
                } else {
                    query = query.in('page_type', activeTab === 'home' ? ['home', 'reserve_click'] : ['cast_profile', 'reserve_click']);
                }`;
content = content.replace(targetQuery, replaceQuery);

// Add dependencies to useEffect
const targetDeps = `    }, [selectedDate, activeTab, user]);`;
const replaceDeps = `    }, [selectedDate, activeTab, user, storeCastIds]);`;
content = content.replace(targetDeps, replaceDeps);

// 5. initial loading guard
const targetGuard = `    if (isLoading || !user?.is_admin) {`;
const replaceGuard = `    if (isLoading || (!user?.is_admin && user?.role !== 'store')) {`;
content = content.replace(targetGuard, replaceGuard);

// 6. Tabs rendering fix (Hide 'users' tab for store)
const targetTabs = `                    <button 
                        onClick={() => setActiveTab('users')}
                        className={\`flex-1 py-3 border-l border-black text-xs tracking-widest uppercase transition-colors \${activeTab === 'users' ? 'bg-black text-white font-medium' : 'bg-white text-black hover:bg-[#F9F9F9]'}\`}
                    >
                        会員推移
                    </button>`;
const replaceTabs = `                    {user?.role !== 'store' && (
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={\`flex-1 py-3 border-l border-black text-xs tracking-widest uppercase transition-colors \${activeTab === 'users' ? 'bg-black text-white font-medium' : 'bg-white text-black hover:bg-[#F9F9F9]'}\`}
                    >
                        会員推移
                    </button>
                    )}`;
content = content.replace(targetTabs, replaceTabs);

fs.writeFileSync('src/app/admin/analytics/page.tsx', content);
console.log("Analytics page successfully patched.");
