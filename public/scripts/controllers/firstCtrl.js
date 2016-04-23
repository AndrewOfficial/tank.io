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
  $scope.newPlayer = gf.newPlayer($scope.objects, dimensions);
  player.id = $scope.objects.length - 1;
  console.log(player.id);

  socket.emit('newPlayer', $scope.objects);

  document.onkeydown = function(event, $scope.objects.length - 1) {
    if (!event)
      event = window.event;
    var code = event.keyCode;
    if (event.charCode && code == 0)
      code = event.charCode;
    switch(code) {
      case 65: // left
        console.log('tasty');
        player.HorVel = -1;
        break;
      case 87: //up
        player.Y_Vel = 1;
        break;
      case 68: //right
        console.log('I');
        player.HorVel = +1;
        break;
      case 83: //down
        player.Y_Vel = -1;
        break;
    }
    movePlayer(player);
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
        console.log('tasty');
        player.HorVel = 0;
        break;
      case 87: //up
        player.Y_Vel = 0;
        break;
      case 68: //right
        console.log('I');
        player.HorVel = 0;
        break;
      case 83: //down
        player.Y_Vel = 0;
        break;
    }
  };

// Update Game Object Positions/info
  socket.on('frame', function (objects) {
    if (objects.length>0) {
      $scope.objects.forEach(function (obj, i) {
        if ($scope.objects[i].id === objects[i].id) {
          obj.style = "top:" + objects[i].Y_pos;
          obj.style = "bottom:" + objects[i].Y_pos;
        } else {
          console.log("$scope.id: ", $scope.objects[i].id, "object.id:", objects[i].id)
        }
      });
      // if there are new objects in the game
      if (objects.length > $scope.objects.length) {
        for (var i = 0; i < objects.length - $scope.objects.length; i++) {
          $scope.objects.push(objects[$scope.objects.length + i]);
        }
      }
      //$scope.$apply()
      console.log("EYY");

      // next move for player
      movePlayer(objects[player.id]);
    }
  });

  function movePlayer(object) {
    if (object.Y_Vel != 0) {
      console.log("X: ", object.Y_pos);
      if (object.Y_pos <= dimensions.minY && player.Y_pos >= dimensions.maxY){
        object.Y_pos -= player.Y_Vel * speedMultiplier;
        object.style.top = player.Y_pos + 'px';
      } else if (object.Y_pos > dimensions.minY){
        object.Y_pos = dimensions.minY;
      } else if (object.Y_pos < dimensions.maxY){
        object.Y_pos = dimensions.maxY;
      }
    }
    if (object.X_Vel != 0) {
      console.log("X: ", object.X_pos);
      if (object.X_pos <= dimensions.minX && player.X_pos >= dimensions.maxX){
        object.X_pos -= player.X_Vel * speedMultiplier;
        object.style.top = player.X_pos + 'px';
      } else if (object.X_pos > dimensions.minX){
        object.X_pos = dimensions.minX;
      } else if (object.X_pos < dimensions.maxX){
        object.X_pos = dimensions.maxX;
      }
    }
    socket.emit('move', object);
  }
}]);