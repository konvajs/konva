/**
 * KineticJS JavaScript Library @version
 * http://www.kineticjs.com/
 * Copyright 2012, Eric Rowell
 * Licensed under the MIT or GPL Version 2 licenses.
 * Date: @date
 *
 * Copyright (C) 2011 - 2012 by Eric Rowell
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var Kinetic = {};
Kinetic.Filters = {};
Kinetic.Plugins = {};
Kinetic.Global = {
    BUBBLE_WHITELIST: ['mousedown', 'mousemove', 'mouseup', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'click', 'dblclick', 'touchstart', 'touchmove', 'touchend', 'tap', 'dbltap', 'dragstart', 'dragmove', 'dragend'],
    BUFFER_WHITELIST: ['fill', 'stroke', 'textFill', 'textStroke'],
    BUFFER_BLACKLIST: ['shadow'],
    stages: [],
    idCounter: 0,
    tempNodes: {},
    //shapes hash.  rgb keys and shape values
    shapes: {},
    warn: function(str) {
        if(console && console.warn) {
            console.warn('Kinetic warning: ' + str);
        }
    },
    extend: function(c1, c2) {
        for(var key in c2.prototype) {
            if(!( key in c1.prototype)) {
                c1.prototype[key] = c2.prototype[key];
            }
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
