require 'json/pure'

class Build < Thor
  include Thor::Actions
  # include Thor::Shell::Basic
  
  # This is the list of files to concatenate. The first file will appear at the top of the final file. All files are relative to the lib directory.
  FILES = [
    "license.js", "src/GlobalObject.js", "src/Node.js", "src/Container.js", "src/Stage.js",
    "src/Layer.js", "src/Group.js", "src/geometries/Shape.js", "src/geometries/Rect.js", "src/geometries/Circle.js", "src/geometries/Image.js",
    "src/geometries/Polygon.js", "src/geometries/RegularPolygon.js", "src/geometries/Star.js", "src/geometries/Text.js"
  ]
  
  desc "dev", "Concatenate all the js files into /dist/kinetic.js."
  def dev
    puts ":: Building the file /dist/kinetic.js..."
    File.open("dist/kinetic.js", "w") do |file|
      file.puts concatenate()
    end
    puts "   -> Done!"
  end
  
  desc "prod", "Concatenate all the js files in into /dist/kinetic.min.js and minify it."
  def prod
    puts ":: Building the file /dist/kinetic.min.js..."
    require 'json/pure'
    require 'uglifier'
    File.open("dist/kinetic.min.js", "w") do |file|
      file.puts Uglifier.compile(concatenate())
    end
    puts ":: Minifying the file /dist/kinetic.min.js..."
    puts "   -> Done!"
  end
  
  desc "all", "Build the development and the production files."
  def all
    invoke :dev
    invoke :prod
  end
  
  private
  
    def concatenate
      content = ""
      FILES.each do |file|
        content << IO.read(File.expand_path(file)) << "\n"
      end
      
      return content
    end
end
  
