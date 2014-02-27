console.log('Do not use this way, use grunt server (with watch functionality) instead.');

var connect = require('connect');
connect.createServer(
    connect.static(__dirname)
).listen(8080);