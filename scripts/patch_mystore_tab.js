const fs = require('fs');
let content = fs.readFileSync('src/app/[prefecture]/page.tsx', 'utf-8');

// 1. myStoreLoginIds のロジックを追加
const targetFetchCasts = `    // 2. 該当店舗に所属するキャストのログインIDを取得
    const { data: activeCasts } = await supabase
      .from('casts')
      .select('login_id')
      .in('store_id', storeIds)
      .eq('status', 'active');
      
    const loginIds = activeCasts ? activeCasts.map(c => c.login_id).filter(Boolean) : [];`;

const replaceFetchCasts = `    // 2. 該当店舗に所属するキャストのログインIDを取得
    const { data: activeCasts } = await supabase
      .from('casts')
      .select('login_id, store_id')
      .in('store_id', storeIds)
      .eq('status', 'active');
      
    const loginIds = activeCasts ? activeCasts.map(c => c.login_id).filter(Boolean) : [];

    let myStoreLoginIds: string[] = [];
    if (user?.role === 'store' && user.phone) {
        const myProfile = storeProfiles.find(p => p.username === user.phone);
        if (myProfile && myProfile.store_id && activeCasts) {
            myStoreLoginIds = activeCasts
                .filter(c => c.store_id === myProfile.store_id)
                .map(c => c.login_id)
                .filter(Boolean);
        }
    }`;

content = content.replace(targetFetchCasts, replaceFetchCasts);

// 2. isMyStoreCast フラグを追加
const targetMapPost = `        const mappedPosts = postsData.map((post: any) => {
            const isFollowing = user?.id === post.cast_id || followingIds.has(post.cast_id);
            
            const matchedStoreCast = castsData?.find(c => c.login_id === post.sns_profiles?.phone);`;

const replaceMapPost = `        const mappedPosts = postsData.map((post: any) => {
            const isFollowing = user?.id === post.cast_id || followingIds.has(post.cast_id);
            const isMyStoreCast = user?.role === 'store' && myStoreLoginIds.includes(post.sns_profiles?.phone);
            
            const matchedStoreCast = castsData?.find(c => c.login_id === post.sns_profiles?.phone);`;

content = content.replace(targetMapPost, replaceMapPost);

// mappedPosts return の中に追加
const targetReturn = `                isStore,
                storeName: isStore ? (post.sns_profiles?.name || "公式") : (adminProfile?.name || "公式"),
                storeProfileId: isStore ? post.cast_id : adminProfile?.id
            };`;

const replaceReturn = `                isStore,
                isMyStoreCast,
                storeName: isStore ? (post.sns_profiles?.name || "公式") : (adminProfile?.name || "公式"),
                storeProfileId: isStore ? post.cast_id : adminProfile?.id
            };`;

content = content.replace(targetReturn, replaceReturn);

// 3. getFilteredPosts の修正
const targetFilter = `    if (activeTab === 'following') {
        if (!user) return [];
        return posts.filter(p => p.isFollowing && !p.isStore);
    }`;

const replaceFilter = `    if (activeTab === 'following') {
        if (!user) return [];
        if (user.role === 'store') {
            return posts.filter(p => p.isMyStoreCast);
        }
        return posts.filter(p => p.isFollowing && !p.isStore);
    }`;

content = content.replace(targetFilter, replaceFilter);

fs.writeFileSync('src/app/[prefecture]/page.tsx', content);
console.log("Timeline logic patched successfully.");
