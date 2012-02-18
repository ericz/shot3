var Bridge = require('./bridge').Bridge;
var bridge = new Bridge({host:'136.152.39.187'});
var ball = {x:120,y:120,radius:20};
var paddle = {x1:50,y1:50,x2:90,y2:60};
var vel = {x:5,y:5};
var running = true;
var hard, soft;
var rotate;
physics = {
	genericRotation:function(orient) {
		var angle = orient * Math.PI / 2;
		var rotate = function(x, y) {
			xprime = Math.cos(angle) * x - Math.sin(angle) * y;
			yprime = Math.sin(angle) * x + Math.cos(angle) * y;
			return { x: xprime, y: yprime };
		}
		return rotate.toString();
	},
	/** Sorts raw list by y coordinate in increasing order. */
	sortByY:function(a, b) {
		return a.y - b.y;
	},
	/** Finds bounding box, with top left corner and bottom right corner. */
	findBound:function(monitors) {
		var minX = Number.MAX_VALUE;
		var minY = Number.MAX_VALUE;
		var maxX = Number.MIN_VALUE;
		var maxY = Number.MIN_VALUE;
		for (var i in monitors) {
			var m = monitors[i];
			minX = Math.min(minX, m.x);
			maxX = Math.max(maxX, m.x);
			minY = Math.min(minY, m.y);
			maxY = Math.max(maxY, m.y);
		}
		var boundTop = [minX, minY];
		var boundBottom = [maxX, maxY];
		return [boundTop, boundBottom];
	},
	start:function(r, x, y, o){
		rotate = physics.genericRotation(o);
	
		console.log("start");
		var m = physics.cornerFinder(r);
		boxes = m.corners;
		soft = m.softs;
		console.log(boxes);
	//	ball.x = x;
	//	ball.y = y;	
	
	},
	/** Translates entire bounds by offset. */
	translate:function(raw) {
		var bounds = physics.findBound(raw);
		var xoff = bounds[0];
		var yoff = bounds[1];
		
		var pushed = [];
		
		for (var i in raw) {
			var monitor = raw[i];
			monitor.x -= xoff;
			monitor.y -= yoff;
			pushed.push(monitor);
		}
		
		return pushed;
	},
	/** rawmonitors is a list of objects with keys width, height, x, y, 
    * orientation (0-3). Edgefinder returns a list of top left and bottom
    * right edges. */
	cornerFinder:function(rawmonitors) {
		var monitors = physics.translate(rawmonitors);
		monitors.sort(sortByY);
		
		// Top edge.
		var topL = { x: monitors[0].x, y: monitors[0].y };
		var topR = { x: monitors[0].x + monitors[0].width, y: monitors[0].y };
		
		// Bottom edge.
		var botL = { x: Number.MAX_VALUE, y: Number.MIN_VALUE };
		var botR = { x: Number.MIN_VALUE, y: Number.MIN_VALUE };
		
		// Set of all defining corners.
		var corners = [];
		
		for (var i in monitors) {
			var m = monitors[i];
			var tl = { x: m.x, y: m.y };
			var br = { x: m.x + m.width, y: m.y + m.height };
			var pair = [tl, br];
			corners.push(pair);
			
			// Check for changes to top edge.
			if (tl.y == topL.y) {
				topL.x = min(tl.x, topL.x);
				topR.x = max(br.x, topR.x);
			}
			
			// Check for bottom edge. 
			if (br.y > botR.y) {
				botR.y = br.y;
				botL.y = br.y;
				botR.x = br.x;
				botL.x = br.x - width;
			} else if (br.y == botR.y) {
				botL.x = min(tl.x, botL.x);
				botR.x = max(br.x, botR.x);
			}
		}
		
		var sharad = 	{
										corners: corners, 
										softs: { 
														top: [topL, topR], 
														bottom: [botL, botR]
													}
									};
		return sharad;
	},
	update:function(callback){
		curBox =  -1;
		nextXBox = -1;
		nextYBox = -1;
		for (var box in boxes){
			if (util.hardContains(ball,boxes[box])){
				curBox = box;
			}
		}
		nextXBall = {x:(ball.x+=vel.x),y:(ball.y),radius:ball.radius};
		nextYBall = {x:(ball.x),y:(ball.y+=vel.y),radius:ball.radius};
		for (var box in boxes){
			if (util.softContains(nextXBall,boxes[box])){
				nextXBox = box;
			}
			if (util.softContains(nextYBall,boxes[box])){
				nextYBox = box;
			}
		}	
		console.log(curBox, nextXBox, nextYBox);
		if (box != nextXBox){
			vel.x = -vel.x;
		}
		if (box != nextYBox){
			vel.y = -vel.y;
		}	
		console.log(JSON.stringify(ball));
		ball.x += vel.x;
		ball.y += vel.y;	
		callback({"ball":ball,"paddle":paddle});
	}
	
	
}
util = {
	hardContains:function(ball,box){
		return ((ball.x-ball.radius)>=box[0]] && (ball.x+ball.radius<=box[1]) && ((ball.y+ball.radius)<=box[1].y && (ball.y-ball.radius)>=box[0].y));
	},
	softContains:function(ball,box){
		console.log((ball.y-ball.radius)<=box[1].y);
		return ((ball.x+ball.radius)>=box[0].x && (ball.x-ball.radius)<=box[1].x) && ((ball.y-ball.radius)<=box[1].y && (ball.y+ball.radius)>=box[0].y)
	}
}
bridge.ready(function(){
	bridge.publishService('physics',physics);
});
