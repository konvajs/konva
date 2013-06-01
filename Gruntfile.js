module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: [
          // core / anim + tween + dd
          'src/Global.js', 
          'src/Util.js', 
          'src/Canvas.js',
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
          'src/filters/Mask.js'
        ],
        dest: 'dist/kinetic-v<%= pkg.version %>.js'
      }
    },
    replace: {
      dist: {
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
        files: [
          {
            expand: true, 
            flatten: true, 
            src: ['dist/kinetic-v<%= pkg.version %>.js'], 
            dest: 'dist/'
          }
        ]
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> http://www.kineticjs.com - MIT License https://github.com/ericdrowell/KineticJS/wiki/License*/\n'
      },
      build: {
        src: 'dist/kinetic-v<%= pkg.version %>.js',
        dest: 'dist/kinetic-v<%= pkg.version %>.min.js'
      }
    }
  });

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Tasks
  grunt.registerTask('dev', ['concat', 'replace']);
  grunt.registerTask('prod', ['concat', 'replace', 'uglify']);

};