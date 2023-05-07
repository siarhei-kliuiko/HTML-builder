const fs = require('fs');
const path = require('path');

const copyFile = (fileName, srcFolderPath, destFolderPath) => {
  const srcFilePath = path.join(srcFolderPath, fileName);
  fs.stat(srcFilePath, (error, sourceFileStats) => {
    if (error) {
      console.error(error.message);
    } else {
      const copyFilePath = path.join(destFolderPath, fileName);
      fs.stat(copyFilePath, (error, copyFileStats) => {
        if ((error && error.code === 'ENOENT') || (!error && sourceFileStats.mtimeMs !== copyFileStats.mtimeMs)) {
          fs.copyFile(srcFilePath, copyFilePath, error => {
            if (error) {
              console.error(error.message);
            }
          });
        }
      });
    }
  });
};

const removeElement = (elementPath) => {
  fs.rm(elementPath, { recursive: true }, error => {
    if (error) {
      console.error(error.message);
    }
  });
};

const copyFolder = (srcFolderPath, destFolderPath) => {
  fs.mkdir(destFolderPath, { recursive: true }, error => {
    if (error) {
      console.error(error.message);
    } else {
      fs.readdir(srcFolderPath, (error, folderElements) => {
        if (error) {
          removeElement(destFolderPath);
          console.error(error.message);
        } else {
          folderElements.forEach(elementName => fs.stat(path.join(srcFolderPath, elementName), (error, stats) => {
            if (error) {
              console.log(error);
            } else if (stats.isFile()) {
              copyFile(elementName, srcFolderPath, destFolderPath);
            } else if (stats.isDirectory()) {
              copyFolder(path.join(srcFolderPath, elementName), path.join(destFolderPath, elementName));
            }
          }));
        }
      });
    }
  });

  fs.readdir(destFolderPath, (error, folderElements) => {
    if (!error) {
      folderElements.forEach(elementName => {
        fs.stat(path.join(srcFolderPath, elementName), error => {
          if (error && error.code === 'ENOENT') {
            removeElement(path.join(destFolderPath, elementName));
          }
        });
      });
    }
  });
};

copyFolder(path.join(__dirname, 'files'), path.join(__dirname, 'files-copy'));
