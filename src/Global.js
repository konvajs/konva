///////////////////////////////////////////////////////////////////////
//  Global
///////////////////////////////////////////////////////////////////////
/**
 * Kinetic Namespace
 * @namespace
 */
var Kinetic = {};
Kinetic.Filters = {};
Kinetic.Global = {
    BUBBLE_WHITELIST: ['mousedown', 'mousemove', 'mouseup', 'mouseover', 'mouseout', 'click', 'dblclick', 'touchstart', 'touchmove', 'touchend', 'tap', 'dbltap', 'dragstart', 'dragmove', 'dragend'],
    stages: [],
    idCounter: 0,
    tempNodes: [],
    maxDragTimeInterval: 20,
    drag: {
        moving: false,
        offset: {
            x: 0,
            y: 0
        },
        lastDrawTime: 0
    },
    _pullNodes: function(stage) {
        var tempNodes = this.tempNodes;
        for(var n = 0; n < tempNodes.length; n++) {
            var node = tempNodes[n];
            if(node.getStage() !== undefined && node.getStage()._id === stage._id) {
                stage._addId(node);
                stage._addName(node);
                this.tempNodes.splice(n, 1);
                n -= 1;
            }
        }
    }
};
