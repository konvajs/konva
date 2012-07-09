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
Kinetic.Path = Kinetic.Shape.extend({
    init: function(config) {
        this.shapeType = "Path";
        this.dataArray = [];
        var that = this;

        if (config.drawFunc == null) {
            config.drawFunc = function() {
                var context = this.getContext();
                var ca = this.dataArray;
                // context position
                context.beginPath();
                for(var n = 0; n < ca.length; n++) {
                    var c = ca[n].command;
                    var p = ca[n].points;
                    switch(c) {
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
                this.fill();
                this.stroke();
            };
        }
        
        // call super constructor
        this._super(config);

        this.dataArray = this._getDataArray();

        this.on('dataChange', function() {
            that.dataArray = that._getDataArray();
        });
    },
    /**
     * get parsed data array from the data
     *  string.  V, v, H, h, and l data are converted to
     *  L data for the purpose of high performance Path
     *  rendering
     */
    _getDataArray: function() {

        // Path Data Segment must begin with a moveTo
        //m (x y)+  Relative moveTo (subsequent points are treated as lineTo)
        //M (x y)+  Absolute moveTo (subsequent points are treated as lineTo)
        //l (x y)+  Relative lineTo
        //L (x y)+  Absolute LineTo
        //h (x)+    Relative horizontal lineTo
        //H (x)+    Absolute horizontal lineTo
        //v (y)+    Relative vertical lineTo
        //V (y)+    Absolute vertical lineTo
        //z (closepath)
        //Z (closepath)
        //c (x1 y1 x2 y2 x y)+ Relative Bezier curve
        //C (x1 y1 x2 y2 x y)+ Absolute Bezier curve
        //q (x1 y1 x y)+       Relative Quadratic Bezier
        //Q (x1 y1 x y)+       Absolute Quadratic Bezier
        //t (x y)+    Shorthand/Smooth Relative Quadratic Bezier
        //T (x y)+    Shorthand/Smooth Absolute Quadratic Bezier
        //s (x2 y2 x y)+       Shorthand/Smooth Relative Bezier curve
        //S (x2 y2 x y)+       Shorthand/Smooth Absolute Bezier curve
        //a (rx ry x-axis-rotation large-arc-flag sweep-flag x y)+     Relative Elliptical Arc
        //A (rx ry x-axis-rotation large-arc-flag sweep-flag x y)+  Absolute Elliptical Arc

        // command string
        var cs = this.attrs.data;

        // return early if data is not defined
        if(!this.attrs.data) {
            return [];
        }
        // command chars
        var cc = ['m', 'M', 'l', 'L', 'v', 'V', 'h', 'H', 'z', 'Z', 'c', 'C', 'q', 'Q', 't', 'T', 's', 'S', 'a', 'A'];
        // convert white spaces to commas
        cs = cs.replace(new RegExp(' ', 'g'), ',');
        // create pipes so that we can split the data
        for(var n = 0; n < cc.length; n++) {
            cs = cs.replace(new RegExp(cc[n], 'g'), '|' + cc[n]);
        }
        // create array
        var arr = cs.split('|');
        var ca = [];
        // init context point
        var cpx = 0;
        var cpy = 0;
        for(var n = 1; n < arr.length; n++) {
            var str = arr[n];
            var c = str.charAt(0);
            str = str.slice(1);
            // remove ,- for consistency
            str = str.replace(new RegExp(',-', 'g'), '-');
            // add commas so that it's easy to split
            str = str.replace(new RegExp('-', 'g'), ',-');
            var p = str.split(',');
            if(p.length > 0 && p[0] === '') {
                p.shift();
            }
            // convert strings to floats
            for(var i = 0; i < p.length; i++) {
                p[i] = parseFloat(p[i]);
            }

            while(p.length > 0) {
                if(isNaN(p[0]))// case for a trailing comma before next command
                    break;

                var cmd = undefined;
                var points = [];
                var startX = cpx, startY = cpy;
                
                // convert l, H, h, V, and v to L
                switch(c) {

                    // Note: Keep the lineTo's above the moveTo's in this switch
                    case 'l':
                        cpx += p.shift();
                        cpy += p.shift();
                        cmd = 'L';
                        points.push(cpx, cpy);
                        break;
                    case 'L':
                        cpx = p.shift();
                        cpy = p.shift();
                        points.push(cpx, cpy);
                        break;

                    // Note: lineTo handlers need to be above this point
                    case 'm':
                        cpx += p.shift();
                        cpy += p.shift();
                        cmd = 'M';
                        points.push(cpx, cpy);
                        c = 'l';
                        // subsequent points are treated as relative lineTo
                        break;
                    case 'M':
                        cpx = p.shift();
                        cpy = p.shift();
                        cmd = 'M';
                        points.push(cpx, cpy);
                        c = 'L';
                        // subsequent points are treated as absolute lineTo
                        break;

                    case 'h':
                        cpx += p.shift();
                        cmd = 'L';
                        points.push(cpx, cpy);
                        break;
                    case 'H':
                        cpx = p.shift();
                        cmd = 'L';
                        points.push(cpx, cpy);
                        break;
                    case 'v':
                        cpy += p.shift();
                        cmd = 'L';
                        points.push(cpx, cpy);
                        break;
                    case 'V':
                        cpy = p.shift();
                        cmd = 'L';
                        points.push(cpx, cpy);
                        break;
                    case 'C':
                        points.push(p.shift(), p.shift(), p.shift(), p.shift());
                        cpx = p.shift();
                        cpy = p.shift();
                        points.push(cpx, cpy);
                        break;
                    case 'c':
                        points.push(cpx + p.shift(), cpy + p.shift(), cpx + p.shift(), cpy + p.shift());
                        cpx += p.shift();
                        cpy += p.shift();
                        cmd = 'C'
                        points.push(cpx, cpy);
                        break;
                    case 'S':
                        var ctlPtx = cpx, ctlPty = cpy;
                        var prevCmd = ca[ca.length - 1];
                        if(prevCmd.command === 'C') {
                            ctlPtx = cpx + (cpx - prevCmd.points[2]);
                            ctlPty = cpy + (cpy - prevCmd.points[3]);
                        }
                        points.push(ctlPtx, ctlPty, p.shift(), p.shift())
                        cpx = p.shift();
                        cpy = p.shift();
                        cmd = 'C';
                        points.push(cpx, cpy);
                        break;
                    case 's':
                        var ctlPtx = cpx, ctlPty = cpy;
                        var prevCmd = ca[ca.length - 1];
                        if(prevCmd.command === 'C') {
                            ctlPtx = cpx + (cpx - prevCmd.points[2]);
                            ctlPty = cpy + (cpy - prevCmd.points[3]);
                        }
                        points.push(ctlPtx, ctlPty, cpx + p.shift(), cpy + p.shift())
                        cpx += p.shift();
                        cpy += p.shift();
                        cmd = 'C';
                        points.push(cpx, cpy);
                        break;
                    case 'Q':
                        points.push(p.shift(), p.shift());
                        cpx = p.shift();
                        cpy = p.shift();
                        points.push(cpx, cpy);
                        break;
                    case 'q':
                        points.push(cpx + p.shift(), cpy + p.shift());
                        cpx += p.shift();
                        cpy += p.shift();
                        cmd = 'Q'
                        points.push(cpx, cpy);
                        break;
                    case 'T':
                        var ctlPtx = cpx, ctlPty = cpy;
                        var prevCmd = ca[ca.length - 1];
                        if(prevCmd.command === 'Q') {
                            ctlPtx = cpx + (cpx - prevCmd.points[0]);
                            ctlPty = cpy + (cpy - prevCmd.points[1]);
                        }
                        cpx = p.shift();
                        cpy = p.shift();
                        cmd = 'Q';
                        points.push(ctlPtx, ctlPty, cpx, cpy);
                        break;
                    case 't':
                        var ctlPtx = cpx, ctlPty = cpy;
                        var prevCmd = ca[ca.length - 1];
                        if(prevCmd.command === 'Q') {
                            ctlPtx = cpx + (cpx - prevCmd.points[0]);
                            ctlPty = cpy + (cpy - prevCmd.points[1]);
                        }
                        cpx += p.shift();
                        cpy += p.shift();
                        cmd = 'Q';
                        points.push(ctlPtx, ctlPty, cpx, cpy);
                        break;
                    case 'A':
                        var rx = p.shift(), ry = p.shift(), psi = p.shift(), fa = p.shift(), fs = p.shift();
                        var x1 = cpx, y1 = cpy;
                        cpx = p.shift(), cpy = p.shift();
                        cmd = 'A';
                        points = this._convertEndpointToCenterParameterization(x1, y1, cpx, cpy, fa, fs, rx, ry, psi);
                        break;
                    case 'a':
                        var rx = p.shift(), ry = p.shift(), psi = p.shift(), fa = p.shift(), fs = p.shift();
                        var x1 = cpx, y1 = cpy;
                        cpx += p.shift(), cpy += p.shift();
                        cmd = 'A';
                        points = this._convertEndpointToCenterParameterization(x1, y1, cpx, cpy, fa, fs, rx, ry, psi);
                        break;
                }

                ca.push({
                    command: cmd || c,
                    points: points,
                    start: {x: startX, y: startY},
                    pathLength: this._calcLength(startX, startY, cmd || c, points)
                });

            }

            if(c === 'z' || c === 'Z')
                ca.push({
                    command: 'z',
                    points: [],
                    start: undefined,
                    pathLength: 0
                });
        }

        return ca;
    },
    _convertEndpointToCenterParameterization: function(x1, y1, x2, y2, fa, fs, rx, ry, psiDeg) {

        // Derived from: http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes

        var psi = psiDeg * (Math.PI / 180.0);

        var xp = Math.cos(psi) * (x1 - x2) / 2.0 + Math.sin(psi) * (y1 - y2) / 2.0;
        var yp = -1 * Math.sin(psi) * (x1 - x2) / 2.0 + Math.cos(psi) * (y1 - y2) / 2.0;

        var lambda = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);

        if(lambda > 1) {
            rx *= Math.sqrt(lambda);
            ry *= Math.sqrt(lambda);
        }

        var f = Math.sqrt((((rx * rx) * (ry * ry)) - ((rx * rx) * (yp * yp)) - ((ry * ry) * (xp * xp))) / ((rx * rx) * (yp * yp) + (ry * ry) * (xp * xp)));

        if(fa == fs)
            f *= -1;
        if(isNaN(f))
            f = 0;

        var cxp = f * rx * yp / ry;
        var cyp = f * -ry * xp / rx;

        var cx = (x1 + x2) / 2.0 + Math.cos(psi) * cxp - Math.sin(psi) * cyp;
        var cy = (y1 + y2) / 2.0 + Math.sin(psi) * cxp + Math.cos(psi) * cyp;

        var vMag = function(v) {
            return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
        }
        var vRatio = function(u, v) {
            return (u[0] * v[0] + u[1] * v[1]) / (vMag(u) * vMag(v))
        }
        var vAngle = function(u, v) {
            return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(vRatio(u, v));
        }
        var theta = vAngle([1, 0], [(xp - cxp) / rx, (yp - cyp) / ry]);

        var u = [(xp - cxp) / rx, (yp - cyp) / ry];
        var v = [(-1 * xp - cxp) / rx, (-1 * yp - cyp) / ry];
        var dTheta = vAngle(u, v);

        if(vRatio(u, v) <= -1)
            dTheta = Math.PI;
        if(vRatio(u, v) >= 1)
            dTheta = 0;

        if(fs == 0 && dTheta > 0)
            dTheta = dTheta - 2 * Math.PI;
        if(fs == 1 && dTheta < 0)
            dTheta = dTheta + 2 * Math.PI;

        return [cx, cy, rx, ry, theta, dTheta, psi, fs];
    },
    _calcLength: function(x, y, cmd, points) {
        switch (cmd) {
            case 'L':
                return this._getLineLength(x, y, points[0], points[1]);
            case 'C':
                // Approximates by breaking curve into 100 line segments
                var len = 0.0;
                var p1 = this._getPointOnCubicBezier(0, x, y, points[0], points[1], points[2], points[3], points[4], points[5]);
                
                for (t=0.01; t <= 1; t += 0.01)
                {
                    var p2 = this._getPointOnCubicBezier(t, x, y, points[0], points[1], points[2], points[3], points[4], points[5]);
                    len += this._getLineLength(p1.x, p1.y, p2.x, p2.y);
                    p1 = p2;
                }
                return len;
            case 'Q':
                // Approximates by breaking curve into 100 line segments
                var len = 0.0;
                var p1 = this._getPointOnQuadraticBezier(0, x, y, points[0], points[1], points[2], points[3]);
                
                for (t=0.01; t <= 1; t += 0.01)
                {
                    var p2 = this._getPointOnQuadraticBezier(t, x, y, points[0], points[1], points[2], points[3]);
                    len += this._getLineLength(p1.x, p1.y, p2.x, p2.y);
                    p1 = p2;
                }
                return len;
            case 'A':
                // Approximates by breaking curve into line segments
                var len = 0.0;                
                var start = points[4]; // 4 = theta
                var dTheta = points[5];// 5 = dTheta
                var end = points[4] + dTheta; 

                var inc = Math.PI / 180.0; // 1 degree resolution
                if (Math.abs(start - end) < inc)
                    inc = Math.abs(start - end);

                // Note: for purpose of calculating arc length, not going to worry about rotating X-axis by angle psi
                
                var p1 = this._getPointOnEllipticalArc(points[0], points[1], points[2], points[3], start, 0); 
                
                if (dTheta < 0) // clockwise
                {
                    for (t=start - inc; t > end; t -= inc)
                    {
                        var p2 = this._getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0)
                        len += this._getLineLength(p1.x, p1.y, p2.x, p2.y);
                        p1 = p2
                    }
                }
                else // counter-clockwise
                {
                    for (t=start + inc; t < end; t += inc)
                    {
                        var p2 = this._getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0)
                        len += this._getLineLength(p1.x, p1.y, p2.x, p2.y);
                        p1 = p2
                    }
                }

                var p2 = this._getPointOnEllipticalArc(points[0], points[1], points[2], points[3], end, 0)
                len += this._getLineLength(p1.x, p1.y, p2.x, p2.y);
                
                return len;
        }
        
        return 0;
    },
    _getLineLength: function(x1, y1, x2, y2) {

        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    },
    _getPointOnLine: function(dist, P1x, P1y, P2x, P2y, fromX, fromY) {

        if (fromX === undefined)
            fromX = P1x;
            
        if (fromY === undefined)
            fromY = P1y;
            
        
        var m = (P2y - P1y) / ((P2x - P1x) + .00000001);
        var b = -1 * m * P1x + P1y;
        var run = Math.sqrt(dist * dist / (1 + m * m));
        var rise = m * run;
            
        if ((fromY - P1y) / ((fromX - P1x) + .00000001) === m)
        {
            return {x: fromX + run, y: fromY + rise};
        }
        else
        {
            var ix, iy;
   
            var len = this._getLineLength(P1x, P1y, P2x, P2y)
            if (len < 0.00000001)
                return undefined;
   
            var u = (((fromX - P1x) * (P2x - P1x)) + ((fromY - P1y) * (P2y - P1y)))
            u = u / (len * len)
            
            ix = P1x + u * (P2x - P1x)
            iy = P1y + u * (P2y - P1y)
            
            var pRise = this._getLineLength(fromX, fromY, ix, iy);
            var pRun = Math.sqrt(dist * dist - pRise * pRise); 
            
            run = Math.sqrt(pRun * pRun / (1 + m * m));
            rise = m * run;
            
            return {x: ix + run, y: iy + rise};
            
        }
    },
    _getPointOnCubicBezier: function(pct, P1x, P1y, P2x, P2y, P3x, P3y, P4x, P4y) {
        function CB1(t) { return t * t * t }
        function CB2(t) { return 3 * t * t * (1 - t) }
        function CB3(t) { return 3 * t * (1 - t) * (1 - t) }
        function CB4(t) { return (1 - t) * (1 - t) * (1 - t) }

        var x = P4x * CB1(pct) + P3x * CB2(pct) + P2x * CB3(pct) + P1x * CB4(pct);
        var y = P4y * CB1(pct) + P3y * CB2(pct) + P2y * CB3(pct) + P1y * CB4(pct);
          
        return {x: x, y: y};
    },
    _getPointOnQuadraticBezier: function(pct, P1x, P1y, P2x, P2y, P3x, P3y) {
        function QB1(t) { return t * t }
        function QB2(t) { return 2 * t * (1 - t) }
        function QB3(t) { return (1 - t) * (1 - t) }
        
        var x = P3x * QB1(pct) + P2x * QB2(pct) + P1x * QB3(pct);
        var y = P3y * QB1(pct) + P2y * QB2(pct) + P1y * QB3(pct);
          
        return {x: x, y: y};
    },
    _getPointOnEllipticalArc: function(cx, cy, rx, ry, theta, psi) {
        var cosPsi = Math.cos(psi), sinPsi = Math.sin(psi);
        var pt = {x: rx * Math.cos(theta), y: ry * Math.sin(theta)}; 
        return {x: cx + (pt.x * cosPsi - pt.y * sinPsi), y: cy + (pt.x * sinPsi + pt.y * cosPsi)};
    }
});

// add getters setters
Kinetic.Node.addGettersSetters(Kinetic.Path, ['data']);

/**
 * set SVG path data string.  This method
 *  also automatically parses the data string
 *  into a data array.  Currently supported SVG data:
 *  M, m, L, l, H, h, V, v, Q, q, T, t, C, c, S, s, A, a, Z, z
 * @name setData
 * @methodOf Kinetic.Path.prototype
 * @param {String} SVG path command string
 */

/**
 * get SVG path data string
 * @name getData
 * @methodOf Kinetic.Path.prototype
 */