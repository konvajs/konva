var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var replace = require('gulp-replace');
var jsdoc = require('gulp-jsdoc3');
var connect = require('gulp-connect');
var jscpd = require('gulp-jscpd');
var eslint = require('gulp-eslint');
var gutil = require('gulp-util');

var fs = require('fs');
var NodeParams = fs
  .readFileSync('./resources/doc-includes/NodeParams.txt')
  .toString();
var ContainerParams = fs
  .readFileSync('./resources/doc-includes/ContainerParams.txt')
  .toString();
var ShapeParams = fs
  .readFileSync('./resources/doc-includes/ShapeParams.txt')
  .toString();

var conf = require('./package.json');

function build() {
  return gulp
    .src(['./konva.js'])
    .pipe(replace('@@shapeParams', ShapeParams))
    .pipe(replace('@@nodeParams', NodeParams))
    .pipe(replace('@@containerParams', ContainerParams))
    .pipe(replace('@@version', conf.version))
    .pipe(replace('@@date', new Date().toDateString()));
}

gulp.task('update-version-lib', function () {
  return gulp
    .src(['./lib/Global.js'])
    .pipe(replace('@@version', conf.version))
    .pipe(rename('Global.js'))
    .pipe(gulp.dest('./lib'));
});

// create usual build konva.js and konva.min.js
gulp.task('pre-build', function () {
  return build()
    .pipe(rename('konva.js'))
    .pipe(gulp.dest('./'))
    .pipe(uglify({ output: { comments: /^!|@preserve|@license|@cc_on/i } }))
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('konva.min.js'))
    .pipe(gulp.dest('./'));
});

gulp.task('build', gulp.parallel(['update-version-lib', 'pre-build']));

// local server for better development
gulp.task('server', function () {
  connect.server();
});

// lint files
gulp.task('lint', function () {
  return (
    gulp
      .src('./src/**/*.js')
      .pipe(
        eslint({
          configFile: './.eslintrc',
        })
      )
      // eslint.format() outputs the lint results to the console.
      // Alternatively use eslint.formatEach() (see Docs).
      .pipe(eslint.format())
      // To have the process exit with an error code (1) on
      // lint error, return the stream and pipe to failOnError last.
      .pipe(eslint.failOnError())
  );
});

// check code for duplication
gulp.task('inspect', function () {
  return gulp.src('./src/**/*.js').pipe(
    jscpd({
      'min-lines': 10,
      verbose: true,
    })
  );
});

// // generate documentation
gulp.task('api', function () {
  return gulp.src('./konva.js').pipe(
    jsdoc({
      opts: {
        destination: './api',
      },
    })
  );
});

gulp.task('default', gulp.parallel(['server']));
