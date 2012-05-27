///////////////////////////////////////////////////////////////////////
//  Container
///////////////////////////////////////////////////////////////////////

/**
 * Container constructor.&nbsp; Containers are used to contain nodes or other containers
 * @constructor
 */
Kinetic.Container = function() {
    this.children = [];
};
/*
 * Container methods
 */
Kinetic.Container.prototype = {
    /**
     * get children
     */
    getChildren: function() {
        return this.children;
    },
    /**
     * remove all children
     */
    removeChildren: function() {
        while(this.children.length > 0) {
            this.remove(this.children[0]);
        }
    },
    /**
     * add node to container
     * @param {Node} child
     */
    add: function(child) {
        child._id = Kinetic.GlobalObject.idCounter++;
        child.index = this.children.length;
        child.parent = this;

        this.children.push(child);

        var stage = child.getStage();
        if(stage === undefined) {
            var go = Kinetic.GlobalObject;
            go.tempNodes.push(child);
        }
        else {
            stage._addId(child);
            stage._addName(child);

            /*
             * pull in other nodes that are now linked
             * to a stage
             */
            var go = Kinetic.GlobalObject;
            go._pullNodes(stage);
        }

        // do extra stuff if needed
        if(this._add !== undefined) {
            this._add(child);
        }

        // chainable
        return this;
    },
    /**
     * remove child from container
     * @param {Node} child
     */
    remove: function(child) {
        if(child.index !== undefined && this.children[child.index]._id == child._id) {
            var stage = this.getStage();
            if(stage !== undefined) {
                stage._removeId(child);
                stage._removeName(child);
            }

            var go = Kinetic.GlobalObject;
            for(var n = 0; n < go.tempNodes.length; n++) {
                var node = go.tempNodes[n];
                if(node._id === child._id) {
                    go.tempNodes.splice(n, 1);
                    n = go.tempNodes.length;
                }
            }

            this.children.splice(child.index, 1);
            this._setChildrenIndices();
            child = undefined;
        }

        // do extra stuff if needed
        if(this._remove !== undefined) {
            this._remove(child);
        }

        // chainable
        return this;
    },
    /**
     * return an array of nodes that match the selector.  Use '#' for id selections
     * and '.' for name selections
     * ex:
     * var node = stage.get('#foo'); // selects node with id foo
     * var nodes = layer.get('.bar'); // selects nodes with name bar inside layer
     * @param {String} selector
     */
    get: function(selector) {
        var stage = this.getStage();
        var arr;
        var key = selector.slice(1);
        if(selector.charAt(0) === '#') {
            arr = stage.ids[key] !== undefined ? [stage.ids[key]] : [];
        }
        else if(selector.charAt(0) === '.') {
            arr = stage.names[key] !== undefined ? stage.names[key] : [];
        }
        else if(selector === 'Shape' || selector === 'Group' || selector === 'Layer') {
            return this._getNodes(selector);
        }
        else {
            return false;
        }

        var retArr = [];
        for(var n = 0; n < arr.length; n++) {
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
     * @param {Kinetic.Node} node
     */
    isAncestorOf: function(node) {
        if(this.nodeType === 'Stage') {
            return true;
        }

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
     * get all shapes inside container
     */
    _getNodes: function(sel) {
        var arr = [];
        function traverse(cont) {
            var children = cont.getChildren();
            for(var n = 0; n < children.length; n++) {
                var child = children[n];
                if(child.nodeType === sel) {
                    arr.push(child);
                }
                else if(child.nodeType !== 'Shape') {
                    traverse(child);
                }
            }
        }
        traverse(this);

        return arr;
    },
    /**
     * draw children
     */
    _drawChildren: function() {
        var stage = this.getStage();
        var children = this.children;
        for(var n = 0; n < children.length; n++) {
            var child = children[n];
            if(child.nodeType === 'Shape') {
                if(child.isVisible() && stage.isVisible()) {
                    child._draw(child.getLayer());
                }
            }
            else {
                child.draw();
            }
        }
    },
    /**
     * set children indices
     */
    _setChildrenIndices: function() {
        /*
         * if reordering Layers, remove all canvas elements
         * from the container except the buffer and backstage canvases
         * and then readd all the layers
         */
        if(this.nodeType === 'Stage') {
            var canvases = this.content.children;
            var bufferCanvas = canvases[0];
            var backstageCanvas = canvases[1];

            this.content.innerHTML = '';
            this.content.appendChild(bufferCanvas);
            this.content.appendChild(backstageCanvas);
        }

        for(var n = 0; n < this.children.length; n++) {
            this.children[n].index = n;

            if(this.nodeType === 'Stage') {
                this.content.appendChild(this.children[n].canvas);
            }
        }
    }
};
