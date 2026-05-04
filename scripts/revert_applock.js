const fs = require('fs');
const file = 'src/components/auth/AppLockGuard.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `  if (isLoading || isChecking) {
    console.log("AppLockGuard loading state: isLoading=", isLoading, " isChecking=", isChecking);
    return <div className="min-h-screen bg-blue-500 flex items-center justify-center">
        <p className="text-white">AppLockGuard Loading (isLoading: {String(isLoading)}, isChecking: {String(isChecking)})</p>
    </div>;
  }`;

const replace = `  if (isLoading || isChecking) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
        {/* Sleek loading state */}
    </div>;
  }`;

content = content.replace(target, replace);
fs.writeFileSync(file, content);
console.log('Success reverting AppLockGuard');
