const { execSync } = require('child_process');
try {
  execSync('npx kill-port 5000', { stdio: 'ignore' });
} catch (_) {}
