// import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

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
  ],
  external: [],
  watch: {
    include: 'src/**',
  },
  plugins: [
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
  ],
};
