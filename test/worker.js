importScripts('../../konva.js');

Konva.Util.createCanvasElement = () => {
  const canvas = new OffscreenCanvas(1, 1);
  canvas.style = {};
  return canvas;
};

var stage = new Konva.Stage({
  width: 200,
  height: 200,
});

var layer = new Konva.Layer();
stage.add(layer);

var topGroup = new Konva.Group();
layer.add(topGroup);

var counter = new Konva.Text({
  x: 5,
  y: 35,
});
topGroup.add(counter);

var button = new Konva.Label({
  x: 5,
  y: 5,
  opacity: 0.75,
});
topGroup.add(button);

button.add(
  new Konva.Tag({
    fill: 'black',
  })
);

button.add(
  new Konva.Text({
    text: 'Push me to add bunnies',
    fontFamily: 'Calibri',
    fontSize: 18,
    padding: 5,
    fill: 'white',
  })
);

var circle = new Konva.Circle({
  x: stage.width() / 2,
  y: stage.height() / 2,
  radius: 20,
  fill: 'red',
  draggable: true,
});
topGroup.add(circle);
layer.draw();

onmessage = function (evt) {
  if (evt.data.canvas) {
    var canvas = evt.data.canvas;
    stage.setSize({
      width: canvas.width,
      height: canvas.height,
    });
    const ctx = canvas.getContext('2d');
    setInterval(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(layer.getCanvas()._canvas, 0, 0);
    }, 16);
  }
  if (evt.data.eventName === 'mouseup') {
    Konva.DD._endDragBefore(evt.data.event);
  }
  if (evt.data.eventName === 'touchend') {
    Konva.DD._endDragBefore(evt.data.event);
  }
  if (evt.data.eventName === 'mousemove') {
    Konva.DD._drag(evt.data.event);
  }
  if (evt.data.eventName === 'touchmove') {
    Konva.DD._drag(evt.data.event);
  }
  if (evt.data.eventName === 'mouseup') {
    Konva.DD._endDragAfter(evt.data.event);
  }
  if (evt.data.eventName === 'touchend') {
    Konva.DD._endDragAfter(evt.data.event);
  }

  if (evt.data.eventName) {
    stage['_' + evt.data.eventName](evt.data.event);
  }
};

function requestAnimationFrame(cb) {
  setTimeout(cb, 16);
}
async function runBunnies() {
  var bunnys = [];
  var gravity = 0.75;

  var startBunnyCount = 100;
  var isAdding = false;
  var count = 0;
  var amount = 10;
  const imgBlob = await fetch('./assets/bunny.png').then((r) => r.blob());
  const img = await createImageBitmap(imgBlob);

  button.on('mousedown', function () {
    isAdding = true;
  });

  button.on('mouseup', function () {
    isAdding = false;
  });

  for (var i = 0; i < startBunnyCount; i++) {
    var bunny = new Konva.Image({
      image: img,
      transformsEnabled: 'position',
      x: 10,
      y: 10,
      listening: false,
    });

    bunny.speedX = Math.random() * 10;
    bunny.speedY = Math.random() * 10 - 5;

    bunnys.push(bunny);
    counter.text('Bunnies number: ' + bunnys.length);
    layer.add(bunny);
  }
  topGroup.moveToTop();
  layer.draw();

  function update() {
    var maxX = stage.width() - 10;
    var minX = 0;
    var maxY = stage.height() - 10;
    var minY = 0;
    if (isAdding) {
      // add 10 at a time :)

      for (var i = 0; i < amount; i++) {
        var bunny = new Konva.Image({
          image: img,
          transformsEnabled: 'position',
          x: 0,
          y: 0,
          listening: false,
        });
        bunny.speedX = Math.random() * 10;
        bunny.speedY = Math.random() * 10 - 5;
        bunnys.push(bunny);
        layer.add(bunny);
        counter.text('Bunnies number: ' + bunnys.length);
        count++;
      }
      topGroup.moveToTop();
    }

    for (var i = 0; i < bunnys.length; i++) {
      var bunny = bunnys[i];
      bunny.setX(bunny.getX() + bunny.speedX);
      bunny.setY(bunny.getY() + bunny.speedY);
      bunny.speedY += gravity;
      if (bunny.getX() > maxX - img.width) {
        bunny.speedX *= -1;
        bunny.setX(maxX - img.width);
      } else if (bunny.getX() < minX) {
        bunny.speedX *= -1;
        bunny.setX(minX);
      }

      if (bunny.getY() > maxY - img.height) {
        bunny.speedY *= -0.85;
        bunny.setY(maxY - img.height);
        if (Math.random() > 0.5) {
          bunny.speedY -= Math.random() * 6;
        }
      } else if (bunny.getY() < minY) {
        bunny.speedY = 0;
        bunny.setY(minY);
      }
    }
    layer.drawScene();
    requestAnimationFrame(update);
  }
  update();
}

runBunnies();
