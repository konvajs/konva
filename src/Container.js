///////////////////////////////////////////////////////////////////////
//  Container
///////////////////////////////////////////////////////////////////////

/**
 * Container constructor.&nbsp; Containers are used to contain nodes or other containers
 * @constructor
 */
Kinetic.Container = function() {
    this.children = [];
    this.childrenNames = {};
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
     * get child node by name
     * @param {String} name
     */
    getChild: function(name) {
        return this.childrenNames[name];
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
        if(child.name !== undefined) {
            this.childrenNames[child.name] = undefined;
        }
        this.children.splice(child.index, 1);
        this._setChildrenIndices();
        child = undefined;
    },
    /**
     * draw children
     */
    _drawChildren: function() {
        var children = this.children;
        for(var n = 0; n < children.length; n++) {
            var child = children[n];
            if(child.className === "Shape") {
                child._draw(child.getLayer());
            } else {
                child._draw();
            }
        }
    },
    /**
     * add node to container
     * @param {Node} child
     */
    _add: function(child) {
        if(child.name) {
            this.childrenNames[child.name] = child;
        }
        child.id = Kinetic.GlobalObject.idCounter++;
        child.index = this.children.length;
        child.parent = this;

        this.children.push(child);
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
        if(this.className === "Stage") {
            var canvases = this.container.childNodes;
            var bufferCanvas = canvases[0];
            var backstageCanvas = canvases[1];

            this.container.innerHTML = "";
            this.container.appendChild(bufferCanvas);
            this.container.appendChild(backstageCanvas);
        }

        for(var n = 0; n < this.children.length; n++) {
            this.children[n].index = n;

            if(this.className === "Stage") {
                this.container.appendChild(this.children[n].canvas);
            }
        }
    }
};