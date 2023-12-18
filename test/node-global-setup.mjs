export function mochaGlobalSetup() {
  globalThis.Path2D ??= class Path2D {
    constructor(path) {
      this.path = path
    }

    get [Symbol.toStringTag]() {
      return `Path2D`;
    }
  }
}
