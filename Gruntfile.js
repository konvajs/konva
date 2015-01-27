module.exports = function(grunt) {
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
    'src/Animation.js',
    'src/Tween.js',
    'src/DragAndDrop.js',
    'src/Container.js',
    'src/Shape.js',
    'src/Stage.js',
    'src/BaseLayer.js',
    'src/Layer.js',
    'src/FastLayer.js',
    'src/Group.js',

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

    // plugins
    'src/plugins/Path.js',
    'src/plugins/TextPath.js',
    'src/plugins/RegularPolygon.js',
    'src/plugins/Star.js',
    'src/plugins/Label.js',
    'src/plugins/Arrow.js'
  ];

  // Project configuration.
  var hintConf = grunt.file.readJSON('.jshintrc');
  var config = {
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dev: {
        src: sourceFiles,
        dest: 'dist/konva-dev.js'
      },
      beta: {
        src: sourceFiles,
        dest: 'dist/konva-v<%= pkg.version %>-beta.js'
      },
      prod: {
        src: sourceFiles,
        dest: 'dist/konva-v<%= pkg.version %>.js'
      }
    },
    replace: {
      dev: {
        options: {
          variables: {
            version: 'dev',
            date: '<%= grunt.template.today("yyyy-mm-dd") %>',
            nodeParams: '<%= grunt.file.read("resources/doc-includes/NodeParams.txt") %>',
            containerParams: '<%= grunt.file.read("resources/doc-includes/ContainerParams.txt") %>',
            shapeParams: '<%= grunt.file.read("resources/doc-includes/ShapeParams.txt") %>'
          },
          prefix: '@@'
        },

        files: [{
          src: ['dist/konva-dev.js'],
          dest: 'dist/konva-dev.js'
        }]
      },
      beta: {
        options: {
          variables: {
            version: '<%= pkg.version %>-beta',
            date: '<%= grunt.template.today("yyyy-mm-dd") %>',
            nodeParams: '<%= grunt.file.read("resources/doc-includes/NodeParams.txt") %>',
            containerParams: '<%= grunt.file.read("resources/doc-includes/ContainerParams.txt") %>',
            shapeParams: '<%= grunt.file.read("resources/doc-includes/ShapeParams.txt") %>'
          },
          prefix: '@@'
        },

        files: [{
          src: ['dist/konva-v<%= pkg.version %>-beta.js'],
          dest: 'dist/konva-v<%= pkg.version %>-beta.js'
        }]
      },
      prod1: {
        options: {
          variables: {
            version: '<%= pkg.version %>',
            date: '<%= grunt.template.today("yyyy-mm-dd") %>',
            nodeParams: '<%= grunt.file.read("resources/doc-includes/NodeParams.txt") %>',
            containerParams: '<%= grunt.file.read("resources/doc-includes/ContainerParams.txt") %>',
            shapeParams: '<%= grunt.file.read("resources/doc-includes/ShapeParams.txt") %>'
          },
          prefix: '@@'
        },

        files: [{
          src: ['dist/konva-v<%= pkg.version %>.js'],
          dest: 'dist/konva-v<%= pkg.version %>.js'
        }]
      },
      prod2: {
        options: {
          variables: {
            version: '<%= pkg.version %>'
          },
          prefix: '@@'
        },
        files: [{
          src: ['dist/konva-Global-v<%= pkg.version %>.min.js'],
          dest: 'dist/konva-Global-v<%= pkg.version %>.min.js'
        }]
      },
      prod3: {
        options: {
          variables: {
            version: '<%= pkg.version %>'
          },
          prefix: '@@'
        },
        files: [{
          src: ['dist/konva-v<%= pkg.version %>.min.js'],
          dest: 'dist/konva-v<%= pkg.version %>.min.js'
        }]
      },
      updateBower: {
        options: {
          variables: {
            version: '<%= pkg.version %>'
          },
          prefix: '@@'
        },
        files: [{
          src: ['resources/bower-template.json'],
          dest: 'bower.json'
        }]
      }
    },
    uglify: {
      options: {
        banner: '/*! KonvaJS v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> http://lavrton.github.io/KonvaJS/ by Eric Rowell @ericdrowell, Anton Lavrenov @lavrton - MIT License https://github.com/lavrton/KonvaJS/wiki/License*/\n'
      },
      build: {
        files: {
          'dist/konva-v<%= pkg.version %>.min.js': 'dist/konva-v<%= pkg.version %>.js'
        }
      }
    },
    clean: {
      build: ['dist/*']
    },
    jshint: {
      options: hintConf,
      all: ['src/**/*.js']
    },
    copy: {
      prod1: {
        nonull: true,
        src: 'dist/konva-v<%= pkg.version %>.min.js',
        dest: 'konva.min.js'
      },
      prod2: {
        nonull: true,
        src: 'dist/konva-v<%= pkg.version %>.js',
        dest: 'konva.js'
      }
    },
    shell: {
        jsdoc: {
            options: {
                stdout: true,
                stderr : true,
                failOnError : true
            },
            command: './node_modules/.bin/jsdoc ./dist/konva-v<%= pkg.version %>.js -d ./docs'
        }
    },
    mocha_phantomjs: {
      all: ['test/runner.html']
    },
    watch: {
      dev: {
        files: ['src/**/*.js'],
        tasks: ['dev'],
        options: {
          spawn: false
        }
      }
    },
    jsdoc : {
      dist : {
        src: ['README.md', './dist/konva-v<%= pkg.version %>.js'],
        options: {
          destination: 'api',
          template : './node_modules/grunt-jsdoc/node_modules/ink-docstrap/template',
          configure : './resources/jsdoc.conf.json'
        }
      }
    }
  };

  
  for (var n=0; n<sourceFiles.length; n++) {
    var inputFile = sourceFiles[n];
    var className = (inputFile.match(/[-_\w]+[.][\w]+$/i)[0]).replace('.js', '');
    var outputFile = 'dist/konva-' + className + '-v<%= pkg.version %>.min.js';

    config.uglify.build.files[outputFile] = [inputFile];
  }
  
  grunt.initConfig(config);


  // Tasks
  grunt.registerTask('dev', 'Create dev version', ['clean', 'concat:dev', 'replace:dev']);
  grunt.registerTask('beta', 'Create beta version', ['clean', 'concat:beta', 'replace:beta']);
  grunt.registerTask('full', 'Build full version and create min files', [
    'clean',
    'concat:prod',
    'uglify',
    'replace:prod1',
    'replace:prod2',
    'replace:prod3',
    'replace:updateBower',
    'copy:prod1',
    'copy:prod2'
  ]);

  grunt.registerTask('docs', 'Generate docs', [
    'full',
    'shell:jsdoc'
  ]);

  grunt.registerTask('api', 'Generate docs for homepage', [
    'full',
    'jsdoc'
  ]);

  grunt.registerTask('hint', 'Check hint errors', ['jshint']);
  grunt.registerTask('test', 'Run tests', ['dev', 'mocha_phantomjs']);

  grunt.registerTask('node-test', 'Run tests in pure NodeJS environment', function(){
    grunt.task.run('dev');
    grunt.task.run('_run-node-test');
  });


  grunt.registerTask('server', 'run local server and create dev version', function() {
    grunt.task.run('dev');

    var finalhandler = require('finalhandler');
    var http = require('http');
    var serveStatic = require('serve-static');

    var serve = serveStatic(__dirname, {'index': ['index.html', 'index.htm']});

    // Create server
        var server = http.createServer(function(req, res){
          var done = finalhandler(req, res);
          serve(req, res, done);
        });

    // Listen
    server.listen(8080);

    grunt.task.run('watch:dev');
    grunt.log.writeln('Tests server starts on http://localhost:8080/test/runner.html');
  });

  // run pure node tests
  grunt.registerTask('_run-node-test', function(){
    require('./test/node-runner');
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-mocha-phantomjs');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jsdoc');
};
