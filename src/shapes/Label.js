(function() {
  'use strict';
  // constants
  var ATTR_CHANGE_LIST = [
    'fontFamily',
    'fontSize',
    'fontStyle',
    'padding',
    'lineHeight',
    'text',
    'width'
  ],
    CHANGE_KONVA = 'Change.konva',
    NONE = 'none',
    UP = 'up',
    RIGHT = 'right',
    DOWN = 'down',
    LEFT = 'left',
    LABEL = 'Label',
    // cached variables
    attrChangeListLen = ATTR_CHANGE_LIST.length;

  /**
     * Label constructor.&nbsp; Labels are groups that contain a Text and Tag shape
     * @constructor
     * @memberof Konva
     * @param {Object} config
     * @@nodeParams
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
  Konva.Label = function(config) {
    this.____init(config);
  };

  Konva.Label.prototype = {
    ____init: function(config) {
      var that = this;

      Konva.Group.call(this, config);
      this.className = LABEL;

      this.on('add.konva', function(evt) {
        that._addListeners(evt.child);
        that._sync();
      });
    },
    /**
         * get Text shape for the label.  You need to access the Text shape in order to update
         * the text properties
         * @name getText
         * @method
         * @memberof Konva.Label.prototype
         */
    getText: function() {
      return this.find('Text')[0];
    },
    /**
         * get Tag shape for the label.  You need to access the Tag shape in order to update
         * the pointer properties and the corner radius
         * @name getTag
         * @method
         * @memberof Konva.Label.prototype
         */
    getTag: function() {
      return this.find('Tag')[0];
    },
    _addListeners: function(text) {
      var that = this, n;
      var func = function() {
        that._sync();
      };

      // update text data for certain attr changes
      for (n = 0; n < attrChangeListLen; n++) {
        text.on(ATTR_CHANGE_LIST[n] + CHANGE_KONVA, func);
      }
    },
    getWidth: function() {
      return this.getText().getWidth();
    },
    getHeight: function() {
      return this.getText().getHeight();
    },
    _sync: function() {
      var text = this.getText(),
        tag = this.getTag(),
        width,
        height,
        pointerDirection,
        pointerWidth,
        x,
        y,
        pointerHeight;

      if (text && tag) {
        width = text.getWidth();
        height = text.getHeight();
        pointerDirection = tag.getPointerDirection();
        pointerWidth = tag.getPointerWidth();
        pointerHeight = tag.getPointerHeight();
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
    }
  };

  Konva.Util.extend(Konva.Label, Konva.Group);

  Konva.Collection.mapMethods(Konva.Label);

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
  Konva.Tag = function(config) {
    this.___init(config);
  };

  Konva.Tag.prototype = {
    ___init: function(config) {
      Konva.Shape.call(this, config);
      this.className = 'Tag';
      this.sceneFunc(this._sceneFunc);
    },
    _sceneFunc: function(context) {
      var width = this.getWidth(),
        height = this.getHeight(),
        pointerDirection = this.getPointerDirection(),
        pointerWidth = this.getPointerWidth(),
        pointerHeight = this.getPointerHeight(),
        cornerRadius = Math.min(this.getCornerRadius(), width / 2, height / 2);

      context.beginPath();
      if (!cornerRadius) {
        context.moveTo(0, 0);
      } else {
        context.moveTo(cornerRadius, 0);
      }

      if (pointerDirection === UP) {
        context.lineTo((width - pointerWidth) / 2, 0);
        context.lineTo(width / 2, -1 * pointerHeight);
        context.lineTo((width + pointerWidth) / 2, 0);
      }

      if (!cornerRadius) {
        context.lineTo(width, 0);
      } else {
        context.lineTo(width - cornerRadius, 0);
        context.arc(
          width - cornerRadius,
          cornerRadius,
          cornerRadius,
          Math.PI * 3 / 2,
          0,
          false
        );
      }

      if (pointerDirection === RIGHT) {
        context.lineTo(width, (height - pointerHeight) / 2);
        context.lineTo(width + pointerWidth, height / 2);
        context.lineTo(width, (height + pointerHeight) / 2);
      }

      if (!cornerRadius) {
        context.lineTo(width, height);
      } else {
        context.lineTo(width, height - cornerRadius);
        context.arc(
          width - cornerRadius,
          height - cornerRadius,
          cornerRadius,
          0,
          Math.PI / 2,
          false
        );
      }

      if (pointerDirection === DOWN) {
        context.lineTo((width + pointerWidth) / 2, height);
        context.lineTo(width / 2, height + pointerHeight);
        context.lineTo((width - pointerWidth) / 2, height);
      }

      if (!cornerRadius) {
        context.lineTo(0, height);
      } else {
        context.lineTo(cornerRadius, height);
        context.arc(
          cornerRadius,
          height - cornerRadius,
          cornerRadius,
          Math.PI / 2,
          Math.PI,
          false
        );
      }

      if (pointerDirection === LEFT) {
        context.lineTo(0, (height + pointerHeight) / 2);
        context.lineTo(-1 * pointerWidth, height / 2);
        context.lineTo(0, (height - pointerHeight) / 2);
      }

      if (cornerRadius) {
        context.lineTo(0, cornerRadius);
        context.arc(
          cornerRadius,
          cornerRadius,
          cornerRadius,
          Math.PI,
          Math.PI * 3 / 2,
          false
        );
      }

      context.closePath();
      context.fillStrokeShape(this);
    },
    getSelfRect: function() {
      var x = 0,
        y = 0,
        pointerWidth = this.getPointerWidth(),
        pointerHeight = this.getPointerHeight(),
        direction = this.pointerDirection(),
        width = this.getWidth(),
        height = this.getHeight();

      if (direction === UP) {
        y -= pointerHeight;
        height += pointerHeight;
      } else if (direction === DOWN) {
        height += pointerHeight;
      } else if (direction === LEFT) {
        // ARGH!!! I have no idea why should I used magic 1.5!!!!!!!!!
        x -= pointerWidth * 1.5;
        width += pointerWidth;
      } else if (direction === RIGHT) {
        width += pointerWidth * 1.5;
      }
      return {
        x: x,
        y: y,
        width: width,
        height: height
      };
    }
  };

  Konva.Util.extend(Konva.Tag, Konva.Shape);
  Konva.Factory.addGetterSetter(Konva.Tag, 'pointerDirection', NONE);

  /**
     * set pointer Direction
     * @name setPointerDirection
     * @method
     * @memberof Konva.Tag.prototype
     * @param {String} pointerDirection can be up, right, down, left, or none.  The
     *  default is none
     */

  /**
     * get pointer Direction
     * @name getPointerDirection
     * @method
     * @memberof Konva.Tag.prototype
     */

  Konva.Factory.addGetterSetter(Konva.Tag, 'pointerWidth', 0);

  /**
     * set pointer width
     * @name setPointerWidth
     * @method
     * @memberof Konva.Tag.prototype
     * @param {Number} pointerWidth
     */

  /**
     * get pointer width
     * @name getPointerWidth
     * @method
     * @memberof Konva.Tag.prototype
     */

  Konva.Factory.addGetterSetter(Konva.Tag, 'pointerHeight', 0);

  /**
     * set pointer height
     * @name setPointerHeight
     * @method
     * @memberof Konva.Tag.prototype
     * @param {Number} pointerHeight
     */

  /**
     * get pointer height
     * @name getPointerHeight
     * @method
     * @memberof Konva.Tag.prototype
     */

  Konva.Factory.addGetterSetter(Konva.Tag, 'cornerRadius', 0);

  /**
     * set corner radius
     * @name setCornerRadius
     * @method
     * @memberof Konva.Tag.prototype
     * @param {Number} corner radius
     */

  /**
     * get corner radius
     * @name getCornerRadius
     * @method
     * @memberof Konva.Tag.prototype
     */

  Konva.Collection.mapMethods(Konva.Tag);
})();
