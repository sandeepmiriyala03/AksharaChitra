const fs = require('fs');
const path = require('path');

// Path to simple count file (for demo; in prod use DB or Netlify Blob)
const countFile = path.resolve(__dirname, 'count.txt');

exports.handler = async function(event, context) {
  let count = 0;

  try {
    count = parseInt(fs.readFileSync(countFile, 'utf-8'));
  } catch (err) {
    // file might not exist initially
  }

  if (event.httpMethod === 'POST') {
    count++;
    fs.writeFileSync(countFile, count.toString(), 'utf-8');
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count }),
  };
};
