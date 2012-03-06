# This is the list of files to concatenate. The first file will appear at the top of the final file. All files are relative to the lib directory.
FILES = [
  "Kinetic.js", "GlobalObject.js", "Node.js", "Container.js", "Stage.js",
  "Layer.js", "Group.js", "Shape.js", "Rect.js", "Circle.js", "Image.js",
  "Polygon.js", "RegularPolygon.js", "Star.js", "Text.js"
]

def concatenate
  content = ""
  FILES.each do |file|
    content << IO.read(File.expand_path('lib/' + file)) << "\n"
  end
  
  return content
end

namespace :build do
  desc "Concatenate all the files in /lib into /dist/kinetic.js."
  task :dev do
    puts ":: Building the file /dist/kinetic.js..."
    File.open("dist/kinetic.js", "w") do |file|
      file.puts concatenate()
    end
    puts "   -> Done!"
  end

  desc "Concatenate all the files in /lib into /dist/kinetic.min.js and minify it."
  task :prod do
    puts ":: Building the file /dist/kinetic.min.js..."
    require 'uglifier'
    File.open("dist/kinetic.min.js", "w") do |file|
      file.puts Uglifier.compile(concatenate())
    end
    puts ":: Minifying the file /dist/kinetic.min.js..."
    puts "   -> Done!"
  end
end
