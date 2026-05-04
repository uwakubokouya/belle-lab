const fs = require('fs');
const file = 'src/providers/UserProvider.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await fetchProfile(session.user.id);`;
          
const replace = `    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await fetchProfile(session.user.id, session.access_token);`;

if (content.includes(target)) {
    content = content.replace(target, replace);
    fs.writeFileSync(file, content);
    console.log('Success fixing onAuthStateChange');
} else {
    console.log('Target not found in onAuthStateChange');
}
