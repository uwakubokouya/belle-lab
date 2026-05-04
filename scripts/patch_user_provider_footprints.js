const fs = require('fs');
const path = require('path');

const userProviderPath = path.join(__dirname, '../src/providers/UserProvider.tsx');
let content = fs.readFileSync(userProviderPath, 'utf8');

// 1. Add hasUnreadFootprints to interface
if (!content.includes('hasUnreadFootprints: boolean;')) {
    content = content.replace(
        'hasUnreadFeedbacks: boolean;', 
        'hasUnreadFeedbacks: boolean;\n  hasUnreadFootprints: boolean;\n  checkUnreadFootprints: () => Promise<void>;'
    );
}

// 2. Add state variable
if (!content.includes('const [hasUnreadFootprints, setHasUnreadFootprints]')) {
    content = content.replace(
        'const [hasUnreadFeedbacks, setHasUnreadFeedbacks] = useState(false);',
        'const [hasUnreadFeedbacks, setHasUnreadFeedbacks] = useState(false);\n  const [hasUnreadFootprints, setHasUnreadFootprints] = useState(false);'
    );
}

// 3. Add checkUnreadFootprints and subscription
const checkUnreadFootprintsStr = `
    const checkUnreadFootprints = async (userId: string) => {
       const { data: footprints } = await supabase
          .from('sns_footprints')
          .select('viewer_id')
          .eq('cast_id', userId);

       if (footprints && footprints.length > 0) {
           const viewerIds = [...new Set(footprints.map(f => f.viewer_id))];
           
           const { data: likes } = await supabase
              .from('sns_messages')
              .select('receiver_id')
              .eq('sender_id', userId)
              .like('content', '[SYSTEM_LIKE]%')
              .in('receiver_id', viewerIds);
              
           const likedIds = new Set(likes?.map(l => l.receiver_id) || []);
           const hasUnliked = viewerIds.some(vid => !likedIds.has(vid));
           setHasUnreadFootprints(hasUnliked);
       } else {
           setHasUnreadFootprints(false);
       }
    };
`;

const footprintChannelStr = `
    const footprintChannel = supabase.channel('public:sns_footprints')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sns_footprints' }, () => {
         supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user.id) checkUnreadFootprints(session.user.id);
         });
      })
      .subscribe();
`;

// Insert the functions right after checkUnreadMessages definition
if (!content.includes('checkUnreadFootprints')) {
    const target1 = `    // Load unread initially`;
    content = content.replace(target1, `${checkUnreadFootprintsStr}\n${footprintChannelStr}\n    // Load unread initially`);
    
    // Call checkUnreadFootprints in the initial load
    const target2 = `if (session?.user.id) checkUnreadMessages(session.user.id);`;
    content = content.replace(target2, `if (session?.user.id) {\n           checkUnreadMessages(session.user.id);\n           checkUnreadFootprints(session.user.id);\n       }`);
}

// 4. Expose the values
const exposeTarget = `refreshUnreadFeedbacks`;
if (content.includes(exposeTarget) && !content.includes('hasUnreadFootprints,')) {
    content = content.replace(
        'hasUnreadFeedbacks, markNotificationsAsRead', 
        'hasUnreadFeedbacks, hasUnreadFootprints, markNotificationsAsRead'
    );
    // Also expose checkUnreadFootprints
    content = content.replace(
        'markLikesAsRead, refreshUnreadFeedbacks',
        'markLikesAsRead, refreshUnreadFeedbacks, checkUnreadFootprints: async () => { if (user?.id) await checkUnreadFootprints(user.id); }'
    );
}

fs.writeFileSync(userProviderPath, content, 'utf8');
console.log('UserProvider updated');
