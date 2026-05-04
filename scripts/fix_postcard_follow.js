const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/feed/PostCard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add import for supabase
if (!content.includes("import { supabase }")) {
    content = content.replace("import { useState } from 'react';", "import { useState, useEffect } from 'react';\nimport { supabase } from '@/lib/supabase';");
}

// 2. Add local state for isLocked
const stateTarget = `  const [fullscreenMedia, setFullscreenMedia] = useState<string | null>(null);`;
const stateReplacement = `  const [fullscreenMedia, setFullscreenMedia] = useState<string | null>(null);
  const [localIsLocked, setLocalIsLocked] = useState(isLocked);
  
  useEffect(() => {
      setLocalIsLocked(isLocked);
  }, [isLocked]);
  
  const handleDirectFollow = async () => {
      if (!user) return;
      try {
          const { error } = await supabase
              .from('follows')
              .insert({
                  follower_id: user.id,
                  following_id: castId
              });
              
          if (!error || error.code === '23505') { // 23505 is unique violation (already following)
              setLocalIsLocked(false);
              setShowLockedPromptModal(false);
              if (onFollowToggle) onFollowToggle();
          } else {
              console.error('Follow error:', error);
          }
      } catch (err) {
          console.error(err);
      }
  };`;
if (content.includes(stateTarget)) {
    content = content.replace(stateTarget, stateReplacement);
}

// 3. Replace isLocked with localIsLocked in JSX rendering
content = content.replace(/const shouldBlur = isLocked/g, "const shouldBlur = localIsLocked");
content = content.replace(/isLocked \? 'blur-\[4px\]/g, "localIsLocked ? 'blur-[4px]");
content = content.replace(/isLocked && images/g, "localIsLocked && images");
content = content.replace(/if \(isLocked\)/g, "if (localIsLocked)");
content = content.replace(/\{isLocked \?/g, "{localIsLocked ?");

// 4. Update the onClick for "フォローする" button inside modal
const buttonTarget = `                 onClick={() => {
                     setShowLockedPromptModal(false);
                     if (onFollowToggle) {
                         onFollowToggle();
                     } else {
                         // Fallback if no onFollowToggle is provided
                         router.push(\`/cast/\${castId}\`);
                     }
                 }}`;
const buttonReplacement = `                 onClick={handleDirectFollow}`;
if (content.includes(buttonTarget)) {
    content = content.replace(buttonTarget, buttonReplacement);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated PostCard with self-contained follow logic');
