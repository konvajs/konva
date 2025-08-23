export async function mochaGlobalSetup() {
  await import('../src/canvas-backend.ts');
}
