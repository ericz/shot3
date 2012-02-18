var Bridge = require('./bridge').Bridge;
var bridge = new Bridge({host:'136.152.39.187'});
var ball = {x:0,y:0,radius:5};
var paddle;
var vel = {x:0,y:1};
var running = true;
var hard, soft;
physics = {
	start:function(h, s){
		hard = h;
		soft = s;
	},
	update:function(){
		next = 0;
		for (var p=0;p<hard.length;p++){
			if (next == hard.length-1) {
				next = 0;
			} else {
				next = p+1;
			}
			edge = [{x:hard[p].x,y:hard[p].y},{x:hard[next].x,y:hard[next].y}];	
			if ((ball.x<=edge[0].x && ball.x>=edge[1]) || (ball.x<=edge[1].x && ball.x>=edge[1])){
				console.log("left of edge");	
			}
		}
	}
}
physics.start([{x:0,y:0},{x:1,y:0},{x:0.5,y:0.5}],[]);
physics.update();
