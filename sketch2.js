// simple instance-mode sketch for tab 2
registerSketch('sk2', function(p) {
  p.setup = function() {
    p.createCanvas(p.windowWidth, p.windowHeight);
  };
  p.draw = function() {
    p.background(220);
    p.fill(100, 150, 240);
    p.textSize(32);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('Sketch 2', p.width / 2, p.height / 2);
  };
  p.windowResized = function() { p.resizeCanvas(p.windowWidth, p.windowHeight); };
});
