const Konva = require('konva');
const Canvas = require('canvas');
const fs = require('fs');
const path = require('path');

Konva.window = {
  Image: Canvas.Image,
  devicePixelRatio: 1
};
Konva.document = {
  createElement: function() {},
  documentElement: {
    addEventListener: function() {}
  }
};
// Konva.window = new JSDOM(
//   '<!DOCTYPE html><html><head></head><body></body></html>'
// ).window;
// Konva.document = Konva.window.document;
// Konva.window.Image = Canvas.Image;
Konva._nodeCanvas = Canvas;

Konva.loadImage = function (src) {
  return new Promise((resolve, reject) => {
    const image = new Konva.window.Image();

    function cleanup () {
      image.onload = null;
      image.onerror = null;
    }

    image.onload = () => { cleanup(); resolve(image); }
    image.onerror = () => { cleanup(); reject(new Error(`Failed to load the image "${src}"`)); }

    image.src = fs.readFileSync(src)
  })
}

Konva.loadImages = function (srcList) {
  return new Promise.all(srcList.map(x => Konva.loadImage(x)));
}

Konva.toJPGStream = function(stage) {
  const canvas = stage.toCanvas()
  const stream = canvas.jpegStream({
    bufsize: 4096 // output buffer size in bytes, default: 4096
    , quality: 75 // JPEG quality (0-100) default: 75
    , progressive: true // true for progressive compression, default: false
  })

  return stream;
}

Konva.setFont = function (basePath, filepath, name) {
  const file = path.join(basePath, filepath)
  const font = new Canvas.Font(name, file);
  Konva.Util.setFont(name, font);
}

module.exports = Konva;
