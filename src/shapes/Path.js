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
					c = 'L'; // Subsequent points are treated as lineTo
                    break;
				//case 'C':
				//	context.bezierCurveTo(p[0], p[1], p[2], p[3], path[i].p.x, path[i].p.y);
					
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
		// Note: SVG s,S,t,T,a,A not implemented here
	
	
        // command string
        var cs = this.attrs.commands;
        // command chars
        var cc = ['m', 'M', 'l', 'L', 'v', 'V', 'h', 'H', 'z', 'Z'];
        // convert white spaces to commas
        cs = cs.replace(new RegExp(' ', 'g'), ',');
        // create pipes so that we can split the commands
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
			
			while (p.length > 0)
			{
				if (isNaN(p[0])) // case for a trailing comma before next command
					break;
					
				var cmd = undefined;
				
				// convert l, H, h, V, and v to L
				switch(c) {
					case 'm':
						cmd = 'M';
						cpx += p.shift();
						cpy += p.shift();
						c = 'l'; // subsequent points are treated as relative lineTo
						break;
					case 'M':
						cmd = 'M';
						cpx = p.shift();
						cpy = p.shift();
						c = 'L'; // subsequent points are treated as absolute lineTo
						break;
					case 'l':
						cmd = 'L';
						cpx += p.shift();
						cpy += p.shift();
						break;
					case 'L':
						cmd = 'L';
						cpx = p.shift();
						cpy = p.shift();
						break;
					case 'h':
						cmd = 'L';
						cpx += p.shift();
						break;
					case 'H':
						cmd = 'L';
						cpx = p.shift();
						break;
					case 'v':
						cmd = 'L';
						cpy += p.shift();
						break;
					case 'V':
						cmd = 'L';
						cpy = p.shift();
						break;
				}

				ca.push({
					command: cmd || c,
					points: [cpx, cpy] // Need to add additional points if curves, etc.
				});

			}
			
			if (c === 'z' || c === 'Z')
				ca.push( {command: 'z', points: [] });
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
