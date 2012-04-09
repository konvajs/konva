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
     * remove child from container
     * @param {Node} child
     */
    _remove: function(child) {
        if(this.children[child.index]._id == child._id) {
            var stage = this.getStage();
            stage._removeId(child);
            stage._removeName(child);

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
    },
    /**
     * draw children
     */
    _drawChildren: function() {
        var children = this.children;
        for(var n = 0; n < children.length; n++) {
            var child = children[n];
            if(child.nodeType === 'Shape') {
                child._draw(child.getLayer());
            }
            else {
                child._draw();
            }
        }
    },
    /**
     * add node to container
     * @param {Node} child
     */
    _add: function(child) {
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
