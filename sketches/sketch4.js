// CLOCK 3: Route Progress Clock (Base Version)
// Idea: A run loop around a neighborhood. The bright segment shows
// how far through the current hour you are.
//
// This clock encodes time as physical distance covered.

let clock3 = function(p) {

  // Hand drawn route
  let routePts = [
    {x: 50,  y: 250},
    {x: 80,  y: 200},
    {x: 120, y: 180},
    {x: 180, y: 160},
    {x: 220, y: 110},
    {x: 260, y: 80},
    {x: 240, y: 40},
    {x: 180, y: 50},
    {x: 120, y: 80},
    {x: 90,  y: 130},
    {x: 60,  y: 190},
    {x: 50,  y: 250} // back to start (loop closed)
  ];

  let segLengths = [];
  let totalLen = 0;

  // Compute length of each segment and total loop length
  function computeLengths() {
    segLengths = [];
    totalLen = 0;
    for (let i = 0; i < routePts.length - 1; i++) {
      let dx = routePts[i+1].x - routePts[i].x;
      let dy = routePts[i+1].y - routePts[i].y;
      let d = Math.sqrt(dx*dx + dy*dy);
      segLengths.push(d);
      totalLen += d;
    }
  }

  // Draw the entire loop in gray
  function drawFullRoute() {
    p.stroke(80);
    p.strokeWeight(4);
    p.noFill();
    p.beginShape();
    for (let pt of routePts) {
      p.vertex(pt.x, pt.y);
    }
    p.endShape();
  }

  // Drawing only the "completed" distance in a bright color.
  // distAlong = how far we've "run" so far this hour, in pixels along the route.
  function drawProgressRoute(distAlong) {
    p.stroke(0, 255, 180); 
    p.strokeWeight(5);
    p.noFill();

    let remaining = distAlong;

    p.beginShape();
    p.vertex(routePts[0].x, routePts[0].y);

    for (let i = 0; i < routePts.length - 1; i++) {
      let segLen = segLengths[i];
      let x1 = routePts[i].x;
      let y1 = routePts[i].y;
      let x2 = routePts[i+1].x;
      let y2 = routePts[i+1].y;

      if (remaining >= segLen) {
        // We still have enough distance budget to draw entire segment
        p.vertex(x2, y2);
        remaining -= segLen;
      } else {
        // We run out mid-segment. draw a partial segment
        let t = remaining / segLen; // 0..1 along this segment
        let xt = p.lerp(x1, x2, t);
        let yt = p.lerp(y1, y2, t);
        p.vertex(xt, yt);
        break;
      }
    }

    p.endShape();
  }

  p.setup = function() {
    const container = p.select('#clock3-container');
    const c = p.createCanvas(300, 300);
    c.parent(container);

    p.textFont("sans-serif");
    p.textAlign(p.CENTER, p.CENTER);

    computeLengths(); // prep segment lengths
  };

  p.draw = function() {
    p.background(15); // dark background

    // TIME MAPPING
    // How far through the current hour are we
    // 0.0 at :00, about 1.0 at :59
    let hr = p.hour();
    let mn = p.minute();
    let sc = p.second();

    let minuteProgress = mn + sc / 60.0; // 0..59.999
    let hourFrac = minuteProgress / 60.0; // 0..~1
    let distAlong = hourFrac * totalLen;  // how far to draw

    // draw the full loop in gray
    drawFullRoute();

    // draw the "distance covered this hour"
    drawProgressRoute(distAlong);

    // text labels
    // digital time at top for readability
    p.fill(255);
    p.textSize(14);
    p.text(
      p.nf(hr % 12 || 12, 2) + ":" + p.nf(mn, 2) + ":" + p.nf(sc, 2),
      p.width / 2,
      20
    );

    // context at bottom
    p.textSize(10);
    p.fill(180);
    p.text(
      "Route Progress Clock\nBright path = how far into this hour you are",
      p.width/2,
      p.height - 30
    );
  };

};

new p5(clock3);
