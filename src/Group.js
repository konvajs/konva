(function() {
    /**
     * Group constructor.  Groups are used to contain shapes or other groups.
     * @constructor
     * @augments Kinetic.Container
     * @param {Object} config
     * @param {Number} [config.x]
     * @param {Number} [config.y]
     * @param {Boolean} [config.visible]
     * @param {Boolean} [config.listening] whether or not the node is listening for events
     * @param {String} [config.id] unique id
     * @param {String} [config.name] non-unique name
     * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
     * @param {Object} [config.scale]
     * @param {Number} [config.scale.x]
     * @param {Number} [config.scale.y]
     * @param {Number} [config.rotation] rotation in radians
     * @param {Number} [config.rotationDeg] rotation in degrees
     * @param {Object} [config.offset] offsets default position point and rotation point
     * @param {Number} [config.offset.x]
     * @param {Number} [config.offset.y]
     * @param {Boolean} [config.draggable]
     * @param {Function} [config.dragBoundFunc] dragBoundFunc(pos, evt) should return new position
     */
    Kinetic.Group = function(config) {
        this._initGroup(config);
    };

    Kinetic.Group.prototype = {
        _initGroup: function(config) {
            this.nodeType = 'Group';

            // call super constructor
            Kinetic.Container.call(this, config);
        }
    };
    Kinetic.Global.extend(Kinetic.Group, Kinetic.Container);
})();
