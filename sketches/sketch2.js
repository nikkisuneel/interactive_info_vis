// sketches/sketch2.js
// CLOCK 1: Runner Orbit Clock (Iteration 1: gradient background by hour)

let clock1 = function(p) {

  // helper: draw vertical gradient using hour()
  function drawGradient(baseBright) {
    for (let y = 0; y < p.height; y++) {
      // vary brightness down the canvas
      let shade = p.map(y, 0, p.height, baseBright - 30, baseBright + 30);
      shade = p.constrain(shade, 0, 255);
      p.stroke(shade);
      p.line(0, y, p.width, y);
    }
  }

  p.setup = function() {
    console.log("Clock1 setup starting");

    const container = p.select("#clock1-container");
    console.log("clock1-container selected:", container);

    const c = p.createCanvas(300, 300);
    c.parent(container);

    p.angleMode(p.DEGREES);
    p.textFont("sans-serif");
    console.log("Clock1 setup finished");
  };

  p.draw = function() {
    let h = p.hour(); // 0-23

    // create a "daylight" brightness
    // 12 (noon) -> brightest, midnight -> darker
    let distFromNoon = Math.abs(h - 12); // 0 at noon, up to 12 at midnight
    let baseBright = p.map(distFromNoon, 0, 12, 200, 30);

    // draw background gradient
    drawGradient(baseBright);

    // center/track geometry
    const cx = p.width / 2;
    const cy = p.height / 2;
    const r = 100;

    // track ring
    p.noFill();
    p.stroke(180);
    p.strokeWeight(4);
    p.circle(cx, cy, r * 2);

    // time → angle around track
    const mins = p.minute();
    const secs = p.second();
    const minuteProgress = mins + secs / 60.0;
    const angle = p.map(minuteProgress, 0, 60, 0, 360);

    // runner position
    const runnerX = cx + r * p.cos(angle - 90);
    const runnerY = cy + r * p.sin(angle - 90);

    // runner color (fatigue goes up as minutes increase)
    const fatigue = p.map(mins, 0, 59, 0, 255);
    p.noStroke();
    p.fill(255, 100, fatigue);
    p.circle(runnerX, runnerY, 16);

    // draw hour + minutes in the middle
    p.noStroke();
    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);

    let hr = h % 12;
    if (hr === 0) hr = 12;

    p.textSize(32);
    p.text(hr, cx, cy - 5);

    p.textSize(14);
    const minsLabel = mins < 10 ? "0" + mins : mins;
    p.text(":" + minsLabel, cx, cy + 18);

    // label
    p.textSize(10);
    p.fill(230);
    p.text("Runner Orbit Clock (gradient bg)", cx, p.height - 12);
  };
};

new p5(clock1);
