require 'json/pure'
require 'uglifier'

class Build < Thor  
  # This is the list of files to concatenate. The first file will appear at the top of the final file. All files are relative to the lib directory.
  FILES = [
    "src/Global.js", "src/util/Type.js", "src/util/Canvas.js", "src/util/Tween.js", "src/util/Transform.js", "src/util/Collection.js",
    "src/filters/Grayscale.js", "src/filters/Brighten.js", "src/filters/Invert.js", 
    "src/Animation.js", "src/Node.js", "src/DragAndDrop.js", "src/Transition.js", "src/Container.js", "src/Stage.js", "src/Layer.js", "src/Group.js", "src/Shape.js",
    "src/shapes/Rect.js", "src/shapes/Circle.js", "src/shapes/Wedge.js", "src/shapes/Ellipse.js", "src/shapes/Image.js", "src/shapes/Polygon.js", "src/shapes/Text.js", "src/shapes/Line.js", "src/shapes/Sprite.js", "src/shapes/Star.js", "src/shapes/RegularPolygon.js", "src/shapes/Path.js", "src/shapes/TextPath.js"       
  ]
  
  UNIT_TESTS = [
  	"tests/js/unit/nodeTests.js", 
  	"tests/js/unit/stageTests.js", 
  	"tests/js/unit/containerTests.js", 
  	"tests/js/unit/layerTests.js", 
  	"tests/js/unit/shapeTests.js", 
  	"tests/js/unit/ddTests.js", 
  	"tests/js/unit/animationTests.js", 
  	"tests/js/unit/transitionTests.js", 
  	"tests/js/unit/shapes/rectTests.js", 
  	"tests/js/unit/shapes/circleTests.js", 
  	"tests/js/unit/shapes/wedgeTests.js", 
  	"tests/js/unit/shapes/ellipseTests.js",
  	"tests/js/unit/shapes/imageTests.js",
  	"tests/js/unit/shapes/polygonTests.js",
  	"tests/js/unit/shapes/lineTests.js",
  	"tests/js/unit/shapes/regularPolygonTests.js",
  	"tests/js/unit/shapes/starTests.js",
  	"tests/js/unit/shapes/textTests.js",
  	"tests/js/unit/shapes/pathTests.js"
  ]

  if !File.directory?("dist")
    puts ":: Creating dist directory..."
    Dir.mkdir("dist")
  end
    
  # dev build
  desc "dev", "Concatenate all the js files into /dist/kinetic-VERSION.js."
  def dev(version)

    
    file_name = "dist/kinetic-#{version}.js"
    
    puts ":: Deleting other development files..."
    Dir.foreach("dist") do |file|
      if file.match(/.*[^(min)]\.js/)
        File.delete("dist/" + file)
      end
    end
    
    puts ":: Building full source file /#{file_name}..."
    File.open(file_name, "w") do |file|
      file.puts replace_tokens(concatenate, version)
    end
    
    puts "   -> Done!"
  end
  
  # test build
  desc "test", "Concatenate all the unit test js files into tests/js/unitTests.js"
  def test()

    file_name = "tests/js/unitTests.js"
    
    puts ":: Deleting old unitTests.js..."
    if File.file?("tests/js/unitTests.js")
	  File.delete("tests/js/unitTests.js")
	end
  
    puts ":: Building new unitTests.js..."
    File.open(file_name, "w") do |file|
      file.puts concatenateUnitTests
    end
    
    puts "   -> Done!"
  end

  #prod build
  desc "prod", "Concatenate all the js files in into /dist/kinetic-VERSION.min.js and minify it."
  def prod(version)
    file_name = "dist/kinetic-#{version}.min.js"
    
    puts ":: Deleting other prod files..."
    Dir.foreach("dist") do |file|
      if file.match(/.*min\.js/)
        File.delete("dist/" + file)
      end
    end
    
    puts ":: Building full prod file /#{file_name}..."
    
    
    #build full minfiied prod file
    File.open(file_name, "w") do |file|
      uglify = Uglifier.compile(concatenate())
      uglify.sub!(/\*\/ .+ \*\//xm, "*/")
      file.puts replace_tokens(uglify, version)
    end

    #build modular minified files
    puts ":: Building minified modules..."
    FILES.each do |file|
      content = IO.read(File.expand_path(file)) << "\n"
      mod = File.basename(file)
      mod[".js"] = ""
      module_filename = "dist/kinetic-#{mod}-#{version}.min.js"
      File.open(module_filename, "w") do |file2|
        uglify = Uglifier.compile(content, :copyright => mod == "Global")
        file2.puts replace_tokens(uglify, version)
      end
    end

    puts "   -> Done!"
  end
  
  private
  
    def concatenate()
      content = ""
      FILES.each do |file|
        content << IO.read(File.expand_path(file)) << "\n"
      end
      
      return content
    end
    
    def concatenateUnitTests()
      content = ""
      UNIT_TESTS.each do |file|
        content << IO.read(File.expand_path(file)) << "\n"
      end
      
      return content
    end
    
    def replace_tokens(content, version) 
      date = Time.now.strftime("%b %d %Y")
      
      # Add the version number
      content.sub!("@version", version)
      
      # Add the date
      content.sub!("@date", date)
      
      return content
    end

end
  
