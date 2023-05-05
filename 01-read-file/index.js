const path = require('path');
const fs = require('fs');
const fileReadStream = fs.createReadStream (path.join(__dirname,'text.txt'),'utf-8');
fileReadStream.on('error', error => console.log(error.message));
fileReadStream.pipe(process.stdout);