function equal(val1, val2, message) {
  if (val1 !== val2) {
    throw new Error('Not passed: ' + message);
  }
}

// try to import only core from the built lib, through the exports map
import Konva from 'konva/lib/Core.js';
import 'konva/canvas-backend';
import { Rect } from 'konva/lib/shapes/Rect.js';
import { Brightness } from 'konva/lib/filters/Brightness.js';
import {
  tValues,
  cValues,
  binomialCoefficients,
  getCubicArcLength,
} from 'konva/lib/BezierFunctions.js';

equal(Rect !== undefined, true, 'Rect is defined');

equal(Konva.Rect, Rect, 'Rect is injected');

// just do a simple action
const stage = new Konva.Stage();
stage.toDataURL();

const rect = new Rect({
  width: 2,
  height: 2,
  fill: '#804020',
  filters: [Brightness],
});
rect.brightness(1.5);
rect.cache({ pixelRatio: 1 });
equal(
  Array.from(
    rect.toCanvas().getContext('2d').getImageData(0, 0, 1, 1).data
  ).join(','),
  '192,96,48,255',
  'Brightness works in a minimal import'
);
rect.destroy();

// Deep imports retain the full quadrature tables, including unused orders.
for (const order of [2, 20, 24]) {
  equal(tValues[order].length, order, `Order ${order} abscissae are exported`);
  equal(cValues[order].length, order, `Order ${order} weights are exported`);
  equal(
    Math.abs(cValues[order].reduce((sum, value) => sum + value, 0) - 2) < 1e-12,
    true,
    `Order ${order} integrates a constant over [-1, 1]`
  );
}
equal(
  binomialCoefficients[3].join(','),
  '1,3,3,1',
  'Binomial coefficients remain exported'
);
equal(
  Math.abs(getCubicArcLength([0, 0, 100, 100], [0, 100, 100, 0], 1) - 200) <
    1e-9,
  true,
  'The deep cubic length export matches the analytic curve'
);
