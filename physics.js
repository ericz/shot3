var Bridge = require('./bridge').Bridge;
var bridge = new Bridge({host:'136.152.39.187'});
var ball = {x:120,y:120,radius:20};
var paddle1 = {x1:50,y1:50,x2:90,y2:60};
var paddle2 = {x1:50,y1:50,x2:90,y2:70};
var vel = {x:30,y:30};
var startX, startY, startVel;
var running = true;
var hard, soft;
var shot3;
var interval;
physics = {
  stop: function(){
    clearInterval(interval);
  },
	/**genericRotation:function(orient) {
		var rotate = function(x, y) {
			var angle = poooop * Math.PI / 2;
			xprime = Math.cos(angle) * x + Math.sin(angle) * y;
			yprime = - Math.sin(angle) * x + Math.cos(angle) * y;
			return { x: xprime, y: yprime };
		}
		return rotate.toString().replace('poooop', orient);
	},*/
	/** Sorts raw list by y coordinate in increasing order. */
	sortByY:function(a, b) {
		return a.y - b.y;
	},
	sortByX:function(a, b) {
		return a.x - b.x;
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
	debug:function(b){
		boxes = b;
	},
	start:function(r, x, y){
		startVel = vel;
		console.log("start");
		score1 = 0;
		score2 = 0;	
		console.log(r);
		var m = physics.cornerFinder(r);
		boxes = m.corners;
		soft = m.softs;
		
		console.log(boxes);
		leftAvg = (soft.left[1].y-soft.left[0].y)/2;
		rightAvg = (soft.right[1].y-soft.right[0].y)/2;
		paddle1.x1 = soft.left[0].x+50;
		paddle1.y1 = leftAvg-75; 
		paddle1.x2 = paddle1.x1+40;
		paddle1.y2 = paddle1.y1+150;
		paddle2.x1 = soft.right[0].x-90;
		paddle2.y1 = rightAvg-75;
		paddle2.x2 = paddle2.x1+40;
		paddle2.y2 = paddle2.y1+150;
		ball.x = soft.left[0].x+100;
		ball.y = leftAvg;	
		startX = soft.left[0].x+100;
		startY = leftAvg;
		interval = setInterval(physics.update, 100);
	},
	/** Translates entire bounds by offset. */
	translate:function(raw) {
		var bounds = physics.findBound(raw);
		var top = bounds[0];
		var xoff = top[0];
		var yoff = top[1];
		console.log(bounds);
		
		var pushed = [];
		
		for (var i in raw) {
			var monitor = raw[i];
			monitor.x -= xoff;
			monitor.y -= yoff;
			pushed.push(monitor);
		}
		
		return pushed;
	},
	findWindowCorner:function(m) {
		switch(m.orientation) {
			case 0:
				return { x: m.x, y: m.y };
			case 1:
				return { x: m.x, y: m.y + m.width };
			case 2:
				return { x: m.x + m.height, y: m.y + m.width };
			case 3:
				return { x: m.x + m.height, y: m.y };
		}
	},
	/** rawmonitors is a list of objects with keys width, height, x, y, 
    * orientation (0-3). Edgefinder returns a list of top left and bottom
    * right edges. */
	cornerFinder:function(rawmonitors) {
		var monitors = physics.translate(rawmonitors);

		monitors.sort(physics.sortByX);
		
		console.log(monitors);
		// Top edge.
		var leftT = { x: monitors[0].x, y: monitors[0].y };
		var leftB = { x: monitors[0].x, y: monitors[0].y + monitors[0].height };
		
		// Bottom edge.
		var rightT = { x: Number.MIN_VALUE, y: Number.MIN_VALUE };
		var rightB = { x: Number.MIN_VALUE, y: Number.MAX_VALUE };
		
		// Set of all defining corners.
		var corners = [];
		console.log('before for loop');
		for (var i in monitors) {
			var m = monitors[i];
			var tl = { x: m.x, y: m.y };
			var br = { x: m.x + m.width, y: m.y + m.height };
			//var rotate = physics.genericRotation(m.orientation);
			//var windowCorner = physics.findWindowCorner(m);
			
			m.callback[0](m.orientation, tl);
			
			var pair = [tl, br];
			corners.push(pair);
			
			// Check for changes to leftmost edge.
			if (tl.x == leftT.x) {
				leftT.y = Math.min(tl.y, leftT.y);
				leftB.y = Math.max(br.y, leftB.y);
			}
			
			// Check for right edge. 
			if (br.x > rightB.x) {
				rightT.y = tl.y;
				rightB.y = br.y;
				rightT.x = br.x;
				rightB.x = br.x;
			} else if (br.x == rightB.x) {
				rightB.y = Math.max(br.y, rightB.y);
				rightT.y = Math.min(tl.y, rightT.y);
			}
		}
				console.log(monitors);
		var sharad = 	{
										corners: corners, 
										softs: { 
														left: [leftT, leftB], 
														right: [rightT, rightB]
													}
									};
		return sharad;
	},
	update:function(){
		curBox =  -1;
		nextXBox = -1;
		nextYBox = -1;
		for (var box = 0; box < boxes.length;box++){
			if (util.hardContains(ball,boxes[box])){
				curBox = box;
			}
		}
		nextXBall = {x:(ball.x+vel.x),y:(ball.y),radius:ball.radius};
		nextYBall = {x:(ball.x),y:(ball.y+vel.y),radius:ball.radius};
		for (var box=0;box<boxes.length;box++){
			//if (box != curBox){
				if (util.softContains(nextXBall,boxes[box])){
					nextXBox = box;
				} 
				if (util.softContains(nextYBall,boxes[box])){
					nextYBox = box;
				}
			/*} else {
				console.log("sup");
				if (util.hardContains(nextXBall,boxes[box])){
					nextXBox = box;
				}
				if (util.hardContains(nextYBall, boxes[box])){
					nextYBox = box;
				}
			}*/
		}
		/*if (curBox == -1 && nextXBox != -1){
			vel.x = -vel.x;
		}*/
		if (nextXBall.x>=soft.right[0].x){
			score1++;
			ball.x = startX;
			ball.y = startY;
			vel = startVel;
		}
		if (nextXBall.x<=soft.left[0].x){
			score2++;
			ball.x = startX;
			ball.y = startY;
			vel = startVel;
		}
		if ((nextXBall.x>=paddle1.x1&&nextXBall.x<=paddle1.x2&&nextXBall.y<=paddle1.y2&&nextXBall.y>=paddle1.y2)||(nextXBall.x<=paddle1.x2&&nextXBall.x>=paddle1.x1&&nextXBall.y<=paddle1.y2&&nextXBall.y>=paddle1.y1)){
		vel.x = -vel.x;
		}
    if ((nextXBall.x>=paddle2.x1&&nextXBall.x<=paddle2.x2&&nextXBall.y<=paddle2.y2&&nextXBall.y>=paddle2.y2)||(nextXBall.x<=paddle2.x2&&nextXBall.x>=paddle2.x1&&nextXBall.y<=paddle2.y2&&nextXBall.y>=paddle2.y1)){
		vel.x = -vel.x;
		}
		if (nextXBox == -1){
			vel.x = -vel.x;
		}

		if (nextYBox == -1){
			vel.y = -vel.y;
		}
		ball.x += vel.x;
		ball.y += vel.y;	
		shot3.draw({"ball":ball,"paddle":{'1':paddle1,'2':paddle2},"score":{'1':score1,'2':score2}});
	},
	movePaddle:function(player,amount){
    console.log('move', arguments);
		if (player == '1'){
			paddle1.y1 += amount;
			paddle1.y2 += amount;
		} else if (player == '2'){
			paddle2.y1 += amount;
			paddle2.y2 += amount;
		}
    console.log(paddle1, paddle2);
	} 
	
	
}
util = {
	hardContains:function(ball,box){
		return ((ball.x-ball.radius)>=box[0].x && (ball.x+ball.radius)<=box[1].x) && ((ball.y+ball.radius)<=box[1].y && (ball.y-ball.radius)>=box[0].y)
},
	softXContains:function(ball,box){
		return ((ball.x+ball.radius)>=box[0].x && (ball.x-ball.radius)<=box[1].x) && ((ball.x-ball.radius)<=box[1].y && (ball.y-ball.radius)>=box[0].y);
	}, softYContains:function(ball,box){
		return ((ball.y-ball.radius)<=box[1].y && (ball.y+ball.radius)>=box[0].y);	
	},
	softContains:function(ball,box){
		return ((ball.x+ball.radius)>=box[0].x && (ball.x-ball.radius)<=box[1].x) && ((ball.y-ball.radius)<=box[1].y && (ball.y+ball.radius)>=box[0].y)
	}
}
bridge.ready(function(){
	console.log('bridge');
	bridge.joinChannel('shot4',{draw:function(){}},function(){});
	bridge.getChannel('shot4', function(obj) { shot3 = obj;shot3.draw('asd') });
	bridge.publishService('physics2', physics, function() {console.log('physics2')});
	
});
