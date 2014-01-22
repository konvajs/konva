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
    'src/Layer.js', 
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
    'src/plugins/Label.js'
  ];

  // Project configuration.
  var config = {
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dev: {
        src: sourceFiles,
        dest: 'dist/kinetic-dev.js'
      },
      beta: {
        src: sourceFiles,
        dest: 'dist/kinetic-v<%= pkg.version %>-beta.js'
      },
      prod: {
        src: sourceFiles,
        dest: 'dist/kinetic-v<%= pkg.version %>.js'
      }
    },
    replace: {
      dev: {
        options: {
          variables: {
            version: 'dev',
            date: '<%= grunt.template.today("yyyy-mm-dd") %>',
            nodeParams: '<%= grunt.file.read("doc-includes/NodeParams.txt") %>',
            containerParams: '<%= grunt.file.read("doc-includes/ContainerParams.txt") %>',
            shapeParams: '<%= grunt.file.read("doc-includes/ShapeParams.txt") %>'
          },
          prefix: '@@'
        },

        files: [{
          src: ['dist/kinetic-dev.js'], 
          dest: 'dist/kinetic-dev.js'
        }]
      },
      beta: {
        options: {
          variables: {
            version: '<%= pkg.version %>-beta',
            date: '<%= grunt.template.today("yyyy-mm-dd") %>',
            nodeParams: '<%= grunt.file.read("doc-includes/NodeParams.txt") %>',
            containerParams: '<%= grunt.file.read("doc-includes/ContainerParams.txt") %>',
            shapeParams: '<%= grunt.file.read("doc-includes/ShapeParams.txt") %>'
          },
          prefix: '@@'
        },

        files: [{
          src: ['dist/kinetic-v<%= pkg.version %>-beta.js'], 
          dest: 'dist/kinetic-v<%= pkg.version %>-beta.js'
        }]
      },
      prod1: {
        options: {
          variables: {
            version: '<%= pkg.version %>',
            date: '<%= grunt.template.today("yyyy-mm-dd") %>',
            nodeParams: '<%= grunt.file.read("doc-includes/NodeParams.txt") %>',
            containerParams: '<%= grunt.file.read("doc-includes/ContainerParams.txt") %>',
            shapeParams: '<%= grunt.file.read("doc-includes/ShapeParams.txt") %>'
          },
          prefix: '@@'
        },

        files: [{
          src: ['dist/kinetic-v<%= pkg.version %>.js'], 
          dest: 'dist/kinetic-v<%= pkg.version %>.js'
        }]
      },
      prod2: {
        options: {
          variables: {
            version: '<%= pkg.version %>',
          },
          prefix: '@@'
        },
        files: [{
          src: ['dist/kinetic-Global-v<%= pkg.version %>.min.js'], 
          dest: 'dist/kinetic-Global-v<%= pkg.version %>.min.js'
        }]
      },
      prod3: {
        options: {
          variables: {
            version: '<%= pkg.version %>',
          },
          prefix: '@@'
        },
        files: [{
          src: ['dist/kinetic-v<%= pkg.version %>.min.js'], 
          dest: 'dist/kinetic-v<%= pkg.version %>.min.js'
        }]
      },
      prod4: {
        options: {
          variables: {
            version: '<%= pkg.version %>',
          },
          prefix: '@@'
        },
        files: [{
          src: ['bower-template.json'], 
          dest: 'bower.json'
        }]
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> http://www.kineticjs.com by Eric Rowell @ericdrowell - MIT License https://github.com/ericdrowell/KineticJS/wiki/License*/\n'
      },
      build: {
        files: {
          'dist/kinetic-v<%= pkg.version %>.min.js': 'dist/kinetic-v<%= pkg.version %>.js'
        }
      }
    },
    clean: {
      build: ['dist/*']
    },
    jshint: {
      options: {
        laxbreak: true
      },
      all: ['src/**/*.js']
    },
    copy: {
      prod1: {
        nonull: true,
        src: 'dist/kinetic-v<%= pkg.version %>.min.js',
        dest: 'kinetic.min.js',
      },
      prod2: {
        nonull: true,
        src: 'dist/kinetic-v<%= pkg.version %>.js',
        dest: 'kinetic.js',
      }
    }
  };

  
  for (var n=0; n<sourceFiles.length; n++) {
    var inputFile = sourceFiles[n];
    var className = (inputFile.match(/[-_\w]+[.][\w]+$/i)[0]).replace('.js', '');
    var outputFile = 'dist/kinetic-' + className + '-v<%= pkg.version %>.min.js';

    config.uglify.build.files[outputFile] = [inputFile];
  }
  
  grunt.initConfig(config);

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Tasks
  grunt.registerTask('dev', ['clean', 'concat:dev', 'replace:dev']);
  grunt.registerTask('beta', ['clean', 'concat:beta', 'replace:beta']);
  grunt.registerTask('full', [
    'clean', 
    'concat:prod', 
    'uglify', 
    'replace:prod1', 
    'replace:prod2', 
    'replace:prod3', 
    'replace:prod4',
    'copy:prod1', 
    'copy:prod2'
  ]);
  grunt.registerTask('hint', ['clean', 'concat:dev', 'replace:dev', 'jshint']);
};
