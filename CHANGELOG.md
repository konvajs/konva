# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [0.10.0][2015-10-27]

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

## [0.9.5][2015-05-28]

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


## [0.9.0][2015-02-27]

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
- new `perfectDrawEnabled` property for shape. See [http://konvajs.github.io/docs/performance/Disable_Perfect_Draw.html](http://konvajs.github.io/docs/performance/Disable_Perfect_Draw.html)
- new `shadowForStrokeEnabled` property for shape. See [http://konvajs.github.io/docs/performance/All_Performance_Tips.html](http://konvajs.github.io/docs/performance/All_Performance_Tips.html)
- new `getClientRect` method.
- new `to` method for every node for shorter tweening

## [0.8.0] - 2015-02-04

* Bug Fixes
    * browser crashing on pointer events fixed
    * optimized `getIntersection` function
* Enhancements
    * `container.findOne()` method
    * new `strokeHitEnabled` property. Useful for performance optimizations
    * typescript definitions. see `/resources/konva.d.ts`


## Rebranding release 2015-01-28
Differences from last official `KineticJS` release

* Bug Fixes
    * `strokeScaleEnabled = false` is disabled for text as I can not find a way to implement this
    * `strokeScaleEnabled = false` for Line now creates a correct hit graph
    * working "this-example" as name for nodes
    * Konva.Text() with no config will not throw exception
    * Konva.Line() with no config will not throw exception
    * Correct stage resizing with `FastLayer`
    * `batchDraw` method for `FastLayer`
    * Correct mouseover/mouseout/mouseenter/mouseleave events for groups
    * cache node before adding to layer
    * `intersects` function now works for shapes with shadow

* Enhancements
    * `cornerRadius` of Rect is limited by `width/2` and `height/2`
    * `black` is default fill for text
    * true class extending. Now `rect instanceOf Konva.Shape` will return true
    * while dragging you can redraw layer that is not under drag. hit graph will be updated in this case
    * now you can move object that is dragging into another layer.
    * new `frameOffsets` attribute for `Konva.Sprite`
    * much better dragging performance
    * `browserify` support
    * applying opacity to cached node
    * remove all events with `node.off()`
    * mouse dragging only with left button
    * opacity now affects cached shapes
    * Label corner radius
    * smart changing `width`, `height`, `radius` attrs for circle, start, ellipse, ring.
    * `mousewheel` support. Thanks [@vmichnowicz](https://github.com/vmichnowicz)
    * new Arrow plugin
    * multiple names: `node.name('foo bar'); container.find('.foo');` (thanks [@mattslocum](https://github.com/mattslocum))
    * `Container.findOne()`
