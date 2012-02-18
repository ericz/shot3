

var bridge;
var addRect = function addRect(w, h) {
  $('<div></div>').addClass('rect').css({width: w, height: h, 'background-color': '#'+Math.floor(Math.random()*16777215).toString(16)}).draggable({snap:true, snapMode: 'outer'}).appendTo('#field');
};

var send = function send () {
  $('.rect').each(function(){
    console.log($(this).position());
  });
}

$(function(){
  
  bridge = new Bridge({url: 'http://136.152.39.187:8091/bridge'});
  bridge.ready(function(){
  console.log(1);
    bridge.publishService('admin', {addRect: addRect});
  
  
  
  });

});