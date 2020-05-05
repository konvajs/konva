<p align="center">
  <img src="https://raw.githubusercontent.com/konvajs/konvajs.github.io/master/apple-touch-icon-180x180.png" alt="Konva logo" height="180" />
</p>

<h1 align="center">Konva</h1>

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/konvajs/konva?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![npm version](https://badge.fury.io/js/konva.svg)](http://badge.fury.io/js/konva) [![bower version](https://badge.fury.io/bo/konva.svg)](http://badge.fury.io/bo/konva)
[![Build Status](https://travis-ci.org/konvajs/konva.png)](https://travis-ci.org/konvajs/konva)  [![Code Climate](https://codeclimate.com/github/konvajs/konva/badges/gpa.svg)](https://codeclimate.com/github/konvajs/konva) [![CDNJS version](https://img.shields.io/cdnjs/v/konva.svg)](https://cdnjs.com/libraries/konva)

Konva is an HTML5 Canvas JavaScript framework that enables high performance animations, transitions, node nesting, layering, filtering, caching, event handling for desktop and mobile applications, and much more.



You can draw things onto the stage, add event listeners to them, move them, scale them, and rotate them independently from other shapes to support high performance animations, even if your application uses thousands of shapes. Served hot with a side of awesomeness.

This repository began as a GitHub fork of [ericdrowell/KineticJS](https://github.com/ericdrowell/KineticJS).

* **Visit:** The [Home Page](http://konvajs.org/) and follow on [Twitter](https://twitter.com/lavrton)
* **Discover:** [Tutorials](http://konvajs.org/docs), [API Documentation](http://konvajs.org/api)
* **Help:** [StackOverflow](http://stackoverflow.com/questions/tagged/konvajs), [Chat](https://gitter.im/konvajs/konva)

# Quick Look

```html
<script src="https://unpkg.com/konva@3.1.0/konva.js"></script>
<div id="container"></div>
<script>
    var stage = new Konva.Stage({
        container: 'container',
        width: window.innerWidth,
        height: window.innerHeight
    });

    // add canvas element
    var layer = new Konva.Layer();
    stage.add(layer);

    // create shape
    var box = new Konva.Rect({
        x: 50,
        y: 50,
        width: 100,
        height: 50,
        fill: '#00D2FF',
        stroke: 'black',
        strokeWidth: 4,
        draggable: true
    });
    layer.add(box);

    layer.draw();

    // add cursor styling
    box.on('mouseover', function() {
        document.body.style.cursor = 'pointer';
    });
    box.on('mouseout', function() {
        document.body.style.cursor = 'default';
    });
</script>
```

# Browsers support

Konva works in all modern mobile and desktop browsers. A browser need to be capable to run javascript code from ES2015 spec. For older browsers you may need polyfills for missing functions.

At the current moment `Konva` doesn't work in IE11 directly. To make it work you just need to provide some polyfills such as `Array.prototype.find`, `String.prototype.trimLeft` and `String.prototype.trimRight`.

# Loading and installing Konva

Konva supports UMD loading. So you can use all possible variants to load the framework into your project:

### 1 Load Konva via classical `<script>` tag:

```html
<script src="https://unpkg.com/konva@^4.0.3/konva.js"></script>
```

You can also use a CDN: [https://unpkg.com/konva@^4.0.3/konva.js](https://unpkg.com/konva@^4.0.3/konva.js)

### 2 Install with npm:

```bash
npm install konva --save
```

```javascript
// The old way (e.g. a CommonJS-style import)
var Konva = require('konva');

// The modern way (e.g. an ES6-style import for webpack, parcel)
import Konva from 'konva';
```

#### Typescript usage

Add DOM definitions into your `tsconfig.json` and set `esModuleInterop` to `true`:

```
{
  "compilerOptions": {
    "esModuleInterop": true,
    "lib": [
        "es6",
        "dom"
    ]
  }
}
```

Then use it:

```javascript
import Konva from 'konva';
```

### 3 Minimal bundle

```javascript
import Konva from 'konva/lib/Core';
// Now you have a Konva object with Stage, Layer, FastLayer, Group, Shape and some additional utils function.
// Also core currently already have support for drag&drop and animations.
// BUT there are no shapes (rect, circle, etc), no filters.

// but you can simply add anything you need:
import { Rect } from 'konva/lib/shapes/Rect';
// importing a shape will automatically inject it into Konva object

var rect1 = new Rect();
// or:
var shape = new Konva.Rect();

// for filters you can use this:
import { Blur } from 'konva/lib/filters/Blur';
```

### 4 NodeJS env

We are using [node-canvas](https://github.com/Automattic/node-canvas) to create canvas element.
Please check installation instructions for it. Then just run

```bash
npm install konva-node
```

Then in you javascript file you will need to use

```javascript
const Konva = require('konva-node');
```

See file `konva-node/demo.js` file in this repo as a sample.

# Backers

[myposter GmbH](https://www.myposter.de/)
[queue.gg]()https://queue.gg/


# Change log

See [CHANGELOG.md](https://github.com/konvajs/konva/blob/master/CHANGELOG.md).

## Building the Konva Framework

To make a full build run `npm run build`. The command will compile all typescript files, combine then into one bundle and run minifier.

## Testing

Konva uses Mocha for testing.

* If you need run test only one time run `npm run test`.
* While developing it is easy to use `npm start`. Just run it and go to [http://localhost:8080/test/runner.html](http://localhost:8080/test/runner.html). The watcher will rebuild the bundle on any change.


Konva is covered with hundreds of tests and well over a thousand assertions.
Konva uses TDD (test driven development) which means that every new feature or bug fix is accompanied with at least one new test.

## Generate documentation

Run `npx gulp api` which will build the documentation files and place them in the `api` folder.

# Pull Requests

I'd be happy to review any pull requests that may better the Konva project,
in particular if you have a bug fix, enhancement, or a new shape (see `src/shapes` for examples). Before doing so, please first make sure that all of the tests pass (`gulp lint test`).
