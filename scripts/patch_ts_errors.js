const fs = require('fs');
const path = require('path');

// Fix UserProvider.tsx
const userProviderPath = path.join(__dirname, '../src/providers/UserProvider.tsx');
let upContent = fs.readFileSync(userProviderPath, 'utf8');

// 1. Add 'system' to UserRole
upContent = upContent.replace(
    /export type UserRole = 'customer' \| 'cast' \| 'store';/,
    "export type UserRole = 'customer' | 'cast' | 'store' | 'system';"
);

// 2. Extract checkUnreadFootprints out of useEffect
const checkUnreadFootprintsFunc = `    const checkUnreadFootprints = async (userId: string) => {
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
    };`;

if (upContent.includes(checkUnreadFootprintsFunc)) {
    // Remove it from inside useEffect
    upContent = upContent.replace(checkUnreadFootprintsFunc, '');
    // And place it right before useEffect
    upContent = upContent.replace(
        '  useEffect(() => {',
        checkUnreadFootprintsFunc + '\n\n  useEffect(() => {'
    );
}

fs.writeFileSync(userProviderPath, upContent, 'utf8');
console.log('Fixed UserProvider.tsx');
