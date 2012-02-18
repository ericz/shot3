var draw = function( drawables) {
  var ballTop = drawables.ball.y - drawables.ball.radius - translate.y;
  var ballLeft = drawables.ball.x - drawables.ball.radius - translate.x;
  $("#ball").offset({ top: ballTop, left: ballLeft});
  $("#paddle1").offset({top: drawables.paddle['1'].x1, left: drawables.paddle.x2});
  $("#paddle2").offset({top: drawables.paddle['2'].x1, left: drawables.paddle.x2});

};

var translate;

window.onload = function() {
  var bridge = new Bridge({url: "http://136.152.39.187:8091/bridge"}); 
  console.log("ONLOAD");
  bridge.ready(function() {
    bridge.joinChannel('shot3', { draw: draw}, function(){});
    bridge.getService("admin", function(x) { 
     x.addRect($(window).width(), $(window).height(), function(rotate, tl) {
     		translate = tl;
     	});
    });
  });
};

