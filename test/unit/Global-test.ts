import { assert } from 'chai';
import { Konva } from './test-utils';

describe('Global', function () {
  // ======================================================
  it('test Konva version number', function () {
    assert.equal(!!Konva.version, true);
  });

  // ======================================================
  it('getAngle()', function () {
    // test that default angleDeg is true
    assert.equal(Konva.angleDeg, true);
    assert.equal(Konva.getAngle(180), Math.PI);

    Konva.angleDeg = false;
    assert.equal(Konva.getAngle(1), 1);

    // set angleDeg back to true for future tests
    Konva.angleDeg = true;
  });
});
