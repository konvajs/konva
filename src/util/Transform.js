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
 * class.
 */

/**
 * Transform constructor
 * @constructor
 */
Kinetic.Transform = function() {
    this.m = [1, 0, 0, 1, 0, 0];
}

Kinetic.Transform.prototype = {
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
     * Returns the translation
     * @returns {Object} 2D point(x, y)
     */
    getTranslation: function() {
        return {
            x: this.m[4],
            y: this.m[5]
        };
    },
    /**
     * Transform multiplication
     * @param {Kinetic.Transform} matrix
     */
    multiply: function(matrix) {
        var m11 = this.m[0] * matrix.m[0] + this.m[2] * matrix.m[1];
        var m12 = this.m[1] * matrix.m[0] + this.m[3] * matrix.m[1];

        var m21 = this.m[0] * matrix.m[2] + this.m[2] * matrix.m[3];
        var m22 = this.m[1] * matrix.m[2] + this.m[3] * matrix.m[3];

        var dx = this.m[0] * matrix.m[4] + this.m[2] * matrix.m[5] + this.m[4];
        var dy = this.m[1] * matrix.m[4] + this.m[3] * matrix.m[5] + this.m[5];

        this.m[0] = m11;
        this.m[1] = m12;
        this.m[2] = m21;
        this.m[3] = m22;
        this.m[4] = dx;
        this.m[5] = dy;
    },
    /**
     * Invert the matrix
     */
    invert: function() {
        var d = 1 / (this.m[0] * this.m[3] - this.m[1] * this.m[2]);
        var m0 = this.m[3] * d;
        var m1 = -this.m[1] * d;
        var m2 = -this.m[2] * d;
        var m3 = this.m[0] * d;
        var m4 = d * (this.m[2] * this.m[5] - this.m[3] * this.m[4]);
        var m5 = d * (this.m[1] * this.m[4] - this.m[0] * this.m[5]);
        this.m[0] = m0;
        this.m[1] = m1;
        this.m[2] = m2;
        this.m[3] = m3;
        this.m[4] = m4;
        this.m[5] = m5;
    },
    /**
     * return matrix
     */
    getMatrix: function() {
        return this.m;
    }
};
