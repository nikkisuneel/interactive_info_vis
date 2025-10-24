// sketches/sketch2.js
// CLOCK 1: Runner Orbit Clock (minute = angle, hour in center)

let clock1 = function(p) {

  p.setup = function() {
    console.log("Clock1 setup starting");

    // Grab the container div
    const container = p.select("#clock1-container");
    console.log("clock1-container selected:", container);

    // Create canvas and attach to that div
    const c = p.createCanvas(300, 300);
    c.parent(container);

    p.angleMode(p.DEGREES);
    p.textFont("sans-serif");
    console.log("Clock1 setup finished");
  };

  p.draw = function() {
    // background shifts slightly with hour
    let h = p.hour(); // 0-23
    let bg = p.map(h, 0, 23, 20, 60);
    p.background(bg);

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

    // runner position on track
    const runnerX = cx + r * p.cos(angle - 90);
    const runnerY = cy + r * p.sin(angle - 90);

    // runner color = more "fatigued" (hotter) late in the hour
    const fatigue = p.map(mins, 0, 59, 0, 255);
    p.noStroke();
    p.fill(255, 100, fatigue);
    p.circle(runnerX, runnerY, 16);

    // draw hour + minutes in the middle
    p.noStroke();
    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);

    // convert 24h → 12h
    let hr = h % 12;
    if (hr === 0) hr = 12;

    p.textSize(32);
    p.text(hr, cx, cy - 5);

    p.textSize(14);
    const minsLabel = mins < 10 ? "0" + mins : mins;
    p.text(":" + minsLabel, cx, cy + 18);

    // label
    p.textSize(10);
    p.fill(200);
    p.text("Runner Orbit Clock", cx, p.height - 12);
  };

};

// actually create the instance
new p5(clock1);
