      var stage;
      var circlesLayer;
      var circles;
      var stats;
      var width = 500;
      var height = 300;

      var VERSION = Kinetic.version === '4.7.4' || Kinetic.version === 'dev' ? 'new' : 'old';

      window.requestAnimFrame = (function(callback){
        return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback){
            window.setTimeout(callback, 1000 / 30);
        };
      })();

      function fpsCounter() {
      //fps stat---------------------------
          stats = new Stats();
          stats.setMode(0);
          stats.domElement.style.position = 'fixed';
          stats.domElement.style.left = '0px';
          stats.domElement.style.top = '0px';
          $('html').append( stats.domElement );
      }

      $(function() {
        fpsCounter();

        make_stage();
        

        var colors = ["red", "orange", "yellow", "green", "blue", "cyan", "purple"];
        var colorIndex = 0;

        circles = [];
        for(var n = 0; n < 1500; n++) {( function() {
            var color = colors[colorIndex++];
            if(colorIndex >= colors.length) {
              colorIndex = 0;
            }

            var shape = make_shape(color);
            circlesLayer.add(shape);
            circles.push(shape);
          }());
        }

        stage.add(circlesLayer);
        animate((new Date()).getTime());

      });

      function animate(lastTime){
        stats.begin();
            // update
          var date = new Date();
          var time = date.getTime();
          var timeDiff = time - lastTime;
          var period = timeDiff/1000; //times per second, our period

          for (var i = 0; i < circles.length; i++) {
            var x = Math.random() * width;
            var y = Math.random() * height;
            circles[i].setPosition(x, y);
          }
          lastTime = time;

          circlesLayer.draw();
          stats.end();
          requestAnimFrame(function(){
                  animate(lastTime);
          });
      }

      function make_shape(color) {
        if (VERSION === 'new') {
      /*
          return new Kinetic.Rect({
            fill: color,
            width: 10,
            height: 10,
            listening: false
          });
      */
 
    
          return new Kinetic.Shape({
            drawFunc: function(context) {
              var _context = context._context;
              _context.beginPath();
              _context.rect(0, 0, 10, 10);
              _context.closePath();
              _context.fillStyle = 'red';
              _context.fill();
            },
            listening: false
          });
     
        } else {
          return new Kinetic.Shape(function(){
                var context = this.getContext();
                
                context.beginPath();
                context.rect(0, 0, 10, 10);
                context.fillStyle = 'red';
                context.fill();
                context.closePath();
            });
        }
      }

      function make_stage() {
        if (VERSION === 'new') {
          stage = new Kinetic.Stage({
            container: "container",
            width: 578,
            height: 200
          });
          circlesLayer = new Kinetic.Layer();
        } else {
          stage = new Kinetic.Stage("container", width, height);
          circlesLayer = new Kinetic.Layer();
        }
      }