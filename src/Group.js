(function() {
  'use strict';
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
  Konva.Group = function(config) {
    this.___init(config);
  };

  Konva.Util.addMethods(Konva.Group, {
    ___init: function(config) {
      this.nodeType = 'Group';
      // call super constructor
      Konva.Container.call(this, config);
    },
    _validateAdd: function(child) {
      var type = child.getType();
      if (type !== 'Group' && type !== 'Shape') {
        Konva.Util.throw('You may only add groups and shapes to groups.');
      }
    }
  });
  Konva.Util.extend(Konva.Group, Konva.Container);

  Konva.Collection.mapMethods(Konva.Group);
})();
