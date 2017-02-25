// stats.js - http://github.com/mrdoob/stats.js
var Stats = function() {
  var l = Date.now(),
    m = l,
    g = 0,
    n = Infinity,
    o = 0,
    h = 0,
    p = Infinity,
    q = 0,
    r = 0,
    s = 0,
    f = document.createElement('div');
  f.id = 'stats';
  f.addEventListener(
    'mousedown',
    function(b) {
      b.preventDefault();
      t(++s % 2);
    },
    !1
  );
  f.style.cssText = 'width:80px;opacity:0.9;cursor:pointer';
  var a = document.createElement('div');
  a.id = 'fps';
  a.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#002';
  f.appendChild(a);
  var i = document.createElement('div');
  i.id = 'fpsText';
  i.style.cssText = 'color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
  i.innerHTML = 'FPS';
  a.appendChild(i);
  var c = document.createElement('div');
  c.id = 'fpsGraph';
  c.style.cssText = 'position:relative;width:74px;height:30px;background-color:#0ff';
  for (a.appendChild(c); 74 > c.children.length; ) {
    var j = document.createElement('span');
    j.style.cssText = 'width:1px;height:30px;float:left;background-color:#113';
    c.appendChild(j);
  }
  var d = document.createElement('div');
  d.id = 'ms';
  d.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#020;display:none';
  f.appendChild(d);
  var k = document.createElement('div');
  k.id = 'msText';
  k.style.cssText = 'color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
  k.innerHTML = 'MS';
  d.appendChild(k);
  var e = document.createElement('div');
  e.id = 'msGraph';
  e.style.cssText = 'position:relative;width:74px;height:30px;background-color:#0f0';
  for (d.appendChild(e); 74 > e.children.length; )
    j = document.createElement(
      'span'
    ), j.style.cssText = 'width:1px;height:30px;float:left;background-color:#131', e.appendChild(
      j
    );
  var t = function(b) {
    s = b;
    switch (s) {
      case 0:
        a.style.display = 'block';
        d.style.display = 'none';
        break;
      case 1:
        a.style.display = 'none', d.style.display = 'block';
    }
  };
  return {
    REVISION: 11,
    domElement: f,
    setMode: t,
    begin: function() {
      l = Date.now();
    },
    end: function() {
      var b = Date.now();
      g = b - l;
      n = Math.min(n, g);
      o = Math.max(o, g);
      k.textContent = g + ' MS (' + n + '-' + o + ')';
      var a = Math.min(30, 30 - 30 * (g / 200));
      e.appendChild(e.firstChild).style.height = a + 'px';
      r++;
      b > m + 1e3 &&
        (h = Math.round(1e3 * r / (b - m)), p = Math.min(p, h), q = Math.max(
          q,
          h
        ), i.textContent = h + ' FPS (' + p + '-' + q + ')', a = Math.min(
          30,
          30 - 30 * (h / 100)
        ), c.appendChild(c.firstChild).style.height = a + 'px', m = b, r = 0);
      return b;
    },
    update: function() {
      l = this.end();
    }
  };
};
