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
        addGetterSetter: function(constructor, attr, def) {
            this.addGetter(constructor, attr, def);
            this.addSetter(constructor, attr);
        },
        addGetter: function(constructor, attr, def) {
            var method = GET + Kinetic.Util._capitalize(attr);

            constructor.prototype[method] = function() {
                var val = this.attrs[attr];
                return val === undefined ? def : val;
            };
        },
        addSetter: function(constructor, attr) {
            var method = SET + Kinetic.Util._capitalize(attr);

            constructor.prototype[method] = function(val) {
                this._setAttr(attr, val);   
                return this;
            };
        },

        // point
        addPointGetterSetter: function(constructor, attr) {
            this.addPointGetter(constructor, attr);
            this.addPointSetter(constructor, attr);
        },
        addPointGetter: function(constructor, attr) {
            var method = GET + Kinetic.Util._capitalize(attr),
                getX = method + UPPER_X,
                getY = method + UPPER_Y;

            constructor.prototype[method] = function() {  
                return {
                    x: this[getX](),
                    y: this[getY]()
                };
            };  
        },
        addPointSetter: function(constructor, attr) {
            var method = SET + Kinetic.Util._capitalize(attr),
                setX = method + UPPER_X,
                setY = method + UPPER_Y;

            constructor.prototype[method] = function(val) {
                this[setX](val.x);
                this[setY](val.y);
                return this;
            }; 
        },

        // box
        addBoxGetterSetter: function(constructor, attr) {
            this.addPointGetter(constructor, attr);
            this.addPointSetter(constructor, attr);
        },
        addBoxGetter: function(constructor, attr) {
            var method = GET + Kinetic.Util._capitalize(attr),
                getX = method + UPPER_X,
                getY = method + UPPER_Y,
                getWidth = method + UPPER_WIDTH,
                getHeight = method + UPPER_HEIGHT;

            constructor.prototype[method] = function() {  
                return {
                    x: this[getX](),
                    y: this[getY](),
                    width: this[getWidth](),
                    height: this[getHeight]()
                };
            };  
        },
        addBoxSetter: function(constructor, attr) {
            var method = SET + Kinetic.Util._capitalize(attr),
                setX = SET + method + UPPER_X,
                setY = SET + method + UPPER_Y,
                setWidth = SET + method + UPPER_WIDTH,
                setHeight = SET + method + UPPER_HEIGHT;

            constructor.prototype[method] = function(val) {
                this[setX](val.x);
                this[setY](val.y);
                this[setWidth](val.width);
                this[setHeight](val.height);
                return this;
            }; 
        },


        addRotationGetterSetter: function(constructor, attr, def) {
            this.addRotationGetter(constructor, attr, def);
            this.addRotationSetter(constructor, attr);
        },
        addColorGetterSetter: function(constructor, attr) {
            this.addGetter(constructor, attr);
            this.addSetter(constructor, attr);

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

        addRotationGetter: function(constructor, attr, def) {
            var that = this,
                method = GET + Kinetic.Util._capitalize(attr);

            // radians
            constructor.prototype[method] = function() {
                var val = this.attrs[attr];
                if (val === undefined) {
                    val = def;
                }
                return val;
            };
            // degrees
            constructor.prototype[method + DEG] = function() {
                var val = this.attrs[attr];
                if (val === undefined) {
                    val = def;
                }
                return Kinetic.Util._radToDeg(val);
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
            };
        },

        addColorComponentSetter: function(constructor, attr, c) {
            var prefix = SET + Kinetic.Util._capitalize(attr),
                method = prefix + Kinetic.Util._capitalize(c);
            constructor.prototype[method] = function(val) {
                var obj = {};
                obj[c] = val;
                this[prefix + RGB](obj);
            };
        },

        addRotationSetter: function(constructor, attr) {
            var that = this,
                method = SET + Kinetic.Util._capitalize(attr);

            // radians
            constructor.prototype[method] = function(val) {
                this._setAttr(attr, val);
            };
            // degrees
            constructor.prototype[method + DEG] = function(deg) {
                this._setAttr(attr, Kinetic.Util._degToRad(deg));
            };
        }
    };
})();