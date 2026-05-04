const fs = require('fs');
const file = 'src/providers/UserProvider.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `  const fetchProfile = async (userId: string) => {
    console.log("[UserProvider] fetchProfile started for", userId);
    try {
      console.log("[UserProvider] fetching sns_profiles");
      const { data, error } = await supabase
        .from('sns_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      console.log("[UserProvider] sns_profiles returned", !!data, error);`;

const replace = `  const fetchProfile = async (userId: string) => {
    console.log("[UserProvider] fetchProfile started for", userId);
    try {
      console.log("[UserProvider] fetching sns_profiles (using limit instead of single)");
      // Using limit(1) to avoid potential single() PostgREST hangs
      const { data: rawData, error } = await supabase
        .from('sns_profiles')
        .select('*')
        .eq('id', userId)
        .limit(1);
        
      const data = rawData && rawData.length > 0 ? rawData[0] : null;
      console.log("[UserProvider] sns_profiles returned", !!data, error);`;

content = content.replace(target, replace);
fs.writeFileSync(file, content);
console.log('Success replacing single() with limit(1) in fetchProfile');
