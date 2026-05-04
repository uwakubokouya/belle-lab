const fs = require('fs');
const file = 'src/lib/supabase.ts';
let content = fs.readFileSync(file, 'utf8');

const target = `// Next.jsのfetch重複排除バグを回避するため、ブラウザ環境では標準のfetchを明示的に渡す
const customFetch = typeof window !== 'undefined' ? window.fetch.bind(window) : fetch;`;

const replace = `// Next.jsのfetch重複排除・キャッシュバグを強制的に回避する
const customFetch = (url, options) => {
  return fetch(url, {
    ...options,
    cache: 'no-store' // 強制的にキャッシュとDeduplicationをバイパス
  });
};`;

if (content.includes(target)) {
    content = content.replace(target, replace);
    fs.writeFileSync(file, content);
    console.log('Success updating customFetch in supabase.ts');
} else {
    console.log('Target not found in supabase.ts');
}
