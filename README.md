![div](https://raw.githubusercontent.com/lavrton/KineticJS/master/resources/logo.png)

#KineticJS

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/lavrton/KineticJS?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![npm version](https://badge.fury.io/js/kinetic.svg)](http://badge.fury.io/js/kinetic) [![bower version](https://badge.fury.io/bo/kinetic.svg)](http://badge.fury.io/bo/kinetic)
[![Build Status](https://travis-ci.org/lavrton/KineticJS.png)](https://travis-ci.org/lavrton/KineticJS)  [![Code Climate](https://codeclimate.com/github/lavrton/KineticJS/badges/gpa.svg)](https://codeclimate.com/github/lavrton/KineticJS)

Greetings fellow webonauts! KineticJS is an HTML5 Canvas JavaScript framework that enables high performance animations, transitions, node nesting, layering, filtering, caching, event handling for desktop and mobile applications, and much more.

You can draw things onto the stage, add event listeners to them, move them, scale them, and rotate them independently from other shapes to support high performance animations, even if your application uses thousands of shapes. Served hot with a side of awesomeness.

* **Visit:** The [GitHub page](http://lavrton.github.io/KineticJS/) and follow on [Twitter](https://twitter.com/lavrton)
* **Discover:** [Tutorials](http://lavrton.github.io/KineticJS/Getting_Started.html), [API Documentation](http://lavrton.github.io/KineticJS/api/Kinetic.html)
* **Help:** [StackOverflow](http://stackoverflow.com/questions/tagged/kineticjs)

#Installation

* `bower install kinetic`
* `npm install kinetic` - for Browserify. For nodejs you have to install some [dependencies](#nodejs)
* CDN: [https://cdnjs.com/libraries/kineticjs](https://cdnjs.com/libraries/kineticjs)

###NodeJS

We are using [node-canvas](https://github.com/LearnBoost/node-canvas) to create canvas element.

1. Install node-canvas [https://github.com/LearnBoost/node-canvas/wiki/_pages](https://github.com/LearnBoost/node-canvas/wiki/_pages)
2. `npm install jsdom`
3. `npm install kinetic`

See file `resources/nodejs-demo.js` for example.

#Change log

See [CHANGELOG.md](https://github.com/lavrton/KineticJS/blob/master/CHANGELOG.md).

#Dev environment

Before doing all dev stuff make sure you have node installed. After that, run `npm install --dev` in the main directory to install the node module dependencies.

Run `grunt --help` to see all build options.

##Building the KineticJS Framework 

To build a development version of the framework, run `grunt dev`. To run a full build, which also produces the minified version and the individually minified modules for the custom build, run `grunt full`.  You can also run `grunt beta` to generate a beta version.   

If you add a file in the src directory, be sure to add the filename to the sourceFiles array variable in Gruntfile.js.

##Testing

KineticJS uses Mocha for testing. 

* If you need run test only one time run `grunt test`.
* While developing it is easy to use `grunt server` with watch task. Just run it and go to [http://localhost:8080/test/runner.html](http://localhost:8080/test/runner.html). After src file change kinetic-dev.js will be automatically created, so you just need refresh test the page.

KineticJS is covered with hundreds of tests and well over a thousand assertions.  KineticJS uses TDD (test driven development) which means that every new feature or bug fix is accompanied with at least one new test. 

##Generate documentation

Run `grunt docs` which will build the documentation files and place them in the docs folder.


#Pull Requests
I'd be happy to review any pull requests that may better the KineticJS project, in particular if you have a bug fix, enhancement, or a new shape (see `src/shapes` for examples).  Before doing so, please first make sure that all of the tests pass (`grunt test`). 
