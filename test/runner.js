mocha.ui('tdd');
mocha.setup("bdd");
var assert = chai.assert,
    konvaContainer = document.getElementById('konva-container'),
    origAssertEqual = assert.equal,
    origAssert = assert,
    origNotEqual = assert.notEqual,
    origDeepEqual = assert.deepEqual,
    assertionCount = 0,
    assertions = document.createElement('em');

window.requestAnimFrame = (function(callback){
  return window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function(callback){
      window.setTimeout(callback, 1000 / 30);
  };
})();

function init() {
  // assert extenders so that we can count assertions
  assert = function() {
    origAssert.apply(this, arguments);
    assertions.innerHTML = ++assertionCount;
  };
  assert.equal = function() {
    origAssertEqual.apply(this, arguments);
    assertions.innerHTML = ++assertionCount;
  };
  assert.notEqual = function() {
    origNotEqual.apply(this, arguments);
    assertions.innerHTML = ++assertionCount;
  };

    assert.deepEqual = function() {
        origDeepEqual.apply(this, arguments);
        assertions.innerHTML = ++assertionCount;
    };

  window.onload = function() {
    var mochaStats = document.getElementById('mocha-stats');

    if (mochaStats) {
      var li = document.createElement('li');
      var anchor = document.createElement('a');

      anchor.href = '#';
      anchor.innerHTML = 'assertions:';
      assertions.innerHTML = 0;

      li.appendChild(anchor);
      li.appendChild(assertions);
      mochaStats.appendChild(li);
    }
  }

  //addStats();
}




Konva.enableTrace = true;
Konva.showWarnings = true;
//Konva.pixelRatio = 2;
window.isPhantomJS = /PhantomJS/.test(window.navigator.userAgent);

function addStats() {
    stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'fixed';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.getElementsByTagName('body')[0].appendChild( stats.domElement );


    function animate(lastTime){
      stats.begin();

      requestAnimFrame(function(){
        stats.end();
        animate(lastTime);
      });
    }

    animate();
}



function addStage() {
  var container = document.createElement('div'),
      stage = new Konva.Stage({
          container: container,
          width: 578,
          height: 200
      });

  konvaContainer.appendChild(container);
  return stage;
}

function createCanvas() {
    var canvas = document.createElement('canvas');
    var ratio = (Konva.pixelRatio || window.devicePixelRatio);
    canvas.width = 578 * ratio;
    canvas.height = 200 * ratio;
    canvas.getContext('2d').scale(ratio, ratio);
    return canvas;
}

function get (element, content) {
    element = document.createElement(element);
    if (element && content) {
        element.innerHTML = content;
    }
    return element;
}
function compareCanvases(canvas1, canvas2, tol) {
    // don't test in PhantomJS as it use old chrome engine
    // it it has opacity + shadow bug
    var equal = imagediff.equal(canvas1, canvas2, tol);
    if (!equal) {
        var
            div     = get('div'),
            b       = get('div', '<div>Expected:</div>'),
            c       = get('div', '<div>Diff:</div>'),
            diff    = imagediff.diff(canvas1, canvas2),
            diffCanvas  = get('canvas'),
            context;

        diffCanvas.height = diff.height;
        diffCanvas.width  = diff.width;

        div.style.overflow = 'hidden';
        b.style.float = 'left';
        c.style.float = 'left';

        canvas2.style.position = '';
        canvas2.style.display = '';

        context = diffCanvas.getContext('2d');
        context.putImageData(diff, 0, 0);

        b.appendChild(canvas2);
        c.appendChild(diffCanvas);

        div.appendChild(b);
        div.appendChild(c);
        konvaContainer.appendChild(div);
    }
    assert.equal(equal, true, 'Result from Konva is different with canvas result');
}

function compareLayerAndCanvas(layer, canvas, tol) {
    compareCanvases(layer.getCanvas()._canvas, canvas, tol);
}

function compareLayers(layer1, layer2, tol) {
    compareLayerAndCanvas(layer1, layer2.getCanvas()._canvas, tol);
}

function cloneAndCompareLayer(layer, tol) {
    var layer2 = layer.clone();
    layer.getStage().add(layer2);
    layer2.hide();
    compareLayers(layer, layer2, tol);
}

function cloneAndCompareLayerWithHit(layer, tol) {
    var layer2 = layer.clone();
    layer.getStage().add(layer2);
    layer2.hide();
    compareLayers(layer, layer2, tol);
    compareCanvases(layer.getHitCanvas()._canvas, layer2.getHitCanvas()._canvas, tol);
}

function compareSceneAndHit(layer) {
    compareLayerAndCanvas(layer, layer.getHitCanvas()._canvas, 254);
}

function addContainer() {
  var container = document.createElement('div');

  konvaContainer.appendChild(container);

  return container;
}

function showCanvas(canvas) {
  canvas.style.position = 'relative';

  konvaContainer.appendChild(canvas);
}
function showHit(layer) {
  var canvas = layer.hitCanvas._canvas;
  canvas.style.position = 'relative';

  konvaContainer.appendChild(canvas);
}

beforeEach(function(){
    var title = document.createElement('h2'),
        test = this.currentTest;

    title.innerHTML = test.parent.title + ' - ' + test.title;
    title.className = 'konva-title';
    konvaContainer.appendChild(title);

    // resets
    Konva.inDblClickWindow = false;
    Konva.DD && (Konva.DD.isDragging = false);
    Konva.DD && (Konva.DD.node = undefined);
});

Konva.UA.mobile = false;

afterEach(function(){
//    Konva.stages.forEach(function(stage) {
//        stage.destroy();
//    });
});

Konva.Stage.prototype.simulateMouseDown = function(pos) {
    var top = this.content.getBoundingClientRect().top;

    this._mousedown({
        clientX: pos.x,
        clientY: pos.y + top,
        button: pos.button
    });
};

Konva.Stage.prototype.simulateMouseMove = function(pos) {
    var top = this.content.getBoundingClientRect().top;

    var evt = {
        clientX: pos.x,
        clientY: pos.y + top,
        button: pos.button
    };

    this._mousemove(evt);
    Konva.DD._drag(evt);
};

Konva.Stage.prototype.simulateMouseUp = function(pos) {
    "use strict";
    var top = this.content.getBoundingClientRect().top;


    var evt = {
        clientX: pos.x,
        clientY: pos.y + top,
        button: pos.button
    };


    Konva.DD._endDragBefore(evt);
    this._mouseup(evt);
    Konva.DD._endDragAfter(evt);
}

init();
