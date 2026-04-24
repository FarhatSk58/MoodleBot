const https = require('https');

https.get('https://emkc.org/api/v2/piston/runtimes', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const runtimes = JSON.parse(data);
    const target = ['python', 'javascript', 'java', 'cpp', 'c++', 'c'];
    const filtered = runtimes.filter(r => target.includes(r.language));
    console.log(JSON.stringify(filtered, null, 2));
  });
}).on('error', (err) => {
  console.error(err);
});
