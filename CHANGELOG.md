# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## Unreleased

- Added `Group.isolated()`. An isolated group draws its children into a transparent canvas, then applies its `opacity` and `globalCompositeOperation` once to the result, like SVG `<g opacity>`. Child blend modes and erasing stay inside the group. Unlike `cache()`, the content stays live
- Added `Shape.selfRectFunc()` for custom shapes: returns the local area its `sceneFunc` paints, so bounds, `cache()`, isolated groups and perfect drawing include paint outside `width` and `height`
- Improved performance and memory of translucent shapes with fill and stroke ("perfect drawing"): built-in shapes use a buffer the size of the shape instead of the whole stage, and the buffer is freed when no longer used. Glyphs with many stacked marks can be clipped in this mode
- Fixed a crash when a translucent shape with fill and stroke is drawn on a stage without size
- Fixed translucent shapes with fill and stroke rendered at the wrong resolution when a layer pixel ratio differs from `Konva.pixelRatio`
- Fixed `getClientRect()` of `Arc`, `Ring` and `Star` when the inner radius is larger than the outer radius or a radius is negative
- Fixed `TextPath` with `strokeScaleEnabled(false)` drawing its stroke near the canvas origin. Like `Text`, it now always scales its stroke
- Fixed `Tag` bounds when its pointer is wider than its side
- Fixed a layer staying clipped in every later draw after a `sceneFunc` threw
- Removed `Stage.bufferCanvas` and the third `bufferCanvas` argument of `drawScene()`

## 10.6.0 (2026-09-19)

- Improved `Path` arc performance: bounds of an arc segment are computed exactly instead of sampled every degree, and a point on a circular arc is found with a closed form instead of walking the arc
- Improved `Text.getClientRect()` and `getSelfRect()` of underlined text, which no longer measure the font on every call
- Fixed `blurRadius`, `pixelSize` and CSS filter lengths (for example `blur(8px)`) being applied in cache pixels instead of node coordinates, so a filtered node looked less blurred at a higher cache `pixelRatio`. Note: custom filter functions now receive `(imageData, pixelRatio)`; use the ratio to convert node lengths to pixels
- Fixed a drag started from a `pointerdown` handler (`startDrag(e)`, for example react-konva `onPointerDown`) never moving or ending and leaving the node stuck as dragging
- Fixed `stopDrag()` ending every active drag instead of only the drags of its own gesture, so a node dragged by another finger stopped too. Note: `stopDrag()` on a node that is not dragging is now a no-op
- Fixed a `touchstart` on empty stage area reporting the `pointerId` of the oldest active touch instead of the finger that just touched down
- Fixed `gotpointercapture` and `lostpointercapture` always reporting `pointerId` 0 instead of the captured pointer
- Fixed `Transformer` resetting a manually set `rotation()` back to zero on the next `update()` when `useSingleNodeRotation` is off
- Fixed `Transformer` rotating by the wrong amount when `rotateAnchorAngle` is used with `Konva.angleDeg = false`
- Fixed `node.remove()` leaving a stale absolute transform when a listener or a `Transformer` read the node's position during removal
- Fixed `toObject()`, `toJSON()` and `clone()` dropping an explicit `width`, `height` or `dragDistance` that happened to equal the computed value, so a restored `Text` re-flowed. Note: such attributes are now present in the serialized output
- Fixed `Konva.Text` and `toImage()`/`toBlob()` mutating the configuration object passed by the caller, which broke frozen and reused configurations
- Fixed mutating the array returned by an unset `points()`, `enabledAnchors()` or `rotationSnaps()` corrupting every other node that used the same default. Note: an unset array attribute now returns a new array on each read
- Fixed compound change events such as `scaleChange`, `offsetChange` and `skewChange` reporting `oldVal` as `undefined`
- Fixed `cache()` and `toCanvas()`/`toDataURL()`/`toImage()` cropping the last pixel row and column of content at a fractional position. Note: an automatically sized cache or export can now be one pixel larger, and a cache whose origin is past the content is skipped instead of built with a negative size
- Fixed `layer.remove()` and `layer.destroy()` leaving the layer canvases in the stage content when the stage container is not in the document, and never removing a hit canvas shown with `toggleHitCanvas()`
- Fixed out-of-range CSS color components, such as `rgba(0, 0, 0, 2)` or `rgb(120%, 0, 0)`, distorting shadow opacity and color tweens
- Fixed the types of `position()`, `absolutePosition()`, `size()` and `Stage.container()` accepting `null` and `undefined`, which throw at runtime. Note: `node.absolutePosition(stage.getPointerPosition())` no longer compiles, because the pointer position can be `null`
- Fixed `Text` reporting a width smaller than it paints with `letterSpacing`, `align: 'justify'` or `charRenderFunc`, because measurement used kerning while drawing does not
- Fixed `Text` bounds ignoring the underline, so `cache()`, `getClientRect()` and `toDataURL()` clipped it. Note: bounds of underlined text are now taller than `height()`
- Fixed `Text` with `direction: 'ltr'` inheriting the direction of an RTL canvas, because only `'rtl'` was applied
- Fixed `Text` underline and line-through ignoring `fillPriority`, radial gradients and patterns instead of using the fill the text is drawn with
- Fixed `TextPath` `kerningFunc` moving glyphs off curved and vertical paths, and not being counted in the text width
- Fixed `TextPath` dropping its last character with `align: 'right'` and a positive `letterSpacing`, and adding a phantom trailing spacing to its bounds
- Fixed a close command (`z`) in `Path` data not travelling back to the start of the subpath. Note: `getLength()` of a closed path now includes the closing edge, as in SVG, and a relative command after `z` starts from the subpath start
- Fixed `Path.getSelfRect()` of an arc segment missing its end point, which reported an empty rect for a sub-degree arc
- Fixed `Path.getPointAtLength()` on a non-circular arc interpolating the angle instead of the distance, which bunched `TextPath` glyphs on ovals and made path animations change speed
- Fixed a negative arc radius in `Path` data throwing during a draw and aborting the layer. Note: an arc is now drawn with a single `ellipse()` call
- Fixed the length of a quadratic curve whose control point lies on the chord, which returned `Infinity` and made `TextPath` text disappear
- Fixed `Arrow` pointing its head horizontally when the line has repeated endpoints, for example a polyline finished by a double click
- Fixed `Konva.Image` created from a fresh `new Image()` never redrawing when its `src` is assigned afterwards
- Fixed `Konva.Image.fromURL()` calling its callback again, and creating a duplicate node, when the `src` of the loaded image is changed later
- Fixed `Label` stacking a new set of listeners on a child every time it is re-added, which multiplied its internal work and kept a removed child calling a destroyed `Label`
- Fixed `Konva.Filters.Pixelate` darkening blocks that mix opaque and transparent pixels, such as the edges of circles, text and images with alpha
- Fixed `Tween` restarting its animation when `pause()` or `destroy()` is called from `onUpdate`, and throwing from `finish()`/`reset()` after such a `destroy()`
- Fixed tweening `strokeLinearGradientColorStops` producing invalid colors such as `redNaN` and breaking every following draw
- Fixed tweening an array attribute such as `dash` to a shorter array writing `NaN`, and tweening between a scalar and an array `cornerRadius` throwing

## 10.5.0 (2026-09-08)

- Added `Stage.eventBatchFunc()` for framework integrations to batch native input handlers. Note: direct `fire()` calls and programmatic changes are not batched
- Improved `Transformer` performance with many selected nodes: unchanged shape bounds are reused, and anchors are not rebuilt when the selection rectangle is unchanged
- Fixed `touchcancel` leaving a `Transformer` active and releasing the capture of an untouched pointer. Note: cancellation now fires `pointercancel`/`touchcancel` in addition to the existing `pointerup`
- Fixed `toBlob()` typed as `Promise<unknown>`. It resolves with a `Blob`, and rejects instead of resolving with `null` when the canvas can not be encoded
- Fixed the `Konva.Node` JSDoc block attaching to a private helper, which dropped the `Konva.Node` page from the API reference

## 10.4.0 (2026-09-07)

- Added `destroy` event, fired at the start of `node.destroy()`. `Transformer` drops a destroyed node from `nodes()` and `Tween` stops the tweens of a destroyed node
- Added `width()` and `height()` to `Path`
- Added `Konva.Transform#isInvertible()`
- Added grapheme-aware text layout: flag emoji and ZWJ sequences stay together for `letterSpacing`, `charRenderFunc` and wrapping. `letterSpacing` now adds one spacing per grapheme instead of per UTF-16 code unit
- Improved `Transformer` performance: anchors are resolved directly instead of by selector
- Improved `Text` performance with `charRenderFunc` and when wrapping a long text (both were quadratic in text length)
- Improved `Text` and `TextPath` creation performance. Note: relayout listeners now live on the prototype, so `text.off('textChange.konva')` no longer removes them
- Improved `TextPath` layout performance on paths with many segments
- Improved hit detection on the edges of shapes: thin lines are hittable on their own pixels, and edge search is faster and no longer walks to an unrelated shape nearby
- Improved `container.getClientRect()`, drag and drop, `Animation` start/stop, component getters and `Image` drawing performance. Note: `Konva.Animation.animations` is now a `Set`
- Reduced memory usage of `cache()`, `toCanvas()`, `toDataURL()`, `toImage()` and `toBlob()`. Note: a cropped export no longer includes shadows of shapes lying fully outside the crop
- Reduced memory usage per node. `hasStroke()` returns a boolean instead of the stroke width
- Reduced canvas memory usage of `Text`, `TextPath` and CSS filter strings, and fixed a canvas leak on every draw of a node with CSS filters
- Published type declarations keep their JSDoc, so editors show the documentation on hover
- Fixed `Transformer` ignoring changes of attached nodes made between pointer moves during a resize (regression in 10.3.1)
- Fixed `Transformer` following the wrong finger during a pinch, writing `NaN` when resizing a zero-size node, not refreshing on `padding` change, blanking the hit graph of unrelated layers, and being misplaced inside a cached or transformed container
- Fixed `layer.size()` shrinking the layer canvas. A layer follows the stage size
- Fixed `container.getChildren()` and `stage.getLayers()` returning the internal array. They return a copy
- Fixed `clearCache()` of a container un-caching every descendant and leaking their canvases
- Fixed `cache()`, `setAttrs()` and `setPosition()` leaving a node in a broken state after an exception in a `sceneFunc`, a filter or a setter
- Fixed `setAbsolutePosition()` and dragging writing `NaN` under an ancestor with a zero scale
- Fixed a negative `radius` or `cornerRadius` throwing during draw and blanking the shapes after it
- Fixed `layer.batchDraw()` never drawing again after a draw threw
- Fixed `toObject()` and `toJSON()` modifying the node: circular or DOM attributes were lost, frozen state threw, and a custom attribute named like a node method invoked it
- Fixed the absolute getters and `Transformer` of a node inside a cached container. Note: `getClientRect()` under a cached ancestor is now absolute like everywhere else
- Fixed `hasShadow()` not updating when only `shadowOffsetX` or `shadowOffsetY` changes
- Fixed `node.fire(type, null, true)` throwing
- Fixed `node.clone()` sharing nested array attributes with the original
- Fixed `Tween`: component attributes (`scale`, `offset`...) wrote junk attributes, gradient color stops were replaced in the node's own array, `onUpdate`/`onReset` were tweened, the first tween of a page could not be cancelled, and `node.to()` modified its params. `node.to()` returns the tween
- Fixed deprecated `setDashArray()` setting nothing and deprecated aliases returning nothing
- Fixed `Path` bounds for rotated elliptical arcs and empty paths, parsing of SVGO-compressed arcs and `00` coordinates, and `getPointAtLength()` past the end of an arc. Degenerate data (truncated commands, zero-radius arcs, a number after `z`) follows SVG instead of producing `NaN` or hanging
- Fixed `Sprite` keeping its interval after `destroy()`, throwing on an unknown animation or frame, and missing `getSelfRect()`
- Fixed `RegularPolygon` without `sides` throwing from every draw
- Fixed `Tag.getSelfRect()` with `pointerDirection` `left` or `right`
- Fixed `TextPath` with a `kerningFunc`, and its underline thickness now matches `Text`
- Fixed `isLastInLine` of `charRenderFunc` for the last character of every line
- Fixed `Blur` filter darkening semi-transparent pixels and producing an empty image for a large `blurRadius` (now capped at 180)
- Fixed `hue` of the HSL and HSV filters mirroring outside -360..360, and the exact reference matrix is used
- Fixed the named color `transparent` fading through white
- Fixed `Konva.pixelRatio` set to `0` or `undefined` not falling back to the device pixel ratio
- Fixed canvas sizes at a fractional pixel ratio, which stretched cached nodes and stage exports by up to a pixel
- Fixed `drawHitFromCache()` with a `hitCanvasPixelRatio` other than 1
- Fixed `releaseCapture()` releasing a pointer held by another shape
- Fixed drag and drop: a clamping `dragBoundFunc` blocked a new drag, `startDrag()` off stage threw, lifting one finger cancelled the drags of other fingers, and `startDrag()` without an event never ended
- Fixed a non-finite size, position, `dragBoundFunc` result or export rect silently blanking a layer or exporting the wrong image. An error is logged instead
- Fixed type declarations: `clipFunc` context, `line.points()` typed arrays, `text.width('auto')`, `tag.cornerRadius()` array, `stage.container('id')`, `getClientRect()` config, `oldVal`/`newVal` on change events, namespace types, `new Konva.FastLayer()` without config. Removed the `fillLinearRadial*` declarations that had no implementation
- Fixed many JSDoc mistakes and broken examples
- Removed dead code, unused files and dev dependencies. Fixed the build and release scripts

## 10.3.3 (2026-09-04)

- No code changes. Updated npm package metadata (description, keywords, homepage) and README to describe what Konva is used for and to point at Polotno for a complete design editor built on Konva

## 10.3.2 (2026-08-26)

- Reduced canvas memory usage, most of all for non-interactive scenes. A layer with `listening: false` (and every layer of a non-listening stage) now releases its stage-sized hit canvas instead of keeping it allocated, and re-creates it when it starts listening again. The two stage-sized buffer canvases of every `Konva.Stage` are now created empty and only allocated by the first feature that needs them ("perfect drawing" and `shape.intersects()`). `node.cache()` of a non-listening node skips its cached hit canvas the same way, building it only if the node starts listening (previously such a node kept an empty cached hit graph and stayed unhittable until re-cached). Note: after turning `listening` back on, the hit graph appears on the next layer draw (automatic unless `Konva.autoDrawEnabled` is off - then call `layer.draw()`, as a single `shape.draw()` is not enough to re-create the layer hit canvas)
- Fixed `charRenderFunc` of `Konva.Text` ignoring `fillStyle`/`strokeStyle` set on the context by the callback. A style set for a character now wins over the shape attributes for that character, as documented
- Fixed `setPointerCapture()` not capturing the pointer on the stage container, so the stage kept missing pointer events outside of its bounds. A captured pointer now keeps sending `pointermove`/`pointerup` to the stage beyond its edges, like pointer capture on plain HTML elements
- Fixed `pointerclick` firing after a drag and drop, while `click` correctly did not
- Fixed `Transformer` shaking the shape when a corner anchor with `keepRatio` was dragged across the shape with `padding` enabled
- Fixed `Transformer` switching its active anchor when `boundBoxFunc` rejects a flip. A rejected flip now keeps the grabbed anchor active, so resizing keeps following the pointer — and `getActiveAnchor()` inside `boundBoxFunc` now reports the anchor being held instead of the prematurely flipped one
- Fixed drag and drop of a stage rendered in another window than the one Konva was imported into - an iframe, or a window opened with `window.open`. Such a stage now uses the pointer events of its own window, and a pointer move in another window no longer drags its nodes
- Fixed `Transformer` of such a stage, which got no pointer move or release events at all
- Fixed `layer.batchDraw()` of such a stage, which asked the window Konva was imported into for the frame and stopped drawing when that window was not visible
- Fixed `stage.destroy()` leaving the content of such a stage in the container

## 10.3.1 (2026-08-14)

- Added `hsla()` support and the space-separated CSS Color 4 syntax to `Konva.Util.colorToRGBA()`
- Declared `canvas` and `skia-canvas` as optional peer dependencies, so the node backends resolve under strict package managers
- Improved `Transformer` performance with many attached nodes
- Improved `Text` performance when a long text is resized
- `Path.getSelfRect()` now solves the bounds of a cubic segment exactly instead of sampling it at 100 points. Reported boxes get slightly larger and more accurate, and the calculation is about 9 times faster
- `Line.getSelfRect()` now solves the bounds of a line with a `tension` exactly, instead of using the box around its tension control points. Reported boxes get smaller and tighter, by about 19% of their area on a typical line
- `Path.getSelfRect()` now also solves the bounds of a quadratic segment (`Q`, `q`, `T` and `t`) exactly, instead of using the box around its control points. Reported boxes get smaller and tighter
- A tween of a color that Konva can not parse now throws a clear error
- Fixed several wrong named color values: `darkgoldenrod`, `floralwhite`, `plum`, `slategray`, `slategrey`, `snow` and `yellowgreen`
- Fixed the alpha of the named color `transparent`, so a tween to or from it fades again
- Fixed `rgb()` colors with percentage components
- Fixed `hsl()` colors with a non-integer hue or extra whitespace
- Fixed `fillPatternImage` ignoring `imageSmoothingEnabled`
- Fixed `Arc.getSelfRect()` for a zero-degree clockwise arc and for any full-turn angle
- Fixed `Path.getPointAtLength()` returning `undefined` past the end of a closed path
- Fixed `NaN` bounding rect on a closed `Line` with a tension and coincident points
- Fixed `getSelfRect()` on a `Line` with `bezier: true`, which read only the first curve segment and could report a box of zero height
- Fixed the `ValidatorFunc` type used by custom `Factory` validators

## 10.3.0 (2026-04-30)

- Added `direction` property to `TextPath` shape for better RTL support

## 10.2.5 (2026-04-11)

- Fixed transparent text with shadow render in Safari

## 10.2.4 (2026-04-10)

- Fixed possible event execution order

## 10.2.3 (2026-03-16)

- More crash fixes

## 10.2.1 (2026-03-13)

- Fix possible crash

## 10.2.0 (2026-01-15)

- Added `rotateAnchorAngle` property to `Transformer` to control the position of the rotation anchor around the bounding box

## 10.1.0 (2026-01-14)

- Added underline offset option and related test for Text Annotation
- Fixed large memory usage on cache
- Fix bounding box calculation for bezier lines
- Fixed cached render with buffer canvas is used

## 10.0.12 (2025-11-21)

- Better canvas farbling detection logic

## 10.0.11 (2025-11-20)

- Fixed broken release

## 10.0.10 (2025-11-20)

- Update hit detection system to handle canvas farbling. Hit detection should work better on Brave browser. Thanks [@wiverson](https://github.com/wiverson) to the idea and implementation idea.

## 10.0.9 (2025-11-08)

- Fixed line-through rendering when letter spacing is used

## 10.0.8 (2025-10-24)

- Fixed opacity level when a cached shape has opacity, fill and stroke

## 10.0.7 (2025-10-22)

- Fixed image element size re-calculation when change is changed with transformer is used.

## 10.0.6 (2025-10-22)

- Better `Image.getClientRect()` calculation if an instance has no image attached yet

## 10.0.5 (2025-10-22)

- Simplify types to fix TS errors

## 10.0.4 (2025-10-21)

- Remove logs

## 10.0.3 (2025-10-21)

- Add text decoration options to TextPath: support for 'line-through' and combined styles with 'underline'

## 10.0.2 (2025-09-10)

- Fixed internal calculations for `TextPath` to return correct width and height

## 10.0.1 (2025-09-09)

- Fixed `line-through` render for center/right aligned text

## 10.0.0 (2025-09-07)

### Breaking Changes

- **Breaking**: Konva module is fully migrated from CommonJS modules to ES modules. It may break some older bundlers and CommonJS environments. In CommonJS environment you have to use default property from require:

```js
// before
const Konva = require('konva');

// after
const Konva = require('konva').default;
```

- **Breaking:** Dropped default support for node.js environment. Now you have to explicitly import it:

```bash
npm install canvas
```

```js
import Konva from 'konva';
import 'konva/canvas-backend';
```

Motivation: With increased usage of `konva` in SSR environments like Next.js, loading native canvas rendering on the server is unnecessary since we don't render canvas content server-side. Removing this requirement simplifies setup by avoiding native modules when they aren't needed.

- Improved text positioning to match DOM/CSS rendering. To restore previous behaviour use `Konva.legacyTextRendering = true`. This should NOT break major part of the apps. But if you care about pixel-perfect position of text elements, that change may effect you.

### New Features

- Added new `skia` render backend for node.js:

```bash
npm install skia-canvas
```

```js
import Konva from 'konva';
import 'konva/skia-backend';
```

- Native filters support via `node.filters(['blur(10px)'])`. Native fitlers works MUCH faster if supported nativily (Chrome, Firefox). If there is no native support, Konva will automatially fallback to functional filter (on Safari).

```js
node.filters(['blur(10px')]);
node.cache();
```

- New property `charRenderFunc` for `Konva.Text` for controlling "per-character-render". May be useful any character animations:

```js
var text = new Konva.Text({
  x: 10,
  y: 10,
  text: 'AB',
  fontSize: 20,
  charRenderFunc: function ({ context, index }) {
    if (index === 1) {
      // shift only the second character
      context.translate(0, 10);
    }
  },
});
```

- **New**: Added `Konva.Filters.Brightness` filter in replace of deprecated `Konva.Filters.Brighten` to better match with css filters logic.
- Added `cornerRadius` support for `Konva.RegularPolygon`
- Added `miterLimit` property support for `Konva.Shape` to control line join appearance

### Bug Fixes

- Fixed corner radius render for `Konva.Rect` when negative width or height are used
- Fixed TextPath rendering on right align for some fonts
- Fixed crash when node inside transformer was destroyed
- Fixed mouseup + click events order when clicked on empty area of stage
- Fixed transformer drag behavior with non-draggable nodes

### Technical Improvements

- **Performance**: Rewrote Emboss and Solarize filters for improved performance and usability
- Changed return type of `node.toImage()`
- Brave detection and warning

## 9.3.22 (2025-07-08)

- Fixed possible crash on `node.to()` method

## 9.3.21 (2025-07-07)

- Fixed memory leaks on Tween destroy
- Fixed incorrect export of stage/layer when internal nodes used buffer canvas for rendering
- Fixed incorrect render of cached node when buffer canvas is used
- Fixed incorrect path lenth calculations
- Fixed `pointerleave` bubbling
- Added `pointerleave` event in `Stage`

## 9.3.20 (2025-03-20)

- Fix text rendering when ellipses are used

## 9.3.19 (2025-03-12)

- Typescript fixes
- Memory leak fixes

## 9.3.18 (2024-12-23)

- Fixed emoji split in multiple lines

## 9.3.17 (2024-12-23)

- Fixed `Arrow.getClientRect()`
- Fixed emoji rendering with letterSpacing
- Fixed line-through for justify text
- Changes in letter spacing width calculations to match DOM rendering

## 9.3.16 (2024-10-21)

- Fix freeze on ios on touch cancel event
- Typescript fixes

## 9.3.15 (2024-09-09)

- fix letter spacing for Hindi text
- ts fixes

### 9.3.14 (2024-07-16)

- Fix shadow + corner radius for images
- Support `fillRule` for `Konva.Shape` on hit graph

### 9.3.13 (2024-07-05)

- Fallback for `Konva.Text.measureSize()` when 2d context doesn't return full data

### 9.3.12 (2024-06-20)

- Fix stopped transforming when it was triggered by multi-touch
- Fix svg `path.getPointAtLength()` calculations in some cases
- Fix `shape.getClientRect()` when any of parents is cached

### 9.3.11 (2024-05-23)

- Fix chrome clear canvas issue
- Typescript fixes

### 9.3.9 (2024-05-20)

- Fix underline and line-through for `Konva.Text` when `Konva._fixTextRendering = true`

### 9.3.8 (2024-05-15)

- Fix click events fires on stage
- Temporary `Konva._fixTextRendering = true` flag to fix inconsistent text

### 9.3.6 (2024-03-04)

- Fix transformer bug to enable hit graph back

### 9.3.5 (2024-03-04)

- `tranformer` event will be triggered AFTER all data of transformer is updated
- Improve performance of transformer

### 9.3.4 (2024-03-03)

- Fix clipping with zero size

### 9.3.3 (2024-02-09)

- Another fix for exporting buffered shapes

### 9.3.2 (2024-01-26)

- Fix large memory usage on node export

### 9.3.1 (2024-01-17)

- Fix Pixelate filter work/fix caching size
- Fix node export when large buffer canvas is used

### 9.3.0 (2023-12-20)

- New attribute `rotateLineVisible` for `Konva.Transformer` to show/hide rotate line

### 9.2.3 (2023-10-31)

- Better `Konva.Transformer` work when it has `flipEnabled = false`.

### 9.2.2 (2023-09-14)

- Better RTL support
- Some typescript fixes

### 9.2.1 (2023-09-14)

- Fix text rendering when text has both underline and shadow
- Typescript fixes

### 9.2.0 (2023-05-14)

- More controls on clipping
- `fillRule` for `Konva.Shape`

### 9.1.0 (2023-05-14)

- New `anchorStyleFunc` for `Konva.Transformer` to customize anchor style

### 9.0.2 (2023-05-14)

- Better text rendering when it has stroke

### 9.0.1 (2023-04-17)

- Better performance for any instance creation
- Little typescript fixes

### 9.0.0 (2023-04-13)

- Migrate the npm package from ES back to CommonJS

### 8.4.4 (2023-04-05)

- Some fixes for `Konva.TextPath` calculations and rendering.
- Resolve "willReadFrequently" warning in Chrome

### 8.4.3 (2023-03-23)

- Typescript fixes
- Better validation for `Konva.Transfomer` `nodes` property

### 8.4.2 (2023-01-20)

- Fix justify on text with limited height

### 8.4.1 (2023-01-19)

- Typescript fixes for `container.add()` method. Ability to use empty array as argument. E.g. `container.add(...emptyArray)`
- Fix underline for justify text
- Fix gradient display on underline or line-through text

### 8.4.0 (2023-01-05)

- Add support for `cornerRadius` for Konva.Image
- Fix cloning of `Konva.Transformer`

### 8.3.14 (2022-11-09)

- Automatically release (destroy) used canvas elements. Should fix safari memory issues

### 8.3.13 (2022-10-03)

- Typescript fixes
- Better non-passive events usage
- Better 2d context usage to avoid Chrome warnings

### 8.3.12 (2022-08-29)

- `ellipsis` fixes for `Konva.Text`
- Allow reset component attributes via overloader

### 8.3.11 (2022-08-05)

- Fix `Konva.Label` position when tag attributes are changed
- Fix incorrect ellipsis display for `Konva.Text`
- Fix `click` event trigger on parent containers on touch devices
- Fix incorrect `mouseleave` event trigger when drag is finished

### 8.3.10 (2022-06-20)

- Skip `Konva.Transformer` in `container.getClientRect()` calculations

### 8.3.9 (2022-05-27)

- Typescript fixes

### 8.3.8 (2022-05-05)

- Disable all exports in `package.json`

### 8.3.7 (2022-05-04)

- Migrate to CommonJS exports only

### 8.3.6 (2022-04-27)

- Better exports definitions. Importing `Konva` should work better in different bundlers and test environments.
- `imageSmoothingEnabled` option for `node.toDataURL()`, `node.toCanvas()` and `node.toImage()`

## 8.3.5 (2022-03-21)

- Quick fix for `toCanvas()` and `toDataURL()` size calculation.

## 8.3.4 (2022-03-13)

- Fix characters positions calculations on `fontFamily` changes in `TextPath`.
- Remove rounding in `node.getClientRect()` results
- Fix event object on `transformstart` event.

## 8.3.3 (2022-02-23)

- Fix `justify` align for text with several paragraphs.

## 8.3.2

- Remove source maps for webpack builds

## 8.3.1 (2021-12-09)

- Fix `dbltap` event in Safari
- A bit faster `node.moveToTop()` when node is already on top
- Better client rect calculations for `Konva.Arc` shape.

## 8.3.0 (2021-11-15)

- new `transformer.anchorDragBoundFunc` method.

## 8.2.4 (2021-11-15)

- Fix not working `Konva.Transformer` when several transformers were used

## 8.2.2

- Fix `Konva.Arrow` rendering when it has two pointers

## 8.2.1

- Fix `package.json` exports.

## 8.2.0

- Restore build in CommonJS. `const Konva = require('konva/cmj').default;`
- Fix arrow rendering when dash is used
- Fix `dbltap` trigger when multi-touch is used

## 8.1.4

- Fix `dblclick` event when `cancelBubble` is used.

## 8.1.3

- Fix `fillPattern` cache invalidation on shapes

## 8.1.2

- Fix memory leak for `Konva.Image`

## 8.1.1

- Fix `Konva.Transformer` dragging draw when `shouldOverdrawWholeArea = true`.
- Fix auto redraw when `container.removeChildren()` or `container.destroyChildren()` are used

## 8.1.0

- New property `useSingleNodeRotation` for `Konva.Transformer`.

## 8.0.4

- Fix fill pattern updates on `fillPatternX` and `fillPatternY` changes.

## 8.0.2

- Fix some transform caches
- Fix cache with hidden shapes

## 8.0.1

- Some typescript fixes

## 8.0.0

This is a very large release! The long term of `Konva` API is to make it simpler and faster. So when possible I am trying to optimize the code and remove unpopular/confusing API methods.

**BREAKING:**

- `Konva.Collection` is removed. `container.children` is a simple array now. `container.find()` will returns an array instead of `Konva.Collection()` instance.
  `Konva.Collection` was confusing for many users. Also it was slow and worked with a bit of magic. So I decided to get rif of it. Now we are going to use good old arrays.

```js
// old code:
group.find('Shape').visible(false);

// new code:
group.find('Shape').forEach((shape) => shape.visible(false));
```

- argument `selector` is removed from `node.getIntersection(pos)` API. I don't think you even knew about it.
- `Konva.Util.extend` is removed.
- All "content" events from `Konva.Stage` are removed. E.g. instead of `contentMousemove` just use `mousemove` event.

**New features:**

- All updates on canvas will do automatic redraw with `layer.batchDraw()`. This features is configurable with `Konva.autoDrawEnabled` property. Konva will automatically redraw layer when you change any property, remove or add nodes, do caching. So you don't need to call `layer.draw()` or `layer.batchDraw()` in most of the cases.
- New method `layer.getNativeCanvasElement()`
- new `flipEnabled` property for `Konva.Transformer`
- new `node.isClientRectOnScreen()` method
- Added `Konva.Util.degToRad` and `Konva.Util.radToDeg`
- Added `node.getRelativePointerPosition()`

**Changes and fixes:**

- **Full migration to ES modules package (!), commonjs code is removed.**
- **`konva-node` is merged into `konva` npm package. One package works for both environments.**
- Full event system rewrite. Much better `pointer` events support.
- Fix `TextPath` recalculations on `fontSize` change
- Better typescript support. Now every module has its own `*.d.ts` file.
- Removed `Konva.UA`, `Konva._parseUA` (it was used for old browser detection)
- Fixed Arrow head position when an arrow has tension
- `textPath.getKerning()` is removed
- Fix `a` command parsing for `Konva.Path`
- Fix fill pattern for `Konva.Text` when the pattern has an offset or rotation
- `Konva.names` and `Konva.ids` are removed
- `Konva.captureTouchEventsEnabled` is renamed to `Konva.capturePointerEventsEnabled`

## 7.2.5

- Fix transform update on `letterSpacing` change of `Konva.Text`

## 7.2.4

- Fix wrong `mouseleave` trigger for `Konva.Stage`

## 7.2.3

- Fix transformer rotation when parent of a node is rotated too.

## 7.2.2

- Fix wrong size calculations for `Konva.Line` with tension
- Fix `shape.intersects()` behavior when a node is dragged
- Fix ellipsis rendering for `Konva.Text`

## 7.2.1

- Fix correct rendering of `Konva.Label` when heigh of text is changed
- Fix correct `transformstart` and `transformend` events when several nodes are attached with `Konva.Transformer`

## 7.2.0

- New property `fillAfterStrokeEnabled` for `Konva.Shape`. See API docs for more information.
- Fix for `Konva.Transformer` when it may fail to draw.
- Fix rendering of `TextPath` one more time.

## 7.1.9

- Fix autodrawing for `Konva.Transformer` when it is on a different layer
- Fix `Konva.RegularPolygon` size calculations.

## 7.1.8

- Fix incorrect rendering of `TextPath` in some cases. (again)

## 7.1.7

- Fix incorrect rendering of `TextPath` in some cases.

## 7.1.6

- Fix for correct image/dataURL/canvas exports for `Konva.Stage`.

## 7.1.5

- Performance fixes for dragging many nodes with `Konva.Transformer`.
- Documentation updates

## 7.1.4

- Perf fixes
- Change events trigger flow, so adding new events INSIDE event callback will work correctly.
- Fix double `dragend`, `dragstart`, `dragmove` triggers on `Konva.Transformer`

## 7.1.3

- Text rendering fixes

## 7.1.2

- fix ellipses behavior for `Konva.Text`.
- fix scaled fill pattern for text.

## 7.1.1

- fixes for `dragstart` event when `Konva.Transformer` is used. `dragstart` event will have correct native `evt` reference
- Better unicode support in `Konva.Text` and `Konva.TextPath`. Emoji should work better now 👍

## 7.1.0

- Multi row support for `ellipsis` config for `Konva.Text`
- Better `Konva.Transfomer` behavior when single attached node is programmatically rotated.

## 7.0.7

- fixes for `dragstart` event when `Konva.Transformer` is used. `dragstart` will not bubble from transformer.
- `string` and `fill` properties validation can accept `CanvasGradient` as valid value

## 7.0.6

- Better performance for stage dragging

## 7.0.5

- Fixes for `node.cache()` function.

## 7.0.4

- Add `onUpdate` callbacks to `Konva.Tween` configuration and `node.to()` method.
- Up to 6x faster initializations of objects, like `const shape = new Konva.Shape()`.

## 7.0.3 - 2020-07-09

- Fix wring `dragend` trigger on `draggable` property change inside `click`
- Fix incorrect text rendering with `letterSpacing !== 0`
- Typescript fixes

## 7.0.2 - 2020-06-30

- Fix wrong trigger `dbltap` and `click` on mobile

## 7.0.1 - 2020-06-29

- Fixes for different font families support.
- Fixes for `Konva.Transformer` positions
- Types fixes for better Typescript support

## 7.0.0 - 2020-06-23

- **BREAKING** `inherit` option is removed from `visible` and `listening`. They now just have boolean values `true` or `false`. If you do `group.listening(false);` then whole group and all its children will be removed from the hitGraph (and they will not listen to events). Probably 99% `Konva` applications will be not affected by this _breaking change_.
- **Many performance fixes and code size optimizations. Up to 70% performance boost for many moving nodes.**
- `layer.hitGraphEnabled()` is deprecated. Just use `layer.listening(false)` instead
- Better support for font families with spaces inside (like `Font Awesome 5`).
- Fix wrong `dblclick` and `dbltap` triggers
- Deprecate `Konva.FastLayer`. Use `new Konva.Layer({ listening: false });` instead.
- `dragmove` event will be fired on `Konva.Transformer` too when you drag a node.
- `dragmove` triggers only after ALL positions of dragging nodes are changed

## 6.0.0 - 2020-05-08

- **BREAKING!** `boundBoxFunc` of `Konva.Transformer` works in absolute coordinates of whole transformer. Previously in was working in local coordinates of transforming node.
- Many `Konva.Transformer` fixes. Now it works correctly when you transform several rotated shapes.
- Fix for wrong `mouseleave` and `mouseout` fire on shape remove/destroy.

## 5.0.3 - 2020-05-01

- Fixes for `boundBoxFunc` of `Konva.Transformer`.

## 5.0.2 - 2020-04-23

- Deatach fixes for `Konva.Transformer`

## 5.0.1 - 2020-04-22

- Fixes for `Konva.Transformer` when parent scale is changed
- Fixes for `Konva.Transformer` when parent is draggable
- Performance optimizations

## 5.0.0 - 2020-04-21

- **New `Konva.Transformer` implementation!**. Old API should work. But I marked this release is `major` (breaking) just for smooth updates. Changes:
  - Support of transforming multiple nodes at once: `tr.nodes([shape1, shape2])`.
  - `tr.node()`, `tr.setNode()`, `tr.attachTo()` methods are deprecated. Use `tr.nodes(array)` instead
  - Fixes for center scaling
  - Fixes for better `padding` support
  - `Transformer` can be placed anywhere in the tree of a stage tree (NOT just inside a parent of attached node).
- Fix `imageSmoothEnabled` resets when stage is resized
- Memory usage optimizations when a node is cached

## 4.2.2 - 2020-03-26

- Fix hit stroke issues

## 4.2.1 - 2020-03-26

- Fix some issues with `mouseenter` and `mouseleave` events.
- Deprecate `hitStrokeEnabled` property
- Fix rounding issues for `getClientRect()` for some shapes

## 4.2.0 - 2020-03-14

- Add `rotationSnapTolerance` property to `Konva.Transformer`.
- Add `getActiveAnchor()` method to `Konva.Transformer`
- Fix hit for non-closed `Konva.Path`
- Some fixes for experimental Offscreen canvas support inside a worker

## 4.1.6 - 2020-02-25

- Events fixes for `Konva.Transformer`
- Now `Konva` will keep `id` in a cloned node
- Better error messages on tainted canvas issues

## 4.1.5 - 2020-02-16

- Fixes for `path.getClientRect()` function calculations

## 4.1.4 - 2020-02-10

- Fix wrong internal caching of absolute attributes
- Fix `Konva.Transformer` behavior on scaled with CSS stage

## 4.1.3 - 2020-01-30

- Fix line with tension calculations
- Add `node.getAbsoluteRotation()` method
- Fix cursor on anchors for rotated parent

## 4.1.2 - 2020-01-08

- Fix possible `NaN` in content calculations

## 4.1.1 - 2020-01-07

- Add ability to use `width = 0` and `height = 0` for `Konva.Image`.
- Fix `cache()` method of `Konva.Arrow()`
- Add `Transform` to `Konva` default exports. So `Konva.Transform` is available now.

## 4.1.0 - 2019-12-23

- Make events work on some CSS transforms
- Fix caching on float dimensions
- Fix `mouseleave` event on stage.
- Increase default anchor size for `Konva.Transformer` on touch devices

## 4.0.18 - 2019-11-20

- Fix `path.getClientRect()` calculations for `Konva.Path`
- Fix wrong fire of `click` and `tap` events on stopped drag events.

## 4.0.17 - 2019-11-08

- Allow hitStrokeWidth usage, even if a shape has not stroke visible
- Better IE11 support

## 4.0.16 - 2019-10-21

- Warn on undefined return value of `dragBoundFunc`.
- Better calculations for `container.getClientRect()`

## 4.0.15 - 2019-10-15

- TS fixes
- Better calculations for `TextPath` with align = right
- Better `textPath.getClientRect()`

## 4.0.14 - 2019-10-11

- TS fixes
- Fix globalCompositeOperation + cached hit detections.
- Fix absolute position calculations for cached parent

## 4.0.13 - 2019-10-02

- Fix `line.getClientRect()` calculations for line with a tension or low number of points

## 4.0.12 - 2019-09-17

- Fix some bugs when `Konva.Transformer` has `padding > 0`

## 4.0.10 - 2019-09-10

- Fix drag position handling
- Fix multiple selector for find() method

## 4.0.9 - 2019-09-06

- Fix `Konva.Transformer` behavior on mirrored nodes
- Fix `stage.getPointerPosition()` logic.

## 4.0.8 - 2019-09-05

- Fix `dragend` event on click
- Revert fillPatternScale for text fix.

## 4.0.7 - 2019-09-03

- Fixed evt object on `dragstart`
- Fixed double tap trigger after dragging

## 4.0.6 - 2019-08-31

- Fix fillPatternScale for text

## 4.0.5 - 2019-08-17

- Fix `dragstart` flow when `node.startDrag()` is called.
- Fix `tap` and `dbltap` double trigger on stage

## 4.0.4 - 2019-08-12

- Add `node.isCached()` method
- Fix nested dragging bug

## 4.0.3 - 2019-08-08

- Slightly changed `mousemove` event flow. It triggers for first `mouseover` event too
- Better `Konva.hitOnDragEnabled` support for mouse inputs

## 4.0.2 - 2019-08-08

- Fixed `node.startDrag()` behavior. We can call it at any time.

## 4.0.1 - 2019-08-07

- Better `Konva.Arrow` + tension drawing
- Typescript fixes

## 4.0.0 - 2019-08-05

Basically the release doesn't have any breaking changes. You may only have issues if you are using something from `Konva.DD` object (which is private and never documented). Otherwise you should be fine. `Konva` has major upgrade about touch events system and drag&drop flow. The API is exactly the same. But the internal refactoring is huge so I decided to make a major version. Please upgrade carefully. Report about any issues you have.

- Better multi-touch support. Now we can trigger several `touch` events on one or many nodes.
- New drag&drop implementation. You can drag several shapes at once with several pointers.
- HSL colors support

## 3.4.1 - 2019-07-18

- Fix wrong double tap trigger

## 3.4.0 - 2019-07-12

- TS types fixes
- Added support for different values for `cornerRadius` of `Konva.Rect`

## 3.3.3 - 2019-06-07

- Some fixes for better support `konva-node`
- TS types fixes

## 3.3.2 - 2019-06-03

- TS types fixes

## 3.3.1 - 2019-05-28

- Add new property `imageSmoothingEnabled` to the node caching
- Even more ts fixes. Typescript need a lot of attention, you know...

## 3.3.0 - 2019-05-28

- Enable strict mode for ts types
- Add new property `imageSmoothingEnabled` to the layer

## 3.2.7 - 2019-05-27

- Typescript fixes
- Experimental pointer events support. Do `Konva._pointerEventsEnabled = true;` to enable
- Fix some `Konva.Transformer` bugs.

## 3.2.6 - 2019-05-09

- Typescript fixes again

## 3.2.5 - 2019-04-17

- Show a warning when `Konva.Transformer` and attaching node have different parents.
- Typescript fixes

## 3.2.4 - 2019-04-05

- Fix some stage events. `mouseenter` and `mouseleave` should work correctly on empty spaces
- Fix some typescript types
- Better detection of production mode (no extra warnings)

## 3.2.3 - 2019-03-21

- Fix `hasName` method for empty name cases

## 3.2.2 - 2019-03-19

- Remove `dependencies` from npm package

## 3.2.1 - 2019-03-18

- Better `find` and `findOne` lookup. Now we should not care about duplicate ids.
- Better typescript definitions

## 3.2.0 - 2019-03-10

- new property `shape.hitStrokeWidth(10)`
- Better typescript definitions
- Remove `Object.assign` usage (for IE11 support)

## 3.1.7 - 2019-03-06

- Better modules and TS types

## 3.1.6 - 2019-02-27

- Fix commonjs exports
- Fix global injections

## 3.1.0 - 2019-02-27

- Make `Konva` modular: `import Konva from 'konva/lib/Core';`;
- Fix incorrect `Transformer` behavior
- Fix drag&drop for touch devices

## 3.0.0 - 2019-02-25

## Breaking

Customs builds are temporary removed from npm package. You can not use `import Konva from 'konva/src/Core';`.
This feature will be added back later.

### Possibly breaking

That changes are private and internal specific. They should not break most of `Konva` apps.

- `Konva.Util.addMethods` is removed
- `Konva.Util._removeLastLetter` is removed
- `Konva.Util._getImage` is removed
- `Konv.Util._getRGBAString` is removed
- `Konv.Util._merge` is removed
- Removed polyfill for `requestAnimationFrame`.
- `id` and `name` properties defaults are empty strings, not `undefined`
- internal `_cache` property was updated to use es2015 `Map` instead of `{}`.
- `Konva.Validators` is removed.

### Added

- Show a warning when a stage has too many layers
- Show a warning on duplicate ids
- Show a warning on weird class in `Node.create` parsing from JSON
- Show a warning for incorrect value for component setters.
- Show a warning for incorrect value for `zIndex` property.
- Show a warning when user is trying to reuse destroyed shape.
- new publish method `measureSize(string)` for `Konva.Text`
- You can configure what mouse buttons can be used for drag&drop. To enable right button you can use `Konva.dragButtons = [0, 1]`.
- Now you can hide stage `stage.visible(false)`. It will set its container display style to "none".
- New method `stage.setPointersPositions(event)`. Usually you don't need to use it manually.
- New method `layer.toggleHitCanvas()` to show and debug hit areas

### Changed

- Full rewrite to Typescript with tons of refactoring and small optimizations. The public API should be 100% the same
- Fixed `patternImage` and `radialGradient` for `Konva.Text`
- `Konva.Util._isObject` is renamed to `Konva.Util._isPlainObject`.
- A bit changed behavior of `removeId` (private method), now it doesn't clear node ref, if object is changed.
- simplified `batchDraw` method (it doesn't use `Konva.Animation`) now.
- Performance improvements for shapes will image patterns, linear and radial fills
- `text.getTextHeight()` is deprecated. Use `text.height()` or `text.fontSize()` instead.
- Private method `stage._setPointerPosition()` is deprecated. Use `stage.setPointersPositions(event)`;

### Fixed

- Better mouse support on mobile devices (yes, that is possible to connect mouse to mobile)
- Better implementation of `mouseover` event for stage
- Fixed underline drawing for text with `lineHeight !== 1`
- Fixed some caching behavior when a node has `globalCompositeOperation`.
- Fixed automatic updates for `Konva.Transformer`
- Fixed container change for a stage.
- Fixed warning for `width` and `height` attributes for `Konva.Text`
- Fixed gradient drawing for `Konva.Text`
- Fixed rendering with `strokeWidth = 0`

## 2.6.0 - 2018-12-14

### Changed

- Performance fixes when cached node has many children
- Better drawing for shape with `strokeScaleEnabled = false` on HDPI devices

### Added

- New `ignoreStroke` for `Konva.Transformer`. Good to use when a shape has `strokeScaleEnabled = false`

### Changed

- `getKerning` TextPath API is deprecated. Use `kerningFunc` instead.

## 2.5.1 - 2018-11-08

### Changed

- Use custom functions for `trimRight` and `trimLeft` (for better browsers support)

## 2.5.0 - 2018-10-24

### Added

- New `anchorCornerRadius` for `Konva.Transformer`

### Fixed

- Performance fixes for caching

### Changed

- `dragstart` event behavior is a bit changed. It will fire BEFORE actual position of a node is changed.

## 2.4.2 - 2018-10-12

### Fixed

- Fixed a wrong cache when a shape inside group has `listening = false`

## 2.4.1 - 2018-10-08

### Changed

- Added some text trim logic to wrap in better

### Fixed

- `getClientRect` for complex paths fixes
- `getClientRect` calculation fix for groups
- Update `Konva.Transformer` on `rotateEnabled` change
- Fix click stage event on dragend
- Fix some Transformer cursor behavior

## 2.4.0 - 2018-09-19

### Added

- Centered resize with ALT key for `Konva.Transformer`
- New `centeredScaling` for `Konva.Transformer`

### Fixed

- Tween support for gradient properties
- Add `user-select: none` to the stage container to fix some "selected contend around" issues

## 2.3.0 - 2018-08-30

### Added

- new methods `path.getLength()` and `path.getPointAtLength(val)`
- `verticalAlign` for `Konva.Text`

## 2.2.2 - 2018-08-21

### Changed

- Default duration for tweens and `node.to()` methods is now 300ms
- Typescript fixes
- Automatic validations for many attributes

## 2.2.1 - 2018-08-10

### Added

- New properties for `Konva.Transformer`: `borderStroke`, `borderStrokeWidth`, `borderDash`, `anchorStroke`, `anchorStrokeWidth`, `anchorSize`.

### Changed

- Some properties of `Konva.Transformer` are renamed. `lineEnabled` -> `borderEnabled`. `rotateHandlerOffset` -> `rotateAnchorOffset`, `enabledHandlers` -> `enabledAnchors`.

## 2.1.8 - 2018-08-01

### Fixed

- Some `Konva.Transformer` fixes
- Typescript fixes
- `stage.toDataURL()` fixes when it has hidden layers
- `shape.toDataURL()` automatically adjust position and size of resulted image

## 2.1.7 - 2018-07-03

### Fixed

- `toObject` fixes

## 2.1.7 - 2018-07-03

### Fixed

- Some drag&drop fixes

## 2.1.6 - 2018-06-16

### Fixed

- Removed wrong dep
- Typescript fixes

## 2.1.5 - 2018-06-15

### Fixed

- Typescript fixes
- add shape as second argument for `sceneFunc` and `hitFunc`

## 2.1.4 - 2018-06-15

### Fixed

- Fixed `Konva.Text` justify drawing for a text with decoration
- Added methods `data()`,`setData()` and `getData()` methods to `Konva.TextPath`
- Correct cache reset for `Konva.Transformer`

## 2.1.3 - 2018-05-17

### Fixed

- `Konva.Transformer` automatically track shape changes
- `Konva.Transformer` works with shapes with offset too

## 2.1.2 - 2018-05-16

### Fixed

- Cursor fixes for `Konva.Transformer`
- Fixed lineHeight behavior for `Konva.Text`
- Some performance optimizations for `Konva.Text`
- Better wrap algorithm for `Konva.Text`
- fixed `Konva.Arrow` with tension != 0
- Some fixes for `Konva.Transformer`

## 2.0.3 - 2018-04-21

### Added

- Typescript defs for `Konva.Transformer`
- Typescript defs for `globalCompositeOperation`

## Changes

- Fixed flow for `contextmenu` event. Now it will be triggered on shapes too
- `find()` method for Containers can use a function as a parameter

### Fixed

- some bugs fixes for `group.getClientRect()`
- `Konva.Arrow` will not draw dash for pointers
- setAttr will trigger change event if new value is the same Object
- better behavior of `dblclick` event when you click fast on different shapes
- `stage.toDataURL` will use `pixelRatio = 1` by default.

## 2.0.2 - 2018-03-15

### Fixed

- Even more bugs fixes for `Konva.Transformer`

## 2.0.1 - 2018-03-15

### Fixed

- Several bugs fixes for `Konva.Transformer`

## 2.0.0 - 2018-03-15

### Added

- new `Konva.Transformer`. It is a special group that allow simple resizing and rotation of a shape.
- Add ability to remove event by callback `node.off('event', callback)`.
- new `Konva.Filters.Contrast`.
- new `Konva.Util.haveIntersection()` to detect simple collusion
- add `Konva.Text.ellipsis` to add '…' to text string if width is fixed and wrap is set to 'none'
- add gradients for strokes

## Changed

- stage events are slightly changed. `mousedown`, `click`, `mouseup`, `dblclick`, `touchstart`, `touchend`, `tap`, `dbltap` will be triggered when clicked on empty areas too

### Fixed

- Some typescript fixes
- Pixelate filter fixes
- Fixes for path data parsing
- Fixed shadow size calculation

## Removed

- Some deprecated methods are removed. If previous version was working without deprecation warnings for you, this one will work fine too.

## 1.7.6 - 2017-11-01

### Fixed

- Some typescript fixes

## 1.7.4 - 2017-10-30

### Fixed

- `isBrowser` detection for electron

## 1.7.3 - 2017-10-19

### Changed

- Changing size of a stage will redraw it in synchronous way

### Fixed

- Some fixes special for nodejs

## 1.7.2 - 2017-10-11

### Fixed

- Fixed `Konva.document is undefined`

## 1.7.1 - 2017-10-11

### Changed

- Konva for browser env and Konva for nodejs env are separate packages now. You can use `konva-node` for NodeJS env.

## 1.7.0 - 2017-10-08

### Fixed

- Several typescript fixes

### Changed

- Default value for `dragDistance` is changed to 3px.
- Fix rare error throw on drag
- Caching with height = 0 or width = 0 with throw async error. Caching will be ignored.

## 1.6.8 - 2017-08-19

### Changed

- The `node.getClientRect()` calculation is changed a bit. It is more powerfull and correct. Also it takes parent transform into account. See docs.
- Upgrade nodejs deps

## 1.6.7 - 2017-07-28

### Fixed

- Fix bug with double trigger wheel in Firefox
- Fix `node.getClientRect()` calculation in a case of Group + invisible child
- Fix dblclick issue https://github.com/konvajs/konva/issues/252

## 1.6.3 - 2017-05-24

### Fixed

- Fixed bug with pointer detection. css 3d transformed stage will not work now.

## 1.6.2 - 2017-05-08

### Fixed

- Fixed bug with automatic shadow for negative scale values

## 1.6.1 - 2017-04-25

### Fixed

- Fix pointer position detection

### Changed

- moved `globalCompositeOperation` property to `Konva.Node`

## 1.6.0 - 2017-04-21

### Added

- support of globalCompositeOperation for `Konva.Shape`

### Fixed

- getAllIntersections now works ok for Text shapes (https://github.com/konvajs/konva/issues/224)

### Changed

- Konva a bit changed a way to detect pointer position. Now it should be OK to apply css transform on Konva container. https://github.com/konvajs/konva/pull/215

## 1.5.0 - 2017-03-20

### Added

- support for `lineDashOffset` property for `Konva.Shape`.

## 1.4.0 - 2017-02-07

## Added

- `textDecoration` of `Konva.Text` now supports `line-through`

## 1.3.0 - 2017-01-10

## Added

- new align value for `Konva.Text` and `Konva.TextPath`: `justify`
- new property for `Konva.Text` and `Konva.TextPath`: `textDecoration`. Right now it sports only '' (no decoration) and 'underline' values.
- new property for `Konva.Text`: `letterSpacing`
- new event `contentContextmenu` for `Konva.Stage`
- `align` support for `Konva.TextPath`
- new method `toCanvas()` for converting a node into canvas element

### Changed

- changing a size of `Konva.Stage` will update it in async way (via `batchDraw`).
- `shadowOffset` respect pixel ratio now

### Fixed

- Fixed bug when `Konva.Tag` width was not changing its width dynamically
- Fixed "calling remove() for dragging shape will throw an error"
- Fixed wrong opacity level for cached group with opacity
- More consistent shadows on HDPI screens
- Fixed memory leak for nodes with several names

## 1.2.2 - 2016-09-15

### Fixed

- refresh stage hit and its `dragend`
- `getClientRect` calculations

## 1.2.0 - 2016-09-15

## Added

- new properties for `Konva.TextPath`: `letterSpacing` and `textBaseline`.

## 1.1.4 - 2016-09-13

### Fixed

- Prevent throwing an error when text property of `Konva.Text` = undefined or null

## 1.1.3 - 2016-09-12

### Changed

- Better hit function for `TextPath`.
- Validation of `Shape` filters.

## 1.1.2 - 2016-09-10

### Fixed

- Fixed "Dragging Group on mobile view throws "missing preventDefault" error" #169

## 1.1.1 - 2016-08-30

### Fixed

- Fixed #166 bug of drag&drop

## 1.1.0 - 2016-08-21

## Added

- new property of `Konva.Shape` - `preventDefault`.

## 1.0.3 - 2016-08-14

### Fixed

- Fixed some typescript definitions

## 1.0.2 - 2016-07-08

## Changed

- `Konva.Text` will interpret undefined `width` and `height` as `AUTO`

## 1.0.1 - 2016-07-05

### Changed

- you can now unset property by `node.x(undefined)` or `node.setAttr('x', null)`

### Fixed

- Bug fix for case when `touchend` event throws error

## 1.0.0 - 2016-07-05

### Fixed

- Bug fix for case when `touchend` event throws error

## 0.15.0 - 2016-06-18

## Added

- Custom clip function

## 0.14.0 - 2016-06-17

### Fixed

- fixes in typescript definitions
- fixes for bug with `mouseenter` event on deep nesting case

## 0.13.9 - 2016-05-14

### Changed

- typescript definition in npm package
- node@5.10.1, canvas@1.3.14, jsdom@8.5.0 support
- `Konva.Path` will be filled when it is not closed
- `Animation.start()` will not not immediate sync draw. This should improve performance a little.
- Warning when node for `Tween` is not in layer yet.
- `removeChildren()` remove only first level children. So it will not remove grandchildren.

## 0.12.4 - 2016-04-19

### Changed

- `batchDraw` will do not immediate `draw()`

### Fixed

- fix incorrect shadow offset on rotation

## 0.12.3 - 2016-04-07

### Fixed

- `batchDraw` function works less time now
- lighter npm package

## 0.12.2 - 2016-03-31

### Fixed

- repair `cancelBubble` event property behaviour
- fix wrong `Path` `getClientRect()` calculation
- better HDPI support
- better typescript definitions
- node 0.12 support

### Changed

- more universal stage container selector
- `mousewheel` event changed to `wheel`

## 0.11.1 - 2016-01-16

### Fixed

- correct `Konva.Arrow` drawing. Now it works better.
- Better support for dragging when mouse out of stage
- Better corner radius for `Label` shape
- `contentTap` event for stage

### Added

- event delegation. You can use it in this way: `layer.on('click', 'Circle', handler);`
- new `node.findAncestors(selector)` and `node.findAncestor(selector)` functions
- optional selector parameter for `stage.getIntersection` and `layer.getIntersection`
- show warning message if several instances of Konva are added to page.

### Changed

- `moveTo` and some other methods return `this`
- `getAbsolutePosition` support optional relative parent argument (useful to find absolute position inside of some of parent nodes)
- `change` event will be not fired if changed value is the same as old value

## 0.10.0 - 2015-10-27

### Added

- RGBA filter. Thanks to [@codefo](https://github.com/codefo)
- `stroke` and `fill` support for `Konva.Sprite`

### Fixed

- Correct calculation in `getClientRect` method of `Konva.Line` and `Konva.Container`.
- Correct `toObject()` behaviour for node with attrs with extended native prototypes
- Fixed bug for caching where buffer canvas is required

### Changed

- Dragging works much better. If your pointer is out of stage content dragging will still continue.
- `Konva.Node.create` now works with objects.
- `Konva.Tween` now supports tweening points to state with different length

## 0.9.5 - 2015-05-28

### Fixed

- `to` will not throw error if no `onFinish` callback
- HDPI support for desktop
- Fix bug when filters are not correct for HDPI
- Fix bug when hit area is not correct for HDPI
- Fix bug for incorrect `getClientRect` calculation
- Repair fill gradient for text

### Changed

- context wrapper is more capable with native context.
  So you can use `context.fillStyle` property in your `sceneFunc` without accessing native context.
- `toDataURL` now handles pixelRatio. you can pass `config.pixelRatio` argument
- Correct `clone()` for custom nodes
- `FastLayer` can now have transforms
- `stage.toDataURL()` method now works synchronously. So `callback` argument is not required.
- `container.find(selector)` method now has a validation step. So if you forgot to add `#` or `.` you will see a warning message in the console.

### Added

- new `Konva.Image.fromURL` method

### Deprecated

- `fillRed`, `fillGreen`, `fillBlue`, `fillAlpha` are deprecated. Use `fill` instead.
- `strokeRed`, `strokeGreen`, `strokeBlue`, `strokeAlpha` are deprecated. Use `stroke` instead.
- `shadowRed`, `shadowGreen`, `shadowBlue`, `shadowAlpha` are deprecated. Use `shadow` instead.
- `dashArray` is deprecated. Use `dash` instead.
- `drawFunc` is deprecated. Use `sceneFunc` instead.
- `drawHitFunc` is deprecated. Use `hitFunc` instead.
- `rotateDeg` is deprecated. Use `rotate` instead.

## 0.9.0 - 2015-02-27

### Fixed

- cache algorithm has A LOT OF updates.

### Changed

- `scale` now affects `shadowOffset`
- performance optimization (remove some unnecessary draws)
- more expected drawing when shape has opacity, stroke and shadow
- HDPI for caching.
- Cache should work much better. Now you don't need to pass bounding box {x,y,width,height} to `cache` method for all buildin Konva shapes. (only for your custom `Konva.Shape` instance).
- `Tween` now supports color properties (`fill`, `stroke`, `shadowColor`)

### Added

- new methods for working with node's name: `addName`, `removeName`, `hasName`.
- new `perfectDrawEnabled` property for shape. See [http://konvajs.org/docs/performance/Disable_Perfect_Draw.html](http://konvajs.org/docs/performance/Disable_Perfect_Draw.html)
- new `shadowForStrokeEnabled` property for shape. See [http://konvajs.org/docs/performance/All_Performance_Tips.html](http://konvajs.org/docs/performance/All_Performance_Tips.html)
- new `getClientRect` method.
- new `to` method for every node for shorter tweening

## 0.8.0 - 2015-02-04

- Bug Fixes
  - browser crashing on pointer events fixed
  - optimized `getIntersection` function
- Enhancements
  - `container.findOne()` method
  - new `strokeHitEnabled` property. Useful for performance optimizations
  - typescript definitions. see `/resources/konva.d.ts`

## Rebranding release 2015-01-28

Differences from last official `KineticJS` release

- Bug Fixes
  - `strokeScaleEnabled = false` is disabled for text as I can not find a way to implement this
  - `strokeScaleEnabled = false` for Line now creates a correct hit graph
  - working "this-example" as name for nodes
  - Konva.Text() with no config will not throw exception
  - Konva.Line() with no config will not throw exception
  - Correct stage resizing with `FastLayer`
  - `batchDraw` method for `FastLayer`
  - Correct mouseover/mouseout/mouseenter/mouseleave events for groups
  - cache node before adding to layer
  - `intersects` function now works for shapes with shadow

- Enhancements
  - `cornerRadius` of Rect is limited by `width/2` and `height/2`
  - `black` is default fill for text
  - true class extending. Now `rect instanceOf Konva.Shape` will return true
  - while dragging you can redraw layer that is not under drag. hit graph will be updated in this case
  - now you can move object that is dragging into another layer.
  - new `frameOffsets` attribute for `Konva.Sprite`
  - much better dragging performance
  - `browserify` support
  - applying opacity to cached node
  - remove all events with `node.off()`
  - mouse dragging only with left button
  - opacity now affects cached shapes
  - Label corner radius
  - smart changing `width`, `height`, `radius` attrs for circle, start, ellipse, ring.
  - `mousewheel` support. Thanks [@vmichnowicz](https://github.com/vmichnowicz)
  - new Arrow plugin
  - multiple names: `node.name('foo bar'); container.find('.foo');` (thanks [@mattslocum](https://github.com/mattslocum))
  - `Container.findOne()`
