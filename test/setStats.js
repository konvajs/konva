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

      stats = new Stats();
      stats.setMode(0);
      stats.domElement.style.position = 'fixed';
      stats.domElement.style.left = '0px';
      stats.domElement.style.top = '0px';
      document.body.appendChild(stats.domElement);

      function setStats() {
        stats.begin();
        requestAnimFrame(function(){
          stats.end();
          setStats();
        });
      }

      setStats();