import fs from 'fs';
import http from 'http';

const data = fs.readFileSync('./sample-emails-shipyard.json', 'utf8');
const jsonData = JSON.parse(data);

const postData = JSON.stringify(jsonData);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/import-json',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('응답:', body);
  });
});

req.on('error', (e) => {
  console.error(`문제 발생: ${e.message}`);
});

req.write(postData);
req.end();
