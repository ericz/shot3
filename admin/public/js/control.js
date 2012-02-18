

var bridge;
var physics;



$(function(){
  
  $(window).keypress(function(e){
    if(e.which == 119) {
      physics.movePaddle('1', -25);
    } else if(e.which == 115) {
      physics.movePaddle('1', 25);
    } else if(e.which == 111) {
      physics.movePaddle('2', -25);
    } else if(e.which == 108) {
      physics.movePaddle('2', 25);
    }
  });
  
  bridge = new Bridge({url: 'http://136.152.37.120:8091/bridge'});
  bridge.ready(function(){
    bridge.getService('physics', function(obj){physics = obj});  
  });
  
  $('#lu').mousedown(function(){
     physics.movePaddle('1', -50); 
  });
  $('#ld').mousedown(function(){
     physics.movePaddle('1', 50); 
  });
  $('#ru').mousedown(function(){
     physics.movePaddle('2', -50); 
  });
  $('#rd').mousedown(function(){
     physics.movePaddle('2', 50); 
  });
  

});