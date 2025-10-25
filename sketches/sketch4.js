// CLOCK 3: Route Progress Clock
// Iteration 1: Add glowing checkpoints (milestones)
// Peer feedback: "I want to know when I've hit like halfway."

let clock3 = function(p) {

  // Route polyline around ~300x300
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
    {x: 50,  y: 250}
  ];

  let segLengths = [];
  let totalLen = 0;

  // checkpoints at 25%, 50%, 75% of the loop
  let checkpointsFrac = [0.25, 0.5, 0.75];

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

  // Given a distance along the path, return an {x,y} position on the route
  function pointAtDistance(distAlong) {
    let remaining = distAlong;
    for (let i = 0; i < routePts.length - 1; i++) {
      let segLen = segLengths[i];
      let x1 = routePts[i].x;
      let y1 = routePts[i].y;
      let x2 = routePts[i+1].x;
      let y2 = routePts[i+1].y;

      if (remaining > segLen) {
        remaining -= segLen;
      } else {
        let t = remaining / segLen; // 0..1
        return {
          x: p.lerp(x1, x2, t),
          y: p.lerp(y1, y2, t)
        };
      }
    }
    // fallback to last point
    return {
      x: routePts[routePts.length - 1].x,
      y: routePts[routePts.length - 1].y
    };
  }

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
        p.vertex(x2, y2);
        remaining -= segLen;
      } else {
        let t = remaining / segLen;
        let xt = p.lerp(x1, x2, t);
        let yt = p.lerp(y1, y2, t);
        p.vertex(xt, yt);
        break;
      }
    }

    p.endShape();
  }

  // drawn milestone dots along the loop.
  // If we've progressed past that point in the hour, it lights up
  function drawCheckpoints(currentDist) {
    for (let frac of checkpointsFrac) {
      let checkpointDist = frac * totalLen;
      let pt = pointAtDistance(checkpointDist);

      let reached = currentDist >= checkpointDist;

      if (reached) {
        // bright = hit this milestone already
        p.noStroke();
        p.fill(0, 255, 180);
        p.circle(pt.x, pt.y, 12);
      } else {
        // dim = not yet reached
        p.noStroke();
        p.fill(120);
        p.circle(pt.x, pt.y, 8);
      }
    }
  }

  p.setup = function() {
    const container = p.select('#clock3-container');
    const c = p.createCanvas(300, 300);
    c.parent(container);

    p.textFont("sans-serif");
    p.textAlign(p.CENTER, p.CENTER);

    computeLengths();
  };

  p.draw = function() {
    p.background(15); //dark background

    let hr = p.hour();
    let mn = p.minute();
    let sc = p.second();

    // map current time to distance along route
    let minuteProgress = mn + sc / 60.0;   // 0..59.999
    let hourFrac = minuteProgress / 60.0;  // 0..~1
    let distAlong = hourFrac * totalLen;   // pixels along loop

    //draw full loop
    drawFullRoute();

    // draw traveled portion
    drawProgressRoute(distAlong);

    // draw checkpoint markers
    drawCheckpoints(distAlong);

    // digital time at top
    p.fill(255);
    p.textSize(14);
    p.text(
      p.nf(hr % 12 || 12, 2) + ":" + p.nf(mn, 2) + ":" + p.nf(sc, 2),
      p.width / 2,
      20
    );

    // caption
    p.textSize(10);
    p.fill(180);
    p.text(
      "Route Progress Clock\nGlow dots = milestones passed this hour",
      p.width/2,
      p.height - 30
    );
  };

};

new p5(clock3);
