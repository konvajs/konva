# Review tasks

The audit of `73fc720c` (2026-09-13) is closed. Every task it raised is either fixed
or declined below. Fixed items are in the `## Unreleased` section of `CHANGELOG.md`.

## Declined

Real but rare defects, left unfixed on purpose: each needs an input real users almost
never produce, and each fix costs bundle size that the defect does not justify. Do not
re-raise one without new evidence that it reaches ordinary users.

- **Capture identities are not separated by input family.** `src/PointerEvents.ts`, `src/Stage.ts`: needs the opt-in `Konva.capturePointerEventsEnabled` plus a numeric collision between a touch identifier and another pointer's id. It heals itself on `pointerup`.
- **Transformer anchors do not match input families.** `src/shapes/Transformer.ts`: needs a touch identifier of exactly 999 together with a native mouse event. Real multi-touch is correct and tested.
- **Released IDs are read from stage state, not the event.** `src/DragAndDrop.ts`: needs multi-window ownership and a second finger released in the foreign window. The result is an early `dragend`.
- **A self-removing `mousedown` handler that enables dragging skips that gesture.** `src/Node.ts`: the cheap fixes make replaced react-konva handlers fire twice, and the correct fix rewrites drag-start wiring across files. `startDrag()` is the documented way.
- **`clone()` overflows on cyclic plain attributes.** `src/Util.ts`: a loud `RangeError` with an obvious workaround, against a `Set` allocation in every clone.
- **A literal `'none'` among CSS filter strings produces invalid CSS.** `src/Node.ts`: undocumented input, and the fallback path already differs.
- **`TextPath` ignores a non-middle `textBaseline` in bounds and hits.** `src/shapes/TextPath.ts`: a sub-option of a less common shape, and the fix retunes five pinned test constants.
- **`Mask` replaces source alpha with mask coverage.** `src/filters/Mask.ts`: needs opaque near-identical corners plus interior transparency, which the common use of `Mask` never has.
- **`points()` is typed `number[]` but can hold a `Float32Array`.** `src/shapes/Line.ts`: the current type was chosen deliberately. Correcting it either degrades the common `number[]` path or copies on every set.
- **`RegularPolygon` warns falsely about a per-corner radius array.** `src/shapes/RegularPolygon.ts`: a development-only warning; rendering is correct. Correct the `{Number}` JSDoc to `{Number|Array<Number>}` if you touch the file.
- **`Sprite` frame size and `Tag` pointer changes do not notify a `Transformer`.** `src/shapes/Sprite.ts`, `src/shapes/Label.ts`: attaching a Transformer to either directly is niche, and `forceUpdate()` is the documented escape hatch.
- **A `Tag` pointer wider than its body is outside the bounds.** `src/shapes/Label.ts`: only when such a Label is cached, exported or transformed.

## Coverage of the audit

All 62 source modules, their tests, documentation and build tooling were reviewed in
parallel domain passes, followed by independent checks. Runtime checks covered Chromium
and Node. Firefox, Safari, broad fuzzing and a heap-retention profile were not run.

No TODO/FIXME backlog was found in source, and no unresolved architecture decision came
out of the audit.
