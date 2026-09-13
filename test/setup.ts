import Konva from '../src/index.ts';

afterEach(function () {
  if (this.currentTest?.state === 'failed') {
    return;
  }
  // destroy() removes the stage from Konva.stages, so iterate over a copy.
  Konva.stages.slice().forEach((stage) => stage.destroy());
  if (Konva.DD._dragElements.size) {
    throw new Error('Drag elements were not cleaned up');
  }
});
