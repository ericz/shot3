

var bridge;
var physics;


var addRect = function addRect (w, h, callback) {
  var close = $('<div></div>').addClass('close').click(deleteRect);
  $('<div></div>').data('o', 0).data('cb', callback).dblclick(rotate).addClass('rect').append(close).css({width: w/7, height: h/7, 'background-color': '#'+Math.floor(Math.random()*16777215).toString(16)}).draggable({snap:true, snapMode: 'outer'}).appendTo('#field');
};

var send = function send () {
  
  var data =[];
  
  $('.rect').each(function(){
    var pos = $(this).position();
    data.push({
      width: $(this).width()*7,
      height: $(this).height()*7,
      x: pos.left * 7,
      y: pos.top * 7,
      orientation: $(this).data('o'),
      callback: [$(this).data('cb')]
    });
  });
  console.log(data);
  physics.start(data, 5,5);
  
};

var deleteRect = function() {
  $(this).parent().remove();
}

var rotate = function() {
  var o = parseInt($(this).data('o'), 10);
  o++;
  $(this).data('o', o % 4);
  var width = $(this).width();
  var height = $(this).height();
  
  xc = width/2;
  yc = height/2;

  xoff = xc-yc;
  yoff = -xoff;
  var off = findCenterOffset(xoff, yoff);
  $(this).css({width: height, height: width, left: off.left, top: off.top});
};

var findCenterOffset = function(xoff, yoff) {
  if (xoff < 0) {
    xoff = '-='+-xoff;
  } else {
    xoff = '+='+xoff;
  }
  if (yoff < 0) {
    yoff = '-='+-yoff;
  } else {
    yoff = '+='+yoff;
  }
  return {left: xoff, top: yoff};
};

$(function(){
  
  bridge = new Bridge({url: 'http://136.152.39.187:8091/bridge'});
  bridge.ready(function(){
    bridge.publishService('admin2', {addRect: addRect});
    bridge.getService('physics2', function(obj){physics = obj});  
  });

});