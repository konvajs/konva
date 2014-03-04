var fs = require('fs'),
    Kinetic = require('../dist/kinetic-dev');



global.Kinetic = Kinetic;
Kinetic.enableTrace = true;

// Config MINIMAL test environment
global.suite = function(title, func) {
    console.log('Suite : ' + title);
    func();
};

global.test = function(title, func) {
    try {
        console.log('Run test: ' + title);
        func(function(){});
    } catch (e) {
        console.log('Error at ' + title, e);
        throw e;
    }
    
};
test.skip = function(){};
global.assert = function(condtion, message){
    if (!condtion) {
        throw 'assert throw:' + message;
    }
};
global.assert.equal = function(left, right){
    if (left !== right) {
        
    }
};
global.assert.notEqual = function(left, right){
    if (left === right) {
        throw 'assert throw';
    }
};

global.addStage = function(){
    return new Kinetic.Stage({
          width: 578,
          height: 200
    });
};

// Some utils for testing
global.kineticContainer = Kinetic.document.createElement('div');
Kinetic.document.body.appendChild(kineticContainer);
global.showHit = global.addContainer = function(){
};
global.Image = Kinetic._nodeCanvas.Image;
Image.prototype.style = {};
eval(fs.readFileSync('./test/assets/tiger.js')+"");
eval(fs.readFileSync('./test/assets/worldMap.js')+"");
global.tiger = tiger;
global.worldMap = worldMap;




// now load all tests
require('./unit/Global-test.js');
require('./unit/Node-test.js');
require('./unit/Global-test.js');
require('./unit/Util-test.js');
require('./unit/Canvas-test.js');
require('./unit/Node-test.js');
require('./unit/Container-test.js');
require('./unit/Stage-test.js');
require('./unit/Layer-test.js');
require('./unit/Shape-test.js');
require('./unit/Collection-test.js');

    // shapes -->
require('./unit/shapes/Rect-test.js');
require('./unit/shapes/Circle-test.js');
require('./unit/shapes/Image-test.js');
require('./unit/shapes/Line-test.js');
require('./unit/shapes/Text-test.js');
require('./unit/shapes/Blob-test.js');
require('./unit/shapes/Ellipse-test.js');
require('./unit/shapes/Polygon-test.js');
require('./unit/shapes/Spline-test.js');
require('./unit/shapes/Sprite-test.js');
require('./unit/shapes/Wedge-test.js');
require('./unit/shapes/Arc-test.js');
require('./unit/shapes/Ring-test.js');

//     // extensions -->
require('./unit/Animation-test.js');
require('./unit/DragAndDrop-test.js');
require('./unit/Tween-test.js');

//     // plugins -->
require('./unit/plugins/Label-test.js');
require('./unit/plugins/Star-test.js');
require('./unit/plugins/RegularPolygon-test.js');
require('./unit/plugins/Path-test.js');
require('./unit/plugins/TextPath-test.js');

//     // filters -->
require('./unit/filters/Blur-test.js');
require('./unit/filters/Brighten-test.js');
require('./unit/filters/RGB-test.js');
require('./unit/filters/HSV-test.js');
require('./unit/filters/HSL-test.js');
require('./unit/filters/Invert-test.js');
require('./unit/filters/Mask-test.js');
require('./unit/filters/Grayscale-test.js');
require('./unit/filters/Enhance-test.js');
require('./unit/filters/Pixelate-test.js');
require('./unit/filters/Noise-test.js');
require('./unit/filters/Threshold-test.js');
require('./unit/filters/Posterize-test.js');
require('./unit/filters/Sepia-test.js');
require('./unit/filters/Emboss-test.js');
require('./unit/filters/Solarize-test.js');
require('./unit/filters/Kaleidoscope-test.js');

//     //=============== functional tests ================-->

require('./functional/MouseEvents-test.js');
require('./functional/TouchEvents-test.js');
//require('./functional/DragAndDropEvents-test.js'); disabled because of simplest test configuration

//     //=============== manual tests ================-->
// require('./manual/manual-test.js'); disabled because of unlimited animation
