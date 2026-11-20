// `npm run build`, after tsc and rollup: fills the placeholders of the compiled
// code and minifies the bundle
import fs from 'node:fs';
import { minify } from 'terser';

const { version } = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const include = (name) =>
  fs.readFileSync(`resources/doc-includes/${name}.txt`, 'utf8');

function fill(file, values) {
  let code = fs.readFileSync(file, 'utf8');
  for (const [key, value] of Object.entries(values)) {
    code = code.split(key).join(value);
  }
  fs.writeFileSync(file, code);
  return code;
}

fill('lib/Global.js', { '@@version': version });
const bundle = fill('konva.js', {
  '@@shapeParams': include('ShapeParams'),
  '@@nodeParams': include('NodeParams'),
  '@@containerParams': include('ContainerParams'),
  '@@version': version,
  '@@date': new Date().toDateString(),
});
const { code } = await minify(bundle, {
  format: { comments: /^!|@preserve|@license|@cc_on/i },
});
fs.writeFileSync('konva.min.js', code);
