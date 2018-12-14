(function(Konva) {
  'use strict';
  // CONSTANTS
  var ABSOLUTE_OPACITY = 'absoluteOpacity',
    ABSOLUTE_TRANSFORM = 'absoluteTransform',
    ABSOLUTE_SCALE = 'absoluteScale',
    CHANGE = 'Change',
    CHILDREN = 'children',
    DOT = '.',
    EMPTY_STRING = '',
    GET = 'get',
    ID = 'id',
    KONVA = 'konva',
    LISTENING = 'listening',
    MOUSEENTER = 'mouseenter',
    MOUSELEAVE = 'mouseleave',
    NAME = 'name',
    SET = 'set',
    SHAPE = 'Shape',
    SPACE = ' ',
    STAGE = 'stage',
    TRANSFORM = 'transform',
    UPPER_STAGE = 'Stage',
    VISIBLE = 'visible',
    CLONE_BLACK_LIST = ['id'],
    TRANSFORM_CHANGE_STR = [
      'xChange.konva',
      'yChange.konva',
      'scaleXChange.konva',
      'scaleYChange.konva',
      'skewXChange.konva',
      'skewYChange.konva',
      'rotationChange.konva',
      'offsetXChange.konva',
      'offsetYChange.konva',
      'transformsEnabledChange.konva'
    ].join(SPACE),
    SCALE_CHANGE_STR = ['scaleXChange.konva', 'scaleYChange.konva'].join(SPACE);

  /**
   * Node constructor. Nodes are entities that can be transformed, layered,
   * and have bound events. The stage, layers, groups, and shapes all extend Node.
   * @constructor
   * @memberof Konva
   * @abstract
   * @param {Object} config
   * @@nodeParams
   */
  Konva.Node = function(config) {
    this._init(config);
  };

  Konva.Util.addMethods(Konva.Node, {
    _init: function(config) {
      this._id = Konva.idCounter++;
      this.eventListeners = {};
      this.attrs = {};
      this._cache = {};
      this._filterUpToDate = false;
      this._isUnderCache = false;
      this.setAttrs(config);

      // event bindings for cache handling
      this.on(TRANSFORM_CHANGE_STR, function() {
        this._clearCache(TRANSFORM);
        this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
      });

      this.on(SCALE_CHANGE_STR, function() {
        this._clearSelfAndDescendantCache(ABSOLUTE_SCALE);
      });

      this.on('visibleChange.konva', function() {
        this._clearSelfAndDescendantCache(VISIBLE);
      });
      this.on('listeningChange.konva', function() {
        this._clearSelfAndDescendantCache(LISTENING);
      });
      this.on('opacityChange.konva', function() {
        this._clearSelfAndDescendantCache(ABSOLUTE_OPACITY);
      });
    },
    _clearCache: function(attr) {
      if (attr) {
        delete this._cache[attr];
      } else {
        this._cache = {};
      }
    },
    _getCache: function(attr, privateGetter) {
      var cache = this._cache[attr];

      // if not cached, we need to set it using the private getter method.
      if (cache === undefined) {
        this._cache[attr] = privateGetter.call(this);
      }

      return this._cache[attr];
    },
    /*
     * when the logic for a cached result depends on ancestor propagation, use this
     * method to clear self and children cache
     */
    _clearSelfAndDescendantCache: function(attr) {
      this._clearCache(attr);

      // skip clearing of node is cached with canvas
      if (this._cache.canvas) {
        return;
      }
      if (this.children) {
        this.getChildren().each(function(node) {
          node._clearSelfAndDescendantCache(attr);
        });
      }
    },
    /**
     * clear cached canvas
     * @method
     * @memberof Konva.Node.prototype
     * @returns {Konva.Node}
     * @example
     * node.clearCache();
     */
    clearCache: function() {
      delete this._cache.canvas;
      this._filterUpToDate = false;
      this._clearSelfAndDescendantCache();
      return this;
    },
    /**
     *  cache node to improve drawing performance, apply filters, or create more accurate
     *  hit regions. For all basic shapes size of cache canvas will be automatically detected.
     *  If you need to cache your custom `Konva.Shape` instance you have to pass shape's bounding box
     *  properties. Look at [https://konvajs.github.io/docs/performance/Shape_Caching.html](link to demo page) for more information.
     * @method
     * @memberof Konva.Node.prototype
     * @param {Object} [config]
     * @param {Number} [config.x]
     * @param {Number} [config.y]
     * @param {Number} [config.width]
     * @param {Number} [config.height]
     * @param {Number} [config.offset]  increase canvas size by `offset` pixel in all directions.
     * @param {Boolean} [config.drawBorder] when set to true, a red border will be drawn around the cached
     *  region for debugging purposes
     * @param {Number} [config.pixelRatio] change quality (or pixel ratio) of cached image. pixelRatio = 2 will produce 2x sized cache.
     * @returns {Konva.Node}
     * @example
     * // cache a shape with the x,y position of the bounding box at the center and
     * // the width and height of the bounding box equal to the width and height of
     * // the shape obtained from shape.width() and shape.height()
     * image.cache();
     *
     * // cache a node and define the bounding box position and size
     * node.cache({
     *   x: -30,
     *   y: -30,
     *   width: 100,
     *   height: 200
     * });
     *
     * // cache a node and draw a red border around the bounding box
     * // for debugging purposes
     * node.cache({
     *   x: -30,
     *   y: -30,
     *   width: 100,
     *   height: 200,
     *   offset : 10,
     *   drawBorder: true
     * });
     */
    cache: function(config) {
      var conf = config || {};
      var rect = {};

      // don't call getClientRect if we have all attributes
      // it means call it only if have one undefined
      if (
        conf.x === undefined ||
        conf.y === undefined ||
        conf.width === undefined ||
        conf.height === undefined
      ) {
        rect = this.getClientRect({
          skipTransform: true,
          relativeTo: this.getParent()
        });
      }
      var width = conf.width || rect.width,
        height = conf.height || rect.height,
        pixelRatio = conf.pixelRatio,
        x = conf.x === undefined ? rect.x : conf.x,
        y = conf.y === undefined ? rect.y : conf.y,
        offset = conf.offset || 0,
        drawBorder = conf.drawBorder || false;

      if (!width || !height) {
        Konva.Util.error(
          'Can not cache the node. Width or height of the node equals 0. Caching is skipped.'
        );
        return;
      }

      width += offset * 2;
      height += offset * 2;

      x -= offset;
      y -= offset;

      var cachedSceneCanvas = new Konva.SceneCanvas({
          pixelRatio: pixelRatio,
          width: width,
          height: height
        }),
        cachedFilterCanvas = new Konva.SceneCanvas({
          pixelRatio: pixelRatio,
          width: width,
          height: height
        }),
        cachedHitCanvas = new Konva.HitCanvas({
          pixelRatio: 1,
          width: width,
          height: height
        }),
        sceneContext = cachedSceneCanvas.getContext(),
        hitContext = cachedHitCanvas.getContext();

      cachedHitCanvas.isCache = true;

      this.clearCache();

      sceneContext.save();
      hitContext.save();

      sceneContext.translate(-x, -y);
      hitContext.translate(-x, -y);

      // extra flag to skip on getAbsolute opacity calc
      this._isUnderCache = true;
      this._clearSelfAndDescendantCache(ABSOLUTE_OPACITY);
      this._clearSelfAndDescendantCache(ABSOLUTE_SCALE);

      this.drawScene(cachedSceneCanvas, this, true);
      this.drawHit(cachedHitCanvas, this, true);
      this._isUnderCache = false;

      sceneContext.restore();
      hitContext.restore();

      // this will draw a red border around the cached box for
      // debugging purposes
      if (drawBorder) {
        sceneContext.save();
        sceneContext.beginPath();
        sceneContext.rect(0, 0, width, height);
        sceneContext.closePath();
        sceneContext.setAttr('strokeStyle', 'red');
        sceneContext.setAttr('lineWidth', 5);
        sceneContext.stroke();
        sceneContext.restore();
      }

      this._cache.canvas = {
        scene: cachedSceneCanvas,
        filter: cachedFilterCanvas,
        hit: cachedHitCanvas,
        x: x,
        y: y
      };

      return this;
    },
    /**
     * Return client rectangle {x, y, width, height} of node. This rectangle also include all styling (strokes, shadows, etc).
     * The rectangle position is relative to parent container.
     * The purpose of the method is similar to getBoundingClientRect API of the DOM.
     * @method
     * @memberof Konva.Node.prototype
     * @param {Object} config
     * @param {Boolean} [config.skipTransform] should we apply transform to node for calculating rect?
     * @param {Boolean} [config.skipShadow] should we apply shadow to the node for calculating bound box?
     * @param {Boolean} [config.skipStroke] should we apply stroke to the node for calculating bound box?
     * @param {Object} [config.relativeTo] calculate client rect relative to one of the parents
     * @returns {Object} rect with {x, y, width, height} properties
     * @example
     * var rect = new Konva.Rect({
     *      width : 100,
     *      height : 100,
     *      x : 50,
     *      y : 50,
     *      strokeWidth : 4,
     *      stroke : 'black',
     *      offsetX : 50,
     *      scaleY : 2
     * });
     *
     * // get client rect without think off transformations (position, rotation, scale, offset, etc)
     * rect.getClientRect({ skipTransform: true});
     * // returns {
     * //     x : -2,   // two pixels for stroke / 2
     * //     y : -2,
     * //     width : 104, // increased by 4 for stroke
     * //     height : 104
     * //}
     *
     * // get client rect with transformation applied
     * rect.getClientRect();
     * // returns Object {x: -2, y: 46, width: 104, height: 208}
     */
    getClientRect: function() {
      // abstract method
      // redefine in Container and Shape
      throw new Error('abstract "getClientRect" method call');
    },
    _transformedRect: function(rect, top) {
      var points = [
        { x: rect.x, y: rect.y },
        { x: rect.x + rect.width, y: rect.y },
        { x: rect.x + rect.width, y: rect.y + rect.height },
        { x: rect.x, y: rect.y + rect.height }
      ];
      var minX, minY, maxX, maxY;
      var trans = this.getAbsoluteTransform(top);
      points.forEach(function(point) {
        var transformed = trans.point(point);
        if (minX === undefined) {
          minX = maxX = transformed.x;
          minY = maxY = transformed.y;
        }
        minX = Math.min(minX, transformed.x);
        minY = Math.min(minY, transformed.y);
        maxX = Math.max(maxX, transformed.x);
        maxY = Math.max(maxY, transformed.y);
      });
      return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      };
    },
    _drawCachedSceneCanvas: function(context) {
      context.save();
      context._applyOpacity(this);
      context._applyGlobalCompositeOperation(this);
      context.translate(this._cache.canvas.x, this._cache.canvas.y);

      var cacheCanvas = this._getCachedSceneCanvas();
      var ratio = cacheCanvas.pixelRatio;

      context.drawImage(
        cacheCanvas._canvas,
        0,
        0,
        cacheCanvas.width / ratio,
        cacheCanvas.height / ratio
      );
      context.restore();
    },
    _drawCachedHitCanvas: function(context) {
      var cachedCanvas = this._cache.canvas,
        hitCanvas = cachedCanvas.hit;
      context.save();
      context.translate(this._cache.canvas.x, this._cache.canvas.y);
      context.drawImage(hitCanvas._canvas, 0, 0);
      context.restore();
    },
    _getCachedSceneCanvas: function() {
      var filters = this.filters(),
        cachedCanvas = this._cache.canvas,
        sceneCanvas = cachedCanvas.scene,
        filterCanvas = cachedCanvas.filter,
        filterContext = filterCanvas.getContext(),
        len,
        imageData,
        n,
        filter;

      if (filters) {
        if (!this._filterUpToDate) {
          var ratio = sceneCanvas.pixelRatio;

          try {
            len = filters.length;
            filterContext.clear();

            // copy cached canvas onto filter context
            filterContext.drawImage(
              sceneCanvas._canvas,
              0,
              0,
              sceneCanvas.getWidth() / ratio,
              sceneCanvas.getHeight() / ratio
            );
            imageData = filterContext.getImageData(
              0,
              0,
              filterCanvas.getWidth(),
              filterCanvas.getHeight()
            );

            // apply filters to filter context
            for (n = 0; n < len; n++) {
              filter = filters[n];
              if (typeof filter !== 'function') {
                Konva.Util.error(
                  'Filter should be type of function, but got ' +
                    typeof filter +
                    ' insted. Please check correct filters'
                );
                continue;
              }
              filter.call(this, imageData);
              filterContext.putImageData(imageData, 0, 0);
            }
          } catch (e) {
            Konva.Util.error('Unable to apply filter. ' + e.message);
          }

          this._filterUpToDate = true;
        }

        return filterCanvas;
      }
      return sceneCanvas;
    },
    /**
     * bind events to the node. KonvaJS supports mouseover, mousemove,
     *  mouseout, mouseenter, mouseleave, mousedown, mouseup, wheel, contextmenu, click, dblclick, touchstart, touchmove,
     *  touchend, tap, dbltap, dragstart, dragmove, and dragend events. The Konva Stage supports
     *  contentMouseover, contentMousemove, contentMouseout, contentMousedown, contentMouseup, contentWheel, contentContextmenu
     *  contentClick, contentDblclick, contentTouchstart, contentTouchmove, contentTouchend, contentTap,
     *  and contentDblTap.  Pass in a string of events delimited by a space to bind multiple events at once
     *  such as 'mousedown mouseup mousemove'. Include a namespace to bind an
     *  event by name such as 'click.foobar'.
     * @method
     * @memberof Konva.Node.prototype
     * @param {String} evtStr e.g. 'click', 'mousedown touchstart', 'mousedown.foo touchstart.foo'
     * @param {Function} handler The handler function is passed an event object
     * @returns {Konva.Node}
     * @example
     * // add click listener
     * node.on('click', function() {
     *   console.log('you clicked me!');
     * });
     *
     * // get the target node
     * node.on('click', function(evt) {
     *   console.log(evt.target);
     * });
     *
     * // stop event propagation
     * node.on('click', function(evt) {
     *   evt.cancelBubble = true;
     * });
     *
     * // bind multiple listeners
     * node.on('click touchstart', function() {
     *   console.log('you clicked/touched me!');
     * });
     *
     * // namespace listener
     * node.on('click.foo', function() {
     *   console.log('you clicked/touched me!');
     * });
     *
     * // get the event type
     * node.on('click tap', function(evt) {
     *   var eventType = evt.type;
     * });
     *
     * // get native event object
     * node.on('click tap', function(evt) {
     *   var nativeEvent = evt.evt;
     * });
     *
     * // for change events, get the old and new val
     * node.on('xChange', function(evt) {
     *   var oldVal = evt.oldVal;
     *   var newVal = evt.newVal;
     * });
     *
     * // get event targets
     * // with event delegations
     * layer.on('click', 'Group', function(evt) {
     *   var shape = evt.target;
     *   var group = evtn.currentTarger;
     * });
     */
    on: function(evtStr, handler) {
      if (arguments.length === 3) {
        return this._delegate.apply(this, arguments);
      }
      var events = evtStr.split(SPACE),
        len = events.length,
        n,
        event,
        parts,
        baseEvent,
        name;

      /*
       * loop through types and attach event listeners to
       * each one.  eg. 'click mouseover.namespace mouseout'
       * will create three event bindings
       */
      for (n = 0; n < len; n++) {
        event = events[n];
        parts = event.split(DOT);
        baseEvent = parts[0];
        name = parts[1] || EMPTY_STRING;

        // create events array if it doesn't exist
        if (!this.eventListeners[baseEvent]) {
          this.eventListeners[baseEvent] = [];
        }

        this.eventListeners[baseEvent].push({
          name: name,
          handler: handler
        });
      }

      return this;
    },
    /**
     * remove event bindings from the node. Pass in a string of
     *  event types delimmited by a space to remove multiple event
     *  bindings at once such as 'mousedown mouseup mousemove'.
     *  include a namespace to remove an event binding by name
     *  such as 'click.foobar'. If you only give a name like '.foobar',
     *  all events in that namespace will be removed.
     * @method
     * @memberof Konva.Node.prototype
     * @param {String} evtStr e.g. 'click', 'mousedown touchstart', '.foobar'
     * @returns {Konva.Node}
     * @example
     * // remove listener
     * node.off('click');
     *
     * // remove multiple listeners
     * node.off('click touchstart');
     *
     * // remove listener by name
     * node.off('click.foo');
     */
    off: function(evtStr, callback) {
      var events = (evtStr || '').split(SPACE),
        len = events.length,
        n,
        t,
        event,
        parts,
        baseEvent,
        name;

      if (!evtStr) {
        // remove all events
        for (t in this.eventListeners) {
          this._off(t);
        }
      }
      for (n = 0; n < len; n++) {
        event = events[n];
        parts = event.split(DOT);
        baseEvent = parts[0];
        name = parts[1];

        if (baseEvent) {
          if (this.eventListeners[baseEvent]) {
            this._off(baseEvent, name, callback);
          }
        } else {
          for (t in this.eventListeners) {
            this._off(t, name, callback);
          }
        }
      }
      return this;
    },
    // some event aliases for third party integration like HammerJS
    dispatchEvent: function(evt) {
      var e = {
        target: this,
        type: evt.type,
        evt: evt
      };
      this.fire(evt.type, e);
      return this;
    },
    addEventListener: function(type, handler) {
      // we have to pass native event to handler
      this.on(type, function(evt) {
        handler.call(this, evt.evt);
      });
      return this;
    },
    removeEventListener: function(type) {
      this.off(type);
      return this;
    },
    // like node.on
    _delegate: function(event, selector, handler) {
      var stopNode = this;
      this.on(event, function(evt) {
        var targets = evt.target.findAncestors(selector, true, stopNode);
        for (var i = 0; i < targets.length; i++) {
          evt = Konva.Util.cloneObject(evt);
          evt.currentTarget = targets[i];
          handler.call(targets[i], evt);
        }
      });
    },
    /**
     * remove self from parent, but don't destroy. You can reuse node later.
     * @method
     * @memberof Konva.Node.prototype
     * @returns {Konva.Node}
     * @example
     * node.remove();
     */
    remove: function() {
      var parent = this.getParent();

      if (parent && parent.children) {
        parent.children.splice(this.index, 1);
        parent._setChildrenIndices();
        delete this.parent;
      }

      // every cached attr that is calculated via node tree
      // traversal must be cleared when removing a node
      this._clearSelfAndDescendantCache(STAGE);
      this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
      this._clearSelfAndDescendantCache(VISIBLE);
      this._clearSelfAndDescendantCache(LISTENING);
      this._clearSelfAndDescendantCache(ABSOLUTE_OPACITY);

      return this;
    },
    /**
     * remove and destroy a node. Kill it and delete forever! You should not reuse node after destroy().
     * @method
     * @memberof Konva.Node.prototype
     * @example
     * node.destroy();
     */
    destroy: function() {
      // remove from ids and names hashes
      Konva._removeId(this.getId());

      // remove all names
      var names = (this.getName() || '').split(/\s/g);
      for (var i = 0; i < names.length; i++) {
        var subname = names[i];
        Konva._removeName(subname, this._id);
      }

      this.remove();
      return this;
    },
    /**
     * get attr
     * @method
     * @memberof Konva.Node.prototype
     * @param {String} attr
     * @returns {Integer|String|Object|Array}
     * @example
     * var x = node.getAttr('x');
     */
    getAttr: function(attr) {
      var method = GET + Konva.Util._capitalize(attr);
      if (Konva.Util._isFunction(this[method])) {
        return this[method]();
      }
      // otherwise get directly
      return this.attrs[attr];
    },
    /**
     * get ancestors
     * @method
     * @memberof Konva.Node.prototype
     * @returns {Konva.Collection}
     * @example
     * shape.getAncestors().each(function(node) {
     *   console.log(node.getId());
     * })
     */
    getAncestors: function() {
      var parent = this.getParent(),
        ancestors = new Konva.Collection();

      while (parent) {
        ancestors.push(parent);
        parent = parent.getParent();
      }

      return ancestors;
    },
    /**
     * get attrs object literal
     * @method
     * @memberof Konva.Node.prototype
     * @returns {Object}
     */
    getAttrs: function() {
      return this.attrs || {};
    },
    /**
     * set multiple attrs at once using an object literal
     * @method
     * @memberof Konva.Node.prototype
     * @param {Object} config object containing key value pairs
     * @returns {Konva.Node}
     * @example
     * node.setAttrs({
     *   x: 5,
     *   fill: 'red'
     * });
     */
    setAttrs: function(config) {
      var key, method;

      if (!config) {
        return this;
      }
      for (key in config) {
        if (key === CHILDREN) {
          continue;
        }
        method = SET + Konva.Util._capitalize(key);
        // use setter if available
        if (Konva.Util._isFunction(this[method])) {
          this[method](config[key]);
        } else {
          // otherwise set directly
          this._setAttr(key, config[key]);
        }
      }
      return this;
    },
    /**
     * determine if node is listening for events by taking into account ancestors.
     *
     * Parent    | Self      | isListening
     * listening | listening |
     * ----------+-----------+------------
     * T         | T         | T
     * T         | F         | F
     * F         | T         | T
     * F         | F         | F
     * ----------+-----------+------------
     * T         | I         | T
     * F         | I         | F
     * I         | I         | T
     *
     * @method
     * @memberof Konva.Node.prototype
     * @returns {Boolean}
     */
    isListening: function() {
      return this._getCache(LISTENING, this._isListening);
    },
    _isListening: function() {
      var listening = this.getListening(),
        parent = this.getParent();

      // the following conditions are a simplification of the truth table above.
      // please modify carefully
      if (listening === 'inherit') {
        if (parent) {
          return parent.isListening();
        } else {
          return true;
        }
      } else {
        return listening;
      }
    },
    /**
     * determine if node is visible by taking into account ancestors.
     *
     * Parent    | Self      | isVisible
     * visible   | visible   |
     * ----------+-----------+------------
     * T         | T         | T
     * T         | F         | F
     * F         | T         | T
     * F         | F         | F
     * ----------+-----------+------------
     * T         | I         | T
     * F         | I         | F
     * I         | I         | T

      * @method
      * @memberof Konva.Node.prototype
      * @returns {Boolean}
      */
    isVisible: function() {
      return this._getCache(VISIBLE, this._isVisible);
    },
    _isVisible: function(relativeTo) {
      var visible = this.getVisible(),
        parent = this.getParent();

      if (relativeTo === parent && visible === 'inherit') {
        return true;
      } else if (relativeTo === parent) {
        return visible;
      }
      // the following conditions are a simplification of the truth table above.
      // please modify carefully
      if (visible === 'inherit') {
        if (parent) {
          return parent._isVisible(relativeTo);
        } else {
          return true;
        }
      } else {
        return visible;
      }
    },
    /**
     * determine if listening is enabled by taking into account descendants.  If self or any children
     * have _isListeningEnabled set to true, then self also has listening enabled.
     * @method
     * @memberof Konva.Node.prototype
     * @returns {Boolean}
     */
    shouldDrawHit: function() {
      var layer = this.getLayer();

      return (
        (!layer && this.isListening() && this.isVisible()) ||
        (layer &&
          layer.hitGraphEnabled() &&
          this.isListening() &&
          this.isVisible())
      );
    },
    /**
     * show node
     * @method
     * @memberof Konva.Node.prototype
     * @returns {Konva.Node}
     */
    show: function() {
      this.setVisible(true);
      return this;
    },
    /**
     * hide node.  Hidden nodes are no longer detectable
     * @method
     * @memberof Konva.Node.prototype
     * @returns {Konva.Node}
     */
    hide: function() {
      this.setVisible(false);
      return this;
    },
    /**
     * get zIndex relative to the node's siblings who share the same parent
     * @method
     * @memberof Konva.Node.prototype
     * @returns {Integer}
     */
    getZIndex: function() {
      return this.index || 0;
    },
    /**
     * get absolute z-index which takes into account sibling
     *  and ancestor indices
     * @method
     * @memberof Konva.Node.prototype
     * @returns {Integer}
     */
    getAbsoluteZIndex: function() {
      var depth = this.getDepth(),
        that = this,
        index = 0,
        nodes,
        len,
        n,
        child;

      function addChildren(children) {
        nodes = [];
        len = children.length;
        for (n = 0; n < len; n++) {
          child = children[n];
          index++;

          if (child.nodeType !== SHAPE) {
            nodes = nodes.concat(child.getChildren().toArray());
          }

          if (child._id === that._id) {
            n = len;
          }
        }

        if (nodes.length > 0 && nodes[0].getDepth() <= depth) {
          addChildren(nodes);
        }
      }
      if (that.nodeType !== UPPER_STAGE) {
        addChildren(that.getStage().getChildren());
      }

      return index;
    },
    /**
     * get node depth in node tree.  Returns an integer.
     *  e.g. Stage depth will always be 0.  Layers will always be 1.  Groups and Shapes will always
     *  be >= 2
     * @method
     * @memberof Konva.Node.prototype
     * @returns {Integer}
     */
    getDepth: function() {
      var depth = 0,
        parent = this.parent;

      while (parent) {
        depth++;
        parent = parent.parent;
      }
      return depth;
    },
    setPosition: function(pos) {
      this.setX(pos.x);
      this.setY(pos.y);
      return this;
    },
    getPosition: function() {
      return {
        x: this.getX(),
        y: this.getY()
      };
    },
    /**
     * get absolute position relative to the top left corner of the stage container div
     * or relative to passed node
     * @method
     * @param {Object} [top] optional parent node
     * @memberof Konva.Node.prototype
     * @returns {Object}
     */
    getAbsolutePosition: function(top) {
      var absoluteMatrix = this.getAbsoluteTransform(top).getMatrix(),
        absoluteTransform = new Konva.Transform(),
        offset = this.offset();

      // clone the matrix array
      absoluteTransform.m = absoluteMatrix.slice();
      absoluteTransform.translate(offset.x, offset.y);

      return absoluteTransform.getTranslation();
    },
    /**
     * set absolute position
     * @method
     * @memberof Konva.Node.prototype
     * @param {Object} pos
     * @param {Number} pos.x
     * @param {Number} pos.y
     * @returns {Konva.Node}
     */
    setAbsolutePosition: function(pos) {
      var origTrans = this._clearTransform(),
        it;

      // don't clear translation
      this.attrs.x = origTrans.x;
      this.attrs.y = origTrans.y;
      delete origTrans.x;
      delete origTrans.y;

      // unravel transform
      it = this.getAbsoluteTransform();

      it.invert();
      it.translate(pos.x, pos.y);
      pos = {
        x: this.attrs.x + it.getTranslation().x,
        y: this.attrs.y + it.getTranslation().y
      };

      this.setPosition({ x: pos.x, y: pos.y });
      this._setTransform(origTrans);

      return this;
    },
    _setTransform: function(trans) {
      var key;

      for (key in trans) {
        this.attrs[key] = trans[key];
      }

      this._clearCache(TRANSFORM);
      this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
    },
    _clearTransform: function() {
      var trans = {
        x: this.getX(),
        y: this.getY(),
        rotation: this.getRotation(),
        scaleX: this.getScaleX(),
        scaleY: this.getScaleY(),
        offsetX: this.getOffsetX(),
        offsetY: this.getOffsetY(),
        skewX: this.getSkewX(),
        skewY: this.getSkewY()
      };

      this.attrs.x = 0;
      this.attrs.y = 0;
      this.attrs.rotation = 0;
      this.attrs.scaleX = 1;
      this.attrs.scaleY = 1;
      this.attrs.offsetX = 0;
      this.attrs.offsetY = 0;
      this.attrs.skewX = 0;
      this.attrs.skewY = 0;

      this._clearCache(TRANSFORM);
      this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);

      // return original transform
      return trans;
    },
    /**
     * move node by an amount relative to its current position
     * @method
     * @memberof Konva.Node.prototype
     * @param {Object} change
     * @param {Number} change.x
     * @param {Number} change.y
     * @returns {Konva.Node}
     * @example
     * // move node in x direction by 1px and y direction by 2px
     * node.move({
     *   x: 1,
     *   y: 2)
     * });
     */
    move: function(change) {
      var changeX = change.x,
        changeY = change.y,
        x = this.getX(),
        y = this.getY();

      if (changeX !== undefined) {
        x += changeX;
      }

      if (changeY !== undefined) {
        y += changeY;
      }

      this.setPosition({ x: x, y: y });
      return this;
    },
    _eachAncestorReverse: function(func, top) {
      var family = [],
        parent = this.getParent(),
        len,
        n;

      // if top node is defined, and this node is top node,
      // there's no need to build a family tree.  just execute
      // func with this because it will be the only node
      if (top && top._id === this._id) {
        func(this);
        return;
      }

      family.unshift(this);

      while (parent && (!top || parent._id !== top._id)) {
        family.unshift(parent);
        parent = parent.parent;
      }

      len = family.length;
      for (n = 0; n < len; n++) {
        func(family[n]);
      }
    },
    /**
     * rotate node by an amount in degrees relative to its current rotation
     * @method
     * @memberof Konva.Node.prototype
     * @param {Number} theta
     * @returns {Konva.Node}
     */
    rotate: function(theta) {
      this.setRotation(this.getRotation() + theta);
      return this;
    },
    /**
     * move node to the top of its siblings
     * @method
     * @memberof Konva.Node.prototype
     * @returns {Boolean}
     */
    moveToTop: function() {
      if (!this.parent) {
        Konva.Util.warn('Node has no parent. moveToTop function is ignored.');
        return false;
      }
      var index = this.index;
      this.parent.children.splice(index, 1);
      this.parent.children.push(this);
      this.parent._setChildrenIndices();
      return true;
    },
    /**
     * move node up
     * @method
     * @memberof Konva.Node.prototype
     * @returns {Boolean} flag is moved or not
     */
    moveUp: function() {
      if (!this.parent) {
        Konva.Util.warn('Node has no parent. moveUp function is ignored.');
        return false;
      }
      var index = this.index,
        len = this.parent.getChildren().length;
      if (index < len - 1) {
        this.parent.children.splice(index, 1);
        this.parent.children.splice(index + 1, 0, this);
        this.parent._setChildrenIndices();
        return true;
      }
      return false;
    },
    /**
     * move node down
     * @method
     * @memberof Konva.Node.prototype
     * @returns {Boolean}
     */
    moveDown: function() {
      if (!this.parent) {
        Konva.Util.warn('Node has no parent. moveDown function is ignored.');
        return false;
      }
      var index = this.index;
      if (index > 0) {
        this.parent.children.splice(index, 1);
        this.parent.children.splice(index - 1, 0, this);
        this.parent._setChildrenIndices();
        return true;
      }
      return false;
    },
    /**
     * move node to the bottom of its siblings
     * @method
     * @memberof Konva.Node.prototype
     * @returns {Boolean}
     */
    moveToBottom: function() {
      if (!this.parent) {
        Konva.Util.warn(
          'Node has no parent. moveToBottom function is ignored.'
        );
        return false;
      }
      var index = this.index;
      if (index > 0) {
        this.parent.children.splice(index, 1);
        this.parent.children.unshift(this);
        this.parent._setChildrenIndices();
        return true;
      }
      return false;
    },
    /**
     * set zIndex relative to siblings
     * @method
     * @memberof Konva.Node.prototype
     * @param {Integer} zIndex
     * @returns {Konva.Node}
     */
    setZIndex: function(zIndex) {
      if (!this.parent) {
        Konva.Util.warn('Node has no parent. zIndex parameter is ignored.');
        return false;
      }
      var index = this.index;
      this.parent.children.splice(index, 1);
      this.parent.children.splice(zIndex, 0, this);
      this.parent._setChildrenIndices();
      return this;
    },
    /**
     * get absolute opacity
     * @method
     * @memberof Konva.Node.prototype
     * @returns {Number}
     */
    getAbsoluteOpacity: function() {
      return this._getCache(ABSOLUTE_OPACITY, this._getAbsoluteOpacity);
    },
    _getAbsoluteOpacity: function() {
      var absOpacity = this.getOpacity();
      var parent = this.getParent();
      if (parent && !parent._isUnderCache) {
        absOpacity *= this.getParent().getAbsoluteOpacity();
      }
      return absOpacity;
    },
    /**
     * move node to another container
     * @method
     * @memberof Konva.Node.prototype
     * @param {Container} newContainer
     * @returns {Konva.Node}
     * @example
     * // move node from current layer into layer2
     * node.moveTo(layer2);
     */
    moveTo: function(newContainer) {
      // do nothing if new container is already parent
      if (this.getParent() !== newContainer) {
        // this.remove my be overrided by drag and drop
        // buy we need original
        (this.__originalRemove || this.remove).call(this);
        newContainer.add(this);
      }
      return this;
    },
    /**
     * convert Node into an object for serialization.  Returns an object.
     * @method
     * @memberof Konva.Node.prototype
     * @returns {Object}
     */
    toObject: function() {
      var obj = {},
        attrs = this.getAttrs(),
        key,
        val,
        getter,
        defaultValue;

      obj.attrs = {};

      for (key in attrs) {
        val = attrs[key];
        getter = typeof this[key] === 'function' && this[key];
        // remove attr value so that we can extract the default value from the getter
        delete attrs[key];
        defaultValue = getter ? getter.call(this) : null;
        // restore attr value
        attrs[key] = val;
        if (defaultValue !== val) {
          obj.attrs[key] = val;
        }
      }

      obj.className = this.getClassName();
      return Konva.Util._prepareToStringify(obj);
    },
    /**
     * convert Node into a JSON string.  Returns a JSON string.
     * @method
     * @memberof Konva.Node.prototype
     * @returns {String}}
     */
    toJSON: function() {
      return JSON.stringify(this.toObject());
    },
    /**
     * get parent container
     * @method
     * @memberof Konva.Node.prototype
     * @returns {Konva.Node}
     */
    getParent: function() {
      return this.parent;
    },
    /**
     * get all ancestros (parent then parent of the parent, etc) of the node
     * @method
     * @memberof Konva.Node.prototype
     * @param {String} [selector] selector for search
     * @param {Boolean} [includeSelf] show we think that node is ancestro itself?
     * @param {Konva.Node} [stopNode] optional node where we need to stop searching (one of ancestors)
     * @returns {Array} [ancestors]
     * @example
     * // get one of the parent group
     * var parentGroups = node.findAncestors('Group');
     */
    findAncestors: function(selector, includeSelf, stopNode) {
      var res = [];

      if (includeSelf && this._isMatch(selector)) {
        res.push(this);
      }
      var ancestor = this.parent;
      while (ancestor) {
        if (ancestor === stopNode) {
          return res;
        }
        if (ancestor._isMatch(selector)) {
          res.push(ancestor);
        }
        ancestor = ancestor.parent;
      }
      return res;
    },
    /**
     * get ancestor (parent or parent of the parent, etc) of the node that match passed selector
     * @method
     * @memberof Konva.Node.prototype
     * @param {String} [selector] selector for search
     * @param {Boolean} [includeSelf] show we think that node is ancestro itself?
     * @param {Konva.Node} [stopNode] optional node where we need to stop searching (one of ancestors)
     * @returns {Konva.Node} ancestor
     * @example
     * // get one of the parent group
     * var group = node.findAncestors('.mygroup');
     */
    findAncestor: function(selector, includeSelf, stopNode) {
      return this.findAncestors(selector, includeSelf, stopNode)[0];
    },
    // is current node match passed selector?
    _isMatch: function(selector) {
      if (!selector) {
        return false;
      }
      var selectorArr = selector.replace(/ /g, '').split(','),
        len = selectorArr.length,
        n,
        sel;

      for (n = 0; n < len; n++) {
        sel = selectorArr[n];
        if (!Konva.Util.isValidSelector(sel)) {
          Konva.Util.warn(
            'Selector "' +
              sel +
              '" is invalid. Allowed selectors examples are "#foo", ".bar" or "Group".'
          );
          Konva.Util.warn(
            'If you have a custom shape with such className, please change it to start with upper letter like "Triangle".'
          );
          Konva.Util.warn('Konva is awesome, right?');
        }
        // id selector
        if (sel.charAt(0) === '#') {
          if (this.id() === sel.slice(1)) {
            return true;
          }
        } else if (sel.charAt(0) === '.') {
          // name selector
          if (this.hasName(sel.slice(1))) {
            return true;
          }
        } else if (this._get(sel).length !== 0) {
          return true;
        }
      }
      return false;
    },
    /**
     * get layer ancestor
     * @method
     * @memberof Konva.Node.prototype
     * @returns {Konva.Layer}
     */
    getLayer: function() {
      var parent = this.getParent();
      return parent ? parent.getLayer() : null;
    },
    /**
     * get stage ancestor
     * @method
     * @memberof Konva.Node.prototype
     * @returns {Konva.Stage}
     */
    getStage: function() {
      return this._getCache(STAGE, this._getStage);
    },
    _getStage: function() {
      var parent = this.getParent();
      if (parent) {
        return parent.getStage();
      } else {
        return undefined;
      }
    },
    /**
     * fire event
     * @method
     * @memberof Konva.Node.prototype
     * @param {String} eventType event type.  can be a regular event, like click, mouseover, or mouseout, or it can be a custom event, like myCustomEvent
     * @param {Event} [evt] event object
     * @param {Boolean} [bubble] setting the value to false, or leaving it undefined, will result in the event
     *  not bubbling.  Setting the value to true will result in the event bubbling.
     * @returns {Konva.Node}
     * @example
     * // manually fire click event
     * node.fire('click');
     *
     * // fire custom event
     * node.fire('foo');
     *
     * // fire custom event with custom event object
     * node.fire('foo', {
     *   bar: 10
     * });
     *
     * // fire click event that bubbles
     * node.fire('click', null, true);
     */
    fire: function(eventType, evt, bubble) {
      evt = evt || {};
      evt.target = evt.target || this;
      // bubble
      if (bubble) {
        this._fireAndBubble(eventType, evt);
      } else {
        // no bubble
        this._fire(eventType, evt);
      }
      return this;
    },
    /**
     * get absolute transform of the node which takes into
     *  account its ancestor transforms
     * @method
     * @memberof Konva.Node.prototype
     * @returns {Konva.Transform}
     */
    getAbsoluteTransform: function(top) {
      // if using an argument, we can't cache the result.
      if (top) {
        return this._getAbsoluteTransform(top);
      } else {
        // if no argument, we can cache the result
        return this._getCache(ABSOLUTE_TRANSFORM, this._getAbsoluteTransform);
      }
    },
    _getAbsoluteTransform: function(top) {
      var at = new Konva.Transform();

      // start with stage and traverse downwards to self
      this._eachAncestorReverse(function(node) {
        var transformsEnabled = node.transformsEnabled();

        if (transformsEnabled === 'all') {
          at.multiply(node.getTransform());
        } else if (transformsEnabled === 'position') {
          at.translate(
            node.getX() - node.getOffsetX(),
            node.getY() - node.getOffsetY()
          );
        }
      }, top);
      return at;
    },
    /**
     * get absolute scale of the node which takes into
     *  account its ancestor scales
     * @method
     * @memberof Konva.Node.prototype
     * @returns {Konva.Transform}
     */
    getAbsoluteScale: function(top) {
      // if using an argument, we can't cache the result.
      if (top) {
        return this._getAbsoluteScale(top);
      } else {
        // if no argument, we can cache the result
        return this._getCache(ABSOLUTE_SCALE, this._getAbsoluteScale);
      }
    },
    _getAbsoluteScale: function(top) {
      // this is special logic for caching with some shapes with shadow
      var parent = this;
      while (parent) {
        if (parent._isUnderCache) {
          top = parent;
        }
        parent = parent.getParent();
      }

      var scaleX = 1,
        scaleY = 1;

      // start with stage and traverse downwards to self
      this._eachAncestorReverse(function(node) {
        scaleX *= node.scaleX();
        scaleY *= node.scaleY();
      }, top);
      return {
        x: scaleX,
        y: scaleY
      };
    },
    /**
     * get transform of the node
     * @method
     * @memberof Konva.Node.prototype
     * @returns {Konva.Transform}
     */
    getTransform: function() {
      return this._getCache(TRANSFORM, this._getTransform);
    },
    _getTransform: function() {
      var m = new Konva.Transform(),
        x = this.getX(),
        y = this.getY(),
        rotation = Konva.getAngle(this.getRotation()),
        scaleX = this.getScaleX(),
        scaleY = this.getScaleY(),
        skewX = this.getSkewX(),
        skewY = this.getSkewY(),
        offsetX = this.getOffsetX(),
        offsetY = this.getOffsetY();

      if (x !== 0 || y !== 0) {
        m.translate(x, y);
      }
      if (rotation !== 0) {
        m.rotate(rotation);
      }
      if (skewX !== 0 || skewY !== 0) {
        m.skew(skewX, skewY);
      }
      if (scaleX !== 1 || scaleY !== 1) {
        m.scale(scaleX, scaleY);
      }
      if (offsetX !== 0 || offsetY !== 0) {
        m.translate(-1 * offsetX, -1 * offsetY);
      }

      return m;
    },
    /**
     * clone node.  Returns a new Node instance with identical attributes.  You can also override
     *  the node properties with an object literal, enabling you to use an existing node as a template
     *  for another node
     * @method
     * @memberof Konva.Node.prototype
     * @param {Object} obj override attrs
     * @returns {Konva.Node}
     * @example
     * // simple clone
     * var clone = node.clone();
     *
     * // clone a node and override the x position
     * var clone = rect.clone({
     *   x: 5
     * });
     */
    clone: function(obj) {
      // instantiate new node
      var attrs = Konva.Util.cloneObject(this.attrs),
        key,
        allListeners,
        len,
        n,
        listener;
      // filter black attrs
      for (var i in CLONE_BLACK_LIST) {
        var blockAttr = CLONE_BLACK_LIST[i];
        delete attrs[blockAttr];
      }
      // apply attr overrides
      for (key in obj) {
        attrs[key] = obj[key];
      }

      var node = new this.constructor(attrs);
      // copy over listeners
      for (key in this.eventListeners) {
        allListeners = this.eventListeners[key];
        len = allListeners.length;
        for (n = 0; n < len; n++) {
          listener = allListeners[n];
          /*
           * don't include konva namespaced listeners because
           *  these are generated by the constructors
           */
          if (listener.name.indexOf(KONVA) < 0) {
            // if listeners array doesn't exist, then create it
            if (!node.eventListeners[key]) {
              node.eventListeners[key] = [];
            }
            node.eventListeners[key].push(listener);
          }
        }
      }
      return node;
    },
    _toKonvaCanvas: function(config) {
      config = config || {};

      var box = this.getClientRect();

      var stage = this.getStage(),
        x = config.x !== undefined ? config.x : box.x,
        y = config.y !== undefined ? config.y : box.y,
        pixelRatio = config.pixelRatio || 1,
        canvas = new Konva.SceneCanvas({
          width: config.width || box.width || (stage ? stage.getWidth() : 0),
          height:
            config.height || box.height || (stage ? stage.getHeight() : 0),
          pixelRatio: pixelRatio
        }),
        context = canvas.getContext();

      context.save();

      if (x || y) {
        context.translate(-1 * x, -1 * y);
      }

      this.drawScene(canvas);
      context.restore();

      return canvas;
    },
    /**
     * converts node into an canvas element.
     * @method
     * @memberof Konva.Node.prototype
     * @param {Object} config
     * @param {Function} config.callback function executed when the composite has completed
     * @param {Number} [config.x] x position of canvas section
     * @param {Number} [config.y] y position of canvas section
     * @param {Number} [config.width] width of canvas section
     * @param {Number} [config.height] height of canvas section
     * @paremt {Number} [config.pixelRatio] pixelRatio of ouput image.  Default is 1.
     * @example
     * var canvas = node.toCanvas();
     */
    toCanvas: function(config) {
      return this._toKonvaCanvas(config)._canvas;
    },
    /**
     * Creates a composite data URL (base64 string). If MIME type is not
     * specified, then "image/png" will result. For "image/jpeg", specify a quality
     * level as quality (range 0.0 - 1.0)
     * @method
     * @memberof Konva.Node.prototype
     * @param {Object} config
     * @param {String} [config.mimeType] can be "image/png" or "image/jpeg".
     *  "image/png" is the default
     * @param {Number} [config.x] x position of canvas section
     * @param {Number} [config.y] y position of canvas section
     * @param {Number} [config.width] width of canvas section
     * @param {Number} [config.height] height of canvas section
     * @param {Number} [config.quality] jpeg quality.  If using an "image/jpeg" mimeType,
     *  you can specify the quality from 0 to 1, where 0 is very poor quality and 1
     *  is very high quality
     * @param {Number} [config.pixelRatio] pixelRatio of output image url. Default is 1
     * @returns {String}
     */
    toDataURL: function(config) {
      config = config || {};
      var mimeType = config.mimeType || null,
        quality = config.quality || null;
      var url = this._toKonvaCanvas(config).toDataURL(mimeType, quality);
      if (config.callback) {
        config.callback(url);
      }
      return url;
    },
    /**
     * converts node into an image.  Since the toImage
     *  method is asynchronous, a callback is required.  toImage is most commonly used
     *  to cache complex drawings as an image so that they don't have to constantly be redrawn
     * @method
     * @memberof Konva.Node.prototype
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
     * @paremt {Number} [config.pixelRatio] pixelRatio of ouput image.  Default is 1.
     * @example
     * var image = node.toImage({
     *   callback: function(img) {
     *     // do stuff with img
     *   }
     * });
     */
    toImage: function(config) {
      if (!config || !config.callback) {
        throw 'callback required for toImage method config argument';
      }
      var callback = config.callback;
      delete config.callback;
      Konva.Util._getImage(this.toDataURL(config), function(img) {
        callback(img);
      });
    },
    setSize: function(size) {
      this.setWidth(size.width);
      this.setHeight(size.height);
      return this;
    },
    getSize: function() {
      return {
        width: this.getWidth(),
        height: this.getHeight()
      };
    },
    getWidth: function() {
      return this.attrs.width || 0;
    },
    getHeight: function() {
      return this.attrs.height || 0;
    },
    /**
     * get class name, which may return Stage, Layer, Group, or shape class names like Rect, Circle, Text, etc.
     * @method
     * @memberof Konva.Node.prototype
     * @returns {String}
     */
    getClassName: function() {
      return this.className || this.nodeType;
    },
    /**
     * get the node type, which may return Stage, Layer, Group, or Node
     * @method
     * @memberof Konva.Node.prototype
     * @returns {String}
     */
    getType: function() {
      return this.nodeType;
    },
    getDragDistance: function() {
      // compare with undefined because we need to track 0 value
      if (this.attrs.dragDistance !== undefined) {
        return this.attrs.dragDistance;
      } else if (this.parent) {
        return this.parent.getDragDistance();
      } else {
        return Konva.dragDistance;
      }
    },
    _get: function(selector) {
      return this.className === selector || this.nodeType === selector
        ? [this]
        : [];
    },
    _off: function(type, name, callback) {
      var evtListeners = this.eventListeners[type],
        i,
        evtName,
        handler;

      for (i = 0; i < evtListeners.length; i++) {
        evtName = evtListeners[i].name;
        handler = evtListeners[i].handler;

        // the following two conditions must be true in order to remove a handler:
        // 1) the current event name cannot be konva unless the event name is konva
        //    this enables developers to force remove a konva specific listener for whatever reason
        // 2) an event name is not specified, or if one is specified, it matches the current event name
        if (
          (evtName !== 'konva' || name === 'konva') &&
          (!name || evtName === name) &&
          (!callback || callback === handler)
        ) {
          evtListeners.splice(i, 1);
          if (evtListeners.length === 0) {
            delete this.eventListeners[type];
            break;
          }
          i--;
        }
      }
    },
    _fireChangeEvent: function(attr, oldVal, newVal) {
      this._fire(attr + CHANGE, {
        oldVal: oldVal,
        newVal: newVal
      });
    },
    setId: function(id) {
      var oldId = this.getId();

      Konva._removeId(oldId);
      Konva._addId(this, id);
      this._setAttr(ID, id);
      return this;
    },
    setName: function(name) {
      var oldNames = (this.getName() || '').split(/\s/g);
      var newNames = (name || '').split(/\s/g);
      var subname, i;
      // remove all subnames
      for (i = 0; i < oldNames.length; i++) {
        subname = oldNames[i];
        if (newNames.indexOf(subname) === -1 && subname) {
          Konva._removeName(subname, this._id);
        }
      }

      // add new names
      for (i = 0; i < newNames.length; i++) {
        subname = newNames[i];
        if (oldNames.indexOf(subname) === -1 && subname) {
          Konva._addName(this, subname);
        }
      }

      this._setAttr(NAME, name);
      return this;
    },
    // naming methods
    /**
     * add name to node
     * @method
     * @memberof Konva.Node.prototype
     * @param {String} name
     * @returns {Konva.Node}
     * @example
     * node.name('red');
     * node.addName('selected');
     * node.name(); // return 'red selected'
     */
    addName: function(name) {
      if (!this.hasName(name)) {
        var oldName = this.name();
        var newName = oldName ? oldName + ' ' + name : name;
        this.setName(newName);
      }
      return this;
    },
    /**
     * check is node has name
     * @method
     * @memberof Konva.Node.prototype
     * @param {String} name
     * @returns {Boolean}
     * @example
     * node.name('red');
     * node.hasName('red');   // return true
     * node.hasName('selected'); // return false
     */
    hasName: function(name) {
      var names = (this.name() || '').split(/\s/g);
      return names.indexOf(name) !== -1;
    },
    /**
     * remove name from node
     * @method
     * @memberof Konva.Node.prototype
     * @param {String} name
     * @returns {Konva.Node}
     * @example
     * node.name('red selected');
     * node.removeName('selected');
     * node.hasName('selected'); // return false
     * node.name(); // return 'red'
     */
    removeName: function(name) {
      var names = (this.name() || '').split(/\s/g);
      var index = names.indexOf(name);
      if (index !== -1) {
        names.splice(index, 1);
        this.setName(names.join(' '));
      }
      return this;
    },
    /**
     * set attr
     * @method
     * @memberof Konva.Node.prototype
     * @param {String} attr
     * @param {*} val
     * @returns {Konva.Node}
     * @example
     * node.setAttr('x', 5);
     */
    setAttr: function(attr, val) {
      var method = SET + Konva.Util._capitalize(attr),
        func = this[method];

      if (Konva.Util._isFunction(func)) {
        func.call(this, val);
      } else {
        // otherwise set directly
        this._setAttr(attr, val);
      }
      return this;
    },
    _setAttr: function(key, val) {
      var oldVal;
      oldVal = this.attrs[key];
      var same = oldVal === val;
      if (same && !Konva.Util.isObject(val)) {
        return;
      }
      if (val === undefined || val === null) {
        delete this.attrs[key];
      } else {
        this.attrs[key] = val;
      }
      this._fireChangeEvent(key, oldVal, val);
    },
    _setComponentAttr: function(key, component, val) {
      var oldVal;
      if (val !== undefined) {
        oldVal = this.attrs[key];

        if (!oldVal) {
          // set value to default value using getAttr
          this.attrs[key] = this.getAttr(key);
        }

        this.attrs[key][component] = val;
        this._fireChangeEvent(key, oldVal, val);
      }
    },
    _fireAndBubble: function(eventType, evt, compareShape) {
      var okayToRun = true;

      if (evt && this.nodeType === SHAPE) {
        evt.target = this;
      }

      if (
        eventType === MOUSEENTER &&
        compareShape &&
        (this._id === compareShape._id ||
          (this.isAncestorOf && this.isAncestorOf(compareShape)))
      ) {
        okayToRun = false;
      } else if (
        eventType === MOUSELEAVE &&
        compareShape &&
        (this._id === compareShape._id ||
          (this.isAncestorOf && this.isAncestorOf(compareShape)))
      ) {
        okayToRun = false;
      }
      if (okayToRun) {
        this._fire(eventType, evt);

        // simulate event bubbling
        var stopBubble =
          (eventType === MOUSEENTER || eventType === MOUSELEAVE) &&
          (compareShape &&
            compareShape.isAncestorOf &&
            compareShape.isAncestorOf(this) &&
            !compareShape.isAncestorOf(this.parent));
        if (
          ((evt && !evt.cancelBubble) || !evt) &&
          this.parent &&
          this.parent.isListening() &&
          !stopBubble
        ) {
          if (compareShape && compareShape.parent) {
            this._fireAndBubble.call(
              this.parent,
              eventType,
              evt,
              compareShape.parent
            );
          } else {
            this._fireAndBubble.call(this.parent, eventType, evt);
          }
        }
      }
    },
    _fire: function(eventType, evt) {
      var events = this.eventListeners[eventType],
        i;

      evt = evt || {};
      evt.currentTarget = this;
      evt.type = eventType;

      if (events) {
        for (i = 0; i < events.length; i++) {
          events[i].handler.call(this, evt);
        }
      }
    },
    /**
     * draw both scene and hit graphs.  If the node being drawn is the stage, all of the layers will be cleared and redrawn
     * @method
     * @memberof Konva.Node.prototype
     * @returns {Konva.Node}
     */
    draw: function() {
      this.drawScene();
      this.drawHit();
      return this;
    }
  });

  /**
   * create node with JSON string or an Object.  De-serializtion does not generate custom
   *  shape drawing functions, images, or event handlers (this would make the
   *  serialized object huge).  If your app uses custom shapes, images, and
   *  event handlers (it probably does), then you need to select the appropriate
   *  shapes after loading the stage and set these properties via on(), setSceneFunc(),
   *  and setImage() methods
   * @method
   * @memberof Konva.Node
   * @param {String|Object} json string or object
   * @param {Element} [container] optional container dom element used only if you're
   *  creating a stage node
   */
  Konva.Node.create = function(data, container) {
    if (Konva.Util._isString(data)) {
      data = JSON.parse(data);
    }
    return this._createNode(data, container);
  };
  Konva.Node._createNode = function(obj, container) {
    var className = Konva.Node.prototype.getClassName.call(obj),
      children = obj.children,
      no,
      len,
      n;

    // if container was passed in, add it to attrs
    if (container) {
      obj.attrs.container = container;
    }

    no = new Konva[className](obj.attrs);
    if (children) {
      len = children.length;
      for (n = 0; n < len; n++) {
        no.add(this._createNode(children[n]));
      }
    }

    return no;
  };

  // =========================== add getters setters ===========================

  Konva.Factory.addOverloadedGetterSetter(Konva.Node, 'position');
  /**
   * get/set node position relative to parent
   * @name position
   * @method
   * @memberof Konva.Node.prototype
   * @param {Object} pos
   * @param {Number} pos.x
   * @param {Number} pos.y
   * @returns {Object}
   * @example
   * // get position
   * var position = node.position();
   *
   * // set position
   * node.position({
   *   x: 5
   *   y: 10
   * });
   */

  Konva.Factory.addGetterSetter(
    Konva.Node,
    'x',
    0,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set x position
   * @name x
   * @method
   * @memberof Konva.Node.prototype
   * @param {Number} x
   * @returns {Object}
   * @example
   * // get x
   * var x = node.x();
   *
   * // set x
   * node.x(5);
   */

  Konva.Factory.addGetterSetter(
    Konva.Node,
    'y',
    0,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set y position
   * @name y
   * @method
   * @memberof Konva.Node.prototype
   * @param {Number} y
   * @returns {Integer}
   * @example
   * // get y
   * var y = node.y();
   *
   * // set y
   * node.y(5);
   */

  Konva.Factory.addGetterSetter(
    Konva.Node,
    'globalCompositeOperation',
    'source-over',
    Konva.Validators.getStringValidator()
  );

  /**
   * get/set globalCompositeOperation of a shape
   * @name globalCompositeOperation
   * @method
   * @memberof Konva.Node.prototype
   * @param {String} type
   * @returns {String}
   * @example
   * // get globalCompositeOperation
   * var globalCompositeOperation = shape.globalCompositeOperation();
   *
   * // set globalCompositeOperation
   * shape.globalCompositeOperation('source-in');
   */
  Konva.Factory.addGetterSetter(
    Konva.Node,
    'opacity',
    1,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set opacity.  Opacity values range from 0 to 1.
   *  A node with an opacity of 0 is fully transparent, and a node
   *  with an opacity of 1 is fully opaque
   * @name opacity
   * @method
   * @memberof Konva.Node.prototype
   * @param {Object} opacity
   * @returns {Number}
   * @example
   * // get opacity
   * var opacity = node.opacity();
   *
   * // set opacity
   * node.opacity(0.5);
   */

  Konva.Factory.addGetter(Konva.Node, 'name');
  Konva.Factory.addOverloadedGetterSetter(Konva.Node, 'name');

  /**
   * get/set name
   * @name name
   * @method
   * @memberof Konva.Node.prototype
   * @param {String} name
   * @returns {String}
   * @example
   * // get name
   * var name = node.name();
   *
   * // set name
   * node.name('foo');
   *
   * // also node may have multiple names (as css classes)
   * node.name('foo bar');
   */

  Konva.Factory.addGetter(Konva.Node, 'id');
  Konva.Factory.addOverloadedGetterSetter(Konva.Node, 'id');

  /**
   * get/set id. Id is global for whole page.
   * @name id
   * @method
   * @memberof Konva.Node.prototype
   * @param {String} id
   * @returns {String}
   * @example
   * // get id
   * var name = node.id();
   *
   * // set id
   * node.id('foo');
   */

  Konva.Factory.addGetterSetter(
    Konva.Node,
    'rotation',
    0,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set rotation in degrees
   * @name rotation
   * @method
   * @memberof Konva.Node.prototype
   * @param {Number} rotation
   * @returns {Number}
   * @example
   * // get rotation in degrees
   * var rotation = node.rotation();
   *
   * // set rotation in degrees
   * node.rotation(45);
   */

  Konva.Factory.addComponentsGetterSetter(Konva.Node, 'scale', ['x', 'y']);

  /**
   * get/set scale
   * @name scale
   * @param {Object} scale
   * @param {Number} scale.x
   * @param {Number} scale.y
   * @method
   * @memberof Konva.Node.prototype
   * @returns {Object}
   * @example
   * // get scale
   * var scale = node.scale();
   *
   * // set scale
   * shape.scale({
   *   x: 2
   *   y: 3
   * });
   */

  Konva.Factory.addGetterSetter(
    Konva.Node,
    'scaleX',
    1,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set scale x
   * @name scaleX
   * @param {Number} x
   * @method
   * @memberof Konva.Node.prototype
   * @returns {Number}
   * @example
   * // get scale x
   * var scaleX = node.scaleX();
   *
   * // set scale x
   * node.scaleX(2);
   */

  Konva.Factory.addGetterSetter(
    Konva.Node,
    'scaleY',
    1,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set scale y
   * @name scaleY
   * @param {Number} y
   * @method
   * @memberof Konva.Node.prototype
   * @returns {Number}
   * @example
   * // get scale y
   * var scaleY = node.scaleY();
   *
   * // set scale y
   * node.scaleY(2);
   */

  Konva.Factory.addComponentsGetterSetter(Konva.Node, 'skew', ['x', 'y']);

  /**
   * get/set skew
   * @name skew
   * @param {Object} skew
   * @param {Number} skew.x
   * @param {Number} skew.y
   * @method
   * @memberof Konva.Node.prototype
   * @returns {Object}
   * @example
   * // get skew
   * var skew = node.skew();
   *
   * // set skew
   * node.skew({
   *   x: 20
   *   y: 10
   * });
   */

  Konva.Factory.addGetterSetter(
    Konva.Node,
    'skewX',
    0,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set skew x
   * @name skewX
   * @param {Number} x
   * @method
   * @memberof Konva.Node.prototype
   * @returns {Number}
   * @example
   * // get skew x
   * var skewX = node.skewX();
   *
   * // set skew x
   * node.skewX(3);
   */

  Konva.Factory.addGetterSetter(
    Konva.Node,
    'skewY',
    0,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set skew y
   * @name skewY
   * @param {Number} y
   * @method
   * @memberof Konva.Node.prototype
   * @returns {Number}
   * @example
   * // get skew y
   * var skewY = node.skewY();
   *
   * // set skew y
   * node.skewY(3);
   */

  Konva.Factory.addComponentsGetterSetter(Konva.Node, 'offset', ['x', 'y']);

  /**
   * get/set offset.  Offsets the default position and rotation point
   * @method
   * @memberof Konva.Node.prototype
   * @param {Object} offset
   * @param {Number} offset.x
   * @param {Number} offset.y
   * @returns {Object}
   * @example
   * // get offset
   * var offset = node.offset();
   *
   * // set offset
   * node.offset({
   *   x: 20
   *   y: 10
   * });
   */

  Konva.Factory.addGetterSetter(
    Konva.Node,
    'offsetX',
    0,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set offset x
   * @name offsetX
   * @method
   * @memberof Konva.Node.prototype
   * @param {Number} x
   * @returns {Number}
   * @example
   * // get offset x
   * var offsetX = node.offsetX();
   *
   * // set offset x
   * node.offsetX(3);
   */

  Konva.Factory.addGetterSetter(
    Konva.Node,
    'offsetY',
    0,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set offset y
   * @name offsetY
   * @method
   * @memberof Konva.Node.prototype
   * @param {Number} y
   * @returns {Number}
   * @example
   * // get offset y
   * var offsetY = node.offsetY();
   *
   * // set offset y
   * node.offsetY(3);
   */

  Konva.Factory.addSetter(
    Konva.Node,
    'dragDistance',
    Konva.Validators.getNumberValidator()
  );
  Konva.Factory.addOverloadedGetterSetter(Konva.Node, 'dragDistance');

  /**
   * get/set drag distance
   * @name dragDistance
   * @method
   * @memberof Konva.Node.prototype
   * @param {Number} distance
   * @returns {Number}
   * @example
   * // get drag distance
   * var dragDistance = node.dragDistance();
   *
   * // set distance
   * // node starts dragging only if pointer moved more then 3 pixels
   * node.dragDistance(3);
   * // or set globally
   * Konva.dragDistance = 3;
   */

  Konva.Factory.addSetter(
    Konva.Node,
    'width',
    Konva.Validators.getNumberValidator()
  );
  Konva.Factory.addOverloadedGetterSetter(Konva.Node, 'width');
  /**
   * get/set width
   * @name width
   * @method
   * @memberof Konva.Node.prototype
   * @param {Number} width
   * @returns {Number}
   * @example
   * // get width
   * var width = node.width();
   *
   * // set width
   * node.width(100);
   */

  Konva.Factory.addSetter(
    Konva.Node,
    'height',
    Konva.Validators.getNumberValidator()
  );
  Konva.Factory.addOverloadedGetterSetter(Konva.Node, 'height');
  /**
   * get/set height
   * @name height
   * @method
   * @memberof Konva.Node.prototype
   * @param {Number} height
   * @returns {Number}
   * @example
   * // get height
   * var height = node.height();
   *
   * // set height
   * node.height(100);
   */

  Konva.Factory.addGetterSetter(Konva.Node, 'listening', 'inherit', function(
    val
  ) {
    var isValid = val === true || val === false || val === 'inherit';
    if (!isValid) {
      Konva.Util.warn(
        val +
          ' is a not valid value for "listening" attribute. The value may be true, false or "inherit".'
      );
    }
    return val;
  });
  /**
   * get/set listenig attr.  If you need to determine if a node is listening or not
   *   by taking into account its parents, use the isListening() method
   * @name listening
   * @method
   * @memberof Konva.Node.prototype
   * @param {Boolean|String} listening Can be "inherit", true, or false.  The default is "inherit".
   * @returns {Boolean|String}
   * @example
   * // get listening attr
   * var listening = node.listening();
   *
   * // stop listening for events
   * node.listening(false);
   *
   * // listen for events
   * node.listening(true);
   *
   * // listen to events according to the parent
   * node.listening('inherit');
   */

  /**
   * get/set preventDefault
   * By default all shapes will prevent default behaviour
   * of a browser on a pointer move or tap.
   * that will prevent native scrolling when you are trying to drag&drop a node
   * but sometimes you may need to enable default actions
   * in that case you can set the property to false
   * @name preventDefault
   * @method
   * @memberof Konva.Node.prototype
   * @param {Number} preventDefault
   * @returns {Number}
   * @example
   * // get preventDefault
   * var shouldPrevent = shape.preventDefault();
   *
   * // set preventDefault
   * shape.preventDefault(false);
   */

  Konva.Factory.addGetterSetter(
    Konva.Node,
    'preventDefault',
    true,
    Konva.Validators.getBooleanValidator()
  );

  Konva.Factory.addGetterSetter(Konva.Node, 'filters', null, function(val) {
    this._filterUpToDate = false;
    return val;
  });
  /**
   * get/set filters.  Filters are applied to cached canvases
   * @name filters
   * @method
   * @memberof Konva.Node.prototype
   * @param {Array} filters array of filters
   * @returns {Array}
   * @example
   * // get filters
   * var filters = node.filters();
   *
   * // set a single filter
   * node.cache();
   * node.filters([Konva.Filters.Blur]);
   *
   * // set multiple filters
   * node.cache();
   * node.filters([
   *   Konva.Filters.Blur,
   *   Konva.Filters.Sepia,
   *   Konva.Filters.Invert
   * ]);
   */

  Konva.Factory.addGetterSetter(Konva.Node, 'visible', 'inherit', function(
    val
  ) {
    var isValid = val === true || val === false || val === 'inherit';
    if (!isValid) {
      Konva.Util.warn(
        val +
          ' is a not valid value for "visible" attribute. The value may be true, false or "inherit".'
      );
    }
    return val;
  });
  /**
   * get/set visible attr.  Can be "inherit", true, or false.  The default is "inherit".
   *   If you need to determine if a node is visible or not
   *   by taking into account its parents, use the isVisible() method
   * @name visible
   * @method
   * @memberof Konva.Node.prototype
   * @param {Boolean|String} visible
   * @returns {Boolean|String}
   * @example
   * // get visible attr
   * var visible = node.visible();
   *
   * // make invisible
   * node.visible(false);
   *
   * // make visible
   * node.visible(true);
   *
   * // make visible according to the parent
   * node.visible('inherit');
   */

  Konva.Factory.addGetterSetter(
    Konva.Node,
    'transformsEnabled',
    'all',
    Konva.Validators.getStringValidator()
  );

  /**
   * get/set transforms that are enabled.  Can be "all", "none", or "position".  The default
   *  is "all"
   * @name transformsEnabled
   * @method
   * @memberof Konva.Node.prototype
   * @param {String} enabled
   * @returns {String}
   * @example
   * // enable position transform only to improve draw performance
   * node.transformsEnabled('position');
   *
   * // enable all transforms
   * node.transformsEnabled('all');
   */

  /**
   * get/set node size
   * @name size
   * @method
   * @memberof Konva.Node.prototype
   * @param {Object} size
   * @param {Number} size.width
   * @param {Number} size.height
   * @returns {Object}
   * @example
   * // get node size
   * var size = node.size();
   * var x = size.x;
   * var y = size.y;
   *
   * // set size
   * node.size({
   *   width: 100,
   *   height: 200
   * });
   */
  Konva.Factory.addOverloadedGetterSetter(Konva.Node, 'size');

  Konva.Factory.backCompat(Konva.Node, {
    rotateDeg: 'rotate',
    setRotationDeg: 'setRotation',
    getRotationDeg: 'getRotation'
  });

  Konva.Collection.mapMethods(Konva.Node);
})(Konva);
