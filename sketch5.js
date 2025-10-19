// simple instance-mode sketch for tab 5
function setup() {
  createCanvas(windowWidth, windowHeight);
}
function draw() {
  background(220);
  fill(100, 150, 240);
  textSize(32);
  textAlign(CENTER, CENTER);
  text('Sketch 5', width / 2, height / 2);
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
