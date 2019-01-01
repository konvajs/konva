import { Util, Collection } from './Util';
import { Factory, Validators } from './Factory';
import { Container } from './Container';
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
export class Group extends Container {
  constructor(config) {
    super(config);
    this.nodeType = 'Group';
  }

  ___init(config) {
    // TODO: remove
    // call super constructor
    Container.call(this, config);
  }
  _validateAdd(child) {
    var type = child.getType();
    if (type !== 'Group' && type !== 'Shape') {
      Util.throw('You may only add groups and shapes to groups.');
    }
  }
}

Collection.mapMethods(Group);
