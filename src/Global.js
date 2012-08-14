///////////////////////////////////////////////////////////////////////
//  Global
///////////////////////////////////////////////////////////////////////
/**
 * Kinetic Namespace
 * @namespace
 */
var Kinetic = {};
Kinetic.Filters = {};
Kinetic.Plugins = {};
Kinetic.Global = {
    BUBBLE_WHITELIST: ['mousedown', 'mousemove', 'mouseup', 'mouseover', 'mouseout', 'click', 'dblclick', 'touchstart', 'touchmove', 'touchend', 'tap', 'dbltap', 'dragstart', 'dragmove', 'dragend'],
    BUFFER_WHITELIST: ['fill', 'stroke', 'textFill', 'textStroke'],
    BUFFER_BLACKLIST: ['shadow'],
    stages: [],
    idCounter: 0,
    tempNodes: {},
    //shapes hash.  rgb keys and shape values
    shapes: {},
    maxDragTimeInterval: 20,
    drag: {
        moving: false,
        offset: {
            x: 0,
            y: 0
        },
        lastDrawTime: 0
    },
    warn: function(str) {
        if(console && console.warn) {
            console.warn('Kinetic warning: ' + str);
        }
    },
    _pullNodes: function(stage) {
        var tempNodes = this.tempNodes;
        for(var key in tempNodes) {
            var node = tempNodes[key];
            if(node.getStage() !== undefined && node.getStage()._id === stage._id) {
                stage._addId(node);
                stage._addName(node);
                this._removeTempNode(node);
            }
        }
    },
    _addTempNode: function(node) {
        this.tempNodes[node._id] = node;
    },
    _removeTempNode: function(node) {
        delete this.tempNodes[node._id];
    }
};
