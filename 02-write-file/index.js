const fs = require('fs');
const path = require('path');
const {stdin, stdout} = process;
const userNumber = Math.floor(Math.random() * 1000);
const textInputMessage = 'Enter text here: ';

console.log(`\nGreetings, user#${userNumber}!\nPress ctrl+c or type "exit" to exit\n`);
const writeFileStream = fs.createWriteStream(path.join(__dirname,'text.txt'),'utf-8');
stdout.write(textInputMessage);
stdin.on('data', data => {
  const inputText = data.toString().trim();
  if(inputText === 'exit') {
    process.exit();
  } else {
    if (inputText) {
      writeFileStream.write(data);
    }

    stdout.write(textInputMessage);
  }
});

process.on('SIGINT', () => {
  stdout.write('\n');
  process.exit();
});

process.on('exit', () => {
  writeFileStream.close();
  console.log(`\nFarewell, user#${userNumber}!\n`);
});
