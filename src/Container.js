(function() {
  'use strict';
  /**
   * Container constructor.&nbsp; Containers are used to contain nodes or other containers
   * @constructor
   * @memberof Konva
   * @augments Konva.Node
   * @abstract
   * @param {Object} config
   * @@nodeParams
   * @@containerParams
   */
  Konva.Container = function(config) {
    this.__init(config);
  };

  Konva.Util.addMethods(Konva.Container, {
    __init: function(config) {
      this.children = new Konva.Collection();
      Konva.Node.call(this, config);
    },
    /**
     * returns a {@link Konva.Collection} of direct descendant nodes
     * @method
     * @memberof Konva.Container.prototype
     * @param {Function} [filterFunc] filter function
     * @returns {Konva.Collection}
     * @example
     * // get all children
     * var children = layer.getChildren();
     *
     * // get only circles
     * var circles = layer.getChildren(function(node){
     *    return node.getClassName() === 'Circle';
     * });
     */
    getChildren: function(filterFunc) {
      if (!filterFunc) {
        return this.children;
      }

      var results = new Konva.Collection();
      this.children.each(function(child) {
        if (filterFunc(child)) {
          results.push(child);
        }
      });
      return results;
    },
    /**
     * determine if node has children
     * @method
     * @memberof Konva.Container.prototype
     * @returns {Boolean}
     */
    hasChildren: function() {
      return this.getChildren().length > 0;
    },
    /**
     * remove all children
     * @method
     * @memberof Konva.Container.prototype
     */
    removeChildren: function() {
      var children = Konva.Collection.toCollection(this.children);
      var child;
      for (var i = 0; i < children.length; i++) {
        child = children[i];
        // reset parent to prevent many _setChildrenIndices calls
        delete child.parent;
        child.index = 0;
        child.remove();
      }
      children = null;
      this.children = new Konva.Collection();
      return this;
    },
    /**
     * destroy all children
     * @method
     * @memberof Konva.Container.prototype
     */
    destroyChildren: function() {
      var children = Konva.Collection.toCollection(this.children);
      var child;
      for (var i = 0; i < children.length; i++) {
        child = children[i];
        // reset parent to prevent many _setChildrenIndices calls
        delete child.parent;
        child.index = 0;
        child.destroy();
      }
      children = null;
      this.children = new Konva.Collection();
      return this;
    },
    /**
     * Add node or nodes to container.
     * @method
     * @memberof Konva.Container.prototype
     * @param {...Konva.Node} child
     * @returns {Container}
     * @example
     * layer.add(shape1, shape2, shape3);
     */
    add: function(child) {
      if (arguments.length > 1) {
        for (var i = 0; i < arguments.length; i++) {
          this.add(arguments[i]);
        }
        return this;
      }
      if (child.getParent()) {
        child.moveTo(this);
        return this;
      }
      var children = this.children;
      this._validateAdd(child);
      child.index = children.length;
      child.parent = this;
      children.push(child);
      this._fire('add', {
        child: child
      });

      // if node under drag we need to update drag animation
      if (Konva.DD && child.isDragging()) {
        Konva.DD.anim.setLayers(child.getLayer());
      }

      // chainable
      return this;
    },
    destroy: function() {
      // destroy children
      if (this.hasChildren()) {
        this.destroyChildren();
      }
      // then destroy self
      Konva.Node.prototype.destroy.call(this);
      return this;
    },
    /**
     * return a {@link Konva.Collection} of nodes that match the selector.
     * You can provide a string with '#' for id selections and '.' for name selections.
     * Or a function that will return true/false when a node is passed through.  See example below.
     * With strings you can also select by type or class name. Pass multiple selectors
     * separated by a space.
     * @method
     * @memberof Konva.Container.prototype
     * @param {String | Function} selector
     * @returns {Collection}
     * @example
     *
     * Passing a string as a selector
     * // select node with id foo
     * var node = stage.find('#foo');
     *
     * // select nodes with name bar inside layer
     * var nodes = layer.find('.bar');
     *
     * // select all groups inside layer
     * var nodes = layer.find('Group');
     *
     * // select all rectangles inside layer
     * var nodes = layer.find('Rect');
     *
     * // select node with an id of foo or a name of bar inside layer
     * var nodes = layer.find('#foo, .bar');
     *
     * Passing a function as a selector
     *
     * // get all Groups
     * var groups = stage.find(node => {
     *  return node.getType() === 'Group';
     * });
     *
     * // get only Nodes with partial opacity
     * var alphaNodes = layer.find(node => {
     *  return node.getType() === 'Node' && node.getAbsoluteOpacity() < 1;
     * });
     */
    find: function(selector) {
      // protecting _generalFind to prevent user from accidentally adding
      // second argument and getting unexpected `findOne` result
      return this._generalFind(selector, false);
    },
    /**
     * return a first node from `find` method
     * @method
     * @memberof Konva.Container.prototype
     * @param {String | Function} selector
     * @returns {Konva.Node | Undefined}
     * @example
     * // select node with id foo
     * var node = stage.findOne('#foo');
     *
     * // select node with name bar inside layer
     * var nodes = layer.findOne('.bar');
     *
     * // select the first node to return true in a function
     * var node = stage.findOne(node => {
     *  return node.getType() === 'Shape'
     * })
     */
    findOne: function(selector) {
      var result = this._generalFind(selector, true);
      return result.length > 0 ? result[0] : undefined;
    },
    _generalFind: function(selector, findOne) {
      var retArr = [];

      if (typeof selector === 'string') {
        retArr = this._findByString(selector, findOne);
      } else if (typeof selector === 'function') {
        retArr = this._findByFunction(selector, findOne);
      }

      return Konva.Collection.toCollection(retArr);
    },
    _findByString: function(selector) {
      var retArr = [],
        selectorArr = selector.replace(/ /g, '').split(','),
        len = selectorArr.length,
        n,
        i,
        sel,
        arr,
        node,
        children,
        clen;

      for (n = 0; n < len; n++) {
        sel = selectorArr[n];
        if (!Konva.Util.isValidSelector(sel)) {
          var message =
            'Selector "' +
            sel +
            '" is invalid. Allowed selectors examples are "#foo", ".bar" or "Group".\n' +
            'If you have a custom shape with such className, please change it to start with upper letter like "Triangle".\n' +
            'Konva is awesome, right?';
          Konva.Util.warn(message);
        }
        // id selector
        if (sel.charAt(0) === '#') {
          node = this._getNodeById(sel.slice(1));
          if (node) {
            retArr.push(node);
          }
        } else if (sel.charAt(0) === '.') {
          // name selector
          arr = this._getNodesByName(sel.slice(1));
          retArr = retArr.concat(arr);
        } else {
          // unrecognized selector, pass to children
          children = this.getChildren();
          clen = children.length;
          for (i = 0; i < clen; i++) {
            retArr = retArr.concat(children[i]._get(sel));
          }
        }
      }

      return retArr;
    },
    // (fn: ((Node) => boolean, findOne?: boolean)
    _findByFunction: function(fn, findOne) {
      var retArr = [];

      var addItems = function(el) {
        // escape function if we've already found one.
        if (findOne && retArr.length > 0) {
          return;
        }

        var children = el.getChildren();
        var clen = children.length;

        if (fn(el)) {
          retArr = retArr.concat(el);
        }

        for (var i = 0; i < clen; i++) {
          addItems(children[i]);
        }
      };

      addItems(this);

      return retArr;
    },
    _getNodeById: function(key) {
      var node = Konva.ids[key];

      if (node !== undefined && this.isAncestorOf(node)) {
        return node;
      }
      return null;
    },
    _getNodesByName: function(key) {
      var arr = Konva.names[key] || [];
      return this._getDescendants(arr);
    },
    _get: function(selector) {
      var retArr = Konva.Node.prototype._get.call(this, selector);
      var children = this.getChildren();
      var len = children.length;
      for (var n = 0; n < len; n++) {
        retArr = retArr.concat(children[n]._get(selector));
      }
      return retArr;
    },
    // extenders
    toObject: function() {
      var obj = Konva.Node.prototype.toObject.call(this);

      obj.children = [];

      var children = this.getChildren();
      var len = children.length;
      for (var n = 0; n < len; n++) {
        var child = children[n];
        obj.children.push(child.toObject());
      }

      return obj;
    },
    _getDescendants: function(arr) {
      var retArr = [];
      var len = arr.length;
      for (var n = 0; n < len; n++) {
        var node = arr[n];
        if (this.isAncestorOf(node)) {
          retArr.push(node);
        }
      }

      return retArr;
    },
    /**
     * determine if node is an ancestor
     * of descendant
     * @method
     * @memberof Konva.Container.prototype
     * @param {Konva.Node} node
     */
    isAncestorOf: function(node) {
      var parent = node.getParent();
      while (parent) {
        if (parent._id === this._id) {
          return true;
        }
        parent = parent.getParent();
      }

      return false;
    },
    clone: function(obj) {
      // call super method
      var node = Konva.Node.prototype.clone.call(this, obj);

      this.getChildren().each(function(no) {
        node.add(no.clone());
      });
      return node;
    },
    /**
     * get all shapes that intersect a point.  Note: because this method must clear a temporary
     * canvas and redraw every shape inside the container, it should only be used for special sitations
     * because it performs very poorly.  Please use the {@link Konva.Stage#getIntersection} method if at all possible
     * because it performs much better
     * @method
     * @memberof Konva.Container.prototype
     * @param {Object} pos
     * @param {Number} pos.x
     * @param {Number} pos.y
     * @returns {Array} array of shapes
     */
    getAllIntersections: function(pos) {
      var arr = [];

      this.find('Shape').each(function(shape) {
        if (shape.isVisible() && shape.intersects(pos)) {
          arr.push(shape);
        }
      });

      return arr;
    },
    _setChildrenIndices: function() {
      this.children.each(function(child, n) {
        child.index = n;
      });
    },
    drawScene: function(can, top, caching) {
      var layer = this.getLayer(),
        canvas = can || (layer && layer.getCanvas()),
        context = canvas && canvas.getContext(),
        cachedCanvas = this._cache.canvas,
        cachedSceneCanvas = cachedCanvas && cachedCanvas.scene;

      if (this.isVisible() || caching) {
        if (!caching && cachedSceneCanvas) {
          context.save();
          layer._applyTransform(this, context, top);
          this._drawCachedSceneCanvas(context);
          context.restore();
        } else {
          this._drawChildren(canvas, 'drawScene', top, false, caching);
        }
      }
      return this;
    },
    drawHit: function(can, top, caching) {
      var layer = this.getLayer(),
        canvas = can || (layer && layer.hitCanvas),
        context = canvas && canvas.getContext(),
        cachedCanvas = this._cache.canvas,
        cachedHitCanvas = cachedCanvas && cachedCanvas.hit;

      if (this.shouldDrawHit(canvas) || caching) {
        if (layer) {
          layer.clearHitCache();
        }
        if (!caching && cachedHitCanvas) {
          context.save();
          layer._applyTransform(this, context, top);
          this._drawCachedHitCanvas(context);
          context.restore();
        } else {
          this._drawChildren(canvas, 'drawHit', top);
        }
      }
      return this;
    },
    _drawChildren: function(canvas, drawMethod, top, caching, skipBuffer) {
      var layer = this.getLayer(),
        context = canvas && canvas.getContext(),
        clipWidth = this.getClipWidth(),
        clipHeight = this.getClipHeight(),
        clipFunc = this.getClipFunc(),
        hasClip = (clipWidth && clipHeight) || clipFunc,
        clipX,
        clipY;

      if (hasClip && layer) {
        context.save();
        var transform = this.getAbsoluteTransform(top);
        var m = transform.getMatrix();
        context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        context.beginPath();
        if (clipFunc) {
          clipFunc.call(this, context, this);
        } else {
          clipX = this.getClipX();
          clipY = this.getClipY();
          context.rect(clipX, clipY, clipWidth, clipHeight);
        }
        context.clip();
        m = transform
          .copy()
          .invert()
          .getMatrix();
        context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
      }

      this.children.each(function(child) {
        child[drawMethod](canvas, top, caching, skipBuffer);
      });

      if (hasClip) {
        context.restore();
      }
    },
    shouldDrawHit: function(canvas) {
      var layer = this.getLayer();
      var dd = Konva.DD;
      var layerUnderDrag =
        dd &&
        Konva.isDragging() &&
        Konva.DD.anim.getLayers().indexOf(layer) !== -1;
      return (
        (canvas && canvas.isCache) ||
        (layer &&
          layer.hitGraphEnabled() &&
          this.isVisible() &&
          !layerUnderDrag)
      );
    },
    getClientRect: function(attrs) {
      attrs = attrs || {};
      var skipTransform = attrs.skipTransform;
      var relativeTo = attrs.relativeTo;

      var minX, minY, maxX, maxY;
      var selfRect = {
        x: Infinity,
        y: Infinity,
        width: 0,
        height: 0
      };
      var that = this;
      this.children.each(function(child) {
        // skip invisible children
        if (!child.getVisible()) {
          return;
        }

        var rect = child.getClientRect({
          relativeTo: that,
          skipShadow: attrs.skipShadow,
          skipStroke: attrs.skipStroke
        });

        // skip invisible children (like empty groups)
        if (rect.width === 0 && rect.height === 0) {
          return;
        }

        if (minX === undefined) {
          // initial value for first child
          minX = rect.x;
          minY = rect.y;
          maxX = rect.x + rect.width;
          maxY = rect.y + rect.height;
        } else {
          minX = Math.min(minX, rect.x);
          minY = Math.min(minY, rect.y);
          maxX = Math.max(maxX, rect.x + rect.width);
          maxY = Math.max(maxY, rect.y + rect.height);
        }
      });

      // if child is group we need to make sure it has visible shapes inside
      var shapes = this.find('Shape');
      var hasVisible = false;
      for (var i = 0; i < shapes.length; i++) {
        var shape = shapes[i];
        if (shape._isVisible(this)) {
          hasVisible = true;
          break;
        }
      }

      if (hasVisible) {
        selfRect = {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY
        };
      } else {
        selfRect = {
          x: 0,
          y: 0,
          width: 0,
          height: 0
        };
      }

      if (!skipTransform) {
        return this._transformedRect(selfRect, relativeTo);
      }
      return selfRect;
    }
  });

  Konva.Util.extend(Konva.Container, Konva.Node);
  // deprecated methods
  Konva.Container.prototype.get = Konva.Container.prototype.find;

  // add getters setters
  Konva.Factory.addComponentsGetterSetter(Konva.Container, 'clip', [
    'x',
    'y',
    'width',
    'height'
  ]);
  /**
   * get/set clip
   * @method
   * @name clip
   * @memberof Konva.Container.prototype
   * @param {Object} clip
   * @param {Number} clip.x
   * @param {Number} clip.y
   * @param {Number} clip.width
   * @param {Number} clip.height
   * @returns {Object}
   * @example
   * // get clip
   * var clip = container.clip();
   *
   * // set clip
   * container.setClip({
   *   x: 20,
   *   y: 20,
   *   width: 20,
   *   height: 20
   * });
   */

  Konva.Factory.addGetterSetter(
    Konva.Container,
    'clipX',
    undefined,
    Konva.Validators.getNumberValidator()
  );
  /**
   * get/set clip x
   * @name clipX
   * @method
   * @memberof Konva.Container.prototype
   * @param {Number} x
   * @returns {Number}
   * @example
   * // get clip x
   * var clipX = container.clipX();
   *
   * // set clip x
   * container.clipX(10);
   */

  Konva.Factory.addGetterSetter(
    Konva.Container,
    'clipY',
    undefined,
    Konva.Validators.getNumberValidator()
  );
  /**
   * get/set clip y
   * @name clipY
   * @method
   * @memberof Konva.Container.prototype
   * @param {Number} y
   * @returns {Number}
   * @example
   * // get clip y
   * var clipY = container.clipY();
   *
   * // set clip y
   * container.clipY(10);
   */

  Konva.Factory.addGetterSetter(
    Konva.Container,
    'clipWidth',
    undefined,
    Konva.Validators.getNumberValidator()
  );
  /**
   * get/set clip width
   * @name clipWidth
   * @method
   * @memberof Konva.Container.prototype
   * @param {Number} width
   * @returns {Number}
   * @example
   * // get clip width
   * var clipWidth = container.clipWidth();
   *
   * // set clip width
   * container.clipWidth(100);
   */

  Konva.Factory.addGetterSetter(
    Konva.Container,
    'clipHeight',
    undefined,
    Konva.Validators.getNumberValidator()
  );
  /**
   * get/set clip height
   * @name clipHeight
   * @method
   * @memberof Konva.Container.prototype
   * @param {Number} height
   * @returns {Number}
   * @example
   * // get clip height
   * var clipHeight = container.clipHeight();
   *
   * // set clip height
   * container.clipHeight(100);
   */

  Konva.Factory.addGetterSetter(Konva.Container, 'clipFunc');
  /**
   * get/set clip function
   * @name clipFunc
   * @method
   * @memberof Konva.Container.prototype
   * @param {Function} function
   * @returns {Function}
   * @example
   * // get clip function
   * var clipFunction = container.clipFunc();
   *
   * // set clip height
   * container.clipFunc(function(ctx) {
   *   ctx.rect(0, 0, 100, 100);
   * });
   */

  Konva.Collection.mapMethods(Konva.Container);
})();
