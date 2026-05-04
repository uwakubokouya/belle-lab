const fs = require('fs');
const file = 'src/providers/UserProvider.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `  const fetchProfile = async (userId: string) => {
    console.log("[UserProvider] fetchProfile started for", userId);
    try {
      console.log("[UserProvider] fetching sns_profiles (using limit instead of single)");
      // Using limit(1) to avoid potential single() PostgREST hangs
      const { data: rawData, error } = await supabase
        .from('sns_profiles')
        .select('*')
        .eq('id', userId)
        .limit(1);`;

const replace = `  const fetchProfile = async (userId: string) => {
    console.log("[UserProvider] fetchProfile started for", userId);
    try {
      console.log("[UserProvider] fetching sns_profiles (using limit instead of single)");
      
      // Promise race to force a timeout if Supabase/Next.js fetch hangs
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Supabase request timed out after 5 seconds')), 5000);
      });

      const fetchPromise = supabase
        .from('sns_profiles')
        .select('*')
        .eq('id', userId)
        .limit(1);

      // Using limit(1) to avoid potential single() PostgREST hangs
      const { data: rawData, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;`;

if (content.includes(target)) {
    content = content.replace(target, replace);
    fs.writeFileSync(file, content);
    console.log('Success adding timeout to fetchProfile');
} else {
    console.log('Target not found in UserProvider.tsx');
}
