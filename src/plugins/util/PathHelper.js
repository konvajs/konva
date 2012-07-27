///////////////////////////////////////////////////////////////////////
//  PathHelper
///////////////////////////////////////////////////////////////////////
Kinetic.PathHelper = {
    calcLength : function (x, y, cmd, points) {
        var len,
        p1,
        p2;
        
        switch (cmd) {
        case 'L':
            return this.getLineLength(x, y, points[0], points[1]);
        case 'C':
            // Approximates by breaking curve into 100 line segments
            len = 0.0;
            p1 = this.getPointOnCubicBezier(0, x, y, points[0], points[1], points[2], points[3], points[4], points[5]);
            for (t = 0.01; t <= 1; t += 0.01) {
                p2 = this.getPointOnCubicBezier(t, x, y, points[0], points[1], points[2], points[3], points[4], points[5]);
                len += this.getLineLength(p1.x, p1.y, p2.x, p2.y);
                p1 = p2;
            }
            return len;
        case 'Q':
            // Approximates by breaking curve into 100 line segments
            len = 0.0;
            p1 = this.getPointOnQuadraticBezier(0, x, y, points[0], points[1], points[2], points[3]);
            for (t = 0.01; t <= 1; t += 0.01) {
                p2 = this.getPointOnQuadraticBezier(t, x, y, points[0], points[1], points[2], points[3]);
                len += this.getLineLength(p1.x, p1.y, p2.x, p2.y);
                p1 = p2;
            }
            return len;
        case 'A':
            // Approximates by breaking curve into line segments
            len = 0.0;
            var start = points[4]; // 4 = theta
            var dTheta = points[5]; // 5 = dTheta
            var end = points[4] + dTheta;
            var inc = Math.PI / 180.0; // 1 degree resolution
            if (Math.abs(start - end) < inc) {
                inc = Math.abs(start - end);
            }
            // Note: for purpose of calculating arc length, not going to worry about rotating X-axis by angle psi
            
            p1 = this.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], start, 0);
            if (dTheta < 0) { // clockwise
                for (t = start - inc; t > end; t -= inc) {
                    p2 = this.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
                    len += this.getLineLength(p1.x, p1.y, p2.x, p2.y);
                    p1 = p2;
                }
            } else { // counter-clockwise
                for (t = start + inc; t < end; t += inc) {
                    p2 = this.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
                    len += this.getLineLength(p1.x, p1.y, p2.x, p2.y);
                    p1 = p2;
                }
            }
            
            p2 = this.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], end, 0);
            len += this.getLineLength(p1.x, p1.y, p2.x, p2.y);
            
            return len;
        }
        
        return 0;
    },
    getLineLength : function (x1, y1, x2, y2) {
        
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    },
    getPointOnLine : function (dist, P1x, P1y, P2x, P2y, fromX, fromY) {
        
        if (fromX === undefined) {
            fromX = P1x;
        }
        if (fromY === undefined) {
            fromY = P1y;
        }
        
        var m = (P2y - P1y) / ((P2x - P1x) + 0.00000001);
        
        var run = Math.sqrt(dist * dist / (1 + m * m));
        var rise = m * run;
        
        var pt;
        
        if ((fromY - P1y) / ((fromX - P1x) + 0.00000001) === m) {
            pt = {
                x : fromX + run,
                y : fromY + rise
            };
        } else {
            var ix,
            iy;
            
            var len = this.getLineLength(P1x, P1y, P2x, P2y);
            if (len < 0.00000001) {
                return undefined;
            }
            var u = (((fromX - P1x) * (P2x - P1x)) + ((fromY - P1y) * (P2y - P1y)));
            u = u / (len * len);
            
            ix = P1x + u * (P2x - P1x);
            iy = P1y + u * (P2y - P1y);
            
            var pRise = this.getLineLength(fromX, fromY, ix, iy);
            var pRun = Math.sqrt(dist * dist - pRise * pRise);
            
            run = Math.sqrt(pRun * pRun / (1 + m * m));
            rise = m * run;
            
            pt = {
                x : ix + run,
                y : iy + rise
            };
        }
        
        return pt;
    },
    getPointOnCubicBezier : function (pct, P1x, P1y, P2x, P2y, P3x, P3y, P4x, P4y) {
        function CB1(t) {
            return t * t * t;
        }
        function CB2(t) {
            return 3 * t * t * (1 - t);
        }
        function CB3(t) {
            return 3 * t * (1 - t) * (1 - t);
        }
        function CB4(t) {
            return (1 - t) * (1 - t) * (1 - t);
        }
        
        var x = P4x * CB1(pct) + P3x * CB2(pct) + P2x * CB3(pct) + P1x * CB4(pct);
        var y = P4y * CB1(pct) + P3y * CB2(pct) + P2y * CB3(pct) + P1y * CB4(pct);
        
        return {
            x : x,
            y : y
        };
    },
    getPointOnQuadraticBezier : function (pct, P1x, P1y, P2x, P2y, P3x, P3y) {
        function QB1(t) {
            return t * t;
        }
        function QB2(t) {
            return 2 * t * (1 - t);
        }
        function QB3(t) {
            return (1 - t) * (1 - t);
        }
        
        var x = P3x * QB1(pct) + P2x * QB2(pct) + P1x * QB3(pct);
        var y = P3y * QB1(pct) + P2y * QB2(pct) + P1y * QB3(pct);
        
        return {
            x : x,
            y : y
        };
    },
    getPointOnEllipticalArc : function (cx, cy, rx, ry, theta, psi) {
        var cosPsi = Math.cos(psi),
        sinPsi = Math.sin(psi);
        var pt = {
            x : rx * Math.cos(theta),
            y : ry * Math.sin(theta)
        };
        return {
            x : cx + (pt.x * cosPsi - pt.y * sinPsi),
            y : cy + (pt.x * sinPsi + pt.y * cosPsi)
        };
    },
    convertEndpointToCenterParameterization : function (x1, y1, x2, y2, fa, fs, rx, ry, psiDeg) {
        
        // Derived from: http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
        
        var psi = psiDeg * (Math.PI / 180.0);
        
        var xp = Math.cos(psi) * (x1 - x2) / 2.0 + Math.sin(psi) * (y1 - y2) / 2.0;
        var yp = -1 * Math.sin(psi) * (x1 - x2) / 2.0 + Math.cos(psi) * (y1 - y2) / 2.0;
        
        var lambda = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);
        
        if (lambda > 1) {
            rx *= Math.sqrt(lambda);
            ry *= Math.sqrt(lambda);
        }
        
        var f = Math.sqrt((((rx * rx) * (ry * ry)) - ((rx * rx) * (yp * yp)) - ((ry * ry) * (xp * xp))) / ((rx * rx) * (yp * yp) + (ry * ry) * (xp * xp)));
        
        if (fa == fs)
            f *= -1;
        if (isNaN(f))
            f = 0;
        
        var cxp = f * rx * yp / ry;
        var cyp = f * -ry * xp / rx;
        
        var cx = (x1 + x2) / 2.0 + Math.cos(psi) * cxp - Math.sin(psi) * cyp;
        var cy = (y1 + y2) / 2.0 + Math.sin(psi) * cxp + Math.cos(psi) * cyp;
        
        var vMag = function (v) {
            return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
        };
        var vRatio = function (u, v) {
            return (u[0] * v[0] + u[1] * v[1]) / (vMag(u) * vMag(v));
        };
        var vAngle = function (u, v) {
            return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(vRatio(u, v));
        };
        var theta = vAngle([1, 0], [(xp - cxp) / rx, (yp - cyp) / ry]);
        
        var u = [(xp - cxp) / rx, (yp - cyp) / ry];
        var v = [(-1 * xp - cxp) / rx, (-1 * yp - cyp) / ry];
        var dTheta = vAngle(u, v);
        
        if (vRatio(u, v) <= -1)
            dTheta = Math.PI;
        if (vRatio(u, v) >= 1)
            dTheta = 0;
        
        if (fs === 0 && dTheta > 0)
            dTheta = dTheta - 2 * Math.PI;
        if (fs == 1 && dTheta < 0)
            dTheta = dTheta + 2 * Math.PI;
        
        return [cx, cy, rx, ry, theta, dTheta, psi, fs];
    }
    
};
