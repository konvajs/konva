require 'json/pure'
require 'uglifier'

class Build < Thor  
  # This is the list of files to concatenate. The first file will appear at the top of the final file. All files are relative to the lib directory.
  FILES = [
    "src/Global.js", "src/filters/Grayscale.js", "src/util/Type.js", "src/util/Canvas.js", "src/util/Tween.js", "src/util/Transform.js", "src/util/Collection.js",
    "src/Animation.js", "src/Node.js", "src/DragAndDrop.js", "src/Transition.js", "src/Container.js", "src/Stage.js", "src/Layer.js", "src/Group.js", "src/Shape.js",
    "src/shapes/Rect.js", "src/shapes/Circle.js", "src/shapes/Ellipse.js", "src/shapes/Image.js", "src/shapes/Polygon.js", "src/shapes/Text.js", "src/shapes/Line.js", "src/shapes/Sprite.js", "src/shapes/Star.js", "src/shapes/RegularPolygon.js", "src/shapes/Path.js", "src/shapes/TextPath.js"       
  ]
  
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
      file.puts concatenate(version)
    end
    
    puts "   -> Done!"
  end
  
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
#=begin
    File.open(file_name, "w") do |file|
      uglify = Uglifier.compile(concatenate(version))
      uglify.sub!(/\*\/ .+ \*\//xm, "*/")
      file.puts uglify
    end
#=end

    #build modular minified files
    puts ":: Building minified modules..."
    FILES.each do |file|
      content = IO.read(File.expand_path(file)) << "\n"
      mod = File.basename(file)
      mod[".js"] = ""
      module_filename = "dist/kinetic-#{mod}-#{version}.min.js"
      File.open(module_filename, "w") do |file2|
        uglify = Uglifier.compile(content, { copyright: false })
        file2.puts uglify
      end
    end

    puts "   -> Done!"
  end
  
  private
  
    def concatenate(version)
      date ||= Time.now.strftime("%b %d %Y")
      content = ""
      FILES.each do |file|
        content << IO.read(File.expand_path(file)) << "\n"
      end
      
      # Add the version number
      content.sub!("@version", version)
      
      # Add the date
      content.sub!("@date", date)
      
      return content
    end

end
  
