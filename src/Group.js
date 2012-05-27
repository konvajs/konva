///////////////////////////////////////////////////////////////////////
//  Group
///////////////////////////////////////////////////////////////////////

/**
 * Group constructor.  Groups are used to contain shapes or other groups.
 * @constructor
 * @augments Kinetic.Container
 * @augments Kinetic.Node
 * @param {Object} config
 */
Kinetic.Group = function(config) {
    this.nodeType = 'Group';;
    
    // call super constructors
    Kinetic.Container.apply(this, []);
    Kinetic.Node.apply(this, [config]);
};
/* 
 * Group methods
 */
Kinetic.Group.prototype = {
    draw: function() {
        if(this.attrs.visible) {
            this._drawChildren();
        }
    }
};

// Extend Container and Node
Kinetic.GlobalObject.extend(Kinetic.Group, Kinetic.Container);
Kinetic.GlobalObject.extend(Kinetic.Group, Kinetic.Node);
