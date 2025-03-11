import { Konva } from './Global';
import { Util } from './Util';

function _formatValue(val: any) {
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

export function RGBComponent(val: number) {
  if (val > 255) {
    return 255;
  } else if (val < 0) {
    return 0;
  }
  return Math.round(val);
}
export function alphaComponent(val: number) {
  if (val > 1) {
    return 1;
  } else if (val < 0.0001) {
    // chrome does not honor alpha values of 0
    return 0.0001;
  }

  return val;
}

export function getNumberValidator<T>() {
  if (Konva.isUnminified) {
    return function (val: T, attr: string): T {
      if (!Util._isNumber(val)) {
        Util.warn(
          _formatValue(val) +
            ' is a not valid value for "' +
            attr +
            '" attribute. The value should be a number.'
        );
      }
      return val;
    };
  }
}

export function getNumberOrArrayOfNumbersValidator<T>(noOfElements: number) {
  if (Konva.isUnminified) {
    return function (val: T, attr: string): T {
      let isNumber = Util._isNumber(val);
      let isValidArray = Util._isArray(val) && val.length == noOfElements;
      if (!isNumber && !isValidArray) {
        Util.warn(
          _formatValue(val) +
            ' is a not valid value for "' +
            attr +
            '" attribute. The value should be a number or Array<number>(' +
            noOfElements +
            ')'
        );
      }
      return val;
    };
  }
}

export function getNumberOrAutoValidator<T>() {
  if (Konva.isUnminified) {
    return function (val: T, attr: string): T {
      var isNumber = Util._isNumber(val);
      var isAuto = val === 'auto';

      if (!(isNumber || isAuto)) {
        Util.warn(
          _formatValue(val) +
            ' is a not valid value for "' +
            attr +
            '" attribute. The value should be a number or "auto".'
        );
      }
      return val;
    };
  }
}

export function getStringValidator<T>() {
  if (Konva.isUnminified) {
    return function (val: T, attr: string): T {
      if (!Util._isString(val)) {
        Util.warn(
          _formatValue(val) +
            ' is a not valid value for "' +
            attr +
            '" attribute. The value should be a string.'
        );
      }
      return val;
    };
  }
}

export function getStringOrGradientValidator<T>() {
  if (Konva.isUnminified) {
    return function (val: T, attr: string): T {
      const isString = Util._isString(val);
      const isGradient =
        Object.prototype.toString.call(val) === '[object CanvasGradient]' ||
        (val && val['addColorStop']);
      if (!(isString || isGradient)) {
        Util.warn(
          _formatValue(val) +
            ' is a not valid value for "' +
            attr +
            '" attribute. The value should be a string or a native gradient.'
        );
      }
      return val;
    };
  }
}

export function getFunctionValidator<T>() {
  if (Konva.isUnminified) {
    return function (val: T, attr: string): T {
      if (!Util._isFunction(val)) {
        Util.warn(
          _formatValue(val) +
            ' is a not valid value for "' +
            attr +
            '" attribute. The value should be a function.'
        );
      }
      return val;
    };
  }
}
export function getNumberArrayValidator<T>() {
  if (Konva.isUnminified) {
    return function (val: T, attr: string): T {
      // Retrieve TypedArray constructor as found in MDN (if TypedArray is available)
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray#description
      const TypedArray = Int8Array ? Object.getPrototypeOf(Int8Array) : null;
      if (TypedArray && val instanceof TypedArray) {
        return val;
      }
      if (!Util._isArray(val)) {
        Util.warn(
          _formatValue(val) +
            ' is a not valid value for "' +
            attr +
            '" attribute. The value should be a array of numbers.'
        );
      } else {
        val.forEach(function (item: any) {
          if (!Util._isNumber(item)) {
            Util.warn(
              '"' +
                attr +
                '" attribute has non numeric element ' +
                item +
                '. Make sure that all elements are numbers.'
            );
          }
        });
      }
      return val;
    };
  }
}
export function getBooleanValidator<T>() {
  if (Konva.isUnminified) {
    return function (val: T, attr: string): T {
      var isBool = val === true || val === false;
      if (!isBool) {
        Util.warn(
          _formatValue(val) +
            ' is a not valid value for "' +
            attr +
            '" attribute. The value should be a boolean.'
        );
      }
      return val;
    };
  }
}
export function getComponentValidator<T>(components: string[]) {
  if (Konva.isUnminified) {
    return function (val: T, attr: string): T {
      // ignore validation on undefined value, because it will reset to defalt
      if (val === undefined || val === null) {
        return val;
      }
      if (!Util.isObject(val)) {
        Util.warn(
          _formatValue(val) +
            ' is a not valid value for "' +
            attr +
            '" attribute. The value should be an object with properties ' +
            components
        );
      }
      return val;
    };
  }
}
