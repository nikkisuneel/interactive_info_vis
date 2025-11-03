// sketches/sketch5.js — HW5: Best-Value Wines (p5 instance-mode)
(function(){
  function factory(p){
    const W=1080,H=1350,M={l:100,r:120,t:110,b:140};
    let data=null, pts=[];
    const underrated = new Set(["Portugal","Chile","Argentina"]);
    const premium = new Set(["France","United States"]);

    const PALETTE = {
      "Europe": p=>p.color(150, 45, 80),
      "North America": p=>p.color(40, 120, 200),
      "South America": p=>p.color(220, 120, 60),
      "Oceania": p=>p.color(120, 160, 80),
      "Africa": p=>p.color(120, 90, 60),
      "Asia": p=>p.color(140, 90, 180),
      "Other": p=>p.color(120)
    };

    let fonts = { title:"Libre Baskerville", ui:"Inter" };

    // axes scales
    let xMin=0, xMax=200;     // price axis cap
    let yMin=80, yMax=100;    // rating axis
    let sMin=6,  sMax=64;     // bubble pixel radius

    // sweet-spot thresholds (you can tweak)
    const SWEET_PRICE = 20;   // <= $20
    const SWEET_POINTS = 90;  // >= 90 pts

    p.preload = function(){
      try { data = p.loadJSON("assets/country_value.json"); } catch(e){ data=null; }
    };

    p.setup = function(){
      const c = p.createCanvas(W,H);
      c.elt.style.borderRadius = "16px";
      p.textFont("Inter");
      prepare();
    };

    function prepare(){
      const rows = (data && data.rows) ? data.rows : [];
      pts = rows.map(r=>{
        // map fields
        const price  = clamp(r.avg_price, 0, xMax);
        const points = clamp(r.avg_points, yMin, yMax);
        const count  = r.count || 1;
        const cont   = r.continent || "Other";
        return {
          country: r.country,
          continent: cont,
          x: price,
          y: points,
          count: count
        };
      });
    }

    function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }

    // scales
    function x2px(x){ return p.map(x, xMin, xMax, M.l, W-M.r); }
    function y2px(y){ return p.map(y, yMin, yMax, H-M.b, M.t); } // higher points = higher on canvas
    function r2px(n){
      // sqrt scale for area ~ count
      const nMin = 50, nMax = Math.max(60, Math.max(...pts.map(d=>d.count)));
      return p.map(Math.sqrt(n), Math.sqrt(nMin), Math.sqrt(nMax), sMin, sMax, true);
    }

    p.draw = function(){
      drawBackground();
      drawTitle();
      drawAxes();
      drawSweetSpot();

      // draw bubbles (larger first? smaller first? We'll draw larger last so they sit on top)
      pts.slice().sort((a,b)=>a.count-b.count).forEach(d=>{
        const cx = x2px(d.x);
        const cy = y2px(d.y);
        const r  = r2px(d.count);
        const col = (PALETTE[d.continent]||PALETTE.Other)(p);

        // halo for annotated groups
        if (underrated.has(d.country) || premium.has(d.country)){
          p.noFill();
          p.stroke(0,40);
          p.strokeWeight(6);
          p.circle(cx, cy, (r+8)*2);
        }

        p.noStroke();
        p.fill(p.red(col), p.green(col), p.blue(col), 200);
        p.circle(cx, cy, r*2);
      });

      // labels for a few countries (adjust as you like)
      labelCountry("Portugal");
      labelCountry("Chile");
      labelCountry("Argentina");
      labelCountry("France");
      labelCountry("United States");

      drawLegend();
      drawCaption();

      // tooltip
      const hit = pick(p.mouseX, p.mouseY);
      if (hit) drawTooltip(hit);
    };

    function drawBackground(){
      // soft vertical gradient
      for(let y=0;y<H;y++){
        const t = y/H;
        const c = p.lerpColor(p.color(252,249,246), p.color(242,232,220), t);
        p.stroke(c); p.line(0,y,W,y);
      }
      // vignette
      p.noFill();
      for (let r=0;r<60;r++){
        p.stroke(0, p.map(r,0,59,0,60));
        p.rect(M.l- r, M.t- r, W-(M.l+M.r)+2*r, H-(M.t+M.b)+2*r, 20);
      }
    }

    function drawTitle(){
      p.fill(30); p.textAlign(p.LEFT, p.TOP);
      p.textFont("Libre Baskerville"); p.textSize(40);
      p.text("Price Isn’t Everything", M.l, 40);
      p.textFont("Inter"); p.fill(90); p.textSize(22);
      p.text("Where in the world you’ll find high ratings without high prices", M.l, 40+44);
    }

    function drawAxes(){
      p.stroke(160); p.strokeWeight(1); p.noFill();
      // x-axis
      p.line(M.l, H-M.b, W-M.r, H-M.b);
      // y-axis
      p.line(M.l, H-M.b, M.l, M.t);

      p.textFont("Inter"); p.fill(70); p.noStroke(); p.textSize(16);
      // x ticks
      const xTicks = [0,10,20,40,80,120,160,200];
      xTicks.forEach(v=>{
        const x = x2px(v);
        p.stroke(220); p.line(x, H-M.b, x, M.t);
        p.noStroke(); p.fill(70); p.textAlign(p.CENTER, p.TOP);
        p.text("$"+v, x, H-M.b+8);
      });

      // y ticks
      const yTicks = [80,84,88,90,92,94,96,98,100];
      yTicks.forEach(v=>{
        const y = y2px(v);
        p.stroke(230); p.line(M.l, y, W-M.r, y);
        p.noStroke(); p.fill(70); p.textAlign(p.RIGHT, p.CENTER);
        p.text(v, M.l-8, y);
      });

      // axis labels
      p.fill(50); p.textSize(18);
      p.textAlign(p.CENTER, p.TOP);
      p.text("Average Price (USD)", (M.l+W-M.r)/2, H-M.b+40);
      p.push();
      p.translate(M.l-56, (M.t+H-M.b)/2);
      p.rotate(-p.HALF_PI);
      p.text("Average Rating (Wine Enthusiast points)", 0, 0);
      p.pop();
    }

    function drawSweetSpot(){
      // highlight top-left region: points >= SWEET_POINTS and price <= SWEET_PRICE
      const x1 = x2px(xMin), x2 = x2px(SWEET_PRICE);
      const y1 = y2px(yMax), y2 = y2px(SWEET_POINTS);
      p.noStroke();
      p.fill(60, 180, 120, 30);
      p.rect(x1, y1, x2-x1, y2-y1, 8);

      // caption
      p.fill(40); p.textSize(16); p.textAlign(p.LEFT, p.TOP);
      p.text("Sweet spot: high rating, low price", x1+8, y1+8);
    }

    function labelCountry(name){
      const d = pts.find(o=>o.country===name);
      if (!d) return;
      const cx=x2px(d.x), cy=y2px(d.y), r=r2px(d.count);
      p.fill(255); p.stroke(0,40);
      const pad=6;
      const tx=cx + (underrated.has(name)? (r+12): -(r+12));
      const ty=cy - r - 6;
      const label = name + " (" + d.continent + ")";
      p.strokeWeight(2);
      p.line(cx, cy, tx, ty+10);
      p.noStroke(); p.fill(30); p.textFont("Inter"); p.textSize(16);
      p.textAlign(underrated.has(name)? p.LEFT : p.RIGHT, p.BOTTOM);
      p.text(label, tx, ty);
    }

    function drawLegend(){
      const x = W - M.r + 10, y0 = M.t + 10;
      p.textFont("Inter"); p.textSize(16); p.fill(30); p.textAlign(p.LEFT, p.TOP);
      p.text("Continent", x, y0);
      let y = y0 + 8;
      Object.keys(PALETTE).forEach(key=>{
        y += 22;
        const col = PALETTE[key](p);
        p.fill(col); p.noStroke(); p.circle(x+8, y, 10);
        p.fill(70); p.textAlign(p.LEFT, p.CENTER); p.textSize(14);
        p.text(key, x+20, y);
      });

      // size legend
      y += 28; p.fill(30); p.textSize(16); p.text("Sample size", x, y);
      const sizes=[60,300,1000]; y+=6;
      sizes.forEach((n,i)=>{
        y += 26;
        p.noStroke(); p.fill(120,120);
        p.circle(x+10, y, r2px(n)*2);
        p.fill(70); p.textSize(12); p.textAlign(p.LEFT, p.CENTER);
        p.text(n+" reviews", x+28, y);
      });
    }

    function drawCaption(){
      p.textFont("Inter"); p.fill(70); p.textSize(14);
      p.textAlign(p.LEFT, p.BOTTOM);
      p.text("Dataset: Wine Enthusiast (≈130k). Countries with ≥50 reviews. Price capped at $200 for legibility.", M.l, H-20);
      p.textAlign(p.RIGHT, p.BOTTOM);
      p.text("Takeaway: You don’t need to spend $80 for a 92-point bottle—look to Portugal, Chile, Argentina.", W-M.r, H-20);
    }

    function pick(mx,my){
      // return topmost bubble under mouse
      for (let i=pts.length-1;i>=0;i--){
        const d=pts[i];
        const cx=x2px(d.x), cy=y2px(d.y), r=r2px(d.count);
        if ((mx-cx)*(mx-cx)+(my-cy)*(my-cy) <= r*r) return d;
      }
      return null;
    }

    function drawTooltip(d){
      const col = (PALETTE[d.continent]||PALETTE.Other)(p);
      const lines = [
        d.country,
        "Continent: " + d.continent,
        "Avg price: $" + d.x.toFixed(2),
        "Avg rating: " + d.y.toFixed(1) + " pts",
        "Reviews: " + d.count
      ];
      const w = 280, h = 120;
      let x = p.constrain(p.mouseX+16, M.l, W-M.r-w);
      let y = p.constrain(p.mouseY+16, M.t, H-M.b-h);
      p.fill(255); p.stroke(210); p.rect(x, y, w, h, 10);
      p.noStroke(); p.fill(30); p.textFont("Inter"); p.textSize(18);
      p.textAlign(p.LEFT, p.TOP);
      p.text(lines[0], x+12, y+10);
      p.textSize(13); p.fill(80);
      p.text(lines.slice(1).join("\n"), x+12, y+38);
      p.fill(col); p.noStroke(); p.circle(x+w-18, y+18, 10);
    }
  }
  window.registerSketch('sk5', factory);
})();
