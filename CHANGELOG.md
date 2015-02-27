# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [0.9.0][2015-02-27]

### Fixed
- cache algorithm has A LOT OF updates.

### Changed
- `scale` now affect `shadowOffset`
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
- new `to` method for every nodes for shorter tweening
    
## [0.8.0] - 2015-02-04

* Bug Fixes
    * fixed when browser is crashing on pointer events fixed
    * optimized `getIntersection` function
* Enhancements
    * `container.findOne()` method
    * new `strokeHitEnabled` property. Useful for performance optimizations
    * typescript definitions. see `/resources/konva.d.ts`


## Rebranding release 2015-01-28
Differents from last official `KineticJS` release

* Bug Fixes
    * `strokeScaleEnabled = false` is disabled for text as I can not find way to implement this
    * `strokeScaleEnabled = false` for Line now create correct hit graph
    * working "this-example" as name for nodes
    * Konva.Text() with no config don't throws exception
    * Konva.Line() with no config don't throws exception
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
    * opacity now affect cached shapes
    * Label corner radius
    * smart changing `width`, `height`, `radius` attrs for circle, start, ellipse, ring.
    * `mousewheel` support. Thanks [@vmichnowicz](https://github.com/vmichnowicz)
    * new Arrow plugin
    * multiple names: `node.name('foo bar'); container.find('.foo');` (thanks [@mattslocum](https://github.com/mattslocum))
    * `Container.findOne()`
    