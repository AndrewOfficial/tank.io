app.factory('gf',[function(){
  var gf = {};
  gf.getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  gf.newPlayer = function (dimensions){
    var object = {};
    object.id = objects.length;
    console.log("fact id", object.id);
    object.X_Vel = 0;
    object.X_pos = gf.getRandomInt(dimensions.minX, dimensions.maxX);
    object.Y_pos = gf.getRandomInt(dimensions.minY, dimensions.maxY);
    object.Y_Vel = 0;
    return object;
  };
  return gf;
}]);