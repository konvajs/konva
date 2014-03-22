suite('Group', function() {

  // ======================================================
  test('cache group with text', function() {
    var stage = addStage();

    var layer = new Kinetic.Layer();
    var group = new Kinetic.Group({
        draggable : true,
        x: 100,
        y: 40
    });
    var text = new Kinetic.Text({
        text : "some text",
        fontSize: 20,
        fill: "black",
        y : 50
    });

    var rect = new Kinetic.Rect({
        height : 100,
        width : 100,
        stroke : "#00B80C",
        strokeWidth: 10,
        cornerRadius: 1
    });
    group.add(text);
    group.add(rect);
    layer.add(group);

    stage.add(layer);

    group.cache({
      x: -5,
      y: -5,
      width : 110,
      height : 110,
      drawBorder: true
    }).offsetX(5).offsetY(5);

    stage.draw();
  });
});







