/*
 * Konva JavaScript Framework v@@version
 * http://konvajs.github.io/
 * Licensed under the MIT
 * Date: @@date
 *
 * Original work Copyright (C) 2011 - 2013 by Eric Rowell (KineticJS)
 * Modified work Copyright (C) 2014 - present by Anton Lavrenov (Konva)
 *
 * @license
 */

// runtime check for already included Konva
(function() {
  'use strict';
  /**
   * @namespace Konva
   */

  var PI_OVER_180 = Math.PI / 180;

  var Konva = {
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

    isBrowser:
      typeof window !== 'undefined' &&
      // browser case
      ({}.toString.call(window) === '[object Window]' ||
        // electron case
        {}.toString.call(window) === '[object global]'),

    isUnminified: /comment/.test(function() {
      /* comment */
    }),

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
     * only then start dragging. Default is 3px.
     * @property dragDistance
     * @default 0
     * @memberof Konva
     * @example
     * Konva.dragDistance = 10;
     */
    dragDistance: 3,
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
    showWarnings: true,

    /**
     * @namespace Filters
     * @memberof Konva
     */
    Filters: {},

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
      }
      return false;
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
      }
      return false;
    },
    _addId: function(node, id) {
      if (!id) {
        return;
      }
      // do we need this warning?
      // if (this.ids[id]) {
      //   Konva.Util.warn(
      //     'Duplicate id "' +
      //       id +
      //       '". Please don not use same id several times. It may break find() method look up.'
      //   );
      // }
      this.ids[id] = node;
    },
    _removeId: function(id) {
      if (id !== undefined) {
        delete this.ids[id];
      }
    },
    _addName: function(node, name) {
      if (name) {
        if (!this.names[name]) {
          this.names[name] = [];
        }
        this.names[name].push(node);
      }
    },
    _removeName: function(name, _id) {
      if (!name) {
        return;
      }
      var nodes = this.names[name];
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
        delete this.names[name];
      }
    },
    getAngle: function(angle) {
      return this.angleDeg ? angle * PI_OVER_180 : angle;
    },
    _detectIE: function(ua) {
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
    },
    _parseUA: function(userAgent) {
      var ua = userAgent.toLowerCase(),
        // jQuery UA regex
        match =
          /(chrome)[ /]([\w.]+)/.exec(ua) ||
          /(webkit)[ /]([\w.]+)/.exec(ua) ||
          /(opera)(?:.*version|)[ /]([\w.]+)/.exec(ua) ||
          /(msie) ([\w.]+)/.exec(ua) ||
          (ua.indexOf('compatible') < 0 &&
            /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua)) ||
          [],
        // adding mobile flag as well
        mobile = !!userAgent.match(
          /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i
        ),
        ieMobile = !!userAgent.match(/IEMobile/i);

      return {
        browser: match[1] || '',
        version: match[2] || '0',
        isIE: Konva._detectIE(ua),
        // adding mobile flab
        mobile: mobile,
        ieMobile: ieMobile // If this is true (i.e., WP8), then Konva touch events are executed instead of equivalent Konva mouse events
      };
    },
    // user agent
    UA: undefined
  };

  var glob =
    typeof global !== 'undefined'
      ? global
      : typeof window !== 'undefined'
        ? window
        : typeof WorkerGlobalScope !== 'undefined'
          ? self
          : {};

  Konva.UA = Konva._parseUA((glob.navigator && glob.navigator.userAgent) || '');

  if (glob.Konva) {
    console.error(
      'Konva instance is already exist in current eviroment. ' +
        'Please use only one instance.'
    );
  }
  glob.Konva = Konva;
  Konva.global = glob;
  Konva.window = glob;
  Konva.document = glob.document;

  if (typeof exports === 'object') {
    module.exports = Konva;
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(function() {
      return Konva;
    });
  }
})();
