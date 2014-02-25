mocha.ui('tdd');
mocha.setup("bdd");
var assert = chai.assert,
    kineticContainer = document.getElementById('kinetic-container'),
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




Kinetic.enableTrace = true;

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
      stage = new Kinetic.Stage({
          container: container,
          width: 578,
          height: 200
      });

  kineticContainer.appendChild(container);

  return stage;
}

function addContainer() {
  var container = document.createElement('div');

  kineticContainer.appendChild(container);

  return container;
}

function showCanvas(canvas) {
  canvas.style.position = 'relative';

  kineticContainer.appendChild(canvas);
}
function showHit(layer) {
  var canvas = layer.hitCanvas._canvas;
  canvas.style.position = 'relative';

  kineticContainer.appendChild(canvas);
}

beforeEach(function(){
    var title = document.createElement('h2'),
        test = this.currentTest;

    title.innerHTML = test.parent.title + ' - ' + test.title;
    title.className = 'kinetic-title';
    kineticContainer.appendChild(title);

    // resets
    Kinetic.inDblClickWindow = false;
    Kinetic.DD.isDragging = false;
    Kinetic.DD.node = undefined;
});

init();