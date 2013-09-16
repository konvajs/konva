#Building the KineticJS Framework 
To build the framework, you need to have node installed. After that, run `npm install` in the main directory to install the node module dependencies.

To build a development version of the framework, run `grunt dev`. To run a full build, which also produces the minified version and the individually minified modules for the custom build, run `grunt full`.  You can also run `grunt beta` to generate a beta version.   

If you add a file in the src directory, be sure to add the filename to the sourceFiles array variable in Gruntfile.js.

#Testing

[![Build Status](https://travis-ci.org/ericdrowell/KineticJS.png)](https://travis-ci.org/ericdrowell/KineticJS)

KineticJS uses Mocha for testing.  If you haven't already, be sure to install the npm packages by running `npm install` in the project directory.  The KineticJS tests must be run on a web server, so you also need to run `node server.js` in the project directory to start the node server.  Once the server is running, open http://localhost:8080/test/runner.html to run the tests in your favorite browser.  To run the tests in PhantomJS, run `mocha-phantomjs test/runner.html` in the console.

KineticJS is covered with hundreds of tests and well over a thousand assertions.  KineticJS uses TDD (test driven development) which means that every new feature or bug fix is accompanied with at least one new test. 

#Pull Requests
I'd be happy to review any pull requests that may better the KineticJS project, in particular if you have a bug fix, enhancement, or a new shape (see `src/shapes` for examples).  Before doing so, please first make sure that all of the tests pass.
