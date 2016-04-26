app.factory('gf', [function(){
  var gf = {};

  gf.getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  gf.newPlayer = function (c){
    console.log(c);
    var object = {};
    object.width = c.startingWidth;
    object.X_pos = gf.getRandomInt(c.dimensions.minX, c.dimensions.maxX);
    object.Y_pos = gf.getRandomInt(c.dimensions.minY, c.dimensions.maxY) - object.width;
    object.X_Vel = 0;
    object.Y_Vel = 0;
    return object;
  };

  gf.newProjectile = function(player, coordinates, c){
    var projectile = {};
    projectile.width = c.projectileWidth;
    projectile.X_pos = player.X_pos + (player.width/2);
    projectile.Y_pos = player.Y_pos + (player.width/2);

    projectile.X_Vel = 2;
    projectile.Y_Vel = 2;
    return projectile;
  };

  return gf;
}]);