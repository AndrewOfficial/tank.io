app.controller('firstCtrl', ['$scope', 'gf', function ($scope, gf){

  // io is a global defined by /socket.io/socket.io.js
  var socket = io();

  // local variables
    var speedMultiplier = 2,
    dimensions = {},
    player = {};

  dimensions.minY = 150;
  dimensions.maxY = 450;
  dimensions.minX = 150;
  dimensions.maxX = 600;

  // $scope variables
  $scope.objects = [];

  //new object
  if(!player.id) {
    var player_object = gf.newPlayer(dimensions);
  }

  socket.emit('newPlayer', player_object);
  socket.on('id', function(id){
    if(!player.id){
      player.id = id;
    }
  });

  document.onkeydown = function(event) {
    if (!event)
      event = window.event;
    var code = event.keyCode;
    if (event.charCode && code == 0)
      code = event.charCode;
    switch(code) {
      case 65: // left
        player.X_Vel = 1;
        break;
      case 87: //up
        player.Y_Vel = 1;
        break;
      case 68: //right
        player.X_Vel = -1;
        break;
      case 83: //down
        player.Y_Vel = -1;
        break;
    }
    event.preventDefault();
  };

  document.onkeyup = function(event) {
    if (!event)
      event = window.event;
    var code = event.keyCode;
    if (event.charCode && code == 0)
      code = event.charCode;
    switch(code) {
      case 65: // left
        player.X_Vel = 0;
        break;
      case 87: //up
        player.Y_Vel = 0;
        break;
      case 68: //right
        player.X_Vel = 0;
        break;
      case 83: //down
        player.Y_Vel = 0;
        break;
    }
  };

// Update Game Object Positions/info
  socket.on('frame', function (objects) {
    if (objects.length>0) {
      $scope.objects = objects;
      $scope.$apply();
      // next move for player
      movePlayer(objects[player.id]);
    }
  });

  function movePlayer(object) {
    if (player.Y_Vel != undefined) {
      if (object.Y_pos > dimensions.minY && object.Y_pos < dimensions.maxY){
        console.log("AYYYY",player.Y_Vel);
        object.Y_pos -= player.Y_Vel * speedMultiplier;
      } else if (object.Y_pos <= dimensions.minY){
        object.Y_pos = dimensions.minY;
      } else if (object.Y_pos >= dimensions.maxY){
        object.Y_pos = dimensions.maxY;
      }
    }
    if (player.X_Vel != undefined) {
      if (object.X_pos > dimensions.minX && object.X_pos < dimensions.maxX){
        console.log("object.X_pos", object.X_pos);
        object.X_pos -= player.X_Vel * speedMultiplier;
      } else if (object.X_pos <= dimensions.minX){
        object.X_pos = dimensions.minX;
      } else if (object.X_pos >= dimensions.maxX){
        object.X_pos = dimensions.maxX;
      }
    }

    object.style = {'left' : object.X_pos + 'px','top' : object.Y_pos + 'px'};
    socket.emit('move', object);
  }
}]);