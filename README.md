#KineticJS

[http://www.kineticjs.com](KineticJS)

Greetings fellow webonauts! KineticJS is an HTML5 Canvas JavaScript library that extends the 2d context by enabling canvas interactivity for desktop and mobile applications.

You can draw your own shapes or images using the existing canvas API, add event listeners to them, move them, scale them, and rotate them independently from other shapes to support high performance animations, even if your application uses thousands of shapes.  Served hot with a side of awesomeness.

#Building the library
To build the library, you need to have Ruby and Rubygems installed. After that, install the dependencies by running `bundle install`.

To build a development version of the library, run `thor build:dev VERSION`, where VERSION is a string that can be anything you like. For example, using `thor build:dev core` will produce `kinetic-core.js`. To build a minified version of the library, run `thor build:prod VERSION`. If you want to add a release date other than the current day, use `-d="DATE"` (e.g. `-d="Mar 07 2012`).  

If you add a file in the src directory, be sure to add the filename to the filename array in the Thorfile.

#Tests
To run unit tests, open the `unitTests.html` file in the `tests` directory.  To run functional tests, open the `functionalTests.html` file.  The tests output the results to the console via `console.log()` so be sure to have it open.

#Pull Requests
I'd be happy to review any pull requests that may better the KineticJS project, in particular if you have a bug fix or a new shape (see `src/shapes` for examples).  Before doing so, please first make sure that all of the unit tests and functional tests pass.
