(function() {
    // CONSTANTS
    var ABSOLUTE_OPACITY = 'absoluteOpacity',
        ABSOLUTE_TRANSFORM = 'absoluteTransform',
        ADD = 'add',
        B = 'b',
        BEFORE = 'before',
        BLACK = 'black',
        CHANGE = 'Change',
        CHILDREN = 'children',
        DEG = 'Deg',
        DOT = '.',
        EMPTY_STRING = '',
        G = 'g',
        GET = 'get',
        HASH = '#',
        ID = 'id',
        KINETIC = 'kinetic',
        LISTENING = 'listening',
        MOUSEENTER = 'mouseenter',
        MOUSELEAVE = 'mouseleave',
        NAME = 'name',
        OFF = 'off',
        ON = 'on',
        PRIVATE_GET = '_get',
        R = 'r',
        RGB = 'RGB',
        SET = 'set',
        SHAPE = 'Shape',
        SPACE = ' ',
        STAGE = 'Stage',
        TRANSFORM = 'transform',
        UPPER_B = 'B',
        UPPER_G = 'G',
        UPPER_HEIGHT = 'Height',
        UPPER_R = 'R',
        UPPER_WIDTH = 'Width',
        UPPER_X = 'X',
        UPPER_Y = 'Y',
        VISIBLE = 'visible',
        X = 'x',
        Y = 'y';

    Kinetic.Factory = {
        // getter setter adders
        addGetterSetter: function(constructor, attr, def) {
            this.addGetter(constructor, attr, def);
            this.addSetter(constructor, attr);
            this.addOverloadedGetterSetter(constructor, attr);
        },
        addPointGetterSetter: function(constructor, attr, def) {
            this.addPointGetter(constructor, attr, def);
            this.addPointSetter(constructor, attr);
            this.addOverloadedGetterSetter(constructor, attr);

            // add invdividual component getters and setters
            this.addGetter(constructor, attr + UPPER_X, def);
            this.addGetter(constructor, attr + UPPER_Y, def);
            this.addSetter(constructor, attr + UPPER_X);
            this.addSetter(constructor, attr + UPPER_Y);

            this.addOverloadedGetterSetter(constructor, attr + UPPER_X);
            this.addOverloadedGetterSetter(constructor, attr + UPPER_Y);
        },
        addBoxGetterSetter: function(constructor, attr, def) {
            this.addBoxGetter(constructor, attr, def);
            this.addBoxSetter(constructor, attr);
            this.addOverloadedGetterSetter(constructor, attr);

            // add invdividual component getters and setters
            this.addGetter(constructor, attr + UPPER_X, def);
            this.addGetter(constructor, attr + UPPER_Y, def);
            this.addGetter(constructor, attr + UPPER_WIDTH, def);
            this.addGetter(constructor, attr + UPPER_HEIGHT, def);

            this.addSetter(constructor, attr + UPPER_X);
            this.addSetter(constructor, attr + UPPER_Y);
            this.addSetter(constructor, attr + UPPER_WIDTH);
            this.addSetter(constructor, attr + UPPER_HEIGHT);

            this.addOverloadedGetterSetter(constructor, attr + UPPER_X);
            this.addOverloadedGetterSetter(constructor, attr + UPPER_Y);
            this.addOverloadedGetterSetter(constructor, attr + UPPER_WIDTH);
            this.addOverloadedGetterSetter(constructor, attr + UPPER_HEIGHT);
        },
        addPointsGetterSetter: function(constructor, attr) {
            this.addPointsGetter(constructor, attr);
            this.addPointsSetter(constructor, attr);
            this.addOverloadedGetterSetter(constructor, attr);
        },
        addColorGetterSetter: function(constructor, attr) {
            this.addGetter(constructor, attr);
            this.addSetter(constructor, attr);
            this.addOverloadedGetterSetter(constructor, attr);

            // component getters
            this.addColorRGBGetter(constructor, attr);
            this.addColorComponentGetter(constructor, attr, R);
            this.addColorComponentGetter(constructor, attr, G);
            this.addColorComponentGetter(constructor, attr, B);

            // component setters
            this.addColorRGBSetter(constructor, attr);
            this.addColorComponentSetter(constructor, attr, R);
            this.addColorComponentSetter(constructor, attr, G);
            this.addColorComponentSetter(constructor, attr, B);

            // overloaders
            this.addOverloadedGetterSetter(constructor, attr + RGB);
            this.addOverloadedGetterSetter(constructor, attr + UPPER_R);
            this.addOverloadedGetterSetter(constructor, attr + UPPER_G);
            this.addOverloadedGetterSetter(constructor, attr + UPPER_B);
        },
        addFilterGetterSetter: function(constructor, attr, def) {
            this.addGetter(constructor, attr, def);
            this.addFilterSetter(constructor, attr);
            this.addOverloadedGetterSetter(constructor, attr);
        },

        // getter adders
        addColorRGBGetter: function(constructor, attr) {
            var method = GET + Kinetic.Util._capitalize(attr) + RGB;
            constructor.prototype[method] = function() {
                return Kinetic.Util.getRGB(this.attrs[attr]);
            };
        },

        addColorComponentGetter: function(constructor, attr, c) {
            var prefix = GET + Kinetic.Util._capitalize(attr),
                method = prefix + Kinetic.Util._capitalize(c);
            constructor.prototype[method] = function() {
                return this[prefix + RGB]()[c];
            };
        },
        addPointsGetter: function(constructor, attr) {
            var that = this,
                method = GET + Kinetic.Util._capitalize(attr);

            constructor.prototype[method] = function() {
                var val = this.attrs[attr];
                return val === undefined ? [] : val;
            };
        },
        addGetter: function(constructor, attr, def) {
            var that = this,
                method = GET + Kinetic.Util._capitalize(attr);

            constructor.prototype[method] = function() {
                var val = this.attrs[attr];
                return val === undefined ? def : val;
            };
        },
        addPointGetter: function(constructor, attr) {
            var that = this,
                baseMethod = GET + Kinetic.Util._capitalize(attr);

            constructor.prototype[baseMethod] = function() {
                var that = this;
                return {
                    x: that[baseMethod + UPPER_X](),
                    y: that[baseMethod + UPPER_Y]()
                };
            };
        },
        addBoxGetter: function(constructor, attr) {
            var that = this,
                baseMethod = GET + Kinetic.Util._capitalize(attr);

            constructor.prototype[baseMethod] = function() {
                var that = this;
                return {
                    x: that[baseMethod + UPPER_X](),
                    y: that[baseMethod + UPPER_Y](),
                    width: that[baseMethod + UPPER_WIDTH](),
                    height: that[baseMethod + UPPER_HEIGHT]()
                };
            };
        },

        // setter adders
        addColorRGBSetter: function(constructor, attr) {
            var method = SET + Kinetic.Util._capitalize(attr) + RGB;

            constructor.prototype[method] = function(obj) {
                var r = obj && obj.r !== undefined ? obj.r | 0 : this.getAttr(attr + UPPER_R),
                    g = obj && obj.g !== undefined ? obj.g | 0 : this.getAttr(attr + UPPER_G),
                    b = obj && obj.b !== undefined ? obj.b | 0 : this.getAttr(attr + UPPER_B);

                this._setAttr(attr, HASH + Kinetic.Util._rgbToHex(r, g, b));
                return this;
            };
        },

        addColorComponentSetter: function(constructor, attr, c) {
            var prefix = SET + Kinetic.Util._capitalize(attr),
                method = prefix + Kinetic.Util._capitalize(c);
            constructor.prototype[method] = function(val) {
                var obj = {};
                obj[c] = val;
                this[prefix + RGB](obj);
                return this;
            };
        },
        addPointsSetter: function(constructor, attr) {
            var method = SET + Kinetic.Util._capitalize(attr);
            constructor.prototype[method] = function(val) {
                this._setAttr('points', val);
                return this;
            };
        },
        addSetter: function(constructor, attr) {
            var method = SET + Kinetic.Util._capitalize(attr);

            constructor.prototype[method] = function(val) {
                this._setAttr(attr, val); 
                return this;  
            };
        },
        addFilterSetter: function(constructor, attr) {
            var method = SET + Kinetic.Util._capitalize(attr);

            constructor.prototype[method] = function(val) {
                this._setAttr(attr, val); 
                this._filterUpToDate = false;
                return this;  
            };
        },
        addPointSetter: function(constructor, attr) {
            var that = this,
                baseMethod = SET + Kinetic.Util._capitalize(attr);

            constructor.prototype[baseMethod] = function(pos) {
                var oldVal = this.attrs[attr],
                    x = 0,
                    y = 0;

                if (pos) {
                  x = pos.x;
                  y = pos.y;

                  if (x !== undefined) {
                    this[baseMethod + UPPER_X](x);
                  }
                  if (y !== undefined) {
                    this[baseMethod + UPPER_Y](y);
                  }
                  this._fireChangeEvent(attr, oldVal, pos);
                }

                return this;
            };
        },
        addBoxSetter: function(constructor, attr) {
            var that = this,
                baseMethod = SET + Kinetic.Util._capitalize(attr);

            constructor.prototype[baseMethod] = function(box) {
                var oldVal = this.attrs[attr],
                    x, y, width, height;

                if (box) {
                  x = box.x;
                  y = box.y;
                  width = box.width;
                  height = box.height;

                  if (x !== undefined) {
                    this[baseMethod + UPPER_X](x);
                  }
                  if (y !== undefined) {
                    this[baseMethod + UPPER_Y](y);
                  }
                  if (width !== undefined) {
                    this[baseMethod + UPPER_WIDTH](width);
                  }
                  if (height !== undefined) {
                    this[baseMethod + UPPER_HEIGHT](height);
                  }
                  this._fireChangeEvent(attr, oldVal, box);
                }

                return this;
            };
        },
        addOverloadedGetterSetter: function(constructor, attr) {
            var that = this,
                capitalizedAttr = Kinetic.Util._capitalize(attr),
                setter = SET + capitalizedAttr,
                getter = GET + capitalizedAttr;

            constructor.prototype[attr] = function() {
                // setting
                if (arguments.length) {
                    this[setter](arguments[0]);
                    return this;
                }
                // getting
                else {
                    return this[getter]();
                }
            }
        }
    };
})();