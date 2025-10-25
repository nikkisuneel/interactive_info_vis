// sketches/sketch2.js
// CLOCK 1: Runner Orbit Clock
// Iteration 3: add per-minute chime (audio cue when a new minute starts)

let clock1 = function(p) {

  let smoothX;
  let smoothY;

  // sound state
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

  // play a short beep
  function playBeep() {
    // set frequency + quick amp envelope
    beepOsc.freq(880);
    beepOsc.amp(0.2, 0.01);   // ramp up quick
    beepOsc.amp(0.0, 0.2);    // fade out over 0.2s
  }

  p.setup = function() {
    console.log("Clock1 setup starting");

    const container = p.select("#clock1-container");
    console.log("clock1-container selected:", container);

    const c = p.createCanvas(300, 300);
    c.parent(container);

    p.angleMode(p.DEGREES);
    p.textFont("sans-serif");

    smoothX = p.width / 2;
    smoothY = p.height / 2;

    // setup oscillator
    beepOsc = new p5.Oscillator('sine');
    beepOsc.start();
    beepOsc.amp(0); // start silent so browser doesn't complain

    console.log("Clock1 setup finished");
  };

  p.draw = function() {
    let h = p.hour();
    let mins = p.minute();
    let secs = p.second();

    // detect minute rollover
    if (mins !== lastMinute) {
      if (lastMinute !== -1) {
        playBeep();
      }
      lastMinute = mins;
    }

    // background gradient based on hour
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

    // target runner position (true)
    const minuteProgress = mins + secs / 60.0;
    const angle = p.map(minuteProgress, 0, 60, 0, 360);
    const targetX = cx + r * p.cos(angle - 90);
    const targetY = cy + r * p.sin(angle - 90);

    // smoothly approach target
    smoothX = p.lerp(smoothX, targetX, 0.2);
    smoothY = p.lerp(smoothY, targetY, 0.2);

    // runner color (fatigue)
    const fatigue = p.map(mins, 0, 59, 0, 255);
    p.noStroke();
    p.fill(255, 100, fatigue);
    p.circle(smoothX, smoothY, 16);

    // center text
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
    p.text("Runner Orbit Clock (minute chime)", cx, p.height - 12);
  };
};

new p5(clock1);
