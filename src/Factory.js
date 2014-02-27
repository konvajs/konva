/*jshint unused:false */
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
        addGetterSetter: function(constructor, attr, def, validator, after) {
            this.addGetter(constructor, attr, def);
            this.addSetter(constructor, attr, validator, after);
            this.addOverloadedGetterSetter(constructor, attr);
        },
        addGetter: function(constructor, attr, def) {
            var method = GET + Kinetic.Util._capitalize(attr);

            constructor.prototype[method] = function() {
                var val = this.attrs[attr];
                return val === undefined ? def : val;
            };
        },
        addSetter: function(constructor, attr, validator, after) {
            var method = SET + Kinetic.Util._capitalize(attr);

            constructor.prototype[method] = function(val) {
                if (validator) {
                    val = validator.call(this, val);
                }

                this._setAttr(attr, val);

                if (after) {
                    after.call(this);
                }

                return this;
            };
        },
        addComponentsGetterSetter: function(constructor, attr, components, validator, after) {
            var len = components.length,
                capitalize = Kinetic.Util._capitalize,
                getter = GET + capitalize(attr),
                setter = SET + capitalize(attr),
                n, component;

            // getter
            constructor.prototype[getter] = function() {
                var ret = {};

                for (n=0; n<len; n++) {
                    component = components[n];
                    ret[component] = this.getAttr(attr + capitalize(component));
                }

                return ret;
            };

            // setter
            constructor.prototype[setter] = function(val) {
                var oldVal = this.attrs[attr],
                    key;

                if (validator) {
                    val = validator.call(this, val);
                }

                for (key in val) {
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
        addOverloadedGetterSetter: function(constructor, attr) {
            var capitalizedAttr = Kinetic.Util._capitalize(attr),
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
            };
        },
        backCompat: function(constructor, methods) {
            var key;

            for (key in methods) {
                constructor.prototype[key] = constructor.prototype[methods[key]];
            }
        },
        afterSetFilter: function() {
            this._filterUpToDate = false;
        }
    };

    Kinetic.Validators = {
        RGBComponent: function(val) {
            if (val > 255) {
                return 255;
            }
            else if (val < 0) {
                return 0;
            }
            else {
                return Math.round(val);
            }
        },
        alphaComponent: function(val) {
            if (val > 1) {
                return 1;
            }
            // chrome does not honor alpha values of 0
            else if (val < 0.0001) {
                return 0.0001;
            }
            else {
                return val;
            }
        }
    };
})();