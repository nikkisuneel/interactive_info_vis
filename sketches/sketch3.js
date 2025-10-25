// CLOCK 2: Pace Bar Clock
// Iteration 2: interactive lane change on click
// Feedback: "When I run intervals I tap my watch to mark a rep. Can I do that here?"

let clock2 = function(p) {

  let laneToggle = 0; // 0 or 1 to shift bar vertically

  p.setup = function() {
    const container = p.select('#clock2-container');
    const c = p.createCanvas(300, 200);
    c.parent(container);

    p.textAlign(p.CENTER, p.CENTER);
    p.textFont("sans-serif");
    p.colorMode(p.HSB);
  };

  p.draw = function() {
    p.colorMode(p.RGB);
    p.background(10, 30, 60);

    let hr = p.hour();
    let mn = p.minute();
    let sc = p.second();

    // How much of this minute is done
    let progress = (sc / 60.0);
    let barWidth = progress * (p.width - 40);

    // Breathing pulse (effort)
    let t = p.millis() / 300.0;
    let pulse = (p.sin(t) + 1) / 2;

    let barHeight = p.map(pulse, 0, 1, 14, 26);

    // base vertical center
    let baseY = p.height/2 - barHeight/2;

    // if laneToggle == 1, nudge the bar upward a bit 
    // feels like: "mark that rep mentally"
    let laneShift = laneToggle === 1 ? -20 : 0;
    let barY = baseY + laneShift;

    p.colorMode(p.HSB);
    let baseHue = 190;
    let bright = p.map(pulse, 0, 1, 60, 100);
    p.noStroke();
    p.fill(baseHue, 80, bright);
    p.rect(20, barY, barWidth, barHeight, 5);

    p.colorMode(p.RGB);

    // readable clock time
    p.fill(255);
    p.textSize(16);
    p.text(
      p.nf(hr, 2) + ":" + p.nf(mn, 2) + ":" + p.nf(sc, 2),
      p.width/2,
      p.height/2 - 40
    );

    // instructions and annotation
    p.textSize(10);
    p.fill(200);
    p.text(
      "Filling = this minute\nPulse = effort\nClick = new lap / lane change",
      p.width/2,
      p.height/2 + 40
    );
  };

  // clicking to toggle lane
  p.mousePressed = function() {
    laneToggle = (laneToggle === 0) ? 1 : 0;
  };
};

new p5(clock2);
