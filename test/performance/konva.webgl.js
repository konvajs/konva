Konva.WebGLLayer = function(config) {
    this.nodeType = 'Layer';
    this.canvas = new Konva.SceneWebGLCanvas();
    this.hitCanvas = new Konva.HitCanvas({
        pixelRatio : 1
    });
    // call super constructor
    Konva.BaseLayer.call(this, config);
};

Konva.Util.extend(Konva.WebGLLayer, Konva.Layer);

Konva.SceneWebGLCanvas = function(config) {
    var conf = config || {};
    var width = conf.width || 0,
        height = conf.height || 0;

    Konva.Canvas.call(this, conf);
    WebGL2D.enable(this._canvas);
    this.context = new Konva.SceneWebGLContext(this);
    this.setSize(width, height);
};

Konva.Util.extend(Konva.SceneWebGLCanvas, Konva.SceneCanvas);

Konva.SceneWebGLContext = function(canvas) {
    this.canvas = canvas;
    this._context = canvas._canvas.getContext('webgl-2d');

    if (Konva.enableTrace) {
        this.traceArr = [];
        this._enableTrace();
    }
};

Konva.Util.extend(Konva.SceneWebGLContext, Konva.SceneContext);