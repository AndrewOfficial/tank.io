app.controller('firstCtrl', ['$scope', 'gf', function ($scope, gf){

  // io is a global defined by /socket.io/socket.io.js
  var socket = io();

  // local variables
  var player = {};
  var c = {};
  var coordinates = {
    x: 0,
    y: 0
  };

  // $scope variables
  $scope.objects = [];

  // get playingField;
  var field = document.getElementById("playingField");

  // get constants
  socket.emit('onStart');
  socket.on('constants', function(constants){
    //new object
    if(!player.id) {
      var player_object = gf.newPlayer(constants);
    }
    socket.emit('newPlayer', player_object);

  });

  socket.on('id', function(id){
    if(!player.id){
      player.id = id;
    }
  });

  //field.mouseMove(function(e) {
  //  document.Form1.posx.value = e.pageX;
  //  document.Form1.posx.value = e.pageY;
  //});

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
    if (!event) {
      event = window.event;
    }
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

  document.onclick = function(event){
    if (player.id != undefined){
      var newProjectile = gf.newProjectile($scope.objects.players[player.id], coordinates, c);
      socket.emit('newProjectile', newProjectile);
    }
  };

  (function() {
    document.onmousemove = handleMouseMove;
    function handleMouseMove(event) {
      var dot, eventDoc, doc, body, pageX, pageY;

      event = event || window.event; // IE-ism

      // If pageX/Y aren't available and clientX/Y are,
      // calculate pageX/Y - logic taken from jQuery.
      // (This is to support old IE)
      if (event.pageX == null && event.clientX != null) {
        eventDoc = (event.target && event.target.ownerDocument) || document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;

        event.pageX = event.clientX +
          (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
          (doc && doc.clientLeft || body && body.clientLeft || 0);
        event.pageY = event.clientY +
          (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
          (doc && doc.clientTop  || body && body.clientTop  || 0 );
      }

      // Use event.pageX / event.pageY here
      coordinates.x = event.pageX;
      coordinates.y = event.pageY

    }
  })();

// Update Game Object Positions/info
  socket.on('frame', function (objects) {
      $scope.objects.players = objects.players;
      $scope.objects.projectiles = objects.projectiles;
      $scope.$apply();
      // next move for player
      if(player.id != undefined){
        socket.emit('movePlayer', player);
      } else {
      }
  });
}]);