const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');

const child = spawn('npm', ['run', 'dev', '--', '-p', '3005'], {
  cwd: process.cwd(),
  env: process.env
});

let output = '';
child.stdout.on('data', data => output += data.toString());
child.stderr.on('data', data => output += data.toString());

setTimeout(() => {
  http.get('http://localhost:3005/api/auth/session', res => {
    let resData = '';
    res.on('data', chunk => resData += chunk);
    res.on('end', () => {
      console.log('Response status:', res.statusCode);
      console.log('Server Output:\n', output);
      child.kill();
      process.exit(0);
    });
  }).on('error', err => {
    console.log('Fetch error:', err);
    child.kill();
    process.exit(1);
  });
}, 8000); // wait 8s for next dev to be ready
