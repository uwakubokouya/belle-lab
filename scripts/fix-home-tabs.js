const fs = require('fs');

let content = fs.readFileSync('src/app/[prefecture]/page.tsx', 'utf8');

// The goal is to:
// 1. Add activeTab to fetchPosts dependency.
// 2. Filter targetSnsIds based on activeTab on the server side to prevent infinite loop.
// 3. Remove the hardcoded store ID for availability check by fetching shifts/sales manually for the fetched casts.

const fetchPostsRegex = /const fetchPosts = async \([\s\S]*?\n  \};\n\n  useEffect\(\(\) => \{\n    if \(isUserLoading\) return;\n    setPage\(0\);\n    setHasMore\(true\);\n    fetchPosts\(0, false\);\n  \/\/ eslint-disable-next-line react-hooks\/exhaustive-deps\n  \}, \[isUserLoading, user\?\.id\]\);/m;

const newFetchPosts = `const fetchPosts = async (pageNum = 0, isLoadMore = false) => {
    if (isLoadMore) {
        setIsFetchingMore(true);
    } else {
        setIsLoading(true);
    }

    let storeProfilesQuery = supabase
      .from('profiles')
      .select('id, store_id, username, full_name')
      .eq('sns_enabled', true)
      .eq('role', 'admin');

    if (prefecture && prefecture !== '全国') {
      storeProfilesQuery = storeProfilesQuery.ilike('prefecture', \`\${prefecture}%\`);
    }

    const { data: storeProfiles } = await storeProfilesQuery;

    if (!storeProfiles || storeProfiles.length === 0) {
      setPosts([]);
      setIsLoading(false);
      return;
    }
    const storeIds = storeProfiles.map(p => p.store_id).filter(Boolean);
    const storeUsernames = storeProfiles.map(p => p.username).filter(Boolean);

    const { data: snsStoreProfiles } = await supabase
      .from('sns_profiles')
      .select('id, name, phone')
      .in('phone', storeUsernames);
      
    const { data: platformAdmins } = await supabase
      .from('sns_profiles')
      .select('id')
      .in('role', ['admin', 'system']);
    const platformAdminIds = platformAdmins ? platformAdmins.map(a => a.id) : [];

    const storeProfileMap = new Map();
    storeProfiles.forEach(p => {
        storeProfileMap.set(p.store_id, p);
    });

    const snsStoreMap = new Map();
    if (snsStoreProfiles) {
        snsStoreProfiles.forEach(p => {
            if (p.phone) snsStoreMap.set(p.phone, { id: p.id, name: p.name });
        });
    }
    
    const storeAccountIds = snsStoreProfiles ? snsStoreProfiles.map(p => p.id) : [];
    
    const { data: activeCasts } = await supabase
      .from('casts')
      .select('id, login_id, store_id')
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
    }

    let followingIds = new Set<string>();
    if (user?.id) {
        const { data: follows } = await supabase
            .from('sns_follows')
            .select('following_id')
            .eq('follower_id', user.id);
        if (follows) {
            follows.forEach(f => followingIds.add(f.following_id));
        }
    }

    const now = new Date();
    const businessEndTime = await fetchBusinessEndTime(supabase);
    const todayStr = getLogicalBusinessDate(now, businessEndTime.hour, businessEndTime.min);

    let workingCastLoginIds: string[] = [];
    if (activeTab === 'working') {
        const { data: todayShifts } = await supabase
            .from('shifts')
            .select('cast_id, attendance_status')
            .eq('date', todayStr);
        let workingCastIds = new Set();
        if (todayShifts) {
            todayShifts.forEach(s => {
                if (s.attendance_status !== 'absent') workingCastIds.add(s.cast_id);
            });
        }
        workingCastLoginIds = activeCasts
            ? activeCasts.filter(c => workingCastIds.has(c.id)).map(c => c.login_id).filter(Boolean)
            : [];
    }

    let query = supabase.from('sns_profiles').select('id, phone');
    let orFilters = [];
    if (loginIds.length > 0) {
        orFilters.push(\`phone.in.(\${loginIds.join(',')})\`);
    }
    
    if (storeAccountIds.length > 0) {
        orFilters.push(\`id.in.(\${storeAccountIds.join(',')})\`);
    }

    if (followingIds.size > 0) {
        orFilters.push(\`id.in.(\${Array.from(followingIds).join(',')})\`);
    }

    if (platformAdminIds.length > 0) {
        orFilters.push(\`id.in.(\${platformAdminIds.join(',')})\`);
    }

    let profilesData: any[] = [];
    if (orFilters.length > 0) {
        query = query.or(orFilters.join(','));
        const result = await query;
        profilesData = result.data || [];
    }

    let targetSnsIds: string[] = [];

    if (user?.role === 'store') {
        if (activeTab === 'official') {
            targetSnsIds = profilesData
                .filter(p => platformAdminIds.includes(p.id) || p.id === user.id)
                .map(p => p.id);
        } else if (activeTab === 'following') {
            targetSnsIds = profilesData
                .filter(p => p.phone && myStoreLoginIds.includes(p.phone))
                .map(p => p.id);
        } else if (activeTab === 'working') {
            targetSnsIds = profilesData
                .filter(p => p.phone && myStoreLoginIds.includes(p.phone) && workingCastLoginIds.includes(p.phone))
                .map(p => p.id);
        }
    } else {
        if (activeTab === 'official') {
            targetSnsIds = profilesData.filter(p => storeAccountIds.includes(p.id) || platformAdminIds.includes(p.id)).map(p => p.id);
        } else if (activeTab === 'following') {
            targetSnsIds = profilesData.filter(p => followingIds.has(p.id)).map(p => p.id);
        } else if (activeTab === 'working') {
            targetSnsIds = profilesData.filter(p => !storeAccountIds.includes(p.id) && !platformAdminIds.includes(p.id) && p.phone && workingCastLoginIds.includes(p.phone)).map(p => p.id);
        } else {
            targetSnsIds = profilesData.filter(p => !storeAccountIds.includes(p.id) && !platformAdminIds.includes(p.id)).map(p => p.id);
        }
    }

    if (targetSnsIds.length === 0) {
      if (!isLoadMore) setPosts([]);
      setIsLoading(false);
      setIsFetchingMore(false);
      setHasMore(false);
      return;
    }

    const from = pageNum * POSTS_PER_PAGE;
    const to = from + POSTS_PER_PAGE - 1;

    const { data: postsData } = await supabase
      .from('sns_posts')
      .select(\`
        id,
        content,
        images,
        created_at,
        cast_id,
        post_type,
        sns_profiles!cast_id!inner (
          name,
          avatar_url,
          phone,
          is_admin
        )
      \`)
      .in('cast_id', targetSnsIds)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (postsData) {
       const uniqueCastLogins = [...new Set(postsData.map((p: any) => p.sns_profiles?.phone).filter(Boolean))];
       const castsForPosts = activeCasts?.filter((c: any) => uniqueCastLogins.includes(c.login_id)) || [];
       const castIdsForPosts = castsForPosts.map((c: any) => c.id);

       let shiftsData: any[] = [];
       let salesData: any[] = [];
       
       if (castIdsForPosts.length > 0) {
           const { data: sData } = await supabase.from('shifts').select('*').eq('date', todayStr).in('cast_id', castIdsForPosts);
           if (sData) shiftsData = sData;
           const { data: saData } = await supabase.from('sales').select('*').eq('date', todayStr).in('cast_id', castIdsForPosts).neq('status', 'cancelled');
           if (saData) salesData = saData;
       }

       const availabilityMap = new Map();
       castsForPosts.forEach((c: any) => {
           const shift = shiftsData.find((s: any) => s.cast_id === c.id);
           if (shift) {
               const bookings = salesData.filter((sa: any) => sa.cast_id === c.id).map((sa: any) => ({ start: sa.start_time, end: sa.end_time }));
               availabilityMap.set(c.id, {
                   shift_start: shift.start_time,
                   shift_end: shift.end_time,
                   attendance_status: shift.attendance_status,
                   next_shift_date: null,
                   bookings
               });
           }
       });

       const { data: adminProfile } = await supabase.from('sns_profiles').select('id, name').eq('is_admin', true).limit(1).maybeSingle();

       const mappedPosts = postsData.map((post: any) => {
           const isFollowing = user?.id === post.cast_id || followingIds.has(post.cast_id);
           const isMyStoreCast = user?.role === 'store' && myStoreLoginIds.includes(post.sns_profiles?.phone);
           
           const matchedStoreCast = activeCasts?.find((c: any) => c.login_id === post.sns_profiles?.phone);
           let isWorkingToday = matchedStoreCast ? availabilityMap.has(matchedStoreCast.id) : false;
           
           let slotsLeft = null;
           let nextAvailableTime = null;
           let statusText = null;
           
           if (isWorkingToday && matchedStoreCast) {
               const avail = availabilityMap.get(matchedStoreCast.id);
               
               statusText = "本日出勤中";
               let isAbsent = avail.attendance_status === 'absent';
               
               if (isAbsent) {
                   statusText = "お休み";
                   isWorkingToday = false;
               } else if (avail.shift_end) {
                   const eMin = getAdjustedMinutes(avail.shift_end, businessEndTime.hour);
                   const adjCurrentMin = getAdjustedNowMins(now, businessEndTime.hour);
                   if (adjCurrentMin >= eMin) {
                       statusText = "受付終了";
                       nextAvailableTime = "次回出勤: 未定";
                   }
               }
               
               if (statusText === "本日出勤中") {
                   const ssM = getAdjustedMinutes(avail.shift_start, businessEndTime.hour);
                   const seM = getAdjustedMinutes(avail.shift_end, businessEndTime.hour);
                   const am = getAdjustedNowMins(now, businessEndTime.hour);
                   
                   let cursorM = Math.max(am, ssM);
                   
                   const parsedBookings = avail.bookings.map((b: any) => {
                       return {
                           startM: getAdjustedMinutes(b.start, businessEndTime.hour),
                           endM: getAdjustedMinutes(b.end, businessEndTime.hour) + 10
                       };
                   }).sort((a: any, b: any) => a.startM - b.startM);

                   const MIN_GAP = 50;
                   let bumped = true;
                   while (bumped && cursorM < seM) {
                       bumped = false;
                       for (const b of parsedBookings) {
                           if (b.startM < (cursorM + MIN_GAP) && b.endM > cursorM) {
                               if (cursorM < b.endM) {
                                   cursorM = b.endM;
                                   bumped = true;
                               }
                           }
                       }
                   }

                   if (cursorM + MIN_GAP > seM) {
                       if (am >= seM) { statusText = "受付終了"; } else { statusText = "ご予約完売"; }
                       nextAvailableTime = "次回出勤: 未定";
                   } else {
                       if (cursorM <= am) {
                           nextAvailableTime = "待機中";
                       } else {
                           let h = Math.floor(cursorM / 60);
                           let m = cursorM % 60;
                           if (h >= 24) h -= 24;
                           nextAvailableTime = \`\${h.toString().padStart(2, '0')}:\${m.toString().padStart(2, '0')}\`;
                       }
                   }
                   
                   if (avail.shift_start && avail.shift_end) {
                       const sH = parseInt(avail.shift_start.split(':')[0]);
                       const eH = parseInt(avail.shift_end.split(':')[0]) || 24;
                       const totalSlots = (eH <= sH ? eH + 24 - sH : eH - sH);
                       const bookedCount = avail.bookings.length;
                       slotsLeft = Math.max(0, totalSlots - bookedCount);
                   }
               }
           }
           
            const type = post.post_type || "全員";
            const isStore = storeAccountIds.includes(post.cast_id) || platformAdminIds.includes(post.cast_id);
            
            let currentStoreName = adminProfile?.name || "公式";
            let currentStoreProfileId = adminProfile?.id;

            if (isStore) {
                currentStoreName = post.sns_profiles?.name || "公式";
                currentStoreProfileId = post.cast_id;
            } else if (matchedStoreCast) {
                const sId = matchedStoreCast.store_id;
                const storeProfile = storeProfileMap.get(sId);
                
                if (storeProfile) {
                    currentStoreName = storeProfile.full_name || storeProfile.username || "公式";
                    if (snsStoreMap.has(storeProfile.username)) {
                        currentStoreProfileId = snsStoreMap.get(storeProfile.username).id;
                    } else {
                        currentStoreProfileId = storeProfile.id; 
                    }
                }
            }

            let result = { 
                 ...post, 
                 isWorkingToday, 
                 slotsLeft, 
                 nextAvailableTime,
                 statusText,
                 isFollowing, 
                 isLocked: false, 
                 lockReason: "",
                 isStore,
                 isMyStoreCast,
                 isPlatformAdmin: platformAdminIds.includes(post.cast_id),
                 storeName: currentStoreName,
                 storeProfileId: currentStoreProfileId
            };
            
           if (type === "会員" && !user) {
               result.isLocked = true;
               result.lockReason = "会員限定の投稿です";
           }
           if (type === "フォロワー" && (!user || !followingIds.has(post.cast_id))) {
               result.isLocked = true;
               result.lockReason = "フォロワー限定の投稿です";
           }
           
           return result; 
       });

       if (postsData.length < POSTS_PER_PAGE) {
           setHasMore(false);
       } else {
           setHasMore(true);
       }

       if (isLoadMore) {
           setPosts(prev => {
               const existingIds = new Set(prev.map(p => p.id));
               const newPosts = mappedPosts.filter(p => !existingIds.has(p.id));
               return [...prev, ...newPosts];
           });
       } else {
           setPosts(mappedPosts);
       }
    } else {
       setHasMore(false);
       if (!isLoadMore) setPosts([]);
    }
    
    setIsLoading(false);
    setIsFetchingMore(false);
  };

  useEffect(() => {
    if (isUserLoading) return;
    setPage(0);
    setHasMore(true);
    fetchPosts(0, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUserLoading, user?.id, activeTab]);`;

const filteredPostsRegex = /\/\/ フィルタリング\n  const getFilteredPosts = \(\) => \{\n[\s\S]*?console\.log\('getFilteredPosts returned', posts\.length\); return posts;\n  \};\n\n  const activePosts = getFilteredPosts\(\);/m;
const newFilteredPosts = `  // フィルタリングはサーバー側（fetchPosts）で完了しているためそのまま返す
  const activePosts = posts || [];`;

content = content.replace(fetchPostsRegex, newFetchPosts);
content = content.replace(filteredPostsRegex, newFilteredPosts);

fs.writeFileSync('src/app/[prefecture]/page.tsx', content);
console.log('Done');
