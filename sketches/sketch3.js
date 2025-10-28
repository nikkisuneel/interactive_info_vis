// CLOCK 2: Pace Bar Clock
// Interactive: click to mark a lap (increments counter + nudges bar/lane)

let clock2 = function(p) {

  let laneToggle = 0;  // 0 or 1, shifts bar up when you "mark" a lap
  let lapCount = 0;    // how many times you've clicked (like intervals)

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

    // bar width
    let progress = sc / 60.0;
    let maxBarWidth = (p.width - 40);   
    let barWidth = progress * maxBarWidth;

    // pulse height
    let t = p.millis() / 300.0;
    let pulse = (p.sin(t) + 1) / 2;   
    let barHeight = p.map(pulse, 0, 1, 14, 26);

    // base vertical center
    let baseY = p.height/2 + 10; 

    // lane change: if laneToggle == 1, nudge upward ~20px
    let laneShift = (laneToggle === 1) ? -20 : 0;
    let barY = baseY + laneShift;

    // drawing the bar
    p.colorMode(p.HSB);
    let baseHue = 190; 
    let bright = p.map(pulse, 0, 1, 60, 100); 
    p.noStroke();
    p.fill(baseHue, 80, bright);
    p.rect(
      20,               
      barY,            
      barWidth,          
      barHeight,        
      5                 
    );

    // switch back for text
    p.colorMode(p.RGB);
    p.fill(255);

    // digital time
    p.textSize(16);
    p.text(
      p.nf(hr, 2) + ":" + p.nf(mn, 2) + ":" + p.nf(sc, 2),
      p.width / 2,
      40
    );

    // lap counter
    p.textSize(12);
    p.fill(255, 240, 150); 
    p.text(
      "Laps: " + lapCount,
      p.width / 2,
      60
    );

    // instructions
    p.textSize(10);
    p.fill(200);
    p.text(
      "Filling = this minute\nPulse = effort\nClick = new lap / lane change",
      p.width / 2,
      p.height - 30
    );
  };

  // click inside canvas
  p.mousePressed = function() {
    // toggle lane state
    laneToggle = (laneToggle === 0) ? 1 : 0;
    // increment lap counter
    lapCount += 1;
  };
};

new p5(clock2);
