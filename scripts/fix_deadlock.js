const fs = require('fs');
const file = 'src/providers/UserProvider.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. fetchProfileのシグネチャを変更してtokenを受け取るようにする
const target1 = `  const fetchProfile = async (userId: string) => {
    console.log("[UserProvider] fetchProfile started for", userId);`;
const replace1 = `  const fetchProfile = async (userId: string, tokenToUse?: string) => {
    console.log("[UserProvider] fetchProfile started for", userId);`;

// 2. getSessionを呼ばずに引数のtokenを使うようにする
const target2 = `      const session = (await supabase.auth.getSession()).data.session;
      const token = session?.access_token || supabaseAnonKey;`;
const replace2 = `      // getSession()を再度呼ぶとSupabaseのバグでデッドロックするため引数のtokenを使う
      const token = tokenToUse || supabaseAnonKey;`;

// 3. Promise.race のタイムアウトを正しく後処理する
const target3 = `      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Supabase request timed out after 5 seconds')), 5000);
      });`;
const replace3 = `      let timeoutHandle;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => reject(new Error('Supabase request timed out after 5 seconds')), 5000);
      });`;

const target4 = `      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
      console.log("[UserProvider] sns_profiles returned (native fetch)", !!data, error);`;
const replace4 = `      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
      clearTimeout(timeoutHandle); // timeoutを解除してUncaught Errorを防ぐ
      console.log("[UserProvider] sns_profiles returned (native fetch)", !!data, error);`;

// 4. loadUser等からの呼び出し時にtokenを渡す
const target5 = `        if (session) {
          console.log("[UserProvider] calling fetchProfile for", session.user.id);
          await fetchProfile(session.user.id);
        } else {`;
const replace5 = `        if (session) {
          console.log("[UserProvider] calling fetchProfile for", session.user.id);
          await fetchProfile(session.user.id, session.access_token);
        } else {`;

const target6 = `    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await fetchProfile(session.user.id);
    }`;
const replace6 = `    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await fetchProfile(session.user.id, session.access_token);
    }`;

content = content.replace(target1, replace1)
                 .replace(target2, replace2)
                 .replace(target3, replace3)
                 .replace(target4, replace4)
                 .replace(target5, replace5)
                 .replace(target6, replace6);

fs.writeFileSync(file, content);
console.log('Success fixing deadlock and timeout');
