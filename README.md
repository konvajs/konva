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

> **Building a full design editor?** [Polotno](https://polotno.com/?utm_source=konvajs&utm_medium=readme&utm_content=konva) is a commercial design editor SDK built on Konva by the Konva maintainers. It ships templates, text editing, and export, so you integrate an editor instead of building one: `npm install polotno`.

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

Konva is maintained by the team behind [Polotno](https://polotno.com/?utm_source=konvajs&utm_medium=readme&utm_content=konva-backers), a commercial design editor SDK built on Konva, which sponsors ongoing development.

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


## 🌐 Web Resources & Interactive Index
- [INDEX14](https://studyplaying.github.io/index14.html)
- [HAND OVER HAND](https://thelearnquesters.pages.dev/hand-over-hand.html)
- [CATEGORY SIMULATION 2](https://learnquester.pages.dev/category-simulation-2.html)
- [FOREST MATCH 4](https://themindzone.pages.dev/forest-match-4.html)
- [FISH EAT GROW MEGA](https://theskillquest.pages.dev/fish-eat-grow-mega.html)
- [BFFS K POP FANGIRLS](https://studyquests.github.io/bffs-k-pop-fangirls.html)
- [KINGDOM WARS TD](https://thequizzone.pages.dev/kingdom-wars-td.html)
- [STICKMAN VS ZOMBIES WORLDCRAFT](https://thelearnquester.web.app/stickman-vs-zombies-worldcraft.html)
- [TAIL GUN CHARLIE](https://studyplaying.github.io/tail-gun-charlie.html)
- [ICE CUBE](https://theskillquest.pages.dev/ice-cube.html)
- [SPACE CRAFT SHIP WAR](https://learnquester.pages.dev/space-craft-ship-war.html)
- [TEARDOWN DESTRUCTION SANDBOX](https://theskillquest.pages.dev/teardown-destruction-sandbox.html)
- [GUN SHOOTING RANGE](https://theskillquest.pages.dev/gun-shooting-range.html)
- [MEME WARS](https://studyplayings.pages.dev/meme-wars.html)
- [CATEGORY PREMIUM PERKS74](https://themindplay.github.io/category-premium-perks74.html)
- [ARCADE GP](https://thequizzone.pages.dev/arcade-gp.html)
- [ELIXIR DROP](https://theskillquest.pages.dev/elixir-drop.html)
- [VALLEY OF WOLVES AMBUSH](https://studyquests.pages.dev/valley-of-wolves-ambush.html)
- [HEXA SORT 3D](https://themindzone.pages.dev/hexa-sort-3d.html)
- [DONT TAP](https://studyquests.pages.dev/dont-tap.html)
- [MISSION SANTA DELIVER THE GIFTS](https://studyplaying.github.io/mission-santa-deliver-the-gifts.html)
- [WINTER WOLF](https://thequizzone.pages.dev/winter-wolf.html)
- [CATEGORY OBSTACLE299](https://themindplay.github.io/category-obstacle299.html)
- [CATEGORY MAHJONG CONNECT](https://studyplaying.github.io/category-mahjong-connect.html)
- [GELATINO](https://themindplay.pages.dev/gelatino.html)
- [COIN MERGE](https://studyplaying.github.io/coin-merge.html)
- [FUNNY BALLS 2048](https://thequizzone.pages.dev/funny-balls-2048.html)
- [CATEGORY MAHJONG 3](https://themindplays.pages.dev/category-mahjong-3.html)
- [HYPER CARS RAMP CRASH](https://learnquester.pages.dev/hyper-cars-ramp-crash.html)
- [CATEGORY UNBLOCKED](https://learnquester.pages.dev/category-unblocked.html)
- [CATEGORY CASUAL 7](https://themindplay.pages.dev/category-casual-7.html)
- [100 HIDDEN CAPYBARAS](https://studyquests.pages.dev/100-hidden-capybaras.html)
- [MATCH TEN NUMBER PUZZLE](https://themindskillplayplay.pages.dev/match-ten-number-puzzle.html)
- [BOW AND ARROW](https://learnquester.github.io/bow-and-arrow.html)
- [ANIMAL BASKETBALL](https://thelearnquester.web.app/animal-basketball.html)
- [FOXY ECO SORT](https://studyquests.pages.dev/foxy-eco-sort.html)
- [SURVIVAL IN AREA 51](https://studyquests.pages.dev/survival-in-area-51.html)
- [MOW IT](https://studyquests.github.io/mow-it.html)
- [REDLINE IDLE FRONT](https://learnquester.pages.dev/redline-idle-front.html)
- [ALIEN INTELLIGENCE TEST](https://learnquester.pages.dev/alien-intelligence-test.html)
- [GRINDCRAFT](https://thequizzone.pages.dev/grindcraft.html)
- [MERGE HERO SURVIVAL TOWER DEFENSE](https://themindplay.github.io/merge-hero-survival-tower-defense.html)
- [SLIME RUSH](https://thelearnquester.web.app/slime-rush.html)
- [ZOMBIE RUSH](https://themindzone.pages.dev/zombie-rush.html)
- [CATEGORY CARDS](https://studyplayings.web.app/category-cards.html)
- [CATEGORY CAR376](https://learnquesters.pages.dev/category-car376.html)
- [FLAMES FORTUNE](https://iskillplay.web.app/flames-fortune.html)
- [SISYPHUS SIMULATOR](https://iskillplay.web.app/sisyphus-simulator.html)
- [CATEGORY CONTROLLER](https://learnquester.pages.dev/category-controller.html)
- [KINDER GARDEN](https://themindplaying.web.app/kinder-garden.html)
- [CHAMPIONS FC](https://studyquests.pages.dev/champions-fc.html)
- [CATEGORY MOUSE1 697](https://iskillplay.web.app/category-mouse1-697.html)
- [ICONIC HALLOWEEN COSTUMES](https://studyquests.pages.dev/iconic-halloween-costumes.html)
- [CATEGORY PIXEL313](https://thelearnquester.web.app/category-pixel313.html)
- [WEDNESDAY LIGHT ACADEMIA](https://thequizzone.pages.dev/wednesday-light-academia.html)
- [GELATINO](https://iskillquest.pages.dev/gelatino.html)
- [OFFROAD CLIMB 4X4](https://themindplaying.web.app/offroad-climb-4x4.html)
- [BITGOBLINS RPG SIMULATOR](https://themindzone.pages.dev/bitgoblins-rpg-simulator.html)
- [INDEX12](https://thelearnquester.web.app/index12.html)
- [ZOO RESTAURANT](https://themindplay.pages.dev/zoo-restaurant.html)
- [CATEGORY HUB](https://learnquester.pages.dev/category-hub.html)
- [CATEGORY ARENA255](https://learnquester.pages.dev/category-arena255.html)
- [CATEGORY SNIPER](https://themindplay.pages.dev/category-sniper.html)
- [DEVIL DUCK NOT A TROLL GAME](https://studyquests.github.io/devil-duck-not-a-troll-game.html)
- [2048 NUMBER MATCH](https://iskillplay.web.app/2048-number-match.html)
- [NEW YEAR MAKEUP TRENDS](https://themindplay.github.io/new-year-makeup-trends.html)
- [SAVE STRANDING FISH](https://studyquests.github.io/save-stranding-fish.html)
- [CATEGORY SIDE SCROLLING184](https://themindplay.github.io/category-side-scrolling184.html)
- [PIXEL SHOOT](https://studyplaying.github.io/pixel-shoot.html)
- [COFFEE COLOR BLOCKS](https://iskillquest.pages.dev/coffee-color-blocks.html)
- [REAL CARS EPIC STUNTS](https://theskillquest.pages.dev/real-cars-epic-stunts.html)
- [TAXI DRIVER SIMULATOR](https://studyquests.github.io/taxi-driver-simulator.html)
- [CATEGORY CAT](https://iskillplay.web.app/category-cat.html)
- [8 BALL POOL BILLIARDS MULTIPLAYER](https://studyplayings.web.app/8-ball-pool-billiards-multiplayer.html)
- [TURNFIGHT COM UAP](https://themindplay.github.io/turnfight-com-uap.html)
- [MOSCOW METRO DRIVER 3D](https://studyquests.github.io/moscow-metro-driver-3d.html)
- [MATCH 3 DREAM ROOM](https://studyplaying.github.io/match-3-dream-room.html)
- [FIGHT TRIVIA](https://studyquests.pages.dev/fight-trivia.html)
- [NOOB IN GEOMETRY DASH](https://learnquester.pages.dev/noob-in-geometry-dash.html)
- [POTION MERGE WITCH](https://studyplaying.github.io/potion-merge-witch.html)
- [RAGDOLL BEAT SIMULATOR](https://iskillplay.web.app/ragdoll-beat-simulator.html)
- [DEMOLITION CAR ROPE AND HOOK](https://thequizzone.pages.dev/demolition-car-rope-and-hook.html)
- [STICKMAN ADVENTURE](https://studyplaying.github.io/stickman-adventure.html)
- [COWBOYS DUEL](https://learnquesters.pages.dev/cowboys-duel.html)
- [MARBLE BLAST](https://themindplay.pages.dev/marble-blast.html)
- [CATEGORY BUSINESS135](https://iskillplay.web.app/category-business135.html)
- [SMART DOTS RELOADED](https://studyquests.github.io/smart-dots-reloaded.html)
- [PANDA KITCHEN IDLE TYCOON](https://thelearnquesters.pages.dev/panda-kitchen-idle-tycoon.html)
- [TRI PEAKS EMERLAND SOLITAIRE](https://studyquests.github.io/tri-peaks-emerland-solitaire.html)
- [TSUNAMI BRAINROTS ONLINE](https://themindplaying.web.app/tsunami-brainrots-online.html)
- [BARRY PRISON HIDE AND SEEK](https://thelearnquesters.pages.dev/barry-prison-hide-and-seek.html)
- [SQUAREHEAD HERO](https://themindplay.pages.dev/squarehead-hero.html)
- [CATEGORY CASUAL 9](https://iskillplay.web.app/category-casual-9.html)
- [CATEGORY BOOKMARKLET](https://studyplaying.github.io/category-bookmarklet.html)
- [MERGE HEROES TITANS](https://studyquests.github.io/merge-heroes-titans.html)
- [INDEX6](https://themindplaying.web.app/index6.html)
- [MERGE TOWER HERO](https://themindplay.pages.dev/merge-tower-hero.html)
- [CATEGORY FPS174](https://themindplaying.web.app/category-fps174.html)
- [SEEK FIND](https://studyquests.github.io/seek-find.html)
- [CATEGORY CASUAL 5](https://learnquesters.pages.dev/category-casual-5.html)
- [DIVINEX](https://thelearnquesters.pages.dev/divinex.html)
- [CATEGORY BUBBLE SHOOTER](https://iskillplay.web.app/category-bubble-shooter.html)
- [MAX CRUSHER 2 DESTRUCTION DRIFT AND RACING](https://studyplaying.github.io/max-crusher-2-destruction-drift-and-racing.html)
- [SKYSCRAPER TO THE SKY](https://themindplay.pages.dev/skyscraper-to-the-sky.html)
- [THE OFFICE ESCAPE](https://themindplay.github.io/the-office-escape.html)
- [MONSTER SCHOOL 2](https://themindplay.pages.dev/monster-school-2.html)
- [POPPY PLAYER PUZZLE](https://thelearnquester.web.app/poppy-player-puzzle.html)
- [IDLE FOOTBALL MANAGER](https://themindplay.pages.dev/idle-football-manager.html)
- [CATEGORY CASUAL 3](https://iskillplay.web.app/category-casual-3.html)
- [MAHJONG AT HOME SCANDINAVIAN EDITION](https://iskillplay.web.app/mahjong-at-home-scandinavian-edition.html)
- [KINGDOM CATS](https://studyquests.pages.dev/kingdom-cats.html)
- [CHICKEN WILD RUN](https://studyplaying.github.io/chicken-wild-run.html)
- [HIDDEN PAIRS MAHJONG](https://learnquesters.pages.dev/hidden-pairs-mahjong.html)
- [CATEGORY POOL 2](https://themindplay.github.io/category-pool-2.html)
- [MERGE BRICK BREAKER](https://thelearnquester.web.app/merge-brick-breaker.html)
- [COLOR CLASH](https://studyquests.pages.dev/color-clash.html)
- [CATEGORY QUIZ](https://studyplaying.github.io/category-quiz.html)
- [WINTER WONDERLAND MAHJONG](https://studyquests.github.io/winter-wonderland-mahjong.html)
- [CATEGORY MATCH 3](https://thelearnquester.web.app/category-match-3.html)
- [FNF UNBLOCKED ITALIAN BRAINROT](https://themindplaying.web.app/fnf-unblocked-italian-brainrot.html)
- [CATEGORY STRATEGY](https://studyplaying.github.io/category-strategy.html)
- [HEROIC KNIGHT](https://thelearnquester.web.app/heroic-knight.html)
- [YUMMY TALES 4](https://thelearnquester.web.app/yummy-tales-4.html)
- [TANGRAM PUZZLE](https://thequizzone.pages.dev/tangram-puzzle.html)
- [HALLOWEEN STICKMAN](https://studyplaying.github.io/halloween-stickman.html)
- [CATEGORY CASUAL 7](https://iskillplay.web.app/category-casual-7.html)
- [SLAP AND RUN](https://thequizzone.pages.dev/slap-and-run.html)
- [TEARDOWN DESTRUCTION SANDBOX](https://learnquester.pages.dev/teardown-destruction-sandbox.html)
- [DUSTY CAT](https://thelearnquesters.pages.dev/dusty-cat.html)
- [INDEX34](https://theskillquest.pages.dev/index34.html)
