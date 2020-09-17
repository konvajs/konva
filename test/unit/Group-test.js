suite('Group', function () {
  // ======================================================
  test('cache group with text', function () {
    var stage = addStage();

    var layer = new Konva.Layer();
    var group = new Konva.Group({
      draggable: true,
      x: 50,
      y: 40,
    });
    var text = new Konva.Text({
      text: 'some text',
      fontSize: 20,
      fill: 'black',
      y: 50,
    });

    var rect = new Konva.Rect({
      height: 100,
      width: 100,
      stroke: 'black',
      strokeWidth: 10,
      // cornerRadius: 1,
    });
    group.add(text);
    group.add(rect);
    layer.add(group);

    stage.add(layer);

    group
      .cache({
        x: -15,
        y: -15,
        width: 150,
        height: 150,
      })
      .offsetX(5)
      .offsetY(5);

    layer.draw();

    cloneAndCompareLayer(layer, 200);
  });
});
