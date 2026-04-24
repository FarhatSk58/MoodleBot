const https = require('https');

const data = JSON.stringify({
  language: 'python',
  version: '3.10.0',
  files: [{ content: 'print("hello from node test")' }]
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
  console.log(`STATUS: ${res.statusCode}`);
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log('BODY:', body));
});

req.on('error', (e) => console.error('ERROR:', e));
req.write(data);
req.end();
