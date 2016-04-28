'use strict';

/**
 * WebServer.js: exports a WebServer singleton object
 */

// Node.js core modules
var http = require('http');
var path = require('path');

// Installed dependencies
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var socketIo = require('socket.io');

// Local dependencies
var indexRouter = require('./routes/index');
var apiRoutes = require('./apiRoutes/index');
var c = require('./Constants');
var objects = require('./objects/objectLibrary.js');
/**
 * Module variables
 */
var app = express();
var server = http.createServer(app);
var io = socketIo(server);
var libs = [];
var topDir = path.join(__dirname, '..');
var port = process.env.PORT || 3000;

/**
 * Configure the express app
 */

// log all http requests
//app.use(morgan('dev', {stream: log.stream}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Put POST data into request.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// pretty print JSON responses
app.set('json spaces', 2);

// Mount routes
app.use(require('less-middleware')(path.join(topDir, 'public')));
app.use(express.static(path.join(topDir, 'public')));

// app.use('/clientInfo', clientInfo);
app.use('/',indexRouter);

apiRoutes.forEach(function(router) {
  app.use('/api', router);
});

function addLib(relativePath) {
  var fileName = path.basename(relativePath);
  libs.push(relativePath);
  app.get('/lib/' + fileName, function(req, res) {
    res.sendFile(path.join(topDir, 'node_modules', relativePath));
  });
}

addLib('angular/angular.min.js');
addLib('angular-route/angular-route.min.js');
addLib('moment/moment.js');

app.use("/lib/bootstrap/", express.static(path.join(topDir, 'node_modules','bootstrap','dist')));

// attach error handler for http server
server.on('error', function(error) {

  if (error.syscall !== 'listen') {
    throw error;
  }

  var portString = 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {

    case 'EACCES':
      console.log(portString + ' requires elevated privileges');
      process.exit(1);
      break;

    case 'EADDRINUSE':
      console.log(portString + ' is already in use');
      process.exit(1);
      break;

    default:
      throw error;

  }
});

// attach "listening" handler to http server
server.on('listening', function() {
  console.log('Listening on port ' + port);
});

/**
 * Stops the http server
 * @param done
 */
function stop(done) {
  server.close(done);
}

/**
 * Applies 404 and 505 catchall routes (must go last) and starts the server
 * @param done
 */
function start(done) {

  done = done || function() {};

  // catch requests for non-existent routes and respond with 404 "not found"
  app.use(function(req, res) {
    res.status(404);
    res.render('404', {
      path: req.url,
      method: req.method
    });
  });

  // Internal server error
  //if (C.env === 'production') {
  //  // no stack traces leaked to user
  //  app.use(function(err, req, res) {
  //    res.status(err.status || 500);
  //    res.render('500', {
  //      message: err.message,
  //      error: {}
  //    });
  //  });
  //} else {
    // will print stacktrace
    app.use(function(err, req, res) {
      res.status(err.status || 500);
      res.render('500', {
        message: err.message,
        error: err
      });
    });
  //}
  server.listen(port, done);
}

/*
 Attach "connection" event handler to socket.io server
 */
io.on('connection', function(socket) {
  console.log('Connected socket.io client ' + socket.id);

  socket.on('onStart', function(){
    socket.emit('constants',c);
  });

  socket.on('newPlayer', function(player){
    player.id = objects.players.length;
    console.log('FIRST', player.id);
    objects.players.push(player);
    socket.emit('id', player.id)
  });

  socket.on('newProjectile', function(projectile){
    objects.projectiles.push(projectile);
  });

  // Broadcast current state of game objects
  var resetFrame = setInterval(function(){
    objects.projectiles = objects.updateProjectiles(objects.projectiles);
    socket.emit('frame', objects);
  }, 10);

  socket.on('movePlayer', function(player){
    if(objects.players.length > 0){
      var object = objects.players[player.id];
      var xyMaxBarrier = c.dimensions.maxX - object.width;
      var yMaxBarrier = c.dimensions.maxY - object.width;

      objects.players[player.id].id = player.id;

      if (player.Y_Vel != undefined) {
        if (object.Y_pos >= c.dimensions.minY && object.Y_pos <= yMaxBarrier){
          object.Y_pos -= player.Y_Vel * c.speedMultiplier;
        } else if (object.Y_pos < c.dimensions.minY){
          object.Y_pos = c.dimensions.minY;
        } else if (object.Y_pos > yMaxBarrier){
          object.Y_pos = yMaxBarrier;
        }
      }
      if (player.X_Vel != undefined) {
        if (object.X_pos >= c.dimensions.minX && object.X_pos <= xyMaxBarrier){
          object.X_pos -= player.X_Vel * c.speedMultiplier;
        } else if (object.X_pos < c.dimensions.minX){
          object.X_pos = c.dimensions.minX;
        } else if (object.X_pos > xyMaxBarrier){
          object.X_pos = xyMaxBarrier;
        }
      }
      object.style = {'left' : object.X_pos + 'px','top' : object.Y_pos + 'px','width' : object.width + 'px', 'height' : object.width + 'px'};

      objects.players[player.id] = object;
    }
  })

});

module.exports = {

  app: app,
  libs: libs,
  server: server,
  start: start,
  stop: stop

};