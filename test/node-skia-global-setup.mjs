export async function mochaGlobalSetup() {
  await import(new URL('../.test-temp/src/skia-backend.js', import.meta.url));

  globalThis.Path2D ??= class Path2D {
    constructor(path) {
      this.path = path;
    }

    get [Symbol.toStringTag]() {
      return `Path2D`;
    }
  };
}
