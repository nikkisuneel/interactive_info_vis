//custom variables for y-coordinate of sun & horizon
let shapeHeight;

let designWidth = 400;
let designHeight = 400;
let horizon;
function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
}

function draw() {

  //shape follows y-coordinate of mouse
  shapeHeight = mouseY;
  currentWidth = mouseX;
  horizon = height / 2;

  //light blue background if the shape is above horizon
  if (shapeHeight < horizon) {
    background("lightblue"); // blue if above horizon

  } else {
    background("grey"); // grey if below horizon
  }

  //sun
  fill("orange");
  ellipse(width / 2, shapeHeight, 100, 100);
  textSize(20);
  fill("black");
  text('Play with the sun!', currentWidth / 2, shapeHeight / 2);

  // draw line for horizon
  fill("sandybrown");
  rect(0, horizon, width, height);

}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  horizon = height / 2; // recalc horizon after resize
}

