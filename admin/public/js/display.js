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
  eval('var rotate = ' + rfunc);
  
  var windowpos = rotate(drawables.ball.x,
  										drawables.ball.y);
  
  var ballTop = windowpos.y - drawables.ball.radius + translate.x + windowcorner.x;
  var ballLeft = windowpos.x - drawables.ball.radius - translate.y + windowcorner.y;
  
  
  $("#ball").offset({ top: ballTop, left: ballLeft});
  //console.log(JSON.stringify(drawables.ball));

	//var paddlepos = rfunc(drawables.paddle.x1, drawables.paddle.x2);
  //$("#paddle").offset({top: paddlepos.x, left: paddlepos.y});
};

var translate;

window.onload = function() {
  var bridge = new Bridge({url: "http://136.152.39.187:8091/bridge"}); 
  console.log("ONLOAD");
  bridge.ready(function() {
    bridge.joinChannel('shot4', { draw: draw}, function(){});
    bridge.getService("admin2", function(x) { 
     x.addRect($(window).width(), $(window).height(), function(rotate, tl, wc) {
     		translate = tl;
     		rfunc = rotate;
     		windowcorner = wc;
     	});
    });
  });
};

