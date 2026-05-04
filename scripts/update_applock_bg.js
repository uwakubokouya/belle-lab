const fs = require('fs');
const file = 'src/components/auth/AppLockGuard.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `  if (isLoading || isChecking) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
        {/* Sleek loading state */}
    </div>;
  }`;

const replace = `  if (isLoading || isChecking) {
    // 完全に真っ黒になるのを防ぐため、ローディング中は一時的に透明または白にする
    return <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }`;

content = content.replace(target, replace);
fs.writeFileSync(file, content);
console.log('Success updating AppLockGuard background');
