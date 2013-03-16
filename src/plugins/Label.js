(function() {
    // constants
    var ATTR_CHANGE_LIST = ['fontFamily', 'fontSize', 'fontStyle', 'padding', 'lineHeight', 'text'],
        CHANGE_KINETIC = 'Change.kinetic',
        NONE = 'none',
        TOP = 'top',
        RIGHT = 'right',
        BOTTOM = 'bottom',
        LEFT = 'left';

    // cached variables
    attrChangeListLen = ATTR_CHANGE_LIST.length;

    /**
     * Label constructor.&nbsp; Blobs are defined by an array of points and
     *  a tension
     * @constructor
     * @param {Object} config
     * @param {String} [config.arrow] can be none, top, right, bottom, or left.  none is the default
     * @param {Number} [config.arrowWidth]
     * @param {Number} [config.arrowHeight]
     * @param {Object} config.text
     * @param {Object} config.rect
     * @param {String} [config.text.fontFamily] default is Calibri
     * @param {Number} [config.text.fontSize] in pixels.  Default is 12
     * @param {String} [config.text.fontStyle] can be normal, bold, or italic.  Default is normal
     * @param {String} config.text.text
     * @param {String} [config.text.align] can be left, center, or right
     * @param {Number} [config.text.padding]
     * @param {Number} [config.text.width] default is auto
     * @param {Number} [config.text.height] default is auto
     * @param {Number} [config.rect.lineHeight] default is 1
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
            text = this.getText();
            this.setRect(new Kinetic.Polygon(config.rect));
            this.add(this.getRect());
            this.add(this.getText());

            this._setPoints();

            // update text data for certain attr changes
            for(var n = 0; n < attrChangeListLen; n++) {
                text.on(ATTR_CHANGE_LIST[n] + CHANGE_KINETIC, function() {
                    that._setPoints();
                });
            }
        },
        _setPoints: function() {
            var text = this.getText(),
                width = text.getWidth(),
                height = text.getHeight(),
                points = [],
                arrow = this.getArrow(),
                arrowWidth = this.getArrowWidth(),
                arrowHeight = this.getArrowHeight();

            // top left corner
            points.push(0);
            points.push(0);


            if (arrow === TOP) {
                points.push((width - arrowWidth)/2, 0);
                points.push(width/2, -1 * arrowHeight);
                points.push((width + arrowWidth)/2, 0);
            }
 
            // top right
            points.push(width);
            points.push(0);
            
            if (arrow === RIGHT) {
                points.push(width, (height - arrowHeight)/2);
                points.push(width + arrowWidth, height/2);
                points.push(width, (height + arrowHeight)/2);
            } 
           
            // bottom right
            points.push(width);
            points.push(height);

            if (arrow === BOTTOM) {
                points.push((width + arrowWidth)/2, height);
                points.push(width/2, height + arrowHeight);
                points.push((width - arrowWidth)/2, height);
            } 

            // bottom left
            points.push(0);
            points.push(height);
        
            if (arrow === LEFT) {
                points.push(0, (height + arrowHeight)/2);
                points.push(0 - arrowWidth, height/2);
                points.push(0, (height - arrowHeight)/2);
            } 

            this.getRect().setPoints(points);
        }
    };
    
    Kinetic.Global.extend(Kinetic.Plugins.Label, Kinetic.Group);

    Kinetic.Node.addGetterSetter(Kinetic.Plugins.Label, 'text');
    Kinetic.Node.addGetterSetter(Kinetic.Plugins.Label, 'rect');
    Kinetic.Node.addGetterSetter(Kinetic.Plugins.Label, 'arrow', NONE);
    Kinetic.Node.addGetterSetter(Kinetic.Plugins.Label, 'arrowWidth', 0);
    Kinetic.Node.addGetterSetter(Kinetic.Plugins.Label, 'arrowHeight', 0);
})();
