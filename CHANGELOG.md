## 5.2.0 2014-01-22

* Bug Fixes
    * working "this-example" as name for nodes
    * Kinetic.Text() with no config don't throws exception
    * Kinetic.Line() with no config don't throws exception
* Enhancements
    * `black` is default fill for text
    * true class extending. Now `rect instanceOf Kinetic.Shape` will return true
    * while dragging you can redraw layer that is not under drag. hit graph will be updated in this case
    * now you can move object that is dragging into another layer.
    * new `frameOffsets` attribute for `Kinetic.Sprite`

## 5.1.9 2014-01-09

* Bug Fixes
    * Correct stage resizing with `FastLayer`
    * `batchDraw` method for `FastLayer`
    * Correct mouseover/mouseout/mouseenter/mouseleave events for groups
    * cache node before adding to layer
    * `intersects` function now works for shapes with shadow
* Enhancements
    * npm package. See https://github.com/ericdrowell/KineticJS#installation
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
    * `Container.findOne()` method. (thanks [@pronebird](https://github.com/pronebird))