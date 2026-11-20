// Konva in a Web Worker, with no setup: it draws on OffscreenCanvas
import Konva from '../../src/index.ts';

const message = (fn: () => unknown) => {
  try {
    fn();
  } catch (e: any) {
    return e.message;
  }
};

async function run() {
  const stage = new Konva.Stage({ width: 20, height: 10 });
  const layer = new Konva.Layer();
  stage.add(layer);
  layer.add(new Konva.Rect({ width: 10, height: 10, fill: 'red' }));

  const bitmap = await createImageBitmap(await stage.toBlob());
  const ctx = new OffscreenCanvas(bitmap.width, bitmap.height).getContext(
    '2d'
  )!;
  ctx.drawImage(bitmap, 0, 0);
  const pixel = (x: number) => Array.from(ctx.getImageData(x, 5, 1, 1).data);

  return {
    backend: Konva.getCanvasBackend(),
    size: [bitmap.width, bitmap.height],
    left: pixel(5),
    right: pixel(15),
    measuresText: new Konva.Text({ text: 'Hello' }).width() > 0,
    toDataURLError: message(() => stage.toDataURL()),
    imageError: message(() => Konva.Util.createImageElement()),
    globalKonva: typeof (self as any).Konva,
  };
}

run().then(postMessage, (error) => postMessage({ error: String(error) }));
