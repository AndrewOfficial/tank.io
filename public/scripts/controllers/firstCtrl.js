app.controller('firstCtrl', ['$scope', 'gf', '$apply', function ($scope, $apply, gf){

  // io is a global defined by /socket.io/socket.io.js
  var socket = io();

  // local variables
  var minHeight = 450,
    maxHeight = 150,
    speedMultiplier = 2,
    dimensions = {};

  dimensions.minY = 150;
  dimensions.maxY = 450;
  dimensions.minX = 150;
  dimensions.maxX = 600;

  // $scope variables
  $scope.objects = [];

  //new object
  $scope.objects = gf.object($scope.objects, dimensions);

  document.onkeydown = function(event) {
    if (!event)
      event = window.event;
    var code = event.keyCode;
    if (event.charCode && code == 0)
      code = event.charCode;
    switch(code) {
      case 65: // left
        console.log('tasty');
        p1.HorVel = -1;
        break;
      case 87: //up
        p1.Y_Vel = 1;
        break;
      case 68: //right
        console.log('I');
        p1.HorVel = +1;
        break;
      case 83: //down
        p1.Y_Vel = -1;
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
        console.log('tasty');
        p1.HorVel = 0;
        break;
      case 87: //up
        p1.Y_Vel = 0;
        break;
      case 68: //right
        console.log('I');
        p1.HorVel = 0;
        break;
      case 83: //down
        p1.Y_Vel = 0;
        break;
    }
    event.preventDefault();
  };

  // set interval
  var resetFrame = setInterval(function(){
    $scope.objects.forEach(getFrame(object));
  }, 1);

// Update Game Object Positions/info
  socket.on('frame', function (objects) {
    $scope.objects.forEach(function(obj,i){
      if($scope.objects[i].id === objects[i].id){
        obj.style = "top:" + objects[i].Y_pos;
        obj.style = "bottom:" + objects[i].Y_pos;
      } else {
        console.log("$scope.id: ",$scope.objects[i].id, "object.id:", objects[i].id)
      }
    });
    // if there are new objects in the game
    if(objects.length > $scope.objects.length){
      for (var i = 0; i < objects.length - $scope.objects.length; i++){
        $scope.objects.push(objects[$scope.objects.length+ i]);
      }
    }
    //$scope.$apply()
    console.log("EYY")
  });

  function getFrame(object) {
    if (object.Y_Vel != 0) {
      console.log(object.Y_pos);
      if (object.Y_pos <= minHeight && p1.Y_pos >= maxHeight){
        object.Y_pos -= p1.Y_Vel * speedMultiplier;
        object.style.top = p1.Y_pos + 'px';
      } else if (object.Y_pos > minHeight){
        object.Y_pos = minHeight;
      } else if (object.Y_pos < maxHeight){
        object.Y_pos = maxHeight;
      }
    }
    socket.emit(object);
  }

  function abortTimer() { // to be called when you want to stop the timer
    clearInterval(resetFrame);
  }


}]);