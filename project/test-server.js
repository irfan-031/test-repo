const { exec } = require('child_process');
const path = require('path');

console.log('Current directory:', process.cwd());
console.log('Package.json exists:', require('fs').existsSync('package.json'));

exec('npm run dev', { cwd: process.cwd() }, (error, stdout, stderr) => {
  if (error) {
    console.error('Error:', error);
    return;
  }
  if (stderr) {
    console.error('Stderr:', stderr);
  }
  console.log('Stdout:', stdout);
}); 