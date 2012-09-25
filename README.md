#Building the KineticJS library
To build the library, you need to have Ruby and Rubygems installed. After that, run `gem install thor`, `gem install json_pure`, and `gem install uglifier` to install the dependencies.

To build a development version of the library, run `thor build:dev VERSION`, where VERSION is a string that can be anything you like. For example, using `thor build:dev core` will produce `kinetic-core.js`. To build a minified version of the library, run `thor build:prod VERSION`. If you want to add a release date other than the current day, use `-d="DATE"` (e.g. `-d="Mar 07 2012"`).  

If you add a file in the src directory, be sure to add the filename to the filename array in the Thorfile.

#Tests
To run tests, open `unitTests.html`, `functionalTests.html`, `manualTests.html`, or `performanceTests.html` in the `tests/html` directory.  Unit, functional, and performance tests output the results to the console via `console.log()` so be sure to have it open.  Use test() for hard tests which will throw an error if something fails, and use warn() for soft tests that will allow the tests to continue.  The warn() method is great for tests that will have different results in different browsers, such as canvas data url comparisons, text metric dimensions, etc.  All tests should pass in Google Chrome with no warnings, and all tests should pass with some warnings in other browsers.

#Pull Requests
I'd be happy to review any pull requests that may better the KineticJS project, in particular if you have a bug fix, enhancement, or a new shape (see `src/shapes` for examples).  Before doing so, please first make sure that all of the unit tests and functional tests pass.
