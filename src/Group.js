(function() {
    Konva.Util.addMethods(Konva.Group, {
        ___init: function(config) {
            this.nodeType = 'Group';
            // call super constructor
            Konva.Container.call(this, config);
        },
        _validateAdd: function(child) {
            var type = child.getType();
            if (type !== 'Group' && type !== 'Shape') {
                Konva.Util.error('You may only add groups and shapes to groups.');
            }
        }
    });
    Konva.Util.extend(Konva.Group, Konva.Container);

    Konva.Collection.mapMethods(Konva.Group);
})();
