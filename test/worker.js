// Can we start Konva inside worker?

importScripts('../../konva.js');
console.log(Konva);

Konva.Util.createCanvasElement = () => {
  const canvas = new OffscreenCanvas(100, 100);
  canvas.style = {};
  return canvas;
};

Konva.Canvas.prototype.setSize = function(width, height) {
  this.setWidth(width || 1);
  this.setHeight(height || 1);
};

Konva.Stage.prototype._checkVisibility = function() {};

var stage = new Konva.Stage({
  width: 100,
  height: 100
});

var layer = new Konva.Layer();
stage.add(layer);

var shape = new Konva.Circle({
  x: stage.width() / 2,
  y: stage.height() / 2,
  radius: 50,
  fill: 'red'
});
layer.add(shape);
