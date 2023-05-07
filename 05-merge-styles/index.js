const fs = require('fs');
const path = require('path');
const stylesFolderPath = path.join(__dirname, 'styles');
const bundleFilePath = path.join(__dirname, 'project-dist', 'bundle.css');

fs.readdir(stylesFolderPath, (error, fileNames) => {
  if(error) {
    console.error(error.message);
  } else {
    const bundleFileWriteStream = fs.createWriteStream(bundleFilePath);
    fileNames.forEach(fileName => {
      const filePath = path.join(stylesFolderPath, fileName);
      fs.stat(filePath, (error, stats) => {
        if (error) {
          console.error(error.message);
        } else if (stats.isFile() && stats.size > 0 && path.extname(fileName) === '.css') {
          const styleFileReadStream = fs.createReadStream(filePath);
          styleFileReadStream.pipe(bundleFileWriteStream);
        }
      });
    });
  }
});
