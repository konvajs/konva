#Hiatus

Hi all! I will be taking a 3 month break from KineticJS (until July 2014) to focus on other endeavors.  KineticJS is in a great state right now (v5.1.0).  Please continue to file any issues that you may find, or submit pull requests.  They will eventually be addressed.

#Installation

* `bower install kineticjs`
* `npm install kinetic` - for Browserify. For nodejs you have to install some [dependencies](#NodeJS)

###NodeJS

Support of NodeJS is experimental.

We are using [node-canvas](https://github.com/LearnBoost/node-canvas) to create canvas element.

1. Install node-canvas [https://github.com/LearnBoost/node-canvas/wiki/_pages](https://github.com/LearnBoost/node-canvas/wiki/_pages)
2. `npm install jsdom`
3. `npm install kinetic`

See file `nodejs-demo.js` for example.

#Dev environment

Before doing all dev stuff make sure you have node installed. After that, run `npm install --dev` in the main directory to install the node module dependencies.

Run `grunt --help` to see all build options.

##Building the KineticJS Framework 

To build a development version of the framework, run `grunt dev`. To run a full build, which also produces the minified version and the individually minified modules for the custom build, run `grunt full`.  You can also run `grunt beta` to generate a beta version.   

If you add a file in the src directory, be sure to add the filename to the sourceFiles array variable in Gruntfile.js.

##Testing

[![Build Status](https://travis-ci.org/ericdrowell/KineticJS.png)](https://travis-ci.org/ericdrowell/KineticJS)

KineticJS uses Mocha for testing. 

* If you need run test only one time run `grunt test`.
* While developing it is easy to use `grunt server` with watch task. Just run it and go to [http://localhost:8080/test/runner.html](http://localhost:8080/test/runner.html). After src file change kinetic-dev.js will be automatically created, so you just need refresh test the page.

KineticJS is covered with hundreds of tests and well over a thousand assertions.  KineticJS uses TDD (test driven development) which means that every new feature or bug fix is accompanied with at least one new test. 

##Generation documentation

Run `grunt docs` which will build the documentation files and place them in the docs folder.


#Pull Requests
I'd be happy to review any pull requests that may better the KineticJS project, in particular if you have a bug fix, enhancement, or a new shape (see `src/shapes` for examples).  Before doing so, please first make sure that all of the tests pass (`grunt test`). 
