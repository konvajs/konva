      var stage;
      var circlesLayer;
      var circles;
      var stats;
      var width = 500;
      var height = 300;

      var VERSION = Konva.version === 'dev' ? 'new' : 'old';

      window.requestAnimFrame = (function(){
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
            var x = Math.round(Math.random() * width);
            var y = Math.round(Math.random() * height);

            circles[i].setPosition({x: x, y: y});

          }
          lastTime = time;

          circlesLayer.draw();
          stats.end();
          requestAnimFrame(function(){
                  animate(lastTime);
          });
      }

      function make_shape(color) {
        return new Konva.Rect({
          fill: color,
          width: 10,
          height: 10
        });
      }

      function make_stage() {
        stage = new Konva.Stage({
          container: "container",
          width: width,
          height: height
        });

        if (VERSION === 'new') {
          console.log('create fast layer')
          circlesLayer = new Konva.FastLayer();
        } 
        else {
          console.log('create normal layer')
          circlesLayer = new Konva.Layer();
        }
      }