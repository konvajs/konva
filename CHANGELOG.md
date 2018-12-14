# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [new version][unreleased]

## [2.6.0][2018-12-14]

### Changed

* Performance fixes when cached node has many children
* Better drawing for shape with `strokeScaleEnabled = false` on HDPI devices

### Added

* New `ignoreStroke` for `Konva.Transformer`. Good to use when a shape has `strokeScaleEnabled = false`

### Changed

* getKerning TextPath API is deprecated. Use "kerningFunc" instead.

## [2.5.1][2018-11-08]

### Changed

* Use custom functions for `trimRight` and `trimLeft` (for better browsers support)

## [2.5.0][2018-10-24]

### Added

* New `anchorCornerRadius` for `Konva.Transformer`

### Fixed

* Performance fixes for caching

### Changed

* `dragstart` event behavior is a bit changed. It will fire BEFORE actual position of a node is changed.

## [2.4.2][2018-10-12]

### Fixed

* Fixed a wrong cache when a shape inside group has `listening = false`

## [2.4.1][2018-10-08]

### Changed

* Added some text trim logic to wrap in better

### Fixed

* `getClientRect` for complex paths fixes
* `getClientRect` calculation fix for groups
* Update `Konva.Transformer` on `rotateEnabled` change
* Fix click stage event on dragend
* Fix some Transformer cursor behavior

## [2.4.0][2018-09-19]

### Added

* Centered resize with ALT key for `Konva.Transformer`
* New `centeredScaling` for `Konva.Transformer`

### Fixed

* Tween support for gradient properties
* Add `user-select: none` to the stage container to fix some "selected contend around" issues


## [2.3.0][2018-08-30]

### Added

* new methods `path.getLength()` and `path.getPointAtLength(val)`
* `verticalAlign` for `Konva.Text`

## [2.2.2][2018-08-21]

### Changed

* Default duration for tweens and `node.to()` methods is now 300ms
* Typescript fixes
* Automatic validations for many attributes

## [2.2.1][2018-08-10]

### Added

* New properties for `Konva.Transformer`: `borderStroke`, `borderStrokeWidth`, `borderDash`, `anchorStroke`, `anchorStrokeWidth`, `anchorSize`.

### Changed

* Some properties of `Konva.Transformer` are renamed. `lineEnabled` -> `borderEnabled`. `rotateHandlerOffset` -> `rotateAnchorOffset`, `enabledHandlers` -> `enabledAnchors`.

## [2.1.8][2018-08-01]

### Fixed

* Some `Konva.Transformer` fixes
* Typescript fixes
* `stage.toDataURL()` fixes when it has hidden layers
* `shape.toDataURL()` automatically adjust position and size of resulted image

## [2.1.7][2018-07-03]

### Fixed

* `toObject` fixes

## [2.1.7][2018-07-03]

### Fixed

* Some drag&drop fixes

## [2.1.6][2018-06-16]

### Fixed

* Removed wrong dep
* Typescript fixes

## [2.1.5][2018-06-15]

### Fixed

* Typescript fixes
* add shape as second argument for `sceneFunc` and `hitFunc`

## [2.1.4][2018-06-15]

### Fixed

* Fixed `Konva.Text` justify drawing for a text with decoration
* Added methods `data()`,`setData()`  and `getData()` methods to `Konva.TextPath`
* Correct cache reset for `Konva.Transformer`

## [2.1.3][2018-05-17]

### Fixed

* `Konva.Transformer` automatically track shape changes
* `Konva.Transformer` works with shapes with offset too

## [2.1.2][2018-05-16]

### Fixed

* Cursor fixes for `Konva.Transformer`
* Fixed lineHeight behavior for `Konva.Text`
* Some performance optimizations for `Konva.Text`
* Better wrap algorithm for `Konva.Text`
* fixed `Konva.Arrow` with tension != 0
* Some fixes for `Konva.Transformer`

## [2.0.3][2018-04-21]

### Added

* Typescript defs for `Konva.Transformer`
* Typescript defs for `globalCompositeOperation`

## Changes

* Fixed flow for `contextmenu` event. Now it will be triggered on shapes too
* `find()` method for Containers can use a function as a parameter

### Fixed

* some bugs fixes for `group.getClientRect()`
* `Konva.Arrow` will not draw dash for pointers
* setAttr will trigger change event if new value is the same Object
* better behavior of `dblclick` event when you click fast on different shapes
* `stage.toDataURL` will use `pixelRatio = 1` by default.

## [2.0.2][2018-03-15]

### Fixed

* Even more bugs fixes for `Konva.Transformer`

## [2.0.1][2018-03-15]

### Fixed

* Several bugs fixes for `Konva.Transformer`

## [2.0.0][2018-03-15]

### Added

* new `Konva.Transformer`. It is a special group that allow simple resizing and rotation of a shape.
* Add ability to remove event by callback `node.off('event', callback)`.
* new `Konva.Filters.Contrast`.
* new `Konva.Util.haveIntersection()` to detect simple collusion
* add `Konva.Text.ellipsis` to add '…' to text string if width is fixed and wrap is set to 'none'
* add gradients for strokes

## Changed

* stage events are slightly changed. `mousedown`, `click`, `mouseup`, `dblclick`, `touchstart`, `touchend`, `tap`, `dbltap` will be triggered when clicked on empty areas too

### Fixed

* Some typescript fixes
* Pixelate filter fixes
* Fixes for path data parsing
* Fixed shadow size calculation

## Removed

* Some deprecated methods are removed. If previous version was working without deprecation warnings for you, this one will work fine too.

## [1.7.6][2017-11-01]

### Fixed

* Some typescript fixes

## [1.7.4][2017-10-30]

### Fixed

* `isBrowser` detection for electron

## [1.7.3][2017-10-19]

### Changed

* Changing size of a stage will redraw it in synchronous way

### Fixed

* Some fixes special for nodejs

## [1.7.2][2017-10-11]

### Fixed

* Fixed `Konva.document is undefined`

## [1.7.1][2017-10-11]

### Changed

* Konva for browser env and Konva for nodejs env are separate packages now. You can use `konva-node` for NodeJS env.

## [1.7.0][2017-10-08]

### Fixed

* Several typescript fixes

### Changed

* Default value for `dragDistance` is changed to 3px.
* Fix rare error throw on drag
* Caching with height = 0 or width = 0 with throw async error. Caching will be ignored.

## [1.6.8][2017-08-19]

### Changed

* The `node.getClientRect()` calculation is changed a bit. It is more powerfull and correct. Also it takes parent transform into account. See docs.
* Upgrade nodejs deps

## [1.6.7][2017-07-28]

### Fixed

* Fix bug with double trigger wheel in Firefox
* Fix `node.getClientRect()` calculation in a case of Group + invisible child
* Fix dblclick issue https://github.com/konvajs/konva/issues/252

## [1.6.3][2017-05-24]

### Fixed

* Fixed bug with pointer detection. css 3d transformed stage will not work now.

## [1.6.2][2017-05-08]

### Fixed

* Fixed bug with automatic shadow for negative scale values

## [1.6.1][2017-04-25]

### Fixed

* Fix pointer position detection

### Changed

* moved `globalCompositeOperation` property to `Konva.Node`

## [1.6.0][2017-04-21]

### Added

* support of globalCompositeOperation for `Konva.Shape`

### Fixed

* getAllIntersections now works ok for Text shapes (https://github.com/konvajs/konva/issues/224)

### Changed

* Konva a bit changed a way to detect pointer position. Now it should be OK to apply css transform on Konva container. https://github.com/konvajs/konva/pull/215

## [1.5.0][2017-03-20]

### Added

* support for `lineDashOffset` property for `Konva.Shape`.

## [1.4.0][2017-02-07]

## Added

* `textDecoration` of `Konva.Text` now supports `line-through`

## [1.3.0][2017-01-10]

## Added

* new align value for `Konva.Text` and `Konva.TextPath`: `justify`
* new property for `Konva.Text` and `Konva.TextPath`: `textDecoration`. Right now it sports only '' (no decoration) and 'underline' values.
* new property for `Konva.Text`: `letterSpacing`
* new event `contentContextmenu` for `Konva.Stage`
* `align` support for `Konva.TextPath`
* new method `toCanvas()` for converting a node into canvas element

### Changed

* changing a size of `Konva.Stage` will update it in async way (via `batchDraw`).
* `shadowOffset` respect pixel ratio now

### Fixed

* Fixed bug when `Konva.Tag` width was not changing its width dynamically
* Fixed "calling remove() for dragging shape will throw an error"
* Fixed wrong opacity level for cached group with opacity
* More consistent shadows on HDPI screens
* Fixed memory leak for nodes with several names

## [1.2.2][2016-09-15]

### Fixed

* refresh stage hit and its `dragend`
* `getClientRect` calculations

## [1.2.0][2016-09-15]

## Added

* new properties for `Konva.TextPath`: `letterSpacing` and `textBaseline`.

## [1.1.4][2016-09-13]

### Fixed

* Prevent throwing an error when text property of `Konva.Text` = undefined or null

## [1.1.3][2016-09-12]

### Changed

* Better hit function for `TextPath`.
* Validation of `Shape` filters.

## [1.1.2][2016-09-10]

### Fixed

* Fixed "Dragging Group on mobile view throws "missing preventDefault" error" #169

## [1.1.1][2016-08-30]

### Fixed

* Fixed #166 bug of drag&drop

## [1.1.0][2016-08-21]

## Added

* new property of `Konva.Shape` - `preventDefault`.

## [1.0.3][2016-08-14]

### Fixed

* Fixed some typescript definitions

## [1.0.2][2016-07-08]

## Changed

* `Konva.Text` will interpret undefined `width` and `height` as `AUTO`

## [1.0.1][2016-07-05]

### Changed

* you can now unset property by `node.x(undefined)` or `node.setAttr('x', null)`

### Fixed

* Bug fix for case when `touchend` event throws error

## [1.0.0][2016-07-05]

### Fixed

* Bug fix for case when `touchend` event throws error

## [0.15.0][2016-06-18]

## Added

* Custom clip function

## [0.14.0][2016-06-17]

### Fixed

* fixes in typescript definitions
* fixes for bug with `mouseenter` event on deep nesting case

## [0.13.9][2016-05-14]

### Changed

* typescript definition in npm package
* node@5.10.1, canvas@1.3.14, jsdom@8.5.0 support
* `Konva.Path` will be filled when it is not closed
* `Animation.start()` will not not immediate sync draw. This should improve performance a little.
* Warning when node for `Tween` is not in layer yet.
* `removeChildren()` remove only first level children. So it will not remove grandchildren.

## [0.12.4][2016-04-19]

### Changed

* `batchDraw` will do not immediate `draw()`

### Fixed

* fix incorrect shadow offset on rotation

## [0.12.3][2016-04-07]

### Fixed

* `batchDraw` function works less time now
* lighter npm package

## [0.12.2][2016-03-31]

### Fixed

* repair `cancelBubble` event property behaviour
* fix wrong `Path` `getClientRect()` calculation
* better HDPI support
* better typescript definitions
* node 0.12 support

### Changed

* more universal stage container selector
* `mousewheel` event changed to `wheel`

## [0.11.1][2016-01-16]

### Fixed

* correct `Konva.Arrow` drawing. Now it works better.
* Better support for dragging when mouse out of stage
* Better corner radius for `Label` shape
* `contentTap` event for stage

### Added

* event delegation. You can use it in this way: `layer.on('click', 'Circle', handler);`
* new `node.findAncestors(selector)` and `node.findAncestor(selector)` functions
* optional selector parameter for `stage.getIntersection` and `layer.getIntersection`
* show warning message if several instances of Konva are added to page.

### Changed

* `moveTo` and some other methods return `this`
* `getAbsolutePosition` support optional relative parent argument (useful to find absolute position inside of some of parent nodes)
* `change` event will be not fired if changed value is the same as old value

## [0.10.0][2015-10-27]

### Added

* RGBA filter. Thanks to [@codefo](https://github.com/codefo)
* `stroke` and `fill` support for `Konva.Sprite`

### Fixed

* Correct calculation in `getClientRect` method of `Konva.Line` and `Konva.Container`.
* Correct `toObject()` behaviour for node with attrs with extended native prototypes
* Fixed bug for caching where buffer canvas is required

### Changed

* Dragging works much better. If your pointer is out of stage content dragging will still continue.
* `Konva.Node.create` now works with objects.
* `Konva.Tween` now supports tweening points to state with different length

## [0.9.5][2015-05-28]

### Fixed

* `to` will not throw error if no `onFinish` callback
* HDPI support for desktop
* Fix bug when filters are not correct for HDPI
* Fix bug when hit area is not correct for HDPI
* Fix bug for incorrect `getClientRect` calculation
* Repair fill gradient for text

### Changed

* context wrapper is more capable with native context.
  So you can use `context.fillStyle` property in your `sceneFunc` without accessing native context.
* `toDataURL` now handles pixelRatio. you can pass `config.pixelRatio` argument
* Correct `clone()` for custom nodes
* `FastLayer` can now have transforms
* `stage.toDataURL()` method now works synchronously. So `callback` argument is not required.
* `container.find(selector)` method now has a validation step. So if you forgot to add `#` or `.` you will see a warning message in the console.

### Added

* new `Konva.Image.fromURL` method

### Deprecated

* `fillRed`, `fillGreen`, `fillBlue`, `fillAlpha` are deprecated. Use `fill` instead.
* `strokeRed`, `strokeGreen`, `strokeBlue`, `strokeAlpha` are deprecated. Use `stroke` instead.
* `shadowRed`, `shadowGreen`, `shadowBlue`, `shadowAlpha` are deprecated. Use `shadow` instead.
* `dashArray` is deprecated. Use `dash` instead.
* `drawFunc` is deprecated. Use `sceneFunc` instead.
* `drawHitFunc` is deprecated. Use `hitFunc` instead.
* `rotateDeg` is deprecated. Use `rotate` instead.

## [0.9.0][2015-02-27]

### Fixed

* cache algorithm has A LOT OF updates.

### Changed

* `scale` now affects `shadowOffset`
* performance optimization (remove some unnecessary draws)
* more expected drawing when shape has opacity, stroke and shadow
* HDPI for caching.
* Cache should work much better. Now you don't need to pass bounding box {x,y,width,height} to `cache` method for all buildin Konva shapes. (only for your custom `Konva.Shape` instance).
* `Tween` now supports color properties (`fill`, `stroke`, `shadowColor`)

### Added

* new methods for working with node's name: `addName`, `removeName`, `hasName`.
* new `perfectDrawEnabled` property for shape. See [http://konvajs.github.io/docs/performance/Disable_Perfect_Draw.html](http://konvajs.github.io/docs/performance/Disable_Perfect_Draw.html)
* new `shadowForStrokeEnabled` property for shape. See [http://konvajs.github.io/docs/performance/All_Performance_Tips.html](http://konvajs.github.io/docs/performance/All_Performance_Tips.html)
* new `getClientRect` method.
* new `to` method for every node for shorter tweening

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
