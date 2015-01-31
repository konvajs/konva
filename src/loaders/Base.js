(function() {

	Konva.Loader.Base = function (config) {
		this.__init(config);
	};

	Konva.Loader.Base.prototype = {
		__init: function(config) {
			this.cache = {};
			this.toLoad = [];
			this.count = 0;

			//error needs to be here, a container must be added
			this.container = config.container;
			this.clearEvents = config.clearEvents || false;
		},
		set: function(node) {
			this.toLoad.push(node);
		},
		progress: function(node) {
			this.count = this.count + 1;

			this.container.fire('progress', node);
			if (this.count == this.toLoad.length) {
				this.container.fire('complete', this.container);
				this._cleanup();
			}
		},
		//cleanup and remove events if needed
		_cleanup: function() {
			this.count = 0;
			this.toLoad = [];
			if (this.clearEvents) {
				this.container.off('progress complete');
			}
		}
	};


	Konva.Factory.addGetterSetter(Konva.Image, 'src');

    /**
    * get/set src
    * @name src
    * @method
    * @memberof Konva.Image.prototype
    * @param {String} src
    * @returns {String}
    */

    Konva.Factory.addGetterSetter(Konva.Sprite, 'src');

    /**
    * get/set src
    * @name src
    * @method
    * @memberof Konva.Sprite.prototype
    * @param {String} src
    * @returns {String}
    */
})();