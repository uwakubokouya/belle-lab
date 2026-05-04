const fs = require('fs');
const file = 'src/providers/UserProvider.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetLoadUser = `    const loadUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session) {
          await fetchProfile(session.user.id);
        } else {
          setIsLoading(false);
        }
      } catch (err: any) {`;

const replaceLoadUser = `    const loadUser = async () => {
      console.log("[UserProvider] loadUser started");
      try {
        console.log("[UserProvider] calling getSession");
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("[UserProvider] getSession returned", !!session, error);
        if (error) throw error;
        
        if (session) {
          console.log("[UserProvider] calling fetchProfile for", session.user.id);
          await fetchProfile(session.user.id);
        } else {
          console.log("[UserProvider] no session, setting isLoading false");
          setIsLoading(false);
        }
      } catch (err: any) {`;

const targetFetchProfile = `  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('sns_profiles')
        .select('*')
        .eq('id', userId)
        .single();`;

const replaceFetchProfile = `  const fetchProfile = async (userId: string) => {
    console.log("[UserProvider] fetchProfile started for", userId);
    try {
      console.log("[UserProvider] fetching sns_profiles");
      const { data, error } = await supabase
        .from('sns_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      console.log("[UserProvider] sns_profiles returned", !!data, error);`;

const targetFinally = `    } catch (err) {
      console.error("Fetch profile exception:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };`;

const replaceFinally = `    } catch (err) {
      console.error("Fetch profile exception:", err);
      setUser(null);
    } finally {
      console.log("[UserProvider] fetchProfile finally block, setting isLoading false");
      setIsLoading(false);
    }
  };`;

content = content.replace(targetLoadUser, replaceLoadUser)
                 .replace(targetFetchProfile, replaceFetchProfile)
                 .replace(targetFinally, replaceFinally);
fs.writeFileSync(file, content);
console.log('Success adding logs to UserProvider.tsx');
