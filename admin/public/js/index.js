function addRect(w, h) {
  $('<div></div>').addClass('rect').css({width: w, height: h}).draggable({snap:true, snapMode: 'outer'}).appendTo('#field');
  
}

var bridge;

$(function(){
  
  bridge = new Bridge({url: 'http://136.152.39.187:8091/bridge'});


});