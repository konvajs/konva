'use strict';

var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var replace = require('gulp-replace');
var mochaPhantomJS = require('gulp-mocha-phantomjs');
var jsdoc = require('gulp-jsdoc');
var connect = require('gulp-connect');
var jscpd = require('gulp-jscpd');
var eslint = require('gulp-eslint');

var fs = require('fs');
var NodeParams = fs.readFileSync('./resources/doc-includes/NodeParams.txt').toString();
var ContainerParams = fs.readFileSync('./resources/doc-includes/ContainerParams.txt').toString();
var ShapeParams = fs.readFileSync('./resources/doc-includes/ShapeParams.txt').toString();

var conf = require('./package.json');

var sourceFiles = [
    // core
    'src/Global.js',
    'src/Util.js',
    'src/Canvas.js',
    'src/Context.js',
    'src/Factory.js',
    'src/Node.js',

    // filters
    'src/filters/Grayscale.js',
    'src/filters/Brighten.js',
    'src/filters/Invert.js',
    'src/filters/Blur.js',
    'src/filters/Mask.js',
    'src/filters/RGB.js',
    'src/filters/RGBA.js',
    'src/filters/HSV.js',
    'src/filters/HSL.js',
    'src/filters/Emboss.js',
    'src/filters/Enhance.js',
    'src/filters/Posterize.js',
    'src/filters/Noise.js',
    'src/filters/Pixelate.js',
    'src/filters/Threshold.js',
    'src/filters/Sepia.js',
    'src/filters/Solarize.js',
    'src/filters/Kaleidoscope.js',

    // core
    'src/Container.js',
    'src/Shape.js',
    'src/Stage.js',
    'src/BaseLayer.js',
    'src/Layer.js',
    'src/FastLayer.js',
    'src/Group.js',
    'src/Animation.js',
    'src/Tween.js',
    'src/DragAndDrop.js',

    // shapes
    'src/shapes/Rect.js',
    'src/shapes/Circle.js',
    'src/shapes/Ellipse.js',
    'src/shapes/Ring.js',
    'src/shapes/Wedge.js',
    'src/shapes/Arc.js',
    'src/shapes/Image.js',
    'src/shapes/Text.js',
    'src/shapes/Line.js',
    'src/shapes/Sprite.js',
    'src/shapes/Path.js',
    'src/shapes/TextPath.js',
    'src/shapes/RegularPolygon.js',
    'src/shapes/Star.js',
    'src/shapes/Label.js',
    'src/shapes/Arrow.js'
];

function build() {
    return gulp.src(sourceFiles)
        .pipe(concat('konva-dev.js'))
        .pipe(replace('@@shapeParams', ShapeParams))
        .pipe(replace('@@nodeParams', NodeParams))
        .pipe(replace('@@containerParams', ContainerParams))
        .pipe(replace('@@version', conf.version))
        .pipe(replace('@@date', new Date().toDateString()));
}


// create development build
gulp.task('dev-build', function() {
        return build()
        .pipe(gulp.dest('./dist/'));
});


// create usual build konva.js and konva.min.js
gulp.task('build', function() {
    return build()
        .pipe(rename('konva.js'))
        .pipe(gulp.dest('./'))
        .pipe(uglify({
            preserveComments: 'some'
        }))
        .pipe(rename('konva.min.js'))
        .pipe(gulp.dest('./'));
});

// tun tests
gulp.task('test', ['dev-build'], function () {
    return gulp
        .src('test/runner.html')
        .pipe(mochaPhantomJS());
});

// local server for better development
gulp.task('server', function() {
    connect.server();
});

// lint files
gulp.task('lint', function() {
    return gulp.src('./src/**/*.js')
        .pipe(eslint({
            configFile: './.eslintrc'
        }))
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failOnError last.
        .pipe(eslint.failOnError());
});

// check code for duplication
gulp.task('inspect', function() {
  return gulp.src('./src/**/*.js')
    .pipe(jscpd({
      'min-lines': 10,
      verbose: true
    }));
});


// generate documentation
gulp.task('api', function() {
    return gulp.src('./src/**/*.js')
        .pipe(jsdoc('./api'));
});

gulp.task('watch', function() {
    gulp.watch(['src/**/*.js'], ['dev-build']);
});


gulp.task('default', ['dev-build', 'watch', 'server']);
