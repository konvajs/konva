mocha.ui('tdd');
mocha.setup("bdd");
var assert = chai.assert,
    konvaContainer = document.getElementById('konva-container'),
    origAssertEqual = assert.equal,
    origAssert = assert,
    origNotEqual = assert.notEqual,
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
Konva.showWarnings = false;

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
    canvas.width = 578;
    canvas.height = 200;
    return canvas;
}

function get (element, content) {
    element = document.createElement(element);
    if (element && content) {
        element.innerHTML = content;
    }
    return element;
}

function compareLayerAndCanvas(layer, canvas, tol) {
    var equal = imagediff.equal(layer.getCanvas()._canvas, canvas, tol);
    if (!equal) {
        var
            div     = get('div'),
            b       = get('div', '<div>Expected:</div>'),
            c       = get('div', '<div>Diff:</div>'),
            diff    = imagediff.diff(layer.getCanvas()._canvas, canvas),
            diffCanvas  = get('canvas'),
            context;

        diffCanvas.height = diff.height;
        diffCanvas.width  = diff.width;

        div.style.overflow = 'hidden';
        b.style.float = 'left';
        c.style.float = 'left';

        context = diffCanvas.getContext('2d');
        context.putImageData(diff, 0, 0);

        b.appendChild(canvas);
        c.appendChild(diffCanvas);

        div.appendChild(b);
        div.appendChild(c);
        konvaContainer.appendChild(div);
    }
    assert.equal(equal, true);

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
    Konva.DD.isDragging = false;
    Konva.DD.node = undefined;
});

init();