const fs = require('fs');
const path = require('path');
const secretFolderPath = path.join(__dirname, 'secret-folder');

const printFileStats = (fileName) => {
  fs.stat(path.join(secretFolderPath, fileName), (error, stats) => {
    if (error) {
      console.log(error);
    } else if (stats.isFile()) {
      const parsedFileName = path.parse(fileName);
      console.log(`${parsedFileName.name} - ${parsedFileName.ext.replace('.', '')} - ${stats.size / 1024}kb`);
    }
  });
};

fs.readdir(secretFolderPath, (error, fileNames) => {
  if(error) {
    console.log(error);
  } else {
    fileNames.forEach(fileName =>  printFileStats(fileName));
  }
});
