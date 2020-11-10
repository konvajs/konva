var Konva = require('konva');
var canvas = require('canvas');

// mock window
Konva.window = {
  Image: canvas.Image,
  devicePixelRatio: 1,
};
// mock document
Konva.document = {
  createElement: function () {},
  documentElement: {
    addEventListener: function () {},
  },
};

// make some global injections
global.requestAnimationFrame = (cb) => {
  setImmediate(cb);
};

// create canvas in Node env
Konva.Util.createCanvasElement = () => {
  const node = new canvas.Canvas();
  node.style = {};
  return node;
};

// create image in Node env
Konva.Util.createImageElement = () => {
  const node = new canvas.Image();
  node.style = {};
  return node;
};

// _checkVisibility use dom element, in node we can skip it
Konva.Stage.prototype._checkVisibility = () => {};

module.exports = Konva;
