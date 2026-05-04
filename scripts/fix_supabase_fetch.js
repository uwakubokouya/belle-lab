const fs = require('fs');
const file = 'src/lib/supabase.ts';
let content = fs.readFileSync(file, 'utf8');

const target = `export const supabase = createClient(supabaseUrl, supabaseAnonKey);`;
const replace = `// Next.jsのfetch重複排除バグを回避するため、ブラウザ環境では標準のfetchを明示的に渡す
const customFetch = typeof window !== 'undefined' ? window.fetch.bind(window) : fetch;
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: customFetch
  }
});`;

if (content.includes(target)) {
    content = content.replace(target, replace);
    fs.writeFileSync(file, content);
    console.log('Success fixing supabase client fetch');
} else {
    console.log('Target not found in supabase.ts');
}
