(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Konva = factory());
}(this, (function () { 'use strict';

  /*
   * Konva JavaScript Framework v6.0.0
   * http://konvajs.org/
   * Licensed under the MIT
   * Date: Fri May 08 2020
   *
   * Original work Copyright (C) 2011 - 2013 by Eric Rowell (KineticJS)
   * Modified work Copyright (C) 2014 - present by Anton Lavrenov (Konva)
   *
   * @license
   */
  var PI_OVER_180 = Math.PI / 180;
  /**
   * @namespace Konva
   */
  function detectBrowser() {
      return (typeof window !== 'undefined' &&
          // browser case
          ({}.toString.call(window) === '[object Window]' ||
              // electron case
              {}.toString.call(window) === '[object global]'));
  }
  var _detectIE = function (ua) {
      var msie = ua.indexOf('msie ');
      if (msie > 0) {
          // IE 10 or older => return version number
          return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
      }
      var trident = ua.indexOf('trident/');
      if (trident > 0) {
          // IE 11 => return version number
          var rv = ua.indexOf('rv:');
          return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
      }
      var edge = ua.indexOf('edge/');
      if (edge > 0) {
          // Edge (IE 12+) => return version number
          return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
      }
      // other browser
      return false;
  };
  var _parseUA = function (userAgent) {
      var ua = userAgent.toLowerCase(), 
      // jQuery UA regex
      match = /(chrome)[ /]([\w.]+)/.exec(ua) ||
          /(webkit)[ /]([\w.]+)/.exec(ua) ||
          /(opera)(?:.*version|)[ /]([\w.]+)/.exec(ua) ||
          /(msie) ([\w.]+)/.exec(ua) ||
          (ua.indexOf('compatible') < 0 &&
              /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua)) ||
          [], 
      // adding mobile flag as well
      mobile = !!userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i), ieMobile = !!userAgent.match(/IEMobile/i);
      return {
          browser: match[1] || '',
          version: match[2] || '0',
          isIE: _detectIE(ua),
          // adding mobile flab
          mobile: mobile,
          ieMobile: ieMobile // If this is true (i.e., WP8), then Konva touch events are executed instead of equivalent Konva mouse events
      };
  };
  var glob = typeof global !== 'undefined'
      ? global
      : typeof window !== 'undefined'
          ? window
          : typeof WorkerGlobalScope !== 'undefined'
              ? self
              : {};
  var Konva = {
      _global: glob,
      version: '6.0.0',
      isBrowser: detectBrowser(),
      isUnminified: /param/.test(function (param) { }.toString()),
      dblClickWindow: 400,
      getAngle: function (angle) {
          return Konva.angleDeg ? angle * PI_OVER_180 : angle;
      },
      enableTrace: false,
      _pointerEventsEnabled: false,
      /**
       * Should we enable hit detection while dragging? For performance reasons, by default it is false.
       * But on some rare cases you want to see hit graph and check intersections. Just set it to true.
       * @property hitOnDragEnabled
       * @default false
       * @name hitOnDragEnabled
       * @memberof Konva
       * @example
       * Konva.hitOnDragEnabled = true;
       */
      hitOnDragEnabled: false,
      /**
       * Should we capture touch events and bind them to the touchstart target? That is how it works on DOM elements.
       * The case: we touchstart on div1, then touchmove out of that element into another element div2.
       * DOM will continue trigger touchmove events on div1 (not div2). Because events are "captured" into initial target.
       * By default Konva do not do that and will trigger touchmove on another element, while pointer is moving.
       * @property captureTouchEventsEnabled
       * @default false
       * @name captureTouchEventsEnabled
       * @memberof Konva
       * @example
       * Konva.captureTouchEventsEnabled = true;
       */
      captureTouchEventsEnabled: false,
      // TODO: move that to stage?
      listenClickTap: false,
      inDblClickWindow: false,
      /**
       * Global pixel ratio configuration. KonvaJS automatically detect pixel ratio of current device.
       * But you may override such property, if you want to use your value. Set this value before any components initializations.
       * @property pixelRatio
       * @default undefined
       * @name pixelRatio
       * @memberof Konva
       * @example
       * // before any Konva code:
       * Konva.pixelRatio = 1;
       */
      pixelRatio: undefined,
      /**
       * Drag distance property. If you start to drag a node you may want to wait until pointer is moved to some distance from start point,
       * only then start dragging. Default is 3px.
       * @property dragDistance
       * @default 0
       * @memberof Konva
       * @example
       * Konva.dragDistance = 10;
       */
      dragDistance: 3,
      /**
       * Use degree values for angle properties. You may set this property to false if you want to use radian values.
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
      showWarnings: true,
      /**
       * Configure what mouse buttons can be used for drag and drop.
       * Default value is [0] - only left mouse button.
       * @property dragButtons
       * @default true
       * @memberof Konva
       * @example
       * // enable left and right mouse buttons
       * Konva.dragButtons = [0, 2];
       */
      dragButtons: [0, 1],
      /**
       * returns whether or not drag and drop is currently active
       * @method
       * @memberof Konva
       */
      isDragging: function () {
          return Konva['DD'].isDragging;
      },
      /**
       * returns whether or not a drag and drop operation is ready, but may
       *  not necessarily have started
       * @method
       * @memberof Konva
       */
      isDragReady: function () {
          return !!Konva['DD'].node;
      },
      // user agent
      UA: _parseUA((glob.navigator && glob.navigator.userAgent) || ''),
      document: glob.document,
      // insert Konva into global namespace (window)
      // it is required for npm packages
      _injectGlobal: function (Konva) {
          glob.Konva = Konva;
      },
      _parseUA: _parseUA
  };
  var _NODES_REGISTRY = {};
  var _registerNode = function (NodeClass) {
      _NODES_REGISTRY[NodeClass.prototype.getClassName()] = NodeClass;
      Konva[NodeClass.prototype.getClassName()] = NodeClass;
  };

  /**
   * Collection constructor. Collection extends Array.
   * This class is used in conjunction with {@link Konva.Container#find}
   * The good thing about collection is that it has ALL methods of all Konva nodes. Take a look into examples.
   * @constructor
   * @memberof Konva
   * @example
   *
   * // find all rectangles and return them as Collection
   * const shapes = layer.find('Rect');
   * // fill all rectangles with a single function
   * shapes.fill('red');
   */
  var Collection = /** @class */ (function () {
      function Collection() {
      }
      /**
       * convert array into a collection
       * @method
       * @memberof Konva.Collection
       * @param {Array} arr
       */
      Collection.toCollection = function (arr) {
          var collection = new Collection(), len = arr.length, n;
          for (n = 0; n < len; n++) {
              collection.push(arr[n]);
          }
          return collection;
      };
      Collection._mapMethod = function (methodName) {
          Collection.prototype[methodName] = function () {
              var len = this.length, i;
              var args = [].slice.call(arguments);
              for (i = 0; i < len; i++) {
                  this[i][methodName].apply(this[i], args);
              }
              return this;
          };
      };
      Collection.mapMethods = function (constructor) {
          var prot = constructor.prototype;
          for (var methodName in prot) {
              Collection._mapMethod(methodName);
          }
      };
      return Collection;
  }());
  Collection.prototype = [];
  /**
   * iterate through node array and run a function for each node.
   *  The node and index is passed into the function
   * @method
   * @name Konva.Collection#each
   * @param {Function} func
   * @example
   * // get all nodes with name foo inside layer, and set x to 10 for each
   * layer.find('.foo').each(function(shape, n) {
   *   shape.setX(10);
   * });
   */
  Collection.prototype.each = function (func) {
      for (var n = 0; n < this.length; n++) {
          func(this[n], n);
      }
  };
  /**
   * convert collection into an array
   * @method
   * @name Konva.Collection#toArray
   */
  Collection.prototype.toArray = function () {
      var arr = [], len = this.length, n;
      for (n = 0; n < len; n++) {
          arr.push(this[n]);
      }
      return arr;
  };
  /*
   * Last updated November 2011
   * By Simon Sarris
   * www.simonsarris.com
   * sarris@acm.org
   *
   * Free to use and distribute at will
   * So long as you are nice to people, etc
   */
  /*
   * The usage of this class was inspired by some of the work done by a forked
   * project, KineticJS-Ext by Wappworks, which is based on Simon's Transform
   * class.  Modified by Eric Rowell
   */
  /**
   * Transform constructor.
   * In most of the cases you don't need to use it in your app. Because it is for internal usage in Konva core.
   * But there is a documentation for that class in case you still want
   * to make some manual calculations.
   * @constructor
   * @param {Array} [m] Optional six-element matrix
   * @memberof Konva
   */
  var Transform = /** @class */ (function () {
      function Transform(m) {
          if (m === void 0) { m = [1, 0, 0, 1, 0, 0]; }
          this.m = (m && m.slice()) || [1, 0, 0, 1, 0, 0];
      }
      /**
       * Copy Konva.Transform object
       * @method
       * @name Konva.Transform#copy
       * @returns {Konva.Transform}
       * @example
       * const tr = shape.getTransform().copy()
       */
      Transform.prototype.copy = function () {
          return new Transform(this.m);
      };
      /**
       * Transform point
       * @method
       * @name Konva.Transform#point
       * @param {Object} point 2D point(x, y)
       * @returns {Object} 2D point(x, y)
       */
      Transform.prototype.point = function (point) {
          var m = this.m;
          return {
              x: m[0] * point.x + m[2] * point.y + m[4],
              y: m[1] * point.x + m[3] * point.y + m[5]
          };
      };
      /**
       * Apply translation
       * @method
       * @name Konva.Transform#translate
       * @param {Number} x
       * @param {Number} y
       * @returns {Konva.Transform}
       */
      Transform.prototype.translate = function (x, y) {
          this.m[4] += this.m[0] * x + this.m[2] * y;
          this.m[5] += this.m[1] * x + this.m[3] * y;
          return this;
      };
      /**
       * Apply scale
       * @method
       * @name Konva.Transform#scale
       * @param {Number} sx
       * @param {Number} sy
       * @returns {Konva.Transform}
       */
      Transform.prototype.scale = function (sx, sy) {
          this.m[0] *= sx;
          this.m[1] *= sx;
          this.m[2] *= sy;
          this.m[3] *= sy;
          return this;
      };
      /**
       * Apply rotation
       * @method
       * @name Konva.Transform#rotate
       * @param {Number} rad  Angle in radians
       * @returns {Konva.Transform}
       */
      Transform.prototype.rotate = function (rad) {
          var c = Math.cos(rad);
          var s = Math.sin(rad);
          var m11 = this.m[0] * c + this.m[2] * s;
          var m12 = this.m[1] * c + this.m[3] * s;
          var m21 = this.m[0] * -s + this.m[2] * c;
          var m22 = this.m[1] * -s + this.m[3] * c;
          this.m[0] = m11;
          this.m[1] = m12;
          this.m[2] = m21;
          this.m[3] = m22;
          return this;
      };
      /**
       * Returns the translation
       * @method
       * @name Konva.Transform#getTranslation
       * @returns {Object} 2D point(x, y)
       */
      Transform.prototype.getTranslation = function () {
          return {
              x: this.m[4],
              y: this.m[5]
          };
      };
      /**
       * Apply skew
       * @method
       * @name Konva.Transform#skew
       * @param {Number} sx
       * @param {Number} sy
       * @returns {Konva.Transform}
       */
      Transform.prototype.skew = function (sx, sy) {
          var m11 = this.m[0] + this.m[2] * sy;
          var m12 = this.m[1] + this.m[3] * sy;
          var m21 = this.m[2] + this.m[0] * sx;
          var m22 = this.m[3] + this.m[1] * sx;
          this.m[0] = m11;
          this.m[1] = m12;
          this.m[2] = m21;
          this.m[3] = m22;
          return this;
      };
      /**
       * Transform multiplication
       * @method
       * @name Konva.Transform#multiply
       * @param {Konva.Transform} matrix
       * @returns {Konva.Transform}
       */
      Transform.prototype.multiply = function (matrix) {
          var m11 = this.m[0] * matrix.m[0] + this.m[2] * matrix.m[1];
          var m12 = this.m[1] * matrix.m[0] + this.m[3] * matrix.m[1];
          var m21 = this.m[0] * matrix.m[2] + this.m[2] * matrix.m[3];
          var m22 = this.m[1] * matrix.m[2] + this.m[3] * matrix.m[3];
          var dx = this.m[0] * matrix.m[4] + this.m[2] * matrix.m[5] + this.m[4];
          var dy = this.m[1] * matrix.m[4] + this.m[3] * matrix.m[5] + this.m[5];
          this.m[0] = m11;
          this.m[1] = m12;
          this.m[2] = m21;
          this.m[3] = m22;
          this.m[4] = dx;
          this.m[5] = dy;
          return this;
      };
      /**
       * Invert the matrix
       * @method
       * @name Konva.Transform#invert
       * @returns {Konva.Transform}
       */
      Transform.prototype.invert = function () {
          var d = 1 / (this.m[0] * this.m[3] - this.m[1] * this.m[2]);
          var m0 = this.m[3] * d;
          var m1 = -this.m[1] * d;
          var m2 = -this.m[2] * d;
          var m3 = this.m[0] * d;
          var m4 = d * (this.m[2] * this.m[5] - this.m[3] * this.m[4]);
          var m5 = d * (this.m[1] * this.m[4] - this.m[0] * this.m[5]);
          this.m[0] = m0;
          this.m[1] = m1;
          this.m[2] = m2;
          this.m[3] = m3;
          this.m[4] = m4;
          this.m[5] = m5;
          return this;
      };
      /**
       * return matrix
       * @method
       * @name Konva.Transform#getMatrix
       */
      Transform.prototype.getMatrix = function () {
          return this.m;
      };
      /**
       * set to absolute position via translation
       * @method
       * @name Konva.Transform#setAbsolutePosition
       * @returns {Konva.Transform}
       * @author ericdrowell
       */
      Transform.prototype.setAbsolutePosition = function (x, y) {
          var m0 = this.m[0], m1 = this.m[1], m2 = this.m[2], m3 = this.m[3], m4 = this.m[4], m5 = this.m[5], yt = (m0 * (y - m5) - m1 * (x - m4)) / (m0 * m3 - m1 * m2), xt = (x - m4 - m2 * yt) / m0;
          return this.translate(xt, yt);
      };
      /**
       * convert transformation matrix back into node's attributes
       * @method
       * @name Konva.Transform#decompose
       * @returns {Konva.Transform}
       */
      Transform.prototype.decompose = function () {
          var a = this.m[0];
          var b = this.m[1];
          var c = this.m[2];
          var d = this.m[3];
          var e = this.m[4];
          var f = this.m[5];
          var delta = a * d - b * c;
          var result = {
              x: e,
              y: f,
              rotation: 0,
              scaleX: 0,
              scaleY: 0,
              skewX: 0,
              skewY: 0
          };
          // Apply the QR-like decomposition.
          if (a != 0 || b != 0) {
              var r = Math.sqrt(a * a + b * b);
              result.rotation = b > 0 ? Math.acos(a / r) : -Math.acos(a / r);
              result.scaleX = r;
              result.scaleY = delta / r;
              result.skewX = (a * c + b * d) / delta;
              result.skewY = 0;
          }
          else if (c != 0 || d != 0) {
              var s = Math.sqrt(c * c + d * d);
              result.rotation =
                  Math.PI / 2 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s));
              result.scaleX = delta / s;
              result.scaleY = s;
              result.skewX = 0;
              result.skewY = (a * c + b * d) / delta;
          }
          result.rotation = Util._getRotation(result.rotation);
          return result;
      };
      return Transform;
  }());
  // CONSTANTS
  var OBJECT_ARRAY = '[object Array]', OBJECT_NUMBER = '[object Number]', OBJECT_STRING = '[object String]', OBJECT_BOOLEAN = '[object Boolean]', PI_OVER_DEG180 = Math.PI / 180, DEG180_OVER_PI = 180 / Math.PI, HASH = '#', EMPTY_STRING = '', ZERO = '0', KONVA_WARNING = 'Konva warning: ', KONVA_ERROR = 'Konva error: ', RGB_PAREN = 'rgb(', COLORS = {
      aliceblue: [240, 248, 255],
      antiquewhite: [250, 235, 215],
      aqua: [0, 255, 255],
      aquamarine: [127, 255, 212],
      azure: [240, 255, 255],
      beige: [245, 245, 220],
      bisque: [255, 228, 196],
      black: [0, 0, 0],
      blanchedalmond: [255, 235, 205],
      blue: [0, 0, 255],
      blueviolet: [138, 43, 226],
      brown: [165, 42, 42],
      burlywood: [222, 184, 135],
      cadetblue: [95, 158, 160],
      chartreuse: [127, 255, 0],
      chocolate: [210, 105, 30],
      coral: [255, 127, 80],
      cornflowerblue: [100, 149, 237],
      cornsilk: [255, 248, 220],
      crimson: [220, 20, 60],
      cyan: [0, 255, 255],
      darkblue: [0, 0, 139],
      darkcyan: [0, 139, 139],
      darkgoldenrod: [184, 132, 11],
      darkgray: [169, 169, 169],
      darkgreen: [0, 100, 0],
      darkgrey: [169, 169, 169],
      darkkhaki: [189, 183, 107],
      darkmagenta: [139, 0, 139],
      darkolivegreen: [85, 107, 47],
      darkorange: [255, 140, 0],
      darkorchid: [153, 50, 204],
      darkred: [139, 0, 0],
      darksalmon: [233, 150, 122],
      darkseagreen: [143, 188, 143],
      darkslateblue: [72, 61, 139],
      darkslategray: [47, 79, 79],
      darkslategrey: [47, 79, 79],
      darkturquoise: [0, 206, 209],
      darkviolet: [148, 0, 211],
      deeppink: [255, 20, 147],
      deepskyblue: [0, 191, 255],
      dimgray: [105, 105, 105],
      dimgrey: [105, 105, 105],
      dodgerblue: [30, 144, 255],
      firebrick: [178, 34, 34],
      floralwhite: [255, 255, 240],
      forestgreen: [34, 139, 34],
      fuchsia: [255, 0, 255],
      gainsboro: [220, 220, 220],
      ghostwhite: [248, 248, 255],
      gold: [255, 215, 0],
      goldenrod: [218, 165, 32],
      gray: [128, 128, 128],
      green: [0, 128, 0],
      greenyellow: [173, 255, 47],
      grey: [128, 128, 128],
      honeydew: [240, 255, 240],
      hotpink: [255, 105, 180],
      indianred: [205, 92, 92],
      indigo: [75, 0, 130],
      ivory: [255, 255, 240],
      khaki: [240, 230, 140],
      lavender: [230, 230, 250],
      lavenderblush: [255, 240, 245],
      lawngreen: [124, 252, 0],
      lemonchiffon: [255, 250, 205],
      lightblue: [173, 216, 230],
      lightcoral: [240, 128, 128],
      lightcyan: [224, 255, 255],
      lightgoldenrodyellow: [250, 250, 210],
      lightgray: [211, 211, 211],
      lightgreen: [144, 238, 144],
      lightgrey: [211, 211, 211],
      lightpink: [255, 182, 193],
      lightsalmon: [255, 160, 122],
      lightseagreen: [32, 178, 170],
      lightskyblue: [135, 206, 250],
      lightslategray: [119, 136, 153],
      lightslategrey: [119, 136, 153],
      lightsteelblue: [176, 196, 222],
      lightyellow: [255, 255, 224],
      lime: [0, 255, 0],
      limegreen: [50, 205, 50],
      linen: [250, 240, 230],
      magenta: [255, 0, 255],
      maroon: [128, 0, 0],
      mediumaquamarine: [102, 205, 170],
      mediumblue: [0, 0, 205],
      mediumorchid: [186, 85, 211],
      mediumpurple: [147, 112, 219],
      mediumseagreen: [60, 179, 113],
      mediumslateblue: [123, 104, 238],
      mediumspringgreen: [0, 250, 154],
      mediumturquoise: [72, 209, 204],
      mediumvioletred: [199, 21, 133],
      midnightblue: [25, 25, 112],
      mintcream: [245, 255, 250],
      mistyrose: [255, 228, 225],
      moccasin: [255, 228, 181],
      navajowhite: [255, 222, 173],
      navy: [0, 0, 128],
      oldlace: [253, 245, 230],
      olive: [128, 128, 0],
      olivedrab: [107, 142, 35],
      orange: [255, 165, 0],
      orangered: [255, 69, 0],
      orchid: [218, 112, 214],
      palegoldenrod: [238, 232, 170],
      palegreen: [152, 251, 152],
      paleturquoise: [175, 238, 238],
      palevioletred: [219, 112, 147],
      papayawhip: [255, 239, 213],
      peachpuff: [255, 218, 185],
      peru: [205, 133, 63],
      pink: [255, 192, 203],
      plum: [221, 160, 203],
      powderblue: [176, 224, 230],
      purple: [128, 0, 128],
      rebeccapurple: [102, 51, 153],
      red: [255, 0, 0],
      rosybrown: [188, 143, 143],
      royalblue: [65, 105, 225],
      saddlebrown: [139, 69, 19],
      salmon: [250, 128, 114],
      sandybrown: [244, 164, 96],
      seagreen: [46, 139, 87],
      seashell: [255, 245, 238],
      sienna: [160, 82, 45],
      silver: [192, 192, 192],
      skyblue: [135, 206, 235],
      slateblue: [106, 90, 205],
      slategray: [119, 128, 144],
      slategrey: [119, 128, 144],
      snow: [255, 255, 250],
      springgreen: [0, 255, 127],
      steelblue: [70, 130, 180],
      tan: [210, 180, 140],
      teal: [0, 128, 128],
      thistle: [216, 191, 216],
      transparent: [255, 255, 255, 0],
      tomato: [255, 99, 71],
      turquoise: [64, 224, 208],
      violet: [238, 130, 238],
      wheat: [245, 222, 179],
      white: [255, 255, 255],
      whitesmoke: [245, 245, 245],
      yellow: [255, 255, 0],
      yellowgreen: [154, 205, 5]
  }, RGB_REGEX = /rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)/, animQueue = [];
  /**
   * @namespace Util
   * @memberof Konva
   */
  var Util = {
      /*
       * cherry-picked utilities from underscore.js
       */
      _isElement: function (obj) {
          return !!(obj && obj.nodeType == 1);
      },
      _isFunction: function (obj) {
          return !!(obj && obj.constructor && obj.call && obj.apply);
      },
      _isPlainObject: function (obj) {
          return !!obj && obj.constructor === Object;
      },
      _isArray: function (obj) {
          return Object.prototype.toString.call(obj) === OBJECT_ARRAY;
      },
      _isNumber: function (obj) {
          return (Object.prototype.toString.call(obj) === OBJECT_NUMBER &&
              !isNaN(obj) &&
              isFinite(obj));
      },
      _isString: function (obj) {
          return Object.prototype.toString.call(obj) === OBJECT_STRING;
      },
      _isBoolean: function (obj) {
          return Object.prototype.toString.call(obj) === OBJECT_BOOLEAN;
      },
      // arrays are objects too
      isObject: function (val) {
          return val instanceof Object;
      },
      isValidSelector: function (selector) {
          if (typeof selector !== 'string') {
              return false;
          }
          var firstChar = selector[0];
          return (firstChar === '#' ||
              firstChar === '.' ||
              firstChar === firstChar.toUpperCase());
      },
      _sign: function (number) {
          if (number === 0) {
              return 0;
          }
          if (number > 0) {
              return 1;
          }
          else {
              return -1;
          }
      },
      requestAnimFrame: function (callback) {
          animQueue.push(callback);
          if (animQueue.length === 1) {
              requestAnimationFrame(function () {
                  var queue = animQueue;
                  animQueue = [];
                  queue.forEach(function (cb) {
                      cb();
                  });
              });
          }
      },
      createCanvasElement: function () {
          var canvas = document.createElement('canvas');
          // on some environments canvas.style is readonly
          try {
              canvas.style = canvas.style || {};
          }
          catch (e) { }
          return canvas;
      },
      createImageElement: function () {
          return document.createElement('img');
      },
      _isInDocument: function (el) {
          while ((el = el.parentNode)) {
              if (el == document) {
                  return true;
              }
          }
          return false;
      },
      _simplifyArray: function (arr) {
          var retArr = [], len = arr.length, util = Util, n, val;
          for (n = 0; n < len; n++) {
              val = arr[n];
              if (util._isNumber(val)) {
                  val = Math.round(val * 1000) / 1000;
              }
              else if (!util._isString(val)) {
                  val = val.toString();
              }
              retArr.push(val);
          }
          return retArr;
      },
      /*
       * arg can be an image object or image data
       */
      _urlToImage: function (url, callback) {
          // if arg is a string, then it's a data url
          var imageObj = new glob.Image();
          imageObj.onload = function () {
              callback(imageObj);
          };
          imageObj.src = url;
      },
      _rgbToHex: function (r, g, b) {
          return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
      },
      _hexToRgb: function (hex) {
          hex = hex.replace(HASH, EMPTY_STRING);
          var bigint = parseInt(hex, 16);
          return {
              r: (bigint >> 16) & 255,
              g: (bigint >> 8) & 255,
              b: bigint & 255
          };
      },
      /**
       * return random hex color
       * @method
       * @memberof Konva.Util
       * @example
       * shape.fill(Konva.Util.getRandomColor());
       */
      getRandomColor: function () {
          var randColor = ((Math.random() * 0xffffff) << 0).toString(16);
          while (randColor.length < 6) {
              randColor = ZERO + randColor;
          }
          return HASH + randColor;
      },
      get: function (val, def) {
          if (val === undefined) {
              return def;
          }
          else {
              return val;
          }
      },
      /**
       * get RGB components of a color
       * @method
       * @memberof Konva.Util
       * @param {String} color
       * @example
       * // each of the following examples return {r:0, g:0, b:255}
       * var rgb = Konva.Util.getRGB('blue');
       * var rgb = Konva.Util.getRGB('#0000ff');
       * var rgb = Konva.Util.getRGB('rgb(0,0,255)');
       */
      getRGB: function (color) {
          var rgb;
          // color string
          if (color in COLORS) {
              rgb = COLORS[color];
              return {
                  r: rgb[0],
                  g: rgb[1],
                  b: rgb[2]
              };
          }
          else if (color[0] === HASH) {
              // hex
              return this._hexToRgb(color.substring(1));
          }
          else if (color.substr(0, 4) === RGB_PAREN) {
              // rgb string
              rgb = RGB_REGEX.exec(color.replace(/ /g, ''));
              return {
                  r: parseInt(rgb[1], 10),
                  g: parseInt(rgb[2], 10),
                  b: parseInt(rgb[3], 10)
              };
          }
          else {
              // default
              return {
                  r: 0,
                  g: 0,
                  b: 0
              };
          }
      },
      // convert any color string to RGBA object
      // from https://github.com/component/color-parser
      colorToRGBA: function (str) {
          str = str || 'black';
          return (Util._namedColorToRBA(str) ||
              Util._hex3ColorToRGBA(str) ||
              Util._hex6ColorToRGBA(str) ||
              Util._rgbColorToRGBA(str) ||
              Util._rgbaColorToRGBA(str) ||
              Util._hslColorToRGBA(str));
      },
      // Parse named css color. Like "green"
      _namedColorToRBA: function (str) {
          var c = COLORS[str.toLowerCase()];
          if (!c) {
              return null;
          }
          return {
              r: c[0],
              g: c[1],
              b: c[2],
              a: 1
          };
      },
      // Parse rgb(n, n, n)
      _rgbColorToRGBA: function (str) {
          if (str.indexOf('rgb(') === 0) {
              str = str.match(/rgb\(([^)]+)\)/)[1];
              var parts = str.split(/ *, */).map(Number);
              return {
                  r: parts[0],
                  g: parts[1],
                  b: parts[2],
                  a: 1
              };
          }
      },
      // Parse rgba(n, n, n, n)
      _rgbaColorToRGBA: function (str) {
          if (str.indexOf('rgba(') === 0) {
              str = str.match(/rgba\(([^)]+)\)/)[1];
              var parts = str.split(/ *, */).map(Number);
              return {
                  r: parts[0],
                  g: parts[1],
                  b: parts[2],
                  a: parts[3]
              };
          }
      },
      // Parse #nnnnnn
      _hex6ColorToRGBA: function (str) {
          if (str[0] === '#' && str.length === 7) {
              return {
                  r: parseInt(str.slice(1, 3), 16),
                  g: parseInt(str.slice(3, 5), 16),
                  b: parseInt(str.slice(5, 7), 16),
                  a: 1
              };
          }
      },
      // Parse #nnn
      _hex3ColorToRGBA: function (str) {
          if (str[0] === '#' && str.length === 4) {
              return {
                  r: parseInt(str[1] + str[1], 16),
                  g: parseInt(str[2] + str[2], 16),
                  b: parseInt(str[3] + str[3], 16),
                  a: 1
              };
          }
      },
      // Code adapted from https://github.com/Qix-/color-convert/blob/master/conversions.js#L244
      _hslColorToRGBA: function (str) {
          // Check hsl() format
          if (/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.test(str)) {
              // Extract h, s, l
              var _a = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(str), _ = _a[0], hsl = _a.slice(1);
              var h = Number(hsl[0]) / 360;
              var s = Number(hsl[1]) / 100;
              var l = Number(hsl[2]) / 100;
              var t2 = void 0;
              var t3 = void 0;
              var val = void 0;
              if (s === 0) {
                  val = l * 255;
                  return {
                      r: Math.round(val),
                      g: Math.round(val),
                      b: Math.round(val),
                      a: 1
                  };
              }
              if (l < 0.5) {
                  t2 = l * (1 + s);
              }
              else {
                  t2 = l + s - l * s;
              }
              var t1 = 2 * l - t2;
              var rgb = [0, 0, 0];
              for (var i = 0; i < 3; i++) {
                  t3 = h + (1 / 3) * -(i - 1);
                  if (t3 < 0) {
                      t3++;
                  }
                  if (t3 > 1) {
                      t3--;
                  }
                  if (6 * t3 < 1) {
                      val = t1 + (t2 - t1) * 6 * t3;
                  }
                  else if (2 * t3 < 1) {
                      val = t2;
                  }
                  else if (3 * t3 < 2) {
                      val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
                  }
                  else {
                      val = t1;
                  }
                  rgb[i] = val * 255;
              }
              return {
                  r: Math.round(rgb[0]),
                  g: Math.round(rgb[1]),
                  b: Math.round(rgb[2]),
                  a: 1
              };
          }
      },
      /**
       * check intersection of two client rectangles
       * @method
       * @memberof Konva.Util
       * @param {Object} r1 - { x, y, width, height } client rectangle
       * @param {Object} r2 - { x, y, width, height } client rectangle
       * @example
       * const overlapping = Konva.Util.haveIntersection(shape1.getClientRect(), shape2.getClientRect());
       */
      haveIntersection: function (r1, r2) {
          return !(r2.x > r1.x + r1.width ||
              r2.x + r2.width < r1.x ||
              r2.y > r1.y + r1.height ||
              r2.y + r2.height < r1.y);
      },
      cloneObject: function (obj) {
          var retObj = {};
          for (var key in obj) {
              if (this._isPlainObject(obj[key])) {
                  retObj[key] = this.cloneObject(obj[key]);
              }
              else if (this._isArray(obj[key])) {
                  retObj[key] = this.cloneArray(obj[key]);
              }
              else {
                  retObj[key] = obj[key];
              }
          }
          return retObj;
      },
      cloneArray: function (arr) {
          return arr.slice(0);
      },
      _degToRad: function (deg) {
          return deg * PI_OVER_DEG180;
      },
      _radToDeg: function (rad) {
          return rad * DEG180_OVER_PI;
      },
      _getRotation: function (radians) {
          return Konva.angleDeg ? Util._radToDeg(radians) : radians;
      },
      _capitalize: function (str) {
          return str.charAt(0).toUpperCase() + str.slice(1);
      },
      throw: function (str) {
          throw new Error(KONVA_ERROR + str);
      },
      error: function (str) {
          console.error(KONVA_ERROR + str);
      },
      warn: function (str) {
          if (!Konva.showWarnings) {
              return;
          }
          console.warn(KONVA_WARNING + str);
      },
      extend: function (child, parent) {
          function Ctor() {
              this.constructor = child;
          }
          Ctor.prototype = parent.prototype;
          var oldProto = child.prototype;
          child.prototype = new Ctor();
          for (var key in oldProto) {
              if (oldProto.hasOwnProperty(key)) {
                  child.prototype[key] = oldProto[key];
              }
          }
          child.__super__ = parent.prototype;
          // create reference to parent
          child.super = parent;
      },
      _getControlPoints: function (x0, y0, x1, y1, x2, y2, t) {
          var d01 = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2)), d12 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)), fa = (t * d01) / (d01 + d12), fb = (t * d12) / (d01 + d12), p1x = x1 - fa * (x2 - x0), p1y = y1 - fa * (y2 - y0), p2x = x1 + fb * (x2 - x0), p2y = y1 + fb * (y2 - y0);
          return [p1x, p1y, p2x, p2y];
      },
      _expandPoints: function (p, tension) {
          var len = p.length, allPoints = [], n, cp;
          for (n = 2; n < len - 2; n += 2) {
              cp = Util._getControlPoints(p[n - 2], p[n - 1], p[n], p[n + 1], p[n + 2], p[n + 3], tension);
              allPoints.push(cp[0]);
              allPoints.push(cp[1]);
              allPoints.push(p[n]);
              allPoints.push(p[n + 1]);
              allPoints.push(cp[2]);
              allPoints.push(cp[3]);
          }
          return allPoints;
      },
      each: function (obj, func) {
          for (var key in obj) {
              func(key, obj[key]);
          }
      },
      _inRange: function (val, left, right) {
          return left <= val && val < right;
      },
      _getProjectionToSegment: function (x1, y1, x2, y2, x3, y3) {
          var x, y, dist;
          var pd2 = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
          if (pd2 == 0) {
              x = x1;
              y = y1;
              dist = (x3 - x2) * (x3 - x2) + (y3 - y2) * (y3 - y2);
          }
          else {
              var u = ((x3 - x1) * (x2 - x1) + (y3 - y1) * (y2 - y1)) / pd2;
              if (u < 0) {
                  x = x1;
                  y = y1;
                  dist = (x1 - x3) * (x1 - x3) + (y1 - y3) * (y1 - y3);
              }
              else if (u > 1.0) {
                  x = x2;
                  y = y2;
                  dist = (x2 - x3) * (x2 - x3) + (y2 - y3) * (y2 - y3);
              }
              else {
                  x = x1 + u * (x2 - x1);
                  y = y1 + u * (y2 - y1);
                  dist = (x - x3) * (x - x3) + (y - y3) * (y - y3);
              }
          }
          return [x, y, dist];
      },
      // line as array of points.
      // line might be closed
      _getProjectionToLine: function (pt, line, isClosed) {
          var pc = Util.cloneObject(pt);
          var dist = Number.MAX_VALUE;
          line.forEach(function (p1, i) {
              if (!isClosed && i === line.length - 1) {
                  return;
              }
              var p2 = line[(i + 1) % line.length];
              var proj = Util._getProjectionToSegment(p1.x, p1.y, p2.x, p2.y, pt.x, pt.y);
              var px = proj[0], py = proj[1], pdist = proj[2];
              if (pdist < dist) {
                  pc.x = px;
                  pc.y = py;
                  dist = pdist;
              }
          });
          return pc;
      },
      _prepareArrayForTween: function (startArray, endArray, isClosed) {
          var n, start = [], end = [];
          if (startArray.length > endArray.length) {
              var temp = endArray;
              endArray = startArray;
              startArray = temp;
          }
          for (n = 0; n < startArray.length; n += 2) {
              start.push({
                  x: startArray[n],
                  y: startArray[n + 1]
              });
          }
          for (n = 0; n < endArray.length; n += 2) {
              end.push({
                  x: endArray[n],
                  y: endArray[n + 1]
              });
          }
          var newStart = [];
          end.forEach(function (point) {
              var pr = Util._getProjectionToLine(point, start, isClosed);
              newStart.push(pr.x);
              newStart.push(pr.y);
          });
          return newStart;
      },
      _prepareToStringify: function (obj) {
          var desc;
          obj.visitedByCircularReferenceRemoval = true;
          for (var key in obj) {
              if (!(obj.hasOwnProperty(key) && obj[key] && typeof obj[key] == 'object')) {
                  continue;
              }
              desc = Object.getOwnPropertyDescriptor(obj, key);
              if (obj[key].visitedByCircularReferenceRemoval ||
                  Util._isElement(obj[key])) {
                  if (desc.configurable) {
                      delete obj[key];
                  }
                  else {
                      return null;
                  }
              }
              else if (Util._prepareToStringify(obj[key]) === null) {
                  if (desc.configurable) {
                      delete obj[key];
                  }
                  else {
                      return null;
                  }
              }
          }
          delete obj.visitedByCircularReferenceRemoval;
          return obj;
      },
      // very simplified version of Object.assign
      _assign: function (target, source) {
          for (var key in source) {
              target[key] = source[key];
          }
          return target;
      },
      _getFirstPointerId: function (evt) {
          if (!evt.touches) {
              // fake id for mouse
              return 999;
          }
          else {
              return evt.changedTouches[0].identifier;
          }
      }
  };

  function _formatValue(val) {
      if (Util._isString(val)) {
          return '"' + val + '"';
      }
      if (Object.prototype.toString.call(val) === '[object Number]') {
          return val;
      }
      if (Util._isBoolean(val)) {
          return val;
      }
      return Object.prototype.toString.call(val);
  }
  function RGBComponent(val) {
      if (val > 255) {
          return 255;
      }
      else if (val < 0) {
          return 0;
      }
      return Math.round(val);
  }
  function getNumberValidator() {
      if (Konva.isUnminified) {
          return function (val, attr) {
              if (!Util._isNumber(val)) {
                  Util.warn(_formatValue(val) +
                      ' is a not valid value for "' +
                      attr +
                      '" attribute. The value should be a number.');
              }
              return val;
          };
      }
  }
  function getNumberOrAutoValidator() {
      if (Konva.isUnminified) {
          return function (val, attr) {
              var isNumber = Util._isNumber(val);
              var isAuto = val === 'auto';
              if (!(isNumber || isAuto)) {
                  Util.warn(_formatValue(val) +
                      ' is a not valid value for "' +
                      attr +
                      '" attribute. The value should be a number or "auto".');
              }
              return val;
          };
      }
  }
  function getStringValidator() {
      if (Konva.isUnminified) {
          return function (val, attr) {
              if (!Util._isString(val)) {
                  Util.warn(_formatValue(val) +
                      ' is a not valid value for "' +
                      attr +
                      '" attribute. The value should be a string.');
              }
              return val;
          };
      }
  }
  function getNumberArrayValidator() {
      if (Konva.isUnminified) {
          return function (val, attr) {
              if (!Util._isArray(val)) {
                  Util.warn(_formatValue(val) +
                      ' is a not valid value for "' +
                      attr +
                      '" attribute. The value should be a array of numbers.');
              }
              else {
                  val.forEach(function (item) {
                      if (!Util._isNumber(item)) {
                          Util.warn('"' +
                              attr +
                              '" attribute has non numeric element ' +
                              item +
                              '. Make sure that all elements are numbers.');
                      }
                  });
              }
              return val;
          };
      }
  }
  function getBooleanValidator() {
      if (Konva.isUnminified) {
          return function (val, attr) {
              var isBool = val === true || val === false;
              if (!isBool) {
                  Util.warn(_formatValue(val) +
                      ' is a not valid value for "' +
                      attr +
                      '" attribute. The value should be a boolean.');
              }
              return val;
          };
      }
  }
  function getComponentValidator(components) {
      if (Konva.isUnminified) {
          return function (val, attr) {
              if (!Util.isObject(val)) {
                  Util.warn(_formatValue(val) +
                      ' is a not valid value for "' +
                      attr +
                      '" attribute. The value should be an object with properties ' +
                      components);
              }
              return val;
          };
      }
  }

  var GET = 'get', SET = 'set';
  var Factory = {
      addGetterSetter: function (constructor, attr, def, validator, after) {
          this.addGetter(constructor, attr, def);
          this.addSetter(constructor, attr, validator, after);
          this.addOverloadedGetterSetter(constructor, attr);
      },
      addGetter: function (constructor, attr, def) {
          var method = GET + Util._capitalize(attr);
          constructor.prototype[method] =
              constructor.prototype[method] ||
                  function () {
                      var val = this.attrs[attr];
                      return val === undefined ? def : val;
                  };
      },
      addSetter: function (constructor, attr, validator, after) {
          var method = SET + Util._capitalize(attr);
          if (!constructor.prototype[method]) {
              Factory.overWriteSetter(constructor, attr, validator, after);
          }
      },
      overWriteSetter: function (constructor, attr, validator, after) {
          var method = SET + Util._capitalize(attr);
          constructor.prototype[method] = function (val) {
              if (validator && val !== undefined && val !== null) {
                  val = validator.call(this, val, attr);
              }
              this._setAttr(attr, val);
              if (after) {
                  after.call(this);
              }
              return this;
          };
      },
      addComponentsGetterSetter: function (constructor, attr, components, validator, after) {
          var len = components.length, capitalize = Util._capitalize, getter = GET + capitalize(attr), setter = SET + capitalize(attr), n, component;
          // getter
          constructor.prototype[getter] = function () {
              var ret = {};
              for (n = 0; n < len; n++) {
                  component = components[n];
                  ret[component] = this.getAttr(attr + capitalize(component));
              }
              return ret;
          };
          var basicValidator = getComponentValidator(components);
          // setter
          constructor.prototype[setter] = function (val) {
              var oldVal = this.attrs[attr], key;
              if (validator) {
                  val = validator.call(this, val);
              }
              if (basicValidator) {
                  basicValidator.call(this, val, attr);
              }
              for (key in val) {
                  if (!val.hasOwnProperty(key)) {
                      continue;
                  }
                  this._setAttr(attr + capitalize(key), val[key]);
              }
              this._fireChangeEvent(attr, oldVal, val);
              if (after) {
                  after.call(this);
              }
              return this;
          };
          this.addOverloadedGetterSetter(constructor, attr);
      },
      addOverloadedGetterSetter: function (constructor, attr) {
          var capitalizedAttr = Util._capitalize(attr), setter = SET + capitalizedAttr, getter = GET + capitalizedAttr;
          constructor.prototype[attr] = function () {
              // setting
              if (arguments.length) {
                  this[setter](arguments[0]);
                  return this;
              }
              // getting
              return this[getter]();
          };
      },
      addDeprecatedGetterSetter: function (constructor, attr, def, validator) {
          Util.error('Adding deprecated ' + attr);
          var method = GET + Util._capitalize(attr);
          var message = attr +
              ' property is deprecated and will be removed soon. Look at Konva change log for more information.';
          constructor.prototype[method] = function () {
              Util.error(message);
              var val = this.attrs[attr];
              return val === undefined ? def : val;
          };
          this.addSetter(constructor, attr, validator, function () {
              Util.error(message);
          });
          this.addOverloadedGetterSetter(constructor, attr);
      },
      backCompat: function (constructor, methods) {
          Util.each(methods, function (oldMethodName, newMethodName) {
              var method = constructor.prototype[newMethodName];
              var oldGetter = GET + Util._capitalize(oldMethodName);
              var oldSetter = SET + Util._capitalize(oldMethodName);
              function deprecated() {
                  method.apply(this, arguments);
                  Util.error('"' +
                      oldMethodName +
                      '" method is deprecated and will be removed soon. Use ""' +
                      newMethodName +
                      '" instead.');
              }
              constructor.prototype[oldMethodName] = deprecated;
              constructor.prototype[oldGetter] = deprecated;
              constructor.prototype[oldSetter] = deprecated;
          });
      },
      afterSetFilter: function () {
          this._filterUpToDate = false;
      }
  };

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  /* global Reflect, Promise */

  var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return extendStatics(d, b);
  };

  function __extends(d, b) {
      extendStatics(d, b);
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }

  var __assign = function() {
      __assign = Object.assign || function __assign(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
              s = arguments[i];
              for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
          }
          return t;
      };
      return __assign.apply(this, arguments);
  };

  function __spreadArrays() {
      for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
      for (var r = Array(s), k = 0, i = 0; i < il; i++)
          for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
              r[k] = a[j];
      return r;
  }

  var COMMA = ',', OPEN_PAREN = '(', CLOSE_PAREN = ')', OPEN_PAREN_BRACKET = '([', CLOSE_BRACKET_PAREN = '])', SEMICOLON = ';', DOUBLE_PAREN = '()', 
  // EMPTY_STRING = '',
  EQUALS = '=', 
  // SET = 'set',
  CONTEXT_METHODS = [
      'arc',
      'arcTo',
      'beginPath',
      'bezierCurveTo',
      'clearRect',
      'clip',
      'closePath',
      'createLinearGradient',
      'createPattern',
      'createRadialGradient',
      'drawImage',
      'ellipse',
      'fill',
      'fillText',
      'getImageData',
      'createImageData',
      'lineTo',
      'moveTo',
      'putImageData',
      'quadraticCurveTo',
      'rect',
      'restore',
      'rotate',
      'save',
      'scale',
      'setLineDash',
      'setTransform',
      'stroke',
      'strokeText',
      'transform',
      'translate'
  ];
  var CONTEXT_PROPERTIES = [
      'fillStyle',
      'strokeStyle',
      'shadowColor',
      'shadowBlur',
      'shadowOffsetX',
      'shadowOffsetY',
      'lineCap',
      'lineDashOffset',
      'lineJoin',
      'lineWidth',
      'miterLimit',
      'font',
      'textAlign',
      'textBaseline',
      'globalAlpha',
      'globalCompositeOperation',
      'imageSmoothingEnabled'
  ];
  var traceArrMax = 100;
  /**
   * Konva wrapper around native 2d canvas context. It has almost the same API of 2d context with some additional functions.
   * With core Konva shapes you don't need to use this object. But you will use it if you want to create
   * a [custom shape](/docs/react/Custom_Shape.html) or a [custom hit regions](/docs/events/Custom_Hit_Region.html).
   * For full information about each 2d context API use [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
   * @constructor
   * @memberof Konva
   * @example
   * const rect = new Konva.Shape({
   *    fill: 'red',
   *    width: 100,
   *    height: 100,
   *    sceneFunc: (ctx, shape) => {
   *      // ctx - is context wrapper
   *      // shape - is instance of Konva.Shape, so it equals to "rect" variable
   *      ctx.rect(0, 0, shape.getAttr('width'), shape.getAttr('height'));
   *
   *      // automatically fill shape from props and draw hit region
   *      ctx.fillStrokeShape(shape);
   *    }
   * })
   */
  var Context = /** @class */ (function () {
      function Context(canvas) {
          this.canvas = canvas;
          this._context = canvas._canvas.getContext('2d');
          if (Konva.enableTrace) {
              this.traceArr = [];
              this._enableTrace();
          }
      }
      /**
       * fill shape
       * @method
       * @name Konva.Context#fillShape
       * @param {Konva.Shape} shape
       */
      Context.prototype.fillShape = function (shape) {
          if (shape.fillEnabled()) {
              this._fill(shape);
          }
      };
      Context.prototype._fill = function (shape) {
          // abstract
      };
      /**
       * stroke shape
       * @method
       * @name Konva.Context#strokeShape
       * @param {Konva.Shape} shape
       */
      Context.prototype.strokeShape = function (shape) {
          if (shape.hasStroke()) {
              this._stroke(shape);
          }
      };
      Context.prototype._stroke = function (shape) {
          // abstract
      };
      /**
       * fill then stroke
       * @method
       * @name Konva.Context#fillStrokeShape
       * @param {Konva.Shape} shape
       */
      Context.prototype.fillStrokeShape = function (shape) {
          this.fillShape(shape);
          this.strokeShape(shape);
      };
      Context.prototype.getTrace = function (relaxed) {
          var traceArr = this.traceArr, len = traceArr.length, str = '', n, trace, method, args;
          for (n = 0; n < len; n++) {
              trace = traceArr[n];
              method = trace.method;
              // methods
              if (method) {
                  args = trace.args;
                  str += method;
                  if (relaxed) {
                      str += DOUBLE_PAREN;
                  }
                  else {
                      if (Util._isArray(args[0])) {
                          str += OPEN_PAREN_BRACKET + args.join(COMMA) + CLOSE_BRACKET_PAREN;
                      }
                      else {
                          str += OPEN_PAREN + args.join(COMMA) + CLOSE_PAREN;
                      }
                  }
              }
              else {
                  // properties
                  str += trace.property;
                  if (!relaxed) {
                      str += EQUALS + trace.val;
                  }
              }
              str += SEMICOLON;
          }
          return str;
      };
      Context.prototype.clearTrace = function () {
          this.traceArr = [];
      };
      Context.prototype._trace = function (str) {
          var traceArr = this.traceArr, len;
          traceArr.push(str);
          len = traceArr.length;
          if (len >= traceArrMax) {
              traceArr.shift();
          }
      };
      /**
       * reset canvas context transform
       * @method
       * @name Konva.Context#reset
       */
      Context.prototype.reset = function () {
          var pixelRatio = this.getCanvas().getPixelRatio();
          this.setTransform(1 * pixelRatio, 0, 0, 1 * pixelRatio, 0, 0);
      };
      /**
       * get canvas wrapper
       * @method
       * @name Konva.Context#getCanvas
       * @returns {Konva.Canvas}
       */
      Context.prototype.getCanvas = function () {
          return this.canvas;
      };
      /**
       * clear canvas
       * @method
       * @name Konva.Context#clear
       * @param {Object} [bounds]
       * @param {Number} [bounds.x]
       * @param {Number} [bounds.y]
       * @param {Number} [bounds.width]
       * @param {Number} [bounds.height]
       */
      Context.prototype.clear = function (bounds) {
          var canvas = this.getCanvas();
          if (bounds) {
              this.clearRect(bounds.x || 0, bounds.y || 0, bounds.width || 0, bounds.height || 0);
          }
          else {
              this.clearRect(0, 0, canvas.getWidth() / canvas.pixelRatio, canvas.getHeight() / canvas.pixelRatio);
          }
      };
      Context.prototype._applyLineCap = function (shape) {
          var lineCap = shape.getLineCap();
          if (lineCap) {
              this.setAttr('lineCap', lineCap);
          }
      };
      Context.prototype._applyOpacity = function (shape) {
          var absOpacity = shape.getAbsoluteOpacity();
          if (absOpacity !== 1) {
              this.setAttr('globalAlpha', absOpacity);
          }
      };
      Context.prototype._applyLineJoin = function (shape) {
          var lineJoin = shape.getLineJoin();
          if (lineJoin) {
              this.setAttr('lineJoin', lineJoin);
          }
      };
      Context.prototype.setAttr = function (attr, val) {
          this._context[attr] = val;
      };
      /**
       * arc function.
       * @method
       * @name Konva.Context#arc
       */
      Context.prototype.arc = function (a0, a1, a2, a3, a4, a5) {
          this._context.arc(a0, a1, a2, a3, a4, a5);
      };
      /**
       * arcTo function.
       * @method
       * @name Konva.Context#arcTo
       */
      Context.prototype.arcTo = function (a0, a1, a2, a3, a4) {
          this._context.arcTo(a0, a1, a2, a3, a4);
      };
      /**
       * beginPath function.
       * @method
       * @name Konva.Context#beginPath
       */
      Context.prototype.beginPath = function () {
          this._context.beginPath();
      };
      /**
       * bezierCurveTo function.
       * @method
       * @name Konva.Context#bezierCurveTo
       */
      Context.prototype.bezierCurveTo = function (a0, a1, a2, a3, a4, a5) {
          this._context.bezierCurveTo(a0, a1, a2, a3, a4, a5);
      };
      /**
       * clearRect function.
       * @method
       * @name Konva.Context#clearRect
       */
      Context.prototype.clearRect = function (a0, a1, a2, a3) {
          this._context.clearRect(a0, a1, a2, a3);
      };
      /**
       * clip function.
       * @method
       * @name Konva.Context#clip
       */
      Context.prototype.clip = function () {
          this._context.clip();
      };
      /**
       * closePath function.
       * @method
       * @name Konva.Context#closePath
       */
      Context.prototype.closePath = function () {
          this._context.closePath();
      };
      /**
       * createImageData function.
       * @method
       * @name Konva.Context#createImageData
       */
      Context.prototype.createImageData = function (a0, a1) {
          var a = arguments;
          if (a.length === 2) {
              return this._context.createImageData(a0, a1);
          }
          else if (a.length === 1) {
              return this._context.createImageData(a0);
          }
      };
      /**
       * createLinearGradient function.
       * @method
       * @name Konva.Context#createLinearGradient
       */
      Context.prototype.createLinearGradient = function (a0, a1, a2, a3) {
          return this._context.createLinearGradient(a0, a1, a2, a3);
      };
      /**
       * createPattern function.
       * @method
       * @name Konva.Context#createPattern
       */
      Context.prototype.createPattern = function (a0, a1) {
          return this._context.createPattern(a0, a1);
      };
      /**
       * createRadialGradient function.
       * @method
       * @name Konva.Context#createRadialGradient
       */
      Context.prototype.createRadialGradient = function (a0, a1, a2, a3, a4, a5) {
          return this._context.createRadialGradient(a0, a1, a2, a3, a4, a5);
      };
      /**
       * drawImage function.
       * @method
       * @name Konva.Context#drawImage
       */
      Context.prototype.drawImage = function (a0, a1, a2, a3, a4, a5, a6, a7, a8) {
          var a = arguments, _context = this._context;
          if (a.length === 3) {
              _context.drawImage(a0, a1, a2);
          }
          else if (a.length === 5) {
              _context.drawImage(a0, a1, a2, a3, a4);
          }
          else if (a.length === 9) {
              _context.drawImage(a0, a1, a2, a3, a4, a5, a6, a7, a8);
          }
      };
      /**
       * ellipse function.
       * @method
       * @name Konva.Context#ellipse
       */
      Context.prototype.ellipse = function (a0, a1, a2, a3, a4, a5, a6, a7) {
          this._context.ellipse(a0, a1, a2, a3, a4, a5, a6, a7);
      };
      /**
       * isPointInPath function.
       * @method
       * @name Konva.Context#isPointInPath
       */
      Context.prototype.isPointInPath = function (x, y) {
          return this._context.isPointInPath(x, y);
      };
      /**
       * fill function.
       * @method
       * @name Konva.Context#fill
       */
      Context.prototype.fill = function () {
          this._context.fill();
      };
      /**
       * fillRect function.
       * @method
       * @name Konva.Context#fillRect
       */
      Context.prototype.fillRect = function (x, y, width, height) {
          this._context.fillRect(x, y, width, height);
      };
      /**
       * strokeRect function.
       * @method
       * @name Konva.Context#strokeRect
       */
      Context.prototype.strokeRect = function (x, y, width, height) {
          this._context.strokeRect(x, y, width, height);
      };
      /**
       * fillText function.
       * @method
       * @name Konva.Context#fillText
       */
      Context.prototype.fillText = function (a0, a1, a2) {
          this._context.fillText(a0, a1, a2);
      };
      /**
       * measureText function.
       * @method
       * @name Konva.Context#measureText
       */
      Context.prototype.measureText = function (text) {
          return this._context.measureText(text);
      };
      /**
       * getImageData function.
       * @method
       * @name Konva.Context#getImageData
       */
      Context.prototype.getImageData = function (a0, a1, a2, a3) {
          return this._context.getImageData(a0, a1, a2, a3);
      };
      /**
       * lineTo function.
       * @method
       * @name Konva.Context#lineTo
       */
      Context.prototype.lineTo = function (a0, a1) {
          this._context.lineTo(a0, a1);
      };
      /**
       * moveTo function.
       * @method
       * @name Konva.Context#moveTo
       */
      Context.prototype.moveTo = function (a0, a1) {
          this._context.moveTo(a0, a1);
      };
      /**
       * rect function.
       * @method
       * @name Konva.Context#rect
       */
      Context.prototype.rect = function (a0, a1, a2, a3) {
          this._context.rect(a0, a1, a2, a3);
      };
      /**
       * putImageData function.
       * @method
       * @name Konva.Context#putImageData
       */
      Context.prototype.putImageData = function (a0, a1, a2) {
          this._context.putImageData(a0, a1, a2);
      };
      /**
       * quadraticCurveTo function.
       * @method
       * @name Konva.Context#quadraticCurveTo
       */
      Context.prototype.quadraticCurveTo = function (a0, a1, a2, a3) {
          this._context.quadraticCurveTo(a0, a1, a2, a3);
      };
      /**
       * restore function.
       * @method
       * @name Konva.Context#restore
       */
      Context.prototype.restore = function () {
          this._context.restore();
      };
      /**
       * rotate function.
       * @method
       * @name Konva.Context#rotate
       */
      Context.prototype.rotate = function (a0) {
          this._context.rotate(a0);
      };
      /**
       * save function.
       * @method
       * @name Konva.Context#save
       */
      Context.prototype.save = function () {
          this._context.save();
      };
      /**
       * scale function.
       * @method
       * @name Konva.Context#scale
       */
      Context.prototype.scale = function (a0, a1) {
          this._context.scale(a0, a1);
      };
      /**
       * setLineDash function.
       * @method
       * @name Konva.Context#setLineDash
       */
      Context.prototype.setLineDash = function (a0) {
          // works for Chrome and IE11
          if (this._context.setLineDash) {
              this._context.setLineDash(a0);
          }
          else if ('mozDash' in this._context) {
              // verified that this works in firefox
              this._context['mozDash'] = a0;
          }
          else if ('webkitLineDash' in this._context) {
              // does not currently work for Safari
              this._context['webkitLineDash'] = a0;
          }
          // no support for IE9 and IE10
      };
      /**
       * getLineDash function.
       * @method
       * @name Konva.Context#getLineDash
       */
      Context.prototype.getLineDash = function () {
          return this._context.getLineDash();
      };
      /**
       * setTransform function.
       * @method
       * @name Konva.Context#setTransform
       */
      Context.prototype.setTransform = function (a0, a1, a2, a3, a4, a5) {
          this._context.setTransform(a0, a1, a2, a3, a4, a5);
      };
      /**
       * stroke function.
       * @method
       * @name Konva.Context#stroke
       */
      Context.prototype.stroke = function () {
          this._context.stroke();
      };
      /**
       * strokeText function.
       * @method
       * @name Konva.Context#strokeText
       */
      Context.prototype.strokeText = function (a0, a1, a2, a3) {
          this._context.strokeText(a0, a1, a2, a3);
      };
      /**
       * transform function.
       * @method
       * @name Konva.Context#transform
       */
      Context.prototype.transform = function (a0, a1, a2, a3, a4, a5) {
          this._context.transform(a0, a1, a2, a3, a4, a5);
      };
      /**
       * translate function.
       * @method
       * @name Konva.Context#translate
       */
      Context.prototype.translate = function (a0, a1) {
          this._context.translate(a0, a1);
      };
      Context.prototype._enableTrace = function () {
          var that = this, len = CONTEXT_METHODS.length, _simplifyArray = Util._simplifyArray, origSetter = this.setAttr, n, args;
          // to prevent creating scope function at each loop
          var func = function (methodName) {
              var origMethod = that[methodName], ret;
              that[methodName] = function () {
                  args = _simplifyArray(Array.prototype.slice.call(arguments, 0));
                  ret = origMethod.apply(that, arguments);
                  that._trace({
                      method: methodName,
                      args: args
                  });
                  return ret;
              };
          };
          // methods
          for (n = 0; n < len; n++) {
              func(CONTEXT_METHODS[n]);
          }
          // attrs
          that.setAttr = function () {
              origSetter.apply(that, arguments);
              var prop = arguments[0];
              var val = arguments[1];
              if (prop === 'shadowOffsetX' ||
                  prop === 'shadowOffsetY' ||
                  prop === 'shadowBlur') {
                  val = val / this.canvas.getPixelRatio();
              }
              that._trace({
                  property: prop,
                  val: val
              });
          };
      };
      Context.prototype._applyGlobalCompositeOperation = function (node) {
          var globalCompositeOperation = node.getGlobalCompositeOperation();
          if (globalCompositeOperation !== 'source-over') {
              this.setAttr('globalCompositeOperation', globalCompositeOperation);
          }
      };
      return Context;
  }());
  CONTEXT_PROPERTIES.forEach(function (prop) {
      Object.defineProperty(Context.prototype, prop, {
          get: function () {
              return this._context[prop];
          },
          set: function (val) {
              this._context[prop] = val;
          }
      });
  });
  var SceneContext = /** @class */ (function (_super) {
      __extends(SceneContext, _super);
      function SceneContext() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      SceneContext.prototype._fillColor = function (shape) {
          var fill = shape.fill();
          this.setAttr('fillStyle', fill);
          shape._fillFunc(this);
      };
      SceneContext.prototype._fillPattern = function (shape) {
          var fillPatternX = shape.getFillPatternX(), fillPatternY = shape.getFillPatternY(), fillPatternRotation = Konva.getAngle(shape.getFillPatternRotation()), fillPatternOffsetX = shape.getFillPatternOffsetX(), fillPatternOffsetY = shape.getFillPatternOffsetY(), fillPatternScaleX = shape.getFillPatternScaleX(), fillPatternScaleY = shape.getFillPatternScaleY();
          if (fillPatternX || fillPatternY) {
              this.translate(fillPatternX || 0, fillPatternY || 0);
          }
          if (fillPatternRotation) {
              this.rotate(fillPatternRotation);
          }
          if (fillPatternScaleX || fillPatternScaleY) {
              this.scale(fillPatternScaleX, fillPatternScaleY);
          }
          if (fillPatternOffsetX || fillPatternOffsetY) {
              this.translate(-1 * fillPatternOffsetX, -1 * fillPatternOffsetY);
          }
          this.setAttr('fillStyle', shape._getFillPattern());
          shape._fillFunc(this);
      };
      SceneContext.prototype._fillLinearGradient = function (shape) {
          var grd = shape._getLinearGradient();
          if (grd) {
              this.setAttr('fillStyle', grd);
              shape._fillFunc(this);
          }
      };
      SceneContext.prototype._fillRadialGradient = function (shape) {
          var grd = shape._getRadialGradient();
          if (grd) {
              this.setAttr('fillStyle', grd);
              shape._fillFunc(this);
          }
      };
      SceneContext.prototype._fill = function (shape) {
          var hasColor = shape.fill(), fillPriority = shape.getFillPriority();
          // priority fills
          if (hasColor && fillPriority === 'color') {
              this._fillColor(shape);
              return;
          }
          var hasPattern = shape.getFillPatternImage();
          if (hasPattern && fillPriority === 'pattern') {
              this._fillPattern(shape);
              return;
          }
          var hasLinearGradient = shape.getFillLinearGradientColorStops();
          if (hasLinearGradient && fillPriority === 'linear-gradient') {
              this._fillLinearGradient(shape);
              return;
          }
          var hasRadialGradient = shape.getFillRadialGradientColorStops();
          if (hasRadialGradient && fillPriority === 'radial-gradient') {
              this._fillRadialGradient(shape);
              return;
          }
          // now just try and fill with whatever is available
          if (hasColor) {
              this._fillColor(shape);
          }
          else if (hasPattern) {
              this._fillPattern(shape);
          }
          else if (hasLinearGradient) {
              this._fillLinearGradient(shape);
          }
          else if (hasRadialGradient) {
              this._fillRadialGradient(shape);
          }
      };
      SceneContext.prototype._strokeLinearGradient = function (shape) {
          var start = shape.getStrokeLinearGradientStartPoint(), end = shape.getStrokeLinearGradientEndPoint(), colorStops = shape.getStrokeLinearGradientColorStops(), grd = this.createLinearGradient(start.x, start.y, end.x, end.y);
          if (colorStops) {
              // build color stops
              for (var n = 0; n < colorStops.length; n += 2) {
                  grd.addColorStop(colorStops[n], colorStops[n + 1]);
              }
              this.setAttr('strokeStyle', grd);
          }
      };
      SceneContext.prototype._stroke = function (shape) {
          var dash = shape.dash(), 
          // ignore strokeScaleEnabled for Text
          strokeScaleEnabled = shape.getStrokeScaleEnabled();
          if (shape.hasStroke()) {
              if (!strokeScaleEnabled) {
                  this.save();
                  var pixelRatio = this.getCanvas().getPixelRatio();
                  this.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
              }
              this._applyLineCap(shape);
              if (dash && shape.dashEnabled()) {
                  this.setLineDash(dash);
                  this.setAttr('lineDashOffset', shape.dashOffset());
              }
              this.setAttr('lineWidth', shape.strokeWidth());
              if (!shape.getShadowForStrokeEnabled()) {
                  this.setAttr('shadowColor', 'rgba(0,0,0,0)');
              }
              var hasLinearGradient = shape.getStrokeLinearGradientColorStops();
              if (hasLinearGradient) {
                  this._strokeLinearGradient(shape);
              }
              else {
                  this.setAttr('strokeStyle', shape.stroke());
              }
              shape._strokeFunc(this);
              if (!strokeScaleEnabled) {
                  this.restore();
              }
          }
      };
      SceneContext.prototype._applyShadow = function (shape) {
          var util = Util, color = util.get(shape.getShadowRGBA(), 'black'), blur = util.get(shape.getShadowBlur(), 5), offset = util.get(shape.getShadowOffset(), {
              x: 0,
              y: 0
          }), scale = shape.getAbsoluteScale(), ratio = this.canvas.getPixelRatio(), scaleX = scale.x * ratio, scaleY = scale.y * ratio;
          this.setAttr('shadowColor', color);
          this.setAttr('shadowBlur', blur * Math.min(Math.abs(scaleX), Math.abs(scaleY)));
          this.setAttr('shadowOffsetX', offset.x * scaleX);
          this.setAttr('shadowOffsetY', offset.y * scaleY);
      };
      return SceneContext;
  }(Context));
  var HitContext = /** @class */ (function (_super) {
      __extends(HitContext, _super);
      function HitContext() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      HitContext.prototype._fill = function (shape) {
          this.save();
          this.setAttr('fillStyle', shape.colorKey);
          shape._fillFuncHit(this);
          this.restore();
      };
      HitContext.prototype.strokeShape = function (shape) {
          if (shape.hasHitStroke()) {
              this._stroke(shape);
          }
      };
      HitContext.prototype._stroke = function (shape) {
          if (shape.hasHitStroke()) {
              // ignore strokeScaleEnabled for Text
              var strokeScaleEnabled = shape.getStrokeScaleEnabled();
              if (!strokeScaleEnabled) {
                  this.save();
                  var pixelRatio = this.getCanvas().getPixelRatio();
                  this.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
              }
              this._applyLineCap(shape);
              var hitStrokeWidth = shape.hitStrokeWidth();
              var strokeWidth = hitStrokeWidth === 'auto' ? shape.strokeWidth() : hitStrokeWidth;
              this.setAttr('lineWidth', strokeWidth);
              this.setAttr('strokeStyle', shape.colorKey);
              shape._strokeFuncHit(this);
              if (!strokeScaleEnabled) {
                  this.restore();
              }
          }
      };
      return HitContext;
  }(Context));

  // calculate pixel ratio
  var _pixelRatio;
  function getDevicePixelRatio() {
      if (_pixelRatio) {
          return _pixelRatio;
      }
      var canvas = Util.createCanvasElement();
      var context = canvas.getContext('2d');
      _pixelRatio = (function () {
          var devicePixelRatio = Konva._global.devicePixelRatio || 1, backingStoreRatio = context.webkitBackingStorePixelRatio ||
              context.mozBackingStorePixelRatio ||
              context.msBackingStorePixelRatio ||
              context.oBackingStorePixelRatio ||
              context.backingStorePixelRatio ||
              1;
          return devicePixelRatio / backingStoreRatio;
      })();
      return _pixelRatio;
  }
  /**
   * Canvas Renderer constructor. It is a wrapper around native canvas element.
   * Usually you don't need to use it manually.
   * @constructor
   * @abstract
   * @memberof Konva
   * @param {Object} config
   * @param {Number} config.width
   * @param {Number} config.height
   * @param {Number} config.pixelRatio
   */
  var Canvas = /** @class */ (function () {
      function Canvas(config) {
          this.pixelRatio = 1;
          this.width = 0;
          this.height = 0;
          this.isCache = false;
          var conf = config || {};
          var pixelRatio = conf.pixelRatio || Konva.pixelRatio || getDevicePixelRatio();
          this.pixelRatio = pixelRatio;
          this._canvas = Util.createCanvasElement();
          // set inline styles
          this._canvas.style.padding = '0';
          this._canvas.style.margin = '0';
          this._canvas.style.border = '0';
          this._canvas.style.background = 'transparent';
          this._canvas.style.position = 'absolute';
          this._canvas.style.top = '0';
          this._canvas.style.left = '0';
      }
      /**
       * get canvas context
       * @method
       * @name Konva.Canvas#getContext
       * @returns {CanvasContext} context
       */
      Canvas.prototype.getContext = function () {
          return this.context;
      };
      Canvas.prototype.getPixelRatio = function () {
          return this.pixelRatio;
      };
      Canvas.prototype.setPixelRatio = function (pixelRatio) {
          var previousRatio = this.pixelRatio;
          this.pixelRatio = pixelRatio;
          this.setSize(this.getWidth() / previousRatio, this.getHeight() / previousRatio);
      };
      Canvas.prototype.setWidth = function (width) {
          // take into account pixel ratio
          this.width = this._canvas.width = width * this.pixelRatio;
          this._canvas.style.width = width + 'px';
          var pixelRatio = this.pixelRatio, _context = this.getContext()._context;
          _context.scale(pixelRatio, pixelRatio);
      };
      Canvas.prototype.setHeight = function (height) {
          // take into account pixel ratio
          this.height = this._canvas.height = height * this.pixelRatio;
          this._canvas.style.height = height + 'px';
          var pixelRatio = this.pixelRatio, _context = this.getContext()._context;
          _context.scale(pixelRatio, pixelRatio);
      };
      Canvas.prototype.getWidth = function () {
          return this.width;
      };
      Canvas.prototype.getHeight = function () {
          return this.height;
      };
      Canvas.prototype.setSize = function (width, height) {
          this.setWidth(width || 0);
          this.setHeight(height || 0);
      };
      /**
       * to data url
       * @method
       * @name Konva.Canvas#toDataURL
       * @param {String} mimeType
       * @param {Number} quality between 0 and 1 for jpg mime types
       * @returns {String} data url string
       */
      Canvas.prototype.toDataURL = function (mimeType, quality) {
          try {
              // If this call fails (due to browser bug, like in Firefox 3.6),
              // then revert to previous no-parameter image/png behavior
              return this._canvas.toDataURL(mimeType, quality);
          }
          catch (e) {
              try {
                  return this._canvas.toDataURL();
              }
              catch (err) {
                  Util.error('Unable to get data URL. ' +
                      err.message +
                      ' For more info read https://konvajs.org/docs/posts/Tainted_Canvas.html.');
                  return '';
              }
          }
      };
      return Canvas;
  }());
  /**
   * get/set pixel ratio.
   * KonvaJS automatically handles pixel ratio adustments in order to render crisp drawings
   *  on all devices. Most desktops, low end tablets, and low end phones, have device pixel ratios
   *  of 1.  Some high end tablets and phones, like iPhones and iPads have a device pixel ratio
   *  of 2.  Some Macbook Pros, and iMacs also have a device pixel ratio of 2.  Some high end Android devices have pixel
   *  ratios of 2 or 3.  Some browsers like Firefox allow you to configure the pixel ratio of the viewport.  Unless otherwise
   *  specificed, the pixel ratio will be defaulted to the actual device pixel ratio.  You can override the device pixel
   *  ratio for special situations, or, if you don't want the pixel ratio to be taken into account, you can set it to 1.
   * @name Konva.Canvas#pixelRatio
   * @method
   * @param {Number} pixelRatio
   * @returns {Number}
   * @example
   * // get
   * var pixelRatio = layer.getCanvas.pixelRatio();
   *
   * // set
   * layer.getCanvas().pixelRatio(3);
   */
  Factory.addGetterSetter(Canvas, 'pixelRatio', undefined, getNumberValidator());
  var SceneCanvas = /** @class */ (function (_super) {
      __extends(SceneCanvas, _super);
      function SceneCanvas(config) {
          if (config === void 0) { config = { width: 0, height: 0 }; }
          var _this = _super.call(this, config) || this;
          _this.context = new SceneContext(_this);
          _this.setSize(config.width, config.height);
          return _this;
      }
      return SceneCanvas;
  }(Canvas));
  var HitCanvas = /** @class */ (function (_super) {
      __extends(HitCanvas, _super);
      function HitCanvas(config) {
          if (config === void 0) { config = { width: 0, height: 0 }; }
          var _this = _super.call(this, config) || this;
          _this.hitCanvas = true;
          _this.context = new HitContext(_this);
          _this.setSize(config.width, config.height);
          return _this;
      }
      return HitCanvas;
  }(Canvas));

  var DD = {
      get isDragging() {
          var flag = false;
          DD._dragElements.forEach(function (elem) {
              if (elem.dragStatus === 'dragging') {
                  flag = true;
              }
          });
          return flag;
      },
      justDragged: false,
      get node() {
          // return first dragging node
          var node;
          DD._dragElements.forEach(function (elem) {
              node = elem.node;
          });
          return node;
      },
      _dragElements: new Map(),
      // methods
      _drag: function (evt) {
          DD._dragElements.forEach(function (elem, key) {
              var node = elem.node;
              // we need to find pointer relative to that node
              var stage = node.getStage();
              stage.setPointersPositions(evt);
              // it is possible that user call startDrag without any event
              // it that case we need to detect first movable pointer and attach it into the node
              if (elem.pointerId === undefined) {
                  elem.pointerId = Util._getFirstPointerId(evt);
              }
              var pos = stage._changedPointerPositions.find(function (pos) { return pos.id === elem.pointerId; });
              // not related pointer
              if (!pos) {
                  return;
              }
              if (elem.dragStatus !== 'dragging') {
                  var dragDistance = node.dragDistance();
                  var distance = Math.max(Math.abs(pos.x - elem.startPointerPos.x), Math.abs(pos.y - elem.startPointerPos.y));
                  if (distance < dragDistance) {
                      return;
                  }
                  node.startDrag({ evt: evt });
                  // a user can stop dragging inside `dragstart`
                  if (!node.isDragging()) {
                      return;
                  }
              }
              node._setDragPosition(evt, elem);
              // execute ondragmove if defined
              node.fire('dragmove', {
                  type: 'dragmove',
                  target: node,
                  evt: evt
              }, true);
          });
      },
      // dragBefore and dragAfter allows us to set correct order of events
      // setup all in dragbefore, and stop dragging only after pointerup triggered.
      _endDragBefore: function (evt) {
          DD._dragElements.forEach(function (elem, key) {
              var node = elem.node;
              // we need to find pointer relative to that node
              var stage = node.getStage();
              if (evt) {
                  stage.setPointersPositions(evt);
              }
              var pos = stage._changedPointerPositions.find(function (pos) { return pos.id === elem.pointerId; });
              // that pointer is not related
              if (!pos) {
                  return;
              }
              if (elem.dragStatus === 'dragging' || elem.dragStatus === 'stopped') {
                  // if a node is stopped manully we still need to reset events:
                  DD.justDragged = true;
                  Konva.listenClickTap = false;
                  elem.dragStatus = 'stopped';
              }
              var drawNode = elem.node.getLayer() ||
                  (elem.node instanceof Konva['Stage'] && elem.node);
              if (drawNode) {
                  drawNode.draw();
              }
          });
      },
      _endDragAfter: function (evt) {
          DD._dragElements.forEach(function (elem, key) {
              if (elem.dragStatus === 'stopped') {
                  elem.node.fire('dragend', {
                      type: 'dragend',
                      target: elem.node,
                      evt: evt
                  }, true);
              }
              if (elem.dragStatus !== 'dragging') {
                  DD._dragElements.delete(key);
              }
          });
      }
  };
  if (Konva.isBrowser) {
      window.addEventListener('mouseup', DD._endDragBefore, true);
      window.addEventListener('touchend', DD._endDragBefore, true);
      window.addEventListener('mousemove', DD._drag);
      window.addEventListener('touchmove', DD._drag);
      window.addEventListener('mouseup', DD._endDragAfter, false);
      window.addEventListener('touchend', DD._endDragAfter, false);
  }

  var ids = {};
  var names = {};
  var _addId = function (node, id) {
      if (!id) {
          return;
      }
      ids[id] = node;
  };
  var _removeId = function (id, node) {
      // node has no id
      if (!id) {
          return;
      }
      // another node is registered (possible for duplicate ids)
      if (ids[id] !== node) {
          return;
      }
      delete ids[id];
  };
  var _addName = function (node, name) {
      if (name) {
          if (!names[name]) {
              names[name] = [];
          }
          names[name].push(node);
      }
  };
  var _removeName = function (name, _id) {
      if (!name) {
          return;
      }
      var nodes = names[name];
      if (!nodes) {
          return;
      }
      for (var n = 0; n < nodes.length; n++) {
          var no = nodes[n];
          if (no._id === _id) {
              nodes.splice(n, 1);
          }
      }
      if (nodes.length === 0) {
          delete names[name];
      }
  };
  // CONSTANTS
  var ABSOLUTE_OPACITY = 'absoluteOpacity', ABSOLUTE_TRANSFORM = 'absoluteTransform', ABSOLUTE_SCALE = 'absoluteScale', CANVAS = 'canvas', CHANGE = 'Change', CHILDREN = 'children', KONVA = 'konva', LISTENING = 'listening', MOUSEENTER = 'mouseenter', MOUSELEAVE = 'mouseleave', NAME = 'name', SET$1 = 'set', SHAPE = 'Shape', SPACE = ' ', STAGE = 'stage', TRANSFORM = 'transform', UPPER_STAGE = 'Stage', VISIBLE = 'visible', TRANSFORM_CHANGE_STR = [
      'xChange.konva',
      'yChange.konva',
      'scaleXChange.konva',
      'scaleYChange.konva',
      'skewXChange.konva',
      'skewYChange.konva',
      'rotationChange.konva',
      'offsetXChange.konva',
      'offsetYChange.konva',
      'transformsEnabledChange.konva',
  ].join(SPACE);
  // TODO: can we remove children from node?
  var emptyChildren = new Collection();
  var idCounter = 1;
  /**
   * Node constructor. Nodes are entities that can be transformed, layered,
   * and have bound events. The stage, layers, groups, and shapes all extend Node.
   * @constructor
   * @memberof Konva
   * @param {Object} config
   * @param {Number} [config.x]
     * @param {Number} [config.y]
     * @param {Number} [config.width]
     * @param {Number} [config.height]
     * @param {Boolean} [config.visible]
     * @param {Boolean} [config.listening] whether or not the node is listening for events
     * @param {String} [config.id] unique id
     * @param {String} [config.name] non-unique name
     * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
     * @param {Object} [config.scale] set scale
     * @param {Number} [config.scaleX] set scale x
     * @param {Number} [config.scaleY] set scale y
     * @param {Number} [config.rotation] rotation in degrees
     * @param {Object} [config.offset] offset from center point and rotation point
     * @param {Number} [config.offsetX] set offset x
     * @param {Number} [config.offsetY] set offset y
     * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
     *  the entire stage by dragging any portion of the stage
     * @param {Number} [config.dragDistance]
     * @param {Function} [config.dragBoundFunc]
   */
  var Node = /** @class */ (function () {
      function Node(config) {
          var _this = this;
          this._id = idCounter++;
          this.eventListeners = {};
          this.attrs = {};
          this.index = 0;
          this.parent = null;
          this._cache = new Map();
          this._lastPos = null;
          this._batchingTransformChange = false;
          this._needClearTransformCache = false;
          this._filterUpToDate = false;
          this._isUnderCache = false;
          this.children = emptyChildren;
          this._dragEventId = null;
          this.setAttrs(config);
          // event bindings for cache handling
          this.on(TRANSFORM_CHANGE_STR, function () {
              if (_this._batchingTransformChange) {
                  _this._needClearTransformCache = true;
                  return;
              }
              _this._clearCache(TRANSFORM);
              _this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
          });
          this.on('visibleChange.konva', function () {
              _this._clearSelfAndDescendantCache(VISIBLE);
          });
          this.on('listeningChange.konva', function () {
              _this._clearSelfAndDescendantCache(LISTENING);
          });
          this.on('opacityChange.konva', function () {
              _this._clearSelfAndDescendantCache(ABSOLUTE_OPACITY);
          });
      }
      Node.prototype.hasChildren = function () {
          return false;
      };
      Node.prototype.getChildren = function () {
          return emptyChildren;
      };
      /** @lends Konva.Node.prototype */
      Node.prototype._clearCache = function (attr) {
          if (attr) {
              this._cache.delete(attr);
          }
          else {
              this._cache.clear();
          }
      };
      Node.prototype._getCache = function (attr, privateGetter) {
          var cache = this._cache.get(attr);
          // if not cached, we need to set it using the private getter method.
          if (cache === undefined) {
              cache = privateGetter.call(this);
              this._cache.set(attr, cache);
          }
          return cache;
      };
      Node.prototype._getCanvasCache = function () {
          return this._cache.get(CANVAS);
      };
      /*
       * when the logic for a cached result depends on ancestor propagation, use this
       * method to clear self and children cache
       */
      Node.prototype._clearSelfAndDescendantCache = function (attr, forceEvent) {
          this._clearCache(attr);
          // trigger clear cache, so transformer can use it
          if (forceEvent && attr === ABSOLUTE_TRANSFORM) {
              this.fire('_clearTransformCache');
          }
          // skip clearing if node is cached with canvas
          // for performance reasons !!!
          if (this.isCached()) {
              return;
          }
          if (this.children) {
              this.children.each(function (node) {
                  node._clearSelfAndDescendantCache(attr, true);
              });
          }
      };
      /**
       * clear cached canvas
       * @method
       * @name Konva.Node#clearCache
       * @returns {Konva.Node}
       * @example
       * node.clearCache();
       */
      Node.prototype.clearCache = function () {
          this._cache.delete(CANVAS);
          this._clearSelfAndDescendantCache();
          return this;
      };
      /**
       *  cache node to improve drawing performance, apply filters, or create more accurate
       *  hit regions. For all basic shapes size of cache canvas will be automatically detected.
       *  If you need to cache your custom `Konva.Shape` instance you have to pass shape's bounding box
       *  properties. Look at [https://konvajs.org/docs/performance/Shape_Caching.html](https://konvajs.org/docs/performance/Shape_Caching.html) for more information.
       * @method
       * @name Konva.Node#cache
       * @param {Object} [config]
       * @param {Number} [config.x]
       * @param {Number} [config.y]
       * @param {Number} [config.width]
       * @param {Number} [config.height]
       * @param {Number} [config.offset]  increase canvas size by `offset` pixel in all directions.
       * @param {Boolean} [config.drawBorder] when set to true, a red border will be drawn around the cached
       *  region for debugging purposes
       * @param {Number} [config.pixelRatio] change quality (or pixel ratio) of cached image. pixelRatio = 2 will produce 2x sized cache.
       * @param {Boolean} [config.imageSmoothingEnabled] control imageSmoothingEnabled property of created canvas for cache
       * @returns {Konva.Node}
       * @example
       * // cache a shape with the x,y position of the bounding box at the center and
       * // the width and height of the bounding box equal to the width and height of
       * // the shape obtained from shape.width() and shape.height()
       * image.cache();
       *
       * // cache a node and define the bounding box position and size
       * node.cache({
       *   x: -30,
       *   y: -30,
       *   width: 100,
       *   height: 200
       * });
       *
       * // cache a node and draw a red border around the bounding box
       * // for debugging purposes
       * node.cache({
       *   x: -30,
       *   y: -30,
       *   width: 100,
       *   height: 200,
       *   offset : 10,
       *   drawBorder: true
       * });
       */
      Node.prototype.cache = function (config) {
          var conf = config || {};
          var rect = {};
          // don't call getClientRect if we have all attributes
          // it means call it only if have one undefined
          if (conf.x === undefined ||
              conf.y === undefined ||
              conf.width === undefined ||
              conf.height === undefined) {
              rect = this.getClientRect({
                  skipTransform: true,
                  relativeTo: this.getParent(),
              });
          }
          var width = Math.ceil(conf.width || rect.width), height = Math.ceil(conf.height || rect.height), pixelRatio = conf.pixelRatio, x = conf.x === undefined ? rect.x : conf.x, y = conf.y === undefined ? rect.y : conf.y, offset = conf.offset || 0, drawBorder = conf.drawBorder || false;
          if (!width || !height) {
              Util.error('Can not cache the node. Width or height of the node equals 0. Caching is skipped.');
              return;
          }
          width += offset * 2;
          height += offset * 2;
          x -= offset;
          y -= offset;
          var cachedSceneCanvas = new SceneCanvas({
              pixelRatio: pixelRatio,
              width: width,
              height: height,
          }), cachedFilterCanvas = new SceneCanvas({
              pixelRatio: pixelRatio,
              width: 0,
              height: 0,
          }), cachedHitCanvas = new HitCanvas({
              pixelRatio: 1,
              width: width,
              height: height,
          }), sceneContext = cachedSceneCanvas.getContext(), hitContext = cachedHitCanvas.getContext();
          cachedHitCanvas.isCache = true;
          this._cache.delete('canvas');
          this._filterUpToDate = false;
          if (conf.imageSmoothingEnabled === false) {
              cachedSceneCanvas.getContext()._context.imageSmoothingEnabled = false;
              cachedFilterCanvas.getContext()._context.imageSmoothingEnabled = false;
          }
          sceneContext.save();
          hitContext.save();
          sceneContext.translate(-x, -y);
          hitContext.translate(-x, -y);
          // extra flag to skip on getAbsolute opacity calc
          this._isUnderCache = true;
          this._clearSelfAndDescendantCache(ABSOLUTE_OPACITY);
          this._clearSelfAndDescendantCache(ABSOLUTE_SCALE);
          this.drawScene(cachedSceneCanvas, this, true);
          this.drawHit(cachedHitCanvas, this, true);
          this._isUnderCache = false;
          sceneContext.restore();
          hitContext.restore();
          // this will draw a red border around the cached box for
          // debugging purposes
          if (drawBorder) {
              sceneContext.save();
              sceneContext.beginPath();
              sceneContext.rect(0, 0, width, height);
              sceneContext.closePath();
              sceneContext.setAttr('strokeStyle', 'red');
              sceneContext.setAttr('lineWidth', 5);
              sceneContext.stroke();
              sceneContext.restore();
          }
          this._cache.set(CANVAS, {
              scene: cachedSceneCanvas,
              filter: cachedFilterCanvas,
              hit: cachedHitCanvas,
              x: x,
              y: y,
          });
          return this;
      };
      /**
       * determine if node is currently cached
       * @method
       * @name Konva.Node#isCached
       * @returns {Boolean}
       */
      Node.prototype.isCached = function () {
          return this._cache.has('canvas');
      };
      /**
       * Return client rectangle {x, y, width, height} of node. This rectangle also include all styling (strokes, shadows, etc).
       * The rectangle position is relative to parent container.
       * The purpose of the method is similar to getBoundingClientRect API of the DOM.
       * @method
       * @name Konva.Node#getClientRect
       * @param {Object} config
       * @param {Boolean} [config.skipTransform] should we apply transform to node for calculating rect?
       * @param {Boolean} [config.skipShadow] should we apply shadow to the node for calculating bound box?
       * @param {Boolean} [config.skipStroke] should we apply stroke to the node for calculating bound box?
       * @param {Object} [config.relativeTo] calculate client rect relative to one of the parents
       * @returns {Object} rect with {x, y, width, height} properties
       * @example
       * var rect = new Konva.Rect({
       *      width : 100,
       *      height : 100,
       *      x : 50,
       *      y : 50,
       *      strokeWidth : 4,
       *      stroke : 'black',
       *      offsetX : 50,
       *      scaleY : 2
       * });
       *
       * // get client rect without think off transformations (position, rotation, scale, offset, etc)
       * rect.getClientRect({ skipTransform: true});
       * // returns {
       * //     x : -2,   // two pixels for stroke / 2
       * //     y : -2,
       * //     width : 104, // increased by 4 for stroke
       * //     height : 104
       * //}
       *
       * // get client rect with transformation applied
       * rect.getClientRect();
       * // returns Object {x: -2, y: 46, width: 104, height: 208}
       */
      Node.prototype.getClientRect = function (config) {
          // abstract method
          // redefine in Container and Shape
          throw new Error('abstract "getClientRect" method call');
      };
      Node.prototype._transformedRect = function (rect, top) {
          var points = [
              { x: rect.x, y: rect.y },
              { x: rect.x + rect.width, y: rect.y },
              { x: rect.x + rect.width, y: rect.y + rect.height },
              { x: rect.x, y: rect.y + rect.height },
          ];
          var minX, minY, maxX, maxY;
          var trans = this.getAbsoluteTransform(top);
          points.forEach(function (point) {
              var transformed = trans.point(point);
              if (minX === undefined) {
                  minX = maxX = transformed.x;
                  minY = maxY = transformed.y;
              }
              minX = Math.min(minX, transformed.x);
              minY = Math.min(minY, transformed.y);
              maxX = Math.max(maxX, transformed.x);
              maxY = Math.max(maxY, transformed.y);
          });
          return {
              x: minX,
              y: minY,
              width: maxX - minX,
              height: maxY - minY,
          };
      };
      Node.prototype._drawCachedSceneCanvas = function (context) {
          context.save();
          context._applyOpacity(this);
          context._applyGlobalCompositeOperation(this);
          var canvasCache = this._getCanvasCache();
          context.translate(canvasCache.x, canvasCache.y);
          var cacheCanvas = this._getCachedSceneCanvas();
          var ratio = cacheCanvas.pixelRatio;
          context.drawImage(cacheCanvas._canvas, 0, 0, cacheCanvas.width / ratio, cacheCanvas.height / ratio);
          context.restore();
      };
      Node.prototype._drawCachedHitCanvas = function (context) {
          var canvasCache = this._getCanvasCache(), hitCanvas = canvasCache.hit;
          context.save();
          context.translate(canvasCache.x, canvasCache.y);
          context.drawImage(hitCanvas._canvas, 0, 0);
          context.restore();
      };
      Node.prototype._getCachedSceneCanvas = function () {
          var filters = this.filters(), cachedCanvas = this._getCanvasCache(), sceneCanvas = cachedCanvas.scene, filterCanvas = cachedCanvas.filter, filterContext = filterCanvas.getContext(), len, imageData, n, filter;
          if (filters) {
              if (!this._filterUpToDate) {
                  var ratio = sceneCanvas.pixelRatio;
                  filterCanvas.setSize(sceneCanvas.width / sceneCanvas.pixelRatio, sceneCanvas.height / sceneCanvas.pixelRatio);
                  try {
                      len = filters.length;
                      filterContext.clear();
                      // copy cached canvas onto filter context
                      filterContext.drawImage(sceneCanvas._canvas, 0, 0, sceneCanvas.getWidth() / ratio, sceneCanvas.getHeight() / ratio);
                      imageData = filterContext.getImageData(0, 0, filterCanvas.getWidth(), filterCanvas.getHeight());
                      // apply filters to filter context
                      for (n = 0; n < len; n++) {
                          filter = filters[n];
                          if (typeof filter !== 'function') {
                              Util.error('Filter should be type of function, but got ' +
                                  typeof filter +
                                  ' instead. Please check correct filters');
                              continue;
                          }
                          filter.call(this, imageData);
                          filterContext.putImageData(imageData, 0, 0);
                      }
                  }
                  catch (e) {
                      Util.error('Unable to apply filter. ' +
                          e.message +
                          ' This post my help you https://konvajs.org/docs/posts/Tainted_Canvas.html.');
                  }
                  this._filterUpToDate = true;
              }
              return filterCanvas;
          }
          return sceneCanvas;
      };
      /**
       * bind events to the node. KonvaJS supports mouseover, mousemove,
       *  mouseout, mouseenter, mouseleave, mousedown, mouseup, wheel, contextmenu, click, dblclick, touchstart, touchmove,
       *  touchend, tap, dbltap, dragstart, dragmove, and dragend events.
       *  Pass in a string of events delimited by a space to bind multiple events at once
       *  such as 'mousedown mouseup mousemove'. Include a namespace to bind an
       *  event by name such as 'click.foobar'.
       * @method
       * @name Konva.Node#on
       * @param {String} evtStr e.g. 'click', 'mousedown touchstart', 'mousedown.foo touchstart.foo'
       * @param {Function} handler The handler function is passed an event object
       * @returns {Konva.Node}
       * @example
       * // add click listener
       * node.on('click', function() {
       *   console.log('you clicked me!');
       * });
       *
       * // get the target node
       * node.on('click', function(evt) {
       *   console.log(evt.target);
       * });
       *
       * // stop event propagation
       * node.on('click', function(evt) {
       *   evt.cancelBubble = true;
       * });
       *
       * // bind multiple listeners
       * node.on('click touchstart', function() {
       *   console.log('you clicked/touched me!');
       * });
       *
       * // namespace listener
       * node.on('click.foo', function() {
       *   console.log('you clicked/touched me!');
       * });
       *
       * // get the event type
       * node.on('click tap', function(evt) {
       *   var eventType = evt.type;
       * });
       *
       * // get native event object
       * node.on('click tap', function(evt) {
       *   var nativeEvent = evt.evt;
       * });
       *
       * // for change events, get the old and new val
       * node.on('xChange', function(evt) {
       *   var oldVal = evt.oldVal;
       *   var newVal = evt.newVal;
       * });
       *
       * // get event targets
       * // with event delegations
       * layer.on('click', 'Group', function(evt) {
       *   var shape = evt.target;
       *   var group = evt.currentTarget;
       * });
       */
      Node.prototype.on = function (evtStr, handler) {
          if (arguments.length === 3) {
              return this._delegate.apply(this, arguments);
          }
          var events = evtStr.split(SPACE), len = events.length, n, event, parts, baseEvent, name;
          /*
           * loop through types and attach event listeners to
           * each one.  eg. 'click mouseover.namespace mouseout'
           * will create three event bindings
           */
          for (n = 0; n < len; n++) {
              event = events[n];
              parts = event.split('.');
              baseEvent = parts[0];
              name = parts[1] || '';
              // create events array if it doesn't exist
              if (!this.eventListeners[baseEvent]) {
                  this.eventListeners[baseEvent] = [];
              }
              this.eventListeners[baseEvent].push({
                  name: name,
                  handler: handler,
              });
          }
          return this;
      };
      /**
       * remove event bindings from the node. Pass in a string of
       *  event types delimmited by a space to remove multiple event
       *  bindings at once such as 'mousedown mouseup mousemove'.
       *  include a namespace to remove an event binding by name
       *  such as 'click.foobar'. If you only give a name like '.foobar',
       *  all events in that namespace will be removed.
       * @method
       * @name Konva.Node#off
       * @param {String} evtStr e.g. 'click', 'mousedown touchstart', '.foobar'
       * @returns {Konva.Node}
       * @example
       * // remove listener
       * node.off('click');
       *
       * // remove multiple listeners
       * node.off('click touchstart');
       *
       * // remove listener by name
       * node.off('click.foo');
       */
      Node.prototype.off = function (evtStr, callback) {
          var events = (evtStr || '').split(SPACE), len = events.length, n, t, event, parts, baseEvent, name;
          if (!evtStr) {
              // remove all events
              for (t in this.eventListeners) {
                  this._off(t);
              }
          }
          for (n = 0; n < len; n++) {
              event = events[n];
              parts = event.split('.');
              baseEvent = parts[0];
              name = parts[1];
              if (baseEvent) {
                  if (this.eventListeners[baseEvent]) {
                      this._off(baseEvent, name, callback);
                  }
              }
              else {
                  for (t in this.eventListeners) {
                      this._off(t, name, callback);
                  }
              }
          }
          return this;
      };
      // some event aliases for third party integration like HammerJS
      Node.prototype.dispatchEvent = function (evt) {
          var e = {
              target: this,
              type: evt.type,
              evt: evt,
          };
          this.fire(evt.type, e);
          return this;
      };
      Node.prototype.addEventListener = function (type, handler) {
          // we have to pass native event to handler
          this.on(type, function (evt) {
              handler.call(this, evt.evt);
          });
          return this;
      };
      Node.prototype.removeEventListener = function (type) {
          this.off(type);
          return this;
      };
      // like node.on
      Node.prototype._delegate = function (event, selector, handler) {
          var stopNode = this;
          this.on(event, function (evt) {
              var targets = evt.target.findAncestors(selector, true, stopNode);
              for (var i = 0; i < targets.length; i++) {
                  evt = Util.cloneObject(evt);
                  evt.currentTarget = targets[i];
                  handler.call(targets[i], evt);
              }
          });
      };
      /**
       * remove a node from parent, but don't destroy. You can reuse the node later.
       * @method
       * @name Konva.Node#remove
       * @returns {Konva.Node}
       * @example
       * node.remove();
       */
      Node.prototype.remove = function () {
          if (this.isDragging()) {
              this.stopDrag();
          }
          // we can have drag element but that is not dragged yet
          // so just clear it
          DD._dragElements.delete(this._id);
          this._remove();
          return this;
      };
      Node.prototype._clearCaches = function () {
          this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
          this._clearSelfAndDescendantCache(ABSOLUTE_OPACITY);
          this._clearSelfAndDescendantCache(ABSOLUTE_SCALE);
          this._clearSelfAndDescendantCache(STAGE);
          this._clearSelfAndDescendantCache(VISIBLE);
          this._clearSelfAndDescendantCache(LISTENING);
      };
      Node.prototype._remove = function () {
          // every cached attr that is calculated via node tree
          // traversal must be cleared when removing a node
          this._clearCaches();
          var parent = this.getParent();
          if (parent && parent.children) {
              parent.children.splice(this.index, 1);
              parent._setChildrenIndices();
              this.parent = null;
          }
      };
      /**
       * remove and destroy a node. Kill it and delete forever! You should not reuse node after destroy().
       * If the node is a container (Group, Stage or Layer) it will destroy all children too.
       * @method
       * @name Konva.Node#destroy
       * @example
       * node.destroy();
       */
      Node.prototype.destroy = function () {
          // remove from ids and names hashes
          _removeId(this.id(), this);
          // remove all names
          var names = (this.name() || '').split(/\s/g);
          for (var i = 0; i < names.length; i++) {
              var subname = names[i];
              _removeName(subname, this._id);
          }
          this.remove();
          return this;
      };
      /**
       * get attr
       * @method
       * @name Konva.Node#getAttr
       * @param {String} attr
       * @returns {Integer|String|Object|Array}
       * @example
       * var x = node.getAttr('x');
       */
      Node.prototype.getAttr = function (attr) {
          var method = 'get' + Util._capitalize(attr);
          if (Util._isFunction(this[method])) {
              return this[method]();
          }
          // otherwise get directly
          return this.attrs[attr];
      };
      /**
       * get ancestors
       * @method
       * @name Konva.Node#getAncestors
       * @returns {Konva.Collection}
       * @example
       * shape.getAncestors().each(function(node) {
       *   console.log(node.getId());
       * })
       */
      Node.prototype.getAncestors = function () {
          var parent = this.getParent(), ancestors = new Collection();
          while (parent) {
              ancestors.push(parent);
              parent = parent.getParent();
          }
          return ancestors;
      };
      /**
       * get attrs object literal
       * @method
       * @name Konva.Node#getAttrs
       * @returns {Object}
       */
      Node.prototype.getAttrs = function () {
          return this.attrs || {};
      };
      /**
       * set multiple attrs at once using an object literal
       * @method
       * @name Konva.Node#setAttrs
       * @param {Object} config object containing key value pairs
       * @returns {Konva.Node}
       * @example
       * node.setAttrs({
       *   x: 5,
       *   fill: 'red'
       * });
       */
      Node.prototype.setAttrs = function (config) {
          var key, method;
          if (!config) {
              return this;
          }
          for (key in config) {
              if (key === CHILDREN) {
                  continue;
              }
              method = SET$1 + Util._capitalize(key);
              // use setter if available
              if (Util._isFunction(this[method])) {
                  this[method](config[key]);
              }
              else {
                  // otherwise set directly
                  this._setAttr(key, config[key]);
              }
          }
          return this;
      };
      /**
       * determine if node is listening for events by taking into account ancestors.
       *
       * Parent    | Self      | isListening
       * listening | listening |
       * ----------+-----------+------------
       * T         | T         | T
       * T         | F         | F
       * F         | T         | T
       * F         | F         | F
       * ----------+-----------+------------
       * T         | I         | T
       * F         | I         | F
       * I         | I         | T
       *
       * @method
       * @name Konva.Node#isListening
       * @returns {Boolean}
       */
      Node.prototype.isListening = function () {
          return this._getCache(LISTENING, this._isListening);
      };
      Node.prototype._isListening = function () {
          var listening = this.listening(), parent = this.getParent();
          // the following conditions are a simplification of the truth table above.
          // please modify carefully
          if (listening === 'inherit') {
              if (parent) {
                  return parent.isListening();
              }
              else {
                  return true;
              }
          }
          else {
              return listening;
          }
      };
      /**
         * determine if node is visible by taking into account ancestors.
         *
         * Parent    | Self      | isVisible
         * visible   | visible   |
         * ----------+-----------+------------
         * T         | T         | T
         * T         | F         | F
         * F         | T         | T
         * F         | F         | F
         * ----------+-----------+------------
         * T         | I         | T
         * F         | I         | F
         * I         | I         | T
    
          * @method
          * @name Konva.Node#isVisible
          * @returns {Boolean}
          */
      Node.prototype.isVisible = function () {
          return this._getCache(VISIBLE, this._isVisible);
      };
      Node.prototype._isVisible = function (relativeTo) {
          var visible = this.visible(), parent = this.getParent();
          // the following conditions are a simplification of the truth table above.
          // please modify carefully
          if (visible === 'inherit') {
              if (parent && parent !== relativeTo) {
                  return parent._isVisible(relativeTo);
              }
              else {
                  return true;
              }
          }
          else if (relativeTo && relativeTo !== parent) {
              return visible && parent._isVisible(relativeTo);
          }
          else {
              return visible;
          }
      };
      /**
       * determine if listening is enabled by taking into account descendants.  If self or any children
       * have _isListeningEnabled set to true, then self also has listening enabled.
       * @method
       * @name Konva.Node#shouldDrawHit
       * @returns {Boolean}
       */
      Node.prototype.shouldDrawHit = function () {
          var layer = this.getLayer();
          return ((!layer && this.isListening() && this.isVisible()) ||
              (layer &&
                  layer.hitGraphEnabled() &&
                  this.isListening() &&
                  this.isVisible()));
      };
      /**
       * show node. set visible = true
       * @method
       * @name Konva.Node#show
       * @returns {Konva.Node}
       */
      Node.prototype.show = function () {
          this.visible(true);
          return this;
      };
      /**
       * hide node.  Hidden nodes are no longer detectable
       * @method
       * @name Konva.Node#hide
       * @returns {Konva.Node}
       */
      Node.prototype.hide = function () {
          this.visible(false);
          return this;
      };
      Node.prototype.getZIndex = function () {
          return this.index || 0;
      };
      /**
       * get absolute z-index which takes into account sibling
       *  and ancestor indices
       * @method
       * @name Konva.Node#getAbsoluteZIndex
       * @returns {Integer}
       */
      Node.prototype.getAbsoluteZIndex = function () {
          var depth = this.getDepth(), that = this, index = 0, nodes, len, n, child;
          function addChildren(children) {
              nodes = [];
              len = children.length;
              for (n = 0; n < len; n++) {
                  child = children[n];
                  index++;
                  if (child.nodeType !== SHAPE) {
                      nodes = nodes.concat(child.getChildren().toArray());
                  }
                  if (child._id === that._id) {
                      n = len;
                  }
              }
              if (nodes.length > 0 && nodes[0].getDepth() <= depth) {
                  addChildren(nodes);
              }
          }
          if (that.nodeType !== UPPER_STAGE) {
              addChildren(that.getStage().getChildren());
          }
          return index;
      };
      /**
       * get node depth in node tree.  Returns an integer.
       *  e.g. Stage depth will always be 0.  Layers will always be 1.  Groups and Shapes will always
       *  be >= 2
       * @method
       * @name Konva.Node#getDepth
       * @returns {Integer}
       */
      Node.prototype.getDepth = function () {
          var depth = 0, parent = this.parent;
          while (parent) {
              depth++;
              parent = parent.parent;
          }
          return depth;
      };
      // sometimes we do several attributes changes
      // like node.position(pos)
      // for performance reasons, lets batch transform reset
      // so it work faster
      Node.prototype._batchTransformChanges = function (func) {
          this._batchingTransformChange = true;
          func();
          this._batchingTransformChange = false;
          if (this._needClearTransformCache) {
              this._clearCache(TRANSFORM);
              this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM, true);
          }
          this._needClearTransformCache = false;
      };
      Node.prototype.setPosition = function (pos) {
          var _this = this;
          this._batchTransformChanges(function () {
              _this.x(pos.x);
              _this.y(pos.y);
          });
          return this;
      };
      Node.prototype.getPosition = function () {
          return {
              x: this.x(),
              y: this.y(),
          };
      };
      Node.prototype.getAbsolutePosition = function (top) {
          var haveCachedParent = false;
          var parent = this.parent;
          while (parent) {
              if (parent.isCached()) {
                  haveCachedParent = true;
                  break;
              }
              parent = parent.parent;
          }
          if (haveCachedParent && !top) {
              // make fake top element
              // "true" is not a node, but it will just allow skip all caching
              top = true;
          }
          var absoluteMatrix = this.getAbsoluteTransform(top).getMatrix(), absoluteTransform = new Transform(), offset = this.offset();
          // clone the matrix array
          absoluteTransform.m = absoluteMatrix.slice();
          absoluteTransform.translate(offset.x, offset.y);
          return absoluteTransform.getTranslation();
      };
      Node.prototype.setAbsolutePosition = function (pos) {
          var origTrans = this._clearTransform(), it;
          // don't clear translation
          this.attrs.x = origTrans.x;
          this.attrs.y = origTrans.y;
          delete origTrans.x;
          delete origTrans.y;
          // important, use non cached value
          this._clearCache(TRANSFORM);
          it = this._getAbsoluteTransform();
          it.invert();
          it.translate(pos.x, pos.y);
          pos = {
              x: this.attrs.x + it.getTranslation().x,
              y: this.attrs.y + it.getTranslation().y,
          };
          this._setTransform(origTrans);
          this.setPosition({ x: pos.x, y: pos.y });
          return this;
      };
      Node.prototype._setTransform = function (trans) {
          var key;
          for (key in trans) {
              this.attrs[key] = trans[key];
          }
          // this._clearCache(TRANSFORM);
          // this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
      };
      Node.prototype._clearTransform = function () {
          var trans = {
              x: this.x(),
              y: this.y(),
              rotation: this.rotation(),
              scaleX: this.scaleX(),
              scaleY: this.scaleY(),
              offsetX: this.offsetX(),
              offsetY: this.offsetY(),
              skewX: this.skewX(),
              skewY: this.skewY(),
          };
          this.attrs.x = 0;
          this.attrs.y = 0;
          this.attrs.rotation = 0;
          this.attrs.scaleX = 1;
          this.attrs.scaleY = 1;
          this.attrs.offsetX = 0;
          this.attrs.offsetY = 0;
          this.attrs.skewX = 0;
          this.attrs.skewY = 0;
          // return original transform
          return trans;
      };
      /**
       * move node by an amount relative to its current position
       * @method
       * @name Konva.Node#move
       * @param {Object} change
       * @param {Number} change.x
       * @param {Number} change.y
       * @returns {Konva.Node}
       * @example
       * // move node in x direction by 1px and y direction by 2px
       * node.move({
       *   x: 1,
       *   y: 2
       * });
       */
      Node.prototype.move = function (change) {
          var changeX = change.x, changeY = change.y, x = this.x(), y = this.y();
          if (changeX !== undefined) {
              x += changeX;
          }
          if (changeY !== undefined) {
              y += changeY;
          }
          this.setPosition({ x: x, y: y });
          return this;
      };
      Node.prototype._eachAncestorReverse = function (func, top) {
          var family = [], parent = this.getParent(), len, n;
          // if top node is defined, and this node is top node,
          // there's no need to build a family tree.  just execute
          // func with this because it will be the only node
          if (top && top._id === this._id) {
              func(this);
              return;
          }
          family.unshift(this);
          while (parent && (!top || parent._id !== top._id)) {
              family.unshift(parent);
              parent = parent.parent;
          }
          len = family.length;
          for (n = 0; n < len; n++) {
              func(family[n]);
          }
      };
      /**
       * rotate node by an amount in degrees relative to its current rotation
       * @method
       * @name Konva.Node#rotate
       * @param {Number} theta
       * @returns {Konva.Node}
       */
      Node.prototype.rotate = function (theta) {
          this.rotation(this.rotation() + theta);
          return this;
      };
      /**
       * move node to the top of its siblings
       * @method
       * @name Konva.Node#moveToTop
       * @returns {Boolean}
       */
      Node.prototype.moveToTop = function () {
          if (!this.parent) {
              Util.warn('Node has no parent. moveToTop function is ignored.');
              return false;
          }
          var index = this.index;
          this.parent.children.splice(index, 1);
          this.parent.children.push(this);
          this.parent._setChildrenIndices();
          return true;
      };
      /**
       * move node up
       * @method
       * @name Konva.Node#moveUp
       * @returns {Boolean} flag is moved or not
       */
      Node.prototype.moveUp = function () {
          if (!this.parent) {
              Util.warn('Node has no parent. moveUp function is ignored.');
              return false;
          }
          var index = this.index, len = this.parent.getChildren().length;
          if (index < len - 1) {
              this.parent.children.splice(index, 1);
              this.parent.children.splice(index + 1, 0, this);
              this.parent._setChildrenIndices();
              return true;
          }
          return false;
      };
      /**
       * move node down
       * @method
       * @name Konva.Node#moveDown
       * @returns {Boolean}
       */
      Node.prototype.moveDown = function () {
          if (!this.parent) {
              Util.warn('Node has no parent. moveDown function is ignored.');
              return false;
          }
          var index = this.index;
          if (index > 0) {
              this.parent.children.splice(index, 1);
              this.parent.children.splice(index - 1, 0, this);
              this.parent._setChildrenIndices();
              return true;
          }
          return false;
      };
      /**
       * move node to the bottom of its siblings
       * @method
       * @name Konva.Node#moveToBottom
       * @returns {Boolean}
       */
      Node.prototype.moveToBottom = function () {
          if (!this.parent) {
              Util.warn('Node has no parent. moveToBottom function is ignored.');
              return false;
          }
          var index = this.index;
          if (index > 0) {
              this.parent.children.splice(index, 1);
              this.parent.children.unshift(this);
              this.parent._setChildrenIndices();
              return true;
          }
          return false;
      };
      Node.prototype.setZIndex = function (zIndex) {
          if (!this.parent) {
              Util.warn('Node has no parent. zIndex parameter is ignored.');
              return this;
          }
          if (zIndex < 0 || zIndex >= this.parent.children.length) {
              Util.warn('Unexpected value ' +
                  zIndex +
                  ' for zIndex property. zIndex is just index of a node in children of its parent. Expected value is from 0 to ' +
                  (this.parent.children.length - 1) +
                  '.');
          }
          var index = this.index;
          this.parent.children.splice(index, 1);
          this.parent.children.splice(zIndex, 0, this);
          this.parent._setChildrenIndices();
          return this;
      };
      /**
       * get absolute opacity
       * @method
       * @name Konva.Node#getAbsoluteOpacity
       * @returns {Number}
       */
      Node.prototype.getAbsoluteOpacity = function () {
          return this._getCache(ABSOLUTE_OPACITY, this._getAbsoluteOpacity);
      };
      Node.prototype._getAbsoluteOpacity = function () {
          var absOpacity = this.opacity();
          var parent = this.getParent();
          if (parent && !parent._isUnderCache) {
              absOpacity *= parent.getAbsoluteOpacity();
          }
          return absOpacity;
      };
      /**
       * move node to another container
       * @method
       * @name Konva.Node#moveTo
       * @param {Container} newContainer
       * @returns {Konva.Node}
       * @example
       * // move node from current layer into layer2
       * node.moveTo(layer2);
       */
      Node.prototype.moveTo = function (newContainer) {
          // do nothing if new container is already parent
          if (this.getParent() !== newContainer) {
              this._remove();
              newContainer.add(this);
          }
          return this;
      };
      /**
       * convert Node into an object for serialization.  Returns an object.
       * @method
       * @name Konva.Node#toObject
       * @returns {Object}
       */
      Node.prototype.toObject = function () {
          var obj = {}, attrs = this.getAttrs(), key, val, getter, defaultValue, nonPlainObject;
          obj.attrs = {};
          for (key in attrs) {
              val = attrs[key];
              // if value is object and object is not plain
              // like class instance, we should skip it and to not include
              nonPlainObject =
                  Util.isObject(val) && !Util._isPlainObject(val) && !Util._isArray(val);
              if (nonPlainObject) {
                  continue;
              }
              getter = typeof this[key] === 'function' && this[key];
              // remove attr value so that we can extract the default value from the getter
              delete attrs[key];
              defaultValue = getter ? getter.call(this) : null;
              // restore attr value
              attrs[key] = val;
              if (defaultValue !== val) {
                  obj.attrs[key] = val;
              }
          }
          obj.className = this.getClassName();
          return Util._prepareToStringify(obj);
      };
      /**
       * convert Node into a JSON string.  Returns a JSON string.
       * @method
       * @name Konva.Node#toJSON
       * @returns {String}
       */
      Node.prototype.toJSON = function () {
          return JSON.stringify(this.toObject());
      };
      /**
       * get parent container
       * @method
       * @name Konva.Node#getParent
       * @returns {Konva.Node}
       */
      Node.prototype.getParent = function () {
          return this.parent;
      };
      /**
       * get all ancestors (parent then parent of the parent, etc) of the node
       * @method
       * @name Konva.Node#findAncestors
       * @param {String} selector selector for search
       * @param {Boolean} [includeSelf] show we think that node is ancestro itself?
       * @param {Konva.Node} [stopNode] optional node where we need to stop searching (one of ancestors)
       * @returns {Array} [ancestors]
       * @example
       * // get one of the parent group
       * var parentGroups = node.findAncestors('Group');
       */
      Node.prototype.findAncestors = function (selector, includeSelf, stopNode) {
          var res = [];
          if (includeSelf && this._isMatch(selector)) {
              res.push(this);
          }
          var ancestor = this.parent;
          while (ancestor) {
              if (ancestor === stopNode) {
                  return res;
              }
              if (ancestor._isMatch(selector)) {
                  res.push(ancestor);
              }
              ancestor = ancestor.parent;
          }
          return res;
      };
      Node.prototype.isAncestorOf = function (node) {
          return false;
      };
      /**
       * get ancestor (parent or parent of the parent, etc) of the node that match passed selector
       * @method
       * @name Konva.Node#findAncestor
       * @param {String} selector selector for search
       * @param {Boolean} [includeSelf] show we think that node is ancestro itself?
       * @param {Konva.Node} [stopNode] optional node where we need to stop searching (one of ancestors)
       * @returns {Konva.Node} ancestor
       * @example
       * // get one of the parent group
       * var group = node.findAncestors('.mygroup');
       */
      Node.prototype.findAncestor = function (selector, includeSelf, stopNode) {
          return this.findAncestors(selector, includeSelf, stopNode)[0];
      };
      // is current node match passed selector?
      Node.prototype._isMatch = function (selector) {
          if (!selector) {
              return false;
          }
          if (typeof selector === 'function') {
              return selector(this);
          }
          var selectorArr = selector.replace(/ /g, '').split(','), len = selectorArr.length, n, sel;
          for (n = 0; n < len; n++) {
              sel = selectorArr[n];
              if (!Util.isValidSelector(sel)) {
                  Util.warn('Selector "' +
                      sel +
                      '" is invalid. Allowed selectors examples are "#foo", ".bar" or "Group".');
                  Util.warn('If you have a custom shape with such className, please change it to start with upper letter like "Triangle".');
                  Util.warn('Konva is awesome, right?');
              }
              // id selector
              if (sel.charAt(0) === '#') {
                  if (this.id() === sel.slice(1)) {
                      return true;
                  }
              }
              else if (sel.charAt(0) === '.') {
                  // name selector
                  if (this.hasName(sel.slice(1))) {
                      return true;
                  }
              }
              else if (this.className === sel || this.nodeType === sel) {
                  return true;
              }
          }
          return false;
      };
      /**
       * get layer ancestor
       * @method
       * @name Konva.Node#getLayer
       * @returns {Konva.Layer}
       */
      Node.prototype.getLayer = function () {
          var parent = this.getParent();
          return parent ? parent.getLayer() : null;
      };
      /**
       * get stage ancestor
       * @method
       * @name Konva.Node#getStage
       * @returns {Konva.Stage}
       */
      Node.prototype.getStage = function () {
          return this._getCache(STAGE, this._getStage);
      };
      Node.prototype._getStage = function () {
          var parent = this.getParent();
          if (parent) {
              return parent.getStage();
          }
          else {
              return undefined;
          }
      };
      /**
       * fire event
       * @method
       * @name Konva.Node#fire
       * @param {String} eventType event type.  can be a regular event, like click, mouseover, or mouseout, or it can be a custom event, like myCustomEvent
       * @param {Event} [evt] event object
       * @param {Boolean} [bubble] setting the value to false, or leaving it undefined, will result in the event
       *  not bubbling.  Setting the value to true will result in the event bubbling.
       * @returns {Konva.Node}
       * @example
       * // manually fire click event
       * node.fire('click');
       *
       * // fire custom event
       * node.fire('foo');
       *
       * // fire custom event with custom event object
       * node.fire('foo', {
       *   bar: 10
       * });
       *
       * // fire click event that bubbles
       * node.fire('click', null, true);
       */
      Node.prototype.fire = function (eventType, evt, bubble) {
          if (evt === void 0) { evt = {}; }
          evt.target = evt.target || this;
          // bubble
          if (bubble) {
              this._fireAndBubble(eventType, evt);
          }
          else {
              // no bubble
              this._fire(eventType, evt);
          }
          return this;
      };
      /**
       * get absolute transform of the node which takes into
       *  account its ancestor transforms
       * @method
       * @name Konva.Node#getAbsoluteTransform
       * @returns {Konva.Transform}
       */
      Node.prototype.getAbsoluteTransform = function (top) {
          // if using an argument, we can't cache the result.
          if (top) {
              return this._getAbsoluteTransform(top);
          }
          else {
              // if no argument, we can cache the result
              return this._getCache(ABSOLUTE_TRANSFORM, this._getAbsoluteTransform);
          }
      };
      Node.prototype._getAbsoluteTransform = function (top) {
          var at;
          // we we need position relative to an ancestor, we will iterate for all
          if (top) {
              at = new Transform();
              // start with stage and traverse downwards to self
              this._eachAncestorReverse(function (node) {
                  var transformsEnabled = node.transformsEnabled();
                  if (transformsEnabled === 'all') {
                      at.multiply(node.getTransform());
                  }
                  else if (transformsEnabled === 'position') {
                      at.translate(node.x() - node.offsetX(), node.y() - node.offsetY());
                  }
              }, top);
              return at;
          }
          else {
              // try to use a cached value
              if (this.parent) {
                  // transform will be cached
                  at = this.parent.getAbsoluteTransform().copy();
              }
              else {
                  at = new Transform();
              }
              var transformsEnabled = this.transformsEnabled();
              if (transformsEnabled === 'all') {
                  at.multiply(this.getTransform());
              }
              else if (transformsEnabled === 'position') {
                  at.translate(this.x() - this.offsetX(), this.y() - this.offsetY());
              }
              return at;
          }
      };
      /**
       * get absolute scale of the node which takes into
       *  account its ancestor scales
       * @method
       * @name Konva.Node#getAbsoluteScale
       * @returns {Object}
       * @example
       * // get absolute scale x
       * var scaleX = node.getAbsoluteScale().x;
       */
      Node.prototype.getAbsoluteScale = function (top) {
          // do not cache this calculations,
          // because it use cache transform
          // this is special logic for caching with some shapes with shadow
          var parent = this;
          while (parent) {
              if (parent._isUnderCache) {
                  top = parent;
              }
              parent = parent.getParent();
          }
          var transform = this.getAbsoluteTransform(top);
          var attrs = transform.decompose();
          return {
              x: attrs.scaleX,
              y: attrs.scaleY,
          };
      };
      /**
       * get absolute rotation of the node which takes into
       *  account its ancestor rotations
       * @method
       * @name Konva.Node#getAbsoluteRotation
       * @returns {Number}
       * @example
       * // get absolute scale x
       * var rotation = node.getAbsoluteRotation();
       */
      Node.prototype.getAbsoluteRotation = function () {
          // var parent: Node = this;
          // var rotation = 0;
          // while (parent) {
          //   rotation += parent.rotation();
          //   parent = parent.getParent();
          // }
          // return rotation;
          return this.getAbsoluteTransform().decompose().rotation;
      };
      /**
       * get transform of the node
       * @method
       * @name Konva.Node#getTransform
       * @returns {Konva.Transform}
       */
      Node.prototype.getTransform = function () {
          return this._getCache(TRANSFORM, this._getTransform);
      };
      Node.prototype._getTransform = function () {
          var m = new Transform(), x = this.x(), y = this.y(), rotation = Konva.getAngle(this.rotation()), scaleX = this.scaleX(), scaleY = this.scaleY(), skewX = this.skewX(), skewY = this.skewY(), offsetX = this.offsetX(), offsetY = this.offsetY();
          if (x !== 0 || y !== 0) {
              m.translate(x, y);
          }
          if (rotation !== 0) {
              m.rotate(rotation);
          }
          if (skewX !== 0 || skewY !== 0) {
              m.skew(skewX, skewY);
          }
          if (scaleX !== 1 || scaleY !== 1) {
              m.scale(scaleX, scaleY);
          }
          if (offsetX !== 0 || offsetY !== 0) {
              m.translate(-1 * offsetX, -1 * offsetY);
          }
          return m;
      };
      /**
       * clone node.  Returns a new Node instance with identical attributes.  You can also override
       *  the node properties with an object literal, enabling you to use an existing node as a template
       *  for another node
       * @method
       * @name Konva.Node#clone
       * @param {Object} obj override attrs
       * @returns {Konva.Node}
       * @example
       * // simple clone
       * var clone = node.clone();
       *
       * // clone a node and override the x position
       * var clone = rect.clone({
       *   x: 5
       * });
       */
      Node.prototype.clone = function (obj) {
          // instantiate new node
          var attrs = Util.cloneObject(this.attrs), key, allListeners, len, n, listener;
          // apply attr overrides
          for (key in obj) {
              attrs[key] = obj[key];
          }
          var node = new this.constructor(attrs);
          // copy over listeners
          for (key in this.eventListeners) {
              allListeners = this.eventListeners[key];
              len = allListeners.length;
              for (n = 0; n < len; n++) {
                  listener = allListeners[n];
                  /*
                   * don't include konva namespaced listeners because
                   *  these are generated by the constructors
                   */
                  if (listener.name.indexOf(KONVA) < 0) {
                      // if listeners array doesn't exist, then create it
                      if (!node.eventListeners[key]) {
                          node.eventListeners[key] = [];
                      }
                      node.eventListeners[key].push(listener);
                  }
              }
          }
          return node;
      };
      Node.prototype._toKonvaCanvas = function (config) {
          config = config || {};
          var box = this.getClientRect();
          var stage = this.getStage(), x = config.x !== undefined ? config.x : box.x, y = config.y !== undefined ? config.y : box.y, pixelRatio = config.pixelRatio || 1, canvas = new SceneCanvas({
              width: config.width || box.width || (stage ? stage.width() : 0),
              height: config.height || box.height || (stage ? stage.height() : 0),
              pixelRatio: pixelRatio,
          }), context = canvas.getContext();
          context.save();
          if (x || y) {
              context.translate(-1 * x, -1 * y);
          }
          this.drawScene(canvas);
          context.restore();
          return canvas;
      };
      /**
       * converts node into an canvas element.
       * @method
       * @name Konva.Node#toCanvas
       * @param {Object} config
       * @param {Function} config.callback function executed when the composite has completed
       * @param {Number} [config.x] x position of canvas section
       * @param {Number} [config.y] y position of canvas section
       * @param {Number} [config.width] width of canvas section
       * @param {Number} [config.height] height of canvas section
       * @param {Number} [config.pixelRatio] pixelRatio of output canvas. Default is 1.
       * You can use that property to increase quality of the image, for example for super hight quality exports
       * or usage on retina (or similar) displays. pixelRatio will be used to multiply the size of exported image.
       * If you export to 500x500 size with pixelRatio = 2, then produced image will have size 1000x1000.
       * @example
       * var canvas = node.toCanvas();
       */
      Node.prototype.toCanvas = function (config) {
          return this._toKonvaCanvas(config)._canvas;
      };
      /**
       * Creates a composite data URL (base64 string). If MIME type is not
       * specified, then "image/png" will result. For "image/jpeg", specify a quality
       * level as quality (range 0.0 - 1.0)
       * @method
       * @name Konva.Node#toDataURL
       * @param {Object} config
       * @param {String} [config.mimeType] can be "image/png" or "image/jpeg".
       *  "image/png" is the default
       * @param {Number} [config.x] x position of canvas section
       * @param {Number} [config.y] y position of canvas section
       * @param {Number} [config.width] width of canvas section
       * @param {Number} [config.height] height of canvas section
       * @param {Number} [config.quality] jpeg quality.  If using an "image/jpeg" mimeType,
       *  you can specify the quality from 0 to 1, where 0 is very poor quality and 1
       *  is very high quality
       * @param {Number} [config.pixelRatio] pixelRatio of output image url. Default is 1.
       * You can use that property to increase quality of the image, for example for super hight quality exports
       * or usage on retina (or similar) displays. pixelRatio will be used to multiply the size of exported image.
       * If you export to 500x500 size with pixelRatio = 2, then produced image will have size 1000x1000.
       * @returns {String}
       */
      Node.prototype.toDataURL = function (config) {
          config = config || {};
          var mimeType = config.mimeType || null, quality = config.quality || null;
          var url = this._toKonvaCanvas(config).toDataURL(mimeType, quality);
          if (config.callback) {
              config.callback(url);
          }
          return url;
      };
      /**
       * converts node into an image.  Since the toImage
       *  method is asynchronous, a callback is required.  toImage is most commonly used
       *  to cache complex drawings as an image so that they don't have to constantly be redrawn
       * @method
       * @name Konva.Node#toImage
       * @param {Object} config
       * @param {Function} config.callback function executed when the composite has completed
       * @param {String} [config.mimeType] can be "image/png" or "image/jpeg".
       *  "image/png" is the default
       * @param {Number} [config.x] x position of canvas section
       * @param {Number} [config.y] y position of canvas section
       * @param {Number} [config.width] width of canvas section
       * @param {Number} [config.height] height of canvas section
       * @param {Number} [config.quality] jpeg quality.  If using an "image/jpeg" mimeType,
       *  you can specify the quality from 0 to 1, where 0 is very poor quality and 1
       *  is very high quality
       * @param {Number} [config.pixelRatio] pixelRatio of output image. Default is 1.
       * You can use that property to increase quality of the image, for example for super hight quality exports
       * or usage on retina (or similar) displays. pixelRatio will be used to multiply the size of exported image.
       * If you export to 500x500 size with pixelRatio = 2, then produced image will have size 1000x1000.
       * @example
       * var image = node.toImage({
       *   callback(img) {
       *     // do stuff with img
       *   }
       * });
       */
      Node.prototype.toImage = function (config) {
          if (!config || !config.callback) {
              throw 'callback required for toImage method config argument';
          }
          var callback = config.callback;
          delete config.callback;
          Util._urlToImage(this.toDataURL(config), function (img) {
              callback(img);
          });
      };
      Node.prototype.setSize = function (size) {
          this.width(size.width);
          this.height(size.height);
          return this;
      };
      Node.prototype.getSize = function () {
          return {
              width: this.width(),
              height: this.height(),
          };
      };
      /**
       * get class name, which may return Stage, Layer, Group, or shape class names like Rect, Circle, Text, etc.
       * @method
       * @name Konva.Node#getClassName
       * @returns {String}
       */
      Node.prototype.getClassName = function () {
          return this.className || this.nodeType;
      };
      /**
       * get the node type, which may return Stage, Layer, Group, or Shape
       * @method
       * @name Konva.Node#getType
       * @returns {String}
       */
      Node.prototype.getType = function () {
          return this.nodeType;
      };
      Node.prototype.getDragDistance = function () {
          // compare with undefined because we need to track 0 value
          if (this.attrs.dragDistance !== undefined) {
              return this.attrs.dragDistance;
          }
          else if (this.parent) {
              return this.parent.getDragDistance();
          }
          else {
              return Konva.dragDistance;
          }
      };
      Node.prototype._off = function (type, name, callback) {
          var evtListeners = this.eventListeners[type], i, evtName, handler;
          for (i = 0; i < evtListeners.length; i++) {
              evtName = evtListeners[i].name;
              handler = evtListeners[i].handler;
              // the following two conditions must be true in order to remove a handler:
              // 1) the current event name cannot be konva unless the event name is konva
              //    this enables developers to force remove a konva specific listener for whatever reason
              // 2) an event name is not specified, or if one is specified, it matches the current event name
              if ((evtName !== 'konva' || name === 'konva') &&
                  (!name || evtName === name) &&
                  (!callback || callback === handler)) {
                  evtListeners.splice(i, 1);
                  if (evtListeners.length === 0) {
                      delete this.eventListeners[type];
                      break;
                  }
                  i--;
              }
          }
      };
      Node.prototype._fireChangeEvent = function (attr, oldVal, newVal) {
          this._fire(attr + CHANGE, {
              oldVal: oldVal,
              newVal: newVal,
          });
      };
      Node.prototype.setId = function (id) {
          var oldId = this.id();
          _removeId(oldId, this);
          _addId(this, id);
          this._setAttr('id', id);
          return this;
      };
      Node.prototype.setName = function (name) {
          var oldNames = (this.name() || '').split(/\s/g);
          var newNames = (name || '').split(/\s/g);
          var subname, i;
          // remove all subnames
          for (i = 0; i < oldNames.length; i++) {
              subname = oldNames[i];
              if (newNames.indexOf(subname) === -1 && subname) {
                  _removeName(subname, this._id);
              }
          }
          // add new names
          for (i = 0; i < newNames.length; i++) {
              subname = newNames[i];
              if (oldNames.indexOf(subname) === -1 && subname) {
                  _addName(this, subname);
              }
          }
          this._setAttr(NAME, name);
          return this;
      };
      /**
       * add name to node
       * @method
       * @name Konva.Node#addName
       * @param {String} name
       * @returns {Konva.Node}
       * @example
       * node.name('red');
       * node.addName('selected');
       * node.name(); // return 'red selected'
       */
      Node.prototype.addName = function (name) {
          if (!this.hasName(name)) {
              var oldName = this.name();
              var newName = oldName ? oldName + ' ' + name : name;
              this.setName(newName);
          }
          return this;
      };
      /**
       * check is node has name
       * @method
       * @name Konva.Node#hasName
       * @param {String} name
       * @returns {Boolean}
       * @example
       * node.name('red');
       * node.hasName('red');   // return true
       * node.hasName('selected'); // return false
       * node.hasName(''); // return false
       */
      Node.prototype.hasName = function (name) {
          if (!name) {
              return false;
          }
          var fullName = this.name();
          if (!fullName) {
              return false;
          }
          // if name is '' the "names" will be [''], so I added extra check above
          var names = (fullName || '').split(/\s/g);
          return names.indexOf(name) !== -1;
      };
      /**
       * remove name from node
       * @method
       * @name Konva.Node#removeName
       * @param {String} name
       * @returns {Konva.Node}
       * @example
       * node.name('red selected');
       * node.removeName('selected');
       * node.hasName('selected'); // return false
       * node.name(); // return 'red'
       */
      Node.prototype.removeName = function (name) {
          var names = (this.name() || '').split(/\s/g);
          var index = names.indexOf(name);
          if (index !== -1) {
              names.splice(index, 1);
              this.setName(names.join(' '));
          }
          return this;
      };
      /**
       * set attr
       * @method
       * @name Konva.Node#setAttr
       * @param {String} attr
       * @param {*} val
       * @returns {Konva.Node}
       * @example
       * node.setAttr('x', 5);
       */
      Node.prototype.setAttr = function (attr, val) {
          var func = this[SET$1 + Util._capitalize(attr)];
          if (Util._isFunction(func)) {
              func.call(this, val);
          }
          else {
              // otherwise set directly
              this._setAttr(attr, val);
          }
          return this;
      };
      Node.prototype._setAttr = function (key, val) {
          var oldVal = this.attrs[key];
          if (oldVal === val && !Util.isObject(val)) {
              return;
          }
          if (val === undefined || val === null) {
              delete this.attrs[key];
          }
          else {
              this.attrs[key] = val;
          }
          this._fireChangeEvent(key, oldVal, val);
      };
      Node.prototype._setComponentAttr = function (key, component, val) {
          var oldVal;
          if (val !== undefined) {
              oldVal = this.attrs[key];
              if (!oldVal) {
                  // set value to default value using getAttr
                  this.attrs[key] = this.getAttr(key);
              }
              this.attrs[key][component] = val;
              this._fireChangeEvent(key, oldVal, val);
          }
      };
      Node.prototype._fireAndBubble = function (eventType, evt, compareShape) {
          if (evt && this.nodeType === SHAPE) {
              evt.target = this;
          }
          var shouldStop = (eventType === MOUSEENTER || eventType === MOUSELEAVE) &&
              ((compareShape &&
                  (this === compareShape ||
                      (this.isAncestorOf && this.isAncestorOf(compareShape)))) ||
                  (this.nodeType === 'Stage' && !compareShape));
          if (!shouldStop) {
              this._fire(eventType, evt);
              // simulate event bubbling
              var stopBubble = (eventType === MOUSEENTER || eventType === MOUSELEAVE) &&
                  compareShape &&
                  compareShape.isAncestorOf &&
                  compareShape.isAncestorOf(this) &&
                  !compareShape.isAncestorOf(this.parent);
              if (((evt && !evt.cancelBubble) || !evt) &&
                  this.parent &&
                  this.parent.isListening() &&
                  !stopBubble) {
                  if (compareShape && compareShape.parent) {
                      this._fireAndBubble.call(this.parent, eventType, evt, compareShape);
                  }
                  else {
                      this._fireAndBubble.call(this.parent, eventType, evt);
                  }
              }
          }
      };
      Node.prototype._fire = function (eventType, evt) {
          var events = this.eventListeners[eventType], i;
          if (events) {
              evt = evt || {};
              evt.currentTarget = this;
              evt.type = eventType;
              for (i = 0; i < events.length; i++) {
                  events[i].handler.call(this, evt);
              }
          }
      };
      /**
       * draw both scene and hit graphs.  If the node being drawn is the stage, all of the layers will be cleared and redrawn
       * @method
       * @name Konva.Node#draw
       * @returns {Konva.Node}
       */
      Node.prototype.draw = function () {
          this.drawScene();
          this.drawHit();
          return this;
      };
      // drag & drop
      Node.prototype._createDragElement = function (evt) {
          var pointerId = evt ? evt.pointerId : undefined;
          var stage = this.getStage();
          var ap = this.getAbsolutePosition();
          var pos = stage._getPointerById(pointerId) ||
              stage._changedPointerPositions[0] ||
              ap;
          DD._dragElements.set(this._id, {
              node: this,
              startPointerPos: pos,
              offset: {
                  x: pos.x - ap.x,
                  y: pos.y - ap.y,
              },
              dragStatus: 'ready',
              pointerId: pointerId,
          });
      };
      /**
       * initiate drag and drop.
       * @method
       * @name Konva.Node#startDrag
       */
      Node.prototype.startDrag = function (evt) {
          if (!DD._dragElements.has(this._id)) {
              this._createDragElement(evt);
          }
          var elem = DD._dragElements.get(this._id);
          elem.dragStatus = 'dragging';
          this.fire('dragstart', {
              type: 'dragstart',
              target: this,
              evt: evt && evt.evt,
          }, true);
      };
      Node.prototype._setDragPosition = function (evt, elem) {
          // const pointers = this.getStage().getPointersPositions();
          // const pos = pointers.find(p => p.id === this._dragEventId);
          var pos = this.getStage()._getPointerById(elem.pointerId);
          if (!pos) {
              return;
          }
          var newNodePos = {
              x: pos.x - elem.offset.x,
              y: pos.y - elem.offset.y,
          };
          var dbf = this.dragBoundFunc();
          if (dbf !== undefined) {
              var bounded = dbf.call(this, newNodePos, evt);
              if (!bounded) {
                  Util.warn('dragBoundFunc did not return any value. That is unexpected behavior. You must return new absolute position from dragBoundFunc.');
              }
              else {
                  newNodePos = bounded;
              }
          }
          if (!this._lastPos ||
              this._lastPos.x !== newNodePos.x ||
              this._lastPos.y !== newNodePos.y) {
              this.setAbsolutePosition(newNodePos);
              if (this.getLayer()) {
                  this.getLayer().batchDraw();
              }
              else if (this.getStage()) {
                  this.getStage().batchDraw();
              }
          }
          this._lastPos = newNodePos;
      };
      /**
       * stop drag and drop
       * @method
       * @name Konva.Node#stopDrag
       */
      Node.prototype.stopDrag = function (evt) {
          var elem = DD._dragElements.get(this._id);
          if (elem) {
              elem.dragStatus = 'stopped';
          }
          DD._endDragBefore(evt);
          DD._endDragAfter(evt);
      };
      Node.prototype.setDraggable = function (draggable) {
          this._setAttr('draggable', draggable);
          this._dragChange();
      };
      /**
       * determine if node is currently in drag and drop mode
       * @method
       * @name Konva.Node#isDragging
       */
      Node.prototype.isDragging = function () {
          var elem = DD._dragElements.get(this._id);
          return elem ? elem.dragStatus === 'dragging' : false;
      };
      Node.prototype._listenDrag = function () {
          this._dragCleanup();
          this.on('mousedown.konva touchstart.konva', function (evt) {
              var _this = this;
              var shouldCheckButton = evt.evt['button'] !== undefined;
              var canDrag = !shouldCheckButton || Konva.dragButtons.indexOf(evt.evt['button']) >= 0;
              if (!canDrag) {
                  return;
              }
              if (this.isDragging()) {
                  return;
              }
              var hasDraggingChild = false;
              DD._dragElements.forEach(function (elem) {
                  if (_this.isAncestorOf(elem.node)) {
                      hasDraggingChild = true;
                  }
              });
              // nested drag can be started
              // in that case we don't need to start new drag
              if (!hasDraggingChild) {
                  this._createDragElement(evt);
              }
          });
      };
      Node.prototype._dragChange = function () {
          if (this.attrs.draggable) {
              this._listenDrag();
          }
          else {
              // remove event listeners
              this._dragCleanup();
              /*
               * force drag and drop to end
               * if this node is currently in
               * drag and drop mode
               */
              var stage = this.getStage();
              if (stage && DD._dragElements.has(this._id)) {
                  this.stopDrag();
              }
          }
      };
      Node.prototype._dragCleanup = function () {
          this.off('mousedown.konva');
          this.off('touchstart.konva');
      };
      /**
       * create node with JSON string or an Object.  De-serializtion does not generate custom
       *  shape drawing functions, images, or event handlers (this would make the
       *  serialized object huge).  If your app uses custom shapes, images, and
       *  event handlers (it probably does), then you need to select the appropriate
       *  shapes after loading the stage and set these properties via on(), setSceneFunc(),
       *  and setImage() methods
       * @method
       * @memberof Konva.Node
       * @param {String|Object} json string or object
       * @param {Element} [container] optional container dom element used only if you're
       *  creating a stage node
       */
      Node.create = function (data, container) {
          if (Util._isString(data)) {
              data = JSON.parse(data);
          }
          return this._createNode(data, container);
      };
      Node._createNode = function (obj, container) {
          var className = Node.prototype.getClassName.call(obj), children = obj.children, no, len, n;
          // if container was passed in, add it to attrs
          if (container) {
              obj.attrs.container = container;
          }
          if (!_NODES_REGISTRY[className]) {
              Util.warn('Can not find a node with class name "' +
                  className +
                  '". Fallback to "Shape".');
              className = 'Shape';
          }
          var Class = _NODES_REGISTRY[className];
          no = new Class(obj.attrs);
          if (children) {
              len = children.length;
              for (n = 0; n < len; n++) {
                  no.add(Node._createNode(children[n]));
              }
          }
          return no;
      };
      return Node;
  }());
  Node.prototype.nodeType = 'Node';
  Node.prototype._attrsAffectingSize = [];
  /**
   * get/set zIndex relative to the node's siblings who share the same parent.
   * Please remember that zIndex is not absolute (like in CSS). It is relative to parent element only.
   * @name Konva.Node#zIndex
   * @method
   * @param {Number} index
   * @returns {Number}
   * @example
   * // get index
   * var index = node.zIndex();
   *
   * // set index
   * node.zIndex(2);
   */
  Factory.addGetterSetter(Node, 'zIndex');
  /**
   * get/set node absolute position
   * @name Konva.Node#absolutePosition
   * @method
   * @param {Object} pos
   * @param {Number} pos.x
   * @param {Number} pos.y
   * @returns {Object}
   * @example
   * // get position
   * var position = node.absolutePosition();
   *
   * // set position
   * node.absolutePosition({
   *   x: 5,
   *   y: 10
   * });
   */
  Factory.addGetterSetter(Node, 'absolutePosition');
  Factory.addGetterSetter(Node, 'position');
  /**
   * get/set node position relative to parent
   * @name Konva.Node#position
   * @method
   * @param {Object} pos
   * @param {Number} pos.x
   * @param {Number} pos.y
   * @returns {Object}
   * @example
   * // get position
   * var position = node.position();
   *
   * // set position
   * node.position({
   *   x: 5,
   *   y: 10
   * });
   */
  Factory.addGetterSetter(Node, 'x', 0, getNumberValidator());
  /**
   * get/set x position
   * @name Konva.Node#x
   * @method
   * @param {Number} x
   * @returns {Object}
   * @example
   * // get x
   * var x = node.x();
   *
   * // set x
   * node.x(5);
   */
  Factory.addGetterSetter(Node, 'y', 0, getNumberValidator());
  /**
   * get/set y position
   * @name Konva.Node#y
   * @method
   * @param {Number} y
   * @returns {Integer}
   * @example
   * // get y
   * var y = node.y();
   *
   * // set y
   * node.y(5);
   */
  Factory.addGetterSetter(Node, 'globalCompositeOperation', 'source-over', getStringValidator());
  /**
   * get/set globalCompositeOperation of a shape
   * @name Konva.Node#globalCompositeOperation
   * @method
   * @param {String} type
   * @returns {String}
   * @example
   * // get globalCompositeOperation
   * var globalCompositeOperation = shape.globalCompositeOperation();
   *
   * // set globalCompositeOperation
   * shape.globalCompositeOperation('source-in');
   */
  Factory.addGetterSetter(Node, 'opacity', 1, getNumberValidator());
  /**
   * get/set opacity.  Opacity values range from 0 to 1.
   *  A node with an opacity of 0 is fully transparent, and a node
   *  with an opacity of 1 is fully opaque
   * @name Konva.Node#opacity
   * @method
   * @param {Object} opacity
   * @returns {Number}
   * @example
   * // get opacity
   * var opacity = node.opacity();
   *
   * // set opacity
   * node.opacity(0.5);
   */
  Factory.addGetterSetter(Node, 'name', '', getStringValidator());
  /**
   * get/set name
   * @name Konva.Node#name
   * @method
   * @param {String} name
   * @returns {String}
   * @example
   * // get name
   * var name = node.name();
   *
   * // set name
   * node.name('foo');
   *
   * // also node may have multiple names (as css classes)
   * node.name('foo bar');
   */
  Factory.addGetterSetter(Node, 'id', '', getStringValidator());
  /**
   * get/set id. Id is global for whole page.
   * @name Konva.Node#id
   * @method
   * @param {String} id
   * @returns {String}
   * @example
   * // get id
   * var name = node.id();
   *
   * // set id
   * node.id('foo');
   */
  Factory.addGetterSetter(Node, 'rotation', 0, getNumberValidator());
  /**
   * get/set rotation in degrees
   * @name Konva.Node#rotation
   * @method
   * @param {Number} rotation
   * @returns {Number}
   * @example
   * // get rotation in degrees
   * var rotation = node.rotation();
   *
   * // set rotation in degrees
   * node.rotation(45);
   */
  Factory.addComponentsGetterSetter(Node, 'scale', ['x', 'y']);
  /**
   * get/set scale
   * @name Konva.Node#scale
   * @param {Object} scale
   * @param {Number} scale.x
   * @param {Number} scale.y
   * @method
   * @returns {Object}
   * @example
   * // get scale
   * var scale = node.scale();
   *
   * // set scale
   * shape.scale({
   *   x: 2,
   *   y: 3
   * });
   */
  Factory.addGetterSetter(Node, 'scaleX', 1, getNumberValidator());
  /**
   * get/set scale x
   * @name Konva.Node#scaleX
   * @param {Number} x
   * @method
   * @returns {Number}
   * @example
   * // get scale x
   * var scaleX = node.scaleX();
   *
   * // set scale x
   * node.scaleX(2);
   */
  Factory.addGetterSetter(Node, 'scaleY', 1, getNumberValidator());
  /**
   * get/set scale y
   * @name Konva.Node#scaleY
   * @param {Number} y
   * @method
   * @returns {Number}
   * @example
   * // get scale y
   * var scaleY = node.scaleY();
   *
   * // set scale y
   * node.scaleY(2);
   */
  Factory.addComponentsGetterSetter(Node, 'skew', ['x', 'y']);
  /**
   * get/set skew
   * @name Konva.Node#skew
   * @param {Object} skew
   * @param {Number} skew.x
   * @param {Number} skew.y
   * @method
   * @returns {Object}
   * @example
   * // get skew
   * var skew = node.skew();
   *
   * // set skew
   * node.skew({
   *   x: 20,
   *   y: 10
   * });
   */
  Factory.addGetterSetter(Node, 'skewX', 0, getNumberValidator());
  /**
   * get/set skew x
   * @name Konva.Node#skewX
   * @param {Number} x
   * @method
   * @returns {Number}
   * @example
   * // get skew x
   * var skewX = node.skewX();
   *
   * // set skew x
   * node.skewX(3);
   */
  Factory.addGetterSetter(Node, 'skewY', 0, getNumberValidator());
  /**
   * get/set skew y
   * @name Konva.Node#skewY
   * @param {Number} y
   * @method
   * @returns {Number}
   * @example
   * // get skew y
   * var skewY = node.skewY();
   *
   * // set skew y
   * node.skewY(3);
   */
  Factory.addComponentsGetterSetter(Node, 'offset', ['x', 'y']);
  /**
   * get/set offset.  Offsets the default position and rotation point
   * @method
   * @param {Object} offset
   * @param {Number} offset.x
   * @param {Number} offset.y
   * @returns {Object}
   * @example
   * // get offset
   * var offset = node.offset();
   *
   * // set offset
   * node.offset({
   *   x: 20,
   *   y: 10
   * });
   */
  Factory.addGetterSetter(Node, 'offsetX', 0, getNumberValidator());
  /**
   * get/set offset x
   * @name Konva.Node#offsetX
   * @method
   * @param {Number} x
   * @returns {Number}
   * @example
   * // get offset x
   * var offsetX = node.offsetX();
   *
   * // set offset x
   * node.offsetX(3);
   */
  Factory.addGetterSetter(Node, 'offsetY', 0, getNumberValidator());
  /**
   * get/set offset y
   * @name Konva.Node#offsetY
   * @method
   * @param {Number} y
   * @returns {Number}
   * @example
   * // get offset y
   * var offsetY = node.offsetY();
   *
   * // set offset y
   * node.offsetY(3);
   */
  Factory.addGetterSetter(Node, 'dragDistance', null, getNumberValidator());
  /**
   * get/set drag distance
   * @name Konva.Node#dragDistance
   * @method
   * @param {Number} distance
   * @returns {Number}
   * @example
   * // get drag distance
   * var dragDistance = node.dragDistance();
   *
   * // set distance
   * // node starts dragging only if pointer moved more then 3 pixels
   * node.dragDistance(3);
   * // or set globally
   * Konva.dragDistance = 3;
   */
  Factory.addGetterSetter(Node, 'width', 0, getNumberValidator());
  /**
   * get/set width
   * @name Konva.Node#width
   * @method
   * @param {Number} width
   * @returns {Number}
   * @example
   * // get width
   * var width = node.width();
   *
   * // set width
   * node.width(100);
   */
  Factory.addGetterSetter(Node, 'height', 0, getNumberValidator());
  /**
   * get/set height
   * @name Konva.Node#height
   * @method
   * @param {Number} height
   * @returns {Number}
   * @example
   * // get height
   * var height = node.height();
   *
   * // set height
   * node.height(100);
   */
  Factory.addGetterSetter(Node, 'listening', 'inherit', function (val) {
      var isValid = val === true || val === false || val === 'inherit';
      if (!isValid) {
          Util.warn(val +
              ' is a not valid value for "listening" attribute. The value may be true, false or "inherit".');
      }
      return val;
  });
  /**
   * get/set listenig attr.  If you need to determine if a node is listening or not
   *   by taking into account its parents, use the isListening() method
   * @name Konva.Node#listening
   * @method
   * @param {Boolean|String} listening Can be "inherit", true, or false.  The default is "inherit".
   * @returns {Boolean|String}
   * @example
   * // get listening attr
   * var listening = node.listening();
   *
   * // stop listening for events
   * node.listening(false);
   *
   * // listen for events
   * node.listening(true);
   *
   * // listen to events according to the parent
   * node.listening('inherit');
   */
  /**
   * get/set preventDefault
   * By default all shapes will prevent default behaviour
   * of a browser on a pointer move or tap.
   * that will prevent native scrolling when you are trying to drag&drop a node
   * but sometimes you may need to enable default actions
   * in that case you can set the property to false
   * @name Konva.Node#preventDefault
   * @method
   * @param {Number} preventDefault
   * @returns {Number}
   * @example
   * // get preventDefault
   * var shouldPrevent = shape.preventDefault();
   *
   * // set preventDefault
   * shape.preventDefault(false);
   */
  Factory.addGetterSetter(Node, 'preventDefault', true, getBooleanValidator());
  Factory.addGetterSetter(Node, 'filters', null, function (val) {
      this._filterUpToDate = false;
      return val;
  });
  /**
   * get/set filters.  Filters are applied to cached canvases
   * @name Konva.Node#filters
   * @method
   * @param {Array} filters array of filters
   * @returns {Array}
   * @example
   * // get filters
   * var filters = node.filters();
   *
   * // set a single filter
   * node.cache();
   * node.filters([Konva.Filters.Blur]);
   *
   * // set multiple filters
   * node.cache();
   * node.filters([
   *   Konva.Filters.Blur,
   *   Konva.Filters.Sepia,
   *   Konva.Filters.Invert
   * ]);
   */
  Factory.addGetterSetter(Node, 'visible', 'inherit', function (val) {
      var isValid = val === true || val === false || val === 'inherit';
      if (!isValid) {
          Util.warn(val +
              ' is a not valid value for "visible" attribute. The value may be true, false or "inherit".');
      }
      return val;
  });
  /**
   * get/set visible attr.  Can be "inherit", true, or false.  The default is "inherit".
   *   If you need to determine if a node is visible or not
   *   by taking into account its parents, use the isVisible() method
   * @name Konva.Node#visible
   * @method
   * @param {Boolean|String} visible
   * @returns {Boolean|String}
   * @example
   * // get visible attr
   * var visible = node.visible();
   *
   * // make invisible
   * node.visible(false);
   *
   * // make visible
   * node.visible(true);
   *
   * // make visible according to the parent
   * node.visible('inherit');
   */
  Factory.addGetterSetter(Node, 'transformsEnabled', 'all', getStringValidator());
  /**
   * get/set transforms that are enabled.  Can be "all", "none", or "position".  The default
   *  is "all"
   * @name Konva.Node#transformsEnabled
   * @method
   * @param {String} enabled
   * @returns {String}
   * @example
   * // enable position transform only to improve draw performance
   * node.transformsEnabled('position');
   *
   * // enable all transforms
   * node.transformsEnabled('all');
   */
  /**
   * get/set node size
   * @name Konva.Node#size
   * @method
   * @param {Object} size
   * @param {Number} size.width
   * @param {Number} size.height
   * @returns {Object}
   * @example
   * // get node size
   * var size = node.size();
   * var x = size.x;
   * var y = size.y;
   *
   * // set size
   * node.size({
   *   width: 100,
   *   height: 200
   * });
   */
  Factory.addGetterSetter(Node, 'size');
  /**
   * get/set drag bound function.  This is used to override the default
   *  drag and drop position.
   * @name Konva.Node#dragBoundFunc
   * @method
   * @param {Function} dragBoundFunc
   * @returns {Function}
   * @example
   * // get drag bound function
   * var dragBoundFunc = node.dragBoundFunc();
   *
   * // create vertical drag and drop
   * node.dragBoundFunc(function(pos){
   *   // important pos - is absolute position of the node
   *   // you should return absolute position too
   *   return {
   *     x: this.absolutePosition().x,
   *     y: pos.y
   *   };
   * });
   */
  Factory.addGetterSetter(Node, 'dragBoundFunc');
  /**
   * get/set draggable flag
   * @name Konva.Node#draggable
   * @method
   * @param {Boolean} draggable
   * @returns {Boolean}
   * @example
   * // get draggable flag
   * var draggable = node.draggable();
   *
   * // enable drag and drop
   * node.draggable(true);
   *
   * // disable drag and drop
   * node.draggable(false);
   */
  Factory.addGetterSetter(Node, 'draggable', false, getBooleanValidator());
  Factory.backCompat(Node, {
      rotateDeg: 'rotate',
      setRotationDeg: 'setRotation',
      getRotationDeg: 'getRotation',
  });
  Collection.mapMethods(Node);

  /**
   * Container constructor.&nbsp; Containers are used to contain nodes or other containers
   * @constructor
   * @memberof Konva
   * @augments Konva.Node
   * @abstract
   * @param {Object} config
   * @param {Number} [config.x]
     * @param {Number} [config.y]
     * @param {Number} [config.width]
     * @param {Number} [config.height]
     * @param {Boolean} [config.visible]
     * @param {Boolean} [config.listening] whether or not the node is listening for events
     * @param {String} [config.id] unique id
     * @param {String} [config.name] non-unique name
     * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
     * @param {Object} [config.scale] set scale
     * @param {Number} [config.scaleX] set scale x
     * @param {Number} [config.scaleY] set scale y
     * @param {Number} [config.rotation] rotation in degrees
     * @param {Object} [config.offset] offset from center point and rotation point
     * @param {Number} [config.offsetX] set offset x
     * @param {Number} [config.offsetY] set offset y
     * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
     *  the entire stage by dragging any portion of the stage
     * @param {Number} [config.dragDistance]
     * @param {Function} [config.dragBoundFunc]
   * * @param {Object} [config.clip] set clip
     * @param {Number} [config.clipX] set clip x
     * @param {Number} [config.clipY] set clip y
     * @param {Number} [config.clipWidth] set clip width
     * @param {Number} [config.clipHeight] set clip height
     * @param {Function} [config.clipFunc] set clip func

   */
  var Container = /** @class */ (function (_super) {
      __extends(Container, _super);
      function Container() {
          var _this = _super !== null && _super.apply(this, arguments) || this;
          _this.children = new Collection();
          return _this;
      }
      /**
       * returns a {@link Konva.Collection} of direct descendant nodes
       * @method
       * @name Konva.Container#getChildren
       * @param {Function} [filterFunc] filter function
       * @returns {Konva.Collection}
       * @example
       * // get all children
       * var children = layer.getChildren();
       *
       * // get only circles
       * var circles = layer.getChildren(function(node){
       *    return node.getClassName() === 'Circle';
       * });
       */
      Container.prototype.getChildren = function (filterFunc) {
          if (!filterFunc) {
              return this.children;
          }
          var results = new Collection();
          this.children.each(function (child) {
              if (filterFunc(child)) {
                  results.push(child);
              }
          });
          return results;
      };
      /**
       * determine if node has children
       * @method
       * @name Konva.Container#hasChildren
       * @returns {Boolean}
       */
      Container.prototype.hasChildren = function () {
          return this.getChildren().length > 0;
      };
      /**
       * remove all children
       * @method
       * @name Konva.Container#removeChildren
       */
      Container.prototype.removeChildren = function () {
          var child;
          for (var i = 0; i < this.children.length; i++) {
              child = this.children[i];
              // reset parent to prevent many _setChildrenIndices calls
              child.parent = null;
              child.index = 0;
              child.remove();
          }
          this.children = new Collection();
          return this;
      };
      /**
       * destroy all children
       * @method
       * @name Konva.Container#destroyChildren
       */
      Container.prototype.destroyChildren = function () {
          var child;
          for (var i = 0; i < this.children.length; i++) {
              child = this.children[i];
              // reset parent to prevent many _setChildrenIndices calls
              child.parent = null;
              child.index = 0;
              child.destroy();
          }
          this.children = new Collection();
          return this;
      };
      /**
       * add a child and children into container
       * @name Konva.Container#add
       * @method
       * @param {...Konva.Node} child
       * @returns {Container}
       * @example
       * layer.add(rect);
       * layer.add(shape1, shape2, shape3);
       * // remember to redraw layer if you changed something
       * layer.draw();
       */
      Container.prototype.add = function () {
          var children = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              children[_i] = arguments[_i];
          }
          if (arguments.length > 1) {
              for (var i = 0; i < arguments.length; i++) {
                  this.add(arguments[i]);
              }
              return this;
          }
          var child = children[0];
          if (child.getParent()) {
              child.moveTo(this);
              return this;
          }
          var _children = this.children;
          this._validateAdd(child);
          child._clearCaches();
          child.index = _children.length;
          child.parent = this;
          _children.push(child);
          this._fire('add', {
              child: child
          });
          // chainable
          return this;
      };
      Container.prototype.destroy = function () {
          if (this.hasChildren()) {
              this.destroyChildren();
          }
          _super.prototype.destroy.call(this);
          return this;
      };
      /**
       * return a {@link Konva.Collection} of nodes that match the selector.
       * You can provide a string with '#' for id selections and '.' for name selections.
       * Or a function that will return true/false when a node is passed through.  See example below.
       * With strings you can also select by type or class name. Pass multiple selectors
       * separated by a space.
       * @method
       * @name Konva.Container#find
       * @param {String | Function} selector
       * @returns {Collection}
       * @example
       *
       * Passing a string as a selector
       * // select node with id foo
       * var node = stage.find('#foo');
       *
       * // select nodes with name bar inside layer
       * var nodes = layer.find('.bar');
       *
       * // select all groups inside layer
       * var nodes = layer.find('Group');
       *
       * // select all rectangles inside layer
       * var nodes = layer.find('Rect');
       *
       * // select node with an id of foo or a name of bar inside layer
       * var nodes = layer.find('#foo, .bar');
       *
       * Passing a function as a selector
       *
       * // get all groups with a function
       * var groups = stage.find(node => {
       *  return node.getType() === 'Group';
       * });
       *
       * // get only Nodes with partial opacity
       * var alphaNodes = layer.find(node => {
       *  return node.getType() === 'Node' && node.getAbsoluteOpacity() < 1;
       * });
       */
      Container.prototype.find = function (selector) {
          // protecting _generalFind to prevent user from accidentally adding
          // second argument and getting unexpected `findOne` result
          return this._generalFind(selector, false);
      };
      Container.prototype.get = function (selector) {
          Util.warn('collection.get() method is deprecated. Please use collection.find() instead.');
          return this.find(selector);
      };
      /**
       * return a first node from `find` method
       * @method
       * @name Konva.Container#findOne
       * @param {String | Function} selector
       * @returns {Konva.Node | Undefined}
       * @example
       * // select node with id foo
       * var node = stage.findOne('#foo');
       *
       * // select node with name bar inside layer
       * var nodes = layer.findOne('.bar');
       *
       * // select the first node to return true in a function
       * var node = stage.findOne(node => {
       *  return node.getType() === 'Shape'
       * })
       */
      Container.prototype.findOne = function (selector) {
          var result = this._generalFind(selector, true);
          return result.length > 0 ? result[0] : undefined;
      };
      Container.prototype._generalFind = function (selector, findOne) {
          var retArr = [];
          this._descendants(function (node) {
              var valid = node._isMatch(selector);
              if (valid) {
                  retArr.push(node);
              }
              if (valid && findOne) {
                  return true;
              }
              return false;
          });
          return Collection.toCollection(retArr);
      };
      Container.prototype._descendants = function (fn) {
          var shouldStop = false;
          for (var i = 0; i < this.children.length; i++) {
              var child = this.children[i];
              shouldStop = fn(child);
              if (shouldStop) {
                  return true;
              }
              if (!child.hasChildren()) {
                  continue;
              }
              shouldStop = child._descendants(fn);
              if (shouldStop) {
                  return true;
              }
          }
          return false;
      };
      // extenders
      Container.prototype.toObject = function () {
          var obj = Node.prototype.toObject.call(this);
          obj.children = [];
          var children = this.getChildren();
          var len = children.length;
          for (var n = 0; n < len; n++) {
              var child = children[n];
              obj.children.push(child.toObject());
          }
          return obj;
      };
      /**
       * determine if node is an ancestor
       * of descendant
       * @method
       * @name Konva.Container#isAncestorOf
       * @param {Konva.Node} node
       */
      Container.prototype.isAncestorOf = function (node) {
          var parent = node.getParent();
          while (parent) {
              if (parent._id === this._id) {
                  return true;
              }
              parent = parent.getParent();
          }
          return false;
      };
      Container.prototype.clone = function (obj) {
          // call super method
          var node = Node.prototype.clone.call(this, obj);
          this.getChildren().each(function (no) {
              node.add(no.clone());
          });
          return node;
      };
      /**
       * get all shapes that intersect a point.  Note: because this method must clear a temporary
       * canvas and redraw every shape inside the container, it should only be used for special situations
       * because it performs very poorly.  Please use the {@link Konva.Stage#getIntersection} method if at all possible
       * because it performs much better
       * @method
       * @name Konva.Container#getIntersection
       * @param {Object} pos
       * @param {Number} pos.x
       * @param {Number} pos.y
       * @returns {Array} array of shapes
       */
      Container.prototype.getAllIntersections = function (pos) {
          var arr = [];
          this.find('Shape').each(function (shape) {
              if (shape.isVisible() && shape.intersects(pos)) {
                  arr.push(shape);
              }
          });
          return arr;
      };
      Container.prototype._setChildrenIndices = function () {
          this.children.each(function (child, n) {
              child.index = n;
          });
      };
      Container.prototype.drawScene = function (can, top, caching) {
          var layer = this.getLayer(), canvas = can || (layer && layer.getCanvas()), context = canvas && canvas.getContext(), cachedCanvas = this._getCanvasCache(), cachedSceneCanvas = cachedCanvas && cachedCanvas.scene;
          if (this.isVisible() || caching) {
              if (!caching && cachedSceneCanvas) {
                  context.save();
                  layer._applyTransform(this, context, top);
                  this._drawCachedSceneCanvas(context);
                  context.restore();
              }
              else {
                  // TODO: comment all arguments here
                  // describe why we use false for caching
                  // and why we use caching for skipBuffer, skipComposition
                  this._drawChildren(canvas, 'drawScene', top, false, caching, caching);
              }
          }
          return this;
      };
      Container.prototype.drawHit = function (can, top, caching) {
          var layer = this.getLayer(), canvas = can || (layer && layer.hitCanvas), context = canvas && canvas.getContext(), cachedCanvas = this._getCanvasCache(), cachedHitCanvas = cachedCanvas && cachedCanvas.hit;
          if (this.shouldDrawHit(canvas) || caching) {
              if (!caching && cachedHitCanvas) {
                  context.save();
                  layer._applyTransform(this, context, top);
                  this._drawCachedHitCanvas(context);
                  context.restore();
              }
              else {
                  // TODO: comment all arguments here
                  // describe why we use false for caching
                  // and why we use caching for skipBuffer, skipComposition
                  this._drawChildren(canvas, 'drawHit', top, false, caching, caching);
              }
          }
          return this;
      };
      // TODO: create ClipContainer
      Container.prototype._drawChildren = function (canvas, drawMethod, top, caching, skipBuffer, skipComposition) {
          var layer = this.getLayer(), context = canvas && canvas.getContext(), clipWidth = this.clipWidth(), clipHeight = this.clipHeight(), clipFunc = this.clipFunc(), hasClip = (clipWidth && clipHeight) || clipFunc, clipX, clipY;
          if (hasClip && layer) {
              context.save();
              var transform = this.getAbsoluteTransform(top);
              var m = transform.getMatrix();
              context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
              context.beginPath();
              if (clipFunc) {
                  clipFunc.call(this, context, this);
              }
              else {
                  clipX = this.clipX();
                  clipY = this.clipY();
                  context.rect(clipX, clipY, clipWidth, clipHeight);
              }
              context.clip();
              m = transform
                  .copy()
                  .invert()
                  .getMatrix();
              context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
          }
          var hasComposition = this.globalCompositeOperation() !== 'source-over' &&
              !skipComposition &&
              drawMethod === 'drawScene';
          if (hasComposition && layer) {
              context.save();
              context._applyGlobalCompositeOperation(this);
          }
          this.children.each(function (child) {
              child[drawMethod](canvas, top, caching, skipBuffer);
          });
          if (hasComposition && layer) {
              context.restore();
          }
          if (hasClip && layer) {
              context.restore();
          }
      };
      Container.prototype.shouldDrawHit = function (canvas) {
          if (canvas && canvas.isCache) {
              return true;
          }
          var layer = this.getLayer();
          var layerUnderDrag = false;
          DD._dragElements.forEach(function (elem) {
              if (elem.dragStatus === 'dragging' && elem.node.getLayer() === layer) {
                  layerUnderDrag = true;
              }
          });
          var dragSkip = !Konva.hitOnDragEnabled && layerUnderDrag;
          return layer && layer.hitGraphEnabled() && this.isVisible() && !dragSkip;
      };
      Container.prototype.getClientRect = function (config) {
          config = config || {};
          var skipTransform = config.skipTransform;
          var relativeTo = config.relativeTo;
          var minX, minY, maxX, maxY;
          var selfRect = {
              x: Infinity,
              y: Infinity,
              width: 0,
              height: 0
          };
          var that = this;
          this.children.each(function (child) {
              // skip invisible children
              if (!child.visible()) {
                  return;
              }
              var rect = child.getClientRect({
                  relativeTo: that,
                  skipShadow: config.skipShadow,
                  skipStroke: config.skipStroke
              });
              // skip invisible children (like empty groups)
              if (rect.width === 0 && rect.height === 0) {
                  return;
              }
              if (minX === undefined) {
                  // initial value for first child
                  minX = rect.x;
                  minY = rect.y;
                  maxX = rect.x + rect.width;
                  maxY = rect.y + rect.height;
              }
              else {
                  minX = Math.min(minX, rect.x);
                  minY = Math.min(minY, rect.y);
                  maxX = Math.max(maxX, rect.x + rect.width);
                  maxY = Math.max(maxY, rect.y + rect.height);
              }
          });
          // if child is group we need to make sure it has visible shapes inside
          var shapes = this.find('Shape');
          var hasVisible = false;
          for (var i = 0; i < shapes.length; i++) {
              var shape = shapes[i];
              if (shape._isVisible(this)) {
                  hasVisible = true;
                  break;
              }
          }
          if (hasVisible && minX !== undefined) {
              selfRect = {
                  x: minX,
                  y: minY,
                  width: maxX - minX,
                  height: maxY - minY
              };
          }
          else {
              selfRect = {
                  x: 0,
                  y: 0,
                  width: 0,
                  height: 0
              };
          }
          if (!skipTransform) {
              return this._transformedRect(selfRect, relativeTo);
          }
          return selfRect;
      };
      return Container;
  }(Node));
  // add getters setters
  Factory.addComponentsGetterSetter(Container, 'clip', [
      'x',
      'y',
      'width',
      'height'
  ]);
  /**
   * get/set clip
   * @method
   * @name Konva.Container#clip
   * @param {Object} clip
   * @param {Number} clip.x
   * @param {Number} clip.y
   * @param {Number} clip.width
   * @param {Number} clip.height
   * @returns {Object}
   * @example
   * // get clip
   * var clip = container.clip();
   *
   * // set clip
   * container.clip({
   *   x: 20,
   *   y: 20,
   *   width: 20,
   *   height: 20
   * });
   */
  Factory.addGetterSetter(Container, 'clipX', undefined, getNumberValidator());
  /**
   * get/set clip x
   * @name Konva.Container#clipX
   * @method
   * @param {Number} x
   * @returns {Number}
   * @example
   * // get clip x
   * var clipX = container.clipX();
   *
   * // set clip x
   * container.clipX(10);
   */
  Factory.addGetterSetter(Container, 'clipY', undefined, getNumberValidator());
  /**
   * get/set clip y
   * @name Konva.Container#clipY
   * @method
   * @param {Number} y
   * @returns {Number}
   * @example
   * // get clip y
   * var clipY = container.clipY();
   *
   * // set clip y
   * container.clipY(10);
   */
  Factory.addGetterSetter(Container, 'clipWidth', undefined, getNumberValidator());
  /**
   * get/set clip width
   * @name Konva.Container#clipWidth
   * @method
   * @param {Number} width
   * @returns {Number}
   * @example
   * // get clip width
   * var clipWidth = container.clipWidth();
   *
   * // set clip width
   * container.clipWidth(100);
   */
  Factory.addGetterSetter(Container, 'clipHeight', undefined, getNumberValidator());
  /**
   * get/set clip height
   * @name Konva.Container#clipHeight
   * @method
   * @param {Number} height
   * @returns {Number}
   * @example
   * // get clip height
   * var clipHeight = container.clipHeight();
   *
   * // set clip height
   * container.clipHeight(100);
   */
  Factory.addGetterSetter(Container, 'clipFunc');
  /**
   * get/set clip function
   * @name Konva.Container#clipFunc
   * @method
   * @param {Function} function
   * @returns {Function}
   * @example
   * // get clip function
   * var clipFunction = container.clipFunc();
   *
   * // set clip height
   * container.clipFunc(function(ctx) {
   *   ctx.rect(0, 0, 100, 100);
   * });
   */
  Collection.mapMethods(Container);

  var Captures = new Map();
  // we may use this module for capturing touch events too
  // so make sure we don't do something super specific to pointer
  var SUPPORT_POINTER_EVENTS = Konva._global['PointerEvent'] !== undefined;
  function getCapturedShape(pointerId) {
      return Captures.get(pointerId);
  }
  function createEvent(evt) {
      return {
          evt: evt,
          pointerId: evt.pointerId
      };
  }
  function hasPointerCapture(pointerId, shape) {
      return Captures.get(pointerId) === shape;
  }
  function setPointerCapture(pointerId, shape) {
      releaseCapture(pointerId);
      var stage = shape.getStage();
      if (!stage)
          return;
      Captures.set(pointerId, shape);
      if (SUPPORT_POINTER_EVENTS) {
          shape._fire('gotpointercapture', createEvent(new PointerEvent('gotpointercapture')));
      }
  }
  function releaseCapture(pointerId, target) {
      var shape = Captures.get(pointerId);
      if (!shape)
          return;
      var stage = shape.getStage();
      if (stage && stage.content) ;
      Captures.delete(pointerId);
      if (SUPPORT_POINTER_EVENTS) {
          shape._fire('lostpointercapture', createEvent(new PointerEvent('lostpointercapture')));
      }
  }

  // CONSTANTS
  var STAGE$1 = 'Stage', STRING = 'string', PX = 'px', MOUSEOUT = 'mouseout', MOUSELEAVE$1 = 'mouseleave', MOUSEOVER = 'mouseover', MOUSEENTER$1 = 'mouseenter', MOUSEMOVE = 'mousemove', MOUSEDOWN = 'mousedown', MOUSEUP = 'mouseup', 
  // TODO: add them into "on" method docs and into site docs
  POINTERMOVE = 'pointermove', POINTERDOWN = 'pointerdown', POINTERUP = 'pointerup', POINTERCANCEL = 'pointercancel', LOSTPOINTERCAPTURE = 'lostpointercapture', CONTEXTMENU = 'contextmenu', CLICK = 'click', DBL_CLICK = 'dblclick', TOUCHSTART = 'touchstart', TOUCHEND = 'touchend', TAP = 'tap', DBL_TAP = 'dbltap', TOUCHMOVE = 'touchmove', WHEEL = 'wheel', CONTENT_MOUSEOUT = 'contentMouseout', CONTENT_MOUSEOVER = 'contentMouseover', CONTENT_MOUSEMOVE = 'contentMousemove', CONTENT_MOUSEDOWN = 'contentMousedown', CONTENT_MOUSEUP = 'contentMouseup', CONTENT_CONTEXTMENU = 'contentContextmenu', CONTENT_CLICK = 'contentClick', CONTENT_DBL_CLICK = 'contentDblclick', CONTENT_TOUCHSTART = 'contentTouchstart', CONTENT_TOUCHEND = 'contentTouchend', CONTENT_DBL_TAP = 'contentDbltap', CONTENT_TAP = 'contentTap', CONTENT_TOUCHMOVE = 'contentTouchmove', CONTENT_WHEEL = 'contentWheel', RELATIVE = 'relative', KONVA_CONTENT = 'konvajs-content', UNDERSCORE = '_', CONTAINER = 'container', MAX_LAYERS_NUMBER = 5, EMPTY_STRING$1 = '', EVENTS = [
      MOUSEENTER$1,
      MOUSEDOWN,
      MOUSEMOVE,
      MOUSEUP,
      MOUSEOUT,
      TOUCHSTART,
      TOUCHMOVE,
      TOUCHEND,
      MOUSEOVER,
      WHEEL,
      CONTEXTMENU,
      POINTERDOWN,
      POINTERMOVE,
      POINTERUP,
      POINTERCANCEL,
      LOSTPOINTERCAPTURE
  ], 
  // cached variables
  eventsLength = EVENTS.length;
  function addEvent(ctx, eventName) {
      ctx.content.addEventListener(eventName, function (evt) {
          ctx[UNDERSCORE + eventName](evt);
      }, false);
  }
  var NO_POINTERS_MESSAGE = "Pointer position is missing and not registered by the stage. Looks like it is outside of the stage container. You can set it manually from event: stage.setPointersPositions(event);";
  var stages = [];
  function checkNoClip(attrs) {
      if (attrs === void 0) { attrs = {}; }
      if (attrs.clipFunc || attrs.clipWidth || attrs.clipHeight) {
          Util.warn('Stage does not support clipping. Please use clip for Layers or Groups.');
      }
      return attrs;
  }
  /**
   * Stage constructor.  A stage is used to contain multiple layers
   * @constructor
   * @memberof Konva
   * @augments Konva.Container
   * @param {Object} config
   * @param {String|Element} config.container Container selector or DOM element
   * @param {Number} [config.x]
     * @param {Number} [config.y]
     * @param {Number} [config.width]
     * @param {Number} [config.height]
     * @param {Boolean} [config.visible]
     * @param {Boolean} [config.listening] whether or not the node is listening for events
     * @param {String} [config.id] unique id
     * @param {String} [config.name] non-unique name
     * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
     * @param {Object} [config.scale] set scale
     * @param {Number} [config.scaleX] set scale x
     * @param {Number} [config.scaleY] set scale y
     * @param {Number} [config.rotation] rotation in degrees
     * @param {Object} [config.offset] offset from center point and rotation point
     * @param {Number} [config.offsetX] set offset x
     * @param {Number} [config.offsetY] set offset y
     * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
     *  the entire stage by dragging any portion of the stage
     * @param {Number} [config.dragDistance]
     * @param {Function} [config.dragBoundFunc]
   * @example
   * var stage = new Konva.Stage({
   *   width: 500,
   *   height: 800,
   *   container: 'containerId' // or "#containerId" or ".containerClass"
   * });
   */
  var Stage = /** @class */ (function (_super) {
      __extends(Stage, _super);
      function Stage(config) {
          var _this = _super.call(this, checkNoClip(config)) || this;
          _this._pointerPositions = [];
          _this._changedPointerPositions = [];
          _this._buildDOM();
          _this._bindContentEvents();
          stages.push(_this);
          _this.on('widthChange.konva heightChange.konva', _this._resizeDOM);
          _this.on('visibleChange.konva', _this._checkVisibility);
          _this.on('clipWidthChange.konva clipHeightChange.konva clipFuncChange.konva', function () {
              checkNoClip(_this.attrs);
          });
          _this._checkVisibility();
          return _this;
      }
      Stage.prototype._validateAdd = function (child) {
          var isLayer = child.getType() === 'Layer';
          var isFastLayer = child.getType() === 'FastLayer';
          var valid = isLayer || isFastLayer;
          if (!valid) {
              Util.throw('You may only add layers to the stage.');
          }
      };
      Stage.prototype._checkVisibility = function () {
          if (!this.content) {
              return;
          }
          var style = this.visible() ? '' : 'none';
          this.content.style.display = style;
      };
      /**
       * set container dom element which contains the stage wrapper div element
       * @method
       * @name Konva.Stage#setContainer
       * @param {DomElement} container can pass in a dom element or id string
       */
      Stage.prototype.setContainer = function (container) {
          if (typeof container === STRING) {
              if (container.charAt(0) === '.') {
                  var className = container.slice(1);
                  container = document.getElementsByClassName(className)[0];
              }
              else {
                  var id;
                  if (container.charAt(0) !== '#') {
                      id = container;
                  }
                  else {
                      id = container.slice(1);
                  }
                  container = document.getElementById(id);
              }
              if (!container) {
                  throw 'Can not find container in document with id ' + id;
              }
          }
          this._setAttr(CONTAINER, container);
          if (this.content) {
              if (this.content.parentElement) {
                  this.content.parentElement.removeChild(this.content);
              }
              container.appendChild(this.content);
          }
          return this;
      };
      Stage.prototype.shouldDrawHit = function () {
          return true;
      };
      /**
       * clear all layers
       * @method
       * @name Konva.Stage#clear
       */
      Stage.prototype.clear = function () {
          var layers = this.children, len = layers.length, n;
          for (n = 0; n < len; n++) {
              layers[n].clear();
          }
          return this;
      };
      Stage.prototype.clone = function (obj) {
          if (!obj) {
              obj = {};
          }
          obj.container = document.createElement('div');
          return Container.prototype.clone.call(this, obj);
      };
      Stage.prototype.destroy = function () {
          _super.prototype.destroy.call(this);
          var content = this.content;
          if (content && Util._isInDocument(content)) {
              this.container().removeChild(content);
          }
          var index = stages.indexOf(this);
          if (index > -1) {
              stages.splice(index, 1);
          }
          return this;
      };
      /**
       * returns absolute pointer position which can be a touch position or mouse position
       * pointer position doesn't include any transforms (such as scale) of the stage
       * it is just a plain position of pointer relative to top-left corner of the stage container
       * @method
       * @name Konva.Stage#getPointerPosition
       * @returns {Vector2d|null}
       */
      Stage.prototype.getPointerPosition = function () {
          var pos = this._pointerPositions[0] || this._changedPointerPositions[0];
          if (!pos) {
              Util.warn(NO_POINTERS_MESSAGE);
              return null;
          }
          return {
              x: pos.x,
              y: pos.y
          };
      };
      Stage.prototype._getPointerById = function (id) {
          return this._pointerPositions.find(function (p) { return p.id === id; });
      };
      Stage.prototype.getPointersPositions = function () {
          return this._pointerPositions;
      };
      Stage.prototype.getStage = function () {
          return this;
      };
      Stage.prototype.getContent = function () {
          return this.content;
      };
      Stage.prototype._toKonvaCanvas = function (config) {
          config = config || {};
          var x = config.x || 0, y = config.y || 0, canvas = new SceneCanvas({
              width: config.width || this.width(),
              height: config.height || this.height(),
              pixelRatio: config.pixelRatio || 1
          }), _context = canvas.getContext()._context, layers = this.children;
          if (x || y) {
              _context.translate(-1 * x, -1 * y);
          }
          layers.each(function (layer) {
              if (!layer.isVisible()) {
                  return;
              }
              var layerCanvas = layer._toKonvaCanvas(config);
              _context.drawImage(layerCanvas._canvas, x, y, layerCanvas.getWidth() / layerCanvas.getPixelRatio(), layerCanvas.getHeight() / layerCanvas.getPixelRatio());
          });
          return canvas;
      };
      /**
       * get visible intersection shape. This is the preferred
       *  method for determining if a point intersects a shape or not
       * @method
       * @name Konva.Stage#getIntersection
       * @param {Object} pos
       * @param {Number} pos.x
       * @param {Number} pos.y
       * @param {String} [selector]
       * @returns {Konva.Node}
       * @example
       * var shape = stage.getIntersection({x: 50, y: 50});
       * // or if you interested in shape parent:
       * var group = stage.getIntersection({x: 50, y: 50}, 'Group');
       */
      Stage.prototype.getIntersection = function (pos, selector) {
          if (!pos) {
              return null;
          }
          var layers = this.children, len = layers.length, end = len - 1, n, shape;
          for (n = end; n >= 0; n--) {
              shape = layers[n].getIntersection(pos, selector);
              if (shape) {
                  return shape;
              }
          }
          return null;
      };
      Stage.prototype._resizeDOM = function () {
          var width = this.width();
          var height = this.height();
          if (this.content) {
              // set content dimensions
              this.content.style.width = width + PX;
              this.content.style.height = height + PX;
          }
          this.bufferCanvas.setSize(width, height);
          this.bufferHitCanvas.setSize(width, height);
          // set layer dimensions
          this.children.each(function (layer) {
              layer.setSize({ width: width, height: height });
              layer.draw();
          });
      };
      Stage.prototype.add = function (layer) {
          if (arguments.length > 1) {
              for (var i = 0; i < arguments.length; i++) {
                  this.add(arguments[i]);
              }
              return this;
          }
          _super.prototype.add.call(this, layer);
          var length = this.children.length;
          if (length > MAX_LAYERS_NUMBER) {
              Util.warn('The stage has ' +
                  length +
                  ' layers. Recommended maximum number of layers is 3-5. Adding more layers into the stage may drop the performance. Rethink your tree structure, you can use Konva.Group.');
          }
          layer.setSize({ width: this.width(), height: this.height() });
          // draw layer and append canvas to container
          layer.draw();
          if (Konva.isBrowser) {
              this.content.appendChild(layer.canvas._canvas);
          }
          // chainable
          return this;
      };
      Stage.prototype.getParent = function () {
          return null;
      };
      Stage.prototype.getLayer = function () {
          return null;
      };
      Stage.prototype.hasPointerCapture = function (pointerId) {
          return hasPointerCapture(pointerId, this);
      };
      Stage.prototype.setPointerCapture = function (pointerId) {
          setPointerCapture(pointerId, this);
      };
      Stage.prototype.releaseCapture = function (pointerId) {
          releaseCapture(pointerId);
      };
      /**
       * returns a {@link Konva.Collection} of layers
       * @method
       * @name Konva.Stage#getLayers
       */
      Stage.prototype.getLayers = function () {
          return this.getChildren();
      };
      Stage.prototype._bindContentEvents = function () {
          if (!Konva.isBrowser) {
              return;
          }
          for (var n = 0; n < eventsLength; n++) {
              addEvent(this, EVENTS[n]);
          }
      };
      Stage.prototype._mouseenter = function (evt) {
          this.setPointersPositions(evt);
          this._fire(MOUSEENTER$1, { evt: evt, target: this, currentTarget: this });
      };
      Stage.prototype._mouseover = function (evt) {
          this.setPointersPositions(evt);
          this._fire(CONTENT_MOUSEOVER, { evt: evt });
          this._fire(MOUSEOVER, { evt: evt, target: this, currentTarget: this });
      };
      Stage.prototype._mouseout = function (evt) {
          var _a;
          this.setPointersPositions(evt);
          var targetShape = ((_a = this.targetShape) === null || _a === void 0 ? void 0 : _a.getStage()) ? this.targetShape : null;
          var eventsEnabled = !DD.isDragging || Konva.hitOnDragEnabled;
          if (targetShape && eventsEnabled) {
              targetShape._fireAndBubble(MOUSEOUT, { evt: evt });
              targetShape._fireAndBubble(MOUSELEAVE$1, { evt: evt });
              this._fire(MOUSELEAVE$1, { evt: evt, target: this, currentTarget: this });
              this.targetShape = null;
          }
          else if (eventsEnabled) {
              this._fire(MOUSELEAVE$1, {
                  evt: evt,
                  target: this,
                  currentTarget: this
              });
              this._fire(MOUSEOUT, {
                  evt: evt,
                  target: this,
                  currentTarget: this
              });
          }
          this.pointerPos = undefined;
          this._pointerPositions = [];
          this._fire(CONTENT_MOUSEOUT, { evt: evt });
      };
      Stage.prototype._mousemove = function (evt) {
          var _a;
          // workaround for mobile IE to force touch event when unhandled pointer event elevates into a mouse event
          if (Konva.UA.ieMobile) {
              return this._touchmove(evt);
          }
          this.setPointersPositions(evt);
          var pointerId = Util._getFirstPointerId(evt);
          var shape;
          var targetShape = ((_a = this.targetShape) === null || _a === void 0 ? void 0 : _a.getStage()) ? this.targetShape : null;
          var eventsEnabled = !DD.isDragging || Konva.hitOnDragEnabled;
          if (eventsEnabled) {
              shape = this.getIntersection(this.getPointerPosition());
              if (shape && shape.isListening()) {
                  var differentTarget = targetShape !== shape;
                  if (eventsEnabled && differentTarget) {
                      if (targetShape) {
                          targetShape._fireAndBubble(MOUSEOUT, { evt: evt, pointerId: pointerId }, shape);
                          targetShape._fireAndBubble(MOUSELEAVE$1, { evt: evt, pointerId: pointerId }, shape);
                      }
                      shape._fireAndBubble(MOUSEOVER, { evt: evt, pointerId: pointerId }, targetShape);
                      shape._fireAndBubble(MOUSEENTER$1, { evt: evt, pointerId: pointerId }, targetShape);
                      shape._fireAndBubble(MOUSEMOVE, { evt: evt, pointerId: pointerId });
                      this.targetShape = shape;
                  }
                  else {
                      shape._fireAndBubble(MOUSEMOVE, { evt: evt, pointerId: pointerId });
                  }
              }
              else {
                  /*
                   * if no shape was detected, clear target shape and try
                   * to run mouseout from previous target shape
                   */
                  if (targetShape && eventsEnabled) {
                      targetShape._fireAndBubble(MOUSEOUT, { evt: evt, pointerId: pointerId });
                      targetShape._fireAndBubble(MOUSELEAVE$1, { evt: evt, pointerId: pointerId });
                      this._fire(MOUSEOVER, {
                          evt: evt,
                          target: this,
                          currentTarget: this,
                          pointerId: pointerId
                      });
                      this.targetShape = null;
                  }
                  this._fire(MOUSEMOVE, {
                      evt: evt,
                      target: this,
                      currentTarget: this,
                      pointerId: pointerId
                  });
              }
              // content event
              this._fire(CONTENT_MOUSEMOVE, { evt: evt });
          }
          // always call preventDefault for desktop events because some browsers
          // try to drag and drop the canvas element
          if (evt.cancelable) {
              evt.preventDefault();
          }
      };
      Stage.prototype._mousedown = function (evt) {
          // workaround for mobile IE to force touch event when unhandled pointer event elevates into a mouse event
          if (Konva.UA.ieMobile) {
              return this._touchstart(evt);
          }
          this.setPointersPositions(evt);
          var pointerId = Util._getFirstPointerId(evt);
          var shape = this.getIntersection(this.getPointerPosition());
          DD.justDragged = false;
          Konva.listenClickTap = true;
          if (shape && shape.isListening()) {
              this.clickStartShape = shape;
              shape._fireAndBubble(MOUSEDOWN, { evt: evt, pointerId: pointerId });
          }
          else {
              this._fire(MOUSEDOWN, {
                  evt: evt,
                  target: this,
                  currentTarget: this,
                  pointerId: pointerId
              });
          }
          // content event
          this._fire(CONTENT_MOUSEDOWN, { evt: evt });
          // Do not prevent default behavior, because it will prevent listening events outside of window iframe
          // we used preventDefault for disabling native drag&drop
          // but userSelect = none style will do the trick
          // if (evt.cancelable) {
          //   evt.preventDefault();
          // }
      };
      Stage.prototype._mouseup = function (evt) {
          // workaround for mobile IE to force touch event when unhandled pointer event elevates into a mouse event
          if (Konva.UA.ieMobile) {
              return this._touchend(evt);
          }
          this.setPointersPositions(evt);
          var pointerId = Util._getFirstPointerId(evt);
          var shape = this.getIntersection(this.getPointerPosition()), clickStartShape = this.clickStartShape, clickEndShape = this.clickEndShape, fireDblClick = false;
          if (Konva.inDblClickWindow) {
              fireDblClick = true;
              clearTimeout(this.dblTimeout);
              // Konva.inDblClickWindow = false;
          }
          else if (!DD.justDragged) {
              // don't set inDblClickWindow after dragging
              Konva.inDblClickWindow = true;
              clearTimeout(this.dblTimeout);
          }
          this.dblTimeout = setTimeout(function () {
              Konva.inDblClickWindow = false;
          }, Konva.dblClickWindow);
          if (shape && shape.isListening()) {
              this.clickEndShape = shape;
              shape._fireAndBubble(MOUSEUP, { evt: evt, pointerId: pointerId });
              // detect if click or double click occurred
              if (Konva.listenClickTap &&
                  clickStartShape &&
                  clickStartShape._id === shape._id) {
                  shape._fireAndBubble(CLICK, { evt: evt, pointerId: pointerId });
                  if (fireDblClick && clickEndShape && clickEndShape === shape) {
                      shape._fireAndBubble(DBL_CLICK, { evt: evt, pointerId: pointerId });
                  }
              }
          }
          else {
              this._fire(MOUSEUP, {
                  evt: evt,
                  target: this,
                  currentTarget: this,
                  pointerId: pointerId
              });
              if (Konva.listenClickTap) {
                  this._fire(CLICK, {
                      evt: evt,
                      target: this,
                      currentTarget: this,
                      pointerId: pointerId
                  });
              }
              if (fireDblClick) {
                  this._fire(DBL_CLICK, {
                      evt: evt,
                      target: this,
                      currentTarget: this,
                      pointerId: pointerId
                  });
              }
          }
          // content events
          this._fire(CONTENT_MOUSEUP, { evt: evt });
          if (Konva.listenClickTap) {
              this._fire(CONTENT_CLICK, { evt: evt });
              if (fireDblClick) {
                  this._fire(CONTENT_DBL_CLICK, { evt: evt });
              }
          }
          Konva.listenClickTap = false;
          // always call preventDefault for desktop events because some browsers
          // try to drag and drop the canvas element
          if (evt.cancelable) {
              evt.preventDefault();
          }
      };
      Stage.prototype._contextmenu = function (evt) {
          this.setPointersPositions(evt);
          var shape = this.getIntersection(this.getPointerPosition());
          if (shape && shape.isListening()) {
              shape._fireAndBubble(CONTEXTMENU, { evt: evt });
          }
          else {
              this._fire(CONTEXTMENU, {
                  evt: evt,
                  target: this,
                  currentTarget: this
              });
          }
          this._fire(CONTENT_CONTEXTMENU, { evt: evt });
      };
      Stage.prototype._touchstart = function (evt) {
          var _this = this;
          this.setPointersPositions(evt);
          var triggeredOnShape = false;
          this._changedPointerPositions.forEach(function (pos) {
              var shape = _this.getIntersection(pos);
              Konva.listenClickTap = true;
              DD.justDragged = false;
              var hasShape = shape && shape.isListening();
              if (!hasShape) {
                  return;
              }
              if (Konva.captureTouchEventsEnabled) {
                  shape.setPointerCapture(pos.id);
              }
              _this.tapStartShape = shape;
              shape._fireAndBubble(TOUCHSTART, { evt: evt, pointerId: pos.id }, _this);
              triggeredOnShape = true;
              // only call preventDefault if the shape is listening for events
              if (shape.isListening() && shape.preventDefault() && evt.cancelable) {
                  evt.preventDefault();
              }
          });
          if (!triggeredOnShape) {
              this._fire(TOUCHSTART, {
                  evt: evt,
                  target: this,
                  currentTarget: this,
                  pointerId: this._changedPointerPositions[0].id
              });
          }
          // content event
          this._fire(CONTENT_TOUCHSTART, { evt: evt });
      };
      Stage.prototype._touchmove = function (evt) {
          var _this = this;
          this.setPointersPositions(evt);
          var eventsEnabled = !DD.isDragging || Konva.hitOnDragEnabled;
          if (eventsEnabled) {
              var triggeredOnShape = false;
              var processedShapesIds = {};
              this._changedPointerPositions.forEach(function (pos) {
                  var shape = getCapturedShape(pos.id) || _this.getIntersection(pos);
                  var hasShape = shape && shape.isListening();
                  if (!hasShape) {
                      return;
                  }
                  if (processedShapesIds[shape._id]) {
                      return;
                  }
                  processedShapesIds[shape._id] = true;
                  shape._fireAndBubble(TOUCHMOVE, { evt: evt, pointerId: pos.id });
                  triggeredOnShape = true;
                  // only call preventDefault if the shape is listening for events
                  if (shape.isListening() && shape.preventDefault() && evt.cancelable) {
                      evt.preventDefault();
                  }
              });
              if (!triggeredOnShape) {
                  this._fire(TOUCHMOVE, {
                      evt: evt,
                      target: this,
                      currentTarget: this,
                      pointerId: this._changedPointerPositions[0].id
                  });
              }
              this._fire(CONTENT_TOUCHMOVE, { evt: evt });
          }
          if (DD.isDragging && DD.node.preventDefault() && evt.cancelable) {
              evt.preventDefault();
          }
      };
      Stage.prototype._touchend = function (evt) {
          var _this = this;
          this.setPointersPositions(evt);
          var clickEndShape = this.clickEndShape, fireDblClick = false;
          if (Konva.inDblClickWindow) {
              fireDblClick = true;
              clearTimeout(this.dblTimeout);
              // Konva.inDblClickWindow = false;
          }
          else if (!DD.justDragged) {
              Konva.inDblClickWindow = true;
              clearTimeout(this.dblTimeout);
          }
          this.dblTimeout = setTimeout(function () {
              Konva.inDblClickWindow = false;
          }, Konva.dblClickWindow);
          var triggeredOnShape = false;
          var processedShapesIds = {};
          var tapTriggered = false;
          var dblTapTriggered = false;
          this._changedPointerPositions.forEach(function (pos) {
              var shape = getCapturedShape(pos.id) ||
                  _this.getIntersection(pos);
              if (shape) {
                  shape.releaseCapture(pos.id);
              }
              var hasShape = shape && shape.isListening();
              if (!hasShape) {
                  return;
              }
              if (processedShapesIds[shape._id]) {
                  return;
              }
              processedShapesIds[shape._id] = true;
              _this.clickEndShape = shape;
              shape._fireAndBubble(TOUCHEND, { evt: evt, pointerId: pos.id });
              triggeredOnShape = true;
              // detect if tap or double tap occurred
              if (Konva.listenClickTap && shape === _this.tapStartShape) {
                  tapTriggered = true;
                  shape._fireAndBubble(TAP, { evt: evt, pointerId: pos.id });
                  if (fireDblClick && clickEndShape && clickEndShape === shape) {
                      dblTapTriggered = true;
                      shape._fireAndBubble(DBL_TAP, { evt: evt, pointerId: pos.id });
                  }
              }
              // only call preventDefault if the shape is listening for events
              if (shape.isListening() && shape.preventDefault() && evt.cancelable) {
                  evt.preventDefault();
              }
          });
          if (!triggeredOnShape) {
              this._fire(TOUCHEND, {
                  evt: evt,
                  target: this,
                  currentTarget: this,
                  pointerId: this._changedPointerPositions[0].id
              });
          }
          if (Konva.listenClickTap && !tapTriggered) {
              this._fire(TAP, {
                  evt: evt,
                  target: this,
                  currentTarget: this,
                  pointerId: this._changedPointerPositions[0].id
              });
          }
          if (fireDblClick && !dblTapTriggered) {
              this._fire(DBL_TAP, {
                  evt: evt,
                  target: this,
                  currentTarget: this,
                  pointerId: this._changedPointerPositions[0].id
              });
          }
          // content events
          this._fire(CONTENT_TOUCHEND, { evt: evt });
          if (Konva.listenClickTap) {
              this._fire(CONTENT_TAP, { evt: evt });
              if (fireDblClick) {
                  this._fire(CONTENT_DBL_TAP, { evt: evt });
              }
          }
          Konva.listenClickTap = false;
      };
      Stage.prototype._wheel = function (evt) {
          this.setPointersPositions(evt);
          var shape = this.getIntersection(this.getPointerPosition());
          if (shape && shape.isListening()) {
              shape._fireAndBubble(WHEEL, { evt: evt });
          }
          else {
              this._fire(WHEEL, {
                  evt: evt,
                  target: this,
                  currentTarget: this
              });
          }
          this._fire(CONTENT_WHEEL, { evt: evt });
      };
      Stage.prototype._pointerdown = function (evt) {
          if (!Konva._pointerEventsEnabled) {
              return;
          }
          this.setPointersPositions(evt);
          var shape = getCapturedShape(evt.pointerId) ||
              this.getIntersection(this.getPointerPosition());
          if (shape) {
              shape._fireAndBubble(POINTERDOWN, createEvent(evt));
          }
      };
      Stage.prototype._pointermove = function (evt) {
          if (!Konva._pointerEventsEnabled) {
              return;
          }
          this.setPointersPositions(evt);
          var shape = getCapturedShape(evt.pointerId) ||
              this.getIntersection(this.getPointerPosition());
          if (shape) {
              shape._fireAndBubble(POINTERMOVE, createEvent(evt));
          }
      };
      Stage.prototype._pointerup = function (evt) {
          if (!Konva._pointerEventsEnabled) {
              return;
          }
          this.setPointersPositions(evt);
          var shape = getCapturedShape(evt.pointerId) ||
              this.getIntersection(this.getPointerPosition());
          if (shape) {
              shape._fireAndBubble(POINTERUP, createEvent(evt));
          }
          releaseCapture(evt.pointerId);
      };
      Stage.prototype._pointercancel = function (evt) {
          if (!Konva._pointerEventsEnabled) {
              return;
          }
          this.setPointersPositions(evt);
          var shape = getCapturedShape(evt.pointerId) ||
              this.getIntersection(this.getPointerPosition());
          if (shape) {
              shape._fireAndBubble(POINTERUP, createEvent(evt));
          }
          releaseCapture(evt.pointerId);
      };
      Stage.prototype._lostpointercapture = function (evt) {
          releaseCapture(evt.pointerId);
      };
      /**
       * manually register pointers positions (mouse/touch) in the stage.
       * So you can use stage.getPointerPosition(). Usually you don't need to use that method
       * because all internal events are automatically registered. It may be useful if event
       * is triggered outside of the stage, but you still want to use Konva methods to get pointers position.
       * @method
       * @name Konva.Stage#setPointersPositions
       * @param {Object} event Event object
       * @example
       *
       * window.addEventListener('mousemove', (e) => {
       *   stage.setPointersPositions(e);
       * });
       */
      Stage.prototype.setPointersPositions = function (evt) {
          var _this = this;
          var contentPosition = this._getContentPosition(), x = null, y = null;
          evt = evt ? evt : window.event;
          // touch events
          if (evt.touches !== undefined) {
              // touchlist has not support for map method
              // so we have to iterate
              this._pointerPositions = [];
              this._changedPointerPositions = [];
              Collection.prototype.each.call(evt.touches, function (touch) {
                  _this._pointerPositions.push({
                      id: touch.identifier,
                      x: (touch.clientX - contentPosition.left) / contentPosition.scaleX,
                      y: (touch.clientY - contentPosition.top) / contentPosition.scaleY
                  });
              });
              Collection.prototype.each.call(evt.changedTouches || evt.touches, function (touch) {
                  _this._changedPointerPositions.push({
                      id: touch.identifier,
                      x: (touch.clientX - contentPosition.left) / contentPosition.scaleX,
                      y: (touch.clientY - contentPosition.top) / contentPosition.scaleY
                  });
              });
          }
          else {
              // mouse events
              x = (evt.clientX - contentPosition.left) / contentPosition.scaleX;
              y = (evt.clientY - contentPosition.top) / contentPosition.scaleY;
              this.pointerPos = {
                  x: x,
                  y: y
              };
              this._pointerPositions = [{ x: x, y: y, id: Util._getFirstPointerId(evt) }];
              this._changedPointerPositions = [
                  { x: x, y: y, id: Util._getFirstPointerId(evt) }
              ];
          }
      };
      Stage.prototype._setPointerPosition = function (evt) {
          Util.warn('Method _setPointerPosition is deprecated. Use "stage.setPointersPositions(event)" instead.');
          this.setPointersPositions(evt);
      };
      Stage.prototype._getContentPosition = function () {
          if (!this.content || !this.content.getBoundingClientRect) {
              return {
                  top: 0,
                  left: 0,
                  scaleX: 1,
                  scaleY: 1
              };
          }
          var rect = this.content.getBoundingClientRect();
          return {
              top: rect.top,
              left: rect.left,
              // sometimes clientWidth can be equals to 0
              // i saw it in react-konva test, looks like it is because of hidden testing element
              scaleX: rect.width / this.content.clientWidth || 1,
              scaleY: rect.height / this.content.clientHeight || 1
          };
      };
      Stage.prototype._buildDOM = function () {
          this.bufferCanvas = new SceneCanvas({
              width: this.width(),
              height: this.height()
          });
          this.bufferHitCanvas = new HitCanvas({
              pixelRatio: 1,
              width: this.width(),
              height: this.height()
          });
          if (!Konva.isBrowser) {
              return;
          }
          var container = this.container();
          if (!container) {
              throw 'Stage has no container. A container is required.';
          }
          // clear content inside container
          container.innerHTML = EMPTY_STRING$1;
          // content
          this.content = document.createElement('div');
          this.content.style.position = RELATIVE;
          this.content.style.userSelect = 'none';
          this.content.className = KONVA_CONTENT;
          this.content.setAttribute('role', 'presentation');
          container.appendChild(this.content);
          this._resizeDOM();
      };
      // currently cache function is now working for stage, because stage has no its own canvas element
      Stage.prototype.cache = function () {
          Util.warn('Cache function is not allowed for stage. You may use cache only for layers, groups and shapes.');
          return this;
      };
      Stage.prototype.clearCache = function () {
          return this;
      };
      /**
       * batch draw
       * @method
       * @name Konva.BaseLayer#batchDraw
       * @return {Konva.Stage} this
       */
      Stage.prototype.batchDraw = function () {
          this.children.each(function (layer) {
              layer.batchDraw();
          });
          return this;
      };
      return Stage;
  }(Container));
  Stage.prototype.nodeType = STAGE$1;
  _registerNode(Stage);
  /**
   * get/set container DOM element
   * @method
   * @name Konva.Stage#container
   * @returns {DomElement} container
   * @example
   * // get container
   * var container = stage.container();
   * // set container
   * var container = document.createElement('div');
   * body.appendChild(container);
   * stage.container(container);
   */
  Factory.addGetterSetter(Stage, 'container');

  /**
   * BaseLayer constructor.
   * @constructor
   * @memberof Konva
   * @augments Konva.Container
   * @param {Object} config
   * @param {Boolean} [config.clearBeforeDraw] set this property to false if you don't want
   * to clear the canvas before each layer draw.  The default value is true.
   * @param {Number} [config.x]
     * @param {Number} [config.y]
     * @param {Number} [config.width]
     * @param {Number} [config.height]
     * @param {Boolean} [config.visible]
     * @param {Boolean} [config.listening] whether or not the node is listening for events
     * @param {String} [config.id] unique id
     * @param {String} [config.name] non-unique name
     * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
     * @param {Object} [config.scale] set scale
     * @param {Number} [config.scaleX] set scale x
     * @param {Number} [config.scaleY] set scale y
     * @param {Number} [config.rotation] rotation in degrees
     * @param {Object} [config.offset] offset from center point and rotation point
     * @param {Number} [config.offsetX] set offset x
     * @param {Number} [config.offsetY] set offset y
     * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
     *  the entire stage by dragging any portion of the stage
     * @param {Number} [config.dragDistance]
     * @param {Function} [config.dragBoundFunc]
   * * @param {Object} [config.clip] set clip
     * @param {Number} [config.clipX] set clip x
     * @param {Number} [config.clipY] set clip y
     * @param {Number} [config.clipWidth] set clip width
     * @param {Number} [config.clipHeight] set clip height
     * @param {Function} [config.clipFunc] set clip func

   */
  var BaseLayer = /** @class */ (function (_super) {
      __extends(BaseLayer, _super);
      function BaseLayer(config) {
          var _this = _super.call(this, config) || this;
          _this.canvas = new SceneCanvas();
          _this._waitingForDraw = false;
          _this.on('visibleChange', _this._checkVisibility);
          _this._checkVisibility();
          _this.on('imageSmoothingEnabledChange', _this._setSmoothEnabled);
          _this._setSmoothEnabled();
          return _this;
      }
      // for nodejs?
      BaseLayer.prototype.createPNGStream = function () {
          var c = this.canvas._canvas;
          return c.createPNGStream();
      };
      /**
       * get layer canvas wrapper
       * @method
       * @name Konva.BaseLayer#getCanvas
       */
      BaseLayer.prototype.getCanvas = function () {
          return this.canvas;
      };
      /**
       * get layer hit canvas
       * @method
       * @name Konva.BaseLayer#getHitCanvas
       */
      BaseLayer.prototype.getHitCanvas = function () {
          return this.hitCanvas;
      };
      /**
       * get layer canvas context
       * @method
       * @name Konva.BaseLayer#getContext
       */
      BaseLayer.prototype.getContext = function () {
          return this.getCanvas().getContext();
      };
      /**
       * clear scene and hit canvas contexts tied to the layer.
       * This function doesn't remove any nodes. It just clear canvas element.
       * @method
       * @name Konva.BaseLayer#clear
       * @param {Object} [bounds]
       * @param {Number} [bounds.x]
       * @param {Number} [bounds.y]
       * @param {Number} [bounds.width]
       * @param {Number} [bounds.height]
       * @example
       * layer.clear();
       * layer.clear({
       *   x : 0,
       *   y : 0,
       *   width : 100,
       *   height : 100
       * });
       */
      BaseLayer.prototype.clear = function (bounds) {
          this.getContext().clear(bounds);
          return this;
      };
      // extend Node.prototype.setZIndex
      BaseLayer.prototype.setZIndex = function (index) {
          _super.prototype.setZIndex.call(this, index);
          var stage = this.getStage();
          if (stage) {
              stage.content.removeChild(this.getCanvas()._canvas);
              if (index < stage.children.length - 1) {
                  stage.content.insertBefore(this.getCanvas()._canvas, stage.children[index + 1].getCanvas()._canvas);
              }
              else {
                  stage.content.appendChild(this.getCanvas()._canvas);
              }
          }
          return this;
      };
      BaseLayer.prototype.moveToTop = function () {
          Node.prototype.moveToTop.call(this);
          var stage = this.getStage();
          if (stage) {
              stage.content.removeChild(this.getCanvas()._canvas);
              stage.content.appendChild(this.getCanvas()._canvas);
          }
          return true;
      };
      BaseLayer.prototype.moveUp = function () {
          var moved = Node.prototype.moveUp.call(this);
          if (!moved) {
              return false;
          }
          var stage = this.getStage();
          if (!stage) {
              return false;
          }
          stage.content.removeChild(this.getCanvas()._canvas);
          if (this.index < stage.children.length - 1) {
              stage.content.insertBefore(this.getCanvas()._canvas, stage.children[this.index + 1].getCanvas()._canvas);
          }
          else {
              stage.content.appendChild(this.getCanvas()._canvas);
          }
          return true;
      };
      // extend Node.prototype.moveDown
      BaseLayer.prototype.moveDown = function () {
          if (Node.prototype.moveDown.call(this)) {
              var stage = this.getStage();
              if (stage) {
                  var children = stage.children;
                  stage.content.removeChild(this.getCanvas()._canvas);
                  stage.content.insertBefore(this.getCanvas()._canvas, children[this.index + 1].getCanvas()._canvas);
              }
              return true;
          }
          return false;
      };
      // extend Node.prototype.moveToBottom
      BaseLayer.prototype.moveToBottom = function () {
          if (Node.prototype.moveToBottom.call(this)) {
              var stage = this.getStage();
              if (stage) {
                  var children = stage.children;
                  stage.content.removeChild(this.getCanvas()._canvas);
                  stage.content.insertBefore(this.getCanvas()._canvas, children[1].getCanvas()._canvas);
              }
              return true;
          }
          return false;
      };
      BaseLayer.prototype.getLayer = function () {
          return this;
      };
      BaseLayer.prototype.hitGraphEnabled = function () {
          return true;
      };
      BaseLayer.prototype.remove = function () {
          var _canvas = this.getCanvas()._canvas;
          Node.prototype.remove.call(this);
          if (_canvas && _canvas.parentNode && Util._isInDocument(_canvas)) {
              _canvas.parentNode.removeChild(_canvas);
          }
          return this;
      };
      BaseLayer.prototype.getStage = function () {
          return this.parent;
      };
      BaseLayer.prototype.setSize = function (_a) {
          var width = _a.width, height = _a.height;
          this.canvas.setSize(width, height);
          this._setSmoothEnabled();
          return this;
      };
      BaseLayer.prototype._toKonvaCanvas = function (config) {
          config = config || {};
          config.width = config.width || this.getWidth();
          config.height = config.height || this.getHeight();
          config.x = config.x !== undefined ? config.x : this.x();
          config.y = config.y !== undefined ? config.y : this.y();
          return Node.prototype._toKonvaCanvas.call(this, config);
      };
      BaseLayer.prototype._checkVisibility = function () {
          var visible = this.visible();
          if (visible) {
              this.canvas._canvas.style.display = 'block';
          }
          else {
              this.canvas._canvas.style.display = 'none';
          }
      };
      BaseLayer.prototype._setSmoothEnabled = function () {
          this.getContext()._context.imageSmoothingEnabled = this.imageSmoothingEnabled();
      };
      /**
       * get/set width of layer. getter return width of stage. setter doing nothing.
       * if you want change width use `stage.width(value);`
       * @name Konva.BaseLayer#width
       * @method
       * @returns {Number}
       * @example
       * var width = layer.width();
       */
      BaseLayer.prototype.getWidth = function () {
          if (this.parent) {
              return this.parent.width();
          }
      };
      BaseLayer.prototype.setWidth = function () {
          Util.warn('Can not change width of layer. Use "stage.width(value)" function instead.');
      };
      /**
       * get/set height of layer.getter return height of stage. setter doing nothing.
       * if you want change height use `stage.height(value);`
       * @name Konva.BaseLayer#height
       * @method
       * @returns {Number}
       * @example
       * var height = layer.height();
       */
      BaseLayer.prototype.getHeight = function () {
          if (this.parent) {
              return this.parent.height();
          }
      };
      BaseLayer.prototype.setHeight = function () {
          Util.warn('Can not change height of layer. Use "stage.height(value)" function instead.');
      };
      BaseLayer.prototype.getIntersection = function (pos, selector) {
          return null;
      };
      /**
       * batch draw. this function will not do immediate draw
       * but it will schedule drawing to next tick (requestAnimFrame)
       * @method
       * @name Konva.BaseLayer#batchDraw
       * @return {Konva.Layer} this
       */
      BaseLayer.prototype.batchDraw = function () {
          var _this = this;
          if (!this._waitingForDraw) {
              this._waitingForDraw = true;
              Util.requestAnimFrame(function () {
                  _this.draw();
                  _this._waitingForDraw = false;
              });
          }
          return this;
      };
      // the apply transform method is handled by the Layer and FastLayer class
      // because it is up to the layer to decide if an absolute or relative transform
      // should be used
      BaseLayer.prototype._applyTransform = function (shape, context, top) {
          var m = shape.getAbsoluteTransform(top).getMatrix();
          context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
      };
      return BaseLayer;
  }(Container));
  BaseLayer.prototype.nodeType = 'BaseLayer';
  /**
   * get/set imageSmoothingEnabled flag
   * For more info see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled
   * @name Konva.BaseLayer#imageSmoothingEnabled
   * @method
   * @param {Boolean} imageSmoothingEnabled
   * @returns {Boolean}
   * @example
   * // get imageSmoothingEnabled flag
   * var imageSmoothingEnabled = layer.imageSmoothingEnabled();
   *
   * layer.imageSmoothingEnabled(false);
   *
   * layer.imageSmoothingEnabled(true);
   */
  Factory.addGetterSetter(BaseLayer, 'imageSmoothingEnabled', true);
  /**
   * get/set clearBeforeDraw flag which determines if the layer is cleared or not
   *  before drawing
   * @name Konva.BaseLayer#clearBeforeDraw
   * @method
   * @param {Boolean} clearBeforeDraw
   * @returns {Boolean}
   * @example
   * // get clearBeforeDraw flag
   * var clearBeforeDraw = layer.clearBeforeDraw();
   *
   * // disable clear before draw
   * layer.clearBeforeDraw(false);
   *
   * // enable clear before draw
   * layer.clearBeforeDraw(true);
   */
  Factory.addGetterSetter(BaseLayer, 'clearBeforeDraw', true);
  Collection.mapMethods(BaseLayer);

  var HAS_SHADOW = 'hasShadow';
  var SHADOW_RGBA = 'shadowRGBA';
  var patternImage = 'patternImage';
  var linearGradient = 'linearGradient';
  var radialGradient = 'radialGradient';
  var dummyContext;
  function getDummyContext() {
      if (dummyContext) {
          return dummyContext;
      }
      dummyContext = Util.createCanvasElement().getContext('2d');
      return dummyContext;
  }
  var shapes = {};
  // TODO: idea - use only "remove" (or destroy method)
  // how? on add, check that every inner shape has reference in konva store with color
  // on remove - clear that reference
  // the approach is good. But what if we want to cache the shape before we add it into the stage
  // what color to use for hit test?
  function _fillFunc(context) {
      context.fill();
  }
  function _strokeFunc(context) {
      context.stroke();
  }
  function _fillFuncHit(context) {
      context.fill();
  }
  function _strokeFuncHit(context) {
      context.stroke();
  }
  function _clearHasShadowCache() {
      this._clearCache(HAS_SHADOW);
  }
  function _clearGetShadowRGBACache() {
      this._clearCache(SHADOW_RGBA);
  }
  function _clearFillPatternCache() {
      this._clearCache(patternImage);
  }
  function _clearLinearGradientCache() {
      this._clearCache(linearGradient);
  }
  function _clearRadialGradientCache() {
      this._clearCache(radialGradient);
  }
  /**
   * Shape constructor.  Shapes are primitive objects such as rectangles,
   *  circles, text, lines, etc.
   * @constructor
   * @memberof Konva
   * @augments Konva.Node
   * @param {Object} config
   * @param {String} [config.fill] fill color
     * @param {Image} [config.fillPatternImage] fill pattern image
     * @param {Number} [config.fillPatternX]
     * @param {Number} [config.fillPatternY]
     * @param {Object} [config.fillPatternOffset] object with x and y component
     * @param {Number} [config.fillPatternOffsetX] 
     * @param {Number} [config.fillPatternOffsetY] 
     * @param {Object} [config.fillPatternScale] object with x and y component
     * @param {Number} [config.fillPatternScaleX]
     * @param {Number} [config.fillPatternScaleY]
     * @param {Number} [config.fillPatternRotation]
     * @param {String} [config.fillPatternRepeat] can be "repeat", "repeat-x", "repeat-y", or "no-repeat".  The default is "no-repeat"
     * @param {Object} [config.fillLinearGradientStartPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientStartPointX]
     * @param {Number} [config.fillLinearGradientStartPointY]
     * @param {Object} [config.fillLinearGradientEndPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientEndPointX]
     * @param {Number} [config.fillLinearGradientEndPointY]
     * @param {Array} [config.fillLinearGradientColorStops] array of color stops
     * @param {Object} [config.fillRadialGradientStartPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientStartPointX]
     * @param {Number} [config.fillRadialGradientStartPointY]
     * @param {Object} [config.fillRadialGradientEndPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientEndPointX] 
     * @param {Number} [config.fillRadialGradientEndPointY] 
     * @param {Number} [config.fillRadialGradientStartRadius]
     * @param {Number} [config.fillRadialGradientEndRadius]
     * @param {Array} [config.fillRadialGradientColorStops] array of color stops
     * @param {Boolean} [config.fillEnabled] flag which enables or disables the fill.  The default value is true
     * @param {String} [config.fillPriority] can be color, linear-gradient, radial-graident, or pattern.  The default value is color.  The fillPriority property makes it really easy to toggle between different fill types.  For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
     * @param {String} [config.stroke] stroke color
     * @param {Number} [config.strokeWidth] stroke width
     * @param {Number} [config.hitStrokeWidth] size of the stroke on hit canvas.  The default is "auto" - equals to strokeWidth
     * @param {Boolean} [config.strokeHitEnabled] flag which enables or disables stroke hit region.  The default is true
     * @param {Boolean} [config.perfectDrawEnabled] flag which enables or disables using buffer canvas.  The default is true
     * @param {Boolean} [config.shadowForStrokeEnabled] flag which enables or disables shadow for stroke.  The default is true
     * @param {Boolean} [config.strokeScaleEnabled] flag which enables or disables stroke scale.  The default is true
     * @param {Boolean} [config.strokeEnabled] flag which enables or disables the stroke.  The default value is true
     * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
     *  is miter
     * @param {String} [config.lineCap] can be butt, round, or square.  The default
     *  is butt
     * @param {String} [config.shadowColor]
     * @param {Number} [config.shadowBlur]
     * @param {Object} [config.shadowOffset] object with x and y component
     * @param {Number} [config.shadowOffsetX]
     * @param {Number} [config.shadowOffsetY]
     * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
     *  between 0 and 1
     * @param {Boolean} [config.shadowEnabled] flag which enables or disables the shadow.  The default value is true
     * @param {Array} [config.dash]
     * @param {Boolean} [config.dashEnabled] flag which enables or disables the dashArray.  The default value is true

   * @param {Number} [config.x]
     * @param {Number} [config.y]
     * @param {Number} [config.width]
     * @param {Number} [config.height]
     * @param {Boolean} [config.visible]
     * @param {Boolean} [config.listening] whether or not the node is listening for events
     * @param {String} [config.id] unique id
     * @param {String} [config.name] non-unique name
     * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
     * @param {Object} [config.scale] set scale
     * @param {Number} [config.scaleX] set scale x
     * @param {Number} [config.scaleY] set scale y
     * @param {Number} [config.rotation] rotation in degrees
     * @param {Object} [config.offset] offset from center point and rotation point
     * @param {Number} [config.offsetX] set offset x
     * @param {Number} [config.offsetY] set offset y
     * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
     *  the entire stage by dragging any portion of the stage
     * @param {Number} [config.dragDistance]
     * @param {Function} [config.dragBoundFunc]
   * @example
   * var customShape = new Konva.Shape({
   *   x: 5,
   *   y: 10,
   *   fill: 'red',
   *   // a Konva.Canvas renderer is passed into the sceneFunc function
   *   sceneFunc (context, shape) {
   *     context.beginPath();
   *     context.moveTo(200, 50);
   *     context.lineTo(420, 80);
   *     context.quadraticCurveTo(300, 100, 260, 170);
   *     context.closePath();
   *     // Konva specific method
   *     context.fillStrokeShape(shape);
   *   }
   *});
   */
  var Shape = /** @class */ (function (_super) {
      __extends(Shape, _super);
      function Shape(config) {
          var _this = _super.call(this, config) || this;
          // set colorKey
          var key;
          while (true) {
              key = Util.getRandomColor();
              if (key && !(key in shapes)) {
                  break;
              }
          }
          _this.colorKey = key;
          shapes[key] = _this;
          _this.on('shadowColorChange.konva shadowBlurChange.konva shadowOffsetChange.konva shadowOpacityChange.konva shadowEnabledChange.konva', _clearHasShadowCache);
          _this.on('shadowColorChange.konva shadowOpacityChange.konva shadowEnabledChange.konva', _clearGetShadowRGBACache);
          _this.on('fillPriorityChange.konva fillPatternImageChange.konva fillPatternRepeatChange.konva fillPatternScaleXChange.konva fillPatternScaleYChange.konva', _clearFillPatternCache);
          _this.on('fillPriorityChange.konva fillLinearGradientColorStopsChange.konva fillLinearGradientStartPointXChange.konva fillLinearGradientStartPointYChange.konva fillLinearGradientEndPointXChange.konva fillLinearGradientEndPointYChange.konva', _clearLinearGradientCache);
          _this.on('fillPriorityChange.konva fillRadialGradientColorStopsChange.konva fillRadialGradientStartPointXChange.konva fillRadialGradientStartPointYChange.konva fillRadialGradientEndPointXChange.konva fillRadialGradientEndPointYChange.konva fillRadialGradientStartRadiusChange.konva fillRadialGradientEndRadiusChange.konva', _clearRadialGradientCache);
          return _this;
      }
      /**
       * get canvas context tied to the layer
       * @method
       * @name Konva.Shape#getContext
       * @returns {Konva.Context}
       */
      Shape.prototype.getContext = function () {
          return this.getLayer().getContext();
      };
      /**
       * get canvas renderer tied to the layer.  Note that this returns a canvas renderer, not a canvas element
       * @method
       * @name Konva.Shape#getCanvas
       * @returns {Konva.Canvas}
       */
      Shape.prototype.getCanvas = function () {
          return this.getLayer().getCanvas();
      };
      Shape.prototype.getSceneFunc = function () {
          return this.attrs.sceneFunc || this['_sceneFunc'];
      };
      Shape.prototype.getHitFunc = function () {
          return this.attrs.hitFunc || this['_hitFunc'];
      };
      /**
       * returns whether or not a shadow will be rendered
       * @method
       * @name Konva.Shape#hasShadow
       * @returns {Boolean}
       */
      Shape.prototype.hasShadow = function () {
          return this._getCache(HAS_SHADOW, this._hasShadow);
      };
      Shape.prototype._hasShadow = function () {
          return (this.shadowEnabled() &&
              this.shadowOpacity() !== 0 &&
              !!(this.shadowColor() ||
                  this.shadowBlur() ||
                  this.shadowOffsetX() ||
                  this.shadowOffsetY()));
      };
      Shape.prototype._getFillPattern = function () {
          return this._getCache(patternImage, this.__getFillPattern);
      };
      Shape.prototype.__getFillPattern = function () {
          if (this.fillPatternImage()) {
              var ctx = getDummyContext();
              var pattern = ctx.createPattern(this.fillPatternImage(), this.fillPatternRepeat() || 'repeat');
              // TODO: how to enable it? It doesn't work in FF...
              // pattern.setTransform({
              //   a: this.fillPatternScaleX(), // Horizontal scaling. A value of 1 results in no scaling.
              //   b: 0, // Vertical skewing.
              //   c: 0, // Horizontal skewing.
              //   d: this.fillPatternScaleY(), // Vertical scaling. A value of 1 results in no scaling.
              //   e: 0, // Horizontal translation (moving).
              //   f: 0 // Vertical translation (moving).
              // });
              return pattern;
          }
      };
      Shape.prototype._getLinearGradient = function () {
          return this._getCache(linearGradient, this.__getLinearGradient);
      };
      Shape.prototype.__getLinearGradient = function () {
          var colorStops = this.fillLinearGradientColorStops();
          if (colorStops) {
              var ctx = getDummyContext();
              var start = this.fillLinearGradientStartPoint();
              var end = this.fillLinearGradientEndPoint();
              var grd = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
              // build color stops
              for (var n = 0; n < colorStops.length; n += 2) {
                  grd.addColorStop(colorStops[n], colorStops[n + 1]);
              }
              return grd;
          }
      };
      Shape.prototype._getRadialGradient = function () {
          return this._getCache(radialGradient, this.__getRadialGradient);
      };
      Shape.prototype.__getRadialGradient = function () {
          var colorStops = this.fillRadialGradientColorStops();
          if (colorStops) {
              var ctx = getDummyContext();
              var start = this.fillRadialGradientStartPoint();
              var end = this.fillRadialGradientEndPoint();
              var grd = ctx.createRadialGradient(start.x, start.y, this.fillRadialGradientStartRadius(), end.x, end.y, this.fillRadialGradientEndRadius());
              // build color stops
              for (var n = 0; n < colorStops.length; n += 2) {
                  grd.addColorStop(colorStops[n], colorStops[n + 1]);
              }
              return grd;
          }
      };
      Shape.prototype.getShadowRGBA = function () {
          return this._getCache(SHADOW_RGBA, this._getShadowRGBA);
      };
      Shape.prototype._getShadowRGBA = function () {
          if (this.hasShadow()) {
              var rgba = Util.colorToRGBA(this.shadowColor());
              return ('rgba(' +
                  rgba.r +
                  ',' +
                  rgba.g +
                  ',' +
                  rgba.b +
                  ',' +
                  rgba.a * (this.shadowOpacity() || 1) +
                  ')');
          }
      };
      /**
       * returns whether or not the shape will be filled
       * @method
       * @name Konva.Shape#hasFill
       * @returns {Boolean}
       */
      Shape.prototype.hasFill = function () {
          return (this.fillEnabled() &&
              !!(this.fill() ||
                  this.fillPatternImage() ||
                  this.fillLinearGradientColorStops() ||
                  this.fillRadialGradientColorStops()));
      };
      /**
       * returns whether or not the shape will be stroked
       * @method
       * @name Konva.Shape#hasStroke
       * @returns {Boolean}
       */
      Shape.prototype.hasStroke = function () {
          return (this.strokeEnabled() &&
              this.strokeWidth() &&
              !!(this.stroke() || this.strokeLinearGradientColorStops())
          // this.getStrokeRadialGradientColorStops()
          );
      };
      Shape.prototype.hasHitStroke = function () {
          var width = this.hitStrokeWidth();
          // on auto just check by stroke
          if (width === 'auto') {
              return this.hasStroke();
          }
          // we should enable hit stroke if stroke is enabled
          // and we have some value from width
          return this.strokeEnabled() && !!width;
      };
      /**
       * determines if point is in the shape, regardless if other shapes are on top of it.  Note: because
       *  this method clears a temporary canvas and then redraws the shape, it performs very poorly if executed many times
       *  consecutively.  Please use the {@link Konva.Stage#getIntersection} method if at all possible
       *  because it performs much better
       * @method
       * @name Konva.Shape#intersects
       * @param {Object} point
       * @param {Number} point.x
       * @param {Number} point.y
       * @returns {Boolean}
       */
      Shape.prototype.intersects = function (point) {
          var stage = this.getStage(), bufferHitCanvas = stage.bufferHitCanvas, p;
          bufferHitCanvas.getContext().clear();
          this.drawHit(bufferHitCanvas);
          p = bufferHitCanvas.context.getImageData(Math.round(point.x), Math.round(point.y), 1, 1).data;
          return p[3] > 0;
      };
      Shape.prototype.destroy = function () {
          Node.prototype.destroy.call(this);
          delete shapes[this.colorKey];
          delete this.colorKey;
          return this;
      };
      // why do we need buffer canvas?
      // it give better result when a shape has
      // stroke with fill and with some opacity
      Shape.prototype._useBufferCanvas = function (caching) {
          return !!((!caching || this.hasShadow()) &&
              this.perfectDrawEnabled() &&
              this.getAbsoluteOpacity() !== 1 &&
              this.hasFill() &&
              this.hasStroke() &&
              this.getStage());
      };
      Shape.prototype.setStrokeHitEnabled = function (val) {
          Util.warn('strokeHitEnabled property is deprecated. Please use hitStrokeWidth instead.');
          if (val) {
              this.hitStrokeWidth('auto');
          }
          else {
              this.hitStrokeWidth(0);
          }
      };
      Shape.prototype.getStrokeHitEnabled = function () {
          if (this.hitStrokeWidth() === 0) {
              return false;
          }
          else {
              return true;
          }
      };
      /**
       * return self rectangle (x, y, width, height) of shape.
       * This method are not taken into account transformation and styles.
       * @method
       * @name Konva.Shape#getSelfRect
       * @returns {Object} rect with {x, y, width, height} properties
       * @example
       *
       * rect.getSelfRect();  // return {x:0, y:0, width:rect.width(), height:rect.height()}
       * circle.getSelfRect();  // return {x: - circle.width() / 2, y: - circle.height() / 2, width:circle.width(), height:circle.height()}
       *
       */
      Shape.prototype.getSelfRect = function () {
          var size = this.size();
          return {
              x: this._centroid ? -size.width / 2 : 0,
              y: this._centroid ? -size.height / 2 : 0,
              width: size.width,
              height: size.height
          };
      };
      Shape.prototype.getClientRect = function (attrs) {
          attrs = attrs || {};
          var skipTransform = attrs.skipTransform;
          var relativeTo = attrs.relativeTo;
          var fillRect = this.getSelfRect();
          var applyStroke = !attrs.skipStroke && this.hasStroke();
          var strokeWidth = (applyStroke && this.strokeWidth()) || 0;
          var fillAndStrokeWidth = fillRect.width + strokeWidth;
          var fillAndStrokeHeight = fillRect.height + strokeWidth;
          var applyShadow = !attrs.skipShadow && this.hasShadow();
          var shadowOffsetX = applyShadow ? this.shadowOffsetX() : 0;
          var shadowOffsetY = applyShadow ? this.shadowOffsetY() : 0;
          var preWidth = fillAndStrokeWidth + Math.abs(shadowOffsetX);
          var preHeight = fillAndStrokeHeight + Math.abs(shadowOffsetY);
          var blurRadius = (applyShadow && this.shadowBlur()) || 0;
          var width = preWidth + blurRadius * 2;
          var height = preHeight + blurRadius * 2;
          // if stroke, for example = 3
          // we need to set x to 1.5, but after Math.round it will be 2
          // as we have additional offset we need to increase width and height by 1 pixel
          var roundingOffset = 0;
          if (Math.round(strokeWidth / 2) !== strokeWidth / 2) {
              roundingOffset = 1;
          }
          var rect = {
              width: width + roundingOffset,
              height: height + roundingOffset,
              x: -Math.round(strokeWidth / 2 + blurRadius) +
                  Math.min(shadowOffsetX, 0) +
                  fillRect.x,
              y: -Math.round(strokeWidth / 2 + blurRadius) +
                  Math.min(shadowOffsetY, 0) +
                  fillRect.y
          };
          if (!skipTransform) {
              return this._transformedRect(rect, relativeTo);
          }
          return rect;
      };
      Shape.prototype.drawScene = function (can, top, caching, skipBuffer) {
          var layer = this.getLayer(), canvas = can || layer.getCanvas(), context = canvas.getContext(), cachedCanvas = this._getCanvasCache(), drawFunc = this.sceneFunc(), hasShadow = this.hasShadow(), hasStroke = this.hasStroke(), stage, bufferCanvas, bufferContext;
          if (!this.isVisible() && !caching) {
              return this;
          }
          if (cachedCanvas) {
              context.save();
              layer._applyTransform(this, context, top);
              this._drawCachedSceneCanvas(context);
              context.restore();
              return this;
          }
          if (!drawFunc) {
              return this;
          }
          context.save();
          // if buffer canvas is needed
          if (this._useBufferCanvas(caching) && !skipBuffer) {
              stage = this.getStage();
              bufferCanvas = stage.bufferCanvas;
              bufferContext = bufferCanvas.getContext();
              bufferContext.clear();
              bufferContext.save();
              bufferContext._applyLineJoin(this);
              // layer might be undefined if we are using cache before adding to layer
              if (!caching) {
                  if (layer) {
                      layer._applyTransform(this, bufferContext, top);
                  }
                  else {
                      var m = this.getAbsoluteTransform(top).getMatrix();
                      context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
                  }
              }
              drawFunc.call(this, bufferContext, this);
              bufferContext.restore();
              var ratio = bufferCanvas.pixelRatio;
              if (hasShadow && !canvas.hitCanvas) {
                  context.save();
                  context._applyShadow(this);
                  context._applyOpacity(this);
                  context._applyGlobalCompositeOperation(this);
                  context.drawImage(bufferCanvas._canvas, 0, 0, bufferCanvas.width / ratio, bufferCanvas.height / ratio);
                  context.restore();
              }
              else {
                  context._applyOpacity(this);
                  context._applyGlobalCompositeOperation(this);
                  context.drawImage(bufferCanvas._canvas, 0, 0, bufferCanvas.width / ratio, bufferCanvas.height / ratio);
              }
          }
          else {
              // if buffer canvas is not needed
              context._applyLineJoin(this);
              // layer might be undefined if we are using cache before adding to layer
              if (!caching) {
                  if (layer) {
                      layer._applyTransform(this, context, top);
                  }
                  else {
                      var o = this.getAbsoluteTransform(top).getMatrix();
                      context.transform(o[0], o[1], o[2], o[3], o[4], o[5]);
                  }
              }
              if (hasShadow && hasStroke && !canvas.hitCanvas) {
                  context.save();
                  // apply shadow
                  if (!caching) {
                      context._applyOpacity(this);
                      context._applyGlobalCompositeOperation(this);
                  }
                  context._applyShadow(this);
                  drawFunc.call(this, context, this);
                  context.restore();
                  // if shape has stroke we need to redraw shape
                  // otherwise we will see a shadow under stroke (and over fill)
                  // but I think this is unexpected behavior
                  if (this.hasFill() && this.shadowForStrokeEnabled()) {
                      drawFunc.call(this, context, this);
                  }
              }
              else if (hasShadow && !canvas.hitCanvas) {
                  context.save();
                  if (!caching) {
                      context._applyOpacity(this);
                      context._applyGlobalCompositeOperation(this);
                  }
                  context._applyShadow(this);
                  drawFunc.call(this, context, this);
                  context.restore();
              }
              else {
                  if (!caching) {
                      context._applyOpacity(this);
                      context._applyGlobalCompositeOperation(this);
                  }
                  drawFunc.call(this, context, this);
              }
          }
          context.restore();
          return this;
      };
      Shape.prototype.drawHit = function (can, top, caching) {
          var layer = this.getLayer(), canvas = can || layer.hitCanvas, context = canvas && canvas.getContext(), drawFunc = this.hitFunc() || this.sceneFunc(), cachedCanvas = this._getCanvasCache(), cachedHitCanvas = cachedCanvas && cachedCanvas.hit;
          if (!this.colorKey) {
              console.log(this);
              Util.warn('Looks like your canvas has a destroyed shape in it. Do not reuse shape after you destroyed it. See the shape in logs above. If you want to reuse shape you should call remove() instead of destroy()');
          }
          if (!this.shouldDrawHit() && !caching) {
              return this;
          }
          if (cachedHitCanvas) {
              context.save();
              layer._applyTransform(this, context, top);
              this._drawCachedHitCanvas(context);
              context.restore();
              return this;
          }
          if (!drawFunc) {
              return this;
          }
          context.save();
          context._applyLineJoin(this);
          if (!caching) {
              if (layer) {
                  layer._applyTransform(this, context, top);
              }
              else {
                  var o = this.getAbsoluteTransform(top).getMatrix();
                  context.transform(o[0], o[1], o[2], o[3], o[4], o[5]);
              }
          }
          drawFunc.call(this, context, this);
          context.restore();
          return this;
      };
      /**
       * draw hit graph using the cached scene canvas
       * @method
       * @name Konva.Shape#drawHitFromCache
       * @param {Integer} alphaThreshold alpha channel threshold that determines whether or not
       *  a pixel should be drawn onto the hit graph.  Must be a value between 0 and 255.
       *  The default is 0
       * @returns {Konva.Shape}
       * @example
       * shape.cache();
       * shape.drawHitFromCache();
       */
      Shape.prototype.drawHitFromCache = function (alphaThreshold) {
          if (alphaThreshold === void 0) { alphaThreshold = 0; }
          var cachedCanvas = this._getCanvasCache(), sceneCanvas = this._getCachedSceneCanvas(), hitCanvas = cachedCanvas.hit, hitContext = hitCanvas.getContext(), hitWidth = hitCanvas.getWidth(), hitHeight = hitCanvas.getHeight(), hitImageData, hitData, len, rgbColorKey, i, alpha;
          hitContext.clear();
          hitContext.drawImage(sceneCanvas._canvas, 0, 0, hitWidth, hitHeight);
          try {
              hitImageData = hitContext.getImageData(0, 0, hitWidth, hitHeight);
              hitData = hitImageData.data;
              len = hitData.length;
              rgbColorKey = Util._hexToRgb(this.colorKey);
              // replace non transparent pixels with color key
              for (i = 0; i < len; i += 4) {
                  alpha = hitData[i + 3];
                  if (alpha > alphaThreshold) {
                      hitData[i] = rgbColorKey.r;
                      hitData[i + 1] = rgbColorKey.g;
                      hitData[i + 2] = rgbColorKey.b;
                      hitData[i + 3] = 255;
                  }
                  else {
                      hitData[i + 3] = 0;
                  }
              }
              hitContext.putImageData(hitImageData, 0, 0);
          }
          catch (e) {
              Util.error('Unable to draw hit graph from cached scene canvas. ' + e.message);
          }
          return this;
      };
      Shape.prototype.hasPointerCapture = function (pointerId) {
          return hasPointerCapture(pointerId, this);
      };
      Shape.prototype.setPointerCapture = function (pointerId) {
          setPointerCapture(pointerId, this);
      };
      Shape.prototype.releaseCapture = function (pointerId) {
          releaseCapture(pointerId);
      };
      return Shape;
  }(Node));
  Shape.prototype._fillFunc = _fillFunc;
  Shape.prototype._strokeFunc = _strokeFunc;
  Shape.prototype._fillFuncHit = _fillFuncHit;
  Shape.prototype._strokeFuncHit = _strokeFuncHit;
  Shape.prototype._centroid = false;
  Shape.prototype.nodeType = 'Shape';
  _registerNode(Shape);
  // add getters and setters
  Factory.addGetterSetter(Shape, 'stroke', undefined, getStringValidator());
  /**
   * get/set stroke color
   * @name Konva.Shape#stroke
   * @method
   * @param {String} color
   * @returns {String}
   * @example
   * // get stroke color
   * var stroke = shape.stroke();
   *
   * // set stroke color with color string
   * shape.stroke('green');
   *
   * // set stroke color with hex
   * shape.stroke('#00ff00');
   *
   * // set stroke color with rgb
   * shape.stroke('rgb(0,255,0)');
   *
   * // set stroke color with rgba and make it 50% opaque
   * shape.stroke('rgba(0,255,0,0.5');
   */
  Factory.addGetterSetter(Shape, 'strokeWidth', 2, getNumberValidator());
  /**
   * get/set stroke width
   * @name Konva.Shape#strokeWidth
   * @method
   * @param {Number} strokeWidth
   * @returns {Number}
   * @example
   * // get stroke width
   * var strokeWidth = shape.strokeWidth();
   *
   * // set stroke width
   * shape.strokeWidth(10);
   */
  Factory.addGetterSetter(Shape, 'hitStrokeWidth', 'auto', getNumberOrAutoValidator());
  /**
   * get/set stroke width for hit detection. Default value is "auto", it means it will be equals to strokeWidth
   * @name Konva.Shape#hitStrokeWidth
   * @method
   * @param {Number} hitStrokeWidth
   * @returns {Number}
   * @example
   * // get stroke width
   * var hitStrokeWidth = shape.hitStrokeWidth();
   *
   * // set hit stroke width
   * shape.hitStrokeWidth(20);
   * // set hit stroke width always equals to scene stroke width
   * shape.hitStrokeWidth('auto');
   */
  // TODO: probably we should deprecate it
  Factory.addGetterSetter(Shape, 'strokeHitEnabled', true, getBooleanValidator());
  /**
   * **deprecated, use hitStrokeWidth instead!** get/set strokeHitEnabled property. Useful for performance optimization.
   * You may set `shape.strokeHitEnabled(false)`. In this case stroke will be no draw on hit canvas, so hit area
   * of shape will be decreased (by lineWidth / 2). Remember that non closed line with `strokeHitEnabled = false`
   * will be not drawn on hit canvas, that is mean line will no trigger pointer events (like mouseover)
   * Default value is true.
   * @name Konva.Shape#strokeHitEnabled
   * @method
   * @param {Boolean} strokeHitEnabled
   * @returns {Boolean}
   * @example
   * // get strokeHitEnabled
   * var strokeHitEnabled = shape.strokeHitEnabled();
   *
   * // set strokeHitEnabled
   * shape.strokeHitEnabled();
   */
  Factory.addGetterSetter(Shape, 'perfectDrawEnabled', true, getBooleanValidator());
  /**
   * get/set perfectDrawEnabled. If a shape has fill, stroke and opacity you may set `perfectDrawEnabled` to false to improve performance.
   * See http://konvajs.org/docs/performance/Disable_Perfect_Draw.html for more information.
   * Default value is true
   * @name Konva.Shape#perfectDrawEnabled
   * @method
   * @param {Boolean} perfectDrawEnabled
   * @returns {Boolean}
   * @example
   * // get perfectDrawEnabled
   * var perfectDrawEnabled = shape.perfectDrawEnabled();
   *
   * // set perfectDrawEnabled
   * shape.perfectDrawEnabled();
   */
  Factory.addGetterSetter(Shape, 'shadowForStrokeEnabled', true, getBooleanValidator());
  /**
   * get/set shadowForStrokeEnabled. Useful for performance optimization.
   * You may set `shape.shadowForStrokeEnabled(false)`. In this case stroke will no effect shadow.
   * Remember if you set `shadowForStrokeEnabled = false` for non closed line - that line will have no shadow!.
   * Default value is true
   * @name Konva.Shape#shadowForStrokeEnabled
   * @method
   * @param {Boolean} shadowForStrokeEnabled
   * @returns {Boolean}
   * @example
   * // get shadowForStrokeEnabled
   * var shadowForStrokeEnabled = shape.shadowForStrokeEnabled();
   *
   * // set shadowForStrokeEnabled
   * shape.shadowForStrokeEnabled();
   */
  Factory.addGetterSetter(Shape, 'lineJoin');
  /**
   * get/set line join.  Can be miter, round, or bevel.  The
   *  default is miter
   * @name Konva.Shape#lineJoin
   * @method
   * @param {String} lineJoin
   * @returns {String}
   * @example
   * // get line join
   * var lineJoin = shape.lineJoin();
   *
   * // set line join
   * shape.lineJoin('round');
   */
  Factory.addGetterSetter(Shape, 'lineCap');
  /**
   * get/set line cap.  Can be butt, round, or square
   * @name Konva.Shape#lineCap
   * @method
   * @param {String} lineCap
   * @returns {String}
   * @example
   * // get line cap
   * var lineCap = shape.lineCap();
   *
   * // set line cap
   * shape.lineCap('round');
   */
  Factory.addGetterSetter(Shape, 'sceneFunc');
  /**
   * get/set scene draw function. That function is used to draw the shape on a canvas.
   * Also that function will be used to draw hit area of the shape, in case if hitFunc is not defined.
   * @name Konva.Shape#sceneFunc
   * @method
   * @param {Function} drawFunc drawing function
   * @returns {Function}
   * @example
   * // get scene draw function
   * var sceneFunc = shape.sceneFunc();
   *
   * // set scene draw function
   * shape.sceneFunc(function(context, shape) {
   *   context.beginPath();
   *   context.rect(0, 0, shape.width(), shape.height());
   *   context.closePath();
   *   // important Konva method that fill and stroke shape from its properties
   *   // like stroke and fill
   *   context.fillStrokeShape(shape);
   * });
   */
  Factory.addGetterSetter(Shape, 'hitFunc');
  /**
   * get/set hit draw function. That function is used to draw custom hit area of a shape.
   * @name Konva.Shape#hitFunc
   * @method
   * @param {Function} drawFunc drawing function
   * @returns {Function}
   * @example
   * // get hit draw function
   * var hitFunc = shape.hitFunc();
   *
   * // set hit draw function
   * shape.hitFunc(function(context) {
   *   context.beginPath();
   *   context.rect(0, 0, shape.width(), shape.height());
   *   context.closePath();
   *   // important Konva method that fill and stroke shape from its properties
   *   context.fillStrokeShape(shape);
   * });
   */
  Factory.addGetterSetter(Shape, 'dash');
  /**
   * get/set dash array for stroke.
   * @name Konva.Shape#dash
   * @method
   * @param {Array} dash
   * @returns {Array}
   * @example
   *  // apply dashed stroke that is 10px long and 5 pixels apart
   *  line.dash([10, 5]);
   *  // apply dashed stroke that is made up of alternating dashed
   *  // lines that are 10px long and 20px apart, and dots that have
   *  // a radius of 5px and are 20px apart
   *  line.dash([10, 20, 0.001, 20]);
   */
  Factory.addGetterSetter(Shape, 'dashOffset', 0, getNumberValidator());
  /**
   * get/set dash offset for stroke.
   * @name Konva.Shape#dash
   * @method
   * @param {Number} dash offset
   * @returns {Number}
   * @example
   *  // apply dashed stroke that is 10px long and 5 pixels apart with an offset of 5px
   *  line.dash([10, 5]);
   *  line.dashOffset(5);
   */
  Factory.addGetterSetter(Shape, 'shadowColor', undefined, getStringValidator());
  /**
   * get/set shadow color
   * @name Konva.Shape#shadowColor
   * @method
   * @param {String} color
   * @returns {String}
   * @example
   * // get shadow color
   * var shadow = shape.shadowColor();
   *
   * // set shadow color with color string
   * shape.shadowColor('green');
   *
   * // set shadow color with hex
   * shape.shadowColor('#00ff00');
   *
   * // set shadow color with rgb
   * shape.shadowColor('rgb(0,255,0)');
   *
   * // set shadow color with rgba and make it 50% opaque
   * shape.shadowColor('rgba(0,255,0,0.5');
   */
  Factory.addGetterSetter(Shape, 'shadowBlur', 0, getNumberValidator());
  /**
   * get/set shadow blur
   * @name Konva.Shape#shadowBlur
   * @method
   * @param {Number} blur
   * @returns {Number}
   * @example
   * // get shadow blur
   * var shadowBlur = shape.shadowBlur();
   *
   * // set shadow blur
   * shape.shadowBlur(10);
   */
  Factory.addGetterSetter(Shape, 'shadowOpacity', 1, getNumberValidator());
  /**
   * get/set shadow opacity.  must be a value between 0 and 1
   * @name Konva.Shape#shadowOpacity
   * @method
   * @param {Number} opacity
   * @returns {Number}
   * @example
   * // get shadow opacity
   * var shadowOpacity = shape.shadowOpacity();
   *
   * // set shadow opacity
   * shape.shadowOpacity(0.5);
   */
  Factory.addComponentsGetterSetter(Shape, 'shadowOffset', ['x', 'y']);
  /**
   * get/set shadow offset
   * @name Konva.Shape#shadowOffset
   * @method
   * @param {Object} offset
   * @param {Number} offset.x
   * @param {Number} offset.y
   * @returns {Object}
   * @example
   * // get shadow offset
   * var shadowOffset = shape.shadowOffset();
   *
   * // set shadow offset
   * shape.shadowOffset({
   *   x: 20,
   *   y: 10
   * });
   */
  Factory.addGetterSetter(Shape, 'shadowOffsetX', 0, getNumberValidator());
  /**
   * get/set shadow offset x
   * @name Konva.Shape#shadowOffsetX
   * @method
   * @param {Number} x
   * @returns {Number}
   * @example
   * // get shadow offset x
   * var shadowOffsetX = shape.shadowOffsetX();
   *
   * // set shadow offset x
   * shape.shadowOffsetX(5);
   */
  Factory.addGetterSetter(Shape, 'shadowOffsetY', 0, getNumberValidator());
  /**
   * get/set shadow offset y
   * @name Konva.Shape#shadowOffsetY
   * @method
   * @param {Number} y
   * @returns {Number}
   * @example
   * // get shadow offset y
   * var shadowOffsetY = shape.shadowOffsetY();
   *
   * // set shadow offset y
   * shape.shadowOffsetY(5);
   */
  Factory.addGetterSetter(Shape, 'fillPatternImage');
  /**
   * get/set fill pattern image
   * @name Konva.Shape#fillPatternImage
   * @method
   * @param {Image} image object
   * @returns {Image}
   * @example
   * // get fill pattern image
   * var fillPatternImage = shape.fillPatternImage();
   *
   * // set fill pattern image
   * var imageObj = new Image();
   * imageObj.onload = function() {
   *   shape.fillPatternImage(imageObj);
   * };
   * imageObj.src = 'path/to/image/jpg';
   */
  Factory.addGetterSetter(Shape, 'fill', undefined, getStringValidator());
  /**
   * get/set fill color
   * @name Konva.Shape#fill
   * @method
   * @param {String} color
   * @returns {String}
   * @example
   * // get fill color
   * var fill = shape.fill();
   *
   * // set fill color with color string
   * shape.fill('green');
   *
   * // set fill color with hex
   * shape.fill('#00ff00');
   *
   * // set fill color with rgb
   * shape.fill('rgb(0,255,0)');
   *
   * // set fill color with rgba and make it 50% opaque
   * shape.fill('rgba(0,255,0,0.5');
   *
   * // shape without fill
   * shape.fill(null);
   */
  Factory.addGetterSetter(Shape, 'fillPatternX', 0, getNumberValidator());
  /**
   * get/set fill pattern x
   * @name Konva.Shape#fillPatternX
   * @method
   * @param {Number} x
   * @returns {Number}
   * @example
   * // get fill pattern x
   * var fillPatternX = shape.fillPatternX();
   * // set fill pattern x
   * shape.fillPatternX(20);
   */
  Factory.addGetterSetter(Shape, 'fillPatternY', 0, getNumberValidator());
  /**
   * get/set fill pattern y
   * @name Konva.Shape#fillPatternY
   * @method
   * @param {Number} y
   * @returns {Number}
   * @example
   * // get fill pattern y
   * var fillPatternY = shape.fillPatternY();
   * // set fill pattern y
   * shape.fillPatternY(20);
   */
  Factory.addGetterSetter(Shape, 'fillLinearGradientColorStops');
  /**
   * get/set fill linear gradient color stops
   * @name Konva.Shape#fillLinearGradientColorStops
   * @method
   * @param {Array} colorStops
   * @returns {Array} colorStops
   * @example
   * // get fill linear gradient color stops
   * var colorStops = shape.fillLinearGradientColorStops();
   *
   * // create a linear gradient that starts with red, changes to blue
   * // halfway through, and then changes to green
   * shape.fillLinearGradientColorStops(0, 'red', 0.5, 'blue', 1, 'green');
   */
  Factory.addGetterSetter(Shape, 'strokeLinearGradientColorStops');
  /**
   * get/set stroke linear gradient color stops
   * @name Konva.Shape#strokeLinearGradientColorStops
   * @method
   * @param {Array} colorStops
   * @returns {Array} colorStops
   * @example
   * // get stroke linear gradient color stops
   * var colorStops = shape.strokeLinearGradientColorStops();
   *
   * // create a linear gradient that starts with red, changes to blue
   * // halfway through, and then changes to green
   * shape.strokeLinearGradientColorStops([0, 'red', 0.5, 'blue', 1, 'green']);
   */
  Factory.addGetterSetter(Shape, 'fillRadialGradientStartRadius', 0);
  /**
   * get/set fill radial gradient start radius
   * @name Konva.Shape#fillRadialGradientStartRadius
   * @method
   * @param {Number} radius
   * @returns {Number}
   * @example
   * // get radial gradient start radius
   * var startRadius = shape.fillRadialGradientStartRadius();
   *
   * // set radial gradient start radius
   * shape.fillRadialGradientStartRadius(0);
   */
  Factory.addGetterSetter(Shape, 'fillRadialGradientEndRadius', 0);
  /**
   * get/set fill radial gradient end radius
   * @name Konva.Shape#fillRadialGradientEndRadius
   * @method
   * @param {Number} radius
   * @returns {Number}
   * @example
   * // get radial gradient end radius
   * var endRadius = shape.fillRadialGradientEndRadius();
   *
   * // set radial gradient end radius
   * shape.fillRadialGradientEndRadius(100);
   */
  Factory.addGetterSetter(Shape, 'fillRadialGradientColorStops');
  /**
   * get/set fill radial gradient color stops
   * @name Konva.Shape#fillRadialGradientColorStops
   * @method
   * @param {Number} colorStops
   * @returns {Array}
   * @example
   * // get fill radial gradient color stops
   * var colorStops = shape.fillRadialGradientColorStops();
   *
   * // create a radial gradient that starts with red, changes to blue
   * // halfway through, and then changes to green
   * shape.fillRadialGradientColorStops(0, 'red', 0.5, 'blue', 1, 'green');
   */
  Factory.addGetterSetter(Shape, 'fillPatternRepeat', 'repeat');
  /**
   * get/set fill pattern repeat.  Can be 'repeat', 'repeat-x', 'repeat-y', or 'no-repeat'.  The default is 'repeat'
   * @name Konva.Shape#fillPatternRepeat
   * @method
   * @param {String} repeat
   * @returns {String}
   * @example
   * // get fill pattern repeat
   * var repeat = shape.fillPatternRepeat();
   *
   * // repeat pattern in x direction only
   * shape.fillPatternRepeat('repeat-x');
   *
   * // do not repeat the pattern
   * shape.fillPatternRepeat('no-repeat');
   */
  Factory.addGetterSetter(Shape, 'fillEnabled', true);
  /**
   * get/set fill enabled flag
   * @name Konva.Shape#fillEnabled
   * @method
   * @param {Boolean} enabled
   * @returns {Boolean}
   * @example
   * // get fill enabled flag
   * var fillEnabled = shape.fillEnabled();
   *
   * // disable fill
   * shape.fillEnabled(false);
   *
   * // enable fill
   * shape.fillEnabled(true);
   */
  Factory.addGetterSetter(Shape, 'strokeEnabled', true);
  /**
   * get/set stroke enabled flag
   * @name Konva.Shape#strokeEnabled
   * @method
   * @param {Boolean} enabled
   * @returns {Boolean}
   * @example
   * // get stroke enabled flag
   * var strokeEnabled = shape.strokeEnabled();
   *
   * // disable stroke
   * shape.strokeEnabled(false);
   *
   * // enable stroke
   * shape.strokeEnabled(true);
   */
  Factory.addGetterSetter(Shape, 'shadowEnabled', true);
  /**
   * get/set shadow enabled flag
   * @name Konva.Shape#shadowEnabled
   * @method
   * @param {Boolean} enabled
   * @returns {Boolean}
   * @example
   * // get shadow enabled flag
   * var shadowEnabled = shape.shadowEnabled();
   *
   * // disable shadow
   * shape.shadowEnabled(false);
   *
   * // enable shadow
   * shape.shadowEnabled(true);
   */
  Factory.addGetterSetter(Shape, 'dashEnabled', true);
  /**
   * get/set dash enabled flag
   * @name Konva.Shape#dashEnabled
   * @method
   * @param {Boolean} enabled
   * @returns {Boolean}
   * @example
   * // get dash enabled flag
   * var dashEnabled = shape.dashEnabled();
   *
   * // disable dash
   * shape.dashEnabled(false);
   *
   * // enable dash
   * shape.dashEnabled(true);
   */
  Factory.addGetterSetter(Shape, 'strokeScaleEnabled', true);
  /**
   * get/set strokeScale enabled flag
   * @name Konva.Shape#strokeScaleEnabled
   * @method
   * @param {Boolean} enabled
   * @returns {Boolean}
   * @example
   * // get stroke scale enabled flag
   * var strokeScaleEnabled = shape.strokeScaleEnabled();
   *
   * // disable stroke scale
   * shape.strokeScaleEnabled(false);
   *
   * // enable stroke scale
   * shape.strokeScaleEnabled(true);
   */
  Factory.addGetterSetter(Shape, 'fillPriority', 'color');
  /**
   * get/set fill priority.  can be color, pattern, linear-gradient, or radial-gradient.  The default is color.
   *   This is handy if you want to toggle between different fill types.
   * @name Konva.Shape#fillPriority
   * @method
   * @param {String} priority
   * @returns {String}
   * @example
   * // get fill priority
   * var fillPriority = shape.fillPriority();
   *
   * // set fill priority
   * shape.fillPriority('linear-gradient');
   */
  Factory.addComponentsGetterSetter(Shape, 'fillPatternOffset', ['x', 'y']);
  /**
   * get/set fill pattern offset
   * @name Konva.Shape#fillPatternOffset
   * @method
   * @param {Object} offset
   * @param {Number} offset.x
   * @param {Number} offset.y
   * @returns {Object}
   * @example
   * // get fill pattern offset
   * var patternOffset = shape.fillPatternOffset();
   *
   * // set fill pattern offset
   * shape.fillPatternOffset({
   *   x: 20,
   *   y: 10
   * });
   */
  Factory.addGetterSetter(Shape, 'fillPatternOffsetX', 0, getNumberValidator());
  /**
   * get/set fill pattern offset x
   * @name Konva.Shape#fillPatternOffsetX
   * @method
   * @param {Number} x
   * @returns {Number}
   * @example
   * // get fill pattern offset x
   * var patternOffsetX = shape.fillPatternOffsetX();
   *
   * // set fill pattern offset x
   * shape.fillPatternOffsetX(20);
   */
  Factory.addGetterSetter(Shape, 'fillPatternOffsetY', 0, getNumberValidator());
  /**
   * get/set fill pattern offset y
   * @name Konva.Shape#fillPatternOffsetY
   * @method
   * @param {Number} y
   * @returns {Number}
   * @example
   * // get fill pattern offset y
   * var patternOffsetY = shape.fillPatternOffsetY();
   *
   * // set fill pattern offset y
   * shape.fillPatternOffsetY(10);
   */
  Factory.addComponentsGetterSetter(Shape, 'fillPatternScale', ['x', 'y']);
  /**
   * get/set fill pattern scale
   * @name Konva.Shape#fillPatternScale
   * @method
   * @param {Object} scale
   * @param {Number} scale.x
   * @param {Number} scale.y
   * @returns {Object}
   * @example
   * // get fill pattern scale
   * var patternScale = shape.fillPatternScale();
   *
   * // set fill pattern scale
   * shape.fillPatternScale({
   *   x: 2,
   *   y: 2
   * });
   */
  Factory.addGetterSetter(Shape, 'fillPatternScaleX', 1, getNumberValidator());
  /**
   * get/set fill pattern scale x
   * @name Konva.Shape#fillPatternScaleX
   * @method
   * @param {Number} x
   * @returns {Number}
   * @example
   * // get fill pattern scale x
   * var patternScaleX = shape.fillPatternScaleX();
   *
   * // set fill pattern scale x
   * shape.fillPatternScaleX(2);
   */
  Factory.addGetterSetter(Shape, 'fillPatternScaleY', 1, getNumberValidator());
  /**
   * get/set fill pattern scale y
   * @name Konva.Shape#fillPatternScaleY
   * @method
   * @param {Number} y
   * @returns {Number}
   * @example
   * // get fill pattern scale y
   * var patternScaleY = shape.fillPatternScaleY();
   *
   * // set fill pattern scale y
   * shape.fillPatternScaleY(2);
   */
  Factory.addComponentsGetterSetter(Shape, 'fillLinearGradientStartPoint', [
      'x',
      'y'
  ]);
  /**
   * get/set fill linear gradient start point
   * @name Konva.Shape#fillLinearGradientStartPoint
   * @method
   * @param {Object} startPoint
   * @param {Number} startPoint.x
   * @param {Number} startPoint.y
   * @returns {Object}
   * @example
   * // get fill linear gradient start point
   * var startPoint = shape.fillLinearGradientStartPoint();
   *
   * // set fill linear gradient start point
   * shape.fillLinearGradientStartPoint({
   *   x: 20,
   *   y: 10
   * });
   */
  Factory.addComponentsGetterSetter(Shape, 'strokeLinearGradientStartPoint', [
      'x',
      'y'
  ]);
  /**
   * get/set stroke linear gradient start point
   * @name Konva.Shape#strokeLinearGradientStartPoint
   * @method
   * @param {Object} startPoint
   * @param {Number} startPoint.x
   * @param {Number} startPoint.y
   * @returns {Object}
   * @example
   * // get stroke linear gradient start point
   * var startPoint = shape.strokeLinearGradientStartPoint();
   *
   * // set stroke linear gradient start point
   * shape.strokeLinearGradientStartPoint({
   *   x: 20,
   *   y: 10
   * });
   */
  Factory.addGetterSetter(Shape, 'fillLinearGradientStartPointX', 0);
  /**
   * get/set fill linear gradient start point x
   * @name Konva.Shape#fillLinearGradientStartPointX
   * @method
   * @param {Number} x
   * @returns {Number}
   * @example
   * // get fill linear gradient start point x
   * var startPointX = shape.fillLinearGradientStartPointX();
   *
   * // set fill linear gradient start point x
   * shape.fillLinearGradientStartPointX(20);
   */
  Factory.addGetterSetter(Shape, 'strokeLinearGradientStartPointX', 0);
  /**
   * get/set stroke linear gradient start point x
   * @name Konva.Shape#linearLinearGradientStartPointX
   * @method
   * @param {Number} x
   * @returns {Number}
   * @example
   * // get stroke linear gradient start point x
   * var startPointX = shape.strokeLinearGradientStartPointX();
   *
   * // set stroke linear gradient start point x
   * shape.strokeLinearGradientStartPointX(20);
   */
  Factory.addGetterSetter(Shape, 'fillLinearGradientStartPointY', 0);
  /**
   * get/set fill linear gradient start point y
   * @name Konva.Shape#fillLinearGradientStartPointY
   * @method
   * @param {Number} y
   * @returns {Number}
   * @example
   * // get fill linear gradient start point y
   * var startPointY = shape.fillLinearGradientStartPointY();
   *
   * // set fill linear gradient start point y
   * shape.fillLinearGradientStartPointY(20);
   */
  Factory.addGetterSetter(Shape, 'strokeLinearGradientStartPointY', 0);
  /**
   * get/set stroke linear gradient start point y
   * @name Konva.Shape#strokeLinearGradientStartPointY
   * @method
   * @param {Number} y
   * @returns {Number}
   * @example
   * // get stroke linear gradient start point y
   * var startPointY = shape.strokeLinearGradientStartPointY();
   *
   * // set stroke linear gradient start point y
   * shape.strokeLinearGradientStartPointY(20);
   */
  Factory.addComponentsGetterSetter(Shape, 'fillLinearGradientEndPoint', [
      'x',
      'y'
  ]);
  /**
   * get/set fill linear gradient end point
   * @name Konva.Shape#fillLinearGradientEndPoint
   * @method
   * @param {Object} endPoint
   * @param {Number} endPoint.x
   * @param {Number} endPoint.y
   * @returns {Object}
   * @example
   * // get fill linear gradient end point
   * var endPoint = shape.fillLinearGradientEndPoint();
   *
   * // set fill linear gradient end point
   * shape.fillLinearGradientEndPoint({
   *   x: 20,
   *   y: 10
   * });
   */
  Factory.addComponentsGetterSetter(Shape, 'strokeLinearGradientEndPoint', [
      'x',
      'y'
  ]);
  /**
   * get/set stroke linear gradient end point
   * @name Konva.Shape#strokeLinearGradientEndPoint
   * @method
   * @param {Object} endPoint
   * @param {Number} endPoint.x
   * @param {Number} endPoint.y
   * @returns {Object}
   * @example
   * // get stroke linear gradient end point
   * var endPoint = shape.strokeLinearGradientEndPoint();
   *
   * // set stroke linear gradient end point
   * shape.strokeLinearGradientEndPoint({
   *   x: 20,
   *   y: 10
   * });
   */
  Factory.addGetterSetter(Shape, 'fillLinearGradientEndPointX', 0);
  /**
   * get/set fill linear gradient end point x
   * @name Konva.Shape#fillLinearGradientEndPointX
   * @method
   * @param {Number} x
   * @returns {Number}
   * @example
   * // get fill linear gradient end point x
   * var endPointX = shape.fillLinearGradientEndPointX();
   *
   * // set fill linear gradient end point x
   * shape.fillLinearGradientEndPointX(20);
   */
  Factory.addGetterSetter(Shape, 'strokeLinearGradientEndPointX', 0);
  /**
   * get/set fill linear gradient end point x
   * @name Konva.Shape#strokeLinearGradientEndPointX
   * @method
   * @param {Number} x
   * @returns {Number}
   * @example
   * // get stroke linear gradient end point x
   * var endPointX = shape.strokeLinearGradientEndPointX();
   *
   * // set stroke linear gradient end point x
   * shape.strokeLinearGradientEndPointX(20);
   */
  Factory.addGetterSetter(Shape, 'fillLinearGradientEndPointY', 0);
  /**
   * get/set fill linear gradient end point y
   * @name Konva.Shape#fillLinearGradientEndPointY
   * @method
   * @param {Number} y
   * @returns {Number}
   * @example
   * // get fill linear gradient end point y
   * var endPointY = shape.fillLinearGradientEndPointY();
   *
   * // set fill linear gradient end point y
   * shape.fillLinearGradientEndPointY(20);
   */
  Factory.addGetterSetter(Shape, 'strokeLinearGradientEndPointY', 0);
  /**
   * get/set stroke linear gradient end point y
   * @name Konva.Shape#strokeLinearGradientEndPointY
   * @method
   * @param {Number} y
   * @returns {Number}
   * @example
   * // get stroke linear gradient end point y
   * var endPointY = shape.strokeLinearGradientEndPointY();
   *
   * // set stroke linear gradient end point y
   * shape.strokeLinearGradientEndPointY(20);
   */
  Factory.addComponentsGetterSetter(Shape, 'fillRadialGradientStartPoint', [
      'x',
      'y'
  ]);
  /**
   * get/set fill radial gradient start point
   * @name Konva.Shape#fillRadialGradientStartPoint
   * @method
   * @param {Object} startPoint
   * @param {Number} startPoint.x
   * @param {Number} startPoint.y
   * @returns {Object}
   * @example
   * // get fill radial gradient start point
   * var startPoint = shape.fillRadialGradientStartPoint();
   *
   * // set fill radial gradient start point
   * shape.fillRadialGradientStartPoint({
   *   x: 20,
   *   y: 10
   * });
   */
  Factory.addGetterSetter(Shape, 'fillRadialGradientStartPointX', 0);
  /**
   * get/set fill radial gradient start point x
   * @name Konva.Shape#fillRadialGradientStartPointX
   * @method
   * @param {Number} x
   * @returns {Number}
   * @example
   * // get fill radial gradient start point x
   * var startPointX = shape.fillRadialGradientStartPointX();
   *
   * // set fill radial gradient start point x
   * shape.fillRadialGradientStartPointX(20);
   */
  Factory.addGetterSetter(Shape, 'fillRadialGradientStartPointY', 0);
  /**
   * get/set fill radial gradient start point y
   * @name Konva.Shape#fillRadialGradientStartPointY
   * @method
   * @param {Number} y
   * @returns {Number}
   * @example
   * // get fill radial gradient start point y
   * var startPointY = shape.fillRadialGradientStartPointY();
   *
   * // set fill radial gradient start point y
   * shape.fillRadialGradientStartPointY(20);
   */
  Factory.addComponentsGetterSetter(Shape, 'fillRadialGradientEndPoint', [
      'x',
      'y'
  ]);
  /**
   * get/set fill radial gradient end point
   * @name Konva.Shape#fillRadialGradientEndPoint
   * @method
   * @param {Object} endPoint
   * @param {Number} endPoint.x
   * @param {Number} endPoint.y
   * @returns {Object}
   * @example
   * // get fill radial gradient end point
   * var endPoint = shape.fillRadialGradientEndPoint();
   *
   * // set fill radial gradient end point
   * shape.fillRadialGradientEndPoint({
   *   x: 20,
   *   y: 10
   * });
   */
  Factory.addGetterSetter(Shape, 'fillRadialGradientEndPointX', 0);
  /**
   * get/set fill radial gradient end point x
   * @name Konva.Shape#fillRadialGradientEndPointX
   * @method
   * @param {Number} x
   * @returns {Number}
   * @example
   * // get fill radial gradient end point x
   * var endPointX = shape.fillRadialGradientEndPointX();
   *
   * // set fill radial gradient end point x
   * shape.fillRadialGradientEndPointX(20);
   */
  Factory.addGetterSetter(Shape, 'fillRadialGradientEndPointY', 0);
  /**
   * get/set fill radial gradient end point y
   * @name Konva.Shape#fillRadialGradientEndPointY
   * @method
   * @param {Number} y
   * @returns {Number}
   * @example
   * // get fill radial gradient end point y
   * var endPointY = shape.fillRadialGradientEndPointY();
   *
   * // set fill radial gradient end point y
   * shape.fillRadialGradientEndPointY(20);
   */
  Factory.addGetterSetter(Shape, 'fillPatternRotation', 0);
  /**
   * get/set fill pattern rotation in degrees
   * @name Konva.Shape#fillPatternRotation
   * @method
   * @param {Number} rotation
   * @returns {Konva.Shape}
   * @example
   * // get fill pattern rotation
   * var patternRotation = shape.fillPatternRotation();
   *
   * // set fill pattern rotation
   * shape.fillPatternRotation(20);
   */
  Factory.backCompat(Shape, {
      dashArray: 'dash',
      getDashArray: 'getDash',
      setDashArray: 'getDash',
      drawFunc: 'sceneFunc',
      getDrawFunc: 'getSceneFunc',
      setDrawFunc: 'setSceneFunc',
      drawHitFunc: 'hitFunc',
      getDrawHitFunc: 'getHitFunc',
      setDrawHitFunc: 'setHitFunc'
  });
  Collection.mapMethods(Shape);

  // constants
  var HASH$1 = '#', BEFORE_DRAW = 'beforeDraw', DRAW = 'draw', 
  /*
   * 2 - 3 - 4
   * |       |
   * 1 - 0   5
   *         |
   * 8 - 7 - 6
   */
  INTERSECTION_OFFSETS = [
      { x: 0, y: 0 },
      { x: -1, y: -1 },
      { x: 1, y: -1 },
      { x: 1, y: 1 },
      { x: -1, y: 1 } // 8
  ], INTERSECTION_OFFSETS_LEN = INTERSECTION_OFFSETS.length;
  /**
   * Layer constructor.  Layers are tied to their own canvas element and are used
   * to contain groups or shapes.
   * @constructor
   * @memberof Konva
   * @augments Konva.BaseLayer
   * @param {Object} config
   * @param {Boolean} [config.clearBeforeDraw] set this property to false if you don't want
   * to clear the canvas before each layer draw.  The default value is true.
   * @param {Number} [config.x]
     * @param {Number} [config.y]
     * @param {Number} [config.width]
     * @param {Number} [config.height]
     * @param {Boolean} [config.visible]
     * @param {Boolean} [config.listening] whether or not the node is listening for events
     * @param {String} [config.id] unique id
     * @param {String} [config.name] non-unique name
     * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
     * @param {Object} [config.scale] set scale
     * @param {Number} [config.scaleX] set scale x
     * @param {Number} [config.scaleY] set scale y
     * @param {Number} [config.rotation] rotation in degrees
     * @param {Object} [config.offset] offset from center point and rotation point
     * @param {Number} [config.offsetX] set offset x
     * @param {Number} [config.offsetY] set offset y
     * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
     *  the entire stage by dragging any portion of the stage
     * @param {Number} [config.dragDistance]
     * @param {Function} [config.dragBoundFunc]
   * * @param {Object} [config.clip] set clip
     * @param {Number} [config.clipX] set clip x
     * @param {Number} [config.clipY] set clip y
     * @param {Number} [config.clipWidth] set clip width
     * @param {Number} [config.clipHeight] set clip height
     * @param {Function} [config.clipFunc] set clip func

   * @example
   * var layer = new Konva.Layer();
   * stage.add(layer);
   * // now you can add shapes, groups into the layer
   */
  var Layer = /** @class */ (function (_super) {
      __extends(Layer, _super);
      function Layer() {
          var _this = _super !== null && _super.apply(this, arguments) || this;
          _this.hitCanvas = new HitCanvas({
              pixelRatio: 1
          });
          return _this;
      }
      Layer.prototype.setSize = function (_a) {
          var width = _a.width, height = _a.height;
          _super.prototype.setSize.call(this, { width: width, height: height });
          this.hitCanvas.setSize(width, height);
          return this;
      };
      Layer.prototype._validateAdd = function (child) {
          var type = child.getType();
          if (type !== 'Group' && type !== 'Shape') {
              Util.throw('You may only add groups and shapes to a layer.');
          }
      };
      /**
       * get visible intersection shape. This is the preferred
       * method for determining if a point intersects a shape or not
       * also you may pass optional selector parameter to return ancestor of intersected shape
       * @method
       * @name Konva.Layer#getIntersection
       * @param {Object} pos
       * @param {Number} pos.x
       * @param {Number} pos.y
       * @param {String} [selector]
       * @returns {Konva.Node}
       * @example
       * var shape = layer.getIntersection({x: 50, y: 50});
       * // or if you interested in shape parent:
       * var group = layer.getIntersection({x: 50, y: 50}, 'Group');
       */
      Layer.prototype.getIntersection = function (pos, selector) {
          var obj, i, intersectionOffset, shape;
          if (!this.hitGraphEnabled() || !this.isVisible()) {
              return null;
          }
          // in some cases antialiased area may be bigger than 1px
          // it is possible if we will cache node, then scale it a lot
          var spiralSearchDistance = 1;
          var continueSearch = false;
          while (true) {
              for (i = 0; i < INTERSECTION_OFFSETS_LEN; i++) {
                  intersectionOffset = INTERSECTION_OFFSETS[i];
                  obj = this._getIntersection({
                      x: pos.x + intersectionOffset.x * spiralSearchDistance,
                      y: pos.y + intersectionOffset.y * spiralSearchDistance
                  });
                  shape = obj.shape;
                  if (shape && selector) {
                      return shape.findAncestor(selector, true);
                  }
                  else if (shape) {
                      return shape;
                  }
                  // we should continue search if we found antialiased pixel
                  // that means our node somewhere very close
                  continueSearch = !!obj.antialiased;
                  // stop search if found empty pixel
                  if (!obj.antialiased) {
                      break;
                  }
              }
              // if no shape, and no antialiased pixel, we should end searching
              if (continueSearch) {
                  spiralSearchDistance += 1;
              }
              else {
                  return null;
              }
          }
      };
      Layer.prototype._getIntersection = function (pos) {
          var ratio = this.hitCanvas.pixelRatio;
          var p = this.hitCanvas.context.getImageData(Math.round(pos.x * ratio), Math.round(pos.y * ratio), 1, 1).data, p3 = p[3], colorKey, shape;
          // fully opaque pixel
          if (p3 === 255) {
              colorKey = Util._rgbToHex(p[0], p[1], p[2]);
              shape = shapes[HASH$1 + colorKey];
              if (shape) {
                  return {
                      shape: shape
                  };
              }
              return {
                  antialiased: true
              };
          }
          else if (p3 > 0) {
              // antialiased pixel
              return {
                  antialiased: true
              };
          }
          // empty pixel
          return {};
      };
      Layer.prototype.drawScene = function (can, top) {
          var layer = this.getLayer(), canvas = can || (layer && layer.getCanvas());
          this._fire(BEFORE_DRAW, {
              node: this
          });
          if (this.clearBeforeDraw()) {
              canvas.getContext().clear();
          }
          Container.prototype.drawScene.call(this, canvas, top);
          this._fire(DRAW, {
              node: this
          });
          return this;
      };
      Layer.prototype.drawHit = function (can, top) {
          var layer = this.getLayer(), canvas = can || (layer && layer.hitCanvas);
          if (layer && layer.clearBeforeDraw()) {
              layer
                  .getHitCanvas()
                  .getContext()
                  .clear();
          }
          Container.prototype.drawHit.call(this, canvas, top);
          return this;
      };
      Layer.prototype.clear = function (bounds) {
          BaseLayer.prototype.clear.call(this, bounds);
          this.getHitCanvas()
              .getContext()
              .clear(bounds);
          return this;
      };
      /**
       * enable hit graph
       * @name Konva.Layer#enableHitGraph
       * @method
       * @returns {Layer}
       */
      Layer.prototype.enableHitGraph = function () {
          this.hitGraphEnabled(true);
          return this;
      };
      /**
       * disable hit graph
       * @name Konva.Layer#disableHitGraph
       * @method
       * @returns {Layer}
       */
      Layer.prototype.disableHitGraph = function () {
          this.hitGraphEnabled(false);
          return this;
      };
      /**
       * Show or hide hit canvas over the stage. May be useful for debugging custom hitFunc
       * @name Konva.Layer#toggleHitCanvas
       * @method
       */
      Layer.prototype.toggleHitCanvas = function () {
          if (!this.parent) {
              return;
          }
          var parent = this.parent;
          var added = !!this.hitCanvas._canvas.parentNode;
          if (added) {
              parent.content.removeChild(this.hitCanvas._canvas);
          }
          else {
              parent.content.appendChild(this.hitCanvas._canvas);
          }
      };
      return Layer;
  }(BaseLayer));
  Layer.prototype.nodeType = 'Layer';
  _registerNode(Layer);
  Factory.addGetterSetter(Layer, 'hitGraphEnabled', true, getBooleanValidator());
  /**
   * get/set hitGraphEnabled flag.  Disabling the hit graph will greatly increase
   *  draw performance because the hit graph will not be redrawn each time the layer is
   *  drawn.  This, however, also disables mouse/touch event detection
   * @name Konva.Layer#hitGraphEnabled
   * @method
   * @param {Boolean} enabled
   * @returns {Boolean}
   * @example
   * // get hitGraphEnabled flag
   * var hitGraphEnabled = layer.hitGraphEnabled();
   *
   * // disable hit graph
   * layer.hitGraphEnabled(false);
   *
   * // enable hit graph
   * layer.hitGraphEnabled(true);
   */
  Collection.mapMethods(Layer);

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
   * * @param {Object} [config.clip] set clip
     * @param {Number} [config.clipX] set clip x
     * @param {Number} [config.clipY] set clip y
     * @param {Number} [config.clipWidth] set clip width
     * @param {Number} [config.clipHeight] set clip height
     * @param {Function} [config.clipFunc] set clip func

   * @example
   * var layer = new Konva.FastLayer();
   */
  var FastLayer = /** @class */ (function (_super) {
      __extends(FastLayer, _super);
      function FastLayer() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      FastLayer.prototype._validateAdd = function (child) {
          var type = child.getType();
          if (type !== 'Shape') {
              Util.throw('You may only add shapes to a fast layer.');
          }
      };
      FastLayer.prototype.hitGraphEnabled = function () {
          return false;
      };
      FastLayer.prototype.drawScene = function (can) {
          var layer = this.getLayer(), canvas = can || (layer && layer.getCanvas());
          if (this.clearBeforeDraw()) {
              canvas.getContext().clear();
          }
          Container.prototype.drawScene.call(this, canvas);
          return this;
      };
      FastLayer.prototype.draw = function () {
          this.drawScene();
          return this;
      };
      return FastLayer;
  }(BaseLayer));
  FastLayer.prototype.nodeType = 'FastLayer';
  _registerNode(FastLayer);
  Collection.mapMethods(FastLayer);

  /**
   * Group constructor.  Groups are used to contain shapes or other groups.
   * @constructor
   * @memberof Konva
   * @augments Konva.Container
   * @param {Object} config
   * @param {Number} [config.x]
     * @param {Number} [config.y]
     * @param {Number} [config.width]
     * @param {Number} [config.height]
     * @param {Boolean} [config.visible]
     * @param {Boolean} [config.listening] whether or not the node is listening for events
     * @param {String} [config.id] unique id
     * @param {String} [config.name] non-unique name
     * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
     * @param {Object} [config.scale] set scale
     * @param {Number} [config.scaleX] set scale x
     * @param {Number} [config.scaleY] set scale y
     * @param {Number} [config.rotation] rotation in degrees
     * @param {Object} [config.offset] offset from center point and rotation point
     * @param {Number} [config.offsetX] set offset x
     * @param {Number} [config.offsetY] set offset y
     * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
     *  the entire stage by dragging any portion of the stage
     * @param {Number} [config.dragDistance]
     * @param {Function} [config.dragBoundFunc]
   * * @param {Object} [config.clip] set clip
     * @param {Number} [config.clipX] set clip x
     * @param {Number} [config.clipY] set clip y
     * @param {Number} [config.clipWidth] set clip width
     * @param {Number} [config.clipHeight] set clip height
     * @param {Function} [config.clipFunc] set clip func

   * @example
   * var group = new Konva.Group();
   */
  var Group = /** @class */ (function (_super) {
      __extends(Group, _super);
      function Group() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      Group.prototype._validateAdd = function (child) {
          var type = child.getType();
          if (type !== 'Group' && type !== 'Shape') {
              Util.throw('You may only add groups and shapes to groups.');
          }
      };
      return Group;
  }(Container));
  Group.prototype.nodeType = 'Group';
  _registerNode(Group);
  Collection.mapMethods(Group);

  var now = (function () {
      if (glob.performance && glob.performance.now) {
          return function () {
              return glob.performance.now();
          };
      }
      return function () {
          return new Date().getTime();
      };
  })();
  /**
   * Animation constructor.
   * @constructor
   * @memberof Konva
   * @param {AnimationFn} func function executed on each animation frame.  The function is passed a frame object, which contains
   *  timeDiff, lastTime, time, and frameRate properties.  The timeDiff property is the number of milliseconds that have passed
   *  since the last animation frame. The time property is the time in milliseconds that elapsed from the moment the animation started
   *  to the current animation frame. The lastTime property is a `time` value from the previous frame.  The frameRate property is the current frame rate in frames / second.
   *  Return false from function, if you don't need to redraw layer/layers on some frames.
   * @param {Konva.Layer|Array} [layers] layer(s) to be redrawn on each animation frame. Can be a layer, an array of layers, or null.
   *  Not specifying a node will result in no redraw.
   * @example
   * // move a node to the right at 50 pixels / second
   * var velocity = 50;
   *
   * var anim = new Konva.Animation(function(frame) {
   *   var dist = velocity * (frame.timeDiff / 1000);
   *   node.move({x: dist, y: 0});
   * }, layer);
   *
   * anim.start();
   */
  var Animation = /** @class */ (function () {
      function Animation(func, layers) {
          this.id = Animation.animIdCounter++;
          this.frame = {
              time: 0,
              timeDiff: 0,
              lastTime: now(),
              frameRate: 0
          };
          this.func = func;
          this.setLayers(layers);
      }
      /**
       * set layers to be redrawn on each animation frame
       * @method
       * @name Konva.Animation#setLayers
       * @param {Konva.Layer|Array} [layers] layer(s) to be redrawn. Can be a layer, an array of layers, or null.  Not specifying a node will result in no redraw.
       * @return {Konva.Animation} this
       */
      Animation.prototype.setLayers = function (layers) {
          var lays = [];
          // if passing in no layers
          if (!layers) {
              lays = [];
          }
          else if (layers.length > 0) {
              // if passing in an array of Layers
              // NOTE: layers could be an array or Konva.Collection.  for simplicity, I'm just inspecting
              // the length property to check for both cases
              lays = layers;
          }
          else {
              // if passing in a Layer
              lays = [layers];
          }
          this.layers = lays;
          return this;
      };
      /**
       * get layers
       * @method
       * @name Konva.Animation#getLayers
       * @return {Array} Array of Konva.Layer
       */
      Animation.prototype.getLayers = function () {
          return this.layers;
      };
      /**
       * add layer.  Returns true if the layer was added, and false if it was not
       * @method
       * @name Konva.Animation#addLayer
       * @param {Konva.Layer} layer to add
       * @return {Bool} true if layer is added to animation, otherwise false
       */
      Animation.prototype.addLayer = function (layer) {
          var layers = this.layers, len = layers.length, n;
          // don't add the layer if it already exists
          for (n = 0; n < len; n++) {
              if (layers[n]._id === layer._id) {
                  return false;
              }
          }
          this.layers.push(layer);
          return true;
      };
      /**
       * determine if animation is running or not.  returns true or false
       * @method
       * @name Konva.Animation#isRunning
       * @return {Bool} is animation running?
       */
      Animation.prototype.isRunning = function () {
          var a = Animation, animations = a.animations, len = animations.length, n;
          for (n = 0; n < len; n++) {
              if (animations[n].id === this.id) {
                  return true;
              }
          }
          return false;
      };
      /**
       * start animation
       * @method
       * @name Konva.Animation#start
       * @return {Konva.Animation} this
       */
      Animation.prototype.start = function () {
          this.stop();
          this.frame.timeDiff = 0;
          this.frame.lastTime = now();
          Animation._addAnimation(this);
          return this;
      };
      /**
       * stop animation
       * @method
       * @name Konva.Animation#stop
       * @return {Konva.Animation} this
       */
      Animation.prototype.stop = function () {
          Animation._removeAnimation(this);
          return this;
      };
      Animation.prototype._updateFrameObject = function (time) {
          this.frame.timeDiff = time - this.frame.lastTime;
          this.frame.lastTime = time;
          this.frame.time += this.frame.timeDiff;
          this.frame.frameRate = 1000 / this.frame.timeDiff;
      };
      Animation._addAnimation = function (anim) {
          this.animations.push(anim);
          this._handleAnimation();
      };
      Animation._removeAnimation = function (anim) {
          var id = anim.id, animations = this.animations, len = animations.length, n;
          for (n = 0; n < len; n++) {
              if (animations[n].id === id) {
                  this.animations.splice(n, 1);
                  break;
              }
          }
      };
      Animation._runFrames = function () {
          var layerHash = {}, animations = this.animations, anim, layers, func, n, i, layersLen, layer, key, needRedraw;
          /*
           * loop through all animations and execute animation
           *  function.  if the animation object has specified node,
           *  we can add the node to the nodes hash to eliminate
           *  drawing the same node multiple times.  The node property
           *  can be the stage itself or a layer
           */
          /*
           * WARNING: don't cache animations.length because it could change while
           * the for loop is running, causing a JS error
           */
          for (n = 0; n < animations.length; n++) {
              anim = animations[n];
              layers = anim.layers;
              func = anim.func;
              anim._updateFrameObject(now());
              layersLen = layers.length;
              // if animation object has a function, execute it
              if (func) {
                  // allow anim bypassing drawing
                  needRedraw = func.call(anim, anim.frame) !== false;
              }
              else {
                  needRedraw = true;
              }
              if (!needRedraw) {
                  continue;
              }
              for (i = 0; i < layersLen; i++) {
                  layer = layers[i];
                  if (layer._id !== undefined) {
                      layerHash[layer._id] = layer;
                  }
              }
          }
          for (key in layerHash) {
              if (!layerHash.hasOwnProperty(key)) {
                  continue;
              }
              layerHash[key].draw();
          }
      };
      Animation._animationLoop = function () {
          var Anim = Animation;
          if (Anim.animations.length) {
              Anim._runFrames();
              requestAnimationFrame(Anim._animationLoop);
          }
          else {
              Anim.animRunning = false;
          }
      };
      Animation._handleAnimation = function () {
          if (!this.animRunning) {
              this.animRunning = true;
              requestAnimationFrame(this._animationLoop);
          }
      };
      Animation.animations = [];
      Animation.animIdCounter = 0;
      Animation.animRunning = false;
      return Animation;
  }());

  var blacklist = {
      node: 1,
      duration: 1,
      easing: 1,
      onFinish: 1,
      yoyo: 1
  }, PAUSED = 1, PLAYING = 2, REVERSING = 3, idCounter$1 = 0, colorAttrs = ['fill', 'stroke', 'shadowColor'];
  var TweenEngine = /** @class */ (function () {
      function TweenEngine(prop, propFunc, func, begin, finish, duration, yoyo) {
          this.prop = prop;
          this.propFunc = propFunc;
          this.begin = begin;
          this._pos = begin;
          this.duration = duration;
          this._change = 0;
          this.prevPos = 0;
          this.yoyo = yoyo;
          this._time = 0;
          this._position = 0;
          this._startTime = 0;
          this._finish = 0;
          this.func = func;
          this._change = finish - this.begin;
          this.pause();
      }
      TweenEngine.prototype.fire = function (str) {
          var handler = this[str];
          if (handler) {
              handler();
          }
      };
      TweenEngine.prototype.setTime = function (t) {
          if (t > this.duration) {
              if (this.yoyo) {
                  this._time = this.duration;
                  this.reverse();
              }
              else {
                  this.finish();
              }
          }
          else if (t < 0) {
              if (this.yoyo) {
                  this._time = 0;
                  this.play();
              }
              else {
                  this.reset();
              }
          }
          else {
              this._time = t;
              this.update();
          }
      };
      TweenEngine.prototype.getTime = function () {
          return this._time;
      };
      TweenEngine.prototype.setPosition = function (p) {
          this.prevPos = this._pos;
          this.propFunc(p);
          this._pos = p;
      };
      TweenEngine.prototype.getPosition = function (t) {
          if (t === undefined) {
              t = this._time;
          }
          return this.func(t, this.begin, this._change, this.duration);
      };
      TweenEngine.prototype.play = function () {
          this.state = PLAYING;
          this._startTime = this.getTimer() - this._time;
          this.onEnterFrame();
          this.fire('onPlay');
      };
      TweenEngine.prototype.reverse = function () {
          this.state = REVERSING;
          this._time = this.duration - this._time;
          this._startTime = this.getTimer() - this._time;
          this.onEnterFrame();
          this.fire('onReverse');
      };
      TweenEngine.prototype.seek = function (t) {
          this.pause();
          this._time = t;
          this.update();
          this.fire('onSeek');
      };
      TweenEngine.prototype.reset = function () {
          this.pause();
          this._time = 0;
          this.update();
          this.fire('onReset');
      };
      TweenEngine.prototype.finish = function () {
          this.pause();
          this._time = this.duration;
          this.update();
          this.fire('onFinish');
      };
      TweenEngine.prototype.update = function () {
          this.setPosition(this.getPosition(this._time));
      };
      TweenEngine.prototype.onEnterFrame = function () {
          var t = this.getTimer() - this._startTime;
          if (this.state === PLAYING) {
              this.setTime(t);
          }
          else if (this.state === REVERSING) {
              this.setTime(this.duration - t);
          }
      };
      TweenEngine.prototype.pause = function () {
          this.state = PAUSED;
          this.fire('onPause');
      };
      TweenEngine.prototype.getTimer = function () {
          return new Date().getTime();
      };
      return TweenEngine;
  }());
  /**
   * Tween constructor.  Tweens enable you to animate a node between the current state and a new state.
   *  You can play, pause, reverse, seek, reset, and finish tweens.  By default, tweens are animated using
   *  a linear easing.  For more tweening options, check out {@link Konva.Easings}
   * @constructor
   * @memberof Konva
   * @example
   * // instantiate new tween which fully rotates a node in 1 second
   * var tween = new Konva.Tween({
   *   node: node,
   *   rotationDeg: 360,
   *   duration: 1,
   *   easing: Konva.Easings.EaseInOut
   * });
   *
   * // play tween
   * tween.play();
   *
   * // pause tween
   * tween.pause();
   */
  var Tween = /** @class */ (function () {
      function Tween(config) {
          var that = this, node = config.node, nodeId = node._id, duration, easing = config.easing || Easings.Linear, yoyo = !!config.yoyo, key;
          if (typeof config.duration === 'undefined') {
              duration = 0.3;
          }
          else if (config.duration === 0) {
              // zero is bad value for duration
              duration = 0.001;
          }
          else {
              duration = config.duration;
          }
          this.node = node;
          this._id = idCounter$1++;
          var layers = node.getLayer() ||
              (node instanceof Konva['Stage'] ? node.getLayers() : null);
          if (!layers) {
              Util.error('Tween constructor have `node` that is not in a layer. Please add node into layer first.');
          }
          this.anim = new Animation(function () {
              that.tween.onEnterFrame();
          }, layers);
          this.tween = new TweenEngine(key, function (i) {
              that._tweenFunc(i);
          }, easing, 0, 1, duration * 1000, yoyo);
          this._addListeners();
          // init attrs map
          if (!Tween.attrs[nodeId]) {
              Tween.attrs[nodeId] = {};
          }
          if (!Tween.attrs[nodeId][this._id]) {
              Tween.attrs[nodeId][this._id] = {};
          }
          // init tweens map
          if (!Tween.tweens[nodeId]) {
              Tween.tweens[nodeId] = {};
          }
          for (key in config) {
              if (blacklist[key] === undefined) {
                  this._addAttr(key, config[key]);
              }
          }
          this.reset();
          // callbacks
          this.onFinish = config.onFinish;
          this.onReset = config.onReset;
      }
      Tween.prototype._addAttr = function (key, end) {
          var node = this.node, nodeId = node._id, start, diff, tweenId, n, len, trueEnd, trueStart, endRGBA;
          // remove conflict from tween map if it exists
          tweenId = Tween.tweens[nodeId][key];
          if (tweenId) {
              delete Tween.attrs[nodeId][tweenId][key];
          }
          // add to tween map
          start = node.getAttr(key);
          if (Util._isArray(end)) {
              diff = [];
              len = Math.max(end.length, start.length);
              if (key === 'points' && end.length !== start.length) {
                  // before tweening points we need to make sure that start.length === end.length
                  // Util._prepareArrayForTween thinking that end.length > start.length
                  if (end.length > start.length) {
                      // so in this case we will increase number of starting points
                      trueStart = start;
                      start = Util._prepareArrayForTween(start, end, node.closed());
                  }
                  else {
                      // in this case we will increase number of eding points
                      trueEnd = end;
                      end = Util._prepareArrayForTween(end, start, node.closed());
                  }
              }
              if (key.indexOf('fill') === 0) {
                  for (n = 0; n < len; n++) {
                      if (n % 2 === 0) {
                          diff.push(end[n] - start[n]);
                      }
                      else {
                          var startRGBA = Util.colorToRGBA(start[n]);
                          endRGBA = Util.colorToRGBA(end[n]);
                          start[n] = startRGBA;
                          diff.push({
                              r: endRGBA.r - startRGBA.r,
                              g: endRGBA.g - startRGBA.g,
                              b: endRGBA.b - startRGBA.b,
                              a: endRGBA.a - startRGBA.a
                          });
                      }
                  }
              }
              else {
                  for (n = 0; n < len; n++) {
                      diff.push(end[n] - start[n]);
                  }
              }
          }
          else if (colorAttrs.indexOf(key) !== -1) {
              start = Util.colorToRGBA(start);
              endRGBA = Util.colorToRGBA(end);
              diff = {
                  r: endRGBA.r - start.r,
                  g: endRGBA.g - start.g,
                  b: endRGBA.b - start.b,
                  a: endRGBA.a - start.a
              };
          }
          else {
              diff = end - start;
          }
          Tween.attrs[nodeId][this._id][key] = {
              start: start,
              diff: diff,
              end: end,
              trueEnd: trueEnd,
              trueStart: trueStart
          };
          Tween.tweens[nodeId][key] = this._id;
      };
      Tween.prototype._tweenFunc = function (i) {
          var node = this.node, attrs = Tween.attrs[node._id][this._id], key, attr, start, diff, newVal, n, len, end;
          for (key in attrs) {
              attr = attrs[key];
              start = attr.start;
              diff = attr.diff;
              end = attr.end;
              if (Util._isArray(start)) {
                  newVal = [];
                  len = Math.max(start.length, end.length);
                  if (key.indexOf('fill') === 0) {
                      for (n = 0; n < len; n++) {
                          if (n % 2 === 0) {
                              newVal.push((start[n] || 0) + diff[n] * i);
                          }
                          else {
                              newVal.push('rgba(' +
                                  Math.round(start[n].r + diff[n].r * i) +
                                  ',' +
                                  Math.round(start[n].g + diff[n].g * i) +
                                  ',' +
                                  Math.round(start[n].b + diff[n].b * i) +
                                  ',' +
                                  (start[n].a + diff[n].a * i) +
                                  ')');
                          }
                      }
                  }
                  else {
                      for (n = 0; n < len; n++) {
                          newVal.push((start[n] || 0) + diff[n] * i);
                      }
                  }
              }
              else if (colorAttrs.indexOf(key) !== -1) {
                  newVal =
                      'rgba(' +
                          Math.round(start.r + diff.r * i) +
                          ',' +
                          Math.round(start.g + diff.g * i) +
                          ',' +
                          Math.round(start.b + diff.b * i) +
                          ',' +
                          (start.a + diff.a * i) +
                          ')';
              }
              else {
                  newVal = start + diff * i;
              }
              node.setAttr(key, newVal);
          }
      };
      Tween.prototype._addListeners = function () {
          var _this = this;
          // start listeners
          this.tween.onPlay = function () {
              _this.anim.start();
          };
          this.tween.onReverse = function () {
              _this.anim.start();
          };
          // stop listeners
          this.tween.onPause = function () {
              _this.anim.stop();
          };
          this.tween.onFinish = function () {
              var node = _this.node;
              // after tweening  points of line we need to set original end
              var attrs = Tween.attrs[node._id][_this._id];
              if (attrs.points && attrs.points.trueEnd) {
                  node.setAttr('points', attrs.points.trueEnd);
              }
              if (_this.onFinish) {
                  _this.onFinish.call(_this);
              }
          };
          this.tween.onReset = function () {
              var node = _this.node;
              // after tweening  points of line we need to set original start
              var attrs = Tween.attrs[node._id][_this._id];
              if (attrs.points && attrs.points.trueStart) {
                  node.points(attrs.points.trueStart);
              }
              if (_this.onReset) {
                  _this.onReset();
              }
          };
      };
      /**
       * play
       * @method
       * @name Konva.Tween#play
       * @returns {Tween}
       */
      Tween.prototype.play = function () {
          this.tween.play();
          return this;
      };
      /**
       * reverse
       * @method
       * @name Konva.Tween#reverse
       * @returns {Tween}
       */
      Tween.prototype.reverse = function () {
          this.tween.reverse();
          return this;
      };
      /**
       * reset
       * @method
       * @name Konva.Tween#reset
       * @returns {Tween}
       */
      Tween.prototype.reset = function () {
          this.tween.reset();
          return this;
      };
      /**
       * seek
       * @method
       * @name Konva.Tween#seek(
       * @param {Integer} t time in seconds between 0 and the duration
       * @returns {Tween}
       */
      Tween.prototype.seek = function (t) {
          this.tween.seek(t * 1000);
          return this;
      };
      /**
       * pause
       * @method
       * @name Konva.Tween#pause
       * @returns {Tween}
       */
      Tween.prototype.pause = function () {
          this.tween.pause();
          return this;
      };
      /**
       * finish
       * @method
       * @name Konva.Tween#finish
       * @returns {Tween}
       */
      Tween.prototype.finish = function () {
          this.tween.finish();
          return this;
      };
      /**
       * destroy
       * @method
       * @name Konva.Tween#destroy
       */
      Tween.prototype.destroy = function () {
          var nodeId = this.node._id, thisId = this._id, attrs = Tween.tweens[nodeId], key;
          this.pause();
          for (key in attrs) {
              delete Tween.tweens[nodeId][key];
          }
          delete Tween.attrs[nodeId][thisId];
      };
      Tween.attrs = {};
      Tween.tweens = {};
      return Tween;
  }());
  /**
   * Tween node properties. Shorter usage of {@link Konva.Tween} object.
   *
   * @method Konva.Node#to
   * @param {Object} [params] tween params
   * @example
   *
   * circle.to({
   *   x : 50,
   *   duration : 0.5,
   *   onFinish: () => {
   *      console.log('finished');
   *   }
   * });
   */
  Node.prototype.to = function (params) {
      var onFinish = params.onFinish;
      params.node = this;
      params.onFinish = function () {
          this.destroy();
          if (onFinish) {
              onFinish();
          }
      };
      var tween = new Tween(params);
      tween.play();
  };
  /*
   * These eases were ported from an Adobe Flash tweening library to JavaScript
   * by Xaric
   */
  /**
   * @namespace Easings
   * @memberof Konva
   */
  var Easings = {
      /**
       * back ease in
       * @function
       * @memberof Konva.Easings
       */
      BackEaseIn: function (t, b, c, d) {
          var s = 1.70158;
          return c * (t /= d) * t * ((s + 1) * t - s) + b;
      },
      /**
       * back ease out
       * @function
       * @memberof Konva.Easings
       */
      BackEaseOut: function (t, b, c, d) {
          var s = 1.70158;
          return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
      },
      /**
       * back ease in out
       * @function
       * @memberof Konva.Easings
       */
      BackEaseInOut: function (t, b, c, d) {
          var s = 1.70158;
          if ((t /= d / 2) < 1) {
              return (c / 2) * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
          }
          return (c / 2) * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
      },
      /**
       * elastic ease in
       * @function
       * @memberof Konva.Easings
       */
      ElasticEaseIn: function (t, b, c, d, a, p) {
          // added s = 0
          var s = 0;
          if (t === 0) {
              return b;
          }
          if ((t /= d) === 1) {
              return b + c;
          }
          if (!p) {
              p = d * 0.3;
          }
          if (!a || a < Math.abs(c)) {
              a = c;
              s = p / 4;
          }
          else {
              s = (p / (2 * Math.PI)) * Math.asin(c / a);
          }
          return (-(a *
              Math.pow(2, 10 * (t -= 1)) *
              Math.sin(((t * d - s) * (2 * Math.PI)) / p)) + b);
      },
      /**
       * elastic ease out
       * @function
       * @memberof Konva.Easings
       */
      ElasticEaseOut: function (t, b, c, d, a, p) {
          // added s = 0
          var s = 0;
          if (t === 0) {
              return b;
          }
          if ((t /= d) === 1) {
              return b + c;
          }
          if (!p) {
              p = d * 0.3;
          }
          if (!a || a < Math.abs(c)) {
              a = c;
              s = p / 4;
          }
          else {
              s = (p / (2 * Math.PI)) * Math.asin(c / a);
          }
          return (a * Math.pow(2, -10 * t) * Math.sin(((t * d - s) * (2 * Math.PI)) / p) +
              c +
              b);
      },
      /**
       * elastic ease in out
       * @function
       * @memberof Konva.Easings
       */
      ElasticEaseInOut: function (t, b, c, d, a, p) {
          // added s = 0
          var s = 0;
          if (t === 0) {
              return b;
          }
          if ((t /= d / 2) === 2) {
              return b + c;
          }
          if (!p) {
              p = d * (0.3 * 1.5);
          }
          if (!a || a < Math.abs(c)) {
              a = c;
              s = p / 4;
          }
          else {
              s = (p / (2 * Math.PI)) * Math.asin(c / a);
          }
          if (t < 1) {
              return (-0.5 *
                  (a *
                      Math.pow(2, 10 * (t -= 1)) *
                      Math.sin(((t * d - s) * (2 * Math.PI)) / p)) +
                  b);
          }
          return (a *
              Math.pow(2, -10 * (t -= 1)) *
              Math.sin(((t * d - s) * (2 * Math.PI)) / p) *
              0.5 +
              c +
              b);
      },
      /**
       * bounce ease out
       * @function
       * @memberof Konva.Easings
       */
      BounceEaseOut: function (t, b, c, d) {
          if ((t /= d) < 1 / 2.75) {
              return c * (7.5625 * t * t) + b;
          }
          else if (t < 2 / 2.75) {
              return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
          }
          else if (t < 2.5 / 2.75) {
              return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
          }
          else {
              return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
          }
      },
      /**
       * bounce ease in
       * @function
       * @memberof Konva.Easings
       */
      BounceEaseIn: function (t, b, c, d) {
          return c - Easings.BounceEaseOut(d - t, 0, c, d) + b;
      },
      /**
       * bounce ease in out
       * @function
       * @memberof Konva.Easings
       */
      BounceEaseInOut: function (t, b, c, d) {
          if (t < d / 2) {
              return Easings.BounceEaseIn(t * 2, 0, c, d) * 0.5 + b;
          }
          else {
              return Easings.BounceEaseOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
          }
      },
      /**
       * ease in
       * @function
       * @memberof Konva.Easings
       */
      EaseIn: function (t, b, c, d) {
          return c * (t /= d) * t + b;
      },
      /**
       * ease out
       * @function
       * @memberof Konva.Easings
       */
      EaseOut: function (t, b, c, d) {
          return -c * (t /= d) * (t - 2) + b;
      },
      /**
       * ease in out
       * @function
       * @memberof Konva.Easings
       */
      EaseInOut: function (t, b, c, d) {
          if ((t /= d / 2) < 1) {
              return (c / 2) * t * t + b;
          }
          return (-c / 2) * (--t * (t - 2) - 1) + b;
      },
      /**
       * strong ease in
       * @function
       * @memberof Konva.Easings
       */
      StrongEaseIn: function (t, b, c, d) {
          return c * (t /= d) * t * t * t * t + b;
      },
      /**
       * strong ease out
       * @function
       * @memberof Konva.Easings
       */
      StrongEaseOut: function (t, b, c, d) {
          return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
      },
      /**
       * strong ease in out
       * @function
       * @memberof Konva.Easings
       */
      StrongEaseInOut: function (t, b, c, d) {
          if ((t /= d / 2) < 1) {
              return (c / 2) * t * t * t * t * t + b;
          }
          return (c / 2) * ((t -= 2) * t * t * t * t + 2) + b;
      },
      /**
       * linear
       * @function
       * @memberof Konva.Easings
       */
      Linear: function (t, b, c, d) {
          return (c * t) / d + b;
      }
  };

  // what is core parts of Konva?
  var Konva$1 = Util._assign(Konva, {
      Collection: Collection,
      Util: Util,
      Transform: Transform,
      Node: Node,
      ids: ids,
      names: names,
      Container: Container,
      Stage: Stage,
      stages: stages,
      Layer: Layer,
      FastLayer: FastLayer,
      Group: Group,
      DD: DD,
      Shape: Shape,
      shapes: shapes,
      Animation: Animation,
      Tween: Tween,
      Easings: Easings,
      Context: Context,
      Canvas: Canvas
  });

  /**
   * Arc constructor
   * @constructor
   * @memberof Konva
   * @augments Konva.Shape
   * @param {Object} config
   * @param {Number} config.angle in degrees
   * @param {Number} config.innerRadius
   * @param {Number} config.outerRadius
   * @param {Boolean} [config.clockwise]
   * @param {String} [config.fill] fill color
     * @param {Image} [config.fillPatternImage] fill pattern image
     * @param {Number} [config.fillPatternX]
     * @param {Number} [config.fillPatternY]
     * @param {Object} [config.fillPatternOffset] object with x and y component
     * @param {Number} [config.fillPatternOffsetX] 
     * @param {Number} [config.fillPatternOffsetY] 
     * @param {Object} [config.fillPatternScale] object with x and y component
     * @param {Number} [config.fillPatternScaleX]
     * @param {Number} [config.fillPatternScaleY]
     * @param {Number} [config.fillPatternRotation]
     * @param {String} [config.fillPatternRepeat] can be "repeat", "repeat-x", "repeat-y", or "no-repeat".  The default is "no-repeat"
     * @param {Object} [config.fillLinearGradientStartPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientStartPointX]
     * @param {Number} [config.fillLinearGradientStartPointY]
     * @param {Object} [config.fillLinearGradientEndPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientEndPointX]
     * @param {Number} [config.fillLinearGradientEndPointY]
     * @param {Array} [config.fillLinearGradientColorStops] array of color stops
     * @param {Object} [config.fillRadialGradientStartPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientStartPointX]
     * @param {Number} [config.fillRadialGradientStartPointY]
     * @param {Object} [config.fillRadialGradientEndPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientEndPointX] 
     * @param {Number} [config.fillRadialGradientEndPointY] 
     * @param {Number} [config.fillRadialGradientStartRadius]
     * @param {Number} [config.fillRadialGradientEndRadius]
     * @param {Array} [config.fillRadialGradientColorStops] array of color stops
     * @param {Boolean} [config.fillEnabled] flag which enables or disables the fill.  The default value is true
     * @param {String} [config.fillPriority] can be color, linear-gradient, radial-graident, or pattern.  The default value is color.  The fillPriority property makes it really easy to toggle between different fill types.  For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
     * @param {String} [config.stroke] stroke color
     * @param {Number} [config.strokeWidth] stroke width
     * @param {Number} [config.hitStrokeWidth] size of the stroke on hit canvas.  The default is "auto" - equals to strokeWidth
     * @param {Boolean} [config.strokeHitEnabled] flag which enables or disables stroke hit region.  The default is true
     * @param {Boolean} [config.perfectDrawEnabled] flag which enables or disables using buffer canvas.  The default is true
     * @param {Boolean} [config.shadowForStrokeEnabled] flag which enables or disables shadow for stroke.  The default is true
     * @param {Boolean} [config.strokeScaleEnabled] flag which enables or disables stroke scale.  The default is true
     * @param {Boolean} [config.strokeEnabled] flag which enables or disables the stroke.  The default value is true
     * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
     *  is miter
     * @param {String} [config.lineCap] can be butt, round, or square.  The default
     *  is butt
     * @param {String} [config.shadowColor]
     * @param {Number} [config.shadowBlur]
     * @param {Object} [config.shadowOffset] object with x and y component
     * @param {Number} [config.shadowOffsetX]
     * @param {Number} [config.shadowOffsetY]
     * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
     *  between 0 and 1
     * @param {Boolean} [config.shadowEnabled] flag which enables or disables the shadow.  The default value is true
     * @param {Array} [config.dash]
     * @param {Boolean} [config.dashEnabled] flag which enables or disables the dashArray.  The default value is true

   * @param {Number} [config.x]
     * @param {Number} [config.y]
     * @param {Number} [config.width]
     * @param {Number} [config.height]
     * @param {Boolean} [config.visible]
     * @param {Boolean} [config.listening] whether or not the node is listening for events
     * @param {String} [config.id] unique id
     * @param {String} [config.name] non-unique name
     * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
     * @param {Object} [config.scale] set scale
     * @param {Number} [config.scaleX] set scale x
     * @param {Number} [config.scaleY] set scale y
     * @param {Number} [config.rotation] rotation in degrees
     * @param {Object} [config.offset] offset from center point and rotation point
     * @param {Number} [config.offsetX] set offset x
     * @param {Number} [config.offsetY] set offset y
     * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
     *  the entire stage by dragging any portion of the stage
     * @param {Number} [config.dragDistance]
     * @param {Function} [config.dragBoundFunc]
   * @example
   * // draw a Arc that's pointing downwards
   * var arc = new Konva.Arc({
   *   innerRadius: 40,
   *   outerRadius: 80,
   *   fill: 'red',
   *   stroke: 'black'
   *   strokeWidth: 5,
   *   angle: 60,
   *   rotationDeg: -120
   * });
   */
  var Arc = /** @class */ (function (_super) {
      __extends(Arc, _super);
      function Arc() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      Arc.prototype._sceneFunc = function (context) {
          var angle = Konva.getAngle(this.angle()), clockwise = this.clockwise();
          context.beginPath();
          context.arc(0, 0, this.outerRadius(), 0, angle, clockwise);
          context.arc(0, 0, this.innerRadius(), angle, 0, !clockwise);
          context.closePath();
          context.fillStrokeShape(this);
      };
      Arc.prototype.getWidth = function () {
          return this.outerRadius() * 2;
      };
      Arc.prototype.getHeight = function () {
          return this.outerRadius() * 2;
      };
      Arc.prototype.setWidth = function (width) {
          this.outerRadius(width / 2);
      };
      Arc.prototype.setHeight = function (height) {
          this.outerRadius(height / 2);
      };
      return Arc;
  }(Shape));
  Arc.prototype._centroid = true;
  Arc.prototype.className = 'Arc';
  Arc.prototype._attrsAffectingSize = ['innerRadius', 'outerRadius'];
  _registerNode(Arc);
  // add getters setters
  Factory.addGetterSetter(Arc, 'innerRadius', 0, getNumberValidator());
  /**
   * get/set innerRadius
   * @name Konva.Arc#innerRadius
   * @method
   * @param {Number} innerRadius
   * @returns {Number}
   * @example
   * // get inner radius
   * var innerRadius = arc.innerRadius();
   *
   * // set inner radius
   * arc.innerRadius(20);
   */
  Factory.addGetterSetter(Arc, 'outerRadius', 0, getNumberValidator());
  /**
   * get/set outerRadius
   * @name Konva.Arc#outerRadius
   * @method
   * @param {Number} outerRadius
   * @returns {Number}
   * @example
   * // get outer radius
   * var outerRadius = arc.outerRadius();
   *
   * // set outer radius
   * arc.outerRadius(20);
   */
  Factory.addGetterSetter(Arc, 'angle', 0, getNumberValidator());
  /**
   * get/set angle in degrees
   * @name Konva.Arc#angle
   * @method
   * @param {Number} angle
   * @returns {Number}
   * @example
   * // get angle
   * var angle = arc.angle();
   *
   * // set angle
   * arc.angle(20);
   */
  Factory.addGetterSetter(Arc, 'clockwise', false, getBooleanValidator());
  /**
   * get/set clockwise flag
   * @name Konva.Arc#clockwise
   * @method
   * @param {Boolean} clockwise
   * @returns {Boolean}
   * @example
   * // get clockwise flag
   * var clockwise = arc.clockwise();
   *
   * // draw arc counter-clockwise
   * arc.clockwise(false);
   *
   * // draw arc clockwise
   * arc.clockwise(true);
   */
  Collection.mapMethods(Arc);

  /**
   * Line constructor.&nbsp; Lines are defined by an array of points and
   *  a tension
   * @constructor
   * @memberof Konva
   * @augments Konva.Shape
   * @param {Object} config
   * @param {Array} config.points Flat array of points coordinates. You should define them as [x1, y1, x2, y2, x3, y3].
   * @param {Number} [config.tension] Higher values will result in a more curvy line.  A value of 0 will result in no interpolation.
   *   The default is 0
   * @param {Boolean} [config.closed] defines whether or not the line shape is closed, creating a polygon or blob
   * @param {Boolean} [config.bezier] if no tension is provided but bezier=true, we draw the line as a bezier using the passed points
   * @param {String} [config.fill] fill color
     * @param {Image} [config.fillPatternImage] fill pattern image
     * @param {Number} [config.fillPatternX]
     * @param {Number} [config.fillPatternY]
     * @param {Object} [config.fillPatternOffset] object with x and y component
     * @param {Number} [config.fillPatternOffsetX] 
     * @param {Number} [config.fillPatternOffsetY] 
     * @param {Object} [config.fillPatternScale] object with x and y component
     * @param {Number} [config.fillPatternScaleX]
     * @param {Number} [config.fillPatternScaleY]
     * @param {Number} [config.fillPatternRotation]
     * @param {String} [config.fillPatternRepeat] can be "repeat", "repeat-x", "repeat-y", or "no-repeat".  The default is "no-repeat"
     * @param {Object} [config.fillLinearGradientStartPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientStartPointX]
     * @param {Number} [config.fillLinearGradientStartPointY]
     * @param {Object} [config.fillLinearGradientEndPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientEndPointX]
     * @param {Number} [config.fillLinearGradientEndPointY]
     * @param {Array} [config.fillLinearGradientColorStops] array of color stops
     * @param {Object} [config.fillRadialGradientStartPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientStartPointX]
     * @param {Number} [config.fillRadialGradientStartPointY]
     * @param {Object} [config.fillRadialGradientEndPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientEndPointX] 
     * @param {Number} [config.fillRadialGradientEndPointY] 
     * @param {Number} [config.fillRadialGradientStartRadius]
     * @param {Number} [config.fillRadialGradientEndRadius]
     * @param {Array} [config.fillRadialGradientColorStops] array of color stops
     * @param {Boolean} [config.fillEnabled] flag which enables or disables the fill.  The default value is true
     * @param {String} [config.fillPriority] can be color, linear-gradient, radial-graident, or pattern.  The default value is color.  The fillPriority property makes it really easy to toggle between different fill types.  For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
     * @param {String} [config.stroke] stroke color
     * @param {Number} [config.strokeWidth] stroke width
     * @param {Number} [config.hitStrokeWidth] size of the stroke on hit canvas.  The default is "auto" - equals to strokeWidth
     * @param {Boolean} [config.strokeHitEnabled] flag which enables or disables stroke hit region.  The default is true
     * @param {Boolean} [config.perfectDrawEnabled] flag which enables or disables using buffer canvas.  The default is true
     * @param {Boolean} [config.shadowForStrokeEnabled] flag which enables or disables shadow for stroke.  The default is true
     * @param {Boolean} [config.strokeScaleEnabled] flag which enables or disables stroke scale.  The default is true
     * @param {Boolean} [config.strokeEnabled] flag which enables or disables the stroke.  The default value is true
     * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
     *  is miter
     * @param {String} [config.lineCap] can be butt, round, or square.  The default
     *  is butt
     * @param {String} [config.shadowColor]
     * @param {Number} [config.shadowBlur]
     * @param {Object} [config.shadowOffset] object with x and y component
     * @param {Number} [config.shadowOffsetX]
     * @param {Number} [config.shadowOffsetY]
     * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
     *  between 0 and 1
     * @param {Boolean} [config.shadowEnabled] flag which enables or disables the shadow.  The default value is true
     * @param {Array} [config.dash]
     * @param {Boolean} [config.dashEnabled] flag which enables or disables the dashArray.  The default value is true

   * @param {Number} [config.x]
     * @param {Number} [config.y]
     * @param {Number} [config.width]
     * @param {Number} [config.height]
     * @param {Boolean} [config.visible]
     * @param {Boolean} [config.listening] whether or not the node is listening for events
     * @param {String} [config.id] unique id
     * @param {String} [config.name] non-unique name
     * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
     * @param {Object} [config.scale] set scale
     * @param {Number} [config.scaleX] set scale x
     * @param {Number} [config.scaleY] set scale y
     * @param {Number} [config.rotation] rotation in degrees
     * @param {Object} [config.offset] offset from center point and rotation point
     * @param {Number} [config.offsetX] set offset x
     * @param {Number} [config.offsetY] set offset y
     * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
     *  the entire stage by dragging any portion of the stage
     * @param {Number} [config.dragDistance]
     * @param {Function} [config.dragBoundFunc]
   * @example
   * var line = new Konva.Line({
   *   x: 100,
   *   y: 50,
   *   points: [73, 70, 340, 23, 450, 60, 500, 20],
   *   stroke: 'red',
   *   tension: 1
   * });
   */
  var Line = /** @class */ (function (_super) {
      __extends(Line, _super);
      function Line(config) {
          var _this = _super.call(this, config) || this;
          _this.on('pointsChange.konva tensionChange.konva closedChange.konva bezierChange.konva', function () {
              this._clearCache('tensionPoints');
          });
          return _this;
      }
      Line.prototype._sceneFunc = function (context) {
          var points = this.points(), length = points.length, tension = this.tension(), closed = this.closed(), bezier = this.bezier(), tp, len, n;
          if (!length) {
              return;
          }
          context.beginPath();
          context.moveTo(points[0], points[1]);
          // tension
          if (tension !== 0 && length > 4) {
              tp = this.getTensionPoints();
              len = tp.length;
              n = closed ? 0 : 4;
              if (!closed) {
                  context.quadraticCurveTo(tp[0], tp[1], tp[2], tp[3]);
              }
              while (n < len - 2) {
                  context.bezierCurveTo(tp[n++], tp[n++], tp[n++], tp[n++], tp[n++], tp[n++]);
              }
              if (!closed) {
                  context.quadraticCurveTo(tp[len - 2], tp[len - 1], points[length - 2], points[length - 1]);
              }
          }
          else if (bezier) {
              // no tension but bezier
              n = 2;
              while (n < length) {
                  context.bezierCurveTo(points[n++], points[n++], points[n++], points[n++], points[n++], points[n++]);
              }
          }
          else {
              // no tension
              for (n = 2; n < length; n += 2) {
                  context.lineTo(points[n], points[n + 1]);
              }
          }
          // closed e.g. polygons and blobs
          if (closed) {
              context.closePath();
              context.fillStrokeShape(this);
          }
          else {
              // open e.g. lines and splines
              context.strokeShape(this);
          }
      };
      Line.prototype.getTensionPoints = function () {
          return this._getCache('tensionPoints', this._getTensionPoints);
      };
      Line.prototype._getTensionPoints = function () {
          if (this.closed()) {
              return this._getTensionPointsClosed();
          }
          else {
              return Util._expandPoints(this.points(), this.tension());
          }
      };
      Line.prototype._getTensionPointsClosed = function () {
          var p = this.points(), len = p.length, tension = this.tension(), firstControlPoints = Util._getControlPoints(p[len - 2], p[len - 1], p[0], p[1], p[2], p[3], tension), lastControlPoints = Util._getControlPoints(p[len - 4], p[len - 3], p[len - 2], p[len - 1], p[0], p[1], tension), middle = Util._expandPoints(p, tension), tp = [firstControlPoints[2], firstControlPoints[3]]
              .concat(middle)
              .concat([
              lastControlPoints[0],
              lastControlPoints[1],
              p[len - 2],
              p[len - 1],
              lastControlPoints[2],
              lastControlPoints[3],
              firstControlPoints[0],
              firstControlPoints[1],
              p[0],
              p[1]
          ]);
          return tp;
      };
      Line.prototype.getWidth = function () {
          return this.getSelfRect().width;
      };
      Line.prototype.getHeight = function () {
          return this.getSelfRect().height;
      };
      // overload size detection
      Line.prototype.getSelfRect = function () {
          var points = this.points();
          if (points.length < 4) {
              return {
                  x: points[0] || 0,
                  y: points[1] || 0,
                  width: 0,
                  height: 0
              };
          }
          if (this.tension() !== 0) {
              points = __spreadArrays([
                  points[0],
                  points[1]
              ], this._getTensionPoints(), [
                  points[points.length - 2],
                  points[points.length - 1]
              ]);
          }
          else {
              points = this.points();
          }
          var minX = points[0];
          var maxX = points[0];
          var minY = points[1];
          var maxY = points[1];
          var x, y;
          for (var i = 0; i < points.length / 2; i++) {
              x = points[i * 2];
              y = points[i * 2 + 1];
              minX = Math.min(minX, x);
              maxX = Math.max(maxX, x);
              minY = Math.min(minY, y);
              maxY = Math.max(maxY, y);
          }
          return {
              x: minX,
              y: minY,
              width: maxX - minX,
              height: maxY - minY
          };
      };
      return Line;
  }(Shape));
  Line.prototype.className = 'Line';
  Line.prototype._attrsAffectingSize = ['points', 'bezier', 'tension'];
  _registerNode(Line);
  // add getters setters
  Factory.addGetterSetter(Line, 'closed', false);
  /**
   * get/set closed flag.  The default is false
   * @name Konva.Line#closed
   * @method
   * @param {Boolean} closed
   * @returns {Boolean}
   * @example
   * // get closed flag
   * var closed = line.closed();
   *
   * // close the shape
   * line.closed(true);
   *
   * // open the shape
   * line.closed(false);
   */
  Factory.addGetterSetter(Line, 'bezier', false);
  /**
   * get/set bezier flag.  The default is false
   * @name Konva.Line#bezier
   * @method
   * @param {Boolean} bezier
   * @returns {Boolean}
   * @example
   * // get whether the line is a bezier
   * var isBezier = line.bezier();
   *
   * // set whether the line is a bezier
   * line.bezier(true);
   */
  Factory.addGetterSetter(Line, 'tension', 0, getNumberValidator());
  /**
   * get/set tension
   * @name Konva.Line#tension
   * @method
   * @param {Number} tension Higher values will result in a more curvy line.  A value of 0 will result in no interpolation. The default is 0
   * @returns {Number}
   * @example
   * // get tension
   * var tension = line.tension();
   *
   * // set tension
   * line.tension(3);
   */
  Factory.addGetterSetter(Line, 'points', [], getNumberArrayValidator());
  /**
   * get/set points array. Points is a flat array [x1, y1, x2, y2]. It is flat for performance reasons.
   * @name Konva.Line#points
   * @method
   * @param {Array} points
   * @returns {Array}
   * @example
   * // get points
   * var points = line.points();
   *
   * // set points
   * line.points([10, 20, 30, 40, 50, 60]);
   *
   * // push a new point
   * line.points(line.points().concat([70, 80]));
   */
  Collection.mapMethods(Line);

  /**
   * Arrow constructor
   * @constructor
   * @memberof Konva
   * @augments Konva.Line
   * @param {Object} config
   * @param {Array} config.points Flat array of points coordinates. You should define them as [x1, y1, x2, y2, x3, y3].
   * @param {Number} [config.tension] Higher values will result in a more curvy line.  A value of 0 will result in no interpolation.
   *   The default is 0
   * @param {Number} config.pointerLength Arrow pointer length. Default value is 10.
   * @param {Number} config.pointerWidth Arrow pointer width. Default value is 10.
   * @param {Boolean} config.pointerAtBeginning Do we need to draw pointer on both sides?. Default false.
   * @param {String} [config.fill] fill color
     * @param {Image} [config.fillPatternImage] fill pattern image
     * @param {Number} [config.fillPatternX]
     * @param {Number} [config.fillPatternY]
     * @param {Object} [config.fillPatternOffset] object with x and y component
     * @param {Number} [config.fillPatternOffsetX] 
     * @param {Number} [config.fillPatternOffsetY] 
     * @param {Object} [config.fillPatternScale] object with x and y component
     * @param {Number} [config.fillPatternScaleX]
     * @param {Number} [config.fillPatternScaleY]
     * @param {Number} [config.fillPatternRotation]
     * @param {String} [config.fillPatternRepeat] can be "repeat", "repeat-x", "repeat-y", or "no-repeat".  The default is "no-repeat"
     * @param {Object} [config.fillLinearGradientStartPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientStartPointX]
     * @param {Number} [config.fillLinearGradientStartPointY]
     * @param {Object} [config.fillLinearGradientEndPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientEndPointX]
     * @param {Number} [config.fillLinearGradientEndPointY]
     * @param {Array} [config.fillLinearGradientColorStops] array of color stops
     * @param {Object} [config.fillRadialGradientStartPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientStartPointX]
     * @param {Number} [config.fillRadialGradientStartPointY]
     * @param {Object} [config.fillRadialGradientEndPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientEndPointX] 
     * @param {Number} [config.fillRadialGradientEndPointY] 
     * @param {Number} [config.fillRadialGradientStartRadius]
     * @param {Number} [config.fillRadialGradientEndRadius]
     * @param {Array} [config.fillRadialGradientColorStops] array of color stops
     * @param {Boolean} [config.fillEnabled] flag which enables or disables the fill.  The default value is true
     * @param {String} [config.fillPriority] can be color, linear-gradient, radial-graident, or pattern.  The default value is color.  The fillPriority property makes it really easy to toggle between different fill types.  For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
     * @param {String} [config.stroke] stroke color
     * @param {Number} [config.strokeWidth] stroke width
     * @param {Number} [config.hitStrokeWidth] size of the stroke on hit canvas.  The default is "auto" - equals to strokeWidth
     * @param {Boolean} [config.strokeHitEnabled] flag which enables or disables stroke hit region.  The default is true
     * @param {Boolean} [config.perfectDrawEnabled] flag which enables or disables using buffer canvas.  The default is true
     * @param {Boolean} [config.shadowForStrokeEnabled] flag which enables or disables shadow for stroke.  The default is true
     * @param {Boolean} [config.strokeScaleEnabled] flag which enables or disables stroke scale.  The default is true
     * @param {Boolean} [config.strokeEnabled] flag which enables or disables the stroke.  The default value is true
     * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
     *  is miter
     * @param {String} [config.lineCap] can be butt, round, or square.  The default
     *  is butt
     * @param {String} [config.shadowColor]
     * @param {Number} [config.shadowBlur]
     * @param {Object} [config.shadowOffset] object with x and y component
     * @param {Number} [config.shadowOffsetX]
     * @param {Number} [config.shadowOffsetY]
     * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
     *  between 0 and 1
     * @param {Boolean} [config.shadowEnabled] flag which enables or disables the shadow.  The default value is true
     * @param {Array} [config.dash]
     * @param {Boolean} [config.dashEnabled] flag which enables or disables the dashArray.  The default value is true

   * @param {Number} [config.x]
     * @param {Number} [config.y]
     * @param {Number} [config.width]
     * @param {Number} [config.height]
     * @param {Boolean} [config.visible]
     * @param {Boolean} [config.listening] whether or not the node is listening for events
     * @param {String} [config.id] unique id
     * @param {String} [config.name] non-unique name
     * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
     * @param {Object} [config.scale] set scale
     * @param {Number} [config.scaleX] set scale x
     * @param {Number} [config.scaleY] set scale y
     * @param {Number} [config.rotation] rotation in degrees
     * @param {Object} [config.offset] offset from center point and rotation point
     * @param {Number} [config.offsetX] set offset x
     * @param {Number} [config.offsetY] set offset y
     * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
     *  the entire stage by dragging any portion of the stage
     * @param {Number} [config.dragDistance]
     * @param {Function} [config.dragBoundFunc]
   * @example
   * var line = new Konva.Line({
   *   points: [73, 70, 340, 23, 450, 60, 500, 20],
   *   stroke: 'red',
   *   tension: 1,
   *   pointerLength : 10,
   *   pointerWidth : 12
   * });
   */
  var Arrow = /** @class */ (function (_super) {
      __extends(Arrow, _super);
      function Arrow() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      Arrow.prototype._sceneFunc = function (ctx) {
          _super.prototype._sceneFunc.call(this, ctx);
          var PI2 = Math.PI * 2;
          var points = this.points();
          var tp = points;
          var fromTension = this.tension() !== 0 && points.length > 4;
          if (fromTension) {
              tp = this.getTensionPoints();
          }
          var n = points.length;
          var dx, dy;
          if (fromTension) {
              dx = points[n - 2] - (tp[tp.length - 2] + tp[tp.length - 4]) / 2;
              dy = points[n - 1] - (tp[tp.length - 1] + tp[tp.length - 3]) / 2;
          }
          else {
              dx = points[n - 2] - points[n - 4];
              dy = points[n - 1] - points[n - 3];
          }
          var radians = (Math.atan2(dy, dx) + PI2) % PI2;
          var length = this.pointerLength();
          var width = this.pointerWidth();
          ctx.save();
          ctx.beginPath();
          ctx.translate(points[n - 2], points[n - 1]);
          ctx.rotate(radians);
          ctx.moveTo(0, 0);
          ctx.lineTo(-length, width / 2);
          ctx.lineTo(-length, -width / 2);
          ctx.closePath();
          ctx.restore();
          if (this.pointerAtBeginning()) {
              ctx.save();
              ctx.translate(points[0], points[1]);
              if (fromTension) {
                  dx = (tp[0] + tp[2]) / 2 - points[0];
                  dy = (tp[1] + tp[3]) / 2 - points[1];
              }
              else {
                  dx = points[2] - points[0];
                  dy = points[3] - points[1];
              }
              ctx.rotate((Math.atan2(-dy, -dx) + PI2) % PI2);
              ctx.moveTo(0, 0);
              ctx.lineTo(-length, width / 2);
              ctx.lineTo(-length, -width / 2);
              ctx.closePath();
              ctx.restore();
          }
          // here is a tricky part
          // we need to disable dash for arrow pointers
          var isDashEnabled = this.dashEnabled();
          if (isDashEnabled) {
              // manually disable dash for head
              // it is better not to use setter here,
              // because it will trigger attr change event
              this.attrs.dashEnabled = false;
              ctx.setLineDash([]);
          }
          ctx.fillStrokeShape(this);
          // restore old value
          if (isDashEnabled) {
              this.attrs.dashEnabled = true;
          }
      };
      Arrow.prototype.getSelfRect = function () {
          var lineRect = _super.prototype.getSelfRect.call(this);
          var offset = this.pointerWidth() / 2;
          return {
              x: lineRect.x - offset,
              y: lineRect.y - offset,
              width: lineRect.width + offset * 2,
              height: lineRect.height + offset * 2
          };
      };
      return Arrow;
  }(Line));
  Arrow.prototype.className = 'Arrow';
  _registerNode(Arrow);
  /**
   * get/set pointerLength
   * @name Konva.Arrow#pointerLength
   * @method
   * @param {Number} Length of pointer of arrow. The default is 10.
   * @returns {Number}
   * @example
   * // get length
   * var pointerLength = line.pointerLength();
   *
   * // set length
   * line.pointerLength(15);
   */
  Factory.addGetterSetter(Arrow, 'pointerLength', 10, getNumberValidator());
  /**
   * get/set pointerWidth
   * @name Konva.Arrow#pointerWidth
   * @method
   * @param {Number} Width of pointer of arrow.
   *   The default is 10.
   * @returns {Number}
   * @example
   * // get width
   * var pointerWidth = line.pointerWidth();
   *
   * // set width
   * line.pointerWidth(15);
   */
  Factory.addGetterSetter(Arrow, 'pointerWidth', 10, getNumberValidator());
  /**
   * get/set pointerAtBeginning
   * @name Konva.Arrow#pointerAtBeginning
   * @method
   * @param {Number} Should pointer displayed at beginning of arrow. The default is false.
   * @returns {Boolean}
   * @example
   * // get value
   * var pointerAtBeginning = line.pointerAtBeginning();
   *
   * // set value
   * line.pointerAtBeginning(true);
   */
  Factory.addGetterSetter(Arrow, 'pointerAtBeginning', false);
  Collection.mapMethods(Arrow);

  /**
   * Circle constructor
   * @constructor
   * @memberof Konva
   * @augments Konva.Shape
   * @param {Object} config
   * @param {Number} config.radius
   * @param {String} [config.fill] fill color
     * @param {Image} [config.fillPatternImage] fill pattern image
     * @param {Number} [config.fillPatternX]
     * @param {Number} [config.fillPatternY]
     * @param {Object} [config.fillPatternOffset] object with x and y component
     * @param {Number} [config.fillPatternOffsetX] 
     * @param {Number} [config.fillPatternOffsetY] 
     * @param {Object} [config.fillPatternScale] object with x and y component
     * @param {Number} [config.fillPatternScaleX]
     * @param {Number} [config.fillPatternScaleY]
     * @param {Number} [config.fillPatternRotation]
     * @param {String} [config.fillPatternRepeat] can be "repeat", "repeat-x", "repeat-y", or "no-repeat".  The default is "no-repeat"
     * @param {Object} [config.fillLinearGradientStartPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientStartPointX]
     * @param {Number} [config.fillLinearGradientStartPointY]
     * @param {Object} [config.fillLinearGradientEndPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientEndPointX]
     * @param {Number} [config.fillLinearGradientEndPointY]
     * @param {Array} [config.fillLinearGradientColorStops] array of color stops
     * @param {Object} [config.fillRadialGradientStartPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientStartPointX]
     * @param {Number} [config.fillRadialGradientStartPointY]
     * @param {Object} [config.fillRadialGradientEndPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientEndPointX] 
     * @param {Number} [config.fillRadialGradientEndPointY] 
     * @param {Number} [config.fillRadialGradientStartRadius]
     * @param {Number} [config.fillRadialGradientEndRadius]
     * @param {Array} [config.fillRadialGradientColorStops] array of color stops
     * @param {Boolean} [config.fillEnabled] flag which enables or disables the fill.  The default value is true
     * @param {String} [config.fillPriority] can be color, linear-gradient, radial-graident, or pattern.  The default value is color.  The fillPriority property makes it really easy to toggle between different fill types.  For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
     * @param {String} [config.stroke] stroke color
     * @param {Number} [config.strokeWidth] stroke width
     * @param {Number} [config.hitStrokeWidth] size of the stroke on hit canvas.  The default is "auto" - equals to strokeWidth
     * @param {Boolean} [config.strokeHitEnabled] flag which enables or disables stroke hit region.  The default is true
     * @param {Boolean} [config.perfectDrawEnabled] flag which enables or disables using buffer canvas.  The default is true
     * @param {Boolean} [config.shadowForStrokeEnabled] flag which enables or disables shadow for stroke.  The default is true
     * @param {Boolean} [config.strokeScaleEnabled] flag which enables or disables stroke scale.  The default is true
     * @param {Boolean} [config.strokeEnabled] flag which enables or disables the stroke.  The default value is true
     * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
     *  is miter
     * @param {String} [config.lineCap] can be butt, round, or square.  The default
     *  is butt
     * @param {String} [config.shadowColor]
     * @param {Number} [config.shadowBlur]
     * @param {Object} [config.shadowOffset] object with x and y component
     * @param {Number} [config.shadowOffsetX]
     * @param {Number} [config.shadowOffsetY]
     * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
     *  between 0 and 1
     * @param {Boolean} [config.shadowEnabled] flag which enables or disables the shadow.  The default value is true
     * @param {Array} [config.dash]
     * @param {Boolean} [config.dashEnabled] flag which enables or disables the dashArray.  The default value is true

   * @param {Number} [config.x]
     * @param {Number} [config.y]
     * @param {Number} [config.width]
     * @param {Number} [config.height]
     * @param {Boolean} [config.visible]
     * @param {Boolean} [config.listening] whether or not the node is listening for events
     * @param {String} [config.id] unique id
     * @param {String} [config.name] non-unique name
     * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
     * @param {Object} [config.scale] set scale
     * @param {Number} [config.scaleX] set scale x
     * @param {Number} [config.scaleY] set scale y
     * @param {Number} [config.rotation] rotation in degrees
     * @param {Object} [config.offset] offset from center point and rotation point
     * @param {Number} [config.offsetX] set offset x
     * @param {Number} [config.offsetY] set offset y
     * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
     *  the entire stage by dragging any portion of the stage
     * @param {Number} [config.dragDistance]
     * @param {Function} [config.dragBoundFunc]
   * @example
   * // create circle
   * var circle = new Konva.Circle({
   *   radius: 40,
   *   fill: 'red',
   *   stroke: 'black',
   *   strokeWidth: 5
   * });
   */
  var Circle = /** @class */ (function (_super) {
      __extends(Circle, _super);
      function Circle() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      Circle.prototype._sceneFunc = function (context) {
          context.beginPath();
          context.arc(0, 0, this.radius(), 0, Math.PI * 2, false);
          context.closePath();
          context.fillStrokeShape(this);
      };
      Circle.prototype.getWidth = function () {
          return this.radius() * 2;
      };
      Circle.prototype.getHeight = function () {
          return this.radius() * 2;
      };
      Circle.prototype.setWidth = function (width) {
          if (this.radius() !== width / 2) {
              this.radius(width / 2);
          }
      };
      Circle.prototype.setHeight = function (height) {
          if (this.radius() !== height / 2) {
              this.radius(height / 2);
          }
      };
      return Circle;
  }(Shape));
  Circle.prototype._centroid = true;
  Circle.prototype.className = 'Circle';
  Circle.prototype._attrsAffectingSize = ['radius'];
  _registerNode(Circle);
  /**
   * get/set radius
   * @name Konva.Arrow#radius
   * @method
   * @param {Number} radius
   * @returns {Number}
   * @example
   * // get radius
   * var radius = circle.radius();
   *
   * // set radius
   * circle.radius(10);
   */
  Factory.addGetterSetter(Circle, 'radius', 0, getNumberValidator());
  Collection.mapMethods(Circle);

  /**
   * Ellipse constructor
   * @constructor
   * @memberof Konva
   * @augments Konva.Shape
   * @param {Object} config
   * @param {Object} config.radius defines x and y radius
   * @param {String} [config.fill] fill color
     * @param {Image} [config.fillPatternImage] fill pattern image
     * @param {Number} [config.fillPatternX]
     * @param {Number} [config.fillPatternY]
     * @param {Object} [config.fillPatternOffset] object with x and y component
     * @param {Number} [config.fillPatternOffsetX] 
     * @param {Number} [config.fillPatternOffsetY] 
     * @param {Object} [config.fillPatternScale] object with x and y component
     * @param {Number} [config.fillPatternScaleX]
     * @param {Number} [config.fillPatternScaleY]
     * @param {Number} [config.fillPatternRotation]
     * @param {String} [config.fillPatternRepeat] can be "repeat", "repeat-x", "repeat-y", or "no-repeat".  The default is "no-repeat"
     * @param {Object} [config.fillLinearGradientStartPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientStartPointX]
     * @param {Number} [config.fillLinearGradientStartPointY]
     * @param {Object} [config.fillLinearGradientEndPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientEndPointX]
     * @param {Number} [config.fillLinearGradientEndPointY]
     * @param {Array} [config.fillLinearGradientColorStops] array of color stops
     * @param {Object} [config.fillRadialGradientStartPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientStartPointX]
     * @param {Number} [config.fillRadialGradientStartPointY]
     * @param {Object} [config.fillRadialGradientEndPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientEndPointX] 
     * @param {Number} [config.fillRadialGradientEndPointY] 
     * @param {Number} [config.fillRadialGradientStartRadius]
     * @param {Number} [config.fillRadialGradientEndRadius]
     * @param {Array} [config.fillRadialGradientColorStops] array of color stops
     * @param {Boolean} [config.fillEnabled] flag which enables or disables the fill.  The default value is true
     * @param {String} [config.fillPriority] can be color, linear-gradient, radial-graident, or pattern.  The default value is color.  The fillPriority property makes it really easy to toggle between different fill types.  For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
     * @param {String} [config.stroke] stroke color
     * @param {Number} [config.strokeWidth] stroke width
     * @param {Number} [config.hitStrokeWidth] size of the stroke on hit canvas.  The default is "auto" - equals to strokeWidth
     * @param {Boolean} [config.strokeHitEnabled] flag which enables or disables stroke hit region.  The default is true
     * @param {Boolean} [config.perfectDrawEnabled] flag which enables or disables using buffer canvas.  The default is true
     * @param {Boolean} [config.shadowForStrokeEnabled] flag which enables or disables shadow for stroke.  The default is true
     * @param {Boolean} [config.strokeScaleEnabled] flag which enables or disables stroke scale.  The default is true
     * @param {Boolean} [config.strokeEnabled] flag which enables or disables the stroke.  The default value is true
     * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
     *  is miter
     * @param {String} [config.lineCap] can be butt, round, or square.  The default
     *  is butt
     * @param {String} [config.shadowColor]
     * @param {Number} [config.shadowBlur]
     * @param {Object} [config.shadowOffset] object with x and y component
     * @param {Number} [config.shadowOffsetX]
     * @param {Number} [config.shadowOffsetY]
     * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
     *  between 0 and 1
     * @param {Boolean} [config.shadowEnabled] flag which enables or disables the shadow.  The default value is true
     * @param {Array} [config.dash]
     * @param {Boolean} [config.dashEnabled] flag which enables or disables the dashArray.  The default value is true

   * @param {Number} [config.x]
     * @param {Number} [config.y]
     * @param {Number} [config.width]
     * @param {Number} [config.height]
     * @param {Boolean} [config.visible]
     * @param {Boolean} [config.listening] whether or not the node is listening for events
     * @param {String} [config.id] unique id
     * @param {String} [config.name] non-unique name
     * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
     * @param {Object} [config.scale] set scale
     * @param {Number} [config.scaleX] set scale x
     * @param {Number} [config.scaleY] set scale y
     * @param {Number} [config.rotation] rotation in degrees
     * @param {Object} [config.offset] offset from center point and rotation point
     * @param {Number} [config.offsetX] set offset x
     * @param {Number} [config.offsetY] set offset y
     * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
     *  the entire stage by dragging any portion of the stage
     * @param {Number} [config.dragDistance]
     * @param {Function} [config.dragBoundFunc]
   * @example
   * var ellipse = new Konva.Ellipse({
   *   radius : {
   *     x : 50,
   *     y : 50
   *   },
   *   fill: 'red'
   * });
   */
  var Ellipse = /** @class */ (function (_super) {
      __extends(Ellipse, _super);
      function Ellipse() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      Ellipse.prototype._sceneFunc = function (context) {
          var rx = this.radiusX(), ry = this.radiusY();
          context.beginPath();
          context.save();
          if (rx !== ry) {
              context.scale(1, ry / rx);
          }
          context.arc(0, 0, rx, 0, Math.PI * 2, false);
          context.restore();
          context.closePath();
          context.fillStrokeShape(this);
      };
      Ellipse.prototype.getWidth = function () {
          return this.radiusX() * 2;
      };
      Ellipse.prototype.getHeight = function () {
          return this.radiusY() * 2;
      };
      Ellipse.prototype.setWidth = function (width) {
          this.radiusX(width / 2);
      };
      Ellipse.prototype.setHeight = function (height) {
          this.radiusY(height / 2);
      };
      return Ellipse;
  }(Shape));
  Ellipse.prototype.className = 'Ellipse';
  Ellipse.prototype._centroid = true;
  Ellipse.prototype._attrsAffectingSize = ['radiusX', 'radiusY'];
  _registerNode(Ellipse);
  // add getters setters
  Factory.addComponentsGetterSetter(Ellipse, 'radius', ['x', 'y']);
  /**
   * get/set radius
   * @name Konva.Ellipse#radius
   * @method
   * @param {Object} radius
   * @param {Number} radius.x
   * @param {Number} radius.y
   * @returns {Object}
   * @example
   * // get radius
   * var radius = ellipse.radius();
   *
   * // set radius
   * ellipse.radius({
   *   x: 200,
   *   y: 100
   * });
   */
  Factory.addGetterSetter(Ellipse, 'radiusX', 0, getNumberValidator());
  /**
   * get/set radius x
   * @name Konva.Ellipse#radiusX
   * @method
   * @param {Number} x
   * @returns {Number}
   * @example
   * // get radius x
   * var radiusX = ellipse.radiusX();
   *
   * // set radius x
   * ellipse.radiusX(200);
   */
  Factory.addGetterSetter(Ellipse, 'radiusY', 0, getNumberValidator());
  /**
   * get/set radius y
   * @name Konva.Ellipse#radiusY
   * @method
   * @param {Number} y
   * @returns {Number}
   * @example
   * // get radius y
   * var radiusY = ellipse.radiusY();
   *
   * // set radius y
   * ellipse.radiusY(200);
   */
  Collection.mapMethods(Ellipse);

  /**
   * Image constructor
   * @constructor
   * @memberof Konva
   * @augments Konva.Shape
   * @param {Object} config
   * @param {Image} config.image
   * @param {Object} [config.crop]
   * @param {String} [config.fill] fill color
     * @param {Image} [config.fillPatternImage] fill pattern image
     * @param {Number} [config.fillPatternX]
     * @param {Number} [config.fillPatternY]
     * @param {Object} [config.fillPatternOffset] object with x and y component
     * @param {Number} [config.fillPatternOffsetX] 
     * @param {Number} [config.fillPatternOffsetY] 
     * @param {Object} [config.fillPatternScale] object with x and y component
     * @param {Number} [config.fillPatternScaleX]
     * @param {Number} [config.fillPatternScaleY]
     * @param {Number} [config.fillPatternRotation]
     * @param {String} [config.fillPatternRepeat] can be "repeat", "repeat-x", "repeat-y", or "no-repeat".  The default is "no-repeat"
     * @param {Object} [config.fillLinearGradientStartPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientStartPointX]
     * @param {Number} [config.fillLinearGradientStartPointY]
     * @param {Object} [config.fillLinearGradientEndPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientEndPointX]
     * @param {Number} [config.fillLinearGradientEndPointY]
     * @param {Array} [config.fillLinearGradientColorStops] array of color stops
     * @param {Object} [config.fillRadialGradientStartPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientStartPointX]
     * @param {Number} [config.fillRadialGradientStartPointY]
     * @param {Object} [config.fillRadialGradientEndPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientEndPointX] 
     * @param {Number} [config.fillRadialGradientEndPointY] 
     * @param {Number} [config.fillRadialGradientStartRadius]
     * @param {Number} [config.fillRadialGradientEndRadius]
     * @param {Array} [config.fillRadialGradientColorStops] array of color stops
     * @param {Boolean} [config.fillEnabled] flag which enables or disables the fill.  The default value is true
     * @param {String} [config.fillPriority] can be color, linear-gradient, radial-graident, or pattern.  The default value is color.  The fillPriority property makes it really easy to toggle between different fill types.  For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
     * @param {String} [config.stroke] stroke color
     * @param {Number} [config.strokeWidth] stroke width
     * @param {Number} [config.hitStrokeWidth] size of the stroke on hit canvas.  The default is "auto" - equals to strokeWidth
     * @param {Boolean} [config.strokeHitEnabled] flag which enables or disables stroke hit region.  The default is true
     * @param {Boolean} [config.perfectDrawEnabled] flag which enables or disables using buffer canvas.  The default is true
     * @param {Boolean} [config.shadowForStrokeEnabled] flag which enables or disables shadow for stroke.  The default is true
     * @param {Boolean} [config.strokeScaleEnabled] flag which enables or disables stroke scale.  The default is true
     * @param {Boolean} [config.strokeEnabled] flag which enables or disables the stroke.  The default value is true
     * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
     *  is miter
     * @param {String} [config.lineCap] can be butt, round, or square.  The default
     *  is butt
     * @param {String} [config.shadowColor]
     * @param {Number} [config.shadowBlur]
     * @param {Object} [config.shadowOffset] object with x and y component
     * @param {Number} [config.shadowOffsetX]
     * @param {Number} [config.shadowOffsetY]
     * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
     *  between 0 and 1
     * @param {Boolean} [config.shadowEnabled] flag which enables or disables the shadow.  The default value is true
     * @param {Array} [config.dash]
     * @param {Boolean} [config.dashEnabled] flag which enables or disables the dashArray.  The default value is true

   * @param {Number} [config.x]
     * @param {Number} [config.y]
     * @param {Number} [config.width]
     * @param {Number} [config.height]
     * @param {Boolean} [config.visible]
     * @param {Boolean} [config.listening] whether or not the node is listening for events
     * @param {String} [config.id] unique id
     * @param {String} [config.name] non-unique name
     * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
     * @param {Object} [config.scale] set scale
     * @param {Number} [config.scaleX] set scale x
     * @param {Number} [config.scaleY] set scale y
     * @param {Number} [config.rotation] rotation in degrees
     * @param {Object} [config.offset] offset from center point and rotation point
     * @param {Number} [config.offsetX] set offset x
     * @param {Number} [config.offsetY] set offset y
     * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
     *  the entire stage by dragging any portion of the stage
     * @param {Number} [config.dragDistance]
     * @param {Function} [config.dragBoundFunc]
   * @example
   * var imageObj = new Image();
   * imageObj.onload = function() {
   *   var image = new Konva.Image({
   *     x: 200,
   *     y: 50,
   *     image: imageObj,
   *     width: 100,
   *     height: 100
   *   });
   * };
   * imageObj.src = '/path/to/image.jpg'
   */
  var Image = /** @class */ (function (_super) {
      __extends(Image, _super);
      function Image() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      Image.prototype._useBufferCanvas = function () {
          return !!((this.hasShadow() || this.getAbsoluteOpacity() !== 1) &&
              this.hasStroke() &&
              this.getStage());
      };
      Image.prototype._sceneFunc = function (context) {
          var width = this.width(), height = this.height(), image = this.image(), cropWidth, cropHeight, params;
          if (image) {
              cropWidth = this.cropWidth();
              cropHeight = this.cropHeight();
              if (cropWidth && cropHeight) {
                  params = [
                      image,
                      this.cropX(),
                      this.cropY(),
                      cropWidth,
                      cropHeight,
                      0,
                      0,
                      width,
                      height
                  ];
              }
              else {
                  params = [image, 0, 0, width, height];
              }
          }
          if (this.hasFill() || this.hasStroke()) {
              context.beginPath();
              context.rect(0, 0, width, height);
              context.closePath();
              context.fillStrokeShape(this);
          }
          if (image) {
              context.drawImage.apply(context, params);
          }
      };
      Image.prototype._hitFunc = function (context) {
          var width = this.width(), height = this.height();
          context.beginPath();
          context.rect(0, 0, width, height);
          context.closePath();
          context.fillStrokeShape(this);
      };
      Image.prototype.getWidth = function () {
          var _a;
          var image = this.image();
          return (_a = this.attrs.width) !== null && _a !== void 0 ? _a : (image ? image.width : 0);
      };
      Image.prototype.getHeight = function () {
          var _a;
          var image = this.image();
          return (_a = this.attrs.height) !== null && _a !== void 0 ? _a : (image ? image.height : 0);
      };
      /**
       * load image from given url and create `Konva.Image` instance
       * @method
       * @memberof Konva.Image
       * @param {String} url image source
       * @param {Function} callback with Konva.Image instance as first argument
       * @example
       *  Konva.Image.fromURL(imageURL, function(image){
       *    // image is Konva.Image instance
       *    layer.add(image);
       *    layer.draw();
       *  });
       */
      Image.fromURL = function (url, callback) {
          var img = Util.createImageElement();
          img.onload = function () {
              var image = new Image({
                  image: img
              });
              callback(image);
          };
          img.crossOrigin = 'Anonymous';
          img.src = url;
      };
      return Image;
  }(Shape));
  Image.prototype.className = 'Image';
  _registerNode(Image);
  /**
   * get/set image source. It can be image, canvas or video element
   * @name Konva.Image#image
   * @method
   * @param {Object} image source
   * @returns {Object}
   * @example
   * // get value
   * var image = shape.image();
   *
   * // set value
   * shape.image(img);
   */
  Factory.addGetterSetter(Image, 'image');
  Factory.addComponentsGetterSetter(Image, 'crop', ['x', 'y', 'width', 'height']);
  /**
   * get/set crop
   * @method
   * @name Konva.Image#crop
   * @param {Object} crop
   * @param {Number} crop.x
   * @param {Number} crop.y
   * @param {Number} crop.width
   * @param {Number} crop.height
   * @returns {Object}
   * @example
   * // get crop
   * var crop = image.crop();
   *
   * // set crop
   * image.crop({
   *   x: 20,
   *   y: 20,
   *   width: 20,
   *   height: 20
   * });
   */
  Factory.addGetterSetter(Image, 'cropX', 0, getNumberValidator());
  /**
   * get/set crop x
   * @method
   * @name Konva.Image#cropX
   * @param {Number} x
   * @returns {Number}
   * @example
   * // get crop x
   * var cropX = image.cropX();
   *
   * // set crop x
   * image.cropX(20);
   */
  Factory.addGetterSetter(Image, 'cropY', 0, getNumberValidator());
  /**
   * get/set crop y
   * @name Konva.Image#cropY
   * @method
   * @param {Number} y
   * @returns {Number}
   * @example
   * // get crop y
   * var cropY = image.cropY();
   *
   * // set crop y
   * image.cropY(20);
   */
  Factory.addGetterSetter(Image, 'cropWidth', 0, getNumberValidator());
  /**
   * get/set crop width
   * @name Konva.Image#cropWidth
   * @method
   * @param {Number} width
   * @returns {Number}
   * @example
   * // get crop width
   * var cropWidth = image.cropWidth();
   *
   * // set crop width
   * image.cropWidth(20);
   */
  Factory.addGetterSetter(Image, 'cropHeight', 0, getNumberValidator());
  /**
   * get/set crop height
   * @name Konva.Image#cropHeight
   * @method
   * @param {Number} height
   * @returns {Number}
   * @example
   * // get crop height
   * var cropHeight = image.cropHeight();
   *
   * // set crop height
   * image.cropHeight(20);
   */
  Collection.mapMethods(Image);

  // constants
  var ATTR_CHANGE_LIST = [
      'fontFamily',
      'fontSize',
      'fontStyle',
      'padding',
      'lineHeight',
      'text',
      'width'
  ], CHANGE_KONVA = 'Change.konva', NONE = 'none', UP = 'up', RIGHT = 'right', DOWN = 'down', LEFT = 'left', 
  // cached variables
  attrChangeListLen = ATTR_CHANGE_LIST.length;
  /**
   * Label constructor.&nbsp; Labels are groups that contain a Text and Tag shape
   * @constructor
   * @memberof Konva
   * @param {Object} config
   * @param {Number} [config.x]
     * @param {Number} [config.y]
     * @param {Number} [config.width]
     * @param {Number} [config.height]
     * @param {Boolean} [config.visible]
     * @param {Boolean} [config.listening] whether or not the node is listening for events
     * @param {String} [config.id] unique id
     * @param {String} [config.name] non-unique name
     * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
     * @param {Object} [config.scale] set scale
     * @param {Number} [config.scaleX] set scale x
     * @param {Number} [config.scaleY] set scale y
     * @param {Number} [config.rotation] rotation in degrees
     * @param {Object} [config.offset] offset from center point and rotation point
     * @param {Number} [config.offsetX] set offset x
     * @param {Number} [config.offsetY] set offset y
     * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
     *  the entire stage by dragging any portion of the stage
     * @param {Number} [config.dragDistance]
     * @param {Function} [config.dragBoundFunc]
   * @example
   * // create label
   * var label = new Konva.Label({
   *   x: 100,
   *   y: 100,
   *   draggable: true
   * });
   *
   * // add a tag to the label
   * label.add(new Konva.Tag({
   *   fill: '#bbb',
   *   stroke: '#333',
   *   shadowColor: 'black',
   *   shadowBlur: 10,
   *   shadowOffset: [10, 10],
   *   shadowOpacity: 0.2,
   *   lineJoin: 'round',
   *   pointerDirection: 'up',
   *   pointerWidth: 20,
   *   pointerHeight: 20,
   *   cornerRadius: 5
   * }));
   *
   * // add text to the label
   * label.add(new Konva.Text({
   *   text: 'Hello World!',
   *   fontSize: 50,
   *   lineHeight: 1.2,
   *   padding: 10,
   *   fill: 'green'
   *  }));
   */
  var Label = /** @class */ (function (_super) {
      __extends(Label, _super);
      function Label(config) {
          var _this = _super.call(this, config) || this;
          _this.on('add.konva', function (evt) {
              this._addListeners(evt.child);
              this._sync();
          });
          return _this;
      }
      /**
       * get Text shape for the label.  You need to access the Text shape in order to update
       * the text properties
       * @name Konva.Label#getText
       * @method
       * @example
       * label.getText().fill('red')
       */
      Label.prototype.getText = function () {
          return this.find('Text')[0];
      };
      /**
       * get Tag shape for the label.  You need to access the Tag shape in order to update
       * the pointer properties and the corner radius
       * @name Konva.Label#getTag
       * @method
       */
      Label.prototype.getTag = function () {
          return this.find('Tag')[0];
      };
      Label.prototype._addListeners = function (text) {
          var that = this, n;
          var func = function () {
              that._sync();
          };
          // update text data for certain attr changes
          for (n = 0; n < attrChangeListLen; n++) {
              text.on(ATTR_CHANGE_LIST[n] + CHANGE_KONVA, func);
          }
      };
      Label.prototype.getWidth = function () {
          return this.getText().width();
      };
      Label.prototype.getHeight = function () {
          return this.getText().height();
      };
      Label.prototype._sync = function () {
          var text = this.getText(), tag = this.getTag(), width, height, pointerDirection, pointerWidth, x, y, pointerHeight;
          if (text && tag) {
              width = text.width();
              height = text.height();
              pointerDirection = tag.pointerDirection();
              pointerWidth = tag.pointerWidth();
              pointerHeight = tag.pointerHeight();
              x = 0;
              y = 0;
              switch (pointerDirection) {
                  case UP:
                      x = width / 2;
                      y = -1 * pointerHeight;
                      break;
                  case RIGHT:
                      x = width + pointerWidth;
                      y = height / 2;
                      break;
                  case DOWN:
                      x = width / 2;
                      y = height + pointerHeight;
                      break;
                  case LEFT:
                      x = -1 * pointerWidth;
                      y = height / 2;
                      break;
              }
              tag.setAttrs({
                  x: -1 * x,
                  y: -1 * y,
                  width: width,
                  height: height
              });
              text.setAttrs({
                  x: -1 * x,
                  y: -1 * y
              });
          }
      };
      return Label;
  }(Group));
  Label.prototype.className = 'Label';
  _registerNode(Label);
  Collection.mapMethods(Label);
  /**
   * Tag constructor.&nbsp; A Tag can be configured
   *  to have a pointer element that points up, right, down, or left
   * @constructor
   * @memberof Konva
   * @param {Object} config
   * @param {String} [config.pointerDirection] can be up, right, down, left, or none; the default
   *  is none.  When a pointer is present, the positioning of the label is relative to the tip of the pointer.
   * @param {Number} [config.pointerWidth]
   * @param {Number} [config.pointerHeight]
   * @param {Number} [config.cornerRadius]
   */
  var Tag = /** @class */ (function (_super) {
      __extends(Tag, _super);
      function Tag() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      Tag.prototype._sceneFunc = function (context) {
          var width = this.width(), height = this.height(), pointerDirection = this.pointerDirection(), pointerWidth = this.pointerWidth(), pointerHeight = this.pointerHeight(), cornerRadius = Math.min(this.cornerRadius(), width / 2, height / 2);
          context.beginPath();
          if (!cornerRadius) {
              context.moveTo(0, 0);
          }
          else {
              context.moveTo(cornerRadius, 0);
          }
          if (pointerDirection === UP) {
              context.lineTo((width - pointerWidth) / 2, 0);
              context.lineTo(width / 2, -1 * pointerHeight);
              context.lineTo((width + pointerWidth) / 2, 0);
          }
          if (!cornerRadius) {
              context.lineTo(width, 0);
          }
          else {
              context.lineTo(width - cornerRadius, 0);
              context.arc(width - cornerRadius, cornerRadius, cornerRadius, (Math.PI * 3) / 2, 0, false);
          }
          if (pointerDirection === RIGHT) {
              context.lineTo(width, (height - pointerHeight) / 2);
              context.lineTo(width + pointerWidth, height / 2);
              context.lineTo(width, (height + pointerHeight) / 2);
          }
          if (!cornerRadius) {
              context.lineTo(width, height);
          }
          else {
              context.lineTo(width, height - cornerRadius);
              context.arc(width - cornerRadius, height - cornerRadius, cornerRadius, 0, Math.PI / 2, false);
          }
          if (pointerDirection === DOWN) {
              context.lineTo((width + pointerWidth) / 2, height);
              context.lineTo(width / 2, height + pointerHeight);
              context.lineTo((width - pointerWidth) / 2, height);
          }
          if (!cornerRadius) {
              context.lineTo(0, height);
          }
          else {
              context.lineTo(cornerRadius, height);
              context.arc(cornerRadius, height - cornerRadius, cornerRadius, Math.PI / 2, Math.PI, false);
          }
          if (pointerDirection === LEFT) {
              context.lineTo(0, (height + pointerHeight) / 2);
              context.lineTo(-1 * pointerWidth, height / 2);
              context.lineTo(0, (height - pointerHeight) / 2);
          }
          if (cornerRadius) {
              context.lineTo(0, cornerRadius);
              context.arc(cornerRadius, cornerRadius, cornerRadius, Math.PI, (Math.PI * 3) / 2, false);
          }
          context.closePath();
          context.fillStrokeShape(this);
      };
      Tag.prototype.getSelfRect = function () {
          var x = 0, y = 0, pointerWidth = this.pointerWidth(), pointerHeight = this.pointerHeight(), direction = this.pointerDirection(), width = this.width(), height = this.height();
          if (direction === UP) {
              y -= pointerHeight;
              height += pointerHeight;
          }
          else if (direction === DOWN) {
              height += pointerHeight;
          }
          else if (direction === LEFT) {
              // ARGH!!! I have no idea why should I used magic 1.5!!!!!!!!!
              x -= pointerWidth * 1.5;
              width += pointerWidth;
          }
          else if (direction === RIGHT) {
              width += pointerWidth * 1.5;
          }
          return {
              x: x,
              y: y,
              width: width,
              height: height
          };
      };
      return Tag;
  }(Shape));
  Tag.prototype.className = 'Tag';
  _registerNode(Tag);
  /**
   * get/set pointer direction
   * @name Konva.Tag#pointerDirection
   * @method
   * @param {String} pointerDirection can be up, right, down, left, or none.  The default is none.
   * @returns {String}
   * @example
   * tag.pointerDirection('right');
   */
  Factory.addGetterSetter(Tag, 'pointerDirection', NONE);
  /**
   * get/set pointer width
   * @name Konva.Tag#pointerWidth
   * @method
   * @param {Number} pointerWidth
   * @returns {Number}
   * @example
   * tag.pointerWidth(20);
   */
  Factory.addGetterSetter(Tag, 'pointerWidth', 0, getNumberValidator());
  /**
   * get/set pointer height
   * @method
   * @name Konva.Tag#pointerHeight
   * @param {Number} pointerHeight
   * @returns {Number}
   * @example
   * tag.pointerHeight(20);
   */
  Factory.addGetterSetter(Tag, 'pointerHeight', 0, getNumberValidator());
  /**
   * get/set cornerRadius
   * @name Konva.Tag#cornerRadius
   * @method
   * @param {Number} cornerRadius
   * @returns {Number}
   * @example
   * tag.cornerRadius(20);
   */
  Factory.addGetterSetter(Tag, 'cornerRadius', 0, getNumberValidator());
  Collection.mapMethods(Tag);

  /**
   * Path constructor.
   * @author Jason Follas
   * @constructor
   * @memberof Konva
   * @augments Konva.Shape
   * @param {Object} config
   * @param {String} config.data SVG data string
   * @param {String} [config.fill] fill color
     * @param {Image} [config.fillPatternImage] fill pattern image
     * @param {Number} [config.fillPatternX]
     * @param {Number} [config.fillPatternY]
     * @param {Object} [config.fillPatternOffset] object with x and y component
     * @param {Number} [config.fillPatternOffsetX] 
     * @param {Number} [config.fillPatternOffsetY] 
     * @param {Object} [config.fillPatternScale] object with x and y component
     * @param {Number} [config.fillPatternScaleX]
     * @param {Number} [config.fillPatternScaleY]
     * @param {Number} [config.fillPatternRotation]
     * @param {String} [config.fillPatternRepeat] can be "repeat", "repeat-x", "repeat-y", or "no-repeat".  The default is "no-repeat"
     * @param {Object} [config.fillLinearGradientStartPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientStartPointX]
     * @param {Number} [config.fillLinearGradientStartPointY]
     * @param {Object} [config.fillLinearGradientEndPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientEndPointX]
     * @param {Number} [config.fillLinearGradientEndPointY]
     * @param {Array} [config.fillLinearGradientColorStops] array of color stops
     * @param {Object} [config.fillRadialGradientStartPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientStartPointX]
     * @param {Number} [config.fillRadialGradientStartPointY]
     * @param {Object} [config.fillRadialGradientEndPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientEndPointX] 
     * @param {Number} [config.fillRadialGradientEndPointY] 
     * @param {Number} [config.fillRadialGradientStartRadius]
     * @param {Number} [config.fillRadialGradientEndRadius]
     * @param {Array} [config.fillRadialGradientColorStops] array of color stops
     * @param {Boolean} [config.fillEnabled] flag which enables or disables the fill.  The default value is true
     * @param {String} [config.fillPriority] can be color, linear-gradient, radial-graident, or pattern.  The default value is color.  The fillPriority property makes it really easy to toggle between different fill types.  For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
     * @param {String} [config.stroke] stroke color
     * @param {Number} [config.strokeWidth] stroke width
     * @param {Number} [config.hitStrokeWidth] size of the stroke on hit canvas.  The default is "auto" - equals to strokeWidth
     * @param {Boolean} [config.strokeHitEnabled] flag which enables or disables stroke hit region.  The default is true
     * @param {Boolean} [config.perfectDrawEnabled] flag which enables or disables using buffer canvas.  The default is true
     * @param {Boolean} [config.shadowForStrokeEnabled] flag which enables or disables shadow for stroke.  The default is true
     * @param {Boolean} [config.strokeScaleEnabled] flag which enables or disables stroke scale.  The default is true
     * @param {Boolean} [config.strokeEnabled] flag which enables or disables the stroke.  The default value is true
     * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
     *  is miter
     * @param {String} [config.lineCap] can be butt, round, or square.  The default
     *  is butt
     * @param {String} [config.shadowColor]
     * @param {Number} [config.shadowBlur]
     * @param {Object} [config.shadowOffset] object with x and y component
     * @param {Number} [config.shadowOffsetX]
     * @param {Number} [config.shadowOffsetY]
     * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
     *  between 0 and 1
     * @param {Boolean} [config.shadowEnabled] flag which enables or disables the shadow.  The default value is true
     * @param {Array} [config.dash]
     * @param {Boolean} [config.dashEnabled] flag which enables or disables the dashArray.  The default value is true

   * @param {Number} [config.x]
     * @param {Number} [config.y]
     * @param {Number} [config.width]
     * @param {Number} [config.height]
     * @param {Boolean} [config.visible]
     * @param {Boolean} [config.listening] whether or not the node is listening for events
     * @param {String} [config.id] unique id
     * @param {String} [config.name] non-unique name
     * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
     * @param {Object} [config.scale] set scale
     * @param {Number} [config.scaleX] set scale x
     * @param {Number} [config.scaleY] set scale y
     * @param {Number} [config.rotation] rotation in degrees
     * @param {Object} [config.offset] offset from center point and rotation point
     * @param {Number} [config.offsetX] set offset x
     * @param {Number} [config.offsetY] set offset y
     * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
     *  the entire stage by dragging any portion of the stage
     * @param {Number} [config.dragDistance]
     * @param {Function} [config.dragBoundFunc]
   * @example
   * var path = new Konva.Path({
   *   x: 240,
   *   y: 40,
   *   data: 'M12.582,9.551C3.251,16.237,0.921,29.021,7.08,38.564l-2.36,1.689l4.893,2.262l4.893,2.262l-0.568-5.36l-0.567-5.359l-2.365,1.694c-4.657-7.375-2.83-17.185,4.352-22.33c7.451-5.338,17.817-3.625,23.156,3.824c5.337,7.449,3.625,17.813-3.821,23.152l2.857,3.988c9.617-6.893,11.827-20.277,4.935-29.896C35.591,4.87,22.204,2.658,12.582,9.551z',
   *   fill: 'green',
   *   scaleX: 2,
   *   scaleY: 2
   * });
   */
  var Path = /** @class */ (function (_super) {
      __extends(Path, _super);
      function Path(config) {
          var _this = _super.call(this, config) || this;
          _this.dataArray = [];
          _this.pathLength = 0;
          _this.dataArray = Path.parsePathData(_this.data());
          _this.pathLength = 0;
          for (var i = 0; i < _this.dataArray.length; ++i) {
              _this.pathLength += _this.dataArray[i].pathLength;
          }
          _this.on('dataChange.konva', function () {
              this.dataArray = Path.parsePathData(this.data());
              this.pathLength = 0;
              for (var i = 0; i < this.dataArray.length; ++i) {
                  this.pathLength += this.dataArray[i].pathLength;
              }
          });
          return _this;
      }
      Path.prototype._sceneFunc = function (context) {
          var ca = this.dataArray;
          // context position
          context.beginPath();
          var isClosed = false;
          for (var n = 0; n < ca.length; n++) {
              var c = ca[n].command;
              var p = ca[n].points;
              switch (c) {
                  case 'L':
                      context.lineTo(p[0], p[1]);
                      break;
                  case 'M':
                      context.moveTo(p[0], p[1]);
                      break;
                  case 'C':
                      context.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]);
                      break;
                  case 'Q':
                      context.quadraticCurveTo(p[0], p[1], p[2], p[3]);
                      break;
                  case 'A':
                      var cx = p[0], cy = p[1], rx = p[2], ry = p[3], theta = p[4], dTheta = p[5], psi = p[6], fs = p[7];
                      var r = rx > ry ? rx : ry;
                      var scaleX = rx > ry ? 1 : rx / ry;
                      var scaleY = rx > ry ? ry / rx : 1;
                      context.translate(cx, cy);
                      context.rotate(psi);
                      context.scale(scaleX, scaleY);
                      context.arc(0, 0, r, theta, theta + dTheta, 1 - fs);
                      context.scale(1 / scaleX, 1 / scaleY);
                      context.rotate(-psi);
                      context.translate(-cx, -cy);
                      break;
                  case 'z':
                      isClosed = true;
                      context.closePath();
                      break;
              }
          }
          if (!isClosed && !this.hasFill()) {
              context.strokeShape(this);
          }
          else {
              context.fillStrokeShape(this);
          }
      };
      Path.prototype.getSelfRect = function () {
          var points = [];
          this.dataArray.forEach(function (data) {
              if (data.command === 'A') {
                  // Approximates by breaking curve into line segments
                  var start = data.points[4];
                  // 4 = theta
                  var dTheta = data.points[5];
                  // 5 = dTheta
                  var end = data.points[4] + dTheta;
                  var inc = Math.PI / 180.0;
                  // 1 degree resolution
                  if (Math.abs(start - end) < inc) {
                      inc = Math.abs(start - end);
                  }
                  if (dTheta < 0) {
                      // clockwise
                      for (var t = start - inc; t > end; t -= inc) {
                          var point = Path.getPointOnEllipticalArc(data.points[0], data.points[1], data.points[2], data.points[3], t, 0);
                          points.push(point.x, point.y);
                      }
                  }
                  else {
                      // counter-clockwise
                      for (var t = start + inc; t < end; t += inc) {
                          var point = Path.getPointOnEllipticalArc(data.points[0], data.points[1], data.points[2], data.points[3], t, 0);
                          points.push(point.x, point.y);
                      }
                  }
              }
              else if (data.command === 'C') {
                  // Approximates by breaking curve into 100 line segments
                  for (var t = 0.0; t <= 1; t += 0.01) {
                      var point = Path.getPointOnCubicBezier(t, data.start.x, data.start.y, data.points[0], data.points[1], data.points[2], data.points[3], data.points[4], data.points[5]);
                      points.push(point.x, point.y);
                  }
              }
              else {
                  // TODO: how can we calculate bezier curves better?
                  points = points.concat(data.points);
              }
          });
          var minX = points[0];
          var maxX = points[0];
          var minY = points[1];
          var maxY = points[1];
          var x, y;
          for (var i = 0; i < points.length / 2; i++) {
              x = points[i * 2];
              y = points[i * 2 + 1];
              // skip bad values
              if (!isNaN(x)) {
                  minX = Math.min(minX, x);
                  maxX = Math.max(maxX, x);
              }
              if (!isNaN(y)) {
                  minY = Math.min(minY, y);
                  maxY = Math.max(maxY, y);
              }
          }
          return {
              x: Math.round(minX),
              y: Math.round(minY),
              width: Math.round(maxX - minX),
              height: Math.round(maxY - minY)
          };
      };
      /**
       * Return length of the path.
       * @method
       * @name Konva.Path#getLength
       * @returns {Number} length
       * @example
       * var length = path.getLength();
       */
      Path.prototype.getLength = function () {
          return this.pathLength;
      };
      /**
       * Get point on path at specific length of the path
       * @method
       * @name Konva.Path#getPointAtLength
       * @param {Number} length length
       * @returns {Object} point {x,y} point
       * @example
       * var point = path.getPointAtLength(10);
       */
      Path.prototype.getPointAtLength = function (length) {
          var point, i = 0, ii = this.dataArray.length;
          if (!ii) {
              return null;
          }
          while (i < ii && length > this.dataArray[i].pathLength) {
              length -= this.dataArray[i].pathLength;
              ++i;
          }
          if (i === ii) {
              point = this.dataArray[i - 1].points.slice(-2);
              return {
                  x: point[0],
                  y: point[1]
              };
          }
          if (length < 0.01) {
              point = this.dataArray[i].points.slice(0, 2);
              return {
                  x: point[0],
                  y: point[1]
              };
          }
          var cp = this.dataArray[i];
          var p = cp.points;
          switch (cp.command) {
              case 'L':
                  return Path.getPointOnLine(length, cp.start.x, cp.start.y, p[0], p[1]);
              case 'C':
                  return Path.getPointOnCubicBezier(length / cp.pathLength, cp.start.x, cp.start.y, p[0], p[1], p[2], p[3], p[4], p[5]);
              case 'Q':
                  return Path.getPointOnQuadraticBezier(length / cp.pathLength, cp.start.x, cp.start.y, p[0], p[1], p[2], p[3]);
              case 'A':
                  var cx = p[0], cy = p[1], rx = p[2], ry = p[3], theta = p[4], dTheta = p[5], psi = p[6];
                  theta += (dTheta * length) / cp.pathLength;
                  return Path.getPointOnEllipticalArc(cx, cy, rx, ry, theta, psi);
          }
          return null;
      };
      Path.getLineLength = function (x1, y1, x2, y2) {
          return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
      };
      Path.getPointOnLine = function (dist, P1x, P1y, P2x, P2y, fromX, fromY) {
          if (fromX === undefined) {
              fromX = P1x;
          }
          if (fromY === undefined) {
              fromY = P1y;
          }
          var m = (P2y - P1y) / (P2x - P1x + 0.00000001);
          var run = Math.sqrt((dist * dist) / (1 + m * m));
          if (P2x < P1x) {
              run *= -1;
          }
          var rise = m * run;
          var pt;
          if (P2x === P1x) {
              // vertical line
              pt = {
                  x: fromX,
                  y: fromY + rise
              };
          }
          else if ((fromY - P1y) / (fromX - P1x + 0.00000001) === m) {
              pt = {
                  x: fromX + run,
                  y: fromY + rise
              };
          }
          else {
              var ix, iy;
              var len = this.getLineLength(P1x, P1y, P2x, P2y);
              if (len < 0.00000001) {
                  return undefined;
              }
              var u = (fromX - P1x) * (P2x - P1x) + (fromY - P1y) * (P2y - P1y);
              u = u / (len * len);
              ix = P1x + u * (P2x - P1x);
              iy = P1y + u * (P2y - P1y);
              var pRise = this.getLineLength(fromX, fromY, ix, iy);
              var pRun = Math.sqrt(dist * dist - pRise * pRise);
              run = Math.sqrt((pRun * pRun) / (1 + m * m));
              if (P2x < P1x) {
                  run *= -1;
              }
              rise = m * run;
              pt = {
                  x: ix + run,
                  y: iy + rise
              };
          }
          return pt;
      };
      Path.getPointOnCubicBezier = function (pct, P1x, P1y, P2x, P2y, P3x, P3y, P4x, P4y) {
          function CB1(t) {
              return t * t * t;
          }
          function CB2(t) {
              return 3 * t * t * (1 - t);
          }
          function CB3(t) {
              return 3 * t * (1 - t) * (1 - t);
          }
          function CB4(t) {
              return (1 - t) * (1 - t) * (1 - t);
          }
          var x = P4x * CB1(pct) + P3x * CB2(pct) + P2x * CB3(pct) + P1x * CB4(pct);
          var y = P4y * CB1(pct) + P3y * CB2(pct) + P2y * CB3(pct) + P1y * CB4(pct);
          return {
              x: x,
              y: y
          };
      };
      Path.getPointOnQuadraticBezier = function (pct, P1x, P1y, P2x, P2y, P3x, P3y) {
          function QB1(t) {
              return t * t;
          }
          function QB2(t) {
              return 2 * t * (1 - t);
          }
          function QB3(t) {
              return (1 - t) * (1 - t);
          }
          var x = P3x * QB1(pct) + P2x * QB2(pct) + P1x * QB3(pct);
          var y = P3y * QB1(pct) + P2y * QB2(pct) + P1y * QB3(pct);
          return {
              x: x,
              y: y
          };
      };
      Path.getPointOnEllipticalArc = function (cx, cy, rx, ry, theta, psi) {
          var cosPsi = Math.cos(psi), sinPsi = Math.sin(psi);
          var pt = {
              x: rx * Math.cos(theta),
              y: ry * Math.sin(theta)
          };
          return {
              x: cx + (pt.x * cosPsi - pt.y * sinPsi),
              y: cy + (pt.x * sinPsi + pt.y * cosPsi)
          };
      };
      /*
       * get parsed data array from the data
       *  string.  V, v, H, h, and l data are converted to
       *  L data for the purpose of high performance Path
       *  rendering
       */
      Path.parsePathData = function (data) {
          // Path Data Segment must begin with a moveTo
          //m (x y)+  Relative moveTo (subsequent points are treated as lineTo)
          //M (x y)+  Absolute moveTo (subsequent points are treated as lineTo)
          //l (x y)+  Relative lineTo
          //L (x y)+  Absolute LineTo
          //h (x)+    Relative horizontal lineTo
          //H (x)+    Absolute horizontal lineTo
          //v (y)+    Relative vertical lineTo
          //V (y)+    Absolute vertical lineTo
          //z (closepath)
          //Z (closepath)
          //c (x1 y1 x2 y2 x y)+ Relative Bezier curve
          //C (x1 y1 x2 y2 x y)+ Absolute Bezier curve
          //q (x1 y1 x y)+       Relative Quadratic Bezier
          //Q (x1 y1 x y)+       Absolute Quadratic Bezier
          //t (x y)+    Shorthand/Smooth Relative Quadratic Bezier
          //T (x y)+    Shorthand/Smooth Absolute Quadratic Bezier
          //s (x2 y2 x y)+       Shorthand/Smooth Relative Bezier curve
          //S (x2 y2 x y)+       Shorthand/Smooth Absolute Bezier curve
          //a (rx ry x-axis-rotation large-arc-flag sweep-flag x y)+     Relative Elliptical Arc
          //A (rx ry x-axis-rotation large-arc-flag sweep-flag x y)+  Absolute Elliptical Arc
          // return early if data is not defined
          if (!data) {
              return [];
          }
          // command string
          var cs = data;
          // command chars
          var cc = [
              'm',
              'M',
              'l',
              'L',
              'v',
              'V',
              'h',
              'H',
              'z',
              'Z',
              'c',
              'C',
              'q',
              'Q',
              't',
              'T',
              's',
              'S',
              'a',
              'A'
          ];
          // convert white spaces to commas
          cs = cs.replace(new RegExp(' ', 'g'), ',');
          // create pipes so that we can split the data
          for (var n = 0; n < cc.length; n++) {
              cs = cs.replace(new RegExp(cc[n], 'g'), '|' + cc[n]);
          }
          // create array
          var arr = cs.split('|');
          var ca = [];
          var coords = [];
          // init context point
          var cpx = 0;
          var cpy = 0;
          var re = /([-+]?((\d+\.\d+)|((\d+)|(\.\d+)))(?:e[-+]?\d+)?)/gi;
          var match;
          for (n = 1; n < arr.length; n++) {
              var str = arr[n];
              var c = str.charAt(0);
              str = str.slice(1);
              coords.length = 0;
              while ((match = re.exec(str))) {
                  coords.push(match[0]);
              }
              // while ((match = re.exec(str))) {
              //   coords.push(match[0]);
              // }
              var p = [];
              for (var j = 0, jlen = coords.length; j < jlen; j++) {
                  var parsed = parseFloat(coords[j]);
                  if (!isNaN(parsed)) {
                      p.push(parsed);
                  }
                  else {
                      p.push(0);
                  }
              }
              while (p.length > 0) {
                  if (isNaN(p[0])) {
                      // case for a trailing comma before next command
                      break;
                  }
                  var cmd = null;
                  var points = [];
                  var startX = cpx, startY = cpy;
                  // Move var from within the switch to up here (jshint)
                  var prevCmd, ctlPtx, ctlPty; // Ss, Tt
                  var rx, ry, psi, fa, fs, x1, y1; // Aa
                  // convert l, H, h, V, and v to L
                  switch (c) {
                      // Note: Keep the lineTo's above the moveTo's in this switch
                      case 'l':
                          cpx += p.shift();
                          cpy += p.shift();
                          cmd = 'L';
                          points.push(cpx, cpy);
                          break;
                      case 'L':
                          cpx = p.shift();
                          cpy = p.shift();
                          points.push(cpx, cpy);
                          break;
                      // Note: lineTo handlers need to be above this point
                      case 'm':
                          var dx = p.shift();
                          var dy = p.shift();
                          cpx += dx;
                          cpy += dy;
                          cmd = 'M';
                          // After closing the path move the current position
                          // to the the first point of the path (if any).
                          if (ca.length > 2 && ca[ca.length - 1].command === 'z') {
                              for (var idx = ca.length - 2; idx >= 0; idx--) {
                                  if (ca[idx].command === 'M') {
                                      cpx = ca[idx].points[0] + dx;
                                      cpy = ca[idx].points[1] + dy;
                                      break;
                                  }
                              }
                          }
                          points.push(cpx, cpy);
                          c = 'l';
                          // subsequent points are treated as relative lineTo
                          break;
                      case 'M':
                          cpx = p.shift();
                          cpy = p.shift();
                          cmd = 'M';
                          points.push(cpx, cpy);
                          c = 'L';
                          // subsequent points are treated as absolute lineTo
                          break;
                      case 'h':
                          cpx += p.shift();
                          cmd = 'L';
                          points.push(cpx, cpy);
                          break;
                      case 'H':
                          cpx = p.shift();
                          cmd = 'L';
                          points.push(cpx, cpy);
                          break;
                      case 'v':
                          cpy += p.shift();
                          cmd = 'L';
                          points.push(cpx, cpy);
                          break;
                      case 'V':
                          cpy = p.shift();
                          cmd = 'L';
                          points.push(cpx, cpy);
                          break;
                      case 'C':
                          points.push(p.shift(), p.shift(), p.shift(), p.shift());
                          cpx = p.shift();
                          cpy = p.shift();
                          points.push(cpx, cpy);
                          break;
                      case 'c':
                          points.push(cpx + p.shift(), cpy + p.shift(), cpx + p.shift(), cpy + p.shift());
                          cpx += p.shift();
                          cpy += p.shift();
                          cmd = 'C';
                          points.push(cpx, cpy);
                          break;
                      case 'S':
                          ctlPtx = cpx;
                          ctlPty = cpy;
                          prevCmd = ca[ca.length - 1];
                          if (prevCmd.command === 'C') {
                              ctlPtx = cpx + (cpx - prevCmd.points[2]);
                              ctlPty = cpy + (cpy - prevCmd.points[3]);
                          }
                          points.push(ctlPtx, ctlPty, p.shift(), p.shift());
                          cpx = p.shift();
                          cpy = p.shift();
                          cmd = 'C';
                          points.push(cpx, cpy);
                          break;
                      case 's':
                          ctlPtx = cpx;
                          ctlPty = cpy;
                          prevCmd = ca[ca.length - 1];
                          if (prevCmd.command === 'C') {
                              ctlPtx = cpx + (cpx - prevCmd.points[2]);
                              ctlPty = cpy + (cpy - prevCmd.points[3]);
                          }
                          points.push(ctlPtx, ctlPty, cpx + p.shift(), cpy + p.shift());
                          cpx += p.shift();
                          cpy += p.shift();
                          cmd = 'C';
                          points.push(cpx, cpy);
                          break;
                      case 'Q':
                          points.push(p.shift(), p.shift());
                          cpx = p.shift();
                          cpy = p.shift();
                          points.push(cpx, cpy);
                          break;
                      case 'q':
                          points.push(cpx + p.shift(), cpy + p.shift());
                          cpx += p.shift();
                          cpy += p.shift();
                          cmd = 'Q';
                          points.push(cpx, cpy);
                          break;
                      case 'T':
                          ctlPtx = cpx;
                          ctlPty = cpy;
                          prevCmd = ca[ca.length - 1];
                          if (prevCmd.command === 'Q') {
                              ctlPtx = cpx + (cpx - prevCmd.points[0]);
                              ctlPty = cpy + (cpy - prevCmd.points[1]);
                          }
                          cpx = p.shift();
                          cpy = p.shift();
                          cmd = 'Q';
                          points.push(ctlPtx, ctlPty, cpx, cpy);
                          break;
                      case 't':
                          ctlPtx = cpx;
                          ctlPty = cpy;
                          prevCmd = ca[ca.length - 1];
                          if (prevCmd.command === 'Q') {
                              ctlPtx = cpx + (cpx - prevCmd.points[0]);
                              ctlPty = cpy + (cpy - prevCmd.points[1]);
                          }
                          cpx += p.shift();
                          cpy += p.shift();
                          cmd = 'Q';
                          points.push(ctlPtx, ctlPty, cpx, cpy);
                          break;
                      case 'A':
                          rx = p.shift();
                          ry = p.shift();
                          psi = p.shift();
                          fa = p.shift();
                          fs = p.shift();
                          x1 = cpx;
                          y1 = cpy;
                          cpx = p.shift();
                          cpy = p.shift();
                          cmd = 'A';
                          points = this.convertEndpointToCenterParameterization(x1, y1, cpx, cpy, fa, fs, rx, ry, psi);
                          break;
                      case 'a':
                          rx = p.shift();
                          ry = p.shift();
                          psi = p.shift();
                          fa = p.shift();
                          fs = p.shift();
                          x1 = cpx;
                          y1 = cpy;
                          cpx += p.shift();
                          cpy += p.shift();
                          cmd = 'A';
                          points = this.convertEndpointToCenterParameterization(x1, y1, cpx, cpy, fa, fs, rx, ry, psi);
                          break;
                  }
                  ca.push({
                      command: cmd || c,
                      points: points,
                      start: {
                          x: startX,
                          y: startY
                      },
                      pathLength: this.calcLength(startX, startY, cmd || c, points)
                  });
              }
              if (c === 'z' || c === 'Z') {
                  ca.push({
                      command: 'z',
                      points: [],
                      start: undefined,
                      pathLength: 0
                  });
              }
          }
          return ca;
      };
      Path.calcLength = function (x, y, cmd, points) {
          var len, p1, p2, t;
          var path = Path;
          switch (cmd) {
              case 'L':
                  return path.getLineLength(x, y, points[0], points[1]);
              case 'C':
                  // Approximates by breaking curve into 100 line segments
                  len = 0.0;
                  p1 = path.getPointOnCubicBezier(0, x, y, points[0], points[1], points[2], points[3], points[4], points[5]);
                  for (t = 0.01; t <= 1; t += 0.01) {
                      p2 = path.getPointOnCubicBezier(t, x, y, points[0], points[1], points[2], points[3], points[4], points[5]);
                      len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                      p1 = p2;
                  }
                  return len;
              case 'Q':
                  // Approximates by breaking curve into 100 line segments
                  len = 0.0;
                  p1 = path.getPointOnQuadraticBezier(0, x, y, points[0], points[1], points[2], points[3]);
                  for (t = 0.01; t <= 1; t += 0.01) {
                      p2 = path.getPointOnQuadraticBezier(t, x, y, points[0], points[1], points[2], points[3]);
                      len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                      p1 = p2;
                  }
                  return len;
              case 'A':
                  // Approximates by breaking curve into line segments
                  len = 0.0;
                  var start = points[4];
                  // 4 = theta
                  var dTheta = points[5];
                  // 5 = dTheta
                  var end = points[4] + dTheta;
                  var inc = Math.PI / 180.0;
                  // 1 degree resolution
                  if (Math.abs(start - end) < inc) {
                      inc = Math.abs(start - end);
                  }
                  // Note: for purpose of calculating arc length, not going to worry about rotating X-axis by angle psi
                  p1 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], start, 0);
                  if (dTheta < 0) {
                      // clockwise
                      for (t = start - inc; t > end; t -= inc) {
                          p2 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
                          len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                          p1 = p2;
                      }
                  }
                  else {
                      // counter-clockwise
                      for (t = start + inc; t < end; t += inc) {
                          p2 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
                          len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                          p1 = p2;
                      }
                  }
                  p2 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], end, 0);
                  len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                  return len;
          }
          return 0;
      };
      Path.convertEndpointToCenterParameterization = function (x1, y1, x2, y2, fa, fs, rx, ry, psiDeg) {
          // Derived from: http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
          var psi = psiDeg * (Math.PI / 180.0);
          var xp = (Math.cos(psi) * (x1 - x2)) / 2.0 + (Math.sin(psi) * (y1 - y2)) / 2.0;
          var yp = (-1 * Math.sin(psi) * (x1 - x2)) / 2.0 +
              (Math.cos(psi) * (y1 - y2)) / 2.0;
          var lambda = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);
          if (lambda > 1) {
              rx *= Math.sqrt(lambda);
              ry *= Math.sqrt(lambda);
          }
          var f = Math.sqrt((rx * rx * (ry * ry) - rx * rx * (yp * yp) - ry * ry * (xp * xp)) /
              (rx * rx * (yp * yp) + ry * ry * (xp * xp)));
          if (fa === fs) {
              f *= -1;
          }
          if (isNaN(f)) {
              f = 0;
          }
          var cxp = (f * rx * yp) / ry;
          var cyp = (f * -ry * xp) / rx;
          var cx = (x1 + x2) / 2.0 + Math.cos(psi) * cxp - Math.sin(psi) * cyp;
          var cy = (y1 + y2) / 2.0 + Math.sin(psi) * cxp + Math.cos(psi) * cyp;
          var vMag = function (v) {
              return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
          };
          var vRatio = function (u, v) {
              return (u[0] * v[0] + u[1] * v[1]) / (vMag(u) * vMag(v));
          };
          var vAngle = function (u, v) {
              return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(vRatio(u, v));
          };
          var theta = vAngle([1, 0], [(xp - cxp) / rx, (yp - cyp) / ry]);
          var u = [(xp - cxp) / rx, (yp - cyp) / ry];
          var v = [(-1 * xp - cxp) / rx, (-1 * yp - cyp) / ry];
          var dTheta = vAngle(u, v);
          if (vRatio(u, v) <= -1) {
              dTheta = Math.PI;
          }
          if (vRatio(u, v) >= 1) {
              dTheta = 0;
          }
          if (fs === 0 && dTheta > 0) {
              dTheta = dTheta - 2 * Math.PI;
          }
          if (fs === 1 && dTheta < 0) {
              dTheta = dTheta + 2 * Math.PI;
          }
          return [cx, cy, rx, ry, theta, dTheta, psi, fs];
      };
      return Path;
  }(Shape));
  Path.prototype.className = 'Path';
  Path.prototype._attrsAffectingSize = ['data'];
  _registerNode(Path);
  /**
   * get/set SVG path data string.  This method
   *  also automatically parses the data string
   *  into a data array.  Currently supported SVG data:
   *  M, m, L, l, H, h, V, v, Q, q, T, t, C, c, S, s, A, a, Z, z
   * @name Konva.Path#data
   * @method
   * @param {String} data svg path string
   * @returns {String}
   * @example
   * // get data
   * var data = path.data();
   *
   * // set data
   * path.data('M200,100h100v50z');
   */
  Factory.addGetterSetter(Path, 'data');
  Collection.mapMethods(Path);

  /**
   * Rect constructor
   * @constructor
   * @memberof Konva
   * @augments Konva.Shape
   * @param {Object} config
   * @param {Number} [config.cornerRadius]
   * @param {String} [config.fill] fill color
     * @param {Image} [config.fillPatternImage] fill pattern image
     * @param {Number} [config.fillPatternX]
     * @param {Number} [config.fillPatternY]
     * @param {Object} [config.fillPatternOffset] object with x and y component
     * @param {Number} [config.fillPatternOffsetX] 
     * @param {Number} [config.fillPatternOffsetY] 
     * @param {Object} [config.fillPatternScale] object with x and y component
     * @param {Number} [config.fillPatternScaleX]
     * @param {Number} [config.fillPatternScaleY]
     * @param {Number} [config.fillPatternRotation]
     * @param {String} [config.fillPatternRepeat] can be "repeat", "repeat-x", "repeat-y", or "no-repeat".  The default is "no-repeat"
     * @param {Object} [config.fillLinearGradientStartPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientStartPointX]
     * @param {Number} [config.fillLinearGradientStartPointY]
     * @param {Object} [config.fillLinearGradientEndPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientEndPointX]
     * @param {Number} [config.fillLinearGradientEndPointY]
     * @param {Array} [config.fillLinearGradientColorStops] array of color stops
     * @param {Object} [config.fillRadialGradientStartPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientStartPointX]
     * @param {Number} [config.fillRadialGradientStartPointY]
     * @param {Object} [config.fillRadialGradientEndPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientEndPointX] 
     * @param {Number} [config.fillRadialGradientEndPointY] 
     * @param {Number} [config.fillRadialGradientStartRadius]
     * @param {Number} [config.fillRadialGradientEndRadius]
     * @param {Array} [config.fillRadialGradientColorStops] array of color stops
     * @param {Boolean} [config.fillEnabled] flag which enables or disables the fill.  The default value is true
     * @param {String} [config.fillPriority] can be color, linear-gradient, radial-graident, or pattern.  The default value is color.  The fillPriority property makes it really easy to toggle between different fill types.  For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
     * @param {String} [config.stroke] stroke color
     * @param {Number} [config.strokeWidth] stroke width
     * @param {Number} [config.hitStrokeWidth] size of the stroke on hit canvas.  The default is "auto" - equals to strokeWidth
     * @param {Boolean} [config.strokeHitEnabled] flag which enables or disables stroke hit region.  The default is true
     * @param {Boolean} [config.perfectDrawEnabled] flag which enables or disables using buffer canvas.  The default is true
     * @param {Boolean} [config.shadowForStrokeEnabled] flag which enables or disables shadow for stroke.  The default is true
     * @param {Boolean} [config.strokeScaleEnabled] flag which enables or disables stroke scale.  The default is true
     * @param {Boolean} [config.strokeEnabled] flag which enables or disables the stroke.  The default value is true
     * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
     *  is miter
     * @param {String} [config.lineCap] can be butt, round, or square.  The default
     *  is butt
     * @param {String} [config.shadowColor]
     * @param {Number} [config.shadowBlur]
     * @param {Object} [config.shadowOffset] object with x and y component
     * @param {Number} [config.shadowOffsetX]
     * @param {Number} [config.shadowOffsetY]
     * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
     *  between 0 and 1
     * @param {Boolean} [config.shadowEnabled] flag which enables or disables the shadow.  The default value is true
     * @param {Array} [config.dash]
     * @param {Boolean} [config.dashEnabled] flag which enables or disables the dashArray.  The default value is true

   * @param {Number} [config.x]
     * @param {Number} [config.y]
     * @param {Number} [config.width]
     * @param {Number} [config.height]
     * @param {Boolean} [config.visible]
     * @param {Boolean} [config.listening] whether or not the node is listening for events
     * @param {String} [config.id] unique id
     * @param {String} [config.name] non-unique name
     * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
     * @param {Object} [config.scale] set scale
     * @param {Number} [config.scaleX] set scale x
     * @param {Number} [config.scaleY] set scale y
     * @param {Number} [config.rotation] rotation in degrees
     * @param {Object} [config.offset] offset from center point and rotation point
     * @param {Number} [config.offsetX] set offset x
     * @param {Number} [config.offsetY] set offset y
     * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
     *  the entire stage by dragging any portion of the stage
     * @param {Number} [config.dragDistance]
     * @param {Function} [config.dragBoundFunc]
   * @example
   * var rect = new Konva.Rect({
   *   width: 100,
   *   height: 50,
   *   fill: 'red',
   *   stroke: 'black',
   *   strokeWidth: 5
   * });
   */
  var Rect = /** @class */ (function (_super) {
      __extends(Rect, _super);
      function Rect() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      Rect.prototype._sceneFunc = function (context) {
          var cornerRadius = this.cornerRadius(), width = this.width(), height = this.height();
          context.beginPath();
          if (!cornerRadius) {
              // simple rect - don't bother doing all that complicated maths stuff.
              context.rect(0, 0, width, height);
          }
          else {
              var topLeft = 0;
              var topRight = 0;
              var bottomLeft = 0;
              var bottomRight = 0;
              if (typeof cornerRadius === 'number') {
                  topLeft = topRight = bottomLeft = bottomRight = Math.min(cornerRadius, width / 2, height / 2);
              }
              else {
                  topLeft = Math.min(cornerRadius[0], width / 2, height / 2);
                  topRight = Math.min(cornerRadius[1], width / 2, height / 2);
                  bottomRight = Math.min(cornerRadius[2], width / 2, height / 2);
                  bottomLeft = Math.min(cornerRadius[3], width / 2, height / 2);
              }
              context.moveTo(topLeft, 0);
              context.lineTo(width - topRight, 0);
              context.arc(width - topRight, topRight, topRight, (Math.PI * 3) / 2, 0, false);
              context.lineTo(width, height - bottomRight);
              context.arc(width - bottomRight, height - bottomRight, bottomRight, 0, Math.PI / 2, false);
              context.lineTo(bottomLeft, height);
              context.arc(bottomLeft, height - bottomLeft, bottomLeft, Math.PI / 2, Math.PI, false);
              context.lineTo(0, topLeft);
              context.arc(topLeft, topLeft, topLeft, Math.PI, (Math.PI * 3) / 2, false);
          }
          context.closePath();
          context.fillStrokeShape(this);
      };
      return Rect;
  }(Shape));
  Rect.prototype.className = 'Rect';
  _registerNode(Rect);
  /**
   * get/set corner radius
   * @method
   * @name Konva.Rect#cornerRadius
   * @param {Number} cornerRadius
   * @returns {Number}
   * @example
   * // get corner radius
   * var cornerRadius = rect.cornerRadius();
   *
   * // set corner radius
   * rect.cornerRadius(10);
   *
   * // set different corner radius values
   * // top-left, top-right, bottom-right, bottom-left
   * rect.cornerRadius([0, 10, 20, 30]);
   */
  Factory.addGetterSetter(Rect, 'cornerRadius', 0);
  Collection.mapMethods(Rect);

  /**
   * RegularPolygon constructor. Examples include triangles, squares, pentagons, hexagons, etc.
   * @constructor
   * @memberof Konva
   * @augments Konva.Shape
   * @param {Object} config
   * @param {Number} config.sides
   * @param {Number} config.radius
   * @param {String} [config.fill] fill color
     * @param {Image} [config.fillPatternImage] fill pattern image
     * @param {Number} [config.fillPatternX]
     * @param {Number} [config.fillPatternY]
     * @param {Object} [config.fillPatternOffset] object with x and y component
     * @param {Number} [config.fillPatternOffsetX] 
     * @param {Number} [config.fillPatternOffsetY] 
     * @param {Object} [config.fillPatternScale] object with x and y component
     * @param {Number} [config.fillPatternScaleX]
     * @param {Number} [config.fillPatternScaleY]
     * @param {Number} [config.fillPatternRotation]
     * @param {String} [config.fillPatternRepeat] can be "repeat", "repeat-x", "repeat-y", or "no-repeat".  The default is "no-repeat"
     * @param {Object} [config.fillLinearGradientStartPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientStartPointX]
     * @param {Number} [config.fillLinearGradientStartPointY]
     * @param {Object} [config.fillLinearGradientEndPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientEndPointX]
     * @param {Number} [config.fillLinearGradientEndPointY]
     * @param {Array} [config.fillLinearGradientColorStops] array of color stops
     * @param {Object} [config.fillRadialGradientStartPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientStartPointX]
     * @param {Number} [config.fillRadialGradientStartPointY]
     * @param {Object} [config.fillRadialGradientEndPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientEndPointX] 
     * @param {Number} [config.fillRadialGradientEndPointY] 
     * @param {Number} [config.fillRadialGradientStartRadius]
     * @param {Number} [config.fillRadialGradientEndRadius]
     * @param {Array} [config.fillRadialGradientColorStops] array of color stops
     * @param {Boolean} [config.fillEnabled] flag which enables or disables the fill.  The default value is true
     * @param {String} [config.fillPriority] can be color, linear-gradient, radial-graident, or pattern.  The default value is color.  The fillPriority property makes it really easy to toggle between different fill types.  For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
     * @param {String} [config.stroke] stroke color
     * @param {Number} [config.strokeWidth] stroke width
     * @param {Number} [config.hitStrokeWidth] size of the stroke on hit canvas.  The default is "auto" - equals to strokeWidth
     * @param {Boolean} [config.strokeHitEnabled] flag which enables or disables stroke hit region.  The default is true
     * @param {Boolean} [config.perfectDrawEnabled] flag which enables or disables using buffer canvas.  The default is true
     * @param {Boolean} [config.shadowForStrokeEnabled] flag which enables or disables shadow for stroke.  The default is true
     * @param {Boolean} [config.strokeScaleEnabled] flag which enables or disables stroke scale.  The default is true
     * @param {Boolean} [config.strokeEnabled] flag which enables or disables the stroke.  The default value is true
     * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
     *  is miter
     * @param {String} [config.lineCap] can be butt, round, or square.  The default
     *  is butt
     * @param {String} [config.shadowColor]
     * @param {Number} [config.shadowBlur]
     * @param {Object} [config.shadowOffset] object with x and y component
     * @param {Number} [config.shadowOffsetX]
     * @param {Number} [config.shadowOffsetY]
     * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
     *  between 0 and 1
     * @param {Boolean} [config.shadowEnabled] flag which enables or disables the shadow.  The default value is true
     * @param {Array} [config.dash]
     * @param {Boolean} [config.dashEnabled] flag which enables or disables the dashArray.  The default value is true

   * @param {Number} [config.x]
     * @param {Number} [config.y]
     * @param {Number} [config.width]
     * @param {Number} [config.height]
     * @param {Boolean} [config.visible]
     * @param {Boolean} [config.listening] whether or not the node is listening for events
     * @param {String} [config.id] unique id
     * @param {String} [config.name] non-unique name
     * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
     * @param {Object} [config.scale] set scale
     * @param {Number} [config.scaleX] set scale x
     * @param {Number} [config.scaleY] set scale y
     * @param {Number} [config.rotation] rotation in degrees
     * @param {Object} [config.offset] offset from center point and rotation point
     * @param {Number} [config.offsetX] set offset x
     * @param {Number} [config.offsetY] set offset y
     * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
     *  the entire stage by dragging any portion of the stage
     * @param {Number} [config.dragDistance]
     * @param {Function} [config.dragBoundFunc]
   * @example
   * var hexagon = new Konva.RegularPolygon({
   *   x: 100,
   *   y: 200,
   *   sides: 6,
   *   radius: 70,
   *   fill: 'red',
   *   stroke: 'black',
   *   strokeWidth: 4
   * });
   */
  var RegularPolygon = /** @class */ (function (_super) {
      __extends(RegularPolygon, _super);
      function RegularPolygon() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      RegularPolygon.prototype._sceneFunc = function (context) {
          var sides = this.sides(), radius = this.radius(), n, x, y;
          context.beginPath();
          context.moveTo(0, 0 - radius);
          for (n = 1; n < sides; n++) {
              x = radius * Math.sin((n * 2 * Math.PI) / sides);
              y = -1 * radius * Math.cos((n * 2 * Math.PI) / sides);
              context.lineTo(x, y);
          }
          context.closePath();
          context.fillStrokeShape(this);
      };
      RegularPolygon.prototype.getWidth = function () {
          return this.radius() * 2;
      };
      RegularPolygon.prototype.getHeight = function () {
          return this.radius() * 2;
      };
      RegularPolygon.prototype.setWidth = function (width) {
          this.radius(width / 2);
      };
      RegularPolygon.prototype.setHeight = function (height) {
          this.radius(height / 2);
      };
      return RegularPolygon;
  }(Shape));
  RegularPolygon.prototype.className = 'RegularPolygon';
  RegularPolygon.prototype._centroid = true;
  RegularPolygon.prototype._attrsAffectingSize = ['radius'];
  _registerNode(RegularPolygon);
  /**
   * get/set radius
   * @method
   * @name Konva.RegularPolygon#radius
   * @param {Number} radius
   * @returns {Number}
   * @example
   * // get radius
   * var radius = shape.radius();
   *
   * // set radius
   * shape.radius(10);
   */
  Factory.addGetterSetter(RegularPolygon, 'radius', 0, getNumberValidator());
  /**
   * get/set sides
   * @method
   * @name Konva.RegularPolygon#sides
   * @param {Number} sides
   * @returns {Number}
   * @example
   * // get sides
   * var sides = shape.sides();
   *
   * // set sides
   * shape.sides(10);
   */
  Factory.addGetterSetter(RegularPolygon, 'sides', 0, getNumberValidator());
  Collection.mapMethods(RegularPolygon);

  var PIx2 = Math.PI * 2;
  /**
   * Ring constructor
   * @constructor
   * @augments Konva.Shape
   * @memberof Konva
   * @param {Object} config
   * @param {Number} config.innerRadius
   * @param {Number} config.outerRadius
   * @param {Boolean} [config.clockwise]
   * @param {String} [config.fill] fill color
     * @param {Image} [config.fillPatternImage] fill pattern image
     * @param {Number} [config.fillPatternX]
     * @param {Number} [config.fillPatternY]
     * @param {Object} [config.fillPatternOffset] object with x and y component
     * @param {Number} [config.fillPatternOffsetX] 
     * @param {Number} [config.fillPatternOffsetY] 
     * @param {Object} [config.fillPatternScale] object with x and y component
     * @param {Number} [config.fillPatternScaleX]
     * @param {Number} [config.fillPatternScaleY]
     * @param {Number} [config.fillPatternRotation]
     * @param {String} [config.fillPatternRepeat] can be "repeat", "repeat-x", "repeat-y", or "no-repeat".  The default is "no-repeat"
     * @param {Object} [config.fillLinearGradientStartPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientStartPointX]
     * @param {Number} [config.fillLinearGradientStartPointY]
     * @param {Object} [config.fillLinearGradientEndPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientEndPointX]
     * @param {Number} [config.fillLinearGradientEndPointY]
     * @param {Array} [config.fillLinearGradientColorStops] array of color stops
     * @param {Object} [config.fillRadialGradientStartPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientStartPointX]
     * @param {Number} [config.fillRadialGradientStartPointY]
     * @param {Object} [config.fillRadialGradientEndPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientEndPointX] 
     * @param {Number} [config.fillRadialGradientEndPointY] 
     * @param {Number} [config.fillRadialGradientStartRadius]
     * @param {Number} [config.fillRadialGradientEndRadius]
     * @param {Array} [config.fillRadialGradientColorStops] array of color stops
     * @param {Boolean} [config.fillEnabled] flag which enables or disables the fill.  The default value is true
     * @param {String} [config.fillPriority] can be color, linear-gradient, radial-graident, or pattern.  The default value is color.  The fillPriority property makes it really easy to toggle between different fill types.  For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
     * @param {String} [config.stroke] stroke color
     * @param {Number} [config.strokeWidth] stroke width
     * @param {Number} [config.hitStrokeWidth] size of the stroke on hit canvas.  The default is "auto" - equals to strokeWidth
     * @param {Boolean} [config.strokeHitEnabled] flag which enables or disables stroke hit region.  The default is true
     * @param {Boolean} [config.perfectDrawEnabled] flag which enables or disables using buffer canvas.  The default is true
     * @param {Boolean} [config.shadowForStrokeEnabled] flag which enables or disables shadow for stroke.  The default is true
     * @param {Boolean} [config.strokeScaleEnabled] flag which enables or disables stroke scale.  The default is true
     * @param {Boolean} [config.strokeEnabled] flag which enables or disables the stroke.  The default value is true
     * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
     *  is miter
     * @param {String} [config.lineCap] can be butt, round, or square.  The default
     *  is butt
     * @param {String} [config.shadowColor]
     * @param {Number} [config.shadowBlur]
     * @param {Object} [config.shadowOffset] object with x and y component
     * @param {Number} [config.shadowOffsetX]
     * @param {Number} [config.shadowOffsetY]
     * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
     *  between 0 and 1
     * @param {Boolean} [config.shadowEnabled] flag which enables or disables the shadow.  The default value is true
     * @param {Array} [config.dash]
     * @param {Boolean} [config.dashEnabled] flag which enables or disables the dashArray.  The default value is true

   * @param {Number} [config.x]
     * @param {Number} [config.y]
     * @param {Number} [config.width]
     * @param {Number} [config.height]
     * @param {Boolean} [config.visible]
     * @param {Boolean} [config.listening] whether or not the node is listening for events
     * @param {String} [config.id] unique id
     * @param {String} [config.name] non-unique name
     * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
     * @param {Object} [config.scale] set scale
     * @param {Number} [config.scaleX] set scale x
     * @param {Number} [config.scaleY] set scale y
     * @param {Number} [config.rotation] rotation in degrees
     * @param {Object} [config.offset] offset from center point and rotation point
     * @param {Number} [config.offsetX] set offset x
     * @param {Number} [config.offsetY] set offset y
     * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
     *  the entire stage by dragging any portion of the stage
     * @param {Number} [config.dragDistance]
     * @param {Function} [config.dragBoundFunc]
   * @example
   * var ring = new Konva.Ring({
   *   innerRadius: 40,
   *   outerRadius: 80,
   *   fill: 'red',
   *   stroke: 'black',
   *   strokeWidth: 5
   * });
   */
  var Ring = /** @class */ (function (_super) {
      __extends(Ring, _super);
      function Ring() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      Ring.prototype._sceneFunc = function (context) {
          context.beginPath();
          context.arc(0, 0, this.innerRadius(), 0, PIx2, false);
          context.moveTo(this.outerRadius(), 0);
          context.arc(0, 0, this.outerRadius(), PIx2, 0, true);
          context.closePath();
          context.fillStrokeShape(this);
      };
      Ring.prototype.getWidth = function () {
          return this.outerRadius() * 2;
      };
      Ring.prototype.getHeight = function () {
          return this.outerRadius() * 2;
      };
      Ring.prototype.setWidth = function (width) {
          this.outerRadius(width / 2);
      };
      Ring.prototype.setHeight = function (height) {
          this.outerRadius(height / 2);
      };
      return Ring;
  }(Shape));
  Ring.prototype.className = 'Ring';
  Ring.prototype._centroid = true;
  Ring.prototype._attrsAffectingSize = ['innerRadius', 'outerRadius'];
  _registerNode(Ring);
  /**
   * get/set innerRadius
   * @method
   * @name Konva.Ring#innerRadius
   * @param {Number} innerRadius
   * @returns {Number}
   * @example
   * // get inner radius
   * var innerRadius = ring.innerRadius();
   *
   * // set inner radius
   * ring.innerRadius(20);
   */
  Factory.addGetterSetter(Ring, 'innerRadius', 0, getNumberValidator());
  /**
   * get/set outerRadius
   * @name Konva.Ring#outerRadius
   * @method
   * @param {Number} outerRadius
   * @returns {Number}
   * @example
   * // get outer radius
   * var outerRadius = ring.outerRadius();
   *
   * // set outer radius
   * ring.outerRadius(20);
   */
  Factory.addGetterSetter(Ring, 'outerRadius', 0, getNumberValidator());
  Collection.mapMethods(Ring);

  /**
   * Sprite constructor
   * @constructor
   * @memberof Konva
   * @augments Konva.Shape
   * @param {Object} config
   * @param {String} config.animation animation key
   * @param {Object} config.animations animation map
   * @param {Integer} [config.frameIndex] animation frame index
   * @param {Image} config.image image object
   * @param {Integer} [config.frameRate] animation frame rate
   * @param {String} [config.fill] fill color
     * @param {Image} [config.fillPatternImage] fill pattern image
     * @param {Number} [config.fillPatternX]
     * @param {Number} [config.fillPatternY]
     * @param {Object} [config.fillPatternOffset] object with x and y component
     * @param {Number} [config.fillPatternOffsetX] 
     * @param {Number} [config.fillPatternOffsetY] 
     * @param {Object} [config.fillPatternScale] object with x and y component
     * @param {Number} [config.fillPatternScaleX]
     * @param {Number} [config.fillPatternScaleY]
     * @param {Number} [config.fillPatternRotation]
     * @param {String} [config.fillPatternRepeat] can be "repeat", "repeat-x", "repeat-y", or "no-repeat".  The default is "no-repeat"
     * @param {Object} [config.fillLinearGradientStartPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientStartPointX]
     * @param {Number} [config.fillLinearGradientStartPointY]
     * @param {Object} [config.fillLinearGradientEndPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientEndPointX]
     * @param {Number} [config.fillLinearGradientEndPointY]
     * @param {Array} [config.fillLinearGradientColorStops] array of color stops
     * @param {Object} [config.fillRadialGradientStartPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientStartPointX]
     * @param {Number} [config.fillRadialGradientStartPointY]
     * @param {Object} [config.fillRadialGradientEndPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientEndPointX] 
     * @param {Number} [config.fillRadialGradientEndPointY] 
     * @param {Number} [config.fillRadialGradientStartRadius]
     * @param {Number} [config.fillRadialGradientEndRadius]
     * @param {Array} [config.fillRadialGradientColorStops] array of color stops
     * @param {Boolean} [config.fillEnabled] flag which enables or disables the fill.  The default value is true
     * @param {String} [config.fillPriority] can be color, linear-gradient, radial-graident, or pattern.  The default value is color.  The fillPriority property makes it really easy to toggle between different fill types.  For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
     * @param {String} [config.stroke] stroke color
     * @param {Number} [config.strokeWidth] stroke width
     * @param {Number} [config.hitStrokeWidth] size of the stroke on hit canvas.  The default is "auto" - equals to strokeWidth
     * @param {Boolean} [config.strokeHitEnabled] flag which enables or disables stroke hit region.  The default is true
     * @param {Boolean} [config.perfectDrawEnabled] flag which enables or disables using buffer canvas.  The default is true
     * @param {Boolean} [config.shadowForStrokeEnabled] flag which enables or disables shadow for stroke.  The default is true
     * @param {Boolean} [config.strokeScaleEnabled] flag which enables or disables stroke scale.  The default is true
     * @param {Boolean} [config.strokeEnabled] flag which enables or disables the stroke.  The default value is true
     * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
     *  is miter
     * @param {String} [config.lineCap] can be butt, round, or square.  The default
     *  is butt
     * @param {String} [config.shadowColor]
     * @param {Number} [config.shadowBlur]
     * @param {Object} [config.shadowOffset] object with x and y component
     * @param {Number} [config.shadowOffsetX]
     * @param {Number} [config.shadowOffsetY]
     * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
     *  between 0 and 1
     * @param {Boolean} [config.shadowEnabled] flag which enables or disables the shadow.  The default value is true
     * @param {Array} [config.dash]
     * @param {Boolean} [config.dashEnabled] flag which enables or disables the dashArray.  The default value is true

   * @param {Number} [config.x]
     * @param {Number} [config.y]
     * @param {Number} [config.width]
     * @param {Number} [config.height]
     * @param {Boolean} [config.visible]
     * @param {Boolean} [config.listening] whether or not the node is listening for events
     * @param {String} [config.id] unique id
     * @param {String} [config.name] non-unique name
     * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
     * @param {Object} [config.scale] set scale
     * @param {Number} [config.scaleX] set scale x
     * @param {Number} [config.scaleY] set scale y
     * @param {Number} [config.rotation] rotation in degrees
     * @param {Object} [config.offset] offset from center point and rotation point
     * @param {Number} [config.offsetX] set offset x
     * @param {Number} [config.offsetY] set offset y
     * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
     *  the entire stage by dragging any portion of the stage
     * @param {Number} [config.dragDistance]
     * @param {Function} [config.dragBoundFunc]
   * @example
   * var imageObj = new Image();
   * imageObj.onload = function() {
   *   var sprite = new Konva.Sprite({
   *     x: 200,
   *     y: 100,
   *     image: imageObj,
   *     animation: 'standing',
   *     animations: {
   *       standing: [
   *         // x, y, width, height (6 frames)
   *         0, 0, 49, 109,
   *         52, 0, 49, 109,
   *         105, 0, 49, 109,
   *         158, 0, 49, 109,
   *         210, 0, 49, 109,
   *         262, 0, 49, 109
   *       ],
   *       kicking: [
   *         // x, y, width, height (6 frames)
   *         0, 109, 45, 98,
   *         45, 109, 45, 98,
   *         95, 109, 63, 98,
   *         156, 109, 70, 98,
   *         229, 109, 60, 98,
   *         287, 109, 41, 98
   *       ]
   *     },
   *     frameRate: 7,
   *     frameIndex: 0
   *   });
   * };
   * imageObj.src = '/path/to/image.jpg'
   */
  var Sprite = /** @class */ (function (_super) {
      __extends(Sprite, _super);
      function Sprite(config) {
          var _this = _super.call(this, config) || this;
          _this._updated = true;
          _this.anim = new Animation(function () {
              // if we don't need to redraw layer we should return false
              var updated = _this._updated;
              _this._updated = false;
              return updated;
          });
          _this.on('animationChange.konva', function () {
              // reset index when animation changes
              this.frameIndex(0);
          });
          _this.on('frameIndexChange.konva', function () {
              this._updated = true;
          });
          // smooth change for frameRate
          _this.on('frameRateChange.konva', function () {
              if (!this.anim.isRunning()) {
                  return;
              }
              clearInterval(this.interval);
              this._setInterval();
          });
          return _this;
      }
      Sprite.prototype._sceneFunc = function (context) {
          var anim = this.animation(), index = this.frameIndex(), ix4 = index * 4, set = this.animations()[anim], offsets = this.frameOffsets(), x = set[ix4 + 0], y = set[ix4 + 1], width = set[ix4 + 2], height = set[ix4 + 3], image = this.image();
          if (this.hasFill() || this.hasStroke()) {
              context.beginPath();
              context.rect(0, 0, width, height);
              context.closePath();
              context.fillStrokeShape(this);
          }
          if (image) {
              if (offsets) {
                  var offset = offsets[anim], ix2 = index * 2;
                  context.drawImage(image, x, y, width, height, offset[ix2 + 0], offset[ix2 + 1], width, height);
              }
              else {
                  context.drawImage(image, x, y, width, height, 0, 0, width, height);
              }
          }
      };
      Sprite.prototype._hitFunc = function (context) {
          var anim = this.animation(), index = this.frameIndex(), ix4 = index * 4, set = this.animations()[anim], offsets = this.frameOffsets(), width = set[ix4 + 2], height = set[ix4 + 3];
          context.beginPath();
          if (offsets) {
              var offset = offsets[anim];
              var ix2 = index * 2;
              context.rect(offset[ix2 + 0], offset[ix2 + 1], width, height);
          }
          else {
              context.rect(0, 0, width, height);
          }
          context.closePath();
          context.fillShape(this);
      };
      Sprite.prototype._useBufferCanvas = function () {
          return ((this.hasShadow() || this.getAbsoluteOpacity() !== 1) && this.hasStroke());
      };
      Sprite.prototype._setInterval = function () {
          var that = this;
          this.interval = setInterval(function () {
              that._updateIndex();
          }, 1000 / this.frameRate());
      };
      /**
       * start sprite animation
       * @method
       * @name Konva.Sprite#start
       */
      Sprite.prototype.start = function () {
          if (this.isRunning()) {
              return;
          }
          var layer = this.getLayer();
          /*
           * animation object has no executable function because
           *  the updates are done with a fixed FPS with the setInterval
           *  below.  The anim object only needs the layer reference for
           *  redraw
           */
          this.anim.setLayers(layer);
          this._setInterval();
          this.anim.start();
      };
      /**
       * stop sprite animation
       * @method
       * @name Konva.Sprite#stop
       */
      Sprite.prototype.stop = function () {
          this.anim.stop();
          clearInterval(this.interval);
      };
      /**
       * determine if animation of sprite is running or not.  returns true or false
       * @method
       * @name Konva.Sprite#isRunning
       * @returns {Boolean}
       */
      Sprite.prototype.isRunning = function () {
          return this.anim.isRunning();
      };
      Sprite.prototype._updateIndex = function () {
          var index = this.frameIndex(), animation = this.animation(), animations = this.animations(), anim = animations[animation], len = anim.length / 4;
          if (index < len - 1) {
              this.frameIndex(index + 1);
          }
          else {
              this.frameIndex(0);
          }
      };
      return Sprite;
  }(Shape));
  Sprite.prototype.className = 'Sprite';
  _registerNode(Sprite);
  // add getters setters
  Factory.addGetterSetter(Sprite, 'animation');
  /**
   * get/set animation key
   * @name Konva.Sprite#animation
   * @method
   * @param {String} anim animation key
   * @returns {String}
   * @example
   * // get animation key
   * var animation = sprite.animation();
   *
   * // set animation key
   * sprite.animation('kicking');
   */
  Factory.addGetterSetter(Sprite, 'animations');
  /**
   * get/set animations map
   * @name Konva.Sprite#animations
   * @method
   * @param {Object} animations
   * @returns {Object}
   * @example
   * // get animations map
   * var animations = sprite.animations();
   *
   * // set animations map
   * sprite.animations({
   *   standing: [
   *     // x, y, width, height (6 frames)
   *     0, 0, 49, 109,
   *     52, 0, 49, 109,
   *     105, 0, 49, 109,
   *     158, 0, 49, 109,
   *     210, 0, 49, 109,
   *     262, 0, 49, 109
   *   ],
   *   kicking: [
   *     // x, y, width, height (6 frames)
   *     0, 109, 45, 98,
   *     45, 109, 45, 98,
   *     95, 109, 63, 98,
   *     156, 109, 70, 98,
   *     229, 109, 60, 98,
   *     287, 109, 41, 98
   *   ]
   * });
   */
  Factory.addGetterSetter(Sprite, 'frameOffsets');
  /**
   * get/set offsets map
   * @name Konva.Sprite#offsets
   * @method
   * @param {Object} offsets
   * @returns {Object}
   * @example
   * // get offsets map
   * var offsets = sprite.offsets();
   *
   * // set offsets map
   * sprite.offsets({
   *   standing: [
   *     // x, y (6 frames)
   *     0, 0,
   *     0, 0,
   *     5, 0,
   *     0, 0,
   *     0, 3,
   *     2, 0
   *   ],
   *   kicking: [
   *     // x, y (6 frames)
   *     0, 5,
   *     5, 0,
   *     10, 0,
   *     0, 0,
   *     2, 1,
   *     0, 0
   *   ]
   * });
   */
  Factory.addGetterSetter(Sprite, 'image');
  /**
   * get/set image
   * @name Konva.Sprite#image
   * @method
   * @param {Image} image
   * @returns {Image}
   * @example
   * // get image
   * var image = sprite.image();
   *
   * // set image
   * sprite.image(imageObj);
   */
  Factory.addGetterSetter(Sprite, 'frameIndex', 0, getNumberValidator());
  /**
   * set/set animation frame index
   * @name Konva.Sprite#frameIndex
   * @method
   * @param {Integer} frameIndex
   * @returns {Integer}
   * @example
   * // get animation frame index
   * var frameIndex = sprite.frameIndex();
   *
   * // set animation frame index
   * sprite.frameIndex(3);
   */
  Factory.addGetterSetter(Sprite, 'frameRate', 17, getNumberValidator());
  /**
   * get/set frame rate in frames per second.  Increase this number to make the sprite
   *  animation run faster, and decrease the number to make the sprite animation run slower
   *  The default is 17 frames per second
   * @name Konva.Sprite#frameRate
   * @method
   * @param {Integer} frameRate
   * @returns {Integer}
   * @example
   * // get frame rate
   * var frameRate = sprite.frameRate();
   *
   * // set frame rate to 2 frames per second
   * sprite.frameRate(2);
   */
  Factory.backCompat(Sprite, {
      index: 'frameIndex',
      getIndex: 'getFrameIndex',
      setIndex: 'setFrameIndex'
  });
  Collection.mapMethods(Sprite);

  /**
   * Star constructor
   * @constructor
   * @memberof Konva
   * @augments Konva.Shape
   * @param {Object} config
   * @param {Integer} config.numPoints
   * @param {Number} config.innerRadius
   * @param {Number} config.outerRadius
   * @param {String} [config.fill] fill color
     * @param {Image} [config.fillPatternImage] fill pattern image
     * @param {Number} [config.fillPatternX]
     * @param {Number} [config.fillPatternY]
     * @param {Object} [config.fillPatternOffset] object with x and y component
     * @param {Number} [config.fillPatternOffsetX] 
     * @param {Number} [config.fillPatternOffsetY] 
     * @param {Object} [config.fillPatternScale] object with x and y component
     * @param {Number} [config.fillPatternScaleX]
     * @param {Number} [config.fillPatternScaleY]
     * @param {Number} [config.fillPatternRotation]
     * @param {String} [config.fillPatternRepeat] can be "repeat", "repeat-x", "repeat-y", or "no-repeat".  The default is "no-repeat"
     * @param {Object} [config.fillLinearGradientStartPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientStartPointX]
     * @param {Number} [config.fillLinearGradientStartPointY]
     * @param {Object} [config.fillLinearGradientEndPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientEndPointX]
     * @param {Number} [config.fillLinearGradientEndPointY]
     * @param {Array} [config.fillLinearGradientColorStops] array of color stops
     * @param {Object} [config.fillRadialGradientStartPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientStartPointX]
     * @param {Number} [config.fillRadialGradientStartPointY]
     * @param {Object} [config.fillRadialGradientEndPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientEndPointX] 
     * @param {Number} [config.fillRadialGradientEndPointY] 
     * @param {Number} [config.fillRadialGradientStartRadius]
     * @param {Number} [config.fillRadialGradientEndRadius]
     * @param {Array} [config.fillRadialGradientColorStops] array of color stops
     * @param {Boolean} [config.fillEnabled] flag which enables or disables the fill.  The default value is true
     * @param {String} [config.fillPriority] can be color, linear-gradient, radial-graident, or pattern.  The default value is color.  The fillPriority property makes it really easy to toggle between different fill types.  For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
     * @param {String} [config.stroke] stroke color
     * @param {Number} [config.strokeWidth] stroke width
     * @param {Number} [config.hitStrokeWidth] size of the stroke on hit canvas.  The default is "auto" - equals to strokeWidth
     * @param {Boolean} [config.strokeHitEnabled] flag which enables or disables stroke hit region.  The default is true
     * @param {Boolean} [config.perfectDrawEnabled] flag which enables or disables using buffer canvas.  The default is true
     * @param {Boolean} [config.shadowForStrokeEnabled] flag which enables or disables shadow for stroke.  The default is true
     * @param {Boolean} [config.strokeScaleEnabled] flag which enables or disables stroke scale.  The default is true
     * @param {Boolean} [config.strokeEnabled] flag which enables or disables the stroke.  The default value is true
     * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
     *  is miter
     * @param {String} [config.lineCap] can be butt, round, or square.  The default
     *  is butt
     * @param {String} [config.shadowColor]
     * @param {Number} [config.shadowBlur]
     * @param {Object} [config.shadowOffset] object with x and y component
     * @param {Number} [config.shadowOffsetX]
     * @param {Number} [config.shadowOffsetY]
     * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
     *  between 0 and 1
     * @param {Boolean} [config.shadowEnabled] flag which enables or disables the shadow.  The default value is true
     * @param {Array} [config.dash]
     * @param {Boolean} [config.dashEnabled] flag which enables or disables the dashArray.  The default value is true

   * @param {Number} [config.x]
     * @param {Number} [config.y]
     * @param {Number} [config.width]
     * @param {Number} [config.height]
     * @param {Boolean} [config.visible]
     * @param {Boolean} [config.listening] whether or not the node is listening for events
     * @param {String} [config.id] unique id
     * @param {String} [config.name] non-unique name
     * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
     * @param {Object} [config.scale] set scale
     * @param {Number} [config.scaleX] set scale x
     * @param {Number} [config.scaleY] set scale y
     * @param {Number} [config.rotation] rotation in degrees
     * @param {Object} [config.offset] offset from center point and rotation point
     * @param {Number} [config.offsetX] set offset x
     * @param {Number} [config.offsetY] set offset y
     * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
     *  the entire stage by dragging any portion of the stage
     * @param {Number} [config.dragDistance]
     * @param {Function} [config.dragBoundFunc]
   * @example
   * var star = new Konva.Star({
   *   x: 100,
   *   y: 200,
   *   numPoints: 5,
   *   innerRadius: 70,
   *   outerRadius: 70,
   *   fill: 'red',
   *   stroke: 'black',
   *   strokeWidth: 4
   * });
   */
  var Star = /** @class */ (function (_super) {
      __extends(Star, _super);
      function Star() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      Star.prototype._sceneFunc = function (context) {
          var innerRadius = this.innerRadius(), outerRadius = this.outerRadius(), numPoints = this.numPoints();
          context.beginPath();
          context.moveTo(0, 0 - outerRadius);
          for (var n = 1; n < numPoints * 2; n++) {
              var radius = n % 2 === 0 ? outerRadius : innerRadius;
              var x = radius * Math.sin((n * Math.PI) / numPoints);
              var y = -1 * radius * Math.cos((n * Math.PI) / numPoints);
              context.lineTo(x, y);
          }
          context.closePath();
          context.fillStrokeShape(this);
      };
      Star.prototype.getWidth = function () {
          return this.outerRadius() * 2;
      };
      Star.prototype.getHeight = function () {
          return this.outerRadius() * 2;
      };
      Star.prototype.setWidth = function (width) {
          this.outerRadius(width / 2);
      };
      Star.prototype.setHeight = function (height) {
          this.outerRadius(height / 2);
      };
      return Star;
  }(Shape));
  Star.prototype.className = 'Star';
  Star.prototype._centroid = true;
  Star.prototype._attrsAffectingSize = ['innerRadius', 'outerRadius'];
  _registerNode(Star);
  /**
   * get/set number of points
   * @name Konva.Ring#numPoints
   * @method
   * @param {Number} numPoints
   * @returns {Number}
   * @example
   * // get inner radius
   * var numPoints = ring.numPoints();
   *
   * // set inner radius
   * ring.numPoints(20);
   */
  Factory.addGetterSetter(Star, 'numPoints', 5, getNumberValidator());
  /**
   * get/set innerRadius
   * @name Konva.Ring#innerRadius
   * @method
   * @param {Number} innerRadius
   * @returns {Number}
   * @example
   * // get inner radius
   * var innerRadius = ring.innerRadius();
   *
   * // set inner radius
   * ring.innerRadius(20);
   */
  Factory.addGetterSetter(Star, 'innerRadius', 0, getNumberValidator());
  /**
   * get/set outerRadius
   * @name Konva.Ring#outerRadius
   * @method
   * @param {Number} outerRadius
   * @returns {Number}
   * @example
   * // get inner radius
   * var outerRadius = ring.outerRadius();
   *
   * // set inner radius
   * ring.outerRadius(20);
   */
  Factory.addGetterSetter(Star, 'outerRadius', 0, getNumberValidator());
  Collection.mapMethods(Star);

  // constants
  var AUTO = 'auto', 
  //CANVAS = 'canvas',
  CENTER = 'center', JUSTIFY = 'justify', CHANGE_KONVA$1 = 'Change.konva', CONTEXT_2D = '2d', DASH = '-', LEFT$1 = 'left', TEXT = 'text', TEXT_UPPER = 'Text', TOP = 'top', BOTTOM = 'bottom', MIDDLE = 'middle', NORMAL = 'normal', PX_SPACE = 'px ', SPACE$1 = ' ', RIGHT$1 = 'right', WORD = 'word', CHAR = 'char', NONE$1 = 'none', ELLIPSIS = '…', ATTR_CHANGE_LIST$1 = [
      'fontFamily',
      'fontSize',
      'fontStyle',
      'fontVariant',
      'padding',
      'align',
      'verticalAlign',
      'lineHeight',
      'text',
      'width',
      'height',
      'wrap',
      'ellipsis',
      'letterSpacing'
  ], 
  // cached variables
  attrChangeListLen$1 = ATTR_CHANGE_LIST$1.length;
  var dummyContext$1;
  function getDummyContext$1() {
      if (dummyContext$1) {
          return dummyContext$1;
      }
      dummyContext$1 = Util.createCanvasElement().getContext(CONTEXT_2D);
      return dummyContext$1;
  }
  function _fillFunc$1(context) {
      context.fillText(this._partialText, this._partialTextX, this._partialTextY);
  }
  function _strokeFunc$1(context) {
      context.strokeText(this._partialText, this._partialTextX, this._partialTextY);
  }
  function checkDefaultFill(config) {
      config = config || {};
      // set default color to black
      if (!config.fillLinearGradientColorStops &&
          !config.fillRadialGradientColorStops &&
          !config.fillPatternImage) {
          config.fill = config.fill || 'black';
      }
      return config;
  }
  /**
   * Text constructor
   * @constructor
   * @memberof Konva
   * @augments Konva.Shape
   * @param {Object} config
   * @param {String} [config.fontFamily] default is Arial
   * @param {Number} [config.fontSize] in pixels.  Default is 12
   * @param {String} [config.fontStyle] can be normal, bold, or italic.  Default is normal
   * @param {String} [config.fontVariant] can be normal or small-caps.  Default is normal
   * @param {String} [config.textDecoration] can be line-through, underline or empty string. Default is empty string.
   * @param {String} config.text
   * @param {String} [config.align] can be left, center, or right
   * @param {String} [config.verticalAlign] can be top, middle or bottom
   * @param {Number} [config.padding]
   * @param {Number} [config.lineHeight] default is 1
   * @param {String} [config.wrap] can be "word", "char", or "none". Default is word
   * @param {Boolean} [config.ellipsis] can be true or false. Default is false. if Konva.Text config is set to wrap="none" and ellipsis=true, then it will add "..." to the end
   * @param {String} [config.fill] fill color
     * @param {Image} [config.fillPatternImage] fill pattern image
     * @param {Number} [config.fillPatternX]
     * @param {Number} [config.fillPatternY]
     * @param {Object} [config.fillPatternOffset] object with x and y component
     * @param {Number} [config.fillPatternOffsetX] 
     * @param {Number} [config.fillPatternOffsetY] 
     * @param {Object} [config.fillPatternScale] object with x and y component
     * @param {Number} [config.fillPatternScaleX]
     * @param {Number} [config.fillPatternScaleY]
     * @param {Number} [config.fillPatternRotation]
     * @param {String} [config.fillPatternRepeat] can be "repeat", "repeat-x", "repeat-y", or "no-repeat".  The default is "no-repeat"
     * @param {Object} [config.fillLinearGradientStartPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientStartPointX]
     * @param {Number} [config.fillLinearGradientStartPointY]
     * @param {Object} [config.fillLinearGradientEndPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientEndPointX]
     * @param {Number} [config.fillLinearGradientEndPointY]
     * @param {Array} [config.fillLinearGradientColorStops] array of color stops
     * @param {Object} [config.fillRadialGradientStartPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientStartPointX]
     * @param {Number} [config.fillRadialGradientStartPointY]
     * @param {Object} [config.fillRadialGradientEndPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientEndPointX] 
     * @param {Number} [config.fillRadialGradientEndPointY] 
     * @param {Number} [config.fillRadialGradientStartRadius]
     * @param {Number} [config.fillRadialGradientEndRadius]
     * @param {Array} [config.fillRadialGradientColorStops] array of color stops
     * @param {Boolean} [config.fillEnabled] flag which enables or disables the fill.  The default value is true
     * @param {String} [config.fillPriority] can be color, linear-gradient, radial-graident, or pattern.  The default value is color.  The fillPriority property makes it really easy to toggle between different fill types.  For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
     * @param {String} [config.stroke] stroke color
     * @param {Number} [config.strokeWidth] stroke width
     * @param {Number} [config.hitStrokeWidth] size of the stroke on hit canvas.  The default is "auto" - equals to strokeWidth
     * @param {Boolean} [config.strokeHitEnabled] flag which enables or disables stroke hit region.  The default is true
     * @param {Boolean} [config.perfectDrawEnabled] flag which enables or disables using buffer canvas.  The default is true
     * @param {Boolean} [config.shadowForStrokeEnabled] flag which enables or disables shadow for stroke.  The default is true
     * @param {Boolean} [config.strokeScaleEnabled] flag which enables or disables stroke scale.  The default is true
     * @param {Boolean} [config.strokeEnabled] flag which enables or disables the stroke.  The default value is true
     * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
     *  is miter
     * @param {String} [config.lineCap] can be butt, round, or square.  The default
     *  is butt
     * @param {String} [config.shadowColor]
     * @param {Number} [config.shadowBlur]
     * @param {Object} [config.shadowOffset] object with x and y component
     * @param {Number} [config.shadowOffsetX]
     * @param {Number} [config.shadowOffsetY]
     * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
     *  between 0 and 1
     * @param {Boolean} [config.shadowEnabled] flag which enables or disables the shadow.  The default value is true
     * @param {Array} [config.dash]
     * @param {Boolean} [config.dashEnabled] flag which enables or disables the dashArray.  The default value is true

   * @param {Number} [config.x]
     * @param {Number} [config.y]
     * @param {Number} [config.width]
     * @param {Number} [config.height]
     * @param {Boolean} [config.visible]
     * @param {Boolean} [config.listening] whether or not the node is listening for events
     * @param {String} [config.id] unique id
     * @param {String} [config.name] non-unique name
     * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
     * @param {Object} [config.scale] set scale
     * @param {Number} [config.scaleX] set scale x
     * @param {Number} [config.scaleY] set scale y
     * @param {Number} [config.rotation] rotation in degrees
     * @param {Object} [config.offset] offset from center point and rotation point
     * @param {Number} [config.offsetX] set offset x
     * @param {Number} [config.offsetY] set offset y
     * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
     *  the entire stage by dragging any portion of the stage
     * @param {Number} [config.dragDistance]
     * @param {Function} [config.dragBoundFunc]
   * @example
   * var text = new Konva.Text({
   *   x: 10,
   *   y: 15,
   *   text: 'Simple Text',
   *   fontSize: 30,
   *   fontFamily: 'Calibri',
   *   fill: 'green'
   * });
   */
  var Text = /** @class */ (function (_super) {
      __extends(Text, _super);
      function Text(config) {
          var _this = _super.call(this, checkDefaultFill(config)) || this;
          _this._partialTextX = 0;
          _this._partialTextY = 0;
          // update text data for certain attr changes
          for (var n = 0; n < attrChangeListLen$1; n++) {
              _this.on(ATTR_CHANGE_LIST$1[n] + CHANGE_KONVA$1, _this._setTextData);
          }
          _this._setTextData();
          return _this;
      }
      Text.prototype._sceneFunc = function (context) {
          var padding = this.padding(), fontSize = this.fontSize(), lineHeightPx = this.lineHeight() * fontSize, textArr = this.textArr, textArrLen = textArr.length, verticalAlign = this.verticalAlign(), alignY = 0, align = this.align(), totalWidth = this.getWidth(), letterSpacing = this.letterSpacing(), fill = this.fill(), textDecoration = this.textDecoration(), shouldUnderline = textDecoration.indexOf('underline') !== -1, shouldLineThrough = textDecoration.indexOf('line-through') !== -1, n;
          var translateY = 0;
          var translateY = lineHeightPx / 2;
          var lineTranslateX = 0;
          var lineTranslateY = 0;
          context.setAttr('font', this._getContextFont());
          context.setAttr('textBaseline', MIDDLE);
          context.setAttr('textAlign', LEFT$1);
          // handle vertical alignment
          if (verticalAlign === MIDDLE) {
              alignY = (this.getHeight() - textArrLen * lineHeightPx - padding * 2) / 2;
          }
          else if (verticalAlign === BOTTOM) {
              alignY = this.getHeight() - textArrLen * lineHeightPx - padding * 2;
          }
          context.translate(padding, alignY + padding);
          // draw text lines
          for (n = 0; n < textArrLen; n++) {
              var lineTranslateX = 0;
              var lineTranslateY = 0;
              var obj = textArr[n], text = obj.text, width = obj.width, lastLine = n !== textArrLen - 1, spacesNumber, oneWord, lineWidth;
              // horizontal alignment
              context.save();
              if (align === RIGHT$1) {
                  lineTranslateX += totalWidth - width - padding * 2;
              }
              else if (align === CENTER) {
                  lineTranslateX += (totalWidth - width - padding * 2) / 2;
              }
              if (shouldUnderline) {
                  context.save();
                  context.beginPath();
                  context.moveTo(lineTranslateX, translateY + lineTranslateY + Math.round(fontSize / 2));
                  spacesNumber = text.split(' ').length - 1;
                  oneWord = spacesNumber === 0;
                  lineWidth =
                      align === JUSTIFY && lastLine && !oneWord
                          ? totalWidth - padding * 2
                          : width;
                  context.lineTo(lineTranslateX + Math.round(lineWidth), translateY + lineTranslateY + Math.round(fontSize / 2));
                  // I have no idea what is real ratio
                  // just /15 looks good enough
                  context.lineWidth = fontSize / 15;
                  context.strokeStyle = fill;
                  context.stroke();
                  context.restore();
              }
              if (shouldLineThrough) {
                  context.save();
                  context.beginPath();
                  context.moveTo(lineTranslateX, translateY + lineTranslateY);
                  spacesNumber = text.split(' ').length - 1;
                  oneWord = spacesNumber === 0;
                  lineWidth =
                      align === JUSTIFY && lastLine && !oneWord
                          ? totalWidth - padding * 2
                          : width;
                  context.lineTo(lineTranslateX + Math.round(lineWidth), translateY + lineTranslateY);
                  context.lineWidth = fontSize / 15;
                  context.strokeStyle = fill;
                  context.stroke();
                  context.restore();
              }
              if (letterSpacing !== 0 || align === JUSTIFY) {
                  //   var words = text.split(' ');
                  spacesNumber = text.split(' ').length - 1;
                  for (var li = 0; li < text.length; li++) {
                      var letter = text[li];
                      // skip justify for the last line
                      if (letter === ' ' && n !== textArrLen - 1 && align === JUSTIFY) {
                          lineTranslateX += Math.floor((totalWidth - padding * 2 - width) / spacesNumber);
                          // context.translate(
                          //   Math.floor((totalWidth - padding * 2 - width) / spacesNumber),
                          //   0
                          // );
                      }
                      this._partialTextX = lineTranslateX;
                      this._partialTextY = translateY + lineTranslateY;
                      this._partialText = letter;
                      context.fillStrokeShape(this);
                      lineTranslateX +=
                          Math.round(this.measureSize(letter).width) + letterSpacing;
                  }
              }
              else {
                  this._partialTextX = lineTranslateX;
                  this._partialTextY = translateY + lineTranslateY;
                  this._partialText = text;
                  context.fillStrokeShape(this);
              }
              context.restore();
              if (textArrLen > 1) {
                  translateY += lineHeightPx;
              }
          }
      };
      Text.prototype._hitFunc = function (context) {
          var width = this.getWidth(), height = this.getHeight();
          context.beginPath();
          context.rect(0, 0, width, height);
          context.closePath();
          context.fillStrokeShape(this);
      };
      Text.prototype.setText = function (text) {
          var str = Util._isString(text)
              ? text
              : text === null || text === undefined
                  ? ''
                  : text + '';
          this._setAttr(TEXT, str);
          return this;
      };
      Text.prototype.getWidth = function () {
          var isAuto = this.attrs.width === AUTO || this.attrs.width === undefined;
          return isAuto ? this.getTextWidth() + this.padding() * 2 : this.attrs.width;
      };
      Text.prototype.getHeight = function () {
          var isAuto = this.attrs.height === AUTO || this.attrs.height === undefined;
          return isAuto
              ? this.fontSize() * this.textArr.length * this.lineHeight() +
                  this.padding() * 2
              : this.attrs.height;
      };
      /**
       * get pure text width without padding
       * @method
       * @name Konva.Text#getTextWidth
       * @returns {Number}
       */
      Text.prototype.getTextWidth = function () {
          return this.textWidth;
      };
      Text.prototype.getTextHeight = function () {
          Util.warn('text.getTextHeight() method is deprecated. Use text.height() - for full height and text.fontSize() - for one line height.');
          return this.textHeight;
      };
      /**
       * measure string with the font of current text shape.
       * That method can't handle multiline text.
       * @method
       * @name Konva.Text#measureSize
       * @param {String} [text] text to measure
       * @returns {Object} { width , height} of measured text
       */
      Text.prototype.measureSize = function (text) {
          var _context = getDummyContext$1(), fontSize = this.fontSize(), metrics;
          _context.save();
          _context.font = this._getContextFont();
          metrics = _context.measureText(text);
          _context.restore();
          return {
              width: metrics.width,
              height: fontSize
          };
      };
      Text.prototype._getContextFont = function () {
          // IE don't want to work with usual font style
          // bold was not working
          // removing font variant will solve
          // fix for: https://github.com/konvajs/konva/issues/94
          if (Konva.UA.isIE) {
              return (this.fontStyle() +
                  SPACE$1 +
                  this.fontSize() +
                  PX_SPACE +
                  this.fontFamily());
          }
          return (this.fontStyle() +
              SPACE$1 +
              this.fontVariant() +
              SPACE$1 +
              this.fontSize() +
              PX_SPACE +
              this.fontFamily());
      };
      Text.prototype._addTextLine = function (line) {
          if (this.align() === JUSTIFY) {
              line = line.trim();
          }
          var width = this._getTextWidth(line);
          return this.textArr.push({ text: line, width: width });
      };
      Text.prototype._getTextWidth = function (text) {
          var letterSpacing = this.letterSpacing();
          var length = text.length;
          return (getDummyContext$1().measureText(text).width +
              (length ? letterSpacing * (length - 1) : 0));
      };
      Text.prototype._setTextData = function () {
          var lines = this.text().split('\n'), fontSize = +this.fontSize(), textWidth = 0, lineHeightPx = this.lineHeight() * fontSize, width = this.attrs.width, height = this.attrs.height, fixedWidth = width !== AUTO && width !== undefined, fixedHeight = height !== AUTO && height !== undefined, padding = this.padding(), maxWidth = width - padding * 2, maxHeightPx = height - padding * 2, currentHeightPx = 0, wrap = this.wrap(), 
          // align = this.align(),
          shouldWrap = wrap !== NONE$1, wrapAtWord = wrap !== CHAR && shouldWrap, shouldAddEllipsis = this.ellipsis() && !shouldWrap;
          this.textArr = [];
          getDummyContext$1().font = this._getContextFont();
          var additionalWidth = shouldAddEllipsis ? this._getTextWidth(ELLIPSIS) : 0;
          for (var i = 0, max = lines.length; i < max; ++i) {
              var line = lines[i];
              var lineWidth = this._getTextWidth(line);
              if (fixedWidth && lineWidth > maxWidth) {
                  /*
                   * if width is fixed and line does not fit entirely
                   * break the line into multiple fitting lines
                   */
                  while (line.length > 0) {
                      /*
                       * use binary search to find the longest substring that
                       * that would fit in the specified width
                       */
                      var low = 0, high = line.length, match = '', matchWidth = 0;
                      while (low < high) {
                          var mid = (low + high) >>> 1, substr = line.slice(0, mid + 1), substrWidth = this._getTextWidth(substr) + additionalWidth;
                          if (substrWidth <= maxWidth) {
                              low = mid + 1;
                              match = substr + (shouldAddEllipsis ? ELLIPSIS : '');
                              matchWidth = substrWidth;
                          }
                          else {
                              high = mid;
                          }
                      }
                      /*
                       * 'low' is now the index of the substring end
                       * 'match' is the substring
                       * 'matchWidth' is the substring width in px
                       */
                      if (match) {
                          // a fitting substring was found
                          if (wrapAtWord) {
                              // try to find a space or dash where wrapping could be done
                              var wrapIndex;
                              var nextChar = line[match.length];
                              var nextIsSpaceOrDash = nextChar === SPACE$1 || nextChar === DASH;
                              if (nextIsSpaceOrDash && matchWidth <= maxWidth) {
                                  wrapIndex = match.length;
                              }
                              else {
                                  wrapIndex =
                                      Math.max(match.lastIndexOf(SPACE$1), match.lastIndexOf(DASH)) +
                                          1;
                              }
                              if (wrapIndex > 0) {
                                  // re-cut the substring found at the space/dash position
                                  low = wrapIndex;
                                  match = match.slice(0, low);
                                  matchWidth = this._getTextWidth(match);
                              }
                          }
                          // if (align === 'right') {
                          match = match.trimRight();
                          // }
                          this._addTextLine(match);
                          textWidth = Math.max(textWidth, matchWidth);
                          currentHeightPx += lineHeightPx;
                          if (!shouldWrap ||
                              (fixedHeight && currentHeightPx + lineHeightPx > maxHeightPx)) {
                              /*
                               * stop wrapping if wrapping is disabled or if adding
                               * one more line would overflow the fixed height
                               */
                              break;
                          }
                          line = line.slice(low);
                          line = line.trimLeft();
                          if (line.length > 0) {
                              // Check if the remaining text would fit on one line
                              lineWidth = this._getTextWidth(line);
                              if (lineWidth <= maxWidth) {
                                  // if it does, add the line and break out of the loop
                                  this._addTextLine(line);
                                  currentHeightPx += lineHeightPx;
                                  textWidth = Math.max(textWidth, lineWidth);
                                  break;
                              }
                          }
                      }
                      else {
                          // not even one character could fit in the element, abort
                          break;
                      }
                  }
              }
              else {
                  // element width is automatically adjusted to max line width
                  this._addTextLine(line);
                  currentHeightPx += lineHeightPx;
                  textWidth = Math.max(textWidth, lineWidth);
              }
              // if element height is fixed, abort if adding one more line would overflow
              if (fixedHeight && currentHeightPx + lineHeightPx > maxHeightPx) {
                  break;
              }
          }
          this.textHeight = fontSize;
          // var maxTextWidth = 0;
          // for(var j = 0; j < this.textArr.length; j++) {
          //     maxTextWidth = Math.max(maxTextWidth, this.textArr[j].width);
          // }
          this.textWidth = textWidth;
      };
      // for text we can't disable stroke scaling
      // if we do, the result will be unexpected
      Text.prototype.getStrokeScaleEnabled = function () {
          return true;
      };
      return Text;
  }(Shape));
  Text.prototype._fillFunc = _fillFunc$1;
  Text.prototype._strokeFunc = _strokeFunc$1;
  Text.prototype.className = TEXT_UPPER;
  Text.prototype._attrsAffectingSize = [
      'text',
      'fontSize',
      'padding',
      'wrap',
      'lineHeight'
  ];
  _registerNode(Text);
  /**
   * get/set width of text area, which includes padding.
   * @name Konva.Text#width
   * @method
   * @param {Number} width
   * @returns {Number}
   * @example
   * // get width
   * var width = text.width();
   *
   * // set width
   * text.width(20);
   *
   * // set to auto
   * text.width('auto');
   * text.width() // will return calculated width, and not "auto"
   */
  Factory.overWriteSetter(Text, 'width', getNumberOrAutoValidator());
  /**
   * get/set the height of the text area, which takes into account multi-line text, line heights, and padding.
   * @name Konva.Text#height
   * @method
   * @param {Number} height
   * @returns {Number}
   * @example
   * // get height
   * var height = text.height();
   *
   * // set height
   * text.height(20);
   *
   * // set to auto
   * text.height('auto');
   * text.height() // will return calculated height, and not "auto"
   */
  Factory.overWriteSetter(Text, 'height', getNumberOrAutoValidator());
  /**
   * get/set font family
   * @name Konva.Text#fontFamily
   * @method
   * @param {String} fontFamily
   * @returns {String}
   * @example
   * // get font family
   * var fontFamily = text.fontFamily();
   *
   * // set font family
   * text.fontFamily('Arial');
   */
  Factory.addGetterSetter(Text, 'fontFamily', 'Arial');
  /**
   * get/set font size in pixels
   * @name Konva.Text#fontSize
   * @method
   * @param {Number} fontSize
   * @returns {Number}
   * @example
   * // get font size
   * var fontSize = text.fontSize();
   *
   * // set font size to 22px
   * text.fontSize(22);
   */
  Factory.addGetterSetter(Text, 'fontSize', 12, getNumberValidator());
  /**
   * get/set font style.  Can be 'normal', 'italic', or 'bold'.  'normal' is the default.
   * @name Konva.Text#fontStyle
   * @method
   * @param {String} fontStyle
   * @returns {String}
   * @example
   * // get font style
   * var fontStyle = text.fontStyle();
   *
   * // set font style
   * text.fontStyle('bold');
   */
  Factory.addGetterSetter(Text, 'fontStyle', NORMAL);
  /**
   * get/set font variant.  Can be 'normal' or 'small-caps'.  'normal' is the default.
   * @name Konva.Text#fontVariant
   * @method
   * @param {String} fontVariant
   * @returns {String}
   * @example
   * // get font variant
   * var fontVariant = text.fontVariant();
   *
   * // set font variant
   * text.fontVariant('small-caps');
   */
  Factory.addGetterSetter(Text, 'fontVariant', NORMAL);
  /**
   * get/set padding
   * @name Konva.Text#padding
   * @method
   * @param {Number} padding
   * @returns {Number}
   * @example
   * // get padding
   * var padding = text.padding();
   *
   * // set padding to 10 pixels
   * text.padding(10);
   */
  Factory.addGetterSetter(Text, 'padding', 0, getNumberValidator());
  /**
   * get/set horizontal align of text.  Can be 'left', 'center', 'right' or 'justify'
   * @name Konva.Text#align
   * @method
   * @param {String} align
   * @returns {String}
   * @example
   * // get text align
   * var align = text.align();
   *
   * // center text
   * text.align('center');
   *
   * // align text to right
   * text.align('right');
   */
  Factory.addGetterSetter(Text, 'align', LEFT$1);
  /**
   * get/set vertical align of text.  Can be 'top', 'middle', 'bottom'.
   * @name Konva.Text#verticalAlign
   * @method
   * @param {String} verticalAlign
   * @returns {String}
   * @example
   * // get text vertical align
   * var verticalAlign = text.verticalAlign();
   *
   * // center text
   * text.verticalAlign('middle');
   */
  Factory.addGetterSetter(Text, 'verticalAlign', TOP);
  /**
   * get/set line height.  The default is 1.
   * @name Konva.Text#lineHeight
   * @method
   * @param {Number} lineHeight
   * @returns {Number}
   * @example
   * // get line height
   * var lineHeight = text.lineHeight();
   *
   * // set the line height
   * text.lineHeight(2);
   */
  Factory.addGetterSetter(Text, 'lineHeight', 1, getNumberValidator());
  /**
   * get/set wrap.  Can be "word", "char", or "none". Default is "word".
   * In "word" wrapping any word still can be wrapped if it can't be placed in the required width
   * without breaks.
   * @name Konva.Text#wrap
   * @method
   * @param {String} wrap
   * @returns {String}
   * @example
   * // get wrap
   * var wrap = text.wrap();
   *
   * // set wrap
   * text.wrap('word');
   */
  Factory.addGetterSetter(Text, 'wrap', WORD);
  /**
   * get/set ellipsis.  Can be true or false. Default is false.
   * if Konva.Text config is set to wrap="none" and ellipsis=true, then it will add "..." to the end
   * @name Konva.Text#ellipsis
   * @method
   * @param {Boolean} ellipsis
   * @returns {Boolean}
   * @example
   * // get ellipsis
   * var ellipsis = text.ellipsis();
   *
   * // set ellipsis
   * text.ellipsis(true);
   */
  Factory.addGetterSetter(Text, 'ellipsis', false);
  /**
   * set letter spacing property. Default value is 0.
   * @name Konva.Text#letterSpacing
   * @method
   * @param {Number} letterSpacing
   */
  Factory.addGetterSetter(Text, 'letterSpacing', 0, getNumberValidator());
  /**
   * get/set text
   * @name Konva.Text#text
   * @method
   * @param {String} text
   * @returns {String}
   * @example
   * // get text
   * var text = text.text();
   *
   * // set text
   * text.text('Hello world!');
   */
  Factory.addGetterSetter(Text, 'text', '', getStringValidator());
  /**
   * get/set text decoration of a text.  Possible values are 'underline', 'line-through' or combination of these values separated by space
   * @name Konva.Text#textDecoration
   * @method
   * @param {String} textDecoration
   * @returns {String}
   * @example
   * // get text decoration
   * var textDecoration = text.textDecoration();
   *
   * // underline text
   * text.textDecoration('underline');
   *
   * // strike text
   * text.textDecoration('line-through');
   *
   * // underline and strike text
   * text.textDecoration('underline line-through');
   */
  Factory.addGetterSetter(Text, 'textDecoration', '');
  Collection.mapMethods(Text);

  var EMPTY_STRING$2 = '', NORMAL$1 = 'normal';
  function _fillFunc$2(context) {
      context.fillText(this.partialText, 0, 0);
  }
  function _strokeFunc$2(context) {
      context.strokeText(this.partialText, 0, 0);
  }
  /**
   * Path constructor.
   * @author Jason Follas
   * @constructor
   * @memberof Konva
   * @augments Konva.Shape
   * @param {Object} config
   * @param {String} [config.fontFamily] default is Calibri
   * @param {Number} [config.fontSize] default is 12
   * @param {String} [config.fontStyle] can be normal, bold, or italic.  Default is normal
   * @param {String} [config.fontVariant] can be normal or small-caps.  Default is normal
   * @param {String} [config.textBaseline] Can be 'top', 'bottom', 'middle', 'alphabetic', 'hanging'. Default is middle
   * @param {String} config.text
   * @param {String} config.data SVG data string
   * @param {Function} config.getKerning a getter for kerning values for the specified characters
   * @param {Function} config.kerningFunc a getter for kerning values for the specified characters
   * @param {String} [config.fill] fill color
     * @param {Image} [config.fillPatternImage] fill pattern image
     * @param {Number} [config.fillPatternX]
     * @param {Number} [config.fillPatternY]
     * @param {Object} [config.fillPatternOffset] object with x and y component
     * @param {Number} [config.fillPatternOffsetX] 
     * @param {Number} [config.fillPatternOffsetY] 
     * @param {Object} [config.fillPatternScale] object with x and y component
     * @param {Number} [config.fillPatternScaleX]
     * @param {Number} [config.fillPatternScaleY]
     * @param {Number} [config.fillPatternRotation]
     * @param {String} [config.fillPatternRepeat] can be "repeat", "repeat-x", "repeat-y", or "no-repeat".  The default is "no-repeat"
     * @param {Object} [config.fillLinearGradientStartPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientStartPointX]
     * @param {Number} [config.fillLinearGradientStartPointY]
     * @param {Object} [config.fillLinearGradientEndPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientEndPointX]
     * @param {Number} [config.fillLinearGradientEndPointY]
     * @param {Array} [config.fillLinearGradientColorStops] array of color stops
     * @param {Object} [config.fillRadialGradientStartPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientStartPointX]
     * @param {Number} [config.fillRadialGradientStartPointY]
     * @param {Object} [config.fillRadialGradientEndPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientEndPointX] 
     * @param {Number} [config.fillRadialGradientEndPointY] 
     * @param {Number} [config.fillRadialGradientStartRadius]
     * @param {Number} [config.fillRadialGradientEndRadius]
     * @param {Array} [config.fillRadialGradientColorStops] array of color stops
     * @param {Boolean} [config.fillEnabled] flag which enables or disables the fill.  The default value is true
     * @param {String} [config.fillPriority] can be color, linear-gradient, radial-graident, or pattern.  The default value is color.  The fillPriority property makes it really easy to toggle between different fill types.  For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
     * @param {String} [config.stroke] stroke color
     * @param {Number} [config.strokeWidth] stroke width
     * @param {Number} [config.hitStrokeWidth] size of the stroke on hit canvas.  The default is "auto" - equals to strokeWidth
     * @param {Boolean} [config.strokeHitEnabled] flag which enables or disables stroke hit region.  The default is true
     * @param {Boolean} [config.perfectDrawEnabled] flag which enables or disables using buffer canvas.  The default is true
     * @param {Boolean} [config.shadowForStrokeEnabled] flag which enables or disables shadow for stroke.  The default is true
     * @param {Boolean} [config.strokeScaleEnabled] flag which enables or disables stroke scale.  The default is true
     * @param {Boolean} [config.strokeEnabled] flag which enables or disables the stroke.  The default value is true
     * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
     *  is miter
     * @param {String} [config.lineCap] can be butt, round, or square.  The default
     *  is butt
     * @param {String} [config.shadowColor]
     * @param {Number} [config.shadowBlur]
     * @param {Object} [config.shadowOffset] object with x and y component
     * @param {Number} [config.shadowOffsetX]
     * @param {Number} [config.shadowOffsetY]
     * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
     *  between 0 and 1
     * @param {Boolean} [config.shadowEnabled] flag which enables or disables the shadow.  The default value is true
     * @param {Array} [config.dash]
     * @param {Boolean} [config.dashEnabled] flag which enables or disables the dashArray.  The default value is true

   * @param {Number} [config.x]
     * @param {Number} [config.y]
     * @param {Number} [config.width]
     * @param {Number} [config.height]
     * @param {Boolean} [config.visible]
     * @param {Boolean} [config.listening] whether or not the node is listening for events
     * @param {String} [config.id] unique id
     * @param {String} [config.name] non-unique name
     * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
     * @param {Object} [config.scale] set scale
     * @param {Number} [config.scaleX] set scale x
     * @param {Number} [config.scaleY] set scale y
     * @param {Number} [config.rotation] rotation in degrees
     * @param {Object} [config.offset] offset from center point and rotation point
     * @param {Number} [config.offsetX] set offset x
     * @param {Number} [config.offsetY] set offset y
     * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
     *  the entire stage by dragging any portion of the stage
     * @param {Number} [config.dragDistance]
     * @param {Function} [config.dragBoundFunc]
   * @example
   * var kerningPairs = {
   *   'A': {
   *     ' ': -0.05517578125,
   *     'T': -0.07421875,
   *     'V': -0.07421875
   *   }
   *   'V': {
   *     ',': -0.091796875,
   *     ":": -0.037109375,
   *     ";": -0.037109375,
   *     "A": -0.07421875
   *   }
   * }
   * var textpath = new Konva.TextPath({
   *   x: 100,
   *   y: 50,
   *   fill: '#333',
   *   fontSize: '24',
   *   fontFamily: 'Arial',
   *   text: 'All the world\'s a stage, and all the men and women merely players.',
   *   data: 'M10,10 C0,0 10,150 100,100 S300,150 400,50',
   *   kerningFunc(leftChar, rightChar) {
   *     return kerningPairs.hasOwnProperty(leftChar) ? pairs[leftChar][rightChar] || 0 : 0
   *   }
   * });
   */
  var TextPath = /** @class */ (function (_super) {
      __extends(TextPath, _super);
      function TextPath(config) {
          var _this = 
          // call super constructor
          _super.call(this, config) || this;
          _this.dummyCanvas = Util.createCanvasElement();
          _this.dataArray = [];
          _this.dataArray = Path.parsePathData(_this.attrs.data);
          _this.on('dataChange.konva', function () {
              this.dataArray = Path.parsePathData(this.attrs.data);
              this._setTextData();
          });
          // update text data for certain attr changes
          _this.on('textChange.konva alignChange.konva letterSpacingChange.konva kerningFuncChange.konva', _this._setTextData);
          if (config && config['getKerning']) {
              Util.warn('getKerning TextPath API is deprecated. Please use "kerningFunc" instead.');
              _this.kerningFunc(config['getKerning']);
          }
          _this._setTextData();
          return _this;
      }
      TextPath.prototype._sceneFunc = function (context) {
          context.setAttr('font', this._getContextFont());
          context.setAttr('textBaseline', this.textBaseline());
          context.setAttr('textAlign', 'left');
          context.save();
          var textDecoration = this.textDecoration();
          var fill = this.fill();
          var fontSize = this.fontSize();
          var glyphInfo = this.glyphInfo;
          if (textDecoration === 'underline') {
              context.beginPath();
          }
          for (var i = 0; i < glyphInfo.length; i++) {
              context.save();
              var p0 = glyphInfo[i].p0;
              context.translate(p0.x, p0.y);
              context.rotate(glyphInfo[i].rotation);
              this.partialText = glyphInfo[i].text;
              context.fillStrokeShape(this);
              if (textDecoration === 'underline') {
                  if (i === 0) {
                      context.moveTo(0, fontSize / 2 + 1);
                  }
                  context.lineTo(fontSize, fontSize / 2 + 1);
              }
              context.restore();
              //// To assist with debugging visually, uncomment following
              //
              // if (i % 2) context.strokeStyle = 'cyan';
              // else context.strokeStyle = 'green';
              // var p1 = glyphInfo[i].p1;
              // context.moveTo(p0.x, p0.y);
              // context.lineTo(p1.x, p1.y);
              // context.stroke();
          }
          if (textDecoration === 'underline') {
              context.strokeStyle = fill;
              context.lineWidth = fontSize / 20;
              context.stroke();
          }
          context.restore();
      };
      TextPath.prototype._hitFunc = function (context) {
          context.beginPath();
          var glyphInfo = this.glyphInfo;
          if (glyphInfo.length >= 1) {
              var p0 = glyphInfo[0].p0;
              context.moveTo(p0.x, p0.y);
          }
          for (var i = 0; i < glyphInfo.length; i++) {
              var p1 = glyphInfo[i].p1;
              context.lineTo(p1.x, p1.y);
          }
          context.setAttr('lineWidth', this.fontSize());
          context.setAttr('strokeStyle', this.colorKey);
          context.stroke();
      };
      /**
       * get text width in pixels
       * @method
       * @name Konva.TextPath#getTextWidth
       */
      TextPath.prototype.getTextWidth = function () {
          return this.textWidth;
      };
      TextPath.prototype.getTextHeight = function () {
          Util.warn('text.getTextHeight() method is deprecated. Use text.height() - for full height and text.fontSize() - for one line height.');
          return this.textHeight;
      };
      TextPath.prototype.setText = function (text) {
          return Text.prototype.setText.call(this, text);
      };
      TextPath.prototype._getContextFont = function () {
          return Text.prototype._getContextFont.call(this);
      };
      TextPath.prototype._getTextSize = function (text) {
          var dummyCanvas = this.dummyCanvas;
          var _context = dummyCanvas.getContext('2d');
          _context.save();
          _context.font = this._getContextFont();
          var metrics = _context.measureText(text);
          _context.restore();
          return {
              width: metrics.width,
              height: parseInt(this.attrs.fontSize, 10)
          };
      };
      TextPath.prototype._setTextData = function () {
          var that = this;
          var size = this._getTextSize(this.attrs.text);
          var letterSpacing = this.letterSpacing();
          var align = this.align();
          var kerningFunc = this.kerningFunc();
          this.textWidth = size.width;
          this.textHeight = size.height;
          var textFullWidth = Math.max(this.textWidth + ((this.attrs.text || '').length - 1) * letterSpacing, 0);
          this.glyphInfo = [];
          var fullPathWidth = 0;
          for (var l = 0; l < that.dataArray.length; l++) {
              if (that.dataArray[l].pathLength > 0) {
                  fullPathWidth += that.dataArray[l].pathLength;
              }
          }
          var offset = 0;
          if (align === 'center') {
              offset = Math.max(0, fullPathWidth / 2 - textFullWidth / 2);
          }
          if (align === 'right') {
              offset = Math.max(0, fullPathWidth - textFullWidth);
          }
          var charArr = this.text().split('');
          var spacesNumber = this.text().split(' ').length - 1;
          var p0, p1, pathCmd;
          var pIndex = -1;
          var currentT = 0;
          // var sumLength = 0;
          // for(var j = 0; j < that.dataArray.length; j++) {
          //   if(that.dataArray[j].pathLength > 0) {
          //
          //     if (sumLength + that.dataArray[j].pathLength > offset) {}
          //       fullPathWidth += that.dataArray[j].pathLength;
          //   }
          // }
          var getNextPathSegment = function () {
              currentT = 0;
              var pathData = that.dataArray;
              for (var j = pIndex + 1; j < pathData.length; j++) {
                  if (pathData[j].pathLength > 0) {
                      pIndex = j;
                      return pathData[j];
                  }
                  else if (pathData[j].command === 'M') {
                      p0 = {
                          x: pathData[j].points[0],
                          y: pathData[j].points[1]
                      };
                  }
              }
              return {};
          };
          var findSegmentToFitCharacter = function (c) {
              var glyphWidth = that._getTextSize(c).width + letterSpacing;
              if (c === ' ' && align === 'justify') {
                  glyphWidth += (fullPathWidth - textFullWidth) / spacesNumber;
              }
              var currLen = 0;
              var attempts = 0;
              p1 = undefined;
              while (Math.abs(glyphWidth - currLen) / glyphWidth > 0.01 &&
                  attempts < 25) {
                  attempts++;
                  var cumulativePathLength = currLen;
                  while (pathCmd === undefined) {
                      pathCmd = getNextPathSegment();
                      if (pathCmd &&
                          cumulativePathLength + pathCmd.pathLength < glyphWidth) {
                          cumulativePathLength += pathCmd.pathLength;
                          pathCmd = undefined;
                      }
                  }
                  if (pathCmd === {} || p0 === undefined) {
                      return undefined;
                  }
                  var needNewSegment = false;
                  switch (pathCmd.command) {
                      case 'L':
                          if (Path.getLineLength(p0.x, p0.y, pathCmd.points[0], pathCmd.points[1]) > glyphWidth) {
                              p1 = Path.getPointOnLine(glyphWidth, p0.x, p0.y, pathCmd.points[0], pathCmd.points[1], p0.x, p0.y);
                          }
                          else {
                              pathCmd = undefined;
                          }
                          break;
                      case 'A':
                          var start = pathCmd.points[4];
                          // 4 = theta
                          var dTheta = pathCmd.points[5];
                          // 5 = dTheta
                          var end = pathCmd.points[4] + dTheta;
                          if (currentT === 0) {
                              currentT = start + 0.00000001;
                          }
                          else if (glyphWidth > currLen) {
                              // Just in case start is 0
                              currentT += ((Math.PI / 180.0) * dTheta) / Math.abs(dTheta);
                          }
                          else {
                              currentT -= ((Math.PI / 360.0) * dTheta) / Math.abs(dTheta);
                          }
                          // Credit for bug fix: @therth https://github.com/ericdrowell/KonvaJS/issues/249
                          // Old code failed to render text along arc of this path: "M 50 50 a 150 50 0 0 1 250 50 l 50 0"
                          if ((dTheta < 0 && currentT < end) ||
                              (dTheta >= 0 && currentT > end)) {
                              currentT = end;
                              needNewSegment = true;
                          }
                          p1 = Path.getPointOnEllipticalArc(pathCmd.points[0], pathCmd.points[1], pathCmd.points[2], pathCmd.points[3], currentT, pathCmd.points[6]);
                          break;
                      case 'C':
                          if (currentT === 0) {
                              if (glyphWidth > pathCmd.pathLength) {
                                  currentT = 0.00000001;
                              }
                              else {
                                  currentT = glyphWidth / pathCmd.pathLength;
                              }
                          }
                          else if (glyphWidth > currLen) {
                              currentT += (glyphWidth - currLen) / pathCmd.pathLength;
                          }
                          else {
                              currentT -= (currLen - glyphWidth) / pathCmd.pathLength;
                          }
                          if (currentT > 1.0) {
                              currentT = 1.0;
                              needNewSegment = true;
                          }
                          p1 = Path.getPointOnCubicBezier(currentT, pathCmd.start.x, pathCmd.start.y, pathCmd.points[0], pathCmd.points[1], pathCmd.points[2], pathCmd.points[3], pathCmd.points[4], pathCmd.points[5]);
                          break;
                      case 'Q':
                          if (currentT === 0) {
                              currentT = glyphWidth / pathCmd.pathLength;
                          }
                          else if (glyphWidth > currLen) {
                              currentT += (glyphWidth - currLen) / pathCmd.pathLength;
                          }
                          else {
                              currentT -= (currLen - glyphWidth) / pathCmd.pathLength;
                          }
                          if (currentT > 1.0) {
                              currentT = 1.0;
                              needNewSegment = true;
                          }
                          p1 = Path.getPointOnQuadraticBezier(currentT, pathCmd.start.x, pathCmd.start.y, pathCmd.points[0], pathCmd.points[1], pathCmd.points[2], pathCmd.points[3]);
                          break;
                  }
                  if (p1 !== undefined) {
                      currLen = Path.getLineLength(p0.x, p0.y, p1.x, p1.y);
                  }
                  if (needNewSegment) {
                      needNewSegment = false;
                      pathCmd = undefined;
                  }
              }
          };
          // fake search for offset, this is the best approach
          var testChar = 'C';
          var glyphWidth = that._getTextSize(testChar).width + letterSpacing;
          var lettersInOffset = offset / glyphWidth - 1;
          // the idea is simple
          // try to draw testChar until we fill offset
          for (var k = 0; k < lettersInOffset; k++) {
              findSegmentToFitCharacter(testChar);
              if (p0 === undefined || p1 === undefined) {
                  break;
              }
              p0 = p1;
          }
          for (var i = 0; i < charArr.length; i++) {
              // Find p1 such that line segment between p0 and p1 is approx. width of glyph
              findSegmentToFitCharacter(charArr[i]);
              if (p0 === undefined || p1 === undefined) {
                  break;
              }
              var width = Path.getLineLength(p0.x, p0.y, p1.x, p1.y);
              var kern = 0;
              if (kerningFunc) {
                  try {
                      // getKerning is a user provided getter. Make sure it never breaks our logic
                      kern = kerningFunc(charArr[i - 1], charArr[i]) * this.fontSize();
                  }
                  catch (e) {
                      kern = 0;
                  }
              }
              p0.x += kern;
              p1.x += kern;
              this.textWidth += kern;
              var midpoint = Path.getPointOnLine(kern + width / 2.0, p0.x, p0.y, p1.x, p1.y);
              var rotation = Math.atan2(p1.y - p0.y, p1.x - p0.x);
              this.glyphInfo.push({
                  transposeX: midpoint.x,
                  transposeY: midpoint.y,
                  text: charArr[i],
                  rotation: rotation,
                  p0: p0,
                  p1: p1
              });
              p0 = p1;
          }
      };
      TextPath.prototype.getSelfRect = function () {
          if (!this.glyphInfo.length) {
              return {
                  x: 0,
                  y: 0,
                  width: 0,
                  height: 0
              };
          }
          var points = [];
          this.glyphInfo.forEach(function (info) {
              points.push(info.p0.x);
              points.push(info.p0.y);
              points.push(info.p1.x);
              points.push(info.p1.y);
          });
          var minX = points[0] || 0;
          var maxX = points[0] || 0;
          var minY = points[1] || 0;
          var maxY = points[1] || 0;
          var x, y;
          for (var i = 0; i < points.length / 2; i++) {
              x = points[i * 2];
              y = points[i * 2 + 1];
              minX = Math.min(minX, x);
              maxX = Math.max(maxX, x);
              minY = Math.min(minY, y);
              maxY = Math.max(maxY, y);
          }
          var fontSize = this.fontSize();
          return {
              x: minX - fontSize / 2,
              y: minY - fontSize / 2,
              width: maxX - minX + fontSize,
              height: maxY - minY + fontSize
          };
      };
      return TextPath;
  }(Shape));
  TextPath.prototype._fillFunc = _fillFunc$2;
  TextPath.prototype._strokeFunc = _strokeFunc$2;
  TextPath.prototype._fillFuncHit = _fillFunc$2;
  TextPath.prototype._strokeFuncHit = _strokeFunc$2;
  TextPath.prototype.className = 'TextPath';
  TextPath.prototype._attrsAffectingSize = ['text', 'fontSize', 'data'];
  _registerNode(TextPath);
  /**
   * get/set SVG path data string.  This method
   *  also automatically parses the data string
   *  into a data array.  Currently supported SVG data:
   *  M, m, L, l, H, h, V, v, Q, q, T, t, C, c, S, s, A, a, Z, z
   * @name Konva.TextPath#data
   * @method
   * @param {String} data svg path string
   * @returns {String}
   * @example
   * // get data
   * var data = shape.data();
   *
   * // set data
   * shape.data('M200,100h100v50z');
   */
  Factory.addGetterSetter(TextPath, 'data');
  /**
   * get/set font family
   * @name Konva.TextPath#fontFamily
   * @method
   * @param {String} fontFamily
   * @returns {String}
   * @example
   * // get font family
   * var fontFamily = shape.fontFamily();
   *
   * // set font family
   * shape.fontFamily('Arial');
   */
  Factory.addGetterSetter(TextPath, 'fontFamily', 'Arial');
  /**
   * get/set font size in pixels
   * @name Konva.TextPath#fontSize
   * @method
   * @param {Number} fontSize
   * @returns {Number}
   * @example
   * // get font size
   * var fontSize = shape.fontSize();
   *
   * // set font size to 22px
   * shape.fontSize(22);
   */
  Factory.addGetterSetter(TextPath, 'fontSize', 12, getNumberValidator());
  /**
   * get/set font style.  Can be 'normal', 'italic', or 'bold'.  'normal' is the default.
   * @name Konva.TextPath#fontStyle
   * @method
   * @param {String} fontStyle
   * @returns {String}
   * @example
   * // get font style
   * var fontStyle = shape.fontStyle();
   *
   * // set font style
   * shape.fontStyle('bold');
   */
  Factory.addGetterSetter(TextPath, 'fontStyle', NORMAL$1);
  /**
   * get/set horizontal align of text.  Can be 'left', 'center', 'right' or 'justify'
   * @name Konva.Text#align
   * @method
   * @param {String} align
   * @returns {String}
   * @example
   * // get text align
   * var align = text.align();
   *
   * // center text
   * text.align('center');
   *
   * // align text to right
   * text.align('right');
   */
  Factory.addGetterSetter(TextPath, 'align', 'left');
  /**
   * get/set letter spacing.  The default is 0.
   * @name Konva.TextPath#letterSpacing
   * @method
   * @param {Number} letterSpacing
   * @returns {Number}
   * @example
   * // get line height
   * var letterSpacing = shape.letterSpacing();
   *
   * // set the line height
   * shape.letterSpacing(2);
   */
  Factory.addGetterSetter(TextPath, 'letterSpacing', 0, getNumberValidator());
  /**
   * get/set text baseline.  The default is 'middle'. Can be 'top', 'bottom', 'middle', 'alphabetic', 'hanging'
   * @name Konva.TextPath#textBaseline
   * @method
   * @param {String} textBaseline
   * @returns {String}
   * @example
   * // get line height
   * var textBaseline = shape.textBaseline();
   *
   * // set the line height
   * shape.textBaseline('top');
   */
  Factory.addGetterSetter(TextPath, 'textBaseline', 'middle');
  /**
   * get/set font variant.  Can be 'normal' or 'small-caps'.  'normal' is the default.
   * @name Konva.TextPath#fontVariant
   * @method
   * @param {String} fontVariant
   * @returns {String}
   * @example
   * // get font variant
   * var fontVariant = shape.fontVariant();
   *
   * // set font variant
   * shape.fontVariant('small-caps');
   */
  Factory.addGetterSetter(TextPath, 'fontVariant', NORMAL$1);
  /**
   * get/set text
   * @name Konva.TextPath#getText
   * @method
   * @param {String} text
   * @returns {String}
   * @example
   * // get text
   * var text = text.text();
   *
   * // set text
   * text.text('Hello world!');
   */
  Factory.addGetterSetter(TextPath, 'text', EMPTY_STRING$2);
  /**
   * get/set text decoration of a text.  Can be '' or 'underline'.
   * @name Konva.TextPath#textDecoration
   * @method
   * @param {String} textDecoration
   * @returns {String}
   * @example
   * // get text decoration
   * var textDecoration = shape.textDecoration();
   *
   * // underline text
   * shape.textDecoration('underline');
   */
  Factory.addGetterSetter(TextPath, 'textDecoration', null);
  /**
   * get/set kerning function.
   * @name Konva.TextPath#kerningFunc
   * @method
   * @param {String} kerningFunc
   * @returns {String}
   * @example
   * // get text decoration
   * var kerningFunc = text.kerningFunc();
   *
   * // center text
   * text.kerningFunc(function(leftChar, rightChar) {
   *   return 1;
   * });
   */
  Factory.addGetterSetter(TextPath, 'kerningFunc', null);
  Collection.mapMethods(TextPath);

  var EVENTS_NAME = 'tr-konva';
  var ATTR_CHANGE_LIST$2 = [
      'resizeEnabledChange',
      'rotateAnchorOffsetChange',
      'rotateEnabledChange',
      'enabledAnchorsChange',
      'anchorSizeChange',
      'borderEnabledChange',
      'borderStrokeChange',
      'borderStrokeWidthChange',
      'borderDashChange',
      'anchorStrokeChange',
      'anchorStrokeWidthChange',
      'anchorFillChange',
      'anchorCornerRadiusChange',
      'ignoreStrokeChange',
  ]
      .map(function (e) { return e + ("." + EVENTS_NAME); })
      .join(' ');
  var NODES_RECT = 'nodesRect';
  var TRANSFORM_CHANGE_STR$1 = [
      'widthChange',
      'heightChange',
      'scaleXChange',
      'scaleYChange',
      'skewXChange',
      'skewYChange',
      'rotationChange',
      'offsetXChange',
      'offsetYChange',
      'transformsEnabledChange',
      'strokeWidthChange',
  ]
      .map(function (e) { return e + ("." + EVENTS_NAME); })
      .join(' ');
  var ANGLES = {
      'top-left': -45,
      'top-center': 0,
      'top-right': 45,
      'middle-right': -90,
      'middle-left': 90,
      'bottom-left': -135,
      'bottom-center': 180,
      'bottom-right': 135,
  };
  var TOUCH_DEVICE = 'ontouchstart' in Konva._global;
  function getCursor(anchorName, rad) {
      if (anchorName === 'rotater') {
          return 'crosshair';
      }
      rad += Util._degToRad(ANGLES[anchorName] || 0);
      var angle = ((Util._radToDeg(rad) % 360) + 360) % 360;
      if (Util._inRange(angle, 315 + 22.5, 360) || Util._inRange(angle, 0, 22.5)) {
          // TOP
          return 'ns-resize';
      }
      else if (Util._inRange(angle, 45 - 22.5, 45 + 22.5)) {
          // TOP - RIGHT
          return 'nesw-resize';
      }
      else if (Util._inRange(angle, 90 - 22.5, 90 + 22.5)) {
          // RIGHT
          return 'ew-resize';
      }
      else if (Util._inRange(angle, 135 - 22.5, 135 + 22.5)) {
          // BOTTOM - RIGHT
          return 'nwse-resize';
      }
      else if (Util._inRange(angle, 180 - 22.5, 180 + 22.5)) {
          // BOTTOM
          return 'ns-resize';
      }
      else if (Util._inRange(angle, 225 - 22.5, 225 + 22.5)) {
          // BOTTOM - LEFT
          return 'nesw-resize';
      }
      else if (Util._inRange(angle, 270 - 22.5, 270 + 22.5)) {
          // RIGHT
          return 'ew-resize';
      }
      else if (Util._inRange(angle, 315 - 22.5, 315 + 22.5)) {
          // BOTTOM - RIGHT
          return 'nwse-resize';
      }
      else {
          // how can we can there?
          Util.error('Transformer has unknown angle for cursor detection: ' + angle);
          return 'pointer';
      }
  }
  var ANCHORS_NAMES = [
      'top-left',
      'top-center',
      'top-right',
      'middle-right',
      'middle-left',
      'bottom-left',
      'bottom-center',
      'bottom-right',
  ];
  var MAX_SAFE_INTEGER = 100000000;
  function getCenter(shape) {
      return {
          x: shape.x +
              (shape.width / 2) * Math.cos(shape.rotation) +
              (shape.height / 2) * Math.sin(-shape.rotation),
          y: shape.y +
              (shape.height / 2) * Math.cos(shape.rotation) +
              (shape.width / 2) * Math.sin(shape.rotation),
      };
  }
  function rotateAroundPoint(shape, angleRad, point) {
      var x = point.x +
          (shape.x - point.x) * Math.cos(angleRad) -
          (shape.y - point.y) * Math.sin(angleRad);
      var y = point.y +
          (shape.x - point.x) * Math.sin(angleRad) +
          (shape.y - point.y) * Math.cos(angleRad);
      return __assign(__assign({}, shape), { rotation: shape.rotation + angleRad, x: x,
          y: y });
  }
  function rotateAroundCenter(shape, deltaRad) {
      var center = getCenter(shape);
      return rotateAroundPoint(shape, deltaRad, center);
  }
  function getSnap(snaps, newRotationRad, tol) {
      var snapped = newRotationRad;
      for (var i = 0; i < snaps.length; i++) {
          var angle = Konva.getAngle(snaps[i]);
          var absDiff = Math.abs(angle - newRotationRad) % (Math.PI * 2);
          var dif = Math.min(absDiff, Math.PI * 2 - absDiff);
          if (dif < tol) {
              snapped = angle;
          }
      }
      return snapped;
  }
  /**
   * Transformer constructor.  Transformer is a special type of group that allow you transform Konva
   * primitives and shapes. Transforming tool is not changing `width` and `height` properties of nodes
   * when you resize them. Instead it changes `scaleX` and `scaleY` properties.
   * @constructor
   * @memberof Konva
   * @param {Object} config
   * @param {Boolean} [config.resizeEnabled] Default is true
   * @param {Boolean} [config.rotateEnabled] Default is true
   * @param {Array} [config.rotationSnaps] Array of angles for rotation snaps. Default is []
   * @param {Number} [config.rotationSnapTolerance] Snapping tolerance. If closer than this it will snap. Default is 5
   * @param {Number} [config.rotateAnchorOffset] Default is 50
   * @param {Number} [config.padding] Default is 0
   * @param {Boolean} [config.borderEnabled] Should we draw border? Default is true
   * @param {String} [config.borderStroke] Border stroke color
   * @param {Number} [config.borderStrokeWidth] Border stroke size
   * @param {Array} [config.borderDash] Array for border dash.
   * @param {String} [config.anchorFill] Anchor fill color
   * @param {String} [config.anchorStroke] Anchor stroke color
   * @param {String} [config.anchorCornerRadius] Anchor corner radius
   * @param {Number} [config.anchorStrokeWidth] Anchor stroke size
   * @param {Number} [config.anchorSize] Default is 10
   * @param {Boolean} [config.keepRatio] Should we keep ratio when we are moving edges? Default is true
   * @param {Boolean} [config.centeredScaling] Should we resize relative to node's center? Default is false
   * @param {Array} [config.enabledAnchors] Array of names of enabled handles
   * @param {Function} [config.boundBoxFunc] Bounding box function
   * @param {Function} [config.ignoreStroke] Should we ignore stroke size? Default is false
   *
   * @example
   * var transformer = new Konva.Transformer({
   *   node: rectangle,
   *   rotateAnchorOffset: 60,
   *   enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
   * });
   * layer.add(transformer);
   */
  var Transformer = /** @class */ (function (_super) {
      __extends(Transformer, _super);
      function Transformer(config) {
          var _this = 
          // call super constructor
          _super.call(this, config) || this;
          _this._transforming = false;
          _this._createElements();
          // bindings
          _this._handleMouseMove = _this._handleMouseMove.bind(_this);
          _this._handleMouseUp = _this._handleMouseUp.bind(_this);
          _this.update = _this.update.bind(_this);
          // update transformer data for certain attr changes
          _this.on(ATTR_CHANGE_LIST$2, _this.update);
          if (_this.getNode()) {
              _this.update();
          }
          return _this;
      }
      /**
       * alias to `tr.nodes([shape])`/ This method is deprecated and will be removed soon.
       * @method
       * @name Konva.Transformer#attachTo
       * @returns {Konva.Transformer}
       * @example
       * transformer.attachTo(shape);
       */
      Transformer.prototype.attachTo = function (node) {
          this.setNode(node);
          return this;
      };
      Transformer.prototype.setNode = function (node) {
          Util.warn('tr.setNode(shape), tr.node(shape) and tr.attachTo(shape) methods are deprecated. Please use tr.nodes(nodesArray) instead.');
          return this.setNodes([node]);
      };
      Transformer.prototype.getNode = function () {
          return this._nodes && this._nodes[0];
      };
      Transformer.prototype.setNodes = function (nodes) {
          var _this = this;
          if (nodes === void 0) { nodes = []; }
          if (this._nodes && this._nodes.length) {
              this.detach();
          }
          this._nodes = nodes;
          if (nodes.length === 1) {
              this.rotation(nodes[0].rotation());
          }
          else {
              this.rotation(0);
          }
          this._nodes.forEach(function (node) {
              var additionalEvents = node._attrsAffectingSize
                  .map(function (prop) { return prop + 'Change.' + EVENTS_NAME; })
                  .join(' ');
              var onChange = function () {
                  _this._resetTransformCache();
                  if (!_this._transforming) {
                      _this.update();
                  }
              };
              node.on(additionalEvents, onChange);
              node.on(TRANSFORM_CHANGE_STR$1, onChange);
              node.on("_clearTransformCache." + EVENTS_NAME, onChange);
              node.on("xChange." + EVENTS_NAME + " yChange." + EVENTS_NAME, onChange);
              _this._proxyDrag(node);
          });
          this._resetTransformCache();
          // we may need it if we set node in initial props
          // so elements are not defined yet
          var elementsCreated = !!this.findOne('.top-left');
          if (elementsCreated) {
              this.update();
          }
          return this;
      };
      Transformer.prototype._proxyDrag = function (node) {
          var _this = this;
          var lastPos;
          node.on("dragstart." + EVENTS_NAME, function () {
              lastPos = node.getAbsolutePosition();
          });
          node.on("dragmove." + EVENTS_NAME, function () {
              if (!lastPos) {
                  return;
              }
              var abs = node.getAbsolutePosition();
              var dx = abs.x - lastPos.x;
              var dy = abs.y - lastPos.y;
              _this.nodes().forEach(function (otherNode) {
                  if (otherNode === node) {
                      return;
                  }
                  if (otherNode.isDragging()) {
                      return;
                  }
                  var otherAbs = otherNode.getAbsolutePosition();
                  otherNode.setAbsolutePosition({
                      x: otherAbs.x + dx,
                      y: otherAbs.y + dy,
                  });
                  otherNode.startDrag();
              });
              lastPos = null;
          });
      };
      Transformer.prototype.getNodes = function () {
          return this._nodes;
      };
      /**
       * return the name of current active anchor
       * @method
       * @name Konva.Transformer#getActiveAnchor
       * @returns {String | Null}
       * @example
       * transformer.getActiveAnchor();
       */
      Transformer.prototype.getActiveAnchor = function () {
          return this._movingAnchorName;
      };
      /**
       * detach transformer from an attached node
       * @method
       * @name Konva.Transformer#detach
       * @returns {Konva.Transformer}
       * @example
       * transformer.detach();
       */
      Transformer.prototype.detach = function () {
          // remove events
          if (this._nodes) {
              this._nodes.forEach(function (node) {
                  node.off('.' + EVENTS_NAME);
              });
          }
          this._nodes = [];
          this._resetTransformCache();
      };
      Transformer.prototype._resetTransformCache = function () {
          this._clearCache(NODES_RECT);
          this._clearCache('transform');
          this._clearSelfAndDescendantCache('absoluteTransform');
      };
      Transformer.prototype._getNodeRect = function () {
          return this._getCache(NODES_RECT, this.__getNodeRect);
      };
      // return absolute rotated bounding rectangle
      Transformer.prototype.__getNodeShape = function (node, rot, relative) {
          if (rot === void 0) { rot = this.rotation(); }
          var rect = node.getClientRect({
              skipTransform: true,
              skipShadow: true,
              skipStroke: this.ignoreStroke(),
          });
          var absScale = node.getAbsoluteScale(relative);
          var absPos = node.getAbsolutePosition(relative);
          var dx = rect.x * absScale.x - node.offsetX() * absScale.x;
          var dy = rect.y * absScale.y - node.offsetY() * absScale.y;
          var rotation = (Konva.getAngle(node.getAbsoluteRotation()) + Math.PI * 2) %
              (Math.PI * 2);
          var box = {
              x: absPos.x + dx * Math.cos(rotation) + dy * Math.sin(-rotation),
              y: absPos.y + dy * Math.cos(rotation) + dx * Math.sin(rotation),
              width: rect.width * absScale.x,
              height: rect.height * absScale.y,
              rotation: rotation,
          };
          return rotateAroundPoint(box, -Konva.getAngle(rot), {
              x: 0,
              y: 0,
          });
      };
      // returns box + rotation of all shapes
      Transformer.prototype.__getNodeRect = function () {
          var _this = this;
          var node = this.getNode();
          if (!node) {
              return {
                  x: -MAX_SAFE_INTEGER,
                  y: -MAX_SAFE_INTEGER,
                  width: 0,
                  height: 0,
                  rotation: 0,
              };
          }
          var totalPoints = [];
          this.nodes().map(function (node) {
              var box = node.getClientRect({
                  skipTransform: true,
                  skipShadow: true,
                  skipStroke: _this.ignoreStroke(),
              });
              var points = [
                  { x: box.x, y: box.y },
                  { x: box.x + box.width, y: box.y },
                  { x: box.x + box.width, y: box.y + box.height },
                  { x: box.x, y: box.y + box.height },
              ];
              var trans = node.getAbsoluteTransform();
              points.forEach(function (point) {
                  var transformed = trans.point(point);
                  totalPoints.push(transformed);
              });
          });
          var tr = new Transform();
          tr.rotate(-Konva.getAngle(this.rotation()));
          var minX, minY, maxX, maxY;
          totalPoints.forEach(function (point) {
              var transformed = tr.point(point);
              if (minX === undefined) {
                  minX = maxX = transformed.x;
                  minY = maxY = transformed.y;
              }
              minX = Math.min(minX, transformed.x);
              minY = Math.min(minY, transformed.y);
              maxX = Math.max(maxX, transformed.x);
              maxY = Math.max(maxY, transformed.y);
          });
          tr.invert();
          var p = tr.point({ x: minX, y: minY });
          return {
              x: p.x,
              y: p.y,
              width: maxX - minX,
              height: maxY - minY,
              rotation: Konva.getAngle(this.rotation()),
          };
          // const shapes = this.nodes().map(node => {
          //   return this.__getNodeShape(node);
          // });
          // const box = getShapesRect(shapes);
          // return rotateAroundPoint(box, Konva.getAngle(this.rotation()), {
          //   x: 0,
          //   y: 0
          // });
      };
      Transformer.prototype.getX = function () {
          return this._getNodeRect().x;
      };
      Transformer.prototype.getY = function () {
          return this._getNodeRect().y;
      };
      Transformer.prototype.getWidth = function () {
          return this._getNodeRect().width;
      };
      Transformer.prototype.getHeight = function () {
          return this._getNodeRect().height;
      };
      Transformer.prototype._createElements = function () {
          this._createBack();
          ANCHORS_NAMES.forEach(function (name) {
              this._createAnchor(name);
          }.bind(this));
          this._createAnchor('rotater');
      };
      Transformer.prototype._createAnchor = function (name) {
          var _this = this;
          var anchor = new Rect({
              stroke: 'rgb(0, 161, 255)',
              fill: 'white',
              strokeWidth: 1,
              name: name + ' _anchor',
              dragDistance: 0,
              // make it draggable,
              // so activating the anchror will not start drag&drop of any parent
              draggable: true,
              hitStrokeWidth: TOUCH_DEVICE ? 10 : 'auto',
          });
          var self = this;
          anchor.on('mousedown touchstart', function (e) {
              self._handleMouseDown(e);
          });
          anchor.on('dragstart', function (e) {
              anchor.stopDrag();
              e.cancelBubble = true;
          });
          anchor.on('dragend', function (e) {
              e.cancelBubble = true;
          });
          // add hover styling
          anchor.on('mouseenter', function () {
              var rad = Konva.getAngle(_this.rotation());
              var cursor = getCursor(name, rad);
              anchor.getStage().content.style.cursor = cursor;
              _this._cursorChange = true;
          });
          anchor.on('mouseout', function () {
              anchor.getStage().content.style.cursor = '';
              _this._cursorChange = false;
          });
          this.add(anchor);
      };
      Transformer.prototype._createBack = function () {
          var _this = this;
          var back = new Shape({
              name: 'back',
              width: 0,
              height: 0,
              draggable: true,
              sceneFunc: function (ctx) {
                  var tr = this.getParent();
                  var padding = tr.padding();
                  ctx.beginPath();
                  ctx.rect(-padding, -padding, this.width() + padding * 2, this.height() + padding * 2);
                  ctx.moveTo(this.width() / 2, -padding);
                  if (tr.rotateEnabled()) {
                      ctx.lineTo(this.width() / 2, -tr.rotateAnchorOffset() * Util._sign(this.height()) - padding);
                  }
                  ctx.fillStrokeShape(this);
              },
              hitFunc: function (ctx, shape) {
                  if (!_this.shouldOverdrawWholeArea()) {
                      return;
                  }
                  var padding = _this.padding();
                  ctx.beginPath();
                  ctx.rect(-padding, -padding, shape.width() + padding * 2, shape.height() + padding * 2);
                  ctx.fillStrokeShape(shape);
              },
          });
          this.add(back);
          this._proxyDrag(back);
      };
      Transformer.prototype._handleMouseDown = function (e) {
          this._movingAnchorName = e.target.name().split(' ')[0];
          // var node = this.getNode();
          var attrs = this._getNodeRect();
          var width = attrs.width;
          var height = attrs.height;
          var hypotenuse = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
          this.sin = Math.abs(height / hypotenuse);
          this.cos = Math.abs(width / hypotenuse);
          window.addEventListener('mousemove', this._handleMouseMove);
          window.addEventListener('touchmove', this._handleMouseMove);
          window.addEventListener('mouseup', this._handleMouseUp, true);
          window.addEventListener('touchend', this._handleMouseUp, true);
          this._transforming = true;
          var ap = e.target.getAbsolutePosition();
          var pos = e.target.getStage().getPointerPosition();
          this._anchorDragOffset = {
              x: pos.x - ap.x,
              y: pos.y - ap.y,
          };
          this._fire('transformstart', { evt: e, target: this.getNode() });
          this.getNode()._fire('transformstart', { evt: e, target: this.getNode() });
      };
      Transformer.prototype._handleMouseMove = function (e) {
          var x, y, newHypotenuse;
          var anchorNode = this.findOne('.' + this._movingAnchorName);
          var stage = anchorNode.getStage();
          stage.setPointersPositions(e);
          var pp = stage.getPointerPosition();
          var newNodePos = {
              x: pp.x - this._anchorDragOffset.x,
              y: pp.y - this._anchorDragOffset.y,
          };
          var oldAbs = anchorNode.getAbsolutePosition();
          anchorNode.setAbsolutePosition(newNodePos);
          var newAbs = anchorNode.getAbsolutePosition();
          if (oldAbs.x === newAbs.x && oldAbs.y === newAbs.y) {
              return;
          }
          // rotater is working very differently, so do it first
          if (this._movingAnchorName === 'rotater') {
              var attrs = this._getNodeRect();
              x = anchorNode.x() - attrs.width / 2;
              y = -anchorNode.y() + attrs.height / 2;
              // hor angle is changed?
              var delta = Math.atan2(-y, x) + Math.PI / 2;
              if (attrs.height < 0) {
                  delta -= Math.PI;
              }
              var oldRotation = Konva.getAngle(this.rotation());
              var newRotation = oldRotation + delta;
              var tol = Konva.getAngle(this.rotationSnapTolerance());
              var snappedRot = getSnap(this.rotationSnaps(), newRotation, tol);
              var diff = snappedRot - attrs.rotation;
              var shape = rotateAroundCenter(attrs, diff);
              this._fitNodesInto(shape, e);
              return;
          }
          var keepProportion = this.keepRatio() || e.shiftKey;
          var centeredScaling = this.centeredScaling() || e.altKey;
          if (this._movingAnchorName === 'top-left') {
              if (keepProportion) {
                  var comparePoint = centeredScaling
                      ? {
                          x: this.width() / 2,
                          y: this.height() / 2,
                      }
                      : {
                          x: this.findOne('.bottom-right').x(),
                          y: this.findOne('.bottom-right').y(),
                      };
                  newHypotenuse = Math.sqrt(Math.pow(comparePoint.x - anchorNode.x(), 2) +
                      Math.pow(comparePoint.y - anchorNode.y(), 2));
                  var reverseX = this.findOne('.top-left').x() > comparePoint.x ? -1 : 1;
                  var reverseY = this.findOne('.top-left').y() > comparePoint.y ? -1 : 1;
                  x = newHypotenuse * this.cos * reverseX;
                  y = newHypotenuse * this.sin * reverseY;
                  this.findOne('.top-left').x(comparePoint.x - x);
                  this.findOne('.top-left').y(comparePoint.y - y);
              }
          }
          else if (this._movingAnchorName === 'top-center') {
              this.findOne('.top-left').y(anchorNode.y());
          }
          else if (this._movingAnchorName === 'top-right') {
              if (keepProportion) {
                  var comparePoint = centeredScaling
                      ? {
                          x: this.width() / 2,
                          y: this.height() / 2,
                      }
                      : {
                          x: this.findOne('.bottom-left').x(),
                          y: this.findOne('.bottom-left').y(),
                      };
                  newHypotenuse = Math.sqrt(Math.pow(anchorNode.x() - comparePoint.x, 2) +
                      Math.pow(comparePoint.y - anchorNode.y(), 2));
                  var reverseX = this.findOne('.top-right').x() < comparePoint.x ? -1 : 1;
                  var reverseY = this.findOne('.top-right').y() > comparePoint.y ? -1 : 1;
                  x = newHypotenuse * this.cos * reverseX;
                  y = newHypotenuse * this.sin * reverseY;
                  this.findOne('.top-right').x(comparePoint.x + x);
                  this.findOne('.top-right').y(comparePoint.y - y);
              }
              var pos = anchorNode.position();
              this.findOne('.top-left').y(pos.y);
              this.findOne('.bottom-right').x(pos.x);
          }
          else if (this._movingAnchorName === 'middle-left') {
              this.findOne('.top-left').x(anchorNode.x());
          }
          else if (this._movingAnchorName === 'middle-right') {
              this.findOne('.bottom-right').x(anchorNode.x());
          }
          else if (this._movingAnchorName === 'bottom-left') {
              if (keepProportion) {
                  var comparePoint = centeredScaling
                      ? {
                          x: this.width() / 2,
                          y: this.height() / 2,
                      }
                      : {
                          x: this.findOne('.top-right').x(),
                          y: this.findOne('.top-right').y(),
                      };
                  newHypotenuse = Math.sqrt(Math.pow(comparePoint.x - anchorNode.x(), 2) +
                      Math.pow(anchorNode.y() - comparePoint.y, 2));
                  var reverseX = comparePoint.x < anchorNode.x() ? -1 : 1;
                  var reverseY = anchorNode.y() < comparePoint.y ? -1 : 1;
                  x = newHypotenuse * this.cos * reverseX;
                  y = newHypotenuse * this.sin * reverseY;
                  anchorNode.x(comparePoint.x - x);
                  anchorNode.y(comparePoint.y + y);
              }
              pos = anchorNode.position();
              this.findOne('.top-left').x(pos.x);
              this.findOne('.bottom-right').y(pos.y);
          }
          else if (this._movingAnchorName === 'bottom-center') {
              this.findOne('.bottom-right').y(anchorNode.y());
          }
          else if (this._movingAnchorName === 'bottom-right') {
              if (keepProportion) {
                  var comparePoint = centeredScaling
                      ? {
                          x: this.width() / 2,
                          y: this.height() / 2,
                      }
                      : {
                          x: this.findOne('.top-left').x(),
                          y: this.findOne('.top-left').y(),
                      };
                  newHypotenuse = Math.sqrt(Math.pow(anchorNode.x() - comparePoint.x, 2) +
                      Math.pow(anchorNode.y() - comparePoint.y, 2));
                  var reverseX = this.findOne('.bottom-right').x() < comparePoint.x ? -1 : 1;
                  var reverseY = this.findOne('.bottom-right').y() < comparePoint.y ? -1 : 1;
                  x = newHypotenuse * this.cos * reverseX;
                  y = newHypotenuse * this.sin * reverseY;
                  this.findOne('.bottom-right').x(comparePoint.x + x);
                  this.findOne('.bottom-right').y(comparePoint.y + y);
              }
          }
          else {
              console.error(new Error('Wrong position argument of selection resizer: ' +
                  this._movingAnchorName));
          }
          var centeredScaling = this.centeredScaling() || e.altKey;
          if (centeredScaling) {
              var topLeft = this.findOne('.top-left');
              var bottomRight = this.findOne('.bottom-right');
              var topOffsetX = topLeft.x();
              var topOffsetY = topLeft.y();
              var bottomOffsetX = this.getWidth() - bottomRight.x();
              var bottomOffsetY = this.getHeight() - bottomRight.y();
              bottomRight.move({
                  x: -topOffsetX,
                  y: -topOffsetY,
              });
              topLeft.move({
                  x: bottomOffsetX,
                  y: bottomOffsetY,
              });
          }
          var absPos = this.findOne('.top-left').getAbsolutePosition();
          x = absPos.x;
          y = absPos.y;
          var width = this.findOne('.bottom-right').x() - this.findOne('.top-left').x();
          var height = this.findOne('.bottom-right').y() - this.findOne('.top-left').y();
          this._fitNodesInto({
              x: x,
              y: y,
              width: width,
              height: height,
              rotation: Konva.getAngle(this.rotation()),
          }, e);
      };
      Transformer.prototype._handleMouseUp = function (e) {
          this._removeEvents(e);
      };
      Transformer.prototype.getAbsoluteTransform = function () {
          return this.getTransform();
      };
      Transformer.prototype._removeEvents = function (e) {
          if (this._transforming) {
              this._transforming = false;
              window.removeEventListener('mousemove', this._handleMouseMove);
              window.removeEventListener('touchmove', this._handleMouseMove);
              window.removeEventListener('mouseup', this._handleMouseUp, true);
              window.removeEventListener('touchend', this._handleMouseUp, true);
              var node = this.getNode();
              this._fire('transformend', { evt: e, target: node });
              if (node) {
                  node.fire('transformend', { evt: e, target: node });
              }
              this._movingAnchorName = null;
          }
      };
      Transformer.prototype._fitNodesInto = function (newAttrs, evt) {
          var _this = this;
          var oldAttrs = this._getNodeRect();
          var minSize = 1;
          if (Util._inRange(newAttrs.width, -this.padding() * 2 - minSize, minSize)) {
              this.update();
              return;
          }
          if (Util._inRange(newAttrs.height, -this.padding() * 2 - minSize, minSize)) {
              this.update();
              return;
          }
          var t = new Transform();
          t.rotate(Konva.getAngle(this.rotation()));
          if (this._movingAnchorName &&
              newAttrs.width < 0 &&
              this._movingAnchorName.indexOf('left') >= 0) {
              var offset = t.point({
                  x: -this.padding() * 2,
                  y: 0,
              });
              newAttrs.x += offset.x;
              newAttrs.y += offset.y;
              newAttrs.width += this.padding() * 2;
              this._movingAnchorName = this._movingAnchorName.replace('left', 'right');
              this._anchorDragOffset.x -= offset.x;
              this._anchorDragOffset.y -= offset.y;
          }
          else if (this._movingAnchorName &&
              newAttrs.width < 0 &&
              this._movingAnchorName.indexOf('right') >= 0) {
              var offset = t.point({
                  x: this.padding() * 2,
                  y: 0,
              });
              this._movingAnchorName = this._movingAnchorName.replace('right', 'left');
              this._anchorDragOffset.x -= offset.x;
              this._anchorDragOffset.y -= offset.y;
              newAttrs.width += this.padding() * 2;
          }
          if (this._movingAnchorName &&
              newAttrs.height < 0 &&
              this._movingAnchorName.indexOf('top') >= 0) {
              var offset = t.point({
                  x: 0,
                  y: -this.padding() * 2,
              });
              newAttrs.x += offset.x;
              newAttrs.y += offset.y;
              this._movingAnchorName = this._movingAnchorName.replace('top', 'bottom');
              this._anchorDragOffset.x -= offset.x;
              this._anchorDragOffset.y -= offset.y;
              newAttrs.height += this.padding() * 2;
          }
          else if (this._movingAnchorName &&
              newAttrs.height < 0 &&
              this._movingAnchorName.indexOf('bottom') >= 0) {
              var offset = t.point({
                  x: 0,
                  y: this.padding() * 2,
              });
              this._movingAnchorName = this._movingAnchorName.replace('bottom', 'top');
              this._anchorDragOffset.x -= offset.x;
              this._anchorDragOffset.y -= offset.y;
              newAttrs.height += this.padding() * 2;
          }
          if (this.boundBoxFunc()) {
              var bounded = this.boundBoxFunc()(oldAttrs, newAttrs);
              if (bounded) {
                  newAttrs = bounded;
              }
              else {
                  Util.warn('boundBoxFunc returned falsy. You should return new bound rect from it!');
              }
          }
          // base size value doesn't really matter
          // we just need to think about bounding boxes as transforms
          // but how?
          // the idea is that we have a transformed rectangle with the size of "baseSize"
          var baseSize = 10000000;
          var oldTr = new Transform();
          oldTr.translate(oldAttrs.x, oldAttrs.y);
          oldTr.rotate(oldAttrs.rotation);
          oldTr.scale(oldAttrs.width / baseSize, oldAttrs.height / baseSize);
          var newTr = new Transform();
          newTr.translate(newAttrs.x, newAttrs.y);
          newTr.rotate(newAttrs.rotation);
          newTr.scale(newAttrs.width / baseSize, newAttrs.height / baseSize);
          // now lets think we had [old transform] and now we have [new transform]
          // Now, the questions is: how can we transform "parent" to go from [old transform] into [new transform]
          // in equation it will be:
          // [delta transform] * [old transform] = [new transform]
          // that means that
          // [delta transform] = [new transform] * [old transform inverted]
          var delta = newTr.multiply(oldTr.invert());
          this._nodes.forEach(function (node) {
              // for each node we have the same [delta transform]
              // the equations is
              // [delta transform] * [parent transform] * [old local transform] = [parent transform] * [new local transform]
              // and we need to find [new local transform]
              // [new local] = [parent inverted] * [delta] * [parent] * [old local]
              var parentTransform = node.getParent().getAbsoluteTransform();
              var localTransform = node.getTransform().copy();
              // skip offset:
              localTransform.translate(node.offsetX(), node.offsetY());
              var newLocalTransform = new Transform();
              newLocalTransform
                  .multiply(parentTransform.copy().invert())
                  .multiply(delta)
                  .multiply(parentTransform)
                  .multiply(localTransform);
              var attrs = newLocalTransform.decompose();
              node._batchTransformChanges(function () {
                  node.setAttrs(attrs);
              });
              _this._fire('transform', { evt: evt, target: node });
              node._fire('transform', { evt: evt, target: node });
          });
          this.rotation(Util._getRotation(newAttrs.rotation));
          this._resetTransformCache();
          this.update();
          this.getLayer().batchDraw();
      };
      /**
       * force update of Konva.Transformer.
       * Use it when you updated attached Konva.Group and now you need to reset transformer size
       * @method
       * @name Konva.Transformer#forceUpdate
       */
      Transformer.prototype.forceUpdate = function () {
          this._resetTransformCache();
          this.update();
      };
      Transformer.prototype._batchChangeChild = function (selector, attrs) {
          var anchor = this.findOne(selector);
          anchor._batchTransformChanges(function () {
              anchor.setAttrs(attrs);
          });
      };
      Transformer.prototype.update = function () {
          var _this = this;
          var attrs = this._getNodeRect();
          this.rotation(Util._getRotation(attrs.rotation));
          var width = attrs.width;
          var height = attrs.height;
          var enabledAnchors = this.enabledAnchors();
          var resizeEnabled = this.resizeEnabled();
          var padding = this.padding();
          var anchorSize = this.anchorSize();
          this.find('._anchor').each(function (node) {
              node._batchTransformChanges(function () {
                  node.setAttrs({
                      width: anchorSize,
                      height: anchorSize,
                      offsetX: anchorSize / 2,
                      offsetY: anchorSize / 2,
                      stroke: _this.anchorStroke(),
                      strokeWidth: _this.anchorStrokeWidth(),
                      fill: _this.anchorFill(),
                      cornerRadius: _this.anchorCornerRadius(),
                  });
              });
          });
          this._batchChangeChild('.top-left', {
              x: 0,
              y: 0,
              offsetX: anchorSize / 2 + padding,
              offsetY: anchorSize / 2 + padding,
              visible: resizeEnabled && enabledAnchors.indexOf('top-left') >= 0,
          });
          this._batchChangeChild('.top-center', {
              x: width / 2,
              y: 0,
              offsetY: anchorSize / 2 + padding,
              visible: resizeEnabled && enabledAnchors.indexOf('top-center') >= 0,
          });
          this._batchChangeChild('.top-right', {
              x: width,
              y: 0,
              offsetX: anchorSize / 2 - padding,
              offsetY: anchorSize / 2 + padding,
              visible: resizeEnabled && enabledAnchors.indexOf('top-right') >= 0,
          });
          this._batchChangeChild('.middle-left', {
              x: 0,
              y: height / 2,
              offsetX: anchorSize / 2 + padding,
              visible: resizeEnabled && enabledAnchors.indexOf('middle-left') >= 0,
          });
          this._batchChangeChild('.middle-right', {
              x: width,
              y: height / 2,
              offsetX: anchorSize / 2 - padding,
              visible: resizeEnabled && enabledAnchors.indexOf('middle-right') >= 0,
          });
          this._batchChangeChild('.bottom-left', {
              x: 0,
              y: height,
              offsetX: anchorSize / 2 + padding,
              offsetY: anchorSize / 2 - padding,
              visible: resizeEnabled && enabledAnchors.indexOf('bottom-left') >= 0,
          });
          this._batchChangeChild('.bottom-center', {
              x: width / 2,
              y: height,
              offsetY: anchorSize / 2 - padding,
              visible: resizeEnabled && enabledAnchors.indexOf('bottom-center') >= 0,
          });
          this._batchChangeChild('.bottom-right', {
              x: width,
              y: height,
              offsetX: anchorSize / 2 - padding,
              offsetY: anchorSize / 2 - padding,
              visible: resizeEnabled && enabledAnchors.indexOf('bottom-right') >= 0,
          });
          this._batchChangeChild('.rotater', {
              x: width / 2,
              y: -this.rotateAnchorOffset() * Util._sign(height) - padding,
              visible: this.rotateEnabled(),
          });
          this._batchChangeChild('.back', {
              width: width,
              height: height,
              visible: this.borderEnabled(),
              stroke: this.borderStroke(),
              strokeWidth: this.borderStrokeWidth(),
              dash: this.borderDash(),
              x: 0,
              y: 0,
          });
      };
      /**
       * determine if transformer is in active transform
       * @method
       * @name Konva.Transformer#isTransforming
       * @returns {Boolean}
       */
      Transformer.prototype.isTransforming = function () {
          return this._transforming;
      };
      /**
       * Stop active transform action
       * @method
       * @name Konva.Transformer#stopTransform
       * @returns {Boolean}
       */
      Transformer.prototype.stopTransform = function () {
          if (this._transforming) {
              this._removeEvents();
              var anchorNode = this.findOne('.' + this._movingAnchorName);
              if (anchorNode) {
                  anchorNode.stopDrag();
              }
          }
      };
      Transformer.prototype.destroy = function () {
          if (this.getStage() && this._cursorChange) {
              this.getStage().content.style.cursor = '';
          }
          Group.prototype.destroy.call(this);
          this.detach();
          this._removeEvents();
          return this;
      };
      // do not work as a container
      // we will recreate inner nodes manually
      Transformer.prototype.toObject = function () {
          return Node.prototype.toObject.call(this);
      };
      return Transformer;
  }(Group));
  function validateAnchors(val) {
      if (!(val instanceof Array)) {
          Util.warn('enabledAnchors value should be an array');
      }
      if (val instanceof Array) {
          val.forEach(function (name) {
              if (ANCHORS_NAMES.indexOf(name) === -1) {
                  Util.warn('Unknown anchor name: ' +
                      name +
                      '. Available names are: ' +
                      ANCHORS_NAMES.join(', '));
              }
          });
      }
      return val || [];
  }
  Transformer.prototype.className = 'Transformer';
  _registerNode(Transformer);
  /**
   * get/set enabled handlers
   * @name Konva.Transformer#enabledAnchors
   * @method
   * @param {Array} array
   * @returns {Array}
   * @example
   * // get list of handlers
   * var enabledAnchors = transformer.enabledAnchors();
   *
   * // set handlers
   * transformer.enabledAnchors(['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right']);
   */
  Factory.addGetterSetter(Transformer, 'enabledAnchors', ANCHORS_NAMES, validateAnchors);
  /**
   * get/set resize ability. If false it will automatically hide resizing handlers
   * @name Konva.Transformer#resizeEnabled
   * @method
   * @param {Array} array
   * @returns {Array}
   * @example
   * // get
   * var resizeEnabled = transformer.resizeEnabled();
   *
   * // set
   * transformer.resizeEnabled(false);
   */
  Factory.addGetterSetter(Transformer, 'resizeEnabled', true);
  /**
   * get/set anchor size. Default is 10
   * @name Konva.Transformer#validateAnchors
   * @method
   * @param {Number} 10
   * @returns {Number}
   * @example
   * // get
   * var anchorSize = transformer.anchorSize();
   *
   * // set
   * transformer.anchorSize(20)
   */
  Factory.addGetterSetter(Transformer, 'anchorSize', 10, getNumberValidator());
  /**
   * get/set ability to rotate.
   * @name Konva.Transformer#rotateEnabled
   * @method
   * @param {Boolean} enabled
   * @returns {Boolean}
   * @example
   * // get
   * var rotateEnabled = transformer.rotateEnabled();
   *
   * // set
   * transformer.rotateEnabled(false);
   */
  Factory.addGetterSetter(Transformer, 'rotateEnabled', true);
  /**
   * get/set rotation snaps angles.
   * @name Konva.Transformer#rotationSnaps
   * @method
   * @param {Array} array
   * @returns {Array}
   * @example
   * // get
   * var rotationSnaps = transformer.rotationSnaps();
   *
   * // set
   * transformer.rotationSnaps([0, 90, 180, 270]);
   */
  Factory.addGetterSetter(Transformer, 'rotationSnaps', []);
  /**
   * get/set distance for rotation handler
   * @name Konva.Transformer#rotateAnchorOffset
   * @method
   * @param {Number} offset
   * @returns {Number}
   * @example
   * // get
   * var rotateAnchorOffset = transformer.rotateAnchorOffset();
   *
   * // set
   * transformer.rotateAnchorOffset(100);
   */
  Factory.addGetterSetter(Transformer, 'rotateAnchorOffset', 50, getNumberValidator());
  /**
   * get/set distance for rotation tolerance
   * @name Konva.Transformer#rotationSnapTolerance
   * @method
   * @param {Number} tolerance
   * @returns {Number}
   * @example
   * // get
   * var rotationSnapTolerance = transformer.rotationSnapTolerance();
   *
   * // set
   * transformer.rotationSnapTolerance(100);
   */
  Factory.addGetterSetter(Transformer, 'rotationSnapTolerance', 5, getNumberValidator());
  /**
   * get/set visibility of border
   * @name Konva.Transformer#borderEnabled
   * @method
   * @param {Boolean} enabled
   * @returns {Boolean}
   * @example
   * // get
   * var borderEnabled = transformer.borderEnabled();
   *
   * // set
   * transformer.borderEnabled(false);
   */
  Factory.addGetterSetter(Transformer, 'borderEnabled', true);
  /**
   * get/set anchor stroke color
   * @name Konva.Transformer#anchorStroke
   * @method
   * @param {Boolean} enabled
   * @returns {Boolean}
   * @example
   * // get
   * var anchorStroke = transformer.anchorStroke();
   *
   * // set
   * transformer.anchorStroke('red');
   */
  Factory.addGetterSetter(Transformer, 'anchorStroke', 'rgb(0, 161, 255)');
  /**
   * get/set anchor stroke width
   * @name Konva.Transformer#anchorStrokeWidth
   * @method
   * @param {Boolean} enabled
   * @returns {Boolean}
   * @example
   * // get
   * var anchorStrokeWidth = transformer.anchorStrokeWidth();
   *
   * // set
   * transformer.anchorStrokeWidth(3);
   */
  Factory.addGetterSetter(Transformer, 'anchorStrokeWidth', 1, getNumberValidator());
  /**
   * get/set anchor fill color
   * @name Konva.Transformer#anchorFill
   * @method
   * @param {Boolean} enabled
   * @returns {Boolean}
   * @example
   * // get
   * var anchorFill = transformer.anchorFill();
   *
   * // set
   * transformer.anchorFill('red');
   */
  Factory.addGetterSetter(Transformer, 'anchorFill', 'white');
  /**
   * get/set anchor corner radius
   * @name Konva.Transformer#anchorCornerRadius
   * @method
   * @param {Number} enabled
   * @returns {Number}
   * @example
   * // get
   * var anchorCornerRadius = transformer.anchorCornerRadius();
   *
   * // set
   * transformer.anchorCornerRadius(3);
   */
  Factory.addGetterSetter(Transformer, 'anchorCornerRadius', 0, getNumberValidator());
  /**
   * get/set border stroke color
   * @name Konva.Transformer#borderStroke
   * @method
   * @param {Boolean} enabled
   * @returns {Boolean}
   * @example
   * // get
   * var borderStroke = transformer.borderStroke();
   *
   * // set
   * transformer.borderStroke('red');
   */
  Factory.addGetterSetter(Transformer, 'borderStroke', 'rgb(0, 161, 255)');
  /**
   * get/set border stroke width
   * @name Konva.Transformer#borderStrokeWidth
   * @method
   * @param {Boolean} enabled
   * @returns {Boolean}
   * @example
   * // get
   * var borderStrokeWidth = transformer.borderStrokeWidth();
   *
   * // set
   * transformer.borderStrokeWidth(3);
   */
  Factory.addGetterSetter(Transformer, 'borderStrokeWidth', 1, getNumberValidator());
  /**
   * get/set border dash array
   * @name Konva.Transformer#borderDash
   * @method
   * @param {Boolean} enabled
   * @returns {Boolean}
   * @example
   * // get
   * var borderDash = transformer.borderDash();
   *
   * // set
   * transformer.borderDash([2, 2]);
   */
  Factory.addGetterSetter(Transformer, 'borderDash');
  /**
   * get/set should we keep ratio while resize anchors at corners
   * @name Konva.Transformer#keepRatio
   * @method
   * @param {Boolean} keepRatio
   * @returns {Boolean}
   * @example
   * // get
   * var keepRatio = transformer.keepRatio();
   *
   * // set
   * transformer.keepRatio(false);
   */
  Factory.addGetterSetter(Transformer, 'keepRatio', true);
  /**
   * get/set should we resize relative to node's center?
   * @name Konva.Transformer#centeredScaling
   * @method
   * @param {Boolean} centeredScaling
   * @returns {Boolean}
   * @example
   * // get
   * var centeredScaling = transformer.centeredScaling();
   *
   * // set
   * transformer.centeredScaling(true);
   */
  Factory.addGetterSetter(Transformer, 'centeredScaling', false);
  /**
   * get/set should we think about stroke while resize? Good to use when a shape has strokeScaleEnabled = false
   * default is false
   * @name Konva.Transformer#ignoreStroke
   * @method
   * @param {Boolean} ignoreStroke
   * @returns {Boolean}
   * @example
   * // get
   * var ignoreStroke = transformer.ignoreStroke();
   *
   * // set
   * transformer.ignoreStroke(true);
   */
  Factory.addGetterSetter(Transformer, 'ignoreStroke', false);
  /**
   * get/set padding
   * @name Konva.Transformer#padding
   * @method
   * @param {Number} padding
   * @returns {Number}
   * @example
   * // get
   * var padding = transformer.padding();
   *
   * // set
   * transformer.padding(10);
   */
  Factory.addGetterSetter(Transformer, 'padding', 0, getNumberValidator());
  /**
   * get/set attached node of the Transformer. Transformer will adapt to its size and listen to its events.
   * **This method is deprecated and will be removed soon.** Please use `tr.nodes([shape1, shape2]);` instead
   * @method
   * @name Konva.Transformer#Konva.Transformer#node
   * @returns {Konva.Node}
   * @example
   * // get
   * const node = transformer.node();
   *
   * // set
   * transformer.node(shape);
   */
  Factory.addGetterSetter(Transformer, 'node');
  /**
   * get/set attached nodes of the Transformer. Transformer will adapt to their size and listen to their events
   * @method
   * @name Konva.Transformer#Konva.Transformer#node
   * @returns {Konva.Node}
   * @example
   * // get
   * const nodes = transformer.nodes();
   *
   * // set
   * transformer.nodes([rect, circle]);
   * // push new item:
   *
   * const oldNodes = transformer.nodes();
   * const newNodes = oldNodes.concat([newShape]);
   * transformer.nodes(newNodes);
   */
  Factory.addGetterSetter(Transformer, 'nodes');
  /**
   * get/set bounding box function. **IMPORTANT!** boundBondFunc operates in absolute coordinates.
   * @name Konva.Transformer#boundBoxFunc
   * @method
   * @param {Function} func
   * @returns {Function}
   * @example
   * // get
   * var boundBoxFunc = transformer.boundBoxFunc();
   *
   * // set
   * transformer.boundBoxFunc(function(oldBox, newBox) {
   *   // width and height of the boxes are corresponding to total absolute width and height of all nodes combined
   *   // so it includes scale of the node.
   *   if (newBox.width > 200) {
   *     return oldBox;
   *   }
   *   return newBox;
   * });
   */
  Factory.addGetterSetter(Transformer, 'boundBoxFunc');
  Factory.addGetterSetter(Transformer, 'shouldOverdrawWholeArea', false);
  Factory.backCompat(Transformer, {
      lineEnabled: 'borderEnabled',
      rotateHandlerOffset: 'rotateAnchorOffset',
      enabledHandlers: 'enabledAnchors',
  });
  Collection.mapMethods(Transformer);

  /**
   * Wedge constructor
   * @constructor
   * @memberof Konva
   * @augments Konva.Shape
   * @param {Object} config
   * @param {Number} config.angle in degrees
   * @param {Number} config.radius
   * @param {Boolean} [config.clockwise]
   * @param {String} [config.fill] fill color
     * @param {Image} [config.fillPatternImage] fill pattern image
     * @param {Number} [config.fillPatternX]
     * @param {Number} [config.fillPatternY]
     * @param {Object} [config.fillPatternOffset] object with x and y component
     * @param {Number} [config.fillPatternOffsetX] 
     * @param {Number} [config.fillPatternOffsetY] 
     * @param {Object} [config.fillPatternScale] object with x and y component
     * @param {Number} [config.fillPatternScaleX]
     * @param {Number} [config.fillPatternScaleY]
     * @param {Number} [config.fillPatternRotation]
     * @param {String} [config.fillPatternRepeat] can be "repeat", "repeat-x", "repeat-y", or "no-repeat".  The default is "no-repeat"
     * @param {Object} [config.fillLinearGradientStartPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientStartPointX]
     * @param {Number} [config.fillLinearGradientStartPointY]
     * @param {Object} [config.fillLinearGradientEndPoint] object with x and y component
     * @param {Number} [config.fillLinearGradientEndPointX]
     * @param {Number} [config.fillLinearGradientEndPointY]
     * @param {Array} [config.fillLinearGradientColorStops] array of color stops
     * @param {Object} [config.fillRadialGradientStartPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientStartPointX]
     * @param {Number} [config.fillRadialGradientStartPointY]
     * @param {Object} [config.fillRadialGradientEndPoint] object with x and y component
     * @param {Number} [config.fillRadialGradientEndPointX] 
     * @param {Number} [config.fillRadialGradientEndPointY] 
     * @param {Number} [config.fillRadialGradientStartRadius]
     * @param {Number} [config.fillRadialGradientEndRadius]
     * @param {Array} [config.fillRadialGradientColorStops] array of color stops
     * @param {Boolean} [config.fillEnabled] flag which enables or disables the fill.  The default value is true
     * @param {String} [config.fillPriority] can be color, linear-gradient, radial-graident, or pattern.  The default value is color.  The fillPriority property makes it really easy to toggle between different fill types.  For example, if you want to toggle between a fill color style and a fill pattern style, simply set the fill property and the fillPattern properties, and then use setFillPriority('color') to render the shape with a color fill, or use setFillPriority('pattern') to render the shape with the pattern fill configuration
     * @param {String} [config.stroke] stroke color
     * @param {Number} [config.strokeWidth] stroke width
     * @param {Number} [config.hitStrokeWidth] size of the stroke on hit canvas.  The default is "auto" - equals to strokeWidth
     * @param {Boolean} [config.strokeHitEnabled] flag which enables or disables stroke hit region.  The default is true
     * @param {Boolean} [config.perfectDrawEnabled] flag which enables or disables using buffer canvas.  The default is true
     * @param {Boolean} [config.shadowForStrokeEnabled] flag which enables or disables shadow for stroke.  The default is true
     * @param {Boolean} [config.strokeScaleEnabled] flag which enables or disables stroke scale.  The default is true
     * @param {Boolean} [config.strokeEnabled] flag which enables or disables the stroke.  The default value is true
     * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
     *  is miter
     * @param {String} [config.lineCap] can be butt, round, or square.  The default
     *  is butt
     * @param {String} [config.shadowColor]
     * @param {Number} [config.shadowBlur]
     * @param {Object} [config.shadowOffset] object with x and y component
     * @param {Number} [config.shadowOffsetX]
     * @param {Number} [config.shadowOffsetY]
     * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
     *  between 0 and 1
     * @param {Boolean} [config.shadowEnabled] flag which enables or disables the shadow.  The default value is true
     * @param {Array} [config.dash]
     * @param {Boolean} [config.dashEnabled] flag which enables or disables the dashArray.  The default value is true

   * @param {Number} [config.x]
     * @param {Number} [config.y]
     * @param {Number} [config.width]
     * @param {Number} [config.height]
     * @param {Boolean} [config.visible]
     * @param {Boolean} [config.listening] whether or not the node is listening for events
     * @param {String} [config.id] unique id
     * @param {String} [config.name] non-unique name
     * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
     * @param {Object} [config.scale] set scale
     * @param {Number} [config.scaleX] set scale x
     * @param {Number} [config.scaleY] set scale y
     * @param {Number} [config.rotation] rotation in degrees
     * @param {Object} [config.offset] offset from center point and rotation point
     * @param {Number} [config.offsetX] set offset x
     * @param {Number} [config.offsetY] set offset y
     * @param {Boolean} [config.draggable] makes the node draggable.  When stages are draggable, you can drag and drop
     *  the entire stage by dragging any portion of the stage
     * @param {Number} [config.dragDistance]
     * @param {Function} [config.dragBoundFunc]
   * @example
   * // draw a wedge that's pointing downwards
   * var wedge = new Konva.Wedge({
   *   radius: 40,
   *   fill: 'red',
   *   stroke: 'black'
   *   strokeWidth: 5,
   *   angleDeg: 60,
   *   rotationDeg: -120
   * });
   */
  var Wedge = /** @class */ (function (_super) {
      __extends(Wedge, _super);
      function Wedge() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      Wedge.prototype._sceneFunc = function (context) {
          context.beginPath();
          context.arc(0, 0, this.radius(), 0, Konva.getAngle(this.angle()), this.clockwise());
          context.lineTo(0, 0);
          context.closePath();
          context.fillStrokeShape(this);
      };
      Wedge.prototype.getWidth = function () {
          return this.radius() * 2;
      };
      Wedge.prototype.getHeight = function () {
          return this.radius() * 2;
      };
      Wedge.prototype.setWidth = function (width) {
          this.radius(width / 2);
      };
      Wedge.prototype.setHeight = function (height) {
          this.radius(height / 2);
      };
      return Wedge;
  }(Shape));
  Wedge.prototype.className = 'Wedge';
  Wedge.prototype._centroid = true;
  Wedge.prototype._attrsAffectingSize = ['radius'];
  _registerNode(Wedge);
  /**
   * get/set radius
   * @name Konva.Wedge#radius
   * @method
   * @param {Number} radius
   * @returns {Number}
   * @example
   * // get radius
   * var radius = wedge.radius();
   *
   * // set radius
   * wedge.radius(10);
   */
  Factory.addGetterSetter(Wedge, 'radius', 0, getNumberValidator());
  /**
   * get/set angle in degrees
   * @name Konva.Wedge#angle
   * @method
   * @param {Number} angle
   * @returns {Number}
   * @example
   * // get angle
   * var angle = wedge.angle();
   *
   * // set angle
   * wedge.angle(20);
   */
  Factory.addGetterSetter(Wedge, 'angle', 0, getNumberValidator());
  /**
   * get/set clockwise flag
   * @name Konva.Wedge#clockwise
   * @method
   * @param {Number} clockwise
   * @returns {Number}
   * @example
   * // get clockwise flag
   * var clockwise = wedge.clockwise();
   *
   * // draw wedge counter-clockwise
   * wedge.clockwise(false);
   *
   * // draw wedge clockwise
   * wedge.clockwise(true);
   */
  Factory.addGetterSetter(Wedge, 'clockwise', false);
  Factory.backCompat(Wedge, {
      angleDeg: 'angle',
      getAngleDeg: 'getAngle',
      setAngleDeg: 'setAngle'
  });
  Collection.mapMethods(Wedge);

  /*
   the Gauss filter
   master repo: https://github.com/pavelpower/kineticjsGaussFilter
  */
  /*

       StackBlur - a fast almost Gaussian Blur For Canvas

       Version:   0.5
       Author:    Mario Klingemann
       Contact:   mario@quasimondo.com
       Website:   http://www.quasimondo.com/StackBlurForCanvas
       Twitter:   @quasimondo

       In case you find this class useful - especially in commercial projects -
       I am not totally unhappy for a small donation to my PayPal account
       mario@quasimondo.de

       Or support me on flattr:
       https://flattr.com/thing/72791/StackBlur-a-fast-almost-Gaussian-Blur-Effect-for-CanvasJavascript

       Copyright (c) 2010 Mario Klingemann

       Permission is hereby granted, free of charge, to any person
       obtaining a copy of this software and associated documentation
       files (the "Software"), to deal in the Software without
       restriction, including without limitation the rights to use,
       copy, modify, merge, publish, distribute, sublicense, and/or sell
       copies of the Software, and to permit persons to whom the
       Software is furnished to do so, subject to the following
       conditions:

       The above copyright notice and this permission notice shall be
       included in all copies or substantial portions of the Software.

       THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
       EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
       OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
       NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
       HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
       WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
       FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
       OTHER DEALINGS IN THE SOFTWARE.
       */
  function BlurStack() {
      this.r = 0;
      this.g = 0;
      this.b = 0;
      this.a = 0;
      this.next = null;
  }
  var mul_table = [
      512,
      512,
      456,
      512,
      328,
      456,
      335,
      512,
      405,
      328,
      271,
      456,
      388,
      335,
      292,
      512,
      454,
      405,
      364,
      328,
      298,
      271,
      496,
      456,
      420,
      388,
      360,
      335,
      312,
      292,
      273,
      512,
      482,
      454,
      428,
      405,
      383,
      364,
      345,
      328,
      312,
      298,
      284,
      271,
      259,
      496,
      475,
      456,
      437,
      420,
      404,
      388,
      374,
      360,
      347,
      335,
      323,
      312,
      302,
      292,
      282,
      273,
      265,
      512,
      497,
      482,
      468,
      454,
      441,
      428,
      417,
      405,
      394,
      383,
      373,
      364,
      354,
      345,
      337,
      328,
      320,
      312,
      305,
      298,
      291,
      284,
      278,
      271,
      265,
      259,
      507,
      496,
      485,
      475,
      465,
      456,
      446,
      437,
      428,
      420,
      412,
      404,
      396,
      388,
      381,
      374,
      367,
      360,
      354,
      347,
      341,
      335,
      329,
      323,
      318,
      312,
      307,
      302,
      297,
      292,
      287,
      282,
      278,
      273,
      269,
      265,
      261,
      512,
      505,
      497,
      489,
      482,
      475,
      468,
      461,
      454,
      447,
      441,
      435,
      428,
      422,
      417,
      411,
      405,
      399,
      394,
      389,
      383,
      378,
      373,
      368,
      364,
      359,
      354,
      350,
      345,
      341,
      337,
      332,
      328,
      324,
      320,
      316,
      312,
      309,
      305,
      301,
      298,
      294,
      291,
      287,
      284,
      281,
      278,
      274,
      271,
      268,
      265,
      262,
      259,
      257,
      507,
      501,
      496,
      491,
      485,
      480,
      475,
      470,
      465,
      460,
      456,
      451,
      446,
      442,
      437,
      433,
      428,
      424,
      420,
      416,
      412,
      408,
      404,
      400,
      396,
      392,
      388,
      385,
      381,
      377,
      374,
      370,
      367,
      363,
      360,
      357,
      354,
      350,
      347,
      344,
      341,
      338,
      335,
      332,
      329,
      326,
      323,
      320,
      318,
      315,
      312,
      310,
      307,
      304,
      302,
      299,
      297,
      294,
      292,
      289,
      287,
      285,
      282,
      280,
      278,
      275,
      273,
      271,
      269,
      267,
      265,
      263,
      261,
      259
  ];
  var shg_table = [
      9,
      11,
      12,
      13,
      13,
      14,
      14,
      15,
      15,
      15,
      15,
      16,
      16,
      16,
      16,
      17,
      17,
      17,
      17,
      17,
      17,
      17,
      18,
      18,
      18,
      18,
      18,
      18,
      18,
      18,
      18,
      19,
      19,
      19,
      19,
      19,
      19,
      19,
      19,
      19,
      19,
      19,
      19,
      19,
      19,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      21,
      21,
      21,
      21,
      21,
      21,
      21,
      21,
      21,
      21,
      21,
      21,
      21,
      21,
      21,
      21,
      21,
      21,
      21,
      21,
      21,
      21,
      21,
      21,
      21,
      21,
      21,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24
  ];
  function filterGaussBlurRGBA(imageData, radius) {
      var pixels = imageData.data, width = imageData.width, height = imageData.height;
      var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum, r_out_sum, g_out_sum, b_out_sum, a_out_sum, r_in_sum, g_in_sum, b_in_sum, a_in_sum, pr, pg, pb, pa, rbs;
      var div = radius + radius + 1, widthMinus1 = width - 1, heightMinus1 = height - 1, radiusPlus1 = radius + 1, sumFactor = (radiusPlus1 * (radiusPlus1 + 1)) / 2, stackStart = new BlurStack(), stackEnd = null, stack = stackStart, stackIn = null, stackOut = null, mul_sum = mul_table[radius], shg_sum = shg_table[radius];
      for (i = 1; i < div; i++) {
          stack = stack.next = new BlurStack();
          if (i === radiusPlus1) {
              stackEnd = stack;
          }
      }
      stack.next = stackStart;
      yw = yi = 0;
      for (y = 0; y < height; y++) {
          r_in_sum = g_in_sum = b_in_sum = a_in_sum = r_sum = g_sum = b_sum = a_sum = 0;
          r_out_sum = radiusPlus1 * (pr = pixels[yi]);
          g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
          b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
          a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);
          r_sum += sumFactor * pr;
          g_sum += sumFactor * pg;
          b_sum += sumFactor * pb;
          a_sum += sumFactor * pa;
          stack = stackStart;
          for (i = 0; i < radiusPlus1; i++) {
              stack.r = pr;
              stack.g = pg;
              stack.b = pb;
              stack.a = pa;
              stack = stack.next;
          }
          for (i = 1; i < radiusPlus1; i++) {
              p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
              r_sum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - i);
              g_sum += (stack.g = pg = pixels[p + 1]) * rbs;
              b_sum += (stack.b = pb = pixels[p + 2]) * rbs;
              a_sum += (stack.a = pa = pixels[p + 3]) * rbs;
              r_in_sum += pr;
              g_in_sum += pg;
              b_in_sum += pb;
              a_in_sum += pa;
              stack = stack.next;
          }
          stackIn = stackStart;
          stackOut = stackEnd;
          for (x = 0; x < width; x++) {
              pixels[yi + 3] = pa = (a_sum * mul_sum) >> shg_sum;
              if (pa !== 0) {
                  pa = 255 / pa;
                  pixels[yi] = ((r_sum * mul_sum) >> shg_sum) * pa;
                  pixels[yi + 1] = ((g_sum * mul_sum) >> shg_sum) * pa;
                  pixels[yi + 2] = ((b_sum * mul_sum) >> shg_sum) * pa;
              }
              else {
                  pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
              }
              r_sum -= r_out_sum;
              g_sum -= g_out_sum;
              b_sum -= b_out_sum;
              a_sum -= a_out_sum;
              r_out_sum -= stackIn.r;
              g_out_sum -= stackIn.g;
              b_out_sum -= stackIn.b;
              a_out_sum -= stackIn.a;
              p = (yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1)) << 2;
              r_in_sum += stackIn.r = pixels[p];
              g_in_sum += stackIn.g = pixels[p + 1];
              b_in_sum += stackIn.b = pixels[p + 2];
              a_in_sum += stackIn.a = pixels[p + 3];
              r_sum += r_in_sum;
              g_sum += g_in_sum;
              b_sum += b_in_sum;
              a_sum += a_in_sum;
              stackIn = stackIn.next;
              r_out_sum += pr = stackOut.r;
              g_out_sum += pg = stackOut.g;
              b_out_sum += pb = stackOut.b;
              a_out_sum += pa = stackOut.a;
              r_in_sum -= pr;
              g_in_sum -= pg;
              b_in_sum -= pb;
              a_in_sum -= pa;
              stackOut = stackOut.next;
              yi += 4;
          }
          yw += width;
      }
      for (x = 0; x < width; x++) {
          g_in_sum = b_in_sum = a_in_sum = r_in_sum = g_sum = b_sum = a_sum = r_sum = 0;
          yi = x << 2;
          r_out_sum = radiusPlus1 * (pr = pixels[yi]);
          g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
          b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
          a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);
          r_sum += sumFactor * pr;
          g_sum += sumFactor * pg;
          b_sum += sumFactor * pb;
          a_sum += sumFactor * pa;
          stack = stackStart;
          for (i = 0; i < radiusPlus1; i++) {
              stack.r = pr;
              stack.g = pg;
              stack.b = pb;
              stack.a = pa;
              stack = stack.next;
          }
          yp = width;
          for (i = 1; i <= radius; i++) {
              yi = (yp + x) << 2;
              r_sum += (stack.r = pr = pixels[yi]) * (rbs = radiusPlus1 - i);
              g_sum += (stack.g = pg = pixels[yi + 1]) * rbs;
              b_sum += (stack.b = pb = pixels[yi + 2]) * rbs;
              a_sum += (stack.a = pa = pixels[yi + 3]) * rbs;
              r_in_sum += pr;
              g_in_sum += pg;
              b_in_sum += pb;
              a_in_sum += pa;
              stack = stack.next;
              if (i < heightMinus1) {
                  yp += width;
              }
          }
          yi = x;
          stackIn = stackStart;
          stackOut = stackEnd;
          for (y = 0; y < height; y++) {
              p = yi << 2;
              pixels[p + 3] = pa = (a_sum * mul_sum) >> shg_sum;
              if (pa > 0) {
                  pa = 255 / pa;
                  pixels[p] = ((r_sum * mul_sum) >> shg_sum) * pa;
                  pixels[p + 1] = ((g_sum * mul_sum) >> shg_sum) * pa;
                  pixels[p + 2] = ((b_sum * mul_sum) >> shg_sum) * pa;
              }
              else {
                  pixels[p] = pixels[p + 1] = pixels[p + 2] = 0;
              }
              r_sum -= r_out_sum;
              g_sum -= g_out_sum;
              b_sum -= b_out_sum;
              a_sum -= a_out_sum;
              r_out_sum -= stackIn.r;
              g_out_sum -= stackIn.g;
              b_out_sum -= stackIn.b;
              a_out_sum -= stackIn.a;
              p =
                  (x +
                      ((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width) <<
                      2;
              r_sum += r_in_sum += stackIn.r = pixels[p];
              g_sum += g_in_sum += stackIn.g = pixels[p + 1];
              b_sum += b_in_sum += stackIn.b = pixels[p + 2];
              a_sum += a_in_sum += stackIn.a = pixels[p + 3];
              stackIn = stackIn.next;
              r_out_sum += pr = stackOut.r;
              g_out_sum += pg = stackOut.g;
              b_out_sum += pb = stackOut.b;
              a_out_sum += pa = stackOut.a;
              r_in_sum -= pr;
              g_in_sum -= pg;
              b_in_sum -= pb;
              a_in_sum -= pa;
              stackOut = stackOut.next;
              yi += width;
          }
      }
  }
  /**
   * Blur Filter
   * @function
   * @name Blur
   * @memberof Konva.Filters
   * @param {Object} imageData
   * @example
   * node.cache();
   * node.filters([Konva.Filters.Blur]);
   * node.blurRadius(10);
   */
  var Blur = function Blur(imageData) {
      var radius = Math.round(this.blurRadius());
      if (radius > 0) {
          filterGaussBlurRGBA(imageData, radius);
      }
  };
  Factory.addGetterSetter(Node, 'blurRadius', 0, getNumberValidator(), Factory.afterSetFilter);
  /**
   * get/set blur radius. Use with {@link Konva.Filters.Blur} filter
   * @name Konva.Node#blurRadius
   * @method
   * @param {Integer} radius
   * @returns {Integer}
   */

  /**
   * Brighten Filter.
   * @function
   * @memberof Konva.Filters
   * @param {Object} imageData
   * @example
   * node.cache();
   * node.filters([Konva.Filters.Brighten]);
   * node.brightness(0.8);
   */
  var Brighten = function (imageData) {
      var brightness = this.brightness() * 255, data = imageData.data, len = data.length, i;
      for (i = 0; i < len; i += 4) {
          // red
          data[i] += brightness;
          // green
          data[i + 1] += brightness;
          // blue
          data[i + 2] += brightness;
      }
  };
  Factory.addGetterSetter(Node, 'brightness', 0, getNumberValidator(), Factory.afterSetFilter);
  /**
   * get/set filter brightness.  The brightness is a number between -1 and 1.&nbsp; Positive values
   *  brighten the pixels and negative values darken them. Use with {@link Konva.Filters.Brighten} filter.
   * @name Konva.Node#brightness
   * @method

   * @param {Number} brightness value between -1 and 1
   * @returns {Number}
   */

  /**
   * Contrast Filter.
   * @function
   * @memberof Konva.Filters
   * @param {Object} imageData
   * @example
   * node.cache();
   * node.filters([Konva.Filters.Contrast]);
   * node.contrast(10);
   */
  var Contrast = function (imageData) {
      var adjust = Math.pow((this.contrast() + 100) / 100, 2);
      var data = imageData.data, nPixels = data.length, red = 150, green = 150, blue = 150, i;
      for (i = 0; i < nPixels; i += 4) {
          red = data[i];
          green = data[i + 1];
          blue = data[i + 2];
          //Red channel
          red /= 255;
          red -= 0.5;
          red *= adjust;
          red += 0.5;
          red *= 255;
          //Green channel
          green /= 255;
          green -= 0.5;
          green *= adjust;
          green += 0.5;
          green *= 255;
          //Blue channel
          blue /= 255;
          blue -= 0.5;
          blue *= adjust;
          blue += 0.5;
          blue *= 255;
          red = red < 0 ? 0 : red > 255 ? 255 : red;
          green = green < 0 ? 0 : green > 255 ? 255 : green;
          blue = blue < 0 ? 0 : blue > 255 ? 255 : blue;
          data[i] = red;
          data[i + 1] = green;
          data[i + 2] = blue;
      }
  };
  /**
   * get/set filter contrast.  The contrast is a number between -100 and 100.
   * Use with {@link Konva.Filters.Contrast} filter.
   * @name Konva.Node#contrast
   * @method
   * @param {Number} contrast value between -100 and 100
   * @returns {Number}
   */
  Factory.addGetterSetter(Node, 'contrast', 0, getNumberValidator(), Factory.afterSetFilter);

  /**
   * Emboss Filter.
   * Pixastic Lib - Emboss filter - v0.1.0
   * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
   * License: [http://www.pixastic.com/lib/license.txt]
   * @function
   * @memberof Konva.Filters
   * @param {Object} imageData
   * @example
   * node.cache();
   * node.filters([Konva.Filters.Emboss]);
   * node.embossStrength(0.8);
   * node.embossWhiteLevel(0.3);
   * node.embossDirection('right');
   * node.embossBlend(true);
   */
  var Emboss = function (imageData) {
      // pixastic strength is between 0 and 10.  I want it between 0 and 1
      // pixastic greyLevel is between 0 and 255.  I want it between 0 and 1.  Also,
      // a max value of greyLevel yields a white emboss, and the min value yields a black
      // emboss.  Therefore, I changed greyLevel to whiteLevel
      var strength = this.embossStrength() * 10, greyLevel = this.embossWhiteLevel() * 255, direction = this.embossDirection(), blend = this.embossBlend(), dirY = 0, dirX = 0, data = imageData.data, w = imageData.width, h = imageData.height, w4 = w * 4, y = h;
      switch (direction) {
          case 'top-left':
              dirY = -1;
              dirX = -1;
              break;
          case 'top':
              dirY = -1;
              dirX = 0;
              break;
          case 'top-right':
              dirY = -1;
              dirX = 1;
              break;
          case 'right':
              dirY = 0;
              dirX = 1;
              break;
          case 'bottom-right':
              dirY = 1;
              dirX = 1;
              break;
          case 'bottom':
              dirY = 1;
              dirX = 0;
              break;
          case 'bottom-left':
              dirY = 1;
              dirX = -1;
              break;
          case 'left':
              dirY = 0;
              dirX = -1;
              break;
          default:
              Util.error('Unknown emboss direction: ' + direction);
      }
      do {
          var offsetY = (y - 1) * w4;
          var otherY = dirY;
          if (y + otherY < 1) {
              otherY = 0;
          }
          if (y + otherY > h) {
              otherY = 0;
          }
          var offsetYOther = (y - 1 + otherY) * w * 4;
          var x = w;
          do {
              var offset = offsetY + (x - 1) * 4;
              var otherX = dirX;
              if (x + otherX < 1) {
                  otherX = 0;
              }
              if (x + otherX > w) {
                  otherX = 0;
              }
              var offsetOther = offsetYOther + (x - 1 + otherX) * 4;
              var dR = data[offset] - data[offsetOther];
              var dG = data[offset + 1] - data[offsetOther + 1];
              var dB = data[offset + 2] - data[offsetOther + 2];
              var dif = dR;
              var absDif = dif > 0 ? dif : -dif;
              var absG = dG > 0 ? dG : -dG;
              var absB = dB > 0 ? dB : -dB;
              if (absG > absDif) {
                  dif = dG;
              }
              if (absB > absDif) {
                  dif = dB;
              }
              dif *= strength;
              if (blend) {
                  var r = data[offset] + dif;
                  var g = data[offset + 1] + dif;
                  var b = data[offset + 2] + dif;
                  data[offset] = r > 255 ? 255 : r < 0 ? 0 : r;
                  data[offset + 1] = g > 255 ? 255 : g < 0 ? 0 : g;
                  data[offset + 2] = b > 255 ? 255 : b < 0 ? 0 : b;
              }
              else {
                  var grey = greyLevel - dif;
                  if (grey < 0) {
                      grey = 0;
                  }
                  else if (grey > 255) {
                      grey = 255;
                  }
                  data[offset] = data[offset + 1] = data[offset + 2] = grey;
              }
          } while (--x);
      } while (--y);
  };
  Factory.addGetterSetter(Node, 'embossStrength', 0.5, getNumberValidator(), Factory.afterSetFilter);
  /**
   * get/set emboss strength. Use with {@link Konva.Filters.Emboss} filter.
   * @name Konva.Node#embossStrength
   * @method
   * @param {Number} level between 0 and 1.  Default is 0.5
   * @returns {Number}
   */
  Factory.addGetterSetter(Node, 'embossWhiteLevel', 0.5, getNumberValidator(), Factory.afterSetFilter);
  /**
   * get/set emboss white level. Use with {@link Konva.Filters.Emboss} filter.
   * @name Konva.Node#embossWhiteLevel
   * @method
   * @param {Number} embossWhiteLevel between 0 and 1.  Default is 0.5
   * @returns {Number}
   */
  Factory.addGetterSetter(Node, 'embossDirection', 'top-left', null, Factory.afterSetFilter);
  /**
   * get/set emboss direction. Use with {@link Konva.Filters.Emboss} filter.
   * @name Konva.Node#embossDirection
   * @method
   * @param {String} embossDirection can be top-left, top, top-right, right, bottom-right, bottom, bottom-left or left
   *   The default is top-left
   * @returns {String}
   */
  Factory.addGetterSetter(Node, 'embossBlend', false, null, Factory.afterSetFilter);
  /**
   * get/set emboss blend. Use with {@link Konva.Filters.Emboss} filter.
   * @name Konva.Node#embossBlend
   * @method
   * @param {Boolean} embossBlend
   * @returns {Boolean}
   */

  function remap(fromValue, fromMin, fromMax, toMin, toMax) {
      // Compute the range of the data
      var fromRange = fromMax - fromMin, toRange = toMax - toMin, toValue;
      // If either range is 0, then the value can only be mapped to 1 value
      if (fromRange === 0) {
          return toMin + toRange / 2;
      }
      if (toRange === 0) {
          return toMin;
      }
      // (1) untranslate, (2) unscale, (3) rescale, (4) retranslate
      toValue = (fromValue - fromMin) / fromRange;
      toValue = toRange * toValue + toMin;
      return toValue;
  }
  /**
   * Enhance Filter. Adjusts the colors so that they span the widest
   *  possible range (ie 0-255). Performs w*h pixel reads and w*h pixel
   *  writes.
   * @function
   * @name Enhance
   * @memberof Konva.Filters
   * @param {Object} imageData
   * @author ippo615
   * @example
   * node.cache();
   * node.filters([Konva.Filters.Enhance]);
   * node.enhance(0.4);
   */
  var Enhance = function (imageData) {
      var data = imageData.data, nSubPixels = data.length, rMin = data[0], rMax = rMin, r, gMin = data[1], gMax = gMin, g, bMin = data[2], bMax = bMin, b, i;
      // If we are not enhancing anything - don't do any computation
      var enhanceAmount = this.enhance();
      if (enhanceAmount === 0) {
          return;
      }
      // 1st Pass - find the min and max for each channel:
      for (i = 0; i < nSubPixels; i += 4) {
          r = data[i + 0];
          if (r < rMin) {
              rMin = r;
          }
          else if (r > rMax) {
              rMax = r;
          }
          g = data[i + 1];
          if (g < gMin) {
              gMin = g;
          }
          else if (g > gMax) {
              gMax = g;
          }
          b = data[i + 2];
          if (b < bMin) {
              bMin = b;
          }
          else if (b > bMax) {
              bMax = b;
          }
          //a = data[i + 3];
          //if (a < aMin) { aMin = a; } else
          //if (a > aMax) { aMax = a; }
      }
      // If there is only 1 level - don't remap
      if (rMax === rMin) {
          rMax = 255;
          rMin = 0;
      }
      if (gMax === gMin) {
          gMax = 255;
          gMin = 0;
      }
      if (bMax === bMin) {
          bMax = 255;
          bMin = 0;
      }
      var rMid, rGoalMax, rGoalMin, gMid, gGoalMax, gGoalMin, bMid, bGoalMax, bGoalMin;
      // If the enhancement is positive - stretch the histogram
      if (enhanceAmount > 0) {
          rGoalMax = rMax + enhanceAmount * (255 - rMax);
          rGoalMin = rMin - enhanceAmount * (rMin - 0);
          gGoalMax = gMax + enhanceAmount * (255 - gMax);
          gGoalMin = gMin - enhanceAmount * (gMin - 0);
          bGoalMax = bMax + enhanceAmount * (255 - bMax);
          bGoalMin = bMin - enhanceAmount * (bMin - 0);
          // If the enhancement is negative -   compress the histogram
      }
      else {
          rMid = (rMax + rMin) * 0.5;
          rGoalMax = rMax + enhanceAmount * (rMax - rMid);
          rGoalMin = rMin + enhanceAmount * (rMin - rMid);
          gMid = (gMax + gMin) * 0.5;
          gGoalMax = gMax + enhanceAmount * (gMax - gMid);
          gGoalMin = gMin + enhanceAmount * (gMin - gMid);
          bMid = (bMax + bMin) * 0.5;
          bGoalMax = bMax + enhanceAmount * (bMax - bMid);
          bGoalMin = bMin + enhanceAmount * (bMin - bMid);
      }
      // Pass 2 - remap everything, except the alpha
      for (i = 0; i < nSubPixels; i += 4) {
          data[i + 0] = remap(data[i + 0], rMin, rMax, rGoalMin, rGoalMax);
          data[i + 1] = remap(data[i + 1], gMin, gMax, gGoalMin, gGoalMax);
          data[i + 2] = remap(data[i + 2], bMin, bMax, bGoalMin, bGoalMax);
          //data[i + 3] = remap(data[i + 3], aMin, aMax, aGoalMin, aGoalMax);
      }
  };
  /**
   * get/set enhance. Use with {@link Konva.Filters.Enhance} filter. -1 to 1 values
   * @name Konva.Node#enhance
   * @method
   * @param {Float} amount
   * @returns {Float}
   */
  Factory.addGetterSetter(Node, 'enhance', 0, getNumberValidator(), Factory.afterSetFilter);

  /**
   * Grayscale Filter
   * @function
   * @memberof Konva.Filters
   * @param {Object} imageData
   * @example
   * node.cache();
   * node.filters([Konva.Filters.Grayscale]);
   */
  var Grayscale = function (imageData) {
      var data = imageData.data, len = data.length, i, brightness;
      for (i = 0; i < len; i += 4) {
          brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
          // red
          data[i] = brightness;
          // green
          data[i + 1] = brightness;
          // blue
          data[i + 2] = brightness;
      }
  };

  Factory.addGetterSetter(Node, 'hue', 0, getNumberValidator(), Factory.afterSetFilter);
  /**
   * get/set hsv hue in degrees. Use with {@link Konva.Filters.HSV} or {@link Konva.Filters.HSL} filter.
   * @name Konva.Node#hue
   * @method
   * @param {Number} hue value between 0 and 359
   * @returns {Number}
   */
  Factory.addGetterSetter(Node, 'saturation', 0, getNumberValidator(), Factory.afterSetFilter);
  /**
   * get/set hsv saturation. Use with {@link Konva.Filters.HSV} or {@link Konva.Filters.HSL} filter.
   * @name Konva.Node#saturation
   * @method
   * @param {Number} saturation 0 is no change, -1.0 halves the saturation, 1.0 doubles, etc..
   * @returns {Number}
   */
  Factory.addGetterSetter(Node, 'luminance', 0, getNumberValidator(), Factory.afterSetFilter);
  /**
   * get/set hsl luminance. Use with {@link Konva.Filters.HSL} filter.
   * @name Konva.Node#luminance
   * @method
   * @param {Number} value from -1 to 1
   * @returns {Number}
   */
  /**
   * HSL Filter. Adjusts the hue, saturation and luminance (or lightness)
   * @function
   * @memberof Konva.Filters
   * @param {Object} imageData
   * @author ippo615
   * @example
   * image.filters([Konva.Filters.HSL]);
   * image.luminance(0.2);
   */
  var HSL = function (imageData) {
      var data = imageData.data, nPixels = data.length, v = 1, s = Math.pow(2, this.saturation()), h = Math.abs(this.hue() + 360) % 360, l = this.luminance() * 127, i;
      // Basis for the technique used:
      // http://beesbuzz.biz/code/hsv_color_transforms.php
      // V is the value multiplier (1 for none, 2 for double, 0.5 for half)
      // S is the saturation multiplier (1 for none, 2 for double, 0.5 for half)
      // H is the hue shift in degrees (0 to 360)
      // vsu = V*S*cos(H*PI/180);
      // vsw = V*S*sin(H*PI/180);
      //[ .299V+.701vsu+.168vsw    .587V-.587vsu+.330vsw    .114V-.114vsu-.497vsw ] [R]
      //[ .299V-.299vsu-.328vsw    .587V+.413vsu+.035vsw    .114V-.114vsu+.292vsw ]*[G]
      //[ .299V-.300vsu+1.25vsw    .587V-.588vsu-1.05vsw    .114V+.886vsu-.203vsw ] [B]
      // Precompute the values in the matrix:
      var vsu = v * s * Math.cos((h * Math.PI) / 180), vsw = v * s * Math.sin((h * Math.PI) / 180);
      // (result spot)(source spot)
      var rr = 0.299 * v + 0.701 * vsu + 0.167 * vsw, rg = 0.587 * v - 0.587 * vsu + 0.33 * vsw, rb = 0.114 * v - 0.114 * vsu - 0.497 * vsw;
      var gr = 0.299 * v - 0.299 * vsu - 0.328 * vsw, gg = 0.587 * v + 0.413 * vsu + 0.035 * vsw, gb = 0.114 * v - 0.114 * vsu + 0.293 * vsw;
      var br = 0.299 * v - 0.3 * vsu + 1.25 * vsw, bg = 0.587 * v - 0.586 * vsu - 1.05 * vsw, bb = 0.114 * v + 0.886 * vsu - 0.2 * vsw;
      var r, g, b, a;
      for (i = 0; i < nPixels; i += 4) {
          r = data[i + 0];
          g = data[i + 1];
          b = data[i + 2];
          a = data[i + 3];
          data[i + 0] = rr * r + rg * g + rb * b + l;
          data[i + 1] = gr * r + gg * g + gb * b + l;
          data[i + 2] = br * r + bg * g + bb * b + l;
          data[i + 3] = a; // alpha
      }
  };

  /**
   * HSV Filter. Adjusts the hue, saturation and value
   * @function
   * @name HSV
   * @memberof Konva.Filters
   * @param {Object} imageData
   * @author ippo615
   * @example
   * image.filters([Konva.Filters.HSV]);
   * image.value(200);
   */
  var HSV = function (imageData) {
      var data = imageData.data, nPixels = data.length, v = Math.pow(2, this.value()), s = Math.pow(2, this.saturation()), h = Math.abs(this.hue() + 360) % 360, i;
      // Basis for the technique used:
      // http://beesbuzz.biz/code/hsv_color_transforms.php
      // V is the value multiplier (1 for none, 2 for double, 0.5 for half)
      // S is the saturation multiplier (1 for none, 2 for double, 0.5 for half)
      // H is the hue shift in degrees (0 to 360)
      // vsu = V*S*cos(H*PI/180);
      // vsw = V*S*sin(H*PI/180);
      //[ .299V+.701vsu+.168vsw    .587V-.587vsu+.330vsw    .114V-.114vsu-.497vsw ] [R]
      //[ .299V-.299vsu-.328vsw    .587V+.413vsu+.035vsw    .114V-.114vsu+.292vsw ]*[G]
      //[ .299V-.300vsu+1.25vsw    .587V-.588vsu-1.05vsw    .114V+.886vsu-.203vsw ] [B]
      // Precompute the values in the matrix:
      var vsu = v * s * Math.cos((h * Math.PI) / 180), vsw = v * s * Math.sin((h * Math.PI) / 180);
      // (result spot)(source spot)
      var rr = 0.299 * v + 0.701 * vsu + 0.167 * vsw, rg = 0.587 * v - 0.587 * vsu + 0.33 * vsw, rb = 0.114 * v - 0.114 * vsu - 0.497 * vsw;
      var gr = 0.299 * v - 0.299 * vsu - 0.328 * vsw, gg = 0.587 * v + 0.413 * vsu + 0.035 * vsw, gb = 0.114 * v - 0.114 * vsu + 0.293 * vsw;
      var br = 0.299 * v - 0.3 * vsu + 1.25 * vsw, bg = 0.587 * v - 0.586 * vsu - 1.05 * vsw, bb = 0.114 * v + 0.886 * vsu - 0.2 * vsw;
      var r, g, b, a;
      for (i = 0; i < nPixels; i += 4) {
          r = data[i + 0];
          g = data[i + 1];
          b = data[i + 2];
          a = data[i + 3];
          data[i + 0] = rr * r + rg * g + rb * b;
          data[i + 1] = gr * r + gg * g + gb * b;
          data[i + 2] = br * r + bg * g + bb * b;
          data[i + 3] = a; // alpha
      }
  };
  Factory.addGetterSetter(Node, 'hue', 0, getNumberValidator(), Factory.afterSetFilter);
  /**
   * get/set hsv hue in degrees. Use with {@link Konva.Filters.HSV} or {@link Konva.Filters.HSL} filter.
   * @name Konva.Node#hue
   * @method
   * @param {Number} hue value between 0 and 359
   * @returns {Number}
   */
  Factory.addGetterSetter(Node, 'saturation', 0, getNumberValidator(), Factory.afterSetFilter);
  /**
   * get/set hsv saturation. Use with {@link Konva.Filters.HSV} or {@link Konva.Filters.HSL} filter.
   * @name Konva.Node#saturation
   * @method
   * @param {Number} saturation 0 is no change, -1.0 halves the saturation, 1.0 doubles, etc..
   * @returns {Number}
   */
  Factory.addGetterSetter(Node, 'value', 0, getNumberValidator(), Factory.afterSetFilter);
  /**
   * get/set hsv value. Use with {@link Konva.Filters.HSV} filter.
   * @name Konva.Node#value
   * @method
   * @param {Number} value 0 is no change, -1.0 halves the value, 1.0 doubles, etc..
   * @returns {Number}
   */

  /**
   * Invert Filter
   * @function
   * @memberof Konva.Filters
   * @param {Object} imageData
   * @example
   * node.cache();
   * node.filters([Konva.Filters.Invert]);
   */
  var Invert = function (imageData) {
      var data = imageData.data, len = data.length, i;
      for (i = 0; i < len; i += 4) {
          // red
          data[i] = 255 - data[i];
          // green
          data[i + 1] = 255 - data[i + 1];
          // blue
          data[i + 2] = 255 - data[i + 2];
      }
  };

  /*
   * ToPolar Filter. Converts image data to polar coordinates. Performs
   *  w*h*4 pixel reads and w*h pixel writes. The r axis is placed along
   *  what would be the y axis and the theta axis along the x axis.
   * @function
   * @author ippo615
   * @memberof Konva.Filters
   * @param {ImageData} src, the source image data (what will be transformed)
   * @param {ImageData} dst, the destination image data (where it will be saved)
   * @param {Object} opt
   * @param {Number} [opt.polarCenterX] horizontal location for the center of the circle,
   *  default is in the middle
   * @param {Number} [opt.polarCenterY] vertical location for the center of the circle,
   *  default is in the middle
   */
  var ToPolar = function (src, dst, opt) {
      var srcPixels = src.data, dstPixels = dst.data, xSize = src.width, ySize = src.height, xMid = opt.polarCenterX || xSize / 2, yMid = opt.polarCenterY || ySize / 2, i, x, y, r = 0, g = 0, b = 0, a = 0;
      // Find the largest radius
      var rad, rMax = Math.sqrt(xMid * xMid + yMid * yMid);
      x = xSize - xMid;
      y = ySize - yMid;
      rad = Math.sqrt(x * x + y * y);
      rMax = rad > rMax ? rad : rMax;
      // We'll be uisng y as the radius, and x as the angle (theta=t)
      var rSize = ySize, tSize = xSize, radius, theta;
      // We want to cover all angles (0-360) and we need to convert to
      // radians (*PI/180)
      var conversion = ((360 / tSize) * Math.PI) / 180, sin, cos;
      // var x1, x2, x1i, x2i, y1, y2, y1i, y2i, scale;
      for (theta = 0; theta < tSize; theta += 1) {
          sin = Math.sin(theta * conversion);
          cos = Math.cos(theta * conversion);
          for (radius = 0; radius < rSize; radius += 1) {
              x = Math.floor(xMid + ((rMax * radius) / rSize) * cos);
              y = Math.floor(yMid + ((rMax * radius) / rSize) * sin);
              i = (y * xSize + x) * 4;
              r = srcPixels[i + 0];
              g = srcPixels[i + 1];
              b = srcPixels[i + 2];
              a = srcPixels[i + 3];
              // Store it
              //i = (theta * xSize  +  radius) * 4;
              i = (theta + radius * xSize) * 4;
              dstPixels[i + 0] = r;
              dstPixels[i + 1] = g;
              dstPixels[i + 2] = b;
              dstPixels[i + 3] = a;
          }
      }
  };
  /*
   * FromPolar Filter. Converts image data from polar coordinates back to rectangular.
   *  Performs w*h*4 pixel reads and w*h pixel writes.
   * @function
   * @author ippo615
   * @memberof Konva.Filters
   * @param {ImageData} src, the source image data (what will be transformed)
   * @param {ImageData} dst, the destination image data (where it will be saved)
   * @param {Object} opt
   * @param {Number} [opt.polarCenterX] horizontal location for the center of the circle,
   *  default is in the middle
   * @param {Number} [opt.polarCenterY] vertical location for the center of the circle,
   *  default is in the middle
   * @param {Number} [opt.polarRotation] amount to rotate the image counterclockwis,
   *  0 is no rotation, 360 degrees is a full rotation
   */
  var FromPolar = function (src, dst, opt) {
      var srcPixels = src.data, dstPixels = dst.data, xSize = src.width, ySize = src.height, xMid = opt.polarCenterX || xSize / 2, yMid = opt.polarCenterY || ySize / 2, i, x, y, dx, dy, r = 0, g = 0, b = 0, a = 0;
      // Find the largest radius
      var rad, rMax = Math.sqrt(xMid * xMid + yMid * yMid);
      x = xSize - xMid;
      y = ySize - yMid;
      rad = Math.sqrt(x * x + y * y);
      rMax = rad > rMax ? rad : rMax;
      // We'll be uisng x as the radius, and y as the angle (theta=t)
      var rSize = ySize, tSize = xSize, radius, theta, phaseShift = opt.polarRotation || 0;
      // We need to convert to degrees and we need to make sure
      // it's between (0-360)
      // var conversion = tSize/360*180/Math.PI;
      //var conversion = tSize/360*180/Math.PI;
      var x1, y1;
      for (x = 0; x < xSize; x += 1) {
          for (y = 0; y < ySize; y += 1) {
              dx = x - xMid;
              dy = y - yMid;
              radius = (Math.sqrt(dx * dx + dy * dy) * rSize) / rMax;
              theta = ((Math.atan2(dy, dx) * 180) / Math.PI + 360 + phaseShift) % 360;
              theta = (theta * tSize) / 360;
              x1 = Math.floor(theta);
              y1 = Math.floor(radius);
              i = (y1 * xSize + x1) * 4;
              r = srcPixels[i + 0];
              g = srcPixels[i + 1];
              b = srcPixels[i + 2];
              a = srcPixels[i + 3];
              // Store it
              i = (y * xSize + x) * 4;
              dstPixels[i + 0] = r;
              dstPixels[i + 1] = g;
              dstPixels[i + 2] = b;
              dstPixels[i + 3] = a;
          }
      }
  };
  //Konva.Filters.ToPolar = Util._FilterWrapDoubleBuffer(ToPolar);
  //Konva.Filters.FromPolar = Util._FilterWrapDoubleBuffer(FromPolar);
  // create a temporary canvas for working - shared between multiple calls
  /*
   * Kaleidoscope Filter.
   * @function
   * @name Kaleidoscope
   * @author ippo615
   * @memberof Konva.Filters
   * @example
   * node.cache();
   * node.filters([Konva.Filters.Kaleidoscope]);
   * node.kaleidoscopePower(3);
   * node.kaleidoscopeAngle(45);
   */
  var Kaleidoscope = function (imageData) {
      var xSize = imageData.width, ySize = imageData.height;
      var x, y, xoff, i, r, g, b, a, srcPos, dstPos;
      var power = Math.round(this.kaleidoscopePower());
      var angle = Math.round(this.kaleidoscopeAngle());
      var offset = Math.floor((xSize * (angle % 360)) / 360);
      if (power < 1) {
          return;
      }
      // Work with our shared buffer canvas
      var tempCanvas = Util.createCanvasElement();
      tempCanvas.width = xSize;
      tempCanvas.height = ySize;
      var scratchData = tempCanvas
          .getContext('2d')
          .getImageData(0, 0, xSize, ySize);
      // Convert thhe original to polar coordinates
      ToPolar(imageData, scratchData, {
          polarCenterX: xSize / 2,
          polarCenterY: ySize / 2
      });
      // Determine how big each section will be, if it's too small
      // make it bigger
      var minSectionSize = xSize / Math.pow(2, power);
      while (minSectionSize <= 8) {
          minSectionSize = minSectionSize * 2;
          power -= 1;
      }
      minSectionSize = Math.ceil(minSectionSize);
      var sectionSize = minSectionSize;
      // Copy the offset region to 0
      // Depending on the size of filter and location of the offset we may need
      // to copy the section backwards to prevent it from rewriting itself
      var xStart = 0, xEnd = sectionSize, xDelta = 1;
      if (offset + minSectionSize > xSize) {
          xStart = sectionSize;
          xEnd = 0;
          xDelta = -1;
      }
      for (y = 0; y < ySize; y += 1) {
          for (x = xStart; x !== xEnd; x += xDelta) {
              xoff = Math.round(x + offset) % xSize;
              srcPos = (xSize * y + xoff) * 4;
              r = scratchData.data[srcPos + 0];
              g = scratchData.data[srcPos + 1];
              b = scratchData.data[srcPos + 2];
              a = scratchData.data[srcPos + 3];
              dstPos = (xSize * y + x) * 4;
              scratchData.data[dstPos + 0] = r;
              scratchData.data[dstPos + 1] = g;
              scratchData.data[dstPos + 2] = b;
              scratchData.data[dstPos + 3] = a;
          }
      }
      // Perform the actual effect
      for (y = 0; y < ySize; y += 1) {
          sectionSize = Math.floor(minSectionSize);
          for (i = 0; i < power; i += 1) {
              for (x = 0; x < sectionSize + 1; x += 1) {
                  srcPos = (xSize * y + x) * 4;
                  r = scratchData.data[srcPos + 0];
                  g = scratchData.data[srcPos + 1];
                  b = scratchData.data[srcPos + 2];
                  a = scratchData.data[srcPos + 3];
                  dstPos = (xSize * y + sectionSize * 2 - x - 1) * 4;
                  scratchData.data[dstPos + 0] = r;
                  scratchData.data[dstPos + 1] = g;
                  scratchData.data[dstPos + 2] = b;
                  scratchData.data[dstPos + 3] = a;
              }
              sectionSize *= 2;
          }
      }
      // Convert back from polar coordinates
      FromPolar(scratchData, imageData, { polarRotation: 0 });
  };
  /**
   * get/set kaleidoscope power. Use with {@link Konva.Filters.Kaleidoscope} filter.
   * @name Konva.Node#kaleidoscopePower
   * @method
   * @param {Integer} power of kaleidoscope
   * @returns {Integer}
   */
  Factory.addGetterSetter(Node, 'kaleidoscopePower', 2, getNumberValidator(), Factory.afterSetFilter);
  /**
   * get/set kaleidoscope angle. Use with {@link Konva.Filters.Kaleidoscope} filter.
   * @name Konva.Node#kaleidoscopeAngle
   * @method
   * @param {Integer} degrees
   * @returns {Integer}
   */
  Factory.addGetterSetter(Node, 'kaleidoscopeAngle', 0, getNumberValidator(), Factory.afterSetFilter);

  function pixelAt(idata, x, y) {
      var idx = (y * idata.width + x) * 4;
      var d = [];
      d.push(idata.data[idx++], idata.data[idx++], idata.data[idx++], idata.data[idx++]);
      return d;
  }
  function rgbDistance(p1, p2) {
      return Math.sqrt(Math.pow(p1[0] - p2[0], 2) +
          Math.pow(p1[1] - p2[1], 2) +
          Math.pow(p1[2] - p2[2], 2));
  }
  function rgbMean(pTab) {
      var m = [0, 0, 0];
      for (var i = 0; i < pTab.length; i++) {
          m[0] += pTab[i][0];
          m[1] += pTab[i][1];
          m[2] += pTab[i][2];
      }
      m[0] /= pTab.length;
      m[1] /= pTab.length;
      m[2] /= pTab.length;
      return m;
  }
  function backgroundMask(idata, threshold) {
      var rgbv_no = pixelAt(idata, 0, 0);
      var rgbv_ne = pixelAt(idata, idata.width - 1, 0);
      var rgbv_so = pixelAt(idata, 0, idata.height - 1);
      var rgbv_se = pixelAt(idata, idata.width - 1, idata.height - 1);
      var thres = threshold || 10;
      if (rgbDistance(rgbv_no, rgbv_ne) < thres &&
          rgbDistance(rgbv_ne, rgbv_se) < thres &&
          rgbDistance(rgbv_se, rgbv_so) < thres &&
          rgbDistance(rgbv_so, rgbv_no) < thres) {
          // Mean color
          var mean = rgbMean([rgbv_ne, rgbv_no, rgbv_se, rgbv_so]);
          // Mask based on color distance
          var mask = [];
          for (var i = 0; i < idata.width * idata.height; i++) {
              var d = rgbDistance(mean, [
                  idata.data[i * 4],
                  idata.data[i * 4 + 1],
                  idata.data[i * 4 + 2]
              ]);
              mask[i] = d < thres ? 0 : 255;
          }
          return mask;
      }
  }
  function applyMask(idata, mask) {
      for (var i = 0; i < idata.width * idata.height; i++) {
          idata.data[4 * i + 3] = mask[i];
      }
  }
  function erodeMask(mask, sw, sh) {
      var weights = [1, 1, 1, 1, 0, 1, 1, 1, 1];
      var side = Math.round(Math.sqrt(weights.length));
      var halfSide = Math.floor(side / 2);
      var maskResult = [];
      for (var y = 0; y < sh; y++) {
          for (var x = 0; x < sw; x++) {
              var so = y * sw + x;
              var a = 0;
              for (var cy = 0; cy < side; cy++) {
                  for (var cx = 0; cx < side; cx++) {
                      var scy = y + cy - halfSide;
                      var scx = x + cx - halfSide;
                      if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                          var srcOff = scy * sw + scx;
                          var wt = weights[cy * side + cx];
                          a += mask[srcOff] * wt;
                      }
                  }
              }
              maskResult[so] = a === 255 * 8 ? 255 : 0;
          }
      }
      return maskResult;
  }
  function dilateMask(mask, sw, sh) {
      var weights = [1, 1, 1, 1, 1, 1, 1, 1, 1];
      var side = Math.round(Math.sqrt(weights.length));
      var halfSide = Math.floor(side / 2);
      var maskResult = [];
      for (var y = 0; y < sh; y++) {
          for (var x = 0; x < sw; x++) {
              var so = y * sw + x;
              var a = 0;
              for (var cy = 0; cy < side; cy++) {
                  for (var cx = 0; cx < side; cx++) {
                      var scy = y + cy - halfSide;
                      var scx = x + cx - halfSide;
                      if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                          var srcOff = scy * sw + scx;
                          var wt = weights[cy * side + cx];
                          a += mask[srcOff] * wt;
                      }
                  }
              }
              maskResult[so] = a >= 255 * 4 ? 255 : 0;
          }
      }
      return maskResult;
  }
  function smoothEdgeMask(mask, sw, sh) {
      var weights = [1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9];
      var side = Math.round(Math.sqrt(weights.length));
      var halfSide = Math.floor(side / 2);
      var maskResult = [];
      for (var y = 0; y < sh; y++) {
          for (var x = 0; x < sw; x++) {
              var so = y * sw + x;
              var a = 0;
              for (var cy = 0; cy < side; cy++) {
                  for (var cx = 0; cx < side; cx++) {
                      var scy = y + cy - halfSide;
                      var scx = x + cx - halfSide;
                      if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                          var srcOff = scy * sw + scx;
                          var wt = weights[cy * side + cx];
                          a += mask[srcOff] * wt;
                      }
                  }
              }
              maskResult[so] = a;
          }
      }
      return maskResult;
  }
  /**
   * Mask Filter
   * @function
   * @name Mask
   * @memberof Konva.Filters
   * @param {Object} imageData
   * @example
   * node.cache();
   * node.filters([Konva.Filters.Mask]);
   * node.threshold(200);
   */
  var Mask = function (imageData) {
      // Detect pixels close to the background color
      var threshold = this.threshold(), mask = backgroundMask(imageData, threshold);
      if (mask) {
          // Erode
          mask = erodeMask(mask, imageData.width, imageData.height);
          // Dilate
          mask = dilateMask(mask, imageData.width, imageData.height);
          // Gradient
          mask = smoothEdgeMask(mask, imageData.width, imageData.height);
          // Apply mask
          applyMask(imageData, mask);
      }
      return imageData;
  };
  Factory.addGetterSetter(Node, 'threshold', 0, getNumberValidator(), Factory.afterSetFilter);

  /**
   * Noise Filter. Randomly adds or substracts to the color channels
   * @function
   * @name Noise
   * @memberof Konva.Filters
   * @param {Object} imageData
   * @author ippo615
   * @example
   * node.cache();
   * node.filters([Konva.Filters.Noise]);
   * node.noise(0.8);
   */
  var Noise = function (imageData) {
      var amount = this.noise() * 255, data = imageData.data, nPixels = data.length, half = amount / 2, i;
      for (i = 0; i < nPixels; i += 4) {
          data[i + 0] += half - 2 * half * Math.random();
          data[i + 1] += half - 2 * half * Math.random();
          data[i + 2] += half - 2 * half * Math.random();
      }
  };
  Factory.addGetterSetter(Node, 'noise', 0.2, getNumberValidator(), Factory.afterSetFilter);
  /**
   * get/set noise amount.  Must be a value between 0 and 1. Use with {@link Konva.Filters.Noise} filter.
   * @name Konva.Node#noise
   * @method
   * @param {Number} noise
   * @returns {Number}
   */

  /*eslint-disable max-depth */
  /**
   * Pixelate Filter. Averages groups of pixels and redraws
   *  them as larger pixels
   * @function
   * @name Pixelate
   * @memberof Konva.Filters
   * @param {Object} imageData
   * @author ippo615
   * @example
   * node.cache();
   * node.filters([Konva.Filters.Pixelate]);
   * node.pixelSize(10);
   */
  var Pixelate = function (imageData) {
      var pixelSize = Math.ceil(this.pixelSize()), width = imageData.width, height = imageData.height, x, y, i, 
      //pixelsPerBin = pixelSize * pixelSize,
      red, green, blue, alpha, nBinsX = Math.ceil(width / pixelSize), nBinsY = Math.ceil(height / pixelSize), xBinStart, xBinEnd, yBinStart, yBinEnd, xBin, yBin, pixelsInBin, data = imageData.data;
      if (pixelSize <= 0) {
          Util.error('pixelSize value can not be <= 0');
          return;
      }
      for (xBin = 0; xBin < nBinsX; xBin += 1) {
          for (yBin = 0; yBin < nBinsY; yBin += 1) {
              // Initialize the color accumlators to 0
              red = 0;
              green = 0;
              blue = 0;
              alpha = 0;
              // Determine which pixels are included in this bin
              xBinStart = xBin * pixelSize;
              xBinEnd = xBinStart + pixelSize;
              yBinStart = yBin * pixelSize;
              yBinEnd = yBinStart + pixelSize;
              // Add all of the pixels to this bin!
              pixelsInBin = 0;
              for (x = xBinStart; x < xBinEnd; x += 1) {
                  if (x >= width) {
                      continue;
                  }
                  for (y = yBinStart; y < yBinEnd; y += 1) {
                      if (y >= height) {
                          continue;
                      }
                      i = (width * y + x) * 4;
                      red += data[i + 0];
                      green += data[i + 1];
                      blue += data[i + 2];
                      alpha += data[i + 3];
                      pixelsInBin += 1;
                  }
              }
              // Make sure the channels are between 0-255
              red = red / pixelsInBin;
              green = green / pixelsInBin;
              blue = blue / pixelsInBin;
              alpha = alpha / pixelsInBin;
              // Draw this bin
              for (x = xBinStart; x < xBinEnd; x += 1) {
                  if (x >= width) {
                      continue;
                  }
                  for (y = yBinStart; y < yBinEnd; y += 1) {
                      if (y >= height) {
                          continue;
                      }
                      i = (width * y + x) * 4;
                      data[i + 0] = red;
                      data[i + 1] = green;
                      data[i + 2] = blue;
                      data[i + 3] = alpha;
                  }
              }
          }
      }
  };
  Factory.addGetterSetter(Node, 'pixelSize', 8, getNumberValidator(), Factory.afterSetFilter);
  /**
   * get/set pixel size. Use with {@link Konva.Filters.Pixelate} filter.
   * @name Konva.Node#pixelSize
   * @method
   * @param {Integer} pixelSize
   * @returns {Integer}
   */

  /**
   * Posterize Filter. Adjusts the channels so that there are no more
   *  than n different values for that channel. This is also applied
   *  to the alpha channel.
   * @function
   * @name Posterize
   * @author ippo615
   * @memberof Konva.Filters
   * @param {Object} imageData
   * @example
   * node.cache();
   * node.filters([Konva.Filters.Posterize]);
   * node.levels(0.8); // between 0 and 1
   */
  var Posterize = function (imageData) {
      // level must be between 1 and 255
      var levels = Math.round(this.levels() * 254) + 1, data = imageData.data, len = data.length, scale = 255 / levels, i;
      for (i = 0; i < len; i += 1) {
          data[i] = Math.floor(data[i] / scale) * scale;
      }
  };
  Factory.addGetterSetter(Node, 'levels', 0.5, getNumberValidator(), Factory.afterSetFilter);
  /**
   * get/set levels.  Must be a number between 0 and 1.  Use with {@link Konva.Filters.Posterize} filter.
   * @name Konva.Node#levels
   * @method
   * @param {Number} level between 0 and 1
   * @returns {Number}
   */

  /**
   * RGB Filter
   * @function
   * @name RGB
   * @memberof Konva.Filters
   * @param {Object} imageData
   * @author ippo615
   * @example
   * node.cache();
   * node.filters([Konva.Filters.RGB]);
   * node.blue(120);
   * node.green(200);
   */
  var RGB = function (imageData) {
      var data = imageData.data, nPixels = data.length, red = this.red(), green = this.green(), blue = this.blue(), i, brightness;
      for (i = 0; i < nPixels; i += 4) {
          brightness =
              (0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2]) / 255;
          data[i] = brightness * red; // r
          data[i + 1] = brightness * green; // g
          data[i + 2] = brightness * blue; // b
          data[i + 3] = data[i + 3]; // alpha
      }
  };
  Factory.addGetterSetter(Node, 'red', 0, function (val) {
      this._filterUpToDate = false;
      if (val > 255) {
          return 255;
      }
      else if (val < 0) {
          return 0;
      }
      else {
          return Math.round(val);
      }
  });
  /**
   * get/set filter red value. Use with {@link Konva.Filters.RGB} filter.
   * @name red
   * @method
   * @memberof Konva.Node.prototype
   * @param {Integer} red value between 0 and 255
   * @returns {Integer}
   */
  Factory.addGetterSetter(Node, 'green', 0, function (val) {
      this._filterUpToDate = false;
      if (val > 255) {
          return 255;
      }
      else if (val < 0) {
          return 0;
      }
      else {
          return Math.round(val);
      }
  });
  /**
   * get/set filter green value. Use with {@link Konva.Filters.RGB} filter.
   * @name green
   * @method
   * @memberof Konva.Node.prototype
   * @param {Integer} green value between 0 and 255
   * @returns {Integer}
   */
  Factory.addGetterSetter(Node, 'blue', 0, RGBComponent, Factory.afterSetFilter);
  /**
   * get/set filter blue value. Use with {@link Konva.Filters.RGB} filter.
   * @name blue
   * @method
   * @memberof Konva.Node.prototype
   * @param {Integer} blue value between 0 and 255
   * @returns {Integer}
   */

  /**
   * RGBA Filter
   * @function
   * @name RGBA
   * @memberof Konva.Filters
   * @param {Object} imageData
   * @author codefo
   * @example
   * node.cache();
   * node.filters([Konva.Filters.RGBA]);
   * node.blue(120);
   * node.green(200);
   * node.alpha(0.3);
   */
  var RGBA = function (imageData) {
      var data = imageData.data, nPixels = data.length, red = this.red(), green = this.green(), blue = this.blue(), alpha = this.alpha(), i, ia;
      for (i = 0; i < nPixels; i += 4) {
          ia = 1 - alpha;
          data[i] = red * alpha + data[i] * ia; // r
          data[i + 1] = green * alpha + data[i + 1] * ia; // g
          data[i + 2] = blue * alpha + data[i + 2] * ia; // b
      }
  };
  Factory.addGetterSetter(Node, 'red', 0, function (val) {
      this._filterUpToDate = false;
      if (val > 255) {
          return 255;
      }
      else if (val < 0) {
          return 0;
      }
      else {
          return Math.round(val);
      }
  });
  /**
   * get/set filter red value. Use with {@link Konva.Filters.RGBA} filter.
   * @name red
   * @method
   * @memberof Konva.Node.prototype
   * @param {Integer} red value between 0 and 255
   * @returns {Integer}
   */
  Factory.addGetterSetter(Node, 'green', 0, function (val) {
      this._filterUpToDate = false;
      if (val > 255) {
          return 255;
      }
      else if (val < 0) {
          return 0;
      }
      else {
          return Math.round(val);
      }
  });
  /**
   * get/set filter green value. Use with {@link Konva.Filters.RGBA} filter.
   * @name green
   * @method
   * @memberof Konva.Node.prototype
   * @param {Integer} green value between 0 and 255
   * @returns {Integer}
   */
  Factory.addGetterSetter(Node, 'blue', 0, RGBComponent, Factory.afterSetFilter);
  /**
   * get/set filter blue value. Use with {@link Konva.Filters.RGBA} filter.
   * @name blue
   * @method
   * @memberof Konva.Node.prototype
   * @param {Integer} blue value between 0 and 255
   * @returns {Integer}
   */
  Factory.addGetterSetter(Node, 'alpha', 1, function (val) {
      this._filterUpToDate = false;
      if (val > 1) {
          return 1;
      }
      else if (val < 0) {
          return 0;
      }
      else {
          return val;
      }
  });
  /**
   * get/set filter alpha value. Use with {@link Konva.Filters.RGBA} filter.
   * @name alpha
   * @method
   * @memberof Konva.Node.prototype
   * @param {Float} alpha value between 0 and 1
   * @returns {Float}
   */

  // based on https://stackoverflow.com/questions/1061093/how-is-a-sepia-tone-created
  /**
   * @function
   * @name Sepia
   * @memberof Konva.Filters
   * @param {Object} imageData
   * @example
   * node.cache();
   * node.filters([Konva.Filters.Sepia]);
   */
  var Sepia = function (imageData) {
      var data = imageData.data, nPixels = data.length, i, r, g, b;
      for (i = 0; i < nPixels; i += 4) {
          r = data[i + 0];
          g = data[i + 1];
          b = data[i + 2];
          data[i + 0] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
          data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
          data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
      }
  };

  /**
   * Solarize Filter
   * Pixastic Lib - Solarize filter - v0.1.0
   * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
   * License: [http://www.pixastic.com/lib/license.txt]
   * @function
   * @name Solarize
   * @memberof Konva.Filters
   * @param {Object} imageData
   * @example
   * node.cache();
   * node.filters([Konva.Filters.Solarize]);
   */
  var Solarize = function (imageData) {
      var data = imageData.data, w = imageData.width, h = imageData.height, w4 = w * 4, y = h;
      do {
          var offsetY = (y - 1) * w4;
          var x = w;
          do {
              var offset = offsetY + (x - 1) * 4;
              var r = data[offset];
              var g = data[offset + 1];
              var b = data[offset + 2];
              if (r > 127) {
                  r = 255 - r;
              }
              if (g > 127) {
                  g = 255 - g;
              }
              if (b > 127) {
                  b = 255 - b;
              }
              data[offset] = r;
              data[offset + 1] = g;
              data[offset + 2] = b;
          } while (--x);
      } while (--y);
  };

  /**
   * Threshold Filter. Pushes any value above the mid point to
   *  the max and any value below the mid point to the min.
   *  This affects the alpha channel.
   * @function
   * @name Threshold
   * @memberof Konva.Filters
   * @param {Object} imageData
   * @author ippo615
   * @example
   * node.cache();
   * node.filters([Konva.Filters.Threshold]);
   * node.threshold(0.1);
   */
  var Threshold = function (imageData) {
      var level = this.threshold() * 255, data = imageData.data, len = data.length, i;
      for (i = 0; i < len; i += 1) {
          data[i] = data[i] < level ? 0 : 255;
      }
  };
  Factory.addGetterSetter(Node, 'threshold', 0.5, getNumberValidator(), Factory.afterSetFilter);
  /**
   * get/set threshold.  Must be a value between 0 and 1. Use with {@link Konva.Filters.Threshold} or {@link Konva.Filters.Mask} filter.
   * @name threshold
   * @method
   * @memberof Konva.Node.prototype
   * @param {Number} threshold
   * @returns {Number}
   */

  // we need to import core of the Konva and then extend it with all additional objects
  var Konva$2 = Konva$1.Util._assign(Konva$1, {
      Arc: Arc,
      Arrow: Arrow,
      Circle: Circle,
      Ellipse: Ellipse,
      Image: Image,
      Label: Label,
      Tag: Tag,
      Line: Line,
      Path: Path,
      Rect: Rect,
      RegularPolygon: RegularPolygon,
      Ring: Ring,
      Sprite: Sprite,
      Star: Star,
      Text: Text,
      TextPath: TextPath,
      Transformer: Transformer,
      Wedge: Wedge,
      /**
       * @namespace Filters
       * @memberof Konva
       */
      Filters: {
          Blur: Blur,
          Brighten: Brighten,
          Contrast: Contrast,
          Emboss: Emboss,
          Enhance: Enhance,
          Grayscale: Grayscale,
          HSL: HSL,
          HSV: HSV,
          Invert: Invert,
          Kaleidoscope: Kaleidoscope,
          Mask: Mask,
          Noise: Noise,
          Pixelate: Pixelate,
          Posterize: Posterize,
          RGB: RGB,
          RGBA: RGBA,
          Sepia: Sepia,
          Solarize: Solarize,
          Threshold: Threshold
      }
  });

  // main entry for umd build for rollup

  return Konva$2;

})));
