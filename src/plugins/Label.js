(function() {
    // constants
    var ATTR_CHANGE_LIST = ['fontFamily', 'fontSize', 'fontStyle', 'padding', 'lineHeight', 'text'],
        CHANGE_KINETIC = 'Change.kinetic',
        TEXT = 'text',
        RECT = 'rect';

    // cached variables
    attrChangeListLen = ATTR_CHANGE_LIST.length;

    /**
     * Label constructor.&nbsp; Blobs are defined by an array of points and
     *  a tension
     * @constructor
     * @param {Object} config
     * @param {String} [config.fontFamily] default is Calibri
     * @param {Number} [config.fontSize] in pixels.  Default is 12
     * @param {String} [config.fontStyle] can be normal, bold, or italic.  Default is normal
     * @param {String} config.text
     * @param {Number} [config.padding]
     * @param {Number} [config.lineHeight] default is 1
     * @param {String} [config.textFill]
     * @param {String} [config.textStroke]
     * @param {Number} [config.cornerRadius]
     * {{ShapeParams}}
     * {{NodeParams}}
     */
    Kinetic.Plugins.Label = function(config) {
        this._initLabel(config);
    };

    Kinetic.Plugins.Label.prototype = {
        _initLabel: function(config) {
            var that = this,
                text = null;

            this.createAttrs();
            Kinetic.Group.call(this, config);
            this.setText(new Kinetic.Text(config.text));
            this.setRect(new Kinetic.Rect(config.rect));
            this.add(this.getRect());
            this.add(this.getText());

            text = this.getText();
            // update text data for certain attr changes
            for(var n = 0; n < attrChangeListLen; n++) {
                text.on(ATTR_CHANGE_LIST[n] + CHANGE_KINETIC, function() {
                    that.getRect().setSize(this.getSize());            
                });
            }
        }
    };
    
    Kinetic.Global.extend(Kinetic.Plugins.Label, Kinetic.Group);

    Kinetic.Node.addGetterSetter(Kinetic.Plugins.Label, TEXT);
    Kinetic.Node.addGetterSetter(Kinetic.Plugins.Label, RECT);

})();
