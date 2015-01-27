
/*
 * KonvaJS JavaScript Framework v@@version
 * http://lavrton.github.io/KonvaJS/
 * Licensed under the MIT or GPL Version 2 licenses.
 * Date: @@date
 *
 * Original work Copyright (C) 2011 - 2013 by Eric Rowell
 * Modified work Copyright (C) 2014 - 2015 by Anton Lavrenov
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
/**
 * @namespace Konva
 */
/*jshint -W079, -W020*/
var Konva = {};
(function(root) {
    var PI_OVER_180 = Math.PI / 180;

    Konva = {
        // public
        version: '@@version',

        // private
        stages: [],
        idCounter: 0,
        ids: {},
        names: {},
        shapes: {},
        listenClickTap: false,
        inDblClickWindow: false,

        // configurations
        enableTrace: false,
        traceArrMax: 100,
        dblClickWindow: 400,
        /**
         * Global pixel ratio configuration. KonvaJS automatically detect pixel ratio of current device.
         * But you may override such property, if you want to use your value.
         * @property pixelRatio
         * @default undefined
         * @memberof Konva
         * @example
         * Konva.pixelRatio = 1;
         */
        pixelRatio: undefined,
        /**
         * Drag distance property. If you start to drag a node you may want to wait until pointer is moved to some distance from start point,
         * only then start dragging.
         * @property dragDistance
         * @default 0
         * @memberof Konva
         * @example
         * Konva.dragDistance = 10;
         */
        dragDistance : 0,
        /**
         * Use degree values for angle properties. You may set this property to false if you want to use radiant values.
         * @property angleDeg
         * @default true
         * @memberof Konva
         * @example
         * node.rotation(45); // 45 degrees
         * Konva.angleDeg = false;
         * node.rotation(Math.PI / 2); // PI/2 radian
         */
        angleDeg: true,
         /**
         * Show different warnings about errors or wrong API usage
         * @property showWarnings
         * @default true
         * @memberof Konva
         * @example
         * Konva.showWarnings = false;
         */
        showWarnings : true,



        /**
         * @namespace Filters
         * @memberof Konva
         */
        Filters: {},

        /**
         * Node constructor. Nodes are entities that can be transformed, layered,
         * and have bound events. The stage, layers, groups, and shapes all extend Node.
         * @constructor
         * @memberof Konva
         * @abstract
         * @param {Object} config
         * @@nodeParams
         */
        Node: function(config) {
            this._init(config);
        },

        /**
         * Shape constructor.  Shapes are primitive objects such as rectangles,
         *  circles, text, lines, etc.
         * @constructor
         * @memberof Konva
         * @augments Konva.Node
         * @param {Object} config
         * @@shapeParams
         * @@nodeParams
         * @example
         * var customShape = new Konva.Shape({
         *   x: 5,
         *   y: 10,
         *   fill: 'red',
         *   // a Konva.Canvas renderer is passed into the drawFunc function
         *   drawFunc: function(context) {
         *     context.beginPath();
         *     context.moveTo(200, 50);
         *     context.lineTo(420, 80);
         *     context.quadraticCurveTo(300, 100, 260, 170);
         *     context.closePath();
         *     context.fillStrokeShape(this);
         *   }
         *});
         */
        Shape: function(config) {
            this.__init(config);
        },

        /**
         * Container constructor.&nbsp; Containers are used to contain nodes or other containers
         * @constructor
         * @memberof Konva
         * @augments Konva.Node
         * @abstract
         * @param {Object} config
         * @@nodeParams
         * @@containerParams
         */
        Container: function(config) {
            this.__init(config);
        },

        /**
         * Stage constructor.  A stage is used to contain multiple layers
         * @constructor
         * @memberof Konva
         * @augments Konva.Container
         * @param {Object} config
         * @param {String|Element} config.container Container id or DOM element
         * @@nodeParams
         * @example
         * var stage = new Konva.Stage({
         *   width: 500,
         *   height: 800,
         *   container: 'containerId'
         * });
         */
        Stage: function(config) {
            this.___init(config);
        },

        /**
         * BaseLayer constructor. 
         * @constructor
         * @memberof Konva
         * @augments Konva.Container
         * @param {Object} config
         * @param {Boolean} [config.clearBeforeDraw] set this property to false if you don't want
         * to clear the canvas before each layer draw.  The default value is true.
         * @@nodeParams
         * @@containerParams
         * @example
         * var layer = new Konva.Layer();
         */
        BaseLayer: function(config) {
            this.___init(config);
        },

        /**
         * Layer constructor.  Layers are tied to their own canvas element and are used
         * to contain groups or shapes.
         * @constructor
         * @memberof Konva
         * @augments Konva.BaseLayer
         * @param {Object} config
         * @param {Boolean} [config.clearBeforeDraw] set this property to false if you don't want
         * to clear the canvas before each layer draw.  The default value is true.
         * @@nodeParams
         * @@containerParams
         * @example
         * var layer = new Konva.Layer();
         */
        Layer: function(config) {
            this.____init(config);
        },

        /**
         * FastLayer constructor. Layers are tied to their own canvas element and are used
         * to contain shapes only.  If you don't need node nesting, mouse and touch interactions,
         * or event pub/sub, you should use FastLayer instead of Layer to create your layers.
         * It renders about 2x faster than normal layers.
         * @constructor
         * @memberof Konva
         * @augments Konva.BaseLayer
         * @param {Object} config
         * @param {Boolean} [config.clearBeforeDraw] set this property to false if you don't want
         * to clear the canvas before each layer draw.  The default value is true.
         * @param {Boolean} [config.visible]
         * @param {String} [config.id] unique id
         * @param {String} [config.name] non-unique name
         * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
         * @@containerParams
         * @example
         * var layer = new Konva.FastLayer();
         */
        FastLayer: function(config) {
            this.____init(config);
        },

        /**
         * Group constructor.  Groups are used to contain shapes or other groups.
         * @constructor
         * @memberof Konva
         * @augments Konva.Container
         * @param {Object} config
         * @@nodeParams
         * @@containerParams
         * @example
         * var group = new Konva.Group();
         */
        Group: function(config) {
            this.___init(config);
        },

        /**
         * returns whether or not drag and drop is currently active
         * @method
         * @memberof Konva
         */
        isDragging: function() {
            var dd = Konva.DD;

            // if DD is not included with the build, then
            // drag and drop is not even possible
            if (dd) {
                return dd.isDragging;
            } else {
                return false;
            }
        },
        /**
        * returns whether or not a drag and drop operation is ready, but may
        *  not necessarily have started
        * @method
        * @memberof Konva
        */
        isDragReady: function() {
            var dd = Konva.DD;

            // if DD is not included with the build, then
            // drag and drop is not even possible
            if (dd) {
                return !!dd.node;
            } else {
                return false;
            }
        },
        _addId: function(node, id) {
            if(id !== undefined) {
                this.ids[id] = node;
            }
        },
        _removeId: function(id) {
            if(id !== undefined) {
                delete this.ids[id];
            }
        },
        _addName: function(node, name) {
            if(name !== undefined) {

                var names = name.split(/\s/g);
                for(var n = 0; n < names.length; n++) {
                    var subname = names[n];
                    if (subname) {
                        if(this.names[subname] === undefined) {
                            this.names[subname] = [];
                        }
                        this.names[subname].push(node);
                    }
                }
            }
        },
        _removeName: function(name, _id) {
            if(name !== undefined) {
                var nodes = this.names[name];
                if(nodes !== undefined) {
                    for(var n = 0; n < nodes.length; n++) {
                        var no = nodes[n];
                        if(no._id === _id) {
                            nodes.splice(n, 1);
                        }
                    }
                    if(nodes.length === 0) {
                        delete this.names[name];
                    }
                }
            }
        },
        getAngle: function(angle) {
            return this.angleDeg ? angle * PI_OVER_180 : angle;
        },
        _parseUA: function(userAgent) {
            var ua = userAgent.toLowerCase(),
                // jQuery UA regex
                match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
                /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
                /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
                /(msie) ([\w.]+)/.exec( ua ) ||
                ua.indexOf('compatible') < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
                [],

                // adding mobile flag as well
                mobile = !!(userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i)),
                ieMobile = !!(userAgent.match(/IEMobile/i));
                
            return {
                browser: match[ 1 ] || '',
                version: match[ 2 ] || '0',

                // adding mobile flab
                mobile: mobile,
                ieMobile: ieMobile  // If this is true (i.e., WP8), then Konva touch events are executed instead of equivalent Konva mouse events
            };
        },
        // user agent  
        UA: undefined
    };

    Konva.UA = Konva._parseUA((root.navigator && root.navigator.userAgent) || '');
    
})(this);

// Uses Node, AMD or browser globals to create a module.

// If you want something that will work in other stricter CommonJS environments,
// or if you need to create a circular dependency, see commonJsStrict.js

// Defines a module "returnExports" that depends another module called "b".
// Note that the name of the module is implied by the file name. It is best
// if the file name and the exported global have matching names.

// If the 'b' module also uses this type of boilerplate, then
// in the browser, it will create a global .b that is used below.

// If you do not want to support the browser global path, then you
// can remove the `root` use and the passing `this` as the first arg to
// the top function.

// if the module has no dependencies, the above pattern can be simplified to
( function(root, factory) {
    if( typeof exports === 'object') {
        var KonvaJS = factory();
        // runtime-check for browserify
        if(global.window === global) {
            Konva.document = global.document;
            Konva.window = global;
        } else {
            // Node. Does not work with strict CommonJS, but
            // only CommonJS-like enviroments that support module.exports,
            // like Node.
            var Canvas = require('canvas');
            var jsdom = require('jsdom').jsdom;

            Konva.document = jsdom('<!DOCTYPE html><html><head></head><body></body></html>');
            Konva.window = Konva.document.createWindow();
            Konva.window.Image = Canvas.Image;
            Konva._nodeCanvas = Canvas;
        }

        Konva.root = root;
        module.exports = KonvaJS;
        return;
    }
    else if( typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    }
    Konva.document = document;
    Konva.window = window;
    Konva.root = root;

}(this, function() {

    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    return Konva;
}));
