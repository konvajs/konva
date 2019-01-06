// import commonjs from 'rollup-plugin-commonjs';
// import resolve from 'rollup-plugin-node-resolve';

// import pkg from './package.json';

// export default [
//   // browser-friendly UMD build
//   {
//     input: './lib/index.js',
//     output: {
//       name: 'Konva',
//       file: pkg.main,
//       format: 'umd'
//     },
//     plugins: [
//       resolve(),
//       commonjs() // so Rollup can convert `ms` to an ES module
//     ]
//   }
// ];

import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';

const pkg = require('./package.json');

export default {
  input: `src/index.ts`,
  output: [
    {
      file: pkg.main,
      name: 'Konva',
      format: 'umd',
      sourcemap: false,
      freeze: false
    }
    // { file: pkg.module, format: 'es', sourcemap: true }
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [],
  watch: {
    include: 'ts/**'
  },
  plugins: [
    // Allow json resolution
    // json(),
    // Compile TypeScript files
    typescript({ useTsconfigDeclarationDir: true, abortOnError: false }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve()

    // Resolve source maps to the original source
    // sourceMaps()
  ]
};
