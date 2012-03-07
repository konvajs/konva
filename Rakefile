require 'json/pure'

# This is the list of files to concatenate. The first file will appear at the top of the final file. All files are relative to the lib directory.
FILES = [
  "license.js", "src/GlobalObject.js", "src/Node.js", "src/Container.js", "src/Stage.js",
  "src/Layer.js", "src/Group.js", "src/geometries/Shape.js", "src/geometries/Rect.js", "src/geometries/Circle.js", "src/geometries/Image.js",
  "src/geometries/Polygon.js", "src/geometries/RegularPolygon.js", "src/geometries/Star.js", "src/geometries/Text.js"
]

def concatenate
  content = ""
  FILES.each do |file|
    content << IO.read(File.expand_path(file)) << "\n"
  end
  
  return content
end

namespace :build do
  desc "Concatenate all the js files into /dist/kinetic.js."
  task :dev do
    puts ":: Building the file /dist/kinetic.js..."
    File.open("dist/kinetic.js", "w") do |file|
      file.puts concatenate()
    end
    puts "   -> Done!"
  end

  desc "Concatenate all the js files in into /dist/kinetic.min.js and minify it."
  task :prod do
    puts ":: Building the file /dist/kinetic.min.js..."
    require 'json/pure'
    require 'uglifier'
    File.open("dist/kinetic.min.js", "w") do |file|
      file.puts Uglifier.compile(concatenate())
    end
    puts ":: Minifying the file /dist/kinetic.min.js..."
    puts "   -> Done!"
  end
end
