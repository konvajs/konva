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
var PI_OVER_180 = Math.PI / 180;
/**
 * @namespace Konva
 */
// public
export const version = '@@version';

// private
export const idCounter = 0;
export const ids = {};
export const names = {};
export const shapes = {};
export const listenClickTap = false;
export const inDblClickWindow = false;

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
// configurations

export const dblClickWindow = 400;

/**
 * @namespace Filters
 * @memberof Konva
 */
// namespace Filters {

// }

/**
 * returns whether or not drag and drop is currently active
 * @method
 * @memberof Konva
 */
export const isDragging = function() {
  var dd = getGlobalKonva()['DD'];

  // if DD is not included with the build, then
  // drag and drop is not even possible
  if (dd) {
    return dd.isDragging;
  }
  return false;
};
/**
 * returns whether or not a drag and drop operation is ready, but may
 *  not necessarily have started
 * @method
 * @memberof Konva
 */
export const isDragReady = function() {
  var dd = getGlobalKonva()['DD'];

  // if DD is not included with the build, then
  // drag and drop is not even possible
  if (dd) {
    return !!dd.node;
  }
  return false;
};
export const _addId = function(node: any, id) {
  if (!id) {
    return;
  }
  // do we need this warning?
  // if (this.ids[id]) {
  //   Util.warn(
  //     'Duplicate id "' +
  //       id +
  //       '". Please don not use same id several times. It may break find() method look up.'
  //   );
  // }
  ids[id] = node;
};

// TODO: check node on remove
export const _removeId = function(id: string) {
  if (id !== undefined) {
    delete ids[id];
  }
};

export const _addName = function(node: any, name) {
  if (name) {
    if (!names[name]) {
      names[name] = [];
    }
    names[name].push(node);
  }
};

export const _removeName = function(name, _id) {
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

export const getAngle = function(angle) {
  return getGlobalKonva().angleDeg ? angle * PI_OVER_180 : angle;
};

export const _detectIE = function(ua) {
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

export const getGlobalKonva = () => {
  return glob.Konva;
};

// export const window = glob.window;

// Konva.UA = ;

//   if (glob.Konva) {
//     console.error(
//       'Konva instance is already exist in current eviroment. ' +
//         'Please use only one instance.'
//     );
//   }
//   glob.Konva = Konva;
//   Konva.global = glob;
//   Konva.window = glob;
//   Konva.document = glob.document;
// }

// if (typeof exports === 'object') {
//   module.exports = Konva;
// } else if (typeof define === 'function' && define.amd) {
//   // AMD. Register as an anonymous module.
//   define(function() {
//     return Konva;
//   });
// }
