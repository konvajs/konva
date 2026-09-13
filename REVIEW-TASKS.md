# Konva review tasks

Reviewed against Konva 10.5.0 and cleanup commit `9b1cfaa3` on 2026-09-13, including the follow-up fixes.
Completed tasks are removed. The existing scene graph, rendering, caching, and event architecture stays in place.

This is a follow-up list, not a release checklist. Remaining work needs a behavior decision, profiling, or a separate focused change.

## Remaining correctness work

- **Clipped container bounds:** `src/Container.ts` reports child bounds without intersecting the container's clip. Rectangular clips could have tighter bounds, but callback clips have no declared bounds. Define the intended `getClientRect()` behavior first.
- **Mirrored transforms:** `src/Util.ts` can represent an X flip as rotation plus a Y flip. Shadow offsets and Transformer scale signs follow that decomposition. A matrix has multiple valid decompositions; define compatible flip and shadow semantics before changing the preferred signs.
- **Stroke joins at cache edges:** large miter joins can extend outside the generic stroke padding in `src/Shape.ts`. Arrow head geometry is now included in its bounds, but thick pointed strokes can still need explicit cache padding.

## Optional improvements

These are not required to keep the current architecture clean.

- **Lazy hit drawing:** could reduce animation work, but changes when hit canvases render. Explicit `drawHit()`, hit-canvas display, and cached hit drawing need consistent behavior.
- **Viewport culling:** could help large zoomed scenes. It adds a rendering option and depends on reliable bounds for custom shapes.
- **Native text spacing:** could improve shaping and reduce per-character drawing. Check rendering and measurement together across browser, canvas, and Skia backends.
- **Shape registry lifetime:** `Konva.shapes` retains shapes until `destroy()`. Changing registration on `remove()` would affect reattachment and caching before attachment.
- **Pointer layout reads:** profile `_getContentPosition()` before introducing cached DOM geometry. Stale geometry would shift hit testing after layout changes.
- **Wedge and Star bounds:** their circular bounds are conservative. Tighter bounds would reduce cache area and Transformer padding.
- **Image loading API:** Promise support and configurable `crossOrigin` for `Image.fromURL()` are API additions, not fixes required by this cleanup.

## Decisions — do not re-raise

- The six skipped tests were reviewed. Sprite frame-rate changes, pointer capture and vertical TextPath bounds have active behavior tests. Zero-size Transformer geometry keeps the existing resize no-op behavior, covered by active tests. The inactive mirrored-shadow fixture was removed; the mirrored-transform decision above remains open.
- Click and hover state belongs to each stage and pointer. Sequential taps can use different touch IDs; overlapping contacts do not form a double-tap. Drag hit suppression applies to the affected stage; `hitOnDragEnabled` keeps its existing role within that stage.
- Web is the primary target. Avoid Node-only workarounds in shared rendering code. Gradient style getters after `save()` / `restore()` have known Node backend limitations; Konva delegates canvas state to the backend.
- Filter lengths use node coordinates. High-DPI caches preserve blur radius, pixelation size and CSS lengths; custom filters keep full-resolution ImageData and receive the cache pixel ratio as a second argument. CSS fallback blur remains an approximation of native blur.
- Non-scaling stroke bounds use the drawing canvas as their reference. Local bounds convert that padding into local units. Cached strokes are baked into the bitmap and scale with it.
- Draw errors stay thrown; no per-child `try/catch` in `_drawChildren`.
- Cached shadow rotation (#1886/#2002, `src/Context.ts`): the cache is a local-space bitmap, so a counter-rotated shadow is right only until the node rotates again. Needs a decision on semantics or docs, not a patch.
- perfectDraw clearing only the shape's client rect: would clip custom shapes whose `getSelfRect` is empty. Needs a design that does not trust the self rect.
- `new Konva.Text({ width: 'auto' })` stays untyped: every config extends `NodeConfig` (`width?: number`), so only the setter accepts `'auto'`.
- No named exports from the main entry: `import Konva from 'konva'` is the API, minimal builds import `konva/lib/...`. The UMD bundle needs a default-only entry.
- No source maps and no `src` in the package: dropped, not useful enough for the size.
- Validators stay a dev-time warning (`Konva.isUnminified`); no clamping, coercion or rejection of attribute values. NaN protection is limited to the aggregation points done in the NaN boundary commit (exports, cache, canvas size, decompose, Line/Path bounds, path parser, dragBoundFunc).
- `_remove()` reindexing O(n²): 11 ms for 3000 destroys, not worth it. `_capitalize` cache bound: not worth it.
