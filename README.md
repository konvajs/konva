#Building the KineticJS library
To build the library, you need to have Ruby and Rubygems installed. After that, run `gem install thor`, `gem install json_pure`, and `gem install uglifier` to install the dependencies.

To build a development version of the library, run `thor build:dev VERSION`, where VERSION is a string that can be anything you like. For example, using `thor build:dev current` will produce `kinetic-current.js`. To build a minified version of the library, run `thor build:prod VERSION`.   

If you add a file in the src directory, be sure to add the filename to the filename array in the Thorfile.

#Testing
To run unit tests, you'll need to build the `unitTests.js` file by running `thor build:test` and then opening `unitTests.html` in the `tests/html` directory.  The other tests can be ran directly by opening `functionalTests.html`, `manualTests.html`, or `performanceTests.html` in the `tests/html` directory.  Unit, functional, and performance tests output the results to the console via `console.log()` so be sure to have it open.  

To add / modify unit tests, be sure to do so in the `tests/js/unit` directory, because these are the source test files that are concatenated together when building `unitTests.js`.  Use `test()` for hard tests which will throw an error if something fails, and use `warn()` for soft tests that will allow the tests to continue if the test condition fails.  The `warn()` method is great for tests that will have different results in different browsers, such as canvas data url comparisons, text metric dimensions, etc.  All tests should pass in Google Chrome with no warnings, and all tests should pass with some warnings in other browsers.

TIP: prepend a test name with a `*` to only run that particular test, or prepend a test name with `!` to omit that test.

#Pull Requests
I'd be happy to review any pull requests that may better the KineticJS project, in particular if you have a bug fix, enhancement, or a new shape (see `src/shapes` for examples).  Before doing so, please first make sure that all of the unit tests and functional tests pass.
