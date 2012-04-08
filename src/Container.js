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

        var go = Kinetic.GlobalObject;
        go.addId(child);
        go.addName(child);
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
