var Konva = require('konva');

var Canvas = require('canvas');

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

module.exports = Konva;
