const fs = require('fs');
const file = 'src/providers/UserProvider.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `      const fetchPromise = supabase
        .from('sns_profiles')
        .select('*')
        .eq('id', userId)
        .limit(1);

      // Using limit(1) to avoid potential single() PostgREST hangs
      const { data: rawData, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
        
      const data = rawData && rawData.length > 0 ? rawData[0] : null;
      console.log("[UserProvider] sns_profiles returned", !!data, error);`;

const replace = `      // @supabase/supabase-js のブラウザフェッチがハングするバグを回避するため、
      // ネイティブの fetch で直接 PostgREST を叩く
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      const session = (await supabase.auth.getSession()).data.session;
      const token = session?.access_token || supabaseAnonKey;

      const fetchPromise = fetch(\`\${supabaseUrl}/rest/v1/sns_profiles?id=eq.\${userId}&select=*\`, {
        headers: {
          'apikey': supabaseAnonKey as string,
          'Authorization': \`Bearer \${token}\`,
          'Cache-Control': 'no-store'
        }
      }).then(async (res) => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        const json = await res.json();
        return { data: json.length > 0 ? json[0] : null, error: null };
      }).catch(err => {
        return { data: null, error: err };
      });

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
      console.log("[UserProvider] sns_profiles returned (native fetch)", !!data, error);`;

if (content.includes(target)) {
    content = content.replace(target, replace);
    fs.writeFileSync(file, content);
    console.log('Success replacing supabase select with native fetch');
} else {
    console.log('Target not found in UserProvider.tsx for native fetch replacement');
}
