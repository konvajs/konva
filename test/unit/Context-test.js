suite('Context', function() {
    // ======================================================
    var contextMethods = ['clearRect', 'fillRect', 'strokeRect',
        'fillText', 'strokeText', 'measureText',
        'createLinearGradient', 'createRadialGradient', 'createPattern',
        'beginPath', 'closePath', 'moveTo', 'lineTo', 'bezierCurveTo', 'quadraticCurveTo',
        'arc', 'arcTo', 'rect', 'fill', 'stroke', 'clip', 'isPointInPath',
        'scale', 'rotate', 'translate', 'transform', 'setTransform', 'drawImage',
        'createImageData', 'getImageData', 'putImageData', 'save', 'restore'];

    var contextProperties = ['fillStyle', 'strokeStyle', 'shadowColor', 'shadowBlur', 'shadowOffsetX',
        'shadowOffsetY', 'lineCap', 'lineJoin', 'lineWidth', 'miterLimit', 'font', 'textAlign', 'textBaseline',
        'globalAlpha', 'globalCompositeOperation'];

    test('context wrapper should work like native context', function() {
        var stage = addStage();

        var layer = new Konva.Layer();

        var circle = new Konva.Circle({
            x: 100,
            y: 70,
            radius: 70,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 4,
            draggable : true
        });

        layer.add(circle);
        stage.add(layer);

        var context = layer.getContext();
        var nativeContext = context._context;

        contextMethods.forEach(function(method) {
            assert.equal(typeof nativeContext[method], 'function', 'native context has no method ' + method);
            assert.equal(typeof context[method], 'function', 'context wrapper has no method ' + method);
        });

        contextProperties.forEach(function(prop) {
            assert.equal(nativeContext[prop] !== undefined, true, 'native context has no property ' + prop);
            assert.equal(context[prop] !== undefined, true, 'context wrapper has no property ' + prop);
        });

        // test get
        nativeContext.fillStyle = '#ff0000';
        assert.equal(context.fillStyle, '#ff0000');

        // test set
        context.globalAlpha = 0.5;
        assert.equal(context.globalAlpha, 0.5);
    });
});