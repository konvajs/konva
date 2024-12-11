import gulp from 'gulp';
import rename from 'gulp-rename';
import uglify from 'gulp-uglify-es';
import replace from 'gulp-replace';
import jsdoc from 'gulp-jsdoc3';
import connect from 'gulp-connect';
import gutil from 'gulp-util';

import fs from 'fs';
var NodeParams = fs
  .readFileSync('./resources/doc-includes/NodeParams.txt')
  .toString();
var ContainerParams = fs
  .readFileSync('./resources/doc-includes/ContainerParams.txt')
  .toString();
var ShapeParams = fs
  .readFileSync('./resources/doc-includes/ShapeParams.txt')
  .toString();

const conf = JSON.parse(fs.readFileSync('./package.json'));

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

gulp.task('update-version-cmj', function () {
  return gulp
    .src(['./cmj/Global.js'])
    .pipe(replace('@@version', conf.version))
    .pipe(rename('Global.js'))
    .pipe(gulp.dest('./cmj'));
});

gulp.task('update-version-es-to-cmj-index', function () {
  return gulp
    .src(['./lib/index.js'])
    .pipe(
      replace(`import { Konva } from './_F`, `import { Konva } from '../cmj/_F`)
    )
    .pipe(rename('index.js'))
    .pipe(gulp.dest('./lib'));
});

gulp.task('update-version-es-to-cmj-node', function () {
  return gulp
    .src(['./lib/index-node.js'])
    .pipe(
      replace(`import { Konva } from './_F`, `import { Konva } from '../cmj/_F`)
    )
    .pipe(rename('index-node.js'))
    .pipe(gulp.dest('./lib'));
});

// create usual build konva.js and konva.min.js
gulp.task('pre-build', function () {
  return build()
    .pipe(rename('konva.js'))
    .pipe(gulp.dest('./'))
    .pipe(
      uglify.default({ output: { comments: /^!|@preserve|@license|@cc_on/i } })
    )
    .on('error', function (err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename('konva.min.js'))
    .pipe(gulp.dest('./'));
});

gulp.task(
  'build',
  gulp.parallel([
    'update-version-lib',
    // 'update-version-cmj',
    // 'update-version-es-to-cmj-index',
    // 'update-version-es-to-cmj-node',
    'pre-build',
  ])
);

// local server for better development
gulp.task('server', function () {
  connect.server();
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
