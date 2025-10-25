// CLOCK 2: Pace Bar Clock (Base)
// - The bar fills across the screen within each minute.
// - Current time displayed above.


let clock2 = function(p) {

  p.setup = function() {
    const container = p.select('#clock2-container');
    const c = p.createCanvas(300, 200);
    c.parent(container);

    p.textAlign(p.CENTER, p.CENTER);
    p.textFont("sans-serif");
  };

  p.draw = function() {
    p.background(10, 30, 60); // dark blue vibe (night run)

    let hr = p.hour();
    let mn = p.minute();
    let sc = p.second();

    // 0 sec -> 0% full, 59 sec -> almost 100% full
    let progress = (sc / 60.0); // 0 to ~1
    let barWidth = progress * (p.width - 40); 

    // Draw the "pace bar"
    p.noStroke();
    p.fill(0, 200, 255);
    p.rect(20, p.height/2 - 10, barWidth, 20, 5);

    // Time readout above
    p.fill(255);
    p.textSize(16);
    p.text(
      p.nf(hr, 2) + ":" + p.nf(mn, 2) + ":" + p.nf(sc, 2),
      p.width/2,
      p.height/2 - 30
    );

    // Annotation 
    p.textSize(10);
    p.fill(200);
    p.text(
      "This minute's effort (fills across)",
      p.width/2,
      p.height/2 + 30
    );
  };
};

new p5(clock2);
