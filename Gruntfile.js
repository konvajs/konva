module.exports = function(grunt) {
  var sourceFiles = [
    // core / anim + tween + dd
    'src/Global.js', 
    'src/Util.js', 
    'src/Canvas.js',
    'src/Context.js',
    'src/Factory.js',
    'src/Node.js', 
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
    'src/shapes/Wedge.js', 
    'src/shapes/Image.js', 
    'src/shapes/Polygon.js', 
    'src/shapes/Text.js', 
    'src/shapes/Line.js', 
    'src/shapes/Spline.js', 
    'src/shapes/Blob.js', 
    'src/shapes/Sprite.js',

    // plugins
    'src/plugins/Path.js', 
    'src/plugins/TextPath.js', 
    'src/plugins/RegularPolygon.js', 
    'src/plugins/Star.js', 
    'src/plugins/Label.js',

    // filters
    'src/filters/Grayscale.js', 
    'src/filters/Brighten.js', 
    'src/filters/Invert.js', 
    'src/filters/Blur.js', 
    'src/filters/Mask.js',
    'src/filters/ColorPack.js',
    'src/filters/ConvolvePack.js'
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

  // Tasks
  grunt.registerTask('dev', ['clean', 'concat:dev', 'replace:dev']);
  grunt.registerTask('beta', ['clean', 'concat:beta', 'replace:beta']);
  grunt.registerTask('full', ['clean', 'concat:prod', 'uglify', 'replace:prod1', 'replace:prod2', 'replace:prod3']);
  grunt.registerTask('hint', ['clean', 'concat:dev', 'replace:dev', 'jshint']);
};
