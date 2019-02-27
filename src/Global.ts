/*
 * Konva JavaScript Framework v@@version
 * http://konvajs.org/
 * Licensed under the MIT
 * Date: @@date
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
export const version = '@@version';

export const isBrowser =
  typeof window !== 'undefined' &&
  // browser case
  ({}.toString.call(window) === '[object Window]' ||
    // electron case
    {}.toString.call(window) === '[object global]');

export const isUnminified = /comment/.test(
  function() {
    /* comment */
  }.toString()
);

export const dblClickWindow = 400;

export const getAngle = function(angle) {
  return _getGlobalKonva().angleDeg ? angle * PI_OVER_180 : angle;
};

const _detectIE = function(ua) {
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

export const _parseUA = function(userAgent) {
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
    isIE: _detectIE(ua),
    // adding mobile flab
    mobile: mobile,
    ieMobile: ieMobile // If this is true (i.e., WP8), then Konva touch events are executed instead of equivalent Konva mouse events
  };
};

declare const WorkerGlobalScope: any;

export const glob: any =
  typeof global !== 'undefined'
    ? global
    : typeof window !== 'undefined'
    ? window
    : typeof WorkerGlobalScope !== 'undefined'
    ? self
    : {};

// user agent
export const UA = _parseUA((glob.navigator && glob.navigator.userAgent) || '');

export const document = glob.document;

// get global Konva instance
export const _getGlobalKonva = () => {
  return glob.Konva;
};

export const _NODES_REGISTRY = {};
let globalKonva = {};

// insert Konva into global namaspace (window)
// it is required for npm packages
export const _injectGlobal = Konva => {
  globalKonva = Konva;
  glob.Konva = Konva;
  Object.assign(glob.Konva, _NODES_REGISTRY);
};

export const _registerNode = NodeClass => {
  _NODES_REGISTRY[NodeClass.prototype.getClassName()] = NodeClass;
  globalKonva[NodeClass.prototype.getClassName()] = NodeClass;
};
