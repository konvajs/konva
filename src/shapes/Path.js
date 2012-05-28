///////////////////////////////////////////////////////////////////////
//  SVG Path
///////////////////////////////////////////////////////////////////////
/**
 * Path constructor.  This shape was inspired by jfollas's
 *  SVG Path plugin
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 */
Kinetic.Path = function(config) {
    this.shapeType = "Path";
    this.commandsArray = [];

    config.drawFunc = function() {
        var context = this.getContext();
        var ca = this.commandsArray;
        // context position
        var cpx = 0;
        var cpy = 0;
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
                case 'z':
                context.closePath();
                    break;
            }
        }
        
        this.fill();
        this.stroke();
    };
    // call super constructor
    Kinetic.Shape.apply(this, [config]);

    this.setCommandsArray();
};
/*
 * Path methods
 */
Kinetic.Path.prototype = {
    setCommandsArray: function() {
        var c = this.attrs.commands;
        // command chars
        var cc = ['M', 'l', 'L', 'v', 'V', 'h', 'H', 'z'];
        // remove white spaces
        c = c.replace(new RegExp(' ', 'g'), '');
        for(var n = 0; n < cc.length; n++) {
            c = c.replace(new RegExp(cc[n], 'g'), '|' + cc[n]);
        }
        var arr = c.split('|');
        var ca = [];
        for(var n = 1; n < arr.length; n++) {
            var str = arr[n];
            var command = str.charAt(0);
            str = str.slice(1);
            // remove ,- for consistency
            str = str.replace(new RegExp(',-', 'g'), '-');
            // add commas so that it's easy to split
            str = str.replace(new RegExp('-', 'g'), ',-');
            var points = str.split(',');
            if(points.length > 0 && points[0] === '') {
                points.shift();
            }
            // convert strings to floats
            for(var i = 0; i < points.length; i++) {
                points[i] = parseFloat(points[i]);
            }
            ca.push({
                command: command,
                points: points
            });
        }
        // convert l, h, and v to L
        var cpx = 0;
        var cpy = 0;
        for(var n = 0; n < ca.length; n++) {
            var c = ca[n].command;
            var p = ca[n].points;
            // update context point
            switch(c) {
                case 'M':
                    cpx = p[0];
                    cpy = p[1];
                    break;
                case 'l':
                    cpx += p[0];
                    cpy += p[1];
                    break;
                case 'L':
                    cpx = p[0];
                    cpy = p[1];
                    break;
                case 'h':
                    cpx += p[0];
                    break;
                case 'H':
                    cpx = p[0];
                    break;
                case 'v':
                    cpy += p[0];
                    break;
                case 'V':
                    cpy = p[0];
                    break;
            }

            // reassign command
            if(c !== 'L' && c !== 'M') {
                ca[n].command = 'L';
                ca[n].points[0] = cpx;
                ca[n].points[1] = cpy;
            }
        }
        this.commandsArray = ca;
    }
};

// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Path, Kinetic.Shape);
