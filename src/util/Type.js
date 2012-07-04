///////////////////////////////////////////////////////////////////////
//  Type
///////////////////////////////////////////////////////////////////////
/*
 * utilities that determine data type and transform
 * one type into another
 */
Kinetic.Type = {
    /*
     * cherry-picked utilities from underscore.js
     */
    _isElement: function(obj) {
        return !!(obj && obj.nodeType == 1);
    },
    _isFunction: function(obj) {
        return !!(obj && obj.constructor && obj.call && obj.apply);
    },
    _isArray: function(obj) {
        return Object.prototype.toString.call(obj) == '[object Array]';
    },
    _isObject: function(obj) {
        return (!!obj && obj.constructor == Object);
    },
    _isNumber: function(obj) {
        return Object.prototype.toString.call(obj) == '[object Number]';
    },
    /*
     * other utils
     */
    _hasMethods: function(obj) {
        var names = [];
        for(var key in obj) {
            if(this._isFunction(obj[key]))
                names.push(key);
        }
        return names.length > 0;
    },
    /*
     * The argument can be:
     * - an integer (will be applied to both x and y)
     * - an array of one integer (will be applied to both x and y)
     * - an array of two integers (contains x and y)
     * - an array of four integers (contains x, y, width, and height)
     * - an object with x and y properties
     * - an array of one element which is an array of integers
     * - an array of one element of an object
     */
    _getXY: function(arg) {
        if(this._isNumber(arg)) {
            return {
                x: arg,
                y: arg
            };
        }
        else if(this._isArray(arg)) {
            // if arg is an array of one element
            if(arg.length === 1) {
                var val = arg[0];
                // if arg is an array of one element which is a number
                if(this._isNumber(val)) {
                    return {
                        x: val,
                        y: val
                    };
                }
                // if arg is an array of one element which is an array
                else if(this._isArray(val)) {
                    return {
                        x: val[0],
                        y: val[1]
                    };
                }
                // if arg is an array of one element which is an object
                else if(this._isObject(val)) {
                    return val;
                }
            }
            // if arg is an array of two or more elements
            else if(arg.length >= 2) {
                return {
                    x: arg[0],
                    y: arg[1]
                };
            }
        }
        // if arg is an object return the object
        else if(this._isObject(arg)) {
            return arg;
        }

        // default
        return {
            x: 0,
            y: 0
        };
    },
    /*
     * The argument can be:
     * - an integer (will be applied to both width and height)
     * - an array of one integer (will be applied to both width and height)
     * - an array of two integers (contains width and height)
     * - an array of four integers (contains x, y, width, and height)
     * - an object with width and height properties
     * - an array of one element which is an array of integers
     * - an array of one element of an object
     */
    _getSize: function(arg) {
        if(this._isNumber(arg)) {
            return {
                width: arg,
                height: arg
            };
        }
        else if(this._isArray(arg)) {
            // if arg is an array of one element
            if(arg.length === 1) {
                var val = arg[0];
                // if arg is an array of one element which is a number
                if(this._isNumber(val)) {
                    return {
                        width: val,
                        height: val
                    };
                }
                // if arg is an array of one element which is an array
                else if(this._isArray(val)) {
                    /*
                     * if arg is an array of one element which is an
                     * array of four elements
                     */
                    if(val.length >= 4) {
                        return {
                            width: val[2],
                            height: val[3]
                        };
                    }
                    /*
                     * if arg is an array of one element which is an
                     * array of two elements
                     */
                    else if(val.length >= 2) {
                        return {
                            width: val[0],
                            height: val[1]
                        };
                    }
                }
                // if arg is an array of one element which is an object
                else if(this._isObject(val)) {
                    return val;
                }
            }
            // if arg is an array of four elements
            else if(arg.length >= 4) {
                return {
                    width: arg[2],
                    height: arg[3]
                };
            }
            // if arg is an array of two elements
            else if(arg.length >= 2) {
                return {
                    width: arg[0],
                    height: arg[1]
                };
            }
        }
        // if arg is an object return the object
        else if(this._isObject(arg)) {
            return arg;
        }

        // default
        return {
            width: 0,
            height: 0
        };
    },
    /*
     * arg will be an array of numbers or
     *  an array of point objects
     */
    _getPoints: function(arg) {
        if(arg === undefined) {
            return [];
        }

        // an array of objects
        if(this._isObject(arg[0])) {
            return arg;
        }
        // an array of integers
        else {
            /*
             * convert array of numbers into an array
             * of objects containing x, y
             */
            var arr = [];
            for(var n = 0; n < arg.length; n += 2) {
                arr.push({
                    x: arg[n],
                    y: arg[n + 1]
                });
            }

            return arr;
        }
    }
};
