import FileHound from 'filehound';
import fs from 'fs';

const files = FileHound.create().paths('./lib').ext('js').find();

files.then((filePaths) => {
  filePaths.forEach((filepath) => {
    fs.readFile(filepath, 'utf8', (err, text) => {
      if (!text.match(/import .* from/g)) {
        return;
      }
      text = text.replace(/(import .* from\s+['"])(.*)(?=['"])/g, '$1$2.js');
      if (text.match(/export .* from/g)) {
        text = text.replace(/(export .* from\s+['"])(.*)(?=['"])/g, '$1$2.js');
      }

      if (err) throw err;

      // stupid replacement back
      text = text.replace(
        "import * as Canvas from 'canvas.js';",
        "import * as Canvas from 'canvas';"
      );

      fs.writeFile(filepath, text, function (err) {
        if (err) {
          throw err;
        }
      });
    });
  });
});
