# Review tasks

Audit of `73fc720c` on 2026-09-13. Implement fixes test-first, within the current architecture.
P1: fix first. P2: correctness. P3: cleanup or optimization.

## Input and Transformer

- [ ] **P1 — Complete pointer-origin drags.** `src/DragAndDrop.ts:103`, `src/Node.ts:2644`: `startDrag(e)` inside `pointerdown` never moves or ends; window listeners handle only mouse/touch.
- [ ] **P2 — Separate capture identities by input family.** `src/PointerEvents.ts:7`, `src/Stage.ts:679`: a touch identifier can overwrite another contact's native pointer capture.
- [ ] **P2 — Stop only the requested drag.** `src/Node.ts:2723`: after two touches move together, `first.stopDrag()` stops both rectangles.
- [ ] **P2 — Match Transformer input families.** `src/shapes/Transformer.ts:820`: mouse events resize and release an anchor held by touch identifier `999`.
- [ ] **P2 — Invalidate bounds on manual Transformer rotation.** `src/shapes/Transformer.ts:1377`: documented `rotation(45); update()` resets rotation to zero with `useSingleNodeRotation(false)`.
- [ ] **P2 — Report the captured pointer ID.** `src/PointerEvents.ts:57`: generated capture notifications always contain pointer ID `0`.
- [ ] **P2 — Report the newly started touch.** `src/Stage.ts:702`: adding a second touch on empty space reports the first active touch's ID.
- [ ] **P2 — Use consistent rotation-anchor units.** `src/shapes/Transformer.ts:873`: with `angleDeg=false`, anchor placement uses degrees while movement interprets the same value as radians.
- [ ] **P2 — Read released IDs from the incoming event.** `src/DragAndDrop.ts:194`: a foreign window's touch release ends an unrelated drag using stale stage pointer data. Reproduced through owner-window handlers.

## Node state and public contracts

- [ ] **P2 — Detach before invalidating tree-dependent caches.** `src/Node.ts:1066`: a transform listener reading during removal recaches the old parent transform; detached x=10 remains absolute x=110.
- [ ] **P2 — Preserve explicit contextual values in serialization.** `src/Node.ts:1693`: explicit Text dimensions and explicit dragDistance equal to an inherited default disappear when compared with computed getter values.
- [ ] **P2 — Preserve same-gesture dragging after listener removal.** `src/Node.ts:2605`: a self-removing mousedown handler enabling dragging skips the new drag listener on that gesture.
- [ ] **P2 — Correct nullable compound-accessor types.** `src/types.ts:5`, `src/Node.ts:1417`: types accept `absolutePosition(null)`, which throws after clearing rotation, scale and offset; position/size also reject advertised null values.
- [ ] **P2 — Keep caller configurations unchanged.** `src/Node.ts:2251`, `src/Node.ts:2295`, `src/shapes/Text.ts:208`: exports delete callbacks and Text inserts fill; reused or frozen configurations fail.
- [ ] **P2 — Handle cyclic plain attributes when cloning.** `src/Util.ts:979`: `meta.self = meta` overflows `clone()`, although serialization already handles circular metadata.
- [ ] **P2 — Isolate mutable attribute defaults.** `src/Factory.ts:78`, `src/shapes/Line.ts:441`, `src/shapes/Transformer.ts:1676`: editing default points, rotationSnaps or enabledAnchors changes other instances; enabledAnchors also aliases the internal anchor-name list.
- [ ] **P3 — Populate compound change-event old values.** `src/Factory.ts:147`: `scaleChange`, offset and similar events report undefined instead of the previous component values.

## Rendering and exports

- [ ] **P2 — Round automatic bitmap extents together.** `src/Node.ts:502`, `src/Node.ts:2124`: a 10×10 rectangle at (0.25,0.25) needs 11×11 pixels; cache/export currently crops the final row and column.
- [ ] **P2 — Remove both owned layer canvases.** `src/Layer.ts:217`: removing a layer from a detached container leaves its scene canvas; a displayed hit canvas also survives removal.
- [ ] **P2 — Skip identity entries when joining CSS filters.** `src/Node.ts:766`: `['none', 'brightness(2)']` becomes invalid CSS and silently renders unchanged, unlike the fallback path.

## Text

- [ ] **P2 — Match measurement to per-character drawing.** `src/shapes/Text.ts:593`: letter spacing, justification and callbacks use unkerned advances; 80px Arial `AVAVAVAV` with letterSpacing=1 paints about 40px beyond its reported width.
- [ ] **P2 — Include underline ink in bounds.** `src/shapes/Text.ts:358`: default 40px Arial underlining paints through y=45 despite height=40, so automatic cache/export clips it.
- [ ] **P2 — Exclude trailing TextPath spacing.** `src/shapes/TextPath.ts:324`: right-aligned `abc` with letterSpacing=10 on a 200px line loses its final glyph.
- [ ] **P2 — Respect TextPath baselines in bounds and hits.** `src/shapes/TextPath.ts:392`, `src/shapes/TextPath.ts:207`: top/alphabetic text extends beyond the fixed path-centered strip and gets cropped.
- [ ] **P2 — Accumulate TextPath kerning along the path.** `src/shapes/TextPath.ts:353`: kerning shifts only the current glyph's absolute x, moving vertical text off its path and leaving later advances unchanged.
- [ ] **P2 — Apply explicit LTR direction.** `src/shapes/Text.ts:301`: `direction: 'ltr'` inherits an RTL canvas context because only RTL is assigned.
- [ ] **P3 — Use the selected fill for text decorations.** `src/shapes/Text.ts:372`: an inactive linear gradient overrides the underline color even when `fillPriority` selects a solid fill.

## Filters and numeric helpers

- [ ] **P2 — Average Pixelate colors with alpha weighting.** `src/filters/Pixelate.ts:60`: opaque red plus transparent black becomes `[128,0,0,128]`, creating a dark edge instead of translucent red.
- [ ] **P2 — Preserve source alpha in Mask.** `src/filters/Mask.ts:74`: replacing alpha with mask coverage turns a transparent foreground hole into opaque black.
- [ ] **P2 — Stabilize nearly straight quadratic lengths.** `src/BezierFunctions.ts:735`: `M0 0 Q100 0 200.0000000000001 0` reports length 208 instead of 200 due to numerical cancellation.
- [ ] **P2 — Clamp parsed CSS channels before composition.** `src/Util.ts:812`: out-of-range CSS color components distort tweens and shadow opacity; rgba alpha 2 with shadowOpacity=0.5 becomes opaque instead of half-transparent.

## Paths and geometry

- [ ] **P2 — Correct Path command state.** `src/shapes/Path.ts:749`, `src/shapes/Path.ts:782`: Z neither resets the current point nor adds closing length; omitted arcs preserve an invalid smooth-control reflection. Correct the conflicting closed-path test at `test/unit/Path-test.ts:609`.
- [ ] **P2 — Include arc endpoints and extrema in Path bounds.** `src/shapes/Path.ts:147`: `M0 0 A1000 1000 0 0 1 5 0` reports empty bounds; replace incomplete angle sampling.
- [ ] **P2 — Locate elliptical points by distance.** `src/shapes/Path.ts:343`: a quarter ellipse's halfway point differs from native SVG by 18.5px because angle is interpolated linearly.
- [ ] **P2 — Normalize SVG arc radii.** `src/shapes/Path.ts:732`: negative radii throw during drawing; [SVG radius correction](https://www.w3.org/TR/SVG/implnote.html#ArcCorrectionOutOfRangeRadii) requires their absolute values.
- [ ] **P2 — Find nonzero Arrow endpoint tangents.** `src/shapes/Arrow.ts:86`: repeated endpoint controls make vertical cubic arrows point horizontally; duplicate polyline endpoints have the same issue.
- [ ] **P2 — Align points getter types with runtime.** `src/shapes/Line.ts:382`: points() promises number[] but retains Float32Array, so concat() throws. Test directly after typed input; `test/types/types-test.ts:22` currently replaces it first.
- [ ] **P3 — Correct polygon corner-radius validation.** `src/shapes/RegularPolygon.ts:172`: a documented five-corner radius array incorrectly warns that four entries are required; fix the Number-only parameter documentation too.

## Animation, images and labels

- [ ] **P2 — Respect Tween callback teardown.** `src/Tween.ts:120`, `src/Tween.ts:459`: pause/destroy during onUpdate can restart an inert animation; destruction during the final update makes finish() read deleted state.
- [ ] **P2 — Interpolate stroke-gradient colors.** `src/Tween.ts:339`, `src/Tween.ts:396`: strokeLinearGradientColorStops falls through numeric interpolation and produces `redNaN`/`blueNaN`.
- [ ] **P2 — Normalize supported Tween array transitions.** `src/Tween.ts:318`: shrinking dash arrays produces NaN; changing scalar cornerRadius to an array throws. Preserve the requested final values.
- [ ] **P2 — Detach Label-owned child listeners.** `src/shapes/Label.ts:104`: five remove/readd cycles grow one subscription into six; removed children retain and call their former Label after destruction.
- [ ] **P2 — Notify Transformer of Sprite and Tag geometry changes.** `src/shapes/Sprite.ts:229`, `src/shapes/Label.ts:313`: frame size and pointer changes leave selection bounds stale; supply the existing size-affecting attribute metadata.
- [ ] **P2 — Observe image loading when src is initially empty.** `src/shapes/Image.ts:62`: fresh images report complete=true; assigning src after the initial layer draw loads dimensions without redrawing the blank canvas.
- [ ] **P2 — Include wide Tag pointer bases in bounds.** `src/shapes/Label.ts:276`: a 20px-wide Tag with a 60px pointer paints from x=-20 to 40, but bounds cover only 0 to 20.
- [ ] **P3 — Release Image.fromURL completion handlers.** `src/shapes/Image.ts:189`: the image retains its creation callback after loading; reassigning src invokes it again and creates another shape. Keep the callback API and CORS behavior.

## Performance and simplification

- [ ] **P3 — Preserve outer transform batches.** `src/Node.ts:1340`: nested `position()` ends an enclosing `setAttrs()` batch early; one update produces four descendant invalidation cascades.
- [ ] **P3 — Count TextPath justification spaces once.** `src/shapes/TextPath.ts:327`: 1k/2k/4k repetitions of `a ` rescan 2m/8m/32m source characters. Hoist the invariant count.
- [ ] **P3 — Reuse TextPath segment lookup progress.** `src/shapes/Path.ts:270`: 1k/2k/4k glyphs over segmented paths cause about 1.1m/4.5m/17.8m segment reads. Avoid restarting every endpoint search.
- [ ] **P3 — Remove quadratic Path array copying.** `src/shapes/Path.ts:214`, `src/shapes/Path.ts:584`: 8k/16k/32k segments took 28/204/878ms for bounds and 13/61/253ms for compressed parsing. Use appends/extrema accumulation and an input cursor.
- [ ] **P3 — Simplify cubic derivative evaluation.** `src/BezierFunctions.ts:750`: a direct formula removes 40 temporary arrays per integration; a 100k-integration Chromium benchmark improved from 132ms to 5ms. Verify end-to-end gains.
- [ ] **P3 — Exclude unused quadrature data from the main bundle.** `src/BezierFunctions.ts:4`: separate order-20 constants let bundlers omit unused rows while preserving all deep exports; an experiment saved 4,090 gzip bytes.
- [ ] **P3 — Replace Kaleidoscope's scratch canvas with an array.** `src/filters/Kaleidoscope.ts:172`: byte-identical output needs no canvas/readback, saving one 4 MiB bitmap at 1024×1024.

## Review coverage

All 62 source modules, related tests, documentation and build tooling were reviewed in parallel domain passes, followed by independent checks. Findings use source traces or focused reproductions; timings are not general performance promises.

Latest `npm test`: 1,146 browser passes; node-canvas 1,130 passes / 2 capability skips; skia-canvas 1,131 passes / 1 capability skip. Type checks, build and import checks passed. The full retry passed after the first Chromium run closed unexpectedly.

Previously closed miter bounds, clipped container bounds, mirrored transforms, cache-shadow behavior and Node-specific workarounds remain closed. No broad architectural rewrite is proposed.

No unresolved architecture decision blocks these tasks. No TODO/FIXME backlog was found in source. Runtime checks covered Chromium and Node; Firefox, Safari, broad fuzzing and a heap-retention profile were not run.
