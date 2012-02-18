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
    var ballTop = drawables.ball.x - drawables.ball.radius;
      var ballLeft = drawables.ball.x - drawables.ball.raddius;

        $("#ball").offset({ top: ballTop, left: ballLeft});
          $("#paddle").offset({top: drawables.paddle.x1, left: drawables.paddle.x2});
};

window.onload = function() {
      var bridge = new Bridge({url: "http://136.152.39.187/"}); 
     

      bridge.ready(function() {
    bridge.joinChannel('shot3', { draw: draw});
  })
};

