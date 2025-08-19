export async function mochaGlobalSetup() {
  await import('../src/skia-backend.ts');

  globalThis.Path2D ??= class Path2D {
    constructor(path) {
      this.path = path;
    }

    get [Symbol.toStringTag]() {
      return `Path2D`;
    }
  };
}
