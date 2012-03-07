# What's KineticJS

[http://www.kineticjs.com](KineticJS)

Greetings fellow webonauts! KineticJS is an HTML5 Canvas JavaScript library that extends the 2d context by enabling canvas interactivity for desktop and mobile applications.

You can draw your own shapes or images using the existing canvas API, add event listeners to them, move them, scale them, and rotate them independently from other shapes to support high performance animations, even if your application uses thousands of shapes.  Served hot with a side of awesomeness.

# Tutorials
Check out the official [KineticJS Tutorials](http://www.html5canvastutorials.com/kineticjs/html5-canvas-events-tutorials-introduction-with-kineticjs/) hosted on [HTML5 Canvas Tutorials](http://www.html5canvastutorials.com/).

# Building the library
To build the library, you need to have Ruby and Rubygems installed. After that, install the dependencies by running `bundle install`.

To build a development version of the library, run `thor build:dev`. To build a minify version of the library, run `thor build:prod`.

# Adding a new file in the src directory
If you add a file in the src directory, add into the array in the Thorfile.
