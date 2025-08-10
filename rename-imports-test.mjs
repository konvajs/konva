import FileHound from 'filehound';
import fs from 'fs';

const files = FileHound.create().paths('./.test-temp').ext(['js', 'ts']).find();

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
      text = text.replace("from 'canvas.js';", "from 'canvas';");
      text = text.replace("from 'chai.js';", "from 'chai';");
      text = text.replace("from 'skia-canvas.js';", "from 'skia-canvas';");

      // Handle import("./x/y/z") syntax.
      text = text.replace(/(import\s*\(\s*['"])(.*)(?=['"])/g, '$1$2.js');

      fs.writeFile(filepath, text, function (err) {
        if (err) {
          throw err;
        }
      });
    });
  });
});

// Removed CommonJS export rewriting to keep ESM output intact
