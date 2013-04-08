(function() {
    /**
     * Container constructor.&nbsp; Containers are used to contain nodes or other containers
     * @constructor
     * @augments Kinetic.Node
     * @param {Object} config
     * {{NodeParams}}
     * {{ContainerParams}}
     */
    Kinetic.Container = function(config) {
        this._containerInit(config);
    };

    Kinetic.Container.prototype = {
        _containerInit: function(config) {
            this.children = [];
            Kinetic.Node.call(this, config);
        },
        /**
         * get children
         * @name getChildren
         * @methodOf Kinetic.Container.prototype
         */
        getChildren: function() {
            return this.children;
        },
        /**
         * remove all children
         * @name removeChildren
         * @methodOf Kinetic.Container.prototype
         */
        removeChildren: function() {
            while(this.children.length > 0) {
                this.children[0].remove();
            }
        },
        /**
         * add node to container
         * @name add
         * @methodOf Kinetic.Container.prototype
         * @param {Node} child
         */
        add: function(child) {
            var go = Kinetic.Global, children = this.children;
            child.index = children.length;
            child.parent = this;
            children.push(child);

            // chainable
            return this;
        },
        /**
         * return an array of nodes that match the selector.  Use '#' for id selections
         * and '.' for name selections
         * ex:
         * var node = stage.get('#foo'); // selects node with id foo
         * var nodes = layer.get('.bar'); // selects nodes with name bar inside layer
         * @name get
         * @methodOf Kinetic.Container.prototype
         * @param {String} selector
         */
        get: function(selector) {
            var collection = new Kinetic.Collection();
            // ID selector
            if(selector.charAt(0) === '#') {
                var node = this._getNodeById(selector.slice(1));
                if(node) {
                    collection.push(node);
                }
            }
            // name selector
            else if(selector.charAt(0) === '.') {
                var nodeList = this._getNodesByName(selector.slice(1));
                Kinetic.Collection.apply(collection, nodeList);
            }
            // unrecognized selector, pass to children
            else {
                var retArr = [];
                var children = this.getChildren();
                var len = children.length;
                for(var n = 0; n < len; n++) {
                    retArr = retArr.concat(children[n]._get(selector));
                }
                Kinetic.Collection.apply(collection, retArr);
            }
            return collection;
        },
        _getNodeById: function(key) {
            var stage = this.getStage(), go = Kinetic.Global, node = go.ids[key];
            if(node !== undefined && this.isAncestorOf(node)) {
                return node;
            }
            return null;
        },
        _getNodesByName: function(key) {
            var go = Kinetic.Global, arr = go.names[key] || [];
            return this._getDescendants(arr);
        },
        _get: function(selector) {
            var retArr = Kinetic.Node.prototype._get.call(this, selector);
            var children = this.getChildren();
            var len = children.length;
            for(var n = 0; n < len; n++) {
                retArr = retArr.concat(children[n]._get(selector));
            }
            return retArr;
        },
        // extenders
        toObject: function() {
            var obj = Kinetic.Node.prototype.toObject.call(this);

            obj.children = [];

            var children = this.getChildren();
            var len = children.length;
            for(var n = 0; n < len; n++) {
                var child = children[n];
                obj.children.push(child.toObject());
            }

            return obj;
        },
        _getDescendants: function(arr) {
            var retArr = [];
            var len = arr.length;
            for(var n = 0; n < len; n++) {
                var node = arr[n];
                if(this.isAncestorOf(node)) {
                    retArr.push(node);
                }
            }

            return retArr;
        },
        /**
         * determine if node is an ancestor
         * of descendant
         * @name isAncestorOf
         * @methodOf Kinetic.Container.prototype
         * @param {Kinetic.Node} node
         */
        isAncestorOf: function(node) {
            var parent = node.getParent();
            while(parent) {
                if(parent._id === this._id) {
                    return true;
                }
                parent = parent.getParent();
            }

            return false;
        },
        /**
         * clone node
         * @name clone
         * @methodOf Kinetic.Container.prototype
         * @param {Object} attrs override attrs
         */
        clone: function(obj) {
            // call super method
            var node = Kinetic.Node.prototype.clone.call(this, obj)

            // perform deep clone on containers
            for(var key in this.children) {
                node.add(this.children[key].clone());
            }
            return node;
        },
        /**
         * get shapes that intersect a point
         * @name getIntersections
         * @methodOf Kinetic.Container.prototype
         * @param {Object} point
         */
        getIntersections: function() {
            var pos = Kinetic.Type._getXY(Array.prototype.slice.call(arguments));
            var arr = [];
            var shapes = this.get('Shape');

            var len = shapes.length;
            for(var n = 0; n < len; n++) {
                var shape = shapes[n];
                if(shape.isVisible() && shape.intersects(pos)) {
                    arr.push(shape);
                }
            }

            return arr;
        },
        /**
         * set children indices
         */
        _setChildrenIndices: function() {
            var children = this.children, len = children.length;
            for(var n = 0; n < len; n++) {
                children[n].index = n;
            }
        },
        drawScene: function(canvas) {
            var layer = this.getLayer(),
                clip = !!this.getClipFunc(),
                stage = this.getStage(),
                children, len;
                
            if (!canvas && layer) {
                canvas = layer.getCanvas(); 
            }  

            if(this.isVisible()) {
                if (clip) {
                    canvas._clip(this);
                }
                
                children = this.children; 
                len = children.length;
                
                for(var n = 0; n < len; n++) {
                    children[n].drawScene(canvas);
                }
                
                if (clip) {
                    canvas.getContext().restore();
                }
            }
        },
        drawHit: function() {
            var clip = !!this.getClipFunc() && this.nodeType !== 'Stage',
                n = 0, 
                len = 0, 
                children = [],
                hitCanvas;

            if(this.shouldDrawHit()) {
                if (clip) {
                    hitCanvas = this.getLayer().hitCanvas; 
                    hitCanvas._clip(this);
                }
                
                children = this.children; 
                len = children.length;

                for(n = 0; n < len; n++) {
                    children[n].drawHit();
                }
                if (clip) {
                    hitCanvas.getContext().restore();
                }
            }
        }
    };

    Kinetic.Global.extend(Kinetic.Container, Kinetic.Node);

    // add getters setters
    Kinetic.Node.addGetterSetter(Kinetic.Container, 'clipFunc');

    /**
     * set clipping function 
     * @name setClipFunc
     * @methodOf Kinetic.Container.prototype
     * @param {Number} deg
     */

    /**
     * get clipping function 
     * @name getClipFunc
     * @methodOf Kinetic.Container.prototype
     */
})();
