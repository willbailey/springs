// IMPLEMENTATION
var CARD_IMG = 'card.png';

function loadCard(callback) {
  var img = new Image();
  img.onload = function() {callback(img);};
  img.src = CARD_IMG;
}

function go() {
  loadCard(function(img) {

    var canvas = document.getElementById('surface');
    var ctx = canvas.getContext('2d');
    var damping = document.getElementById('damping');
    var tension = document.getElementById('tension');
    var mass = document.getElementById('mass');


    var spring = new Spring({
      eq: new Vector(400,300),
      k: tension.value
    });

    var card = new Body({
      pos:    new Vector(400,300),
      vel:    new Vector(0,0),
      acc:    new Vector(0,0),
      mass:   mass.value,
      forces: [spring]
    });

    var world = new World({
      damping: damping.value
    });
    world.addObject(card);

    var render = function() {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      world.each(function(obj) {
        ctx.drawImage(img, obj.pos.x - img.width/2, obj.pos.y - img.height/2);
      });
    };

    var START, MOVE, END, moving, grabX, grabY, lastX, lastY;
    if ('ontouchstart' in document.documentElement) {
      START = 'touchstart'; MOVE = 'touchmove'; END = 'touchend';
    } else {
      START = 'mousedown'; MOVE = 'mousemove'; END = 'mouseup';
    }
    canvas.addEventListener(START, function(ev) {
      var x = ev.offsetX, y = ev.offsetY, o = card.pos;
      var width = img.width;
      var height = img.height;
      moving = x >= o.x - width/2 && x <= o.x + width/2 + img.width &&
               y >= o.y - height/2 && y <= o.y + img.height + height/2;
      console.log(x, o.x, o.x+img.width);
      console.log('moving:', moving);
      lastX = o.x;
      lastY = o.y;
      grabX = ev.offsetX;
      grabY = ev.offsetY;
    });
    canvas.addEventListener(MOVE, function(ev) {
      if (moving) {
        card.pos.x = lastX + ev.offsetX - grabX;
        card.pos.y = lastY + ev.offsetY - grabY;
      }
    });
    canvas.addEventListener(END, function(ev) {
      moving = false;
      grabX = null;
      grabY = null;
      lastX = null;
      lastY = null;
    });
    damping.addEventListener('change', function(ev) {
      world.damping = damping.value;
    });
    tension.addEventListener('change', function(ev) {
      spring.k = tension.value;
    });
    mass.addEventListener('change', function(ev) {
      card.mass = mass.value;
    });

    setTimeout(function() {
      if (!moving) world.solve();
      render(world);
      setTimeout(arguments.callee, 30);
    }, 30);
  });
}
