(function() {

	Konva.Loader.Default = function (config) {
		this.__init(config);
	};

	Konva.Loader.Default.prototype.load = function() {
		var self = this;

		if (this.toLoad.length) {
			this.toLoad.forEach(function (node) {
				var image = new Image();
				image.onload = function () {
					node.setImage(image);
					self.progress(node);
				}
				image.src = node.getSrc();
			});
		} else {
			//there is nothing to load, fire complete
			this.container.fire('complete', this.container);
		}
	}

	Konva.Util.extend(Konva.Loader.Default, Konva.Loader.Base);
})();