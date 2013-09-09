mocha.ui('tdd');
var assert = chai.assert,
    kineticContainer = document.getElementById('kinetic-container');

Kinetic.enableTrace = true;

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
});