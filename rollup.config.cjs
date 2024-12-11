// import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

const pkg = require('./package.json');

export default {
  input: `src/index.ts`,
  output: [
    {
      file: 'konva.js',
      name: 'Konva',
      format: 'umd',
      sourcemap: false,
      freeze: false,
    },
    // { file: pkg.module, format: 'es', sourcemap: true }
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [],
  watch: {
    include: 'src/**',
  },
  plugins: [
    // Allow json resolution
    // json(),
    // Compile TypeScript files
    typescript({
      useTsconfigDeclarationDir: true,
      abortOnError: false,
      removeComments: false,
      tsconfigOverride: {
        compilerOptions: {
          module: 'ES2020',
        },
      },
    }),
    // // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    // commonjs(),
    // // Allow node_modules resolution, so you can use 'external' to control
    // // which external modules to include in the bundle
    // // https://github.com/rollup/rollup-plugin-node-resolve#usage
    // resolve(),

    // Resolve source maps to the original source
    // sourceMaps()
  ],
};
