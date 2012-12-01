(function() {
    /**
     * Rect constructor
     * @constructor
     * @augments Kinetic.Shape
     * @param {Object} config
     */
    Kinetic.Rect = function(config) {
        this._initRect(config);
    }
    Kinetic.Rect.prototype = {
        _initRect: function(config) {
            this.setDefaultAttrs({
                width: 0,
                height: 0,
                cornerRadius: 0
            });
            this.shapeType = "Rect";

            Kinetic.Shape.call(this, config);
            this._setDrawFuncs();
        },
        drawFunc: function(context) {
            context.beginPath();
            var cornerRadius = this.getCornerRadius(), width = this.getWidth(), height = this.getHeight();
            if(cornerRadius === 0) {
                // simple rect - don't bother doing all that complicated maths stuff.
                context.rect(0, 0, width, height);
            }
            else {
                // arcTo would be nicer, but browser support is patchy (Opera)
                context.moveTo(cornerRadius, 0);
                context.lineTo(width - cornerRadius, 0);
                context.arc(width - cornerRadius, cornerRadius, cornerRadius, Math.PI * 3 / 2, 0, false);
                context.lineTo(width, height - cornerRadius);
                context.arc(width - cornerRadius, height - cornerRadius, cornerRadius, 0, Math.PI / 2, false);
                context.lineTo(cornerRadius, height);
                context.arc(cornerRadius, height - cornerRadius, cornerRadius, Math.PI / 2, Math.PI, false);
                context.lineTo(0, cornerRadius);
                context.arc(cornerRadius, cornerRadius, cornerRadius, Math.PI, Math.PI * 3 / 2, false);
            }
            context.closePath();
            this.fillStroke(context);
        }
    };

    Kinetic.Global.extend(Kinetic.Rect, Kinetic.Shape);

})();
