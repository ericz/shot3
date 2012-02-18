var FPS = 50; 
var updateTimeout = 1000/FPS;
var lastFrame;
var frameGap;
/*function updateGame() {
 *   calculate();   
 *     draw();
 *       setTimeout(updateGame, updateTimeout);
 *         var curTime = new Date().getTime();
 *           if(lastFrame == undefined) {
 *               frameGap = "undefined";
 *                 } else {
 *                     frameGap = curTime - lastFrame;
 *                       }
 *                         lastFrame = curTime;
 *                           //console.log("FPS: " + 1/frameGap * 1000);
 *
 *                           }
 *
 *                           function sendCoordinates() {
 *                             console.log("Height: " + $(window).height());
 *                               console.log("Width: " + $(window).width());
 *                                 
 *                                 }
 *
 *                                 function calculate() {
 *                                   //ball.x += 5;
 *                                     //ball.y += 5;
 *                                     }
 *
 *                                     var shot3;
 *
 *                                     function draw() {
 *                                       var top = ball.x - ball.radius;
 *                                         var left = ball.y - ball.radius;
 *                                           $("#ball").offset({ top: top, left: left});
 *                                           }*/

var draw = function( drawables) {
  var ballTop = drawables.ball.y - drawables.ball.radius;
  var ballLeft = drawables.ball.x - drawables.ball.radius;
  console.log(ballTop);
  $("#ball").offset({ top: ballTop, left: ballLeft});
  //console.log(JSON.stringify(drawables.ball));
  $("#paddle").offset({top: drawables.paddle.x1, left: drawables.paddle.x2});
};


window.onload = function() {
  var bridge = new Bridge({url: "http://136.152.39.187:8091/bridge"}); 
  console.log("ONLOAD");
  bridge.ready(function() {
    bridge.joinChannel('shot3', { draw: draw}, function(){});
    bridge.getService("physics", function(x) { 
      x.debug([[{x: 0, y: 0}, {x: 200, y: 200}],[{x: 50, y: 200},{x:250,y:400}]]);
      setInterval(function() {x.update(draw)}, 200);
    });
  });
};

