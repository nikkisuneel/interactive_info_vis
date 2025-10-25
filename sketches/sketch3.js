// sketches/sketch3.js
// CLOCK 2: Pace Bar Clock (Iteration 1: breathing pulse)
// Feedback: "It looks static. Can it feel like a body working?"
// Change: bar now gently pulses in size and brightness to mimic heart rate.

let clock2 = function(p) {

  p.setup = function() {
    const container = p.select('#clock2-container');
    const c = p.createCanvas(300, 200);
    c.parent(container);

    p.textAlign(p.CENTER, p.CENTER);
    p.textFont("sans-serif");
    p.colorMode(p.HSB); // we'll use hue/sat/bright for easier pulsing
  };

  p.draw = function() {
    // background stays deep blue/black to keep focus on the bar
    p.colorMode(p.RGB);
    p.background(10, 30, 60);

    let hr = p.hour();
    let mn = p.minute();
    let sc = p.second();

    // progress across current minute
    let progress = (sc / 60.0);
    let barWidth = progress * (p.width - 40);

    // heartbeat-like pulse using millis()
    let t = p.millis() / 300.0; // adjust 300 for faster/slower pulse
    let pulse = (p.sin(t) + 1) / 2; // 0→1

    // map that pulse into bar height and brightness
    let barHeight = p.map(pulse, 0, 1, 14, 26); // throb between 14px and 26px tall
    let barY = p.height/2 - barHeight/2;

    // brighter when "pulse" peaks
    p.colorMode(p.HSB);
    let baseHue = 190; // teal-ish
    let bright = p.map(pulse, 0, 1, 60, 100); // brightness wiggle
    p.noStroke();
    p.fill(baseHue, 80, bright);
    p.rect(20, barY, barWidth, barHeight, 5);

    // switch back to RGB for text for predictable white
    p.colorMode(p.RGB);

    // digital time above bar
    p.fill(255);
    p.textSize(16);
    p.text(
      p.nf(hr, 2) + ":" + p.nf(mn, 2) + ":" + p.nf(sc, 2),
      p.width/2,
      p.height/2 - 35
    );

    // annotation below bar
    p.textSize(10);
    p.fill(200);
    p.text(
      "Filling bar = progress this minute\nPulse = effort / heartbeat",
      p.width/2,
      p.height/2 + 35
    );
  };
};

new p5(clock2);
