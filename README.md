<p align="center">
  <img src="https://konvajs.org/img/icon.png" alt="Konva logo" height="60" />
</p>

<h1 align="center">Konva</h1>

<p align="center"><strong>Build interactive graphics, editors, and diagrams for the web.</strong></p>

[![npm downloads](https://img.shields.io/npm/dw/konva.svg)](https://www.npmjs.com/package/konva)
[![npm version](https://badge.fury.io/js/konva.svg)](https://badge.fury.io/js/konva)
[![Financial Contributors on Open Collective](https://opencollective.com/konva/all/badge.svg?label=financial+contributors)](https://opencollective.com/konva)
[![Build Status](https://github.com/konvajs/konva/actions/workflows/test-browser.yml/badge.svg)](https://github.com/konvajs/konva/actions/workflows/test-browser.yml)
[![Build Status](https://github.com/konvajs/konva/actions/workflows/test-node.yml/badge.svg)](https://github.com/konvajs/konva/actions/workflows/test-node.yml)
[![CDNJS version](https://img.shields.io/cdnjs/v/konva.svg)](https://cdnjs.com/libraries/konva)

Konva is an open-source 2D canvas framework for interactive graphics. Its scene graph gives each shape its own events, drag behavior, transforms, animation, cache, and export controls.

Use Konva for design editors, whiteboards, diagrams, annotations, maps, and other visual tools. Konva is MIT licensed and does not require a license key.

This repository began as a GitHub fork of [ericdrowell/KineticJS](https://github.com/ericdrowell/KineticJS).

- **Visit:** The [Home Page](https://konvajs.org/) and follow on [Twitter](https://twitter.com/lavrton)
- **Discover:** [Tutorials](https://konvajs.org/docs/index.html), [API Documentation](https://konvajs.org/api/Konva.html)
- **Try it:** [Canvas Editor](https://konvajs.org/docs/sandbox/Canvas_Editor.html), [Free Drawing](https://konvajs.org/docs/sandbox/Free_Drawing.html), [Image Crop](https://konvajs.org/docs/sandbox/Canvas_Crop_Image.html), [Window Frame Designer](https://konvajs.org/docs/sandbox/Window_Frame_Designer.html), and [more demos](https://konvajs.org/docs/sandbox.html)
- **Used by:** [Polotno](https://polotno.com/?utm_source=konvajs) (design editor SDK) and many others — see the full showcase on the [home page](https://konvajs.org/)
- **Help:** [StackOverflow](https://stackoverflow.com/questions/tagged/konvajs), [Discord Chat](https://discord.gg/8FqZwVT)
- **Support the project:** [Star Konva on GitHub](https://github.com/konvajs/konva)

[![A Konva Transformer around a selected image](https://konvajs.org/assets/demos/image-resize-min.png)](https://konvajs.org/docs/select_and_transform/Basic_demo.html)

## Framework integrations

| Framework | Package | Documentation |
|---|---|---|
| React | [`react-konva`](https://www.npmjs.com/package/react-konva) | [React guide](https://konvajs.org/docs/react/index.html) |
| Vue | [`vue-konva`](https://www.npmjs.com/package/vue-konva) | [Vue guide](https://konvajs.org/docs/vue/index.html) |
| Svelte | [`svelte-konva`](https://www.npmjs.com/package/svelte-konva) | [Svelte guide](https://konvajs.org/docs/svelte/index.html) |
| Angular | [`ng2-konva`](https://www.npmjs.com/package/ng2-konva) | [Angular guide](https://konvajs.org/docs/angular/index.html) |

# Quick Look

```javascript
import Konva from 'konva';

const container = document.createElement('div');
document.body.appendChild(container);

const stage = new Konva.Stage({ container, width: 600, height: 400 });
const layer = new Konva.Layer();
const box = new Konva.Rect({
  x: 50, y: 50, width: 120, height: 80,
  fill: '#00a8e8', draggable: true,
});

layer.add(box);
stage.add(layer);
```

# Browsers support

Konva works in modern mobile and desktop browsers that support ES2015.

# Debugging

The Chrome inspector simply shows the canvas element. To see the Konva objects and their details, install the konva-dev extension at https://github.com/konvajs/konva-devtool.

# Loading and installing Konva

Konva supports UMD loading. So you can use all possible variants to load the framework into your project:

### Load Konva via classical `<script>` tag from CDN:

```html
<script src="https://unpkg.com/konva@10/konva.min.js"></script>
```

### Install with npm:

```bash
npm install konva
```

```javascript
// The modern way (e.g. an ES6-style import for webpack, parcel)
import Konva from 'konva';
```

#### Typescript usage

Add DOM definitions into your `tsconfig.json`:

```
{
  "compilerOptions": {
    "lib": [
        "es6",
        "dom"
    ]
  }
}
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

In order to run `konva` in nodejs environment you also need to install `canvas` or `skia-canvas` package manually for rendering backend.

```bash
# node-canvas backend
npm install konva canvas
# skia-canvas backend
npm install konva skia-canvas
```

Then you can use the same Konva API and all Konva demos will work just fine. You just don't need to use `container` attribute in your stage.

```js
import Konva from 'konva';
import 'konva/canvas-backend'; // or import 'konva/skia-backend';

const stage = new Konva.Stage({
  width: 500,
  height: 500,
});
// then all regular Konva code will work
```

# Backers

![https://simpleshow.com](https://avatars.githubusercontent.com/u/99720652?s=200&v=4 'https://simpleshow.com')
![https://www.notably.ai/](https://avatars.githubusercontent.com/u/80046841?s=200&v=4 'https://www.notably.ai/')

- [myposter GmbH](https://www.myposter.de/)
- [queue.gg](https://queue.gg/)

# Change log

See [CHANGELOG.md](https://github.com/konvajs/konva/blob/master/CHANGELOG.md).

## Building the Konva Framework

To make a full build run `npm run build`. The command will compile all typescript files, combine then into one bundle and run minifier.

## Testing

Konva uses Mocha for testing.

- If you need run test only one time run `npm run test`.
- While developing it is easy to use `npm start`. Just run it and go to [http://localhost:1234/unit-tests.html](http://localhost:1234/unit-tests.html). The watcher will rebuild the bundle on any change.

Konva is covered with hundreds of tests and well over a thousand assertions.
Konva uses TDD (test driven development) which means that every new feature or bug fix is accompanied with at least one new test.

## Generate documentation

Run `npx gulp api` which will build the documentation files and place them in the `api` folder.

# Pull Requests

I'd be happy to review any pull requests that may better the Konva project,
in particular if you have a bug fix, enhancement, or a new shape (see `src/shapes` for examples). Before doing so, please first make sure that all of the tests pass (`npm run test`).

## Contributors

### Financial Contributors

Become a financial contributor and help us sustain our community. [[Contribute](https://opencollective.com/konva/contribute)]

#### Individuals

<a href="https://opencollective.com/konva"><img src="https://opencollective.com/konva/individuals.svg?width=890"></a>

#### Organizations

Support this project with your organization. Your logo will show up here with a link to your website. [[Contribute](https://opencollective.com/konva/contribute)]

<a href="https://opencollective.com/konva/organization/0/website"><img src="https://opencollective.com/konva/organization/0/avatar.svg"></a>
<a href="https://opencollective.com/konva/organization/1/website"><img src="https://opencollective.com/konva/organization/1/avatar.svg"></a>
<a href="https://opencollective.com/konva/organization/2/website"><img src="https://opencollective.com/konva/organization/2/avatar.svg"></a>
<a href="https://opencollective.com/konva/organization/3/website"><img src="https://opencollective.com/konva/organization/3/avatar.svg"></a>
<a href="https://opencollective.com/konva/organization/4/website"><img src="https://opencollective.com/konva/organization/4/avatar.svg"></a>
<a href="https://opencollective.com/konva/organization/5/website"><img src="https://opencollective.com/konva/organization/5/avatar.svg"></a>
<a href="https://opencollective.com/konva/organization/6/website"><img src="https://opencollective.com/konva/organization/6/avatar.svg"></a>
<a href="https://opencollective.com/konva/organization/7/website"><img src="https://opencollective.com/konva/organization/7/avatar.svg"></a>
<a href="https://opencollective.com/konva/organization/8/website"><img src="https://opencollective.com/konva/organization/8/avatar.svg"></a>
<a href="https://opencollective.com/konva/organization/9/website"><img src="https://opencollective.com/konva/organization/9/avatar.svg"></a>
