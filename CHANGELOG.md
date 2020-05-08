# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## Not released:

## 6.0.0 - 2020-05-08

* **BREAKING!** `boundBoxFunc` of `Konva.Transformer` works in absolute coordinates of whole transformer. Previously in was working in local coordinates of transforming node.
* Many `Konva.Transformer` fixes. Now it works correctly when you transform several rotated shapes.
* Fix for wrong `mouseleave` and `mouseout` fire on shape remove/destroy;

## 5.0.3 - 2020-05-01

* Fixes for `boundBoxFunc` of `Konva.Transformer`.

## 5.0.2 - 2020-04-23

* Deatach fixes for `Konva.Transformer`

## 5.0.1 - 2020-04-22

* Fixes for `Konva.Transformer` when parent scale is changed
* Fixes for `Konva.Transformer` when parent is draggable
* Performance optimizations

## 5.0.0 - 2020-04-21

* **New `Konva.Transformer` implementation!**. Old API should work. But I marked this release is `major` (breaking) just for smooth updates. Changes:
  * Support of transforming multiple nodes at once: `tr.nodes([shape1, shape2])`.
  * `tr.node()`, `tr.setNode()`, `tr.attachTo()` methods are deprecated. Use `tr.nodes(array)` instead
  * Fixes for center scaling
  * Fixes for better `padding` support
  * `Transformer` can be placed anywhere in the tree of a stage tree (NOT just inside a parent of attached node).
* Fix `imageSmoothEnabled` resets when stage is resized
* Memory usage optimizations when a node is cached

## 4.2.2 - 2020-03-26

* Fix hit stroke issues

## 4.2.1 - 2020-03-26

* Fix some issues with `mouseenter` and `mouseleave` events.
* Deprecate `hitStrokeEnabled` property
* Fix rounding issues for `getClientRect()` for some shapes

## 4.2.0 - 2020-03-14

* Add `rotationSnapTolerance` property to `Konva.Transformer`.
* Add `getActiveAnchor()` method to `Konva.Transformer`
* Fix hit for non-closed `Konva.Path`
* Some fixes for experimental Offscreen canvas support inside a worker

## 4.1.6 - 2020-02-25

* Events fixes for `Konva.Transformer`
* Now `Konva` will keep `id` in a cloned node
* Better error messages on tainted canvas issues

## 4.1.5 - 2020-02-16

* Fixes for `path.getClientRect()` function calculations

## 4.1.4 - 2020-02-10

* Fix wrong internal caching of absolute attributes
* Fix `Konva.Transformer` behavior on scaled with CSS stage

## 4.1.3 - 2020-01-30

* Fix line with tension calculations
* Add `node.getAbsoluteRotation()` method
* Fix cursor on anchors for rotated parent

## 4.1.2 - 2020-01-08

* Fix possible `NaN` in content calculations

## 4.1.1 - 2020-01-07

* Add ability to use `width = 0` and `height = 0` for `Konva.Image`.
* Fix `cache()` method of `Konva.Arrow()`
* Add `Transform` to `Konva` default exports. So `Konva.Transform` is available now.

## 4.1.0 - 2019-12-23

* Make events work on some CSS transforms
* Fix caching on float dimensions
* Fix `mouseleave` event on stage.
* Increase default anchor size for `Konva.Transformer` on touch devices

## 4.0.18 - 2019-11-20

* Fix `path.getClientRect()` calculations for `Konva.Path`
* Fix wrong fire of `click` and `tap` events on stopped drag events.

## 4.0.17 - 2019-11-08

* Allow hitStrokeWidth usage, even if a shape has not stroke visible
* Better IE11 support

## 4.0.16 - 2019-10-21

* Warn on undefined return value of `dragBoundFunc`.
* Better calculations for `container.getClientRect()`

## 4.0.15 - 2019-10-15

* TS fixes
* Better calculations for `TextPath` with align = right
* Better `textPath.getClientRect()`

## 4.0.14 - 2019-10-11

* TS fixes
* Fix globalCompositeOperation + cached hit detections.
* Fix absolute position calculations for cached parent

## 4.0.13 - 2019-10-02

* Fix `line.getClientRect()` calculations for line with a tension or low number of points

## 4.0.12 - 2019-09-17

* Fix some bugs when `Konva.Transformer` has `padding > 0`

## 4.0.10 - 2019-09-10

* Fix drag position handling
* Fix multiple selector for find() method

## 4.0.9 - 2019-09-06

* Fix `Konva.Transformer` behavior on mirrored nodes
* Fix `stage.getPointerPosition()` logic.

## 4.0.8  - 2019-09-05

* Fix `dragend` event on click
* Revert fillPatternScale for text fix.

## 4.0.7  - 2019-09-03

* Fixed evt object on `dragstart`
* Fixed double tap trigger after dragging

## 4.0.6  - 2019-08-31

* Fix fillPatternScale for text

## 4.0.5  - 2019-08-17

* Fix `dragstart` flow when `node.startDrag()` is called.
* Fix `tap` and `dbltap` double trigger on stage

## 4.0.4  - 2019-08-12

* Add `node.isCached()` method
* Fix nested dragging bug

## 4.0.3  - 2019-08-08

* Slightly changed `mousemove` event flow. It triggers for first `mouseover` event too
* Better `Konva.hitOnDragEnabled` support for mouse inputs

## 4.0.2  - 2019-08-08

* Fixed `node.startDrag()` behavior. We can call it at any time.

## 4.0.1  - 2019-08-07

* Better `Konva.Arrow` + tension drawing
* Typescript fixes

## 4.0.0  - 2019-08-05

Basically the release doesn't have any breaking changes. You may only have issues if you are using something from `Konva.DD` object (which is private and never documented). Otherwise you should be fine. `Konva` has major upgrade about touch events system and drag&drop flow. The API is exactly the same. But the internal refactoring is huge so I decided to make a major version. Please upgrade carefully. Report about any issues you have.

* Better multi-touch support. Now we can trigger several `touch` events on one or many nodes.
* New drag&drop implementation. You can drag several shapes at once with several pointers.
* HSL colors support

## 3.4.1  - 2019-07-18

* Fix wrong double tap trigger

## 3.4.0  - 2019-07-12

* TS types fixes
* Added support for different values for `cornerRadius` of `Konva.Rect`

## 3.3.3  - 2019-06-07

* Some fixes for better support `konva-node`
* TS types fixes

## 3.3.2  - 2019-06-03

* TS types fixes

## 3.3.1  - 2019-05-28

* Add new property `imageSmoothingEnabled` to the node caching
* Even more ts fixes. Typescript need a lot of attention, you know...

## 3.3.0  - 2019-05-28

* Enable strict mode for ts types
* Add new property `imageSmoothingEnabled` to the layer

## 3.2.7  - 2019-05-27

* Typescript fixes
* Experimental pointer events support. Do `Konva._pointerEventsEnabled = true;` to enable
* Fix some `Konva.Transformer` bugs.

## 3.2.6  - 2019-05-09

* Typescript fixes again

## 3.2.5  - 2019-04-17

* Show a warning when `Konva.Transformer` and attaching node have different parents.
* Typescript fixes

## 3.2.4  - 2019-04-05

* Fix some stage events. `mouseenter` and `mouseleave` should work correctly on empty spaces
* Fix some typescript types
* Better detection of production mode (no extra warnings)

## 3.2.3  - 2019-03-21

* Fix `hasName` method for empty name cases

## 3.2.2  - 2019-03-19

* Remove `dependencies` from npm package

## 3.2.1  - 2019-03-18

* Better `find` and `findOne` lookup. Now we should not care about duplicate ids.
* Better typescript definitions

## 3.2.0  - 2019-03-10

* new property `shape.hitStrokeWidth(10)`
* Better typescript definitions
* Remove `Object.assign` usage (for IE11 support)

## 3.1.7  - 2019-03-06

* Better modules and TS types

## 3.1.6  - 2019-02-27

* Fix commonjs exports
* Fix global injections

## 3.1.0  - 2019-02-27

* Make `Konva` modular: `import Konva from 'konva/lib/Core';`;
* Fix incorrect `Transformer` behavior
* Fix drag&drop for touch devices

## 3.0.0  - 2019-02-25

## Breaking

Customs builds are temporary removed from npm package. You can not use `import Konva from 'konva/src/Core';`.
This feature will be added back later.

### Possibly breaking

That changes are private and internal specific. They should not break most of `Konva` apps.

* `Konva.Util.addMethods` is removed
* `Konva.Util._removeLastLetter`  is removed
* `Konva.Util._getImage`  is removed
* `Konv.Util._getRGBAString`  is removed
* `Konv.Util._merge`  is removed
* Removed polyfill for `requestAnimationFrame`.
* `id` and `name` properties defaults are empty strings, not `undefined`
* internal `_cache` property was updated to use es2015 `Map` instead of `{}`.
* `Konva.Validators` is removed.


### Added
* Show a warning when a stage has too many layers
* Show a warning on duplicate ids
* Show a warning on weird class in `Node.create` parsing from JSON
* Show a warning for incorrect value for component setters.
* Show a warning for incorrect value for `zIndex` property.
* Show a warning when user is trying to reuse destroyed shape.
* new publish method `measureSize(string)` for `Konva.Text`
* You can configure what mouse buttons can be used for drag&drop. To enable right button you can use `Konva.dragButtons = [0, 1]`.
* Now you can hide stage `stage.visible(false)`. It will set its container display style to "none".
* New method `stage.setPointersPositions(event)`. Usually you don't need to use it manually.
* New method `layer.toggleHitCanvas()` to show and debug hit areas

### Changed
* Full rewrite to Typescript with tons of refactoring and small optimizations. The public API should be 100% the same
* Fixed `patternImage` and `radialGradient` for `Konva.Text`
* `Konva.Util._isObject` is renamed to `Konva.Util._isPlainObject`.
* A bit changed behavior of `removeId` (private method), now it doesn't clear node ref, if object is changed.
* simplified `batchDraw` method (it doesn't use `Konva.Animation`) now.
* Performance improvements for shapes will image patterns, linear and radial fills
* `text.getTextHeight()` is deprecated. Use `text.height()` or `text.fontSize()` instead.
* Private method `stage._setPointerPosition()` is deprecated. Use `stage.setPointersPositions(event)`;

### Fixed

* Better mouse support on mobile devices (yes, that is possible to connect mouse to mobile)
* Better implementation of `mouseover` event for stage
* Fixed underline drawing for text with `lineHeight !== 1`
* Fixed some caching behavior when a node has `globalCompositeOperation`.
* Fixed automatic updates for `Konva.Transformer`
* Fixed container change for a stage.
* Fixed warning for `width` and `height` attributes for `Konva.Text`
* Fixed gradient drawing for `Konva.Text`
* Fixed rendering with `strokeWidth = 0`

## 2.6.0  - 2018-12-14

### Changed

* Performance fixes when cached node has many children
* Better drawing for shape with `strokeScaleEnabled = false` on HDPI devices

### Added

* New `ignoreStroke` for `Konva.Transformer`. Good to use when a shape has `strokeScaleEnabled = false`

### Changed

* `getKerning` TextPath API is deprecated. Use `kerningFunc` instead.

## 2.5.1  - 2018-11-08

### Changed

* Use custom functions for `trimRight` and `trimLeft` (for better browsers support)

## 2.5.0  - 2018-10-24

### Added

* New `anchorCornerRadius` for `Konva.Transformer`

### Fixed

* Performance fixes for caching

### Changed

* `dragstart` event behavior is a bit changed. It will fire BEFORE actual position of a node is changed.

## 2.4.2  - 2018-10-12

### Fixed

* Fixed a wrong cache when a shape inside group has `listening = false`

## 2.4.1  - 2018-10-08

### Changed

* Added some text trim logic to wrap in better

### Fixed

* `getClientRect` for complex paths fixes
* `getClientRect` calculation fix for groups
* Update `Konva.Transformer` on `rotateEnabled` change
* Fix click stage event on dragend
* Fix some Transformer cursor behavior

## 2.4.0  - 2018-09-19

### Added

* Centered resize with ALT key for `Konva.Transformer`
* New `centeredScaling` for `Konva.Transformer`

### Fixed

* Tween support for gradient properties
* Add `user-select: none` to the stage container to fix some "selected contend around" issues


## 2.3.0  - 2018-08-30

### Added

* new methods `path.getLength()` and `path.getPointAtLength(val)`
* `verticalAlign` for `Konva.Text`

## 2.2.2  - 2018-08-21

### Changed

* Default duration for tweens and `node.to()` methods is now 300ms
* Typescript fixes
* Automatic validations for many attributes

## 2.2.1  - 2018-08-10

### Added

* New properties for `Konva.Transformer`: `borderStroke`, `borderStrokeWidth`, `borderDash`, `anchorStroke`, `anchorStrokeWidth`, `anchorSize`.

### Changed

* Some properties of `Konva.Transformer` are renamed. `lineEnabled` -> `borderEnabled`. `rotateHandlerOffset` -> `rotateAnchorOffset`, `enabledHandlers` -> `enabledAnchors`.

## 2.1.8  - 2018-08-01

### Fixed

* Some `Konva.Transformer` fixes
* Typescript fixes
* `stage.toDataURL()` fixes when it has hidden layers
* `shape.toDataURL()` automatically adjust position and size of resulted image

## 2.1.7  - 2018-07-03

### Fixed

* `toObject` fixes

## 2.1.7  - 2018-07-03

### Fixed

* Some drag&drop fixes

## 2.1.6  - 2018-06-16

### Fixed

* Removed wrong dep
* Typescript fixes

## 2.1.5  - 2018-06-15

### Fixed

* Typescript fixes
* add shape as second argument for `sceneFunc` and `hitFunc`

## 2.1.4  - 2018-06-15

### Fixed

* Fixed `Konva.Text` justify drawing for a text with decoration
* Added methods `data()`,`setData()`  and `getData()` methods to `Konva.TextPath`
* Correct cache reset for `Konva.Transformer`

## 2.1.3  - 2018-05-17

### Fixed

* `Konva.Transformer` automatically track shape changes
* `Konva.Transformer` works with shapes with offset too

## 2.1.2  - 2018-05-16

### Fixed

* Cursor fixes for `Konva.Transformer`
* Fixed lineHeight behavior for `Konva.Text`
* Some performance optimizations for `Konva.Text`
* Better wrap algorithm for `Konva.Text`
* fixed `Konva.Arrow` with tension != 0
* Some fixes for `Konva.Transformer`

## 2.0.3  - 2018-04-21

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

## 2.0.2  - 2018-03-15

### Fixed

* Even more bugs fixes for `Konva.Transformer`

## 2.0.1  - 2018-03-15

### Fixed

* Several bugs fixes for `Konva.Transformer`

## 2.0.0  - 2018-03-15

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

## 1.7.6  - 2017-11-01

### Fixed

* Some typescript fixes

## 1.7.4  - 2017-10-30

### Fixed

* `isBrowser` detection for electron

## 1.7.3  - 2017-10-19

### Changed

* Changing size of a stage will redraw it in synchronous way

### Fixed

* Some fixes special for nodejs

## 1.7.2  - 2017-10-11

### Fixed

* Fixed `Konva.document is undefined`

## 1.7.1  - 2017-10-11

### Changed

* Konva for browser env and Konva for nodejs env are separate packages now. You can use `konva-node` for NodeJS env.

## 1.7.0  - 2017-10-08

### Fixed

* Several typescript fixes

### Changed

* Default value for `dragDistance` is changed to 3px.
* Fix rare error throw on drag
* Caching with height = 0 or width = 0 with throw async error. Caching will be ignored.

## 1.6.8  - 2017-08-19

### Changed

* The `node.getClientRect()` calculation is changed a bit. It is more powerfull and correct. Also it takes parent transform into account. See docs.
* Upgrade nodejs deps

## 1.6.7  - 2017-07-28

### Fixed

* Fix bug with double trigger wheel in Firefox
* Fix `node.getClientRect()` calculation in a case of Group + invisible child
* Fix dblclick issue https://github.com/konvajs/konva/issues/252

## 1.6.3  - 2017-05-24

### Fixed

* Fixed bug with pointer detection. css 3d transformed stage will not work now.

## 1.6.2  - 2017-05-08

### Fixed

* Fixed bug with automatic shadow for negative scale values

## 1.6.1  - 2017-04-25

### Fixed

* Fix pointer position detection

### Changed

* moved `globalCompositeOperation` property to `Konva.Node`

## 1.6.0  - 2017-04-21

### Added

* support of globalCompositeOperation for `Konva.Shape`

### Fixed

* getAllIntersections now works ok for Text shapes (https://github.com/konvajs/konva/issues/224)

### Changed

* Konva a bit changed a way to detect pointer position. Now it should be OK to apply css transform on Konva container. https://github.com/konvajs/konva/pull/215

## 1.5.0  - 2017-03-20

### Added

* support for `lineDashOffset` property for `Konva.Shape`.

## 1.4.0  - 2017-02-07

## Added

* `textDecoration` of `Konva.Text` now supports `line-through`

## 1.3.0  - 2017-01-10

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

## 1.2.2  - 2016-09-15

### Fixed

* refresh stage hit and its `dragend`
* `getClientRect` calculations

## 1.2.0  - 2016-09-15

## Added

* new properties for `Konva.TextPath`: `letterSpacing` and `textBaseline`.

## 1.1.4  - 2016-09-13

### Fixed

* Prevent throwing an error when text property of `Konva.Text` = undefined or null

## 1.1.3  - 2016-09-12

### Changed

* Better hit function for `TextPath`.
* Validation of `Shape` filters.

## 1.1.2  - 2016-09-10

### Fixed

* Fixed "Dragging Group on mobile view throws "missing preventDefault" error" #169

## 1.1.1  - 2016-08-30

### Fixed

* Fixed #166 bug of drag&drop

## 1.1.0  - 2016-08-21

## Added

* new property of `Konva.Shape` - `preventDefault`.

## 1.0.3  - 2016-08-14

### Fixed

* Fixed some typescript definitions

## 1.0.2  - 2016-07-08

## Changed

* `Konva.Text` will interpret undefined `width` and `height` as `AUTO`

## 1.0.1  - 2016-07-05

### Changed

* you can now unset property by `node.x(undefined)` or `node.setAttr('x', null)`

### Fixed

* Bug fix for case when `touchend` event throws error

## 1.0.0  - 2016-07-05

### Fixed

* Bug fix for case when `touchend` event throws error

## 0.15.0  - 2016-06-18

## Added

* Custom clip function

## 0.14.0  - 2016-06-17

### Fixed

* fixes in typescript definitions
* fixes for bug with `mouseenter` event on deep nesting case

## 0.13.9  - 2016-05-14

### Changed

* typescript definition in npm package
* node@5.10.1, canvas@1.3.14, jsdom@8.5.0 support
* `Konva.Path` will be filled when it is not closed
* `Animation.start()` will not not immediate sync draw. This should improve performance a little.
* Warning when node for `Tween` is not in layer yet.
* `removeChildren()` remove only first level children. So it will not remove grandchildren.

## 0.12.4  - 2016-04-19

### Changed

* `batchDraw` will do not immediate `draw()`

### Fixed

* fix incorrect shadow offset on rotation

## 0.12.3  - 2016-04-07

### Fixed

* `batchDraw` function works less time now
* lighter npm package

## 0.12.2  - 2016-03-31

### Fixed

* repair `cancelBubble` event property behaviour
* fix wrong `Path` `getClientRect()` calculation
* better HDPI support
* better typescript definitions
* node 0.12 support

### Changed

* more universal stage container selector
* `mousewheel` event changed to `wheel`

## 0.11.1  - 2016-01-16

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

## 0.10.0  - 2015-10-27

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

## 0.9.5  - 2015-05-28

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

## 0.9.0  - 2015-02-27

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
* new `perfectDrawEnabled` property for shape. See [http://konvajs.org/docs/performance/Disable_Perfect_Draw.html](http://konvajs.org/docs/performance/Disable_Perfect_Draw.html)
* new `shadowForStrokeEnabled` property for shape. See [http://konvajs.org/docs/performance/All_Performance_Tips.html](http://konvajs.org/docs/performance/All_Performance_Tips.html)
* new `getClientRect` method.
* new `to` method for every node for shorter tweening

## 0.8.0  - 2015-02-04

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
