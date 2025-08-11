export async function mochaGlobalSetup() {
  // Load node-canvas polyfills on the compiled test output
  // Path from this file (test/) to compiled file (.test-temp/src/...)
  try {
    await import(
      new URL('../.test-temp/src/canvas-backend.js', import.meta.url)
    );
  } catch (e) {
    // If not compiled yet or path missing, keep going; tests that need it will fail clearly
  }

  globalThis.Path2D ??= class Path2D {
    constructor(path) {
      this.path = path;
    }

    get [Symbol.toStringTag]() {
      return `Path2D`;
    }
  };
}
