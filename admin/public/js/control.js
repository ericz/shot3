

var bridge;
var physics;



$(function(){
  
  $(window).keypress(function(e){
    if(e.which == 119) {
      physics.movePaddle('1', -10);
    } else if(e.which == 115) {
      physics.movePaddle('1', 10);
    } else if(e.which == 111) {
      physics.movePaddle('2', -10);
    } else if(e.which == 108) {
      physics.movePaddle('2', 10);
    }
  });
  
  bridge = new Bridge({url: 'http://136.152.39.187:8091/bridge'});
  bridge.ready(function(){
    bridge.publishService('admin', {addRect: addRect});
    bridge.getService('physics', function(obj){physics = obj});  
  });

});