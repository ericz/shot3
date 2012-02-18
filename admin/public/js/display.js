var draw = function( drawables) {
  var ballTop = drawables.ball.y - drawables.ball.radius;
  var ballLeft = drawables.ball.x - drawables.ball.radius;
  console.log(ballTop);
  $("#ball").offset({ top: ballTop, left: ballLeft});
  $("#paddle1").offset({top: drawables.paddle['1'].x1, left: drawables.paddle.x2});
  $("#paddle2").offset({top: drawables.paddle['2'].x1, left: drawables.paddle.x2});

};


window.onload = function() {
  var bridge = new Bridge({url: "http://136.152.39.187:8091/bridge"}); 
  console.log("ONLOAD");
  bridge.ready(function() {
    bridge.joinChannel('shot3', { draw: draw}, function(){});
    bridge.getService("physics", function(x) { 
      x.debug([[{x: 0, y: 0}, {x: 200, y: 200}],[{x: 50, y: 200},{x:250,y:400}]]);
    });
  });
};

