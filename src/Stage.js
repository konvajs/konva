(function() {
  'use strict';
  // CONSTANTS
  var STAGE = 'Stage',
    STRING = 'string',
    PX = 'px',
    MOUSEOUT = 'mouseout',
    MOUSELEAVE = 'mouseleave',
    MOUSEOVER = 'mouseover',
    MOUSEENTER = 'mouseenter',
    MOUSEMOVE = 'mousemove',
    MOUSEDOWN = 'mousedown',
    MOUSEUP = 'mouseup',
    CONTEXTMENU = 'contextmenu',
    CLICK = 'click',
    DBL_CLICK = 'dblclick',
    TOUCHSTART = 'touchstart',
    TOUCHEND = 'touchend',
    TAP = 'tap',
    DBL_TAP = 'dbltap',
    TOUCHMOVE = 'touchmove',
    WHEEL = 'wheel',
    CONTENT_MOUSEOUT = 'contentMouseout',
    CONTENT_MOUSEOVER = 'contentMouseover',
    CONTENT_MOUSEMOVE = 'contentMousemove',
    CONTENT_MOUSEDOWN = 'contentMousedown',
    CONTENT_MOUSEUP = 'contentMouseup',
    CONTENT_CONTEXTMENU = 'contentContextmenu',
    CONTENT_CLICK = 'contentClick',
    CONTENT_DBL_CLICK = 'contentDblclick',
    CONTENT_TOUCHSTART = 'contentTouchstart',
    CONTENT_TOUCHEND = 'contentTouchend',
    CONTENT_DBL_TAP = 'contentDbltap',
    CONTENT_TAP = 'contentTap',
    CONTENT_TOUCHMOVE = 'contentTouchmove',
    CONTENT_WHEEL = 'contentWheel',
    DIV = 'div',
    RELATIVE = 'relative',
    KONVA_CONTENT = 'konvajs-content',
    SPACE = ' ',
    UNDERSCORE = '_',
    CONTAINER = 'container',
    EMPTY_STRING = '',
    EVENTS = [
      MOUSEDOWN,
      MOUSEMOVE,
      MOUSEUP,
      MOUSEOUT,
      TOUCHSTART,
      TOUCHMOVE,
      TOUCHEND,
      MOUSEOVER,
      WHEEL,
      CONTEXTMENU
    ],
    // cached variables
    eventsLength = EVENTS.length;

  function addEvent(ctx, eventName) {
    ctx.content.addEventListener(
      eventName,
      function(evt) {
        ctx[UNDERSCORE + eventName](evt);
      },
      false
    );
  }

  /**
   * Stage constructor.  A stage is used to contain multiple layers
   * @constructor
   * @memberof Konva
   * @augments Konva.Container
   * @param {Object} config
   * @param {String|Element} config.container Container selector or DOM element
   * @@nodeParams
   * @example
   * var stage = new Konva.Stage({
   *   width: 500,
   *   height: 800,
   *   container: 'containerId' // or "#containerId" or ".containerClass"
   * });
   */
  Konva.Stage = function(config) {
    this.___init(config);
  };

  Konva.Util.addMethods(Konva.Stage, {
    ___init: function(config) {
      this.nodeType = STAGE;
      // call super constructor
      Konva.Container.call(this, config);
      this._id = Konva.idCounter++;
      this._buildDOM();
      this._bindContentEvents();
      this._enableNestedTransforms = false;
      Konva.stages.push(this);
    },
    _validateAdd: function(child) {
      if (child.getType() !== 'Layer') {
        Konva.Util.throw('You may only add layers to the stage.');
      }
    },
    /**
     * set container dom element which contains the stage wrapper div element
     * @method
     * @memberof Konva.Stage.prototype
     * @param {DomElement} container can pass in a dom element or id string
     */
    setContainer: function(container) {
      if (typeof container === STRING) {
        if (container.charAt(0) === '.') {
          var className = container.slice(1);
          container = Konva.document.getElementsByClassName(className)[0];
        } else {
          var id;
          if (container.charAt(0) !== '#') {
            id = container;
          } else {
            id = container.slice(1);
          }
          container = Konva.document.getElementById(id);
        }
        if (!container) {
          throw 'Can not find container in document with id ' + id;
        }
      }
      this._setAttr(CONTAINER, container);
      return this;
    },
    shouldDrawHit: function() {
      return true;
    },
    draw: function() {
      Konva.Node.prototype.draw.call(this);
      return this;
    },
    /**
     * draw layer scene graphs
     * @name draw
     * @method
     * @memberof Konva.Stage.prototype
     */

    /**
     * draw layer hit graphs
     * @name drawHit
     * @method
     * @memberof Konva.Stage.prototype
     */

    /**
     * set height
     * @method
     * @memberof Konva.Stage.prototype
     * @param {Number} height
     */
    setHeight: function(height) {
      Konva.Node.prototype.setHeight.call(this, height);
      this._resizeDOM();
      return this;
    },
    /**
     * set width
     * @method
     * @memberof Konva.Stage.prototype
     * @param {Number} width
     */
    setWidth: function(width) {
      Konva.Node.prototype.setWidth.call(this, width);
      this._resizeDOM();
      return this;
    },
    /**
     * clear all layers
     * @method
     * @memberof Konva.Stage.prototype
     */
    clear: function() {
      var layers = this.children,
        len = layers.length,
        n;

      for (n = 0; n < len; n++) {
        layers[n].clear();
      }
      return this;
    },
    clone: function(obj) {
      if (!obj) {
        obj = {};
      }
      obj.container = Konva.document.createElement(DIV);
      return Konva.Container.prototype.clone.call(this, obj);
    },
    /**
     * destroy stage
     * @method
     * @memberof Konva.Stage.prototype
     */
    destroy: function() {
      var content = this.content;
      Konva.Container.prototype.destroy.call(this);

      if (content && Konva.Util._isInDocument(content)) {
        this.getContainer().removeChild(content);
      }
      var index = Konva.stages.indexOf(this);
      if (index > -1) {
        Konva.stages.splice(index, 1);
      }
      return this;
    },
    /**
     * get pointer position which can be a touch position or mouse position
     * @method
     * @memberof Konva.Stage.prototype
     * @returns {Object}
     */
    getPointerPosition: function() {
      return this.pointerPos;
    },
    getStage: function() {
      return this;
    },
    /**
     * get stage content div element which has the
     *  the class name "konvajs-content"
     * @method
     * @memberof Konva.Stage.prototype
     */
    getContent: function() {
      return this.content;
    },
    _toKonvaCanvas: function(config) {
      config = config || {};

      var x = config.x || 0,
        y = config.y || 0,
        canvas = new Konva.SceneCanvas({
          width: config.width || this.getWidth(),
          height: config.height || this.getHeight(),
          pixelRatio: config.pixelRatio || 1
        }),
        _context = canvas.getContext()._context,
        layers = this.children;

      if (x || y) {
        _context.translate(-1 * x, -1 * y);
      }

      layers.each(function(layer) {
        if (!layer.isVisible()) {
          return;
        }
        var layerCanvas = layer._toKonvaCanvas(config);
        _context.drawImage(
          layerCanvas._canvas,
          x,
          y,
          layerCanvas.getWidth() / layerCanvas.getPixelRatio(),
          layerCanvas.getHeight() / layerCanvas.getPixelRatio()
        );
      });
      return canvas;
    },
    /**
     * converts stage into an image.
     * @method
     * @memberof Konva.Stage.prototype
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
     */
    toImage: function(config) {
      var cb = config.callback;

      config.callback = function(dataUrl) {
        Konva.Util._getImage(dataUrl, function(img) {
          cb(img);
        });
      };
      this.toDataURL(config);
    },
    /**
     * get visible intersection shape. This is the preferred
     *  method for determining if a point intersects a shape or not
     * @method
     * @memberof Konva.Stage.prototype
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
    getIntersection: function(pos, selector) {
      var layers = this.getChildren(),
        len = layers.length,
        end = len - 1,
        n,
        shape;

      for (n = end; n >= 0; n--) {
        shape = layers[n].getIntersection(pos, selector);
        if (shape) {
          return shape;
        }
      }

      return null;
    },
    _resizeDOM: function() {
      if (this.content) {
        var width = this.getWidth(),
          height = this.getHeight(),
          layers = this.getChildren(),
          len = layers.length,
          n,
          layer;

        // set content dimensions
        this.content.style.width = width + PX;
        this.content.style.height = height + PX;

        this.bufferCanvas.setSize(width, height);
        this.bufferHitCanvas.setSize(width, height);

        // set layer dimensions
        for (n = 0; n < len; n++) {
          layer = layers[n];
          layer.setSize(width, height);
          layer.draw();
        }
      }
    },
    /**
     * add layer or layers to stage
     * @method
     * @memberof Konva.Stage.prototype
     * @param {...Konva.Layer} layer
     * @example
     * stage.add(layer1, layer2, layer3);
     */
    add: function(layer) {
      if (arguments.length > 1) {
        for (var i = 0; i < arguments.length; i++) {
          this.add(arguments[i]);
        }
        return this;
      }
      Konva.Container.prototype.add.call(this, layer);
      layer._setCanvasSize(this.width(), this.height());

      // draw layer and append canvas to container
      layer.draw();

      if (Konva.isBrowser) {
        this.content.appendChild(layer.canvas._canvas);
      }

      // chainable
      return this;
    },
    getParent: function() {
      return null;
    },
    getLayer: function() {
      return null;
    },
    /**
     * returns a {@link Konva.Collection} of layers
     * @method
     * @memberof Konva.Stage.prototype
     */
    getLayers: function() {
      return this.getChildren();
    },
    _bindContentEvents: function() {
      if (!Konva.isBrowser) {
        return;
      }
      for (var n = 0; n < eventsLength; n++) {
        addEvent(this, EVENTS[n]);
      }
    },
    _mouseover: function(evt) {
      if (!Konva.UA.mobile) {
        this._setPointerPosition(evt);
        this._fire(CONTENT_MOUSEOVER, { evt: evt });
      }
    },
    _mouseout: function(evt) {
      if (!Konva.UA.mobile) {
        this._setPointerPosition(evt);
        var targetShape = this.targetShape;

        if (targetShape && !Konva.isDragging()) {
          targetShape._fireAndBubble(MOUSEOUT, { evt: evt });
          targetShape._fireAndBubble(MOUSELEAVE, { evt: evt });
          this.targetShape = null;
        }
        this.pointerPos = undefined;

        this._fire(CONTENT_MOUSEOUT, { evt: evt });
      }
    },
    _mousemove: function(evt) {
      // workaround for mobile IE to force touch event when unhandled pointer event elevates into a mouse event
      if (Konva.UA.ieMobile) {
        return this._touchmove(evt);
      }
      // workaround fake mousemove event in chrome browser https://code.google.com/p/chromium/issues/detail?id=161464
      if (
        (typeof evt.movementX !== 'undefined' ||
          typeof evt.movementY !== 'undefined') &&
        evt.movementY === 0 &&
        evt.movementX === 0
      ) {
        return null;
      }
      if (Konva.UA.mobile) {
        return null;
      }
      this._setPointerPosition(evt);
      var shape;

      if (!Konva.isDragging()) {
        shape = this.getIntersection(this.getPointerPosition());
        if (shape && shape.isListening()) {
          if (
            !Konva.isDragging() &&
            (!this.targetShape || this.targetShape._id !== shape._id)
          ) {
            if (this.targetShape) {
              this.targetShape._fireAndBubble(MOUSEOUT, { evt: evt }, shape);
              this.targetShape._fireAndBubble(MOUSELEAVE, { evt: evt }, shape);
            }
            shape._fireAndBubble(MOUSEOVER, { evt: evt }, this.targetShape);
            shape._fireAndBubble(MOUSEENTER, { evt: evt }, this.targetShape);
            this.targetShape = shape;
          } else {
            shape._fireAndBubble(MOUSEMOVE, { evt: evt });
          }
        } else {
          /*
                 * if no shape was detected, clear target shape and try
                 * to run mouseout from previous target shape
                 */
          if (this.targetShape && !Konva.isDragging()) {
            this.targetShape._fireAndBubble(MOUSEOUT, { evt: evt });
            this.targetShape._fireAndBubble(MOUSELEAVE, { evt: evt });
            this.targetShape = null;
          }
          this._fire(MOUSEMOVE, {
            evt: evt,
            target: this,
            currentTarget: this
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
    },
    _mousedown: function(evt) {
      // workaround for mobile IE to force touch event when unhandled pointer event elevates into a mouse event
      if (Konva.UA.ieMobile) {
        return this._touchstart(evt);
      }
      if (!Konva.UA.mobile) {
        this._setPointerPosition(evt);
        var shape = this.getIntersection(this.getPointerPosition());

        Konva.listenClickTap = true;

        if (shape && shape.isListening()) {
          this.clickStartShape = shape;
          shape._fireAndBubble(MOUSEDOWN, { evt: evt });
        } else {
          this._fire(MOUSEDOWN, {
            evt: evt,
            target: this,
            currentTarget: this
          });
        }

        // content event
        this._fire(CONTENT_MOUSEDOWN, { evt: evt });
      }

      // always call preventDefault for desktop events because some browsers
      // try to drag and drop the canvas element
      // TODO: if we preventDefault() it will cancel event detection outside of window inside iframe
      // but we need it for better drag&drop
      // can we disable native drag&drop somehow differently?
      // if (evt.cancelable) {
      // evt.preventDefault();
      // }
    },
    _mouseup: function(evt) {
      // workaround for mobile IE to force touch event when unhandled pointer event elevates into a mouse event
      if (Konva.UA.ieMobile) {
        return this._touchend(evt);
      }
      if (!Konva.UA.mobile) {
        this._setPointerPosition(evt);
        var shape = this.getIntersection(this.getPointerPosition()),
          clickStartShape = this.clickStartShape,
          clickEndShape = this.clickEndShape,
          fireDblClick = false,
          dd = Konva.DD;

        if (Konva.inDblClickWindow) {
          fireDblClick = true;
          clearTimeout(this.dblTimeout);
          // Konva.inDblClickWindow = false;
        } else if (!dd || !dd.justDragged) {
          // don't set inDblClickWindow after dragging
          Konva.inDblClickWindow = true;
          clearTimeout(this.dblTimeout);
        } else if (dd) {
          dd.justDragged = false;
        }

        this.dblTimeout = setTimeout(function() {
          Konva.inDblClickWindow = false;
        }, Konva.dblClickWindow);

        if (shape && shape.isListening()) {
          this.clickEndShape = shape;
          shape._fireAndBubble(MOUSEUP, { evt: evt });

          // detect if click or double click occurred
          if (
            Konva.listenClickTap &&
            clickStartShape &&
            clickStartShape._id === shape._id
          ) {
            shape._fireAndBubble(CLICK, { evt: evt });

            if (
              fireDblClick &&
              clickEndShape &&
              clickEndShape._id === shape._id
            ) {
              shape._fireAndBubble(DBL_CLICK, { evt: evt });
            }
          }
        } else {
          this._fire(MOUSEUP, { evt: evt, target: this, currentTarget: this });
          if (Konva.listenClickTap) {
            this._fire(CLICK, { evt: evt, target: this, currentTarget: this });
          }

          if (fireDblClick) {
            this._fire(DBL_CLICK, {
              evt: evt,
              target: this,
              currentTarget: this
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
      }

      // always call preventDefault for desktop events because some browsers
      // try to drag and drop the canvas element
      if (evt.cancelable) {
        evt.preventDefault();
      }
    },
    _contextmenu: function(evt) {
      this._setPointerPosition(evt);
      var shape = this.getIntersection(this.getPointerPosition());

      if (shape && shape.isListening()) {
        shape._fireAndBubble(CONTEXTMENU, { evt: evt });
      } else {
        this._fire(CONTEXTMENU, {
          evt: evt,
          target: this,
          currentTarget: this
        });
      }
      this._fire(CONTENT_CONTEXTMENU, { evt: evt });
    },
    _touchstart: function(evt) {
      this._setPointerPosition(evt);
      var shape = this.getIntersection(this.getPointerPosition());

      Konva.listenClickTap = true;

      if (shape && shape.isListening()) {
        this.tapStartShape = shape;
        shape._fireAndBubble(TOUCHSTART, { evt: evt });

        // only call preventDefault if the shape is listening for events
        if (shape.isListening() && shape.preventDefault() && evt.cancelable) {
          evt.preventDefault();
        }
      } else {
        this._fire(TOUCHSTART, {
          evt: evt,
          target: this,
          currentTarget: this
        });
      }
      // content event
      this._fire(CONTENT_TOUCHSTART, { evt: evt });
    },
    _touchend: function(evt) {
      this._setPointerPosition(evt);
      var shape = this.getIntersection(this.getPointerPosition()),
        fireDblClick = false;

      if (Konva.inDblClickWindow) {
        fireDblClick = true;
        clearTimeout(this.dblTimeout);
        // Konva.inDblClickWindow = false;
      } else {
        Konva.inDblClickWindow = true;
        clearTimeout(this.dblTimeout);
      }

      this.dblTimeout = setTimeout(function() {
        Konva.inDblClickWindow = false;
      }, Konva.dblClickWindow);

      if (shape && shape.isListening()) {
        shape._fireAndBubble(TOUCHEND, { evt: evt });

        // detect if tap or double tap occurred
        if (
          Konva.listenClickTap &&
          this.tapStartShape &&
          shape._id === this.tapStartShape._id
        ) {
          shape._fireAndBubble(TAP, { evt: evt });

          if (fireDblClick) {
            shape._fireAndBubble(DBL_TAP, { evt: evt });
          }
        }
        // only call preventDefault if the shape is listening for events
        if (shape.isListening() && shape.preventDefault() && evt.cancelable) {
          evt.preventDefault();
        }
      } else {
        this._fire(TOUCHEND, { evt: evt, target: this, currentTarget: this });
        if (Konva.listenClickTap) {
          this._fire(TAP, { evt: evt, target: this, currentTarget: this });
        }
        if (fireDblClick) {
          this._fire(DBL_TAP, {
            evt: evt,
            target: this,
            currentTarget: this
          });
        }
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
    },
    _touchmove: function(evt) {
      this._setPointerPosition(evt);
      var dd = Konva.DD,
        shape;
      if (!Konva.isDragging()) {
        shape = this.getIntersection(this.getPointerPosition());
        if (shape && shape.isListening()) {
          shape._fireAndBubble(TOUCHMOVE, { evt: evt });
          // only call preventDefault if the shape is listening for events
          if (shape.isListening() && shape.preventDefault() && evt.cancelable) {
            evt.preventDefault();
          }
        } else {
          this._fire(TOUCHMOVE, {
            evt: evt,
            target: this,
            currentTarget: this
          });
        }
        this._fire(CONTENT_TOUCHMOVE, { evt: evt });
      }
      if (dd) {
        if (
          Konva.isDragging() &&
          Konva.DD.node.preventDefault() &&
          evt.cancelable
        ) {
          evt.preventDefault();
        }
      }
    },
    _wheel: function(evt) {
      this._setPointerPosition(evt);
      var shape = this.getIntersection(this.getPointerPosition());

      if (shape && shape.isListening()) {
        shape._fireAndBubble(WHEEL, { evt: evt });
      } else {
        this._fire(WHEEL, {
          evt: evt,
          target: this,
          currentTarget: this
        });
      }
      this._fire(CONTENT_WHEEL, { evt: evt });
    },
    _setPointerPosition: function(evt) {
      var contentPosition = this._getContentPosition(),
        x = null,
        y = null;
      evt = evt ? evt : window.event;

      // touch events
      if (evt.touches !== undefined) {
        // currently, only handle one finger
        if (evt.touches.length > 0) {
          var touch = evt.touches[0];
          // get the information for finger #1
          x = touch.clientX - contentPosition.left;
          y = touch.clientY - contentPosition.top;
        }
      } else {
        // mouse events
        x = evt.clientX - contentPosition.left;
        y = evt.clientY - contentPosition.top;
      }
      if (x !== null && y !== null) {
        this.pointerPos = {
          x: x,
          y: y
        };
      }
    },
    _getContentPosition: function() {
      var rect = this.content.getBoundingClientRect
        ? this.content.getBoundingClientRect()
        : { top: 0, left: 0 };
      return {
        top: rect.top,
        left: rect.left
      };
    },
    _buildDOM: function() {
      // the buffer canvas pixel ratio must be 1 because it is used as an
      // intermediate canvas before copying the result onto a scene canvas.
      // not setting it to 1 will result in an over compensation
      this.bufferCanvas = new Konva.SceneCanvas();
      this.bufferHitCanvas = new Konva.HitCanvas({ pixelRatio: 1 });

      if (!Konva.isBrowser) {
        return;
      }
      var container = this.getContainer();
      if (!container) {
        throw 'Stage has no container. A container is required.';
      }
      // clear content inside container
      container.innerHTML = EMPTY_STRING;

      // content
      this.content = Konva.document.createElement(DIV);
      this.content.style.position = RELATIVE;
      this.content.style.userSelect = 'none';
      this.content.className = KONVA_CONTENT;

      this.content.setAttribute('role', 'presentation');

      container.appendChild(this.content);

      this._resizeDOM();
    },
    _onContent: function(typesStr, handler) {
      var types = typesStr.split(SPACE),
        len = types.length,
        n,
        baseEvent;

      for (n = 0; n < len; n++) {
        baseEvent = types[n];
        this.content.addEventListener(baseEvent, handler, false);
      }
    },
    // currently cache function is now working for stage, because stage has no its own canvas element
    // TODO: may be it is better to cache all children layers?
    cache: function() {
      Konva.Util.warn(
        'Cache function is not allowed for stage. You may use cache only for layers, groups and shapes.'
      );
    },
    clearCache: function() {}
  });
  Konva.Util.extend(Konva.Stage, Konva.Container);

  // add getters and setters
  Konva.Factory.addGetter(Konva.Stage, 'container');
  Konva.Factory.addOverloadedGetterSetter(Konva.Stage, 'container');

  /**
   * get container DOM element
   * @name container
   * @method
   * @memberof Konva.Stage.prototype
   * @returns {DomElement} container
   * @example
   * // get container
   * var container = stage.container();
   * // set container
   * var container = document.createElement('div');
   * body.appendChild(container);
   * stage.container(container);
   */
})();
