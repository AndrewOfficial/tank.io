var constants = require('../Constants');
module.exports = {
  players: [],
  projectiles: [],
  updateProjectiles: function(projectiles){
    for (var i in projectiles){
      if(projectiles[i].progress == undefined){
        projectiles[i].progress = 0;
        var X_OriginalDistance = projectiles[i].coordinates.x - projectiles[i].X_origin;
        var Y_OriginalDistance = projectiles[i].coordinates.y - projectiles[i].Y_origin;
        var hypotenuse = Math.sqrt(Math.pow(X_OriginalDistance, 2) + Math.pow(Y_OriginalDistance, 2));
        projectiles[i].x_distance = X_OriginalDistance * (600/hypotenuse);
        projectiles[i].y_distance = Y_OriginalDistance * (600/hypotenuse);
        //console.log('x_distance: ', projectiles[i].x_distance, 'y_distance: ', projectiles[i].y_distance);
      } else if (projectiles[i].progress == 300){
        projectiles.splice(i, 1);
      } else {
        projectiles[i].progress = projectiles[i].progress + 1;
        projectiles[i].X_pos = projectiles[i].X_origin + projectiles[i].x_distance * projectiles[i].progress/300;
        projectiles[i].Y_pos = projectiles[i].Y_origin + projectiles[i].y_distance * projectiles[i].progress/300;
        projectiles[i].style = {'left' : projectiles[i].X_pos + 'px','top' : projectiles[i].Y_pos + 'px','width' : projectiles[i].width + 'px', 'height' : projectiles[i].width + 'px'};
      }
    }
    return projectiles;
  }
};
