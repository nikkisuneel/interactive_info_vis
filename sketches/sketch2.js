// sketches/sketch2.js
// CLOCK 1: Runner Orbit Clock
// Iteration 2: smooth runner motion with lerp()

let clock1 = function(p) {

  let smoothX;
  let smoothY;

  function drawGradient(baseBright) {
    for (let y = 0; y < p.height; y++) {
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

    // start smoothed position at center
    smoothX = p.width / 2;
    smoothY = p.height / 2;

    console.log("Clock1 setup finished");
  };

  p.draw = function() {
    let h = p.hour();
    let distFromNoon = Math.abs(h - 12);
    let baseBright = p.map(distFromNoon, 0, 12, 200, 30);

    drawGradient(baseBright);

    const cx = p.width / 2;
    const cy = p.height / 2;
    const r = 100;

    // draw track ring
    p.noFill();
    p.stroke(180);
    p.strokeWeight(4);
    p.circle(cx, cy, r * 2);

    // figure out where the "true" runner should be
    const mins = p.minute();
    const secs = p.second();
    const minuteProgress = mins + secs / 60.0;
    const angle = p.map(minuteProgress, 0, 60, 0, 360);

    const targetX = cx + r * p.cos(angle - 90);
    const targetY = cy + r * p.sin(angle - 90);

    // ease smoothX/smoothY toward targetX/targetY
    smoothX = p.lerp(smoothX, targetX, 0.2); // 0.2 smoothing factor
    smoothY = p.lerp(smoothY, targetY, 0.2);

    // draw runner at smoothed position
    const fatigue = p.map(mins, 0, 59, 0, 255);
    p.noStroke();
    p.fill(255, 100, fatigue);
    p.circle(smoothX, smoothY, 16);

    // draw central time
    p.noStroke();
    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);

    let hr = h % 12;
    if (hr === 0) hr = 12;
    const minsLabel = mins < 10 ? "0" + mins : mins;

    p.textSize(32);
    p.text(hr, cx, cy - 5);

    p.textSize(14);
    p.text(":" + minsLabel, cx, cy + 18);

    p.textSize(10);
    p.fill(230);
    p.text("Runner Orbit Clock (smooth motion)", cx, p.height - 12);
  };
};

new p5(clock1);
