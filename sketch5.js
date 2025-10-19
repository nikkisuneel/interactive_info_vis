// Instance-mode sketch for tab 5
registerSketch('sk5', function(p) {
  p.setup = function() { p.createCanvas(p.windowWidth, p.windowHeight); };
  p.draw = function() {
    p.background(200, 200, 240);
    p.fill(40, 40, 120);
    p.textSize(32);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('Sketch 5', p.width / 2, p.height / 2);
  };
  p.windowResized = function() { p.resizeCanvas(p.windowWidth, p.windowHeight); };
});
