import { assert } from 'chai';
import { addStage, isNode, Konva } from './test-utils';

describe('AbsoluteRenderOrderGroup', function () {
	// ======================================================
	it('check render order -- simple, no subgroups', function () {
		var stage = addStage();

		const layer = new Konva.Layer();
		stage.add(layer);

		// This will test that AbsoluteRenderOrderGroup renders based on z-order, not z-index 
		const absoluteRenderOrderGroupTest = new Konva.AbsoluteRenderOrderGroup({
			x: 0,
			y: 0
		});
		layer.add(absoluteRenderOrderGroupTest);

		const redRect = new Konva.Rect({
			x: 0,
			y: 0,
			width: 100,
			height: 100,
			fill: 'red',
			zOrder: 10 // on top
		});
		absoluteRenderOrderGroupTest.add(redRect);

		const blueRect = new Konva.Rect({
			x: 50,
			y: 50,
			width: 100,
			height: 100,
			fill: 'blue',
			zOrder: 0 // on bottom
		});
		absoluteRenderOrderGroupTest.add(blueRect);

		// Set z-order to be deliberately different from z-index
		redRect.moveToBottom();

		layer.draw();

		// Check pixel color -- should be Red if AbsoluteRenderOrderGroup is respecting the ordering
		// (More info:  https://stackoverflow.com/questions/667045/get-a-pixel-from-html-canvas )
		let context = layer.canvas.getContext();
		let imageData = context.getImageData(55, 55, 1, 1); // this is an intersecting pixel location between red & blue
		let red = imageData.data[0];

		assert.equal(red, 255, "Did not find red pixel, ordering is possibly incorrect.  Red amount found was: " + red);
	});

	it('Test AbsoluteRenderOrderGroup correctly interleaves the ordering of subgroups', function () {
		var stage = addStage();

		const layer = new Konva.Layer();
		stage.add(layer);

		const absoluteRenderOrderGroupTest = new Konva.AbsoluteRenderOrderGroup({
			x: 0,
			y: 0
		});
		layer.add(absoluteRenderOrderGroupTest);

		const group1 = new Konva.Group({
			x: 0,
			y: 0
		});

		const group2 = new Konva.Group({
			x: 25,
			y: 25,
		});

		absoluteRenderOrderGroupTest.add(group1);
		absoluteRenderOrderGroupTest.add(group2);

		// Add shapes that interleave between the groups
		// It should render as brightest red -> middle reds -> black

		const rect1 = new Konva.Rect({
			x: 0,
			y: 0,
			width: 100,
			height: 100,
			fill: '#FF0000',
			zOrder: 10 // on top
		});
		group1.add(rect1);

		const rect2 = new Konva.Rect({
			x: 0,
			y: 0,
			width: 100,
			height: 100,
			fill: '#AA0000',
			zOrder: 7
		});
		group2.add(rect2);

		const rect3 = new Konva.Rect({
			x: 50,
			y: 50,
			width: 100,
			height: 100,
			fill: '#770000',
			zOrder: 5
		});
		group1.add(rect3);

		const rect4 = new Konva.Rect({
			x: 50,
			y: 50,
			width: 100,
			height: 100,
			fill: 'black',
			zOrder: 0 // on bottom
		});
		group2.add(rect4);

		layer.draw();

		// Check pixel color -- should be Red if AbsoluteRenderOrderGroup is respecting the ordering
		// (More info:  https://stackoverflow.com/questions/667045/get-a-pixel-from-html-canvas )
		let context = layer.canvas.getContext();

		let widthCapture = 200;
		let heightCapture = 200;
		let imageData = context.getImageData(0, 0, widthCapture, heightCapture); 
		
		let red1 = imageData.data[(80+widthCapture*80)*4];
		let red2 = imageData.data[(115+widthCapture*115)*4];
		let red3 = imageData.data[(140+widthCapture*140)*4];
		let black = imageData.data[(160+widthCapture*160)*4];

		assert.equal(red1, 255, "Did not find correct amount of red in bright red pixel for test 1, ordering is possibly incorrect.  Red amount found was: " + red1);
		assert.equal(red2, 170, "Did not find correct amount of red in medium bright red pixel for test 1, ordering is possibly incorrect.  Red amount found was: " + red2);
		assert.equal(red3, 119, "Did not find correct amount of red in medium dark red pixel for test 1, ordering is possibly incorrect.  Red amount found was: " + red3);
		assert.equal(black, 0, "Did not find correct amount of red in black pixel for test 1, ordering is possibly incorrect.  Red amount found was: " + black);
	});

	it('check render order inherits null correctly', function () {
		var stage = addStage();

		const layer = new Konva.Layer();
		stage.add(layer);

		// This will test that AbsoluteRenderOrderGroup renders based on z-order, not z-index 
		const absoluteRenderOrderGroupTest = new Konva.AbsoluteRenderOrderGroup({
			x: 0,
			y: 0
		});
		layer.add(absoluteRenderOrderGroupTest);

		const redRect = new Konva.Rect({
			zOrder: 5,
			width: 100,
			height: 100,
			fill: 'red'
		});
		absoluteRenderOrderGroupTest.add(redRect);

		const groupInheritanceTest = new Konva.Group();
		absoluteRenderOrderGroupTest.add(groupInheritanceTest);

		const groupInheritanceTest2 = new Konva.Group();
		groupInheritanceTest.add(groupInheritanceTest2);

		const blueRect = new Konva.Rect({
			x: 0,
			y: 0,
			width: 100,
			height: 100,
			fill: 'blue'
		});
		groupInheritanceTest2.add(blueRect);

		layer.draw();

		// Check default z-order.
		// When looking at pixel color rendered, should be Red as the red rect has higher z-order priority than the 
		// blue rect, which at this point should be defaulting to 0
		let context = layer.canvas.getContext();
		let imageData = context.getImageData(55, 55, 1, 1); // this is an intersecting pixel location between red & blue
		let red = imageData.data[0];
		
		assert.equal(red, 255, "Default test:  Did not find red pixel, unexpected defaulting.  Red amount found was: " + red);

		// Test setting immediate parent higher and check that blue rect inherits it
		groupInheritanceTest2.zOrder(10);
		layer.draw();

		imageData = context.getImageData(55, 55, 1, 1); // this is an intersecting pixel location between red & blue
		let blue = imageData.data[2];
		
		assert.equal(blue, 255, "Immediate parent test: did not find blue pixel, unexpected defaulting.  Red amount found was: " + red);

		// Test setting parent of parent and check that blue rect inherits it
		groupInheritanceTest.zOrder(10);
		groupInheritanceTest2.zOrder(undefined);
		layer.draw();

		imageData = context.getImageData(55, 55, 1, 1); // this is an intersecting pixel location between red & blue
		blue = imageData.data[2];
		
		assert.equal(blue, 255, "Immediate parent test: did not find blue pixel, unexpected defaulting.  Red amount found was: " + red);
	});
});