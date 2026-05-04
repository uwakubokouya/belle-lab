const fs = require('fs');
const file = 'src/app/messages/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. partnerProfile type update
content = content.replace(
  'const [partnerProfile, setPartnerProfile] = useState<{name: string, avatar_url: string | null, bio?: string, age_group?: string} | null>(null);',
  'const [partnerProfile, setPartnerProfile] = useState<{name: string, avatar_url: string | null, bio?: string, age_group?: string, role?: string} | null>(null);'
);

// 2. select query update
content = content.replace(
  "const { data } = await supabase.from('sns_profiles').select('name, avatar_url, bio, age_group, phone').eq('id', id).single();",
  "const { data } = await supabase.from('sns_profiles').select('name, avatar_url, bio, age_group, phone, role').eq('id', id).single();"
);

// 3. setPartnerProfile update
content = content.replace(
  'setPartnerProfile({ name: data.name, avatar_url: data.avatar_url, bio: data.bio, age_group: data.age_group });',
  'setPartnerProfile({ name: data.name, avatar_url: data.avatar_url, bio: data.bio, age_group: data.age_group, role: data.role });'
);

// 4. isMatch update
content = content.replace(
  "const isMatch = messages.some(m => m.content?.startsWith('[SYSTEM_ACCEPT]'));",
  "const isMatch = messages.some(m => m.content?.startsWith('[SYSTEM_ACCEPT]')) || partnerProfile?.role === 'store' || partnerProfile?.role === 'system';"
);

fs.writeFileSync(file, content);
console.log('Fixed messages page');
