var draw = function( drawables) {

  var ballTop = drawables.ball.y - drawables.ball.radius - translate.y;
  var ballLeft = drawables.ball.x - drawables.ball.radius - translate.x;
  
  /*switch (orientation) {
  	case 0:
  		break;
  	case 1:
  		ballLeft = drawables.ball.y - drawables.ball.radius + translate.x;
  		ballTop = - drawables.ball.x + drawables.ball.radius + translate.y;
  		break;
  	case 2:
  		break;
  	case 3:
  		break;
  		
  }*/
  
  $("#ball").offset({ top: ballTop, left: ballLeft});

  $("#paddle1").offset({top: drawables.paddle['1'].y1 - translate.y, left: drawables.paddle['1'].x1 - translate.x});
  $("#paddle2").offset({top: drawables.paddle['2'].y1 - translate.y, left: drawables.paddle['2'].x1 - translate.x});
  $("#score1").text(drawables.score['1']);
  $("#score2").text(drawables.score['2']);
};

var translate;

window.onload = function() {
  var bridge = new Bridge({url: "http://136.152.37.120:8091/bridge"}); 
  console.log("ONLOAD");
  bridge.ready(function() {
    bridge.joinChannel('shot3', { draw: draw}, function(){});
    bridge.getService("admin", function(x) { 
     x.addRect($(window).width(), $(window).height(), function(o, tl) {
     		translate = tl;
     		orientation = o;
     	});
    });
  });
};

