// sketches/sketch5.js
(function () {
  function factory(p) {
    // Canvas + layout
    const W = 1080, H = 1350;
    const SIDEBAR_W = 230;                                  // legend panel on the far right
    const M = { l: 110, r: SIDEBAR_W + 28, t: 180, b: 140 };// title padding


    const xMin = 0,  xMax = 55; 
    const yMin = 83, yMax = 92;  

    // sizes
    const sMin = 6, sMax = 64;

    // data
    let raw = null;
    let pts = [];

    // narrative highlights
    const underrated = new Set(["Portugal", "Chile", "Argentina"]);
    const premium    = new Set(["France", "United States"]);

    // colors
    const PALETTE = {
      "Europe":        p => p.color(154, 46, 85),
      "North America": p => p.color(48, 123, 201),
      "South America": p => p.color(226, 131, 59),
      "Oceania":       p => p.color(116, 160, 96),
      "Africa":        p => p.color(130, 100, 68),
      "Asia":          p => p.color(144, 102, 184),
      "Other":         p => p.color(130)
    };

    // sweet spot 
    const SWEET_PRICE  = 32;    // <= $35
    const SWEET_POINTS = 88.5;  // >= 88.5 pts

    p.preload = function () {
      try { raw = p.loadJSON("assets/country_value.json"); } catch (e) { raw = null; }
    };

    p.setup = function () {
      const c = p.createCanvas(W, H);
      c.elt.style.borderRadius = "16px";
      p.textFont("Inter");
      prepare();
    };

    // Data
    function prepare() {
      const rows = (raw && raw.rows) ? raw.rows : [];

      pts = rows
        .filter(r => (r.count || 0) >= 50) 
        .map(r => {
          // continent overrides and variants
          const OVERRIDE = {
            "Romania": "Europe",
            "Bulgaria": "Europe",
            "Moldova": "Europe",
            "Molodova": "Europe", 
            "Croatia": "Europe",
            "Slovenia": "Europe",
            "England": "Europe",
            "US": "North America",
            "U.S.": "North America",
            "United States of America": "North America"
          };
          const country   = r.country;
          let   continent = r.continent || "Other";
          if (OVERRIDE[country]) continent = OVERRIDE[country];
          if (country === "United States") continent = "North America"; // dataset variant

          return {
            country,
            continent,
            x: clamp(r.avg_price,  xMin, xMax * 5),
            y: clamp(r.avg_points, yMin, Math.max(yMax, 100)),
            n: r.count || 1
          };
        });
    }

    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

    // scales
    function x2px(x) { return p.map(x, xMin, xMax, M.l, W - M.r); }
    function y2px(y) { return p.map(y, yMin, yMax, H - M.b, M.t); }
    function r2px(n) {
      const nMin = 50, nMax = Math.max(60, Math.max(...pts.map(d => d.n)));
      return p.map(Math.sqrt(n), Math.sqrt(nMin), Math.sqrt(nMax), sMin, sMax, true);
    }

    // tick helper that respects current bounds
    function ticks(from, to, step) {
      const t = [];
      for (let v = Math.ceil(from / step) * step; v <= to + 1e-6; v += step) {
        t.push(+v.toFixed(10));
      }
      if (t[0] !== from) t.unshift(from);
      if (t[t.length - 1] !== to) t.push(to);
      return t;
    }
    function ticksX() { return ticks(xMin, xMax, 10); } 
    function ticksY() { return ticks(yMin, yMax, 1);  } 

    // drawing
    p.draw = function () {
      drawBackground();
      drawTitle();
      drawAxes();
      drawSweetSpot();

      // bubbles (small to large so large don’t overlap others)
      pts.slice().sort((a, b) => a.n - b.n).forEach(d => {
        const cx  = x2px(clamp(d.x, xMin, xMax));
        const cy  = y2px(clamp(d.y, yMin, yMax));
        const rad = r2px(d.n);
        const col = (PALETTE[d.continent] || PALETTE.Other)(p);

        if (underrated.has(d.country) || premium.has(d.country)) {
          p.noFill(); p.stroke(0, 35); p.strokeWeight(5);
          p.circle(cx, cy, (rad + 8) * 2);
        }
        p.noStroke();
        p.fill(p.red(col), p.green(col), p.blue(col), 200);
        p.circle(cx, cy, rad * 2);
      });

      // concise labels
      ["Portugal", "Chile", "Argentina", "France", "United States"].forEach(labelCountry);

      drawLegendPanel();

      // tooltip
      const hit = pick(p.mouseX, p.mouseY);
      if (hit) drawTooltip(hit);
    };

    function drawBackground() {
      p.background(250, 247, 243);
      // chart panel
      p.noStroke(); p.fill(255);
      p.rect(M.l - 10, M.t - 10, (W - M.r) - (M.l - 10), (H - M.b) - (M.t - 10), 10);
    }

    function drawTitle() {
      p.fill(30);
      p.textAlign(p.LEFT, p.TOP);
      p.textFont("Libre Baskerville"); p.textSize(44);
      p.text("Price Isn’t Everything", M.l, 48);
      p.textFont("Inter"); p.fill(80); p.textSize(20);
      p.text("Where in the world you’ll find high ratings without high prices", M.l, 48 + 48);
      // chart starts at M.t, so nothing overlaps the title.
    }

    function drawAxes() {
      // grid
      p.stroke(232); p.strokeWeight(1);
      ticksX().forEach(v => {
        const x = x2px(v);
        p.line(x, H - M.b, x, M.t);
      });
      ticksY().forEach(v => {
        const y = y2px(v);
        p.line(M.l, y, W - M.r, y);
      });

      // axes
      p.stroke(180);
      p.line(M.l, H - M.b, W - M.r, H - M.b);
      p.line(M.l, H - M.b, M.l, M.t);

      // tick labels
      p.noStroke(); p.fill(70); p.textFont("Inter"); p.textSize(14);
      p.textAlign(p.CENTER, p.TOP);
      ticksX().forEach(v => p.text("$" + v, x2px(v), H - M.b + 8));
      p.textAlign(p.RIGHT, p.CENTER);
      ticksY().forEach(v => p.text(v, M.l - 8, y2px(v)));

      // axis titles
      p.fill(50); p.textSize(16);
      p.textAlign(p.CENTER, p.TOP);
      p.text("Average Price (USD)", (M.l + (W - M.r)) / 2, H - M.b + 36);
      p.push();
      p.translate(M.l - 56, (M.t + (H - M.b)) / 2);
      p.rotate(-p.HALF_PI);
      p.text("Average Rating (Wine Enthusiast points)", 0, 0);
      p.pop();
    }

    function drawSweetSpot() {
      // box in top left of the chart given fixed axes
      const x1 = x2px(xMin), x2 = x2px(Math.min(SWEET_PRICE, xMax));
      const y1 = y2px(yMax), y2 = y2px(Math.max(SWEET_POINTS, yMin));
      p.noStroke();
      p.fill(60, 180, 120, 30);
      p.rect(x1, y1, x2 - x1, y2 - y1, 6);

      p.fill(40); p.textSize(14); p.textAlign(p.LEFT, p.TOP); p.noStroke();
      p.text(`Sweet spot: ≥ ${SWEET_POINTS} pts & ≤ $${SWEET_PRICE}`, x1 + 8, y1 + 6);
    }

    function labelCountry(name) {
      const d = pts.find(o => o.country === name);
      if (!d) return;
      const cx = x2px(clamp(d.x, xMin, xMax));
      const cy = y2px(clamp(d.y, yMin, yMax));
      const r  = r2px(d.n);
      const side = (underrated.has(name) ? 1 : -1);
      const tx = cx + side * (r + 14);
      const ty = cy - r - 4;

      p.stroke(0, 35); p.strokeWeight(1.5);
      p.line(cx, cy, tx, ty + 10);
      p.noStroke(); p.fill(32); p.textFont("Inter"); p.textSize(14);
      p.textAlign(side > 0 ? p.LEFT : p.RIGHT, p.BOTTOM);
      p.text(`${name} (${d.continent})`, tx, ty + 8);
    }

    function drawLegendPanel() {
      // measure content height so box doesn't run to the bottom
      const x0 = W - SIDEBAR_W + 16;
      const w  = SIDEBAR_W - 36;

      // layout constants
      const PAD_T = 14, PAD_B = 16, GAP = 22, LINE = 18;
      let y = 0;

      // pre-compute height
      y += PAD_T;
      y += LINE;                              
      y += Object.keys(PALETTE).length * GAP; 
      y += 12;                               
      y += LINE;                              
      y += 3 * GAP;                         
      y += PAD_B;

      const y0 = M.t - 10; 
      const h  = y;

      // draw box
      p.noStroke(); p.fill(255);
      p.rect(x0, y0, w, h, 10);

      // draw content
      let cy = y0 + PAD_T, cx = x0 + 16;
      p.fill(30); p.textFont("Inter"); p.textSize(16); p.textAlign(p.LEFT, p.TOP);
      p.text("Continent", cx, cy); cy += LINE - 4;

      Object.keys(PALETTE).forEach(key => {
        cy += GAP;
        const col = PALETTE[key](p);
        p.noStroke(); p.fill(col); p.circle(cx + 8, cy, 10);
        p.fill(70); p.textSize(13); p.textAlign(p.LEFT, p.CENTER);
        p.text(key, cx + 22, cy);
      });

      cy += 12; p.fill(30); p.textSize(16); p.textAlign(p.LEFT, p.TOP);
      p.text("Sample size", cx, cy); cy += LINE - 4;

      [60, 300, 1000].forEach(n => {
        cy += GAP;
        p.noStroke(); p.fill(120, 130);
        p.circle(cx + 10, cy, r2px(n) * 2);
        p.fill(70); p.textSize(12); p.textAlign(p.LEFT, p.CENTER);
        p.text(n + " reviews", cx + 28, cy);
      });
    }

    // picking & tooltip
    function pick(mx, my) {
      if (mx > W - M.r) return null; 
      // only consider points inside chart panel
      if (mx < M.l || mx > (W - M.r) || my < M.t || my > (H - M.b)) return null;
      for (let i = pts.length - 1; i >= 0; i--) {
        const d = pts[i];
        const cx = x2px(clamp(d.x, xMin, xMax));
        const cy = y2px(clamp(d.y, yMin, yMax));
        const r  = r2px(d.n);
        if ((mx - cx) ** 2 + (my - cy) ** 2 <= r ** 2) return d;
      }
      return null;
    }

    function drawTooltip(d) {
      const col = (PALETTE[d.continent] || PALETTE.Other)(p);
      const lines = [
        d.country,
        "Continent: " + d.continent,
        "Avg price: $" + d.x.toFixed(2),
        "Avg rating: " + d.y.toFixed(1) + " pts",
        "Reviews: " + d.n
      ];
      const w = 280, h = 120;
      let x = p.constrain(p.mouseX + 16, M.l, (W - M.r) - w);
      let y = p.constrain(p.mouseY + 16, M.t, (H - M.b) - h);
      p.fill(255); p.stroke(210); p.rect(x, y, w, h, 10);
      p.noStroke(); p.fill(30); p.textFont("Inter");
      p.textSize(18); p.textAlign(p.LEFT, p.TOP);
      p.text(lines[0], x + 12, y + 10);
      p.textSize(13); p.fill(80);
      p.text(lines.slice(1).join("\n"), x + 12, y + 38);
      p.fill(col); p.noStroke(); p.circle(x + w - 18, y + 18, 10);
    }
  }

  window.registerSketch('sk5', factory);
})();
