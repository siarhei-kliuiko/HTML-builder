const fs = require('fs');
const path = require('path');
const distFolderPath = path.join(__dirname, 'project-dist');

const buildHtmlFile = () => {
  const templateReadStream = fs.createReadStream(path.join(__dirname, 'template.html'), 'utf-8');
  templateReadStream.on('data', htmlData => {
    const tags = htmlData.match(/{{\w+}}/g);
    for (let i = 0; i < tags.length; i++) {
      const tagContentReadStream = fs.createReadStream(path.join(__dirname, 'components', `${tags[i].slice(2, -2)}.html`), 'utf-8');
      tagContentReadStream.on('error', () => console.error(`There is no content for ${tags[i]} component`));
      tagContentReadStream.on('data', tagData => {
        htmlData = htmlData.replaceAll(tags[i], tagData);
      });

      if(i === tags.length - 1) {
        tagContentReadStream.on('end', () => {
          const indexWriteStream = fs.createWriteStream(path.join(distFolderPath, 'index.html'), 'utf-8');
          indexWriteStream.write(htmlData);
        });
      }
    }
  });
};

const buildStyleFile = () => {
  const stylesFolderPath = path.join(__dirname, 'styles');
  fs.readdir(stylesFolderPath, (error, fileNames) => {
    if(error) {
      console.error(error.message);
    } else {
      const styleWriteStream = fs.createWriteStream(path.join(distFolderPath, 'style.css'));
      fileNames.forEach(fileName => {
        const filePath = path.join(stylesFolderPath, fileName);
        fs.stat(filePath, (error, stats) => {
          if (error) {
            console.error(error.message);
          } else if (stats.isFile() && stats.size > 0 && path.extname(fileName) === '.css') {
            const styleFileReadStream = fs.createReadStream(filePath);
            styleFileReadStream.pipe(styleWriteStream);
          }
        });
      });
    }
  });
};

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

fs.mkdir(distFolderPath, { recursive: true }, error => {
  if (error) {
    console.error(error.message);
  } else {
    buildHtmlFile();
    buildStyleFile();
    const assetsFolderName = 'assets';
    copyFolder(path.join(__dirname, assetsFolderName), path.join(distFolderPath, assetsFolderName));
  }
});
