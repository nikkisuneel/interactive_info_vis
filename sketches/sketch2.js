// sketches/sketch2.js
// CLOCK 1: Runner Orbit Clock
// Iteration 4: color-pulsing track ring based on seconds()

// Instance-mode sketch for tab 2
registerSketch('sk2', function(p) {

  let smoothX;
  let smoothY;

  let beepOsc;
  let lastMinute = -1;

  function drawGradient(baseBright) {
    for (let y = 0; y < p.height; y++) {
      let shade = p.map(y, 0, p.height, baseBright - 30, baseBright + 30);
      shade = p.constrain(shade, 0, 255);
      p.stroke(shade);
      p.line(0, y, p.width, y);
    }
  }

  function playBeep() {
    beepOsc.freq(880);
    beepOsc.amp(0.2, 0.01);
    beepOsc.amp(0.0, 0.2);
  }

  p.setup = function() {
    console.log("Clock1 setup starting");

    p.createCanvas(300, 300);

    p.angleMode(p.DEGREES);
    p.textFont("sans-serif");

    smoothX = p.width / 2;
    smoothY = p.height / 2;

    beepOsc = new p5.Oscillator('sine');
    beepOsc.start();
    beepOsc.amp(0);

    console.log("Clock1 setup finished");
  };

  p.draw = function() {
    let h = p.hour();
    let mins = p.minute();
    let secs = p.second();

    // minute rollover → beep
    if (mins !== lastMinute) {
      if (lastMinute !== -1) {
        playBeep();
      }
      lastMinute = mins;
    }

    // gradient background from hour
    let distFromNoon = Math.abs(h - 12);
    let baseBright = p.map(distFromNoon, 0, 12, 200, 30);
    drawGradient(baseBright);

    const cx = p.width / 2;
    const cy = p.height / 2;
    const r = 100;

    // TRACK RING with hue mapped to seconds
    p.colorMode(p.HSB);
    let ringHue = p.map(secs, 0, 59, 0, 360);
    p.noFill();
    p.stroke(ringHue, 80, 90);
    p.strokeWeight(4);
    p.circle(cx, cy, r * 2);
    p.colorMode(p.RGB); // switch back to RGB for rest

    // runner target on the ring
    const minuteProgress = mins + secs / 60.0;
    const angle = p.map(minuteProgress, 0, 60, 0, 360);
    const targetX = cx + r * p.cos(angle - 90);
    const targetY = cy + r * p.sin(angle - 90);

    // smooth pursue
    smoothX = p.lerp(smoothX, targetX, 0.2);
    smoothY = p.lerp(smoothY, targetY, 0.2);

    // runner color = fatigue (minutes deeper into the hour -> hotter color)
    const fatigue = p.map(mins, 0, 59, 0, 255);
    p.noStroke();
    p.fill(255, 100, fatigue);
    p.circle(smoothX, smoothY, 16);

    // text overlay in center
    p.noStroke();
    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);

    let hr12 = h % 12;
    if (hr12 === 0) hr12 = 12;
    const minsLabel = mins < 10 ? "0" + mins : mins;

    p.textSize(32);
    p.text(hr12, cx, cy - 5);

    p.textSize(14);
    p.text(":" + minsLabel, cx, cy + 18);

    // label
    p.textSize(10);
    p.fill(230);
    p.text("Runner Orbit Clock (color pulse + chime + smooth)", cx, p.height - 12);
  };
  // p.windowResized = function () { p.resizeCanvas(p.windowWidth, p.windowHeight); };


});

// new p5(clock1);

