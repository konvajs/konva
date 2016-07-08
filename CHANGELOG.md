# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Not released][Not released]

## [1.0.2][2016-07-08]

## Changed
- `Konva.Text` will interpret undefined `width` and `height` as `AUTO`


## [1.0.1][2016-07-05]

### Changed
- you can now unset property by `node.x(undefined)` or `node.setAttr('x', null)`

### Fixed
- Bug fix for case when `touchend` event throws error

## [1.0.0][2016-07-05]

### Fixed
- Bug fix for case when `touchend` event throws error

## [0.15.0][2016-06-18]

## Added
- Custom clip function

## [0.14.0][2016-06-17]

### Fixed
- fixes in typescript definitions
- fixes for bug with `mouseenter` event on deep nesting case

## [0.13.9][2016-05-14]

### Changed
- typescript definition in npm package
- node@5.10.1, canvas@1.3.14, jsdom@8.5.0 support
- `Konva.Path` will be filled when it is not closed
- `Animation.start()` will not not immediate sync draw. This should improve performance a little.
- Warning when node for `Tween` is not in layer yet.
- `removeChildren()` remove only first level children. So it will not remove grandchildren.


## [0.12.4][2016-04-19]

### Changed
- `batchDraw` will do not immediate `draw()`

### Fixed
- fix incorrect shadow offset on rotation

## [0.12.3][2016-04-07]

### Fixed
- `batchDraw` function works less time now
- lighter npm package

## [0.12.2][2016-03-31]

### Fixed
- repair `cancelBubble` event property behaviour
- fix wrong `Path` `getClientRect()` calculation
- better HDPI support
- better typescript definitions
- node 0.12 support

### Changed
- more universal stage container selector
- `mousewheel` event changed to `wheel`

## [0.11.1][2016-01-16]

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

## [0.8.0][2015-02-04]

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
