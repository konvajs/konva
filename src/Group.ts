import { Util } from './Util';
import { Container, ContainerConfig } from './Container';
import { _registerNode } from './Global';
import { Node } from './Node';
import { Shape } from './Shape';

export interface GroupConfig extends ContainerConfig {}

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
    const type = child.getType();
    if (type !== 'Group' && type !== 'Shape') {
      Util.throw('You may only add groups and shapes to groups.');
    }
  }
}

Group.prototype.nodeType = 'Group';
_registerNode(Group);
