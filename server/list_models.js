const https = require('https');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.log("No GEMINI_API_KEY set");
    process.exit(1);
}

https.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
           const json = JSON.parse(data);
           const models = json.models.map(m => m.name).filter(m => m.includes('gemini'));
           console.log("Available Gemini models:");
           models.forEach(m => console.log(m));
        } catch(e) {
           console.log("Error parsing:", data);
        }
    });
}).on('error', e => console.log(e));
