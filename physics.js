var Bridge = require('./bridge').Bridge;
var bridge = new Bridge({host:'136.152.39.187'});
var ball = {x:0,y:0,radius:20};
var paddle;
var vel = {x:0,y:1};
var running = true;
var hard, soft;
physics = {
	start:function(b, s, x, y){
		console.log("sup");
		boxes = b;
		soft = s;
		ball.x = x;
		ball.y = y;	
	},
	update:function(){
		curBox =  -1;
		nextXBox = -1;
		nextYBox = -1;
		for (var box in boxes){
			if (util.contains(ball,boxes[box])){
				curBox = box;
			}
		}
		nextXBall = {x:(ball.x+=vel.x),y:(ball.y),radius:ball.radius};
		nextYBall = {x:(ball.x),y:(ball.y+=vel.y),radius:ball.radius};
		for (var box in boxes){
			if (util.contains(nextXBall,boxes[box])){
				nextXBox = box;
			}
			if (util.contains(nextYBall,boxes[box])){
				nextYBox = box;
			}
		}	
		if (box != nextXBox){
			vel.x = -vel.x;
		}
		if (box != nextYBox){
			vel.y = -vel.y;
		}	
		ball.x += vel.x;
		ball.y += vel.y;	
		return {"ball":ball};
	}
}
util = {
	contains:function(ball,box){
		console.log('contains');
		return ((ball.x+ball.radius)>=box[0].x && (ball.x-ball.radius)<=box[1].x) && ((ball.y+ball.radius)>=box[1].y && (ball.y-ball.radius)<=box[0].y)
	}
}
bridge.ready(function(){
	bridge.publishService('physics',physics);
});
