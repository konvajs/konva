export async function mochaGlobalSetup() {
  await import('../src/skia-backend.ts');
}
