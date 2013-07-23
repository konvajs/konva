(function() {
    Kinetic.Util.addMethods(Kinetic.Group, {
        ___init: function(config) {
            this.nodeType = 'Group';
            // call super constructor
            Kinetic.Container.call(this, config);
        }
    });
    Kinetic.Util.extend(Kinetic.Group, Kinetic.Container);
})();
