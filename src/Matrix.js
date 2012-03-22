/*
* Last updated November 2011
* By Simon Sarris
* www.simonsarris.com
* sarris@acm.org
*
* Free to use and distribute at will
* So long as you are nice to people, etc
*/

/*
* The usage of this class was inspired by some of the work done by a forked
* project, KineticJS-Ext by Wappworks, which is based on Simon's Transform
* class.  KineticJS has slightly modified the original class and added new methods
* specific for canvas.
*/

/**
 * Matrix object
 */
Kinetic.Matrix = function() {
    this.m = [1, 0, 0, 1, 0, 0];
}

Kinetic.Matrix.prototype = {
    /**
     * Apply translation
     * @param {Number} x
     * @param {Number} y
     */
    translate: function(x, y) {
        this.m[4] += this.m[0] * x + this.m[2] * y;
        this.m[5] += this.m[1] * x + this.m[3] * y;
    },
    /**
     * Apply scale
     * @param {Number} sx
     * @param {Number} sy
     */
    scale: function(sx, sy) {
        this.m[0] *= sx;
        this.m[1] *= sx;
        this.m[2] *= sy;
        this.m[3] *= sy;
    },
    /**
     * Apply rotation
     * @param {Number} rad  Angle in radians
     */
    rotate: function(rad) {
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        var m11 = this.m[0] * c + this.m[2] * s;
        var m12 = this.m[1] * c + this.m[3] * s;
        var m21 = this.m[0] * -s + this.m[2] * c;
        var m22 = this.m[1] * -s + this.m[3] * c;
        this.m[0] = m11;
        this.m[1] = m12;
        this.m[2] = m21;
        this.m[3] = m22;
    },
    /**
     * transform canvas context
     */
    transformContext: function(context) {
        var m = this.m;
        context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
    }
};
