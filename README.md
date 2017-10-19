![Konva logo](https://raw.githubusercontent.com/konvajs/konvajs.github.io/master/apple-touch-icon-180x180.png)

# Konva

Konva is an HTML5 Canvas JavaScript framework that enables high performance animations, transitions, node nesting, layering, filtering, caching, event handling for desktop and mobile applications, and much more.

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/konvajs/konva?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

[![npm version](https://badge.fury.io/js/konva.svg)](http://badge.fury.io/js/konva) [![bower version](https://badge.fury.io/bo/konva.svg)](http://badge.fury.io/bo/konva)
[![Build Status](https://travis-ci.org/konvajs/konva.png)](https://travis-ci.org/konvajs/konva)  [![Code Climate](https://codeclimate.com/github/konvajs/konva/badges/gpa.svg)](https://codeclimate.com/github/konvajs/konva) [![CDNJS version](https://img.shields.io/cdnjs/v/konva.svg)](https://cdnjs.com/libraries/konva)

You can draw things onto the stage, add event listeners to them, move them, scale them, and rotate them independently from other shapes to support high performance animations, even if your application uses thousands of shapes. Served hot with a side of awesomeness.

This repository began as a GitHub fork of [ericdrowell/KineticJS](https://github.com/ericdrowell/KineticJS).

* **Visit:** The [Home Page](http://konvajs.github.io/) and follow on [Twitter](https://twitter.com/lavrton)
* **Discover:** [Tutorials](http://konvajs.github.io/docs), [API Documentation](http://konvajs.github.io/api)
* **Help:** [StackOverflow](http://stackoverflow.com/questions/tagged/konvajs), [Chat](https://gitter.im/konvajs/konva)

<a target='_blank' rel='nofollow' href='https://app.codesponsor.io/link/wUMFgN5Poni4w2c2fAY71nB3/konvajs/konva'>
  <img alt='Sponsor' width='888' height='68' src='https://app.codesponsor.io/embed/wUMFgN5Poni4w2c2fAY71nB3/konvajs/konva.svg' />
</a>

# Quick Look

```html
<script src="https://cdn.rawgit.com/konvajs/konva/1.7.3/konva.min.js"></script>
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

# Loading and installing Konva

Konva supports UMD loading. So you can use all possible variants to load the framework into your project:

### 1 Load Konva via classical `<script>` tag:

```html
<script src="https://cdn.rawgit.com/konvajs/konva/1.7.3/konva.min.js"></script>
```

You can use CDN: [https://cdn.rawgit.com/konvajs/konva/1.7.3/konva.min.js](https://cdn.rawgit.com/konvajs/konva/1.7.3/konva.min.js)

### 2 Load via AMD (requirejs):

```javascript
define(['./konva'], function(Konva) {
   // your code
});
```

### 3 CommonJS style with npm:

```bash
npm install konva --save
```

```javascript
// old way
var Konva = require('konva');


// modern way
import Konva from 'konva';

// typescript
import * as Konva from 'konva';
```

### 4 Minimal bundle

If you are using webpack or browserfy you can use this approach to load only required Konva's parts:

```javascript
import Konva from 'konva/src/Core';
// now you have Konva object with Stage, Layer, FastLayer, Group, Shape and some additional utils function
// so there are no shapes (rect, circle, etc), no filters, no d&d support.


// but you can simply add anything you need:
import 'konva/src/shapes/rect';
//now Konva.Rect is available to use
```

### 5 NodeJS

We are using [node-canvas](https://github.com/Automattic/node-canvas) to create canvas element.
Please check installation instructions for it. Then just run

```bash
npm install konva-node
```

Then in you javascript file you will need to use

```javascript
const Konva = require('konva-node');
```

See file `resources/nodejs-demo.js` for example.

# Change log

See [CHANGELOG.md](https://github.com/konvajs/konva/blob/master/CHANGELOG.md).

# Dev environment

Before doing all dev stuff make sure you have node installed. After that, run `npm install` in the main directory to install the node module dependencies.

Run `gulp -T` to see all build options.

## Building the Konva Framework

To build a development version of the framework, run `gulp dev-build`. To run a full build, which also produces the minified version run `gulp build`.

If you add a file in the src directory, be sure to add the filename to the sourceFiles array variable in `gulpfile.js`.

## Testing

Konva uses Mocha for testing.

* If you need run test only one time run `gulp test`.
* While developing it is easy to use `gulp` default task with watch. Just run it and go to [http://localhost:8080/test/runner.html](http://localhost:8080/test/runner.html). After src file change konva-dev.js will be automatically created, so you just need refresh test the page.

Konva is covered with hundreds of tests and well over a thousand assertions.
Konva uses TDD (test driven development) which means that every new feature or bug fix is accompanied with at least one new test.

## Generate documentation

Run `gulp api` which will build the documentation files and place them in the `api` folder.


# Pull Requests
I'd be happy to review any pull requests that may better the Konva project,
in particular if you have a bug fix, enhancement, or a new shape (see `src/shapes` for examples).  Before doing so, please first make sure that all of the tests pass (`gulp lint test`).
