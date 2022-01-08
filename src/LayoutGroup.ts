import { Util } from './Util';
import { Container } from './Container';
import { _registerNode } from './Global';
import { Node } from './Node';
import { Shape } from './Shape';
import { Group } from './Group';

/**
 * LayoutGroup constructor. LayoutGroups are used to contain shapes or other groups and lay them out.
 * @constructor
 * @memberof Konva
 * @augments Konva.Container
 * @param {Object} config
 * @@nodeParams
 * @@containerParams
 * @example
 * var group = new Konva.LayoutGroup();
 */
export class LayoutGroup extends Container<Group | LayoutGroup | Shape> {
  _validateAdd(child: Node) {
    var type = child.getType();
    if (type !== 'Group' && type !== 'Shape' && type !== 'LayoutGroup') {
      Util.throw('You may only add layoutgroups, groups and shapes to groups.');
    }
  }

  add(...children: Array<Group|Shape|LayoutGroup>) {
    const allChildren = this.getChildren().concat(children);
    let step = this.height();
    if (allChildren.length > 0) {
      step = (this.height() - this.y())/allChildren.length;
    }
    for (let i = 0; i < allChildren.length; i++) {
      const c = allChildren[i];
      c.x(0);
      c.y(i * step + 4);
      c.height(step);
      c.width(this.width());
    }
    return super.add(...children)
  }
}

LayoutGroup.prototype.nodeType = 'LayoutGroup';
_registerNode(LayoutGroup);
