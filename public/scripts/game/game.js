// io is a global defined by /socket.io/socket.io.js
var game = new Phaser.Game(1000, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var socket = io();
var C = {};
var playerFrame = {};
var coordinates = {
  x: 0,
  y: 0
};
var fireRate = 5;
var fireNumber = 0;
var objectsServer = {};
var removeNumber = 0;
var objectsClient = {};
objectsClient.players = [];
objectsClient.projectiles = [];

var logger = 0;

socket.on('id', function(id){
  if(!playerFrame.id){
    playerFrame.id = id;
  }
});

function preload() {
  game.load.image('red_circle_medium', '/images/red_circle_medium.png');
  game.load.image('red_circle_small', '/images/red_circle_small.png');
  game.stage.backgroundColor = "#FFFFFF";

  socket.emit('onStart');
  socket.on('linkStart', function(obj, constants){
    objectsServer.players = obj.players;
    objectsServer.projectiles = obj.projectileList.projectiles;
    C = constants;
    playerFrame.id = obj.players.length -1;
    var projectiles = objectsServer.projectiles;

    for (var i in objectsServer.players){
      var player = game.add.sprite(objectsServer.players[i].X_pos, objectsServer.players[i].Y_pos, 'red_circle_medium');
      objectsClient.players.push(player);
    }
    for (var i in projectiles){
      var projectile = game.add.sprite(projectiles[i].X_pos, projectiles[i].Y_pos, 'red_circle_small');
      objectsClient.projectiles.push(projectile);
    }

  });
}

function create() {
  document.onkeydown = function(event) {
    if (!event)
      event = window.event;
    var code = event.keyCode;
    if (event.charCode && code == 0)
      code = event.charCode;
    switch(code) {
      case 65: // left
        playerFrame.X_Vel = 1;
        break;
      case 87: //up
        playerFrame.Y_Vel = 1;
        break;
      case 68: //right
        playerFrame.X_Vel = -1;
        break;
      case 83: //down
        playerFrame.Y_Vel = -1;
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
        playerFrame.X_Vel = 0;
        break;
      case 87: //up
        playerFrame.Y_Vel = 0;
        break;
      case 68: //right
        playerFrame.X_Vel = 0;
        break;
      case 83: //down
        playerFrame.Y_Vel = 0;
        break;
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
  socket.on('frame', function (frameObject) {
    frameObject = JSON.parse(frameObject);
    if (logger> 600){
      console.log(frameObject);
      logger = 0;
    } else {logger++}

    if(playerFrame.id != undefined) {
      fireNumber++;
      // update players
      for (var i in frameObject.players) {
        if (objectsServer.players[i] == undefined) {
          objectsServer.players[i] = frameObject.players[i];
          var player = game.add.sprite(frameObject.players[i].X_pos, frameObject.players[i].Y_pos, 'red_circle_medium');
          objectsClient.players.push(player);
        } else {
          objectsServer.players[playerFrame.id] = frameObject.players[playerFrame.id];
          objectsClient.players[i].x = frameObject.players[i].X_pos;
          objectsClient.players[i].y = frameObject.players[i].Y_pos;
        }
      }
      //update projectiles
      console.log(frameObject.projectileList.removeNumber);
      removeNumber += frameObject.projectileList.removeNumber;
      if (removeNumber > 0){
        for (var i = 0; i<removeNumber; i++) {
          var x = objectsClient.projectiles.shift();
          x.destroy();
          objectsServer.projectiles.splice(0,1);
          removeNumber -= 1;
        }
      }

      for (var i = 0; i < frameObject.projectileList.projectiles.length; i++) {
        if (frameObject.projectileList.projectiles.length - objectsServer.projectiles.length > 0) {
          for (var x = 0; x < frameObject.projectileList.projectiles.length - objectsServer.projectiles.length; x++) {
            objectsServer.projectiles.push(frameObject.projectileList.projectiles[i]);
            var projectile = game.add.sprite(frameObject.projectileList.projectiles[i].X_pos, frameObject.projectileList.projectiles[i].Y_pos, 'red_circle_small');
            objectsClient.projectiles.push(projectile);
          }
        } else {
          objectsClient.projectiles[i].x = frameObject.projectileList.projectiles[i].X_pos;
          objectsClient.projectiles[i].y = frameObject.projectileList.projectiles[i].Y_pos;
        }
      }

      if (game.input.activePointer.isDown && fireNumber > fireRate) {
        fireNumber = 0;
        coordinates.x = game.input.mousePointer.x;
        coordinates.y = game.input.mousePointer.y;
        var newProjectile = objectsLibrary.newProjectile(objectsServer.players[playerFrame.id], coordinates);
        socket.emit('move', JSON.stringify(playerFrame), JSON.stringify(newProjectile));
      } else {
        // next move for player
        socket.emit('move', JSON.stringify(playerFrame));
      }
    }
  });
}

function update() {

}

var objectsLibrary = {
  getRandomInt : function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  newPlayer : function () {
    var object = {};
    object.width = C.startingWidth;
    object.X_pos = this.getRandomInt(C.dimensions.minX, C.dimensions.maxX);
    object.Y_pos = this.getRandomInt(C.dimensions.minY, C.dimensions.maxY) - object.width;
    object.X_Vel = 0;
    object.Y_Vel = 0;
    return object;
  },
  newProjectile : function (player, coordinates) {
    var projectile = {};
    projectile.coordinates = {};

    projectile.shooter = playerFrame.id;
    projectile.width = C.projectileWidth;
    projectile.X_origin = player.X_pos + (player.width / 2);
    projectile.Y_origin = player.Y_pos + (player.width / 2);
    projectile.X_pos = player.X_pos + (player.width / 2);
    projectile.Y_pos = player.Y_pos + (player.width / 2);
    projectile.coordinates.x = coordinates.x;
    projectile.coordinates.y = coordinates.y;
    projectile.alive = true;

    return projectile;
  }
};