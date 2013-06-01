#Building the KineticJS Framework 
To build the framework, you need to have node and grunt installed. After that, run `npm install` to install the node module dependencies.

To build a development version of the framework, run `grunt dev`. To run a full build, which also produces the minified version and the individually minified modules for the custom build, run `grunt full`.   

If you add a file in the src directory, be sure to add the filename to the sourceFiles array variable in Gruntfile.js.

#Testing

### Getting the tests up and running
Currently, KineticJS has unit, functional, performance, manual, and special test suites.  To build the unit tests, you'll need to build the `unitTests.js` file by running `grunt test` and then opening `unitTests.html`.  Open `tests/html/index.html` to navigate to different test suites.  

### Running the tests
Unit, functional, and performance tests output the results to the console via `console.log()` so be sure to have it open.  

In order for the data url tests and image manipulation tests to pass, you need to run the unit test suite on a web server due to canvas security constraints ([read more about that here](http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#security-with-canvas-elements)).  All tests should pass in Google Chrome on Windows 7 with no warnings, and all tests should pass with some warnings in other browsers and operating systems.  

### Updating the tests

To add / modify unit tests, be sure to do so in the `tests/js/unit` directory, because these are the source test files that are concatenated together when building `unitTests.js`.  Use `test()` for hard tests which will throw an error if something fails, and use `warn()` for soft tests that will allow the tests to continue if the test condition fails.  The `warn()` method is great for tests that will have different results in different browsers, such as canvas data url comparisons, text metric dimensions, etc.  

TIP: prepend a test name with a `*` to only run that particular test, or prepend a test name with `!` to omit that test.

#Pull Requests
I'd be happy to review any pull requests that may better the KineticJS project, in particular if you have a bug fix, enhancement, or a new shape (see `src/shapes` for examples).  Before doing so, please first make sure that all of the unit tests and functional tests pass, and also make sure that you don't have any jshint errors.  You can do so by running `grunt hint`
