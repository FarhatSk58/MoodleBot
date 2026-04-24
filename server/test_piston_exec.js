const https = require('https');

const data = JSON.stringify({
  language: 'python',
  version: '3.10.0',
  files: [{ content: 'print("hello world")' }]
});

const options = {
  hostname: 'emkc.org',
  port: 443,
  path: '/api/v2/piston/execute',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.write(data);
req.end();
