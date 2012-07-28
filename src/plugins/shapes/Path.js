///////////////////////////////////////////////////////////////////////
//  SVG Path
///////////////////////////////////////////////////////////////////////
/**
 * Path constructor.
 * @author Jason Follas
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 */
Kinetic.Plugins.Path = Kinetic.Shape.extend({
    init: function(config) {
        this.shapeType = "Path";
        this.dataArray = [];
        var that = this;

        config.drawFunc = this.drawFunc;
        // call super constructor
        this._super(config);
        this.dataArray = Kinetic.Geometry.parsePathData(this.attrs.data);
        this.on('dataChange', function() {
            that.dataArray = Kinetic.Geometry.parsePathData(that.attrs.data);
        });
    },
    drawFunc: function(context) {
        var ca = this.dataArray;
        // context position
        context.beginPath();
        for(var n = 0; n < ca.length; n++) {
            var c = ca[n].command;
            var p = ca[n].points;
            switch (c) {
                case 'L':
                    context.lineTo(p[0], p[1]);
                    break;
                case 'M':
                    context.moveTo(p[0], p[1]);
                    break;
                case 'C':
                    context.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]);
                    break;
                case 'Q':
                    context.quadraticCurveTo(p[0], p[1], p[2], p[3]);
                    break;
                case 'A':
                    var cx = p[0], cy = p[1], rx = p[2], ry = p[3], theta = p[4], dTheta = p[5], psi = p[6], fs = p[7];

                    var r = (rx > ry) ? rx : ry;
                    var scaleX = (rx > ry) ? 1 : rx / ry;
                    var scaleY = (rx > ry) ? ry / rx : 1;

                    context.translate(cx, cy);
                    context.rotate(psi);
                    context.scale(scaleX, scaleY);
                    context.arc(0, 0, r, theta, theta + dTheta, 1 - fs);
                    context.scale(1 / scaleX, 1 / scaleY);
                    context.rotate(-psi);
                    context.translate(-cx, -cy);

                    break;
                case 'z':
                    context.closePath();
                    break;
            }
        }
        this.fill(context);
        this.stroke(context);
    }
});

// add getters setters
Kinetic.Node.addGettersSetters(Kinetic.Plugins.Path, ['data']);

/**
 * set SVG path data string.  This method
 *  also automatically parses the data string
 *  into a data array.  Currently supported SVG data:
 *  M, m, L, l, H, h, V, v, Q, q, T, t, C, c, S, s, A, a, Z, z
 * @name setData
 * @methodOf Kinetic.Plugins.Path.prototype
 * @param {String} SVG path command string
 */

/**
 * get SVG path data string
 * @name getData
 * @methodOf Kinetic.Plugins.Path.prototype
 */