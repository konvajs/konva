///////////////////////////////////////////////////////////////////////
//  Group
///////////////////////////////////////////////////////////////////////

/**
 * Group constructor.  Group extends Container and Node
 * @param {String} name
 */
Kinetic.Group = function(config){
    this.className = "Group";
    
    // call super constructors
    Kinetic.Container.apply(this, []);
    Kinetic.Node.apply(this, [config]);
};

Kinetic.Group.prototype = {
    /**
     * draw children
     */
    _draw: function(){
        if (this.visible) {
            this._drawChildren();
        }
    },
    /**
     * add node to group
     * @param {Node} child
     */
    add: function(child){
        this._add(child);
    },
    /**
     * remove a child from the group
     * @param {Node} child
     */
    remove: function(child){
        this._remove(child);
    }
};

// Extend Container and Node
Kinetic.GlobalObject.extend(Kinetic.Group, Kinetic.Container);
Kinetic.GlobalObject.extend(Kinetic.Group, Kinetic.Node);
