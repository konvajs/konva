Package.describe({
    name: "arturs:konva",
    summary: "Konva.js html5 canvas framework",
    version: "0.9.5",
    git: "https://github.com/Arturs/konva",
});

Package.on_use(function (api) {
  api.add_files(['konva.min.js'], 'client');

   if (typeof api.export !== 'undefined') {
     api.export(['Konva'], 'client'); 
   }
});
