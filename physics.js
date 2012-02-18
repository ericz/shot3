var Bridge = require('./bridge').Bridge;
var bridge = new Bridge({host:'136.152.39.187'});
var ball = {x:120,y:120,radius:20};
var paddle = {x1:50,y1:50,x2:90,y2:60};
var vel = {x:10,y:10};
var running = true;
var hard, soft;
physics = {
	start:function(b, s, x, y){
		console.log("start");
		boxes = b;
		soft = s;
		console.log(boxes);
	//	ball.x = x;
	//	ball.y = y;	
	},
	update:function(callback){
		curBox =  -1;
		nextXBox = -1;
		nextYBox = -1;
		for (var box in boxes){
			if (util.softContains(ball,boxes[box])){
				curBox = box;
			}
		}
		nextXBall = {x:(ball.x+vel.x),y:(ball.y),radius:ball.radius};
		nextYBall = {x:(ball.x),y:(ball.y+vel.y),radius:ball.radius};
		console.log(ball, nextXBall,nextYBall);
		for (var box in boxes){
			if (util.softContains(nextXBall,boxes[box])){
				nextXBox = box;
			}
			if (util.softContains(nextYBall,boxes[box])){
				nextYBox = box;
			}
		}
		console.log(curBox, nextXBox, nextYBox);
		if (curBox != nextXBox){
			vel.x = -vel.x;
		}
		if (curBox != nextYBox){
			vel.y = -vel.y;
		}
		ball.x += vel.x;
		ball.y += vel.y;	
		callback({"ball":ball,"paddle":paddle});
	}
}
util = {
	hardContains:function(ball,box){
		return ((ball.x-ball.radius)>=box[0] && (ball.x+ball.radius<=box[1]) && ((ball.y+ball.radius)<=box[1].y && (ball.y-ball.radius)>=box[0].y));
	},
	softContains:function(ball,box){
		return ((ball.x+ball.radius)>=box[0].x && (ball.x-ball.radius)<=box[1].x) && ((ball.y-ball.radius)<=box[1].y && (ball.y+ball.radius)>=box[0].y)
	}
}
bridge.ready(function(){
	bridge.publishService('physics',physics);
});
