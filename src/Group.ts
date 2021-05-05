import { Util } from './Util.js';
import { Container } from './Container.js';
import { _registerNode } from './Global.js';
import { Node } from './Node.js';
import { Shape } from './Shape.js';

/**
 * Group constructor.  Groups are used to contain shapes or other groups.
 * @constructor
 * @memberof Konva
 * @augments Konva.Container
 * @param {Object} config
 * @@nodeParams
 * @@containerParams
 * @example
 * var group = new Konva.Group();
 */
export class Group extends Container<Group | Shape> {
  _validateAdd(child: Node) {
    var type = child.getType();
    if (type !== 'Group' && type !== 'Shape') {
      Util.throw('You may only add groups and shapes to groups.');
    }
  }
}

Group.prototype.nodeType = 'Group';
_registerNode(Group);
