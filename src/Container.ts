import { Factory } from './Factory';
import { Node, NodeConfig } from './Node';
import { getNumberValidator } from './Validators';

import { GetSet, IRect } from './types';
import { Shape } from './Shape';
import { HitCanvas, SceneCanvas } from './Canvas';
import { SceneContext } from './Context';

export type ClipFuncOutput =
  | void
  | [Path2D | CanvasFillRule]
  | [Path2D, CanvasFillRule];
export interface ContainerConfig extends NodeConfig {
  clearBeforeDraw?: boolean;
  clipFunc?: (ctx: SceneContext) => ClipFuncOutput;
  clipX?: number;
  clipY?: number;
  clipWidth?: number;
  clipHeight?: number;
}

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
export abstract class Container<
  ChildType extends Node = Node
> extends Node<ContainerConfig> {
  children: Array<ChildType> = [];

  /**
   * returns an array of direct descendant nodes
   * @method
   * @name Konva.Container#getChildren
   * @param {Function} [filterFunc] filter function
   * @returns {Array}
   * @example
   * // get all children
   * var children = layer.getChildren();
   *
   * // get only circles
   * var circles = layer.getChildren(function(node){
   *    return node.getClassName() === 'Circle';
   * });
   */
  getChildren(filterFunc?: (item: Node) => boolean) {
    if (!filterFunc) {
      return this.children || [];
    }

    const children = this.children || [];
    const results: Array<ChildType> = [];
    children.forEach(function (child) {
      if (filterFunc(child)) {
        results.push(child);
      }
    });
    return results;
  }
  /**
   * determine if node has children
   * @method
   * @name Konva.Container#hasChildren
   * @returns {Boolean}
   */
  hasChildren() {
    return this.getChildren().length > 0;
  }
  /**
   * remove all children. Children will be still in memory.
   * If you want to completely destroy all children please use "destroyChildren" method instead
   * @method
   * @name Konva.Container#removeChildren
   */
  removeChildren() {
    this.getChildren().forEach((child) => {
      // reset parent to prevent many _setChildrenIndices calls
      child.parent = null;
      child.index = 0;
      child.remove();
    });
    this.children = [];
    // because all children were detached from parent, request draw via container
    this._requestDraw();
    return this;
  }
  /**
   * destroy all children nodes.
   * @method
   * @name Konva.Container#destroyChildren
   */
  destroyChildren() {
    this.getChildren().forEach((child) => {
      // reset parent to prevent many _setChildrenIndices calls
      child.parent = null;
      child.index = 0;
      child.destroy();
    });
    this.children = [];
    // because all children were detached from parent, request draw via container
    this._requestDraw();
    return this;
  }
  abstract _validateAdd(node: Node): void;
  /**
   * add a child and children into container
   * @name Konva.Container#add
   * @method
   * @param {...Konva.Node} children
   * @returns {Container}
   * @example
   * layer.add(rect);
   * layer.add(shape1, shape2, shape3);
   * // empty arrays are accepted, though each individual child must be defined
   * layer.add(...shapes);
   * // remember to redraw layer if you changed something
   * layer.draw();
   */
  add(...children: ChildType[]) {
    if (children.length === 0) {
      return this;
    }
    if (children.length > 1) {
      for (let i = 0; i < children.length; i++) {
        this.add(children[i]);
      }
      return this;
    }
    const child = children[0];
    if (child.getParent()) {
      child.moveTo(this);
      return this;
    }
    this._validateAdd(child);
    child.index = this.getChildren().length;
    child.parent = this;
    child._clearCaches();
    this.getChildren().push(child);
    this._fire('add', {
      child: child,
    });
    this._requestDraw();
    // chainable
    return this;
  }
  destroy() {
    if (this.hasChildren()) {
      this.destroyChildren();
    }
    super.destroy();
    return this;
  }
  /**
   * return an array of nodes that match the selector.
   * You can provide a string with '#' for id selections and '.' for name selections.
   * Or a function that will return true/false when a node is passed through.  See example below.
   * With strings you can also select by type or class name. Pass multiple selectors
   * separated by a comma.
   * @method
   * @name Konva.Container#find
   * @param {String | Function} selector
   * @returns {Array}
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
   * // get all groups with a function
   * var groups = stage.find(node => {
   *  return node.getType() === 'Group';
   * });
   *
   * // get only Nodes with partial opacity
   * var alphaNodes = layer.find(node => {
   *  return node.getType() === 'Node' && node.getAbsoluteOpacity() < 1;
   * });
   */
  find<ChildNode extends Node>(selector): Array<ChildNode> {
    // protecting _generalFind to prevent user from accidentally adding
    // second argument and getting unexpected `findOne` result
    return this._generalFind<ChildNode>(selector, false);
  }
  /**
   * return a first node from `find` method
   * @method
   * @name Konva.Container#findOne
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
  findOne<ChildNode extends Node = Node>(
    selector: string | Function
  ): ChildNode | undefined {
    const result = this._generalFind<ChildNode>(selector, true);
    return result.length > 0 ? result[0] : undefined;
  }
  _generalFind<ChildNode extends Node>(
    selector: string | Function,
    findOne: boolean
  ) {
    const retArr: Array<ChildNode> = [];

    this._descendants((node) => {
      const valid = node._isMatch(selector);
      if (valid) {
        retArr.push(node as unknown as ChildNode);
      }
      if (valid && findOne) {
        return true;
      }
      return false;
    });

    return retArr;
  }
  private _descendants(fn: (n: Node) => boolean) {
    let shouldStop = false;
    const children = this.getChildren();
    for (const child of children) {
      shouldStop = fn(child);
      if (shouldStop) {
        return true;
      }
      if (!child.hasChildren()) {
        continue;
      }
      shouldStop = (child as unknown as Container)._descendants(fn);
      if (shouldStop) {
        return true;
      }
    }
    return false;
  }
  // extenders
  toObject() {
    const obj = Node.prototype.toObject.call(this);

    obj.children = [];

    this.getChildren().forEach((child) => {
      obj.children!.push(child.toObject());
    });

    return obj;
  }
  /**
   * determine if node is an ancestor
   * of descendant
   * @method
   * @name Konva.Container#isAncestorOf
   * @param {Konva.Node} node
   */
  isAncestorOf(node: Node) {
    let parent = node.getParent();
    while (parent) {
      if (parent._id === this._id) {
        return true;
      }
      parent = parent.getParent();
    }

    return false;
  }
  clone(obj?: any) {
    // call super method
    const node = Node.prototype.clone.call(this, obj);

    this.getChildren().forEach(function (no) {
      node.add(no.clone());
    });
    return node as this;
  }
  /**
   * get all shapes that intersect a point.  Note: because this method must clear a temporary
   * canvas and redraw every shape inside the container, it should only be used for special situations
   * because it performs very poorly.  Please use the {@link Konva.Stage#getIntersection} method if at all possible
   * because it performs much better
   * nodes with listening set to false will not be detected
   * @method
   * @name Konva.Container#getAllIntersections
   * @param {Object} pos
   * @param {Number} pos.x
   * @param {Number} pos.y
   * @returns {Array} array of shapes
   */
  getAllIntersections(pos) {
    const arr: Shape[] = [];

    this.find<Shape>('Shape').forEach((shape) => {
      if (shape.isVisible() && shape.intersects(pos)) {
        arr.push(shape);
      }
    });

    return arr;
  }
  _clearSelfAndDescendantCache(attr?: string) {
    super._clearSelfAndDescendantCache(attr);
    // skip clearing if node is cached with canvas
    // for performance reasons !!!
    if (this.isCached()) {
      return;
    }
    this.children?.forEach(function (node) {
      node._clearSelfAndDescendantCache(attr);
    });
  }
  _setChildrenIndices() {
    this.children?.forEach(function (child, n) {
      child.index = n;
    });
    this._requestDraw();
  }
  drawScene(can?: SceneCanvas, top?: Node, bufferCanvas?: SceneCanvas) {
    const layer = this.getLayer()!,
      canvas = can || (layer && layer.getCanvas()),
      context = canvas && canvas.getContext(),
      cachedCanvas = this._getCanvasCache(),
      cachedSceneCanvas = cachedCanvas && cachedCanvas.scene;

    const caching = canvas && canvas.isCache;
    if (!this.isVisible() && !caching) {
      return this;
    }

    if (cachedSceneCanvas) {
      context.save();
      const m = this.getAbsoluteTransform(top).getMatrix();
      context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
      this._drawCachedSceneCanvas(context);
      context.restore();
    } else {
      this._drawChildren('drawScene', canvas, top, bufferCanvas);
    }
    return this;
  }
  drawHit(can?: HitCanvas, top?: Node) {
    if (!this.shouldDrawHit(top)) {
      return this;
    }

    const layer = this.getLayer()!,
      canvas = can || (layer && layer.hitCanvas),
      context = canvas && canvas.getContext(),
      cachedCanvas = this._getCanvasCache(),
      cachedHitCanvas = cachedCanvas && cachedCanvas.hit;

    if (cachedHitCanvas) {
      context.save();
      const m = this.getAbsoluteTransform(top).getMatrix();
      context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
      this._drawCachedHitCanvas(context);
      context.restore();
    } else {
      this._drawChildren('drawHit', canvas, top);
    }
    return this;
  }
  _drawChildren(drawMethod, canvas, top, bufferCanvas?) {
    const context = canvas && canvas.getContext(),
      clipWidth = this.clipWidth(),
      clipHeight = this.clipHeight(),
      clipFunc = this.clipFunc(),
      hasClip =
        (typeof clipWidth === 'number' && typeof clipHeight === 'number') ||
        clipFunc;

    const selfCache = top === this;

    if (hasClip) {
      context.save();
      const transform = this.getAbsoluteTransform(top);
      let m = transform.getMatrix();
      context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
      context.beginPath();
      let clipArgs;
      if (clipFunc) {
        clipArgs = clipFunc.call(this, context, this);
      } else {
        const clipX = this.clipX();
        const clipY = this.clipY();
        context.rect(clipX || 0, clipY || 0, clipWidth, clipHeight);
      }
      context.clip.apply(context, clipArgs);
      m = transform.copy().invert().getMatrix();
      context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
    }

    const hasComposition =
      !selfCache &&
      this.globalCompositeOperation() !== 'source-over' &&
      drawMethod === 'drawScene';

    if (hasComposition) {
      context.save();
      context._applyGlobalCompositeOperation(this);
    }

    this.children?.forEach(function (child) {
      child[drawMethod](canvas, top, bufferCanvas);
    });
    if (hasComposition) {
      context.restore();
    }

    if (hasClip) {
      context.restore();
    }
  }

  getClientRect(
    config: {
      skipTransform?: boolean;
      skipShadow?: boolean;
      skipStroke?: boolean;
      relativeTo?: Container<Node>;
    } = {}
  ): IRect {
    const skipTransform = config.skipTransform;
    const relativeTo = config.relativeTo;

    let minX, minY, maxX, maxY;
    let selfRect = {
      x: Infinity,
      y: Infinity,
      width: 0,
      height: 0,
    };
    const that = this;
    this.children?.forEach(function (child) {
      // skip invisible children
      if (!child.visible()) {
        return;
      }

      const rect = child.getClientRect({
        relativeTo: that,
        skipShadow: config.skipShadow,
        skipStroke: config.skipStroke,
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
    const shapes = this.find('Shape');
    let hasVisible = false;
    for (let i = 0; i < shapes.length; i++) {
      const shape = shapes[i];
      if (shape._isVisible(this)) {
        hasVisible = true;
        break;
      }
    }
    if (hasVisible && minX !== undefined) {
      selfRect = {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      };
    } else {
      selfRect = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      };
    }

    if (!skipTransform) {
      return this._transformedRect(selfRect, relativeTo);
    }
    return selfRect;
  }

  clip: GetSet<IRect, this>;
  clipX: GetSet<number, this>;
  clipY: GetSet<number, this>;
  clipWidth: GetSet<number, this>;
  clipHeight: GetSet<number, this>;
  // there was "this" instead of "Container<ChildType>",
  // but it breaks react-konva types: https://github.com/konvajs/react-konva/issues/390
  clipFunc: GetSet<
    (ctx: CanvasRenderingContext2D, shape: Container) => ClipFuncOutput,
    this
  >;
}

// add getters setters
Factory.addComponentsGetterSetter(Container, 'clip', [
  'x',
  'y',
  'width',
  'height',
]);
/**
 * get/set clip
 * @method
 * @name Konva.Container#clip
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
 * container.clip({
 *   x: 20,
 *   y: 20,
 *   width: 20,
 *   height: 20
 * });
 */

Factory.addGetterSetter(Container, 'clipX', undefined, getNumberValidator());
/**
 * get/set clip x
 * @name Konva.Container#clipX
 * @method
 * @param {Number} x
 * @returns {Number}
 * @example
 * // get clip x
 * var clipX = container.clipX();
 *
 * // set clip x
 * container.clipX(10);
 */

Factory.addGetterSetter(Container, 'clipY', undefined, getNumberValidator());
/**
 * get/set clip y
 * @name Konva.Container#clipY
 * @method
 * @param {Number} y
 * @returns {Number}
 * @example
 * // get clip y
 * var clipY = container.clipY();
 *
 * // set clip y
 * container.clipY(10);
 */

Factory.addGetterSetter(
  Container,
  'clipWidth',
  undefined,
  getNumberValidator()
);
/**
 * get/set clip width
 * @name Konva.Container#clipWidth
 * @method
 * @param {Number} width
 * @returns {Number}
 * @example
 * // get clip width
 * var clipWidth = container.clipWidth();
 *
 * // set clip width
 * container.clipWidth(100);
 */

Factory.addGetterSetter(
  Container,
  'clipHeight',
  undefined,
  getNumberValidator()
);
/**
 * get/set clip height
 * @name Konva.Container#clipHeight
 * @method
 * @param {Number} height
 * @returns {Number}
 * @example
 * // get clip height
 * var clipHeight = container.clipHeight();
 *
 * // set clip height
 * container.clipHeight(100);
 */

Factory.addGetterSetter(Container, 'clipFunc');
/**
 * get/set clip function
 * @name Konva.Container#clipFunc
 * @method
 * @param {Function} function
 * @returns {Function}
 * @example
 * // get clip function
 * var clipFunction = container.clipFunc();
 *
 * // set clip function
 * container.clipFunc(function(ctx) {
 *   ctx.rect(0, 0, 100, 100);
 * });
 *
 * container.clipFunc(function(ctx) {
 *   // optionally return a clip Path2D and clip-rule or just the clip-rule
 *   return [new Path2D('M0 0v50h50Z'), 'evenodd']
 * });
 */
