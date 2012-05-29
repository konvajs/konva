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

    this.commandsArray = this.getCommandsArray();
};
/*
 * Path methods
 */
Kinetic.Path.prototype = {
    /**
     * get parsed commands array from the commands
     *  string.  V, v, H, h, and l commands are converted to
     *  L commands for the purpose of high performance Path
     *  rendering
     */
    getCommandsArray: function() {
        // command string
        var cs = this.attrs.commands;
        // command chars
        var cc = ['M', 'l', 'L', 'v', 'V', 'h', 'H', 'z'];
        // remove white spaces
        cs = cs.replace(new RegExp(' ', 'g'), '');
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
            // convert l, H, h, V, and v to L
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
            if(c == 'l' || c == 'V' || c == 'v' || c == 'H' || c == 'h') {
                c = 'L';
                p[0] = cpx;
                p[1] = cpy;
            }
            ca.push({
                command: c,
                points: p
            });
        }
        return ca;
    },
    /**
     * get SVG path commands string
     */
    getCommands: function() {
        return this.attrs.commands;
    },
    /**
     * set SVG path commands string.  This method
     *  also automatically parses the commands string
     *  into a commands array.  Currently supported SVG commands:
     *  M, L, l, H, h, V, v, z
     * @param {String} SVG path command string
     */
    setCommands: function(commands) {
        this.attrs.commands = commands;
        this.commandsArray = this.getCommandsArray();
    }
};

// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Path, Kinetic.Shape);
