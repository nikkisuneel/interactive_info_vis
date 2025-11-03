// sketches/sketch5.js — HW5: Best-Value Wines (clean layout)
(function () {
  function factory(p) {
    // Canvas & layout
    const W = 1080, H = 1350;
    const SIDEBAR_W = 220;               // reserved legend panel (right)
    const M = { l: 110, r: SIDEBAR_W + 24, t: 120, b: 150 };

    // Data containers
    let raw = null;
    let pts = [];

    // Encoding
    let xMin = 0, xMax = 200; // will be set from percentiles
    let yMin = 80, yMax = 100;
    const sMin = 6, sMax = 64;

    // “Narrative” highlights
    const underrated = new Set(["Portugal", "Chile", "Argentina"]);
    const premium = new Set(["France", "United States"]);

    const PALETTE = {
      "Europe": p => p.color(154, 46, 85),
      "North America": p => p.color(48, 123, 201),
      "South America": p => p.color(226, 131, 59),
      "Oceania": p => p.color(116, 160, 96),
      "Africa": p => p.color(130, 100, 68),
      "Asia": p => p.color(144, 102, 184),
      "Other": p => p.color(130)
    };

    // Sweet spot box thresholds
    const SWEET_PRICE = 20;
    const SWEET_POINTS = 90;

    p.preload = function () {
      try { raw = p.loadJSON("assets/country_value.json"); } catch (e) { raw = null; }
    };

    p.setup = function () {
      const c = p.createCanvas(W, H);
      c.elt.style.borderRadius = "16px";
      p.textFont("Inter");
      prepare();
      computeScales();
    };

    // data util
    function prepare() {
      const rows = (raw && raw.rows) ? raw.rows : [];
      pts = rows.map(r => ({
        country: r.country,
        continent: r.continent || "Other",
        x: clamp(r.avg_price, 0, 1e6),
        y: clamp(r.avg_points, 70, 100),
        n: r.count || 1
      }));
      // basic stability filter
      pts = pts.filter(d => d.n >= 50);
    }

    function quantile(arr, q) {
      if (!arr.length) return NaN;
      const a = arr.slice().sort((x, y) => x - y);
      const pos = (a.length - 1) * q;
      const base = Math.floor(pos);
      const rest = pos - base;
      if (a[base + 1] !== undefined) return a[base] + rest * (a[base + 1] - a[base]);
      return a[base];
    }

    function niceMax(v, step) { return Math.ceil(v / step) * step; }
    function niceMin(v, step) { return Math.floor(v / step) * step; }

    function computeScales() {
      // Use percentiles to avoid outliers squeezing the cloud
      const prices = pts.map(d => d.x);
      const ratings = pts.map(d => d.y);

      const p02 = quantile(prices, 0.02), p97 = quantile(prices, 0.97);
      const r02 = quantile(ratings, 0.02), r98 = quantile(ratings, 0.98);

      xMin = 0;                         // keep price from 0 for narrative
      xMax = niceMax(Math.max(40, p97), 20);   // round up to a nice tick (20s)
      xMax = Math.min(xMax, 200);              // hard cap for axis label

      yMin = niceMin(Math.min(86, r02 - 0.5), 1);   // most wines are 86–92ish
      yMax = niceMax(Math.max(92, r98 + 0.5), 1);
      yMin = Math.max(80, yMin);
      yMax = Math.min(100, yMax);
    }

    // Scale
    function x2px(x) { return p.map(x, xMin, xMax, M.l, W - M.r); }
    function y2px(y) { return p.map(y, yMin, yMax, H - M.b, M.t); }
    function r2px(n) {
      const nMin = 50, nMax = Math.max(60, Math.max(...pts.map(d => d.n)));
      return p.map(Math.sqrt(n), Math.sqrt(nMin), Math.sqrt(nMax), sMin, sMax, true);
    }
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

    // Drawing
    p.draw = function () {
      drawBackground();
      drawTitle();
      drawAxes();
      drawSweetSpot();

      // Bubbles: draw small → large so big ones sit on top but remain readable
      pts.slice().sort((a, b) => a.n - b.n).forEach(d => {
        const cx = x2px(clamp(d.x, xMin, xMax));
        const cy = y2px(clamp(d.y, yMin, yMax));
        const r = r2px(d.n);
        const col = (PALETTE[d.continent] || PALETTE.Other)(p);

        // Halo only for highlighted sets
        if (underrated.has(d.country) || premium.has(d.country)) {
          p.noFill(); p.stroke(0, 35); p.strokeWeight(5);
          p.circle(cx, cy, (r + 8) * 2);
        }
        p.noStroke();
        p.fill(p.red(col), p.green(col), p.blue(col), 200);
        p.circle(cx, cy, r * 2);
      });

      // Minimal labels to avoid clutter
      ["Portugal", "Chile", "Argentina", "France", "United States"].forEach(labelCountry);

      drawLegendPanel();
      drawFooter();

      const hit = pick(p.mouseX, p.mouseY);
      if (hit) drawTooltip(hit);
    };

    function drawBackground() {
      // Clean, flat background (no vignette)
      p.background(250, 247, 243);
      // chart panel
      p.noStroke();
      p.fill(255);
      p.rect(M.l - 10, M.t - 10, (W - M.r) - (M.l - 10), (H - M.b) - (M.t - 10), 10);
    }

    function drawTitle() {
      p.fill(30);
      p.textAlign(p.LEFT, p.TOP);
      p.textFont("Libre Baskerville"); p.textSize(44);
      p.text("Price Isn’t Everything", M.l, 36);
      p.textFont("Inter"); p.fill(80); p.textSize(20);
      p.text("Where in the world you’ll find high ratings without high prices", M.l, 36 + 48);
    }

    function drawAxes() {
      // grid
      p.stroke(232); p.strokeWeight(1);
      // vertical grid ticks at nice intervals
      const xTicks = ticksNice(xMin, xMax, 6);   // 6 ticks
      xTicks.forEach(v => p.line(x2px(v), H - M.b, x2px(v), M.t));
      // horizontal grid
      const yTicks = ticksNice(yMin, yMax, 6);
      yTicks.forEach(v => p.line(M.l, y2px(v), W - M.r, y2px(v)));

      // axes
      p.stroke(180);
      p.line(M.l, H - M.b, W - M.r, H - M.b);
      p.line(M.l, H - M.b, M.l, M.t);

      // tick labels
      p.noStroke(); p.fill(70); p.textFont("Inter"); p.textSize(14);
      xTicks.forEach(v => {
        p.textAlign(p.CENTER, p.TOP);
        p.text("$" + v, x2px(v), H - M.b + 8);
      });
      yTicks.forEach(v => {
        p.textAlign(p.RIGHT, p.CENTER);
        p.text(v, M.l - 8, y2px(v));
      });

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

    function ticksNice(min, max, count) {
      // simple nice ticks
      const span = max - min;
      const stepRaw = span / count;
      const pow10 = Math.pow(10, Math.floor(Math.log10(stepRaw)));
      const steps = [1, 2, 2.5, 5, 10].map(s => s * pow10);
      const step = steps.reduce((best, s) =>
        Math.abs(stepRaw - s) < Math.abs(stepRaw - best) ? s : best, steps[0]);
      const start = Math.ceil(min / step) * step;
      const arr = [];
      for (let v = start; v <= max + 1e-6; v += step) arr.push(Math.round(v * 100) / 100);
      if (arr[0] > min) arr.unshift(min);
      return arr;
    }

    function drawSweetSpot() {
      // only render if it sits inside the current domain
      if (SWEET_PRICE <= xMax && SWEET_POINTS <= yMax) {
        const x1 = x2px(xMin), x2 = x2px(Math.min(SWEET_PRICE, xMax));
        const y1 = y2px(yMax), y2 = y2px(Math.max(SWEET_POINTS, yMin));
        p.noStroke();
        p.fill(60, 180, 120, 30);
        p.rect(x1, y1, x2 - x1, y2 - y1, 6);

        p.fill(40); p.textSize(14); p.textAlign(p.LEFT, p.TOP); p.noStroke();
        p.text("Sweet spot: high rating, low price", x1 + 8, y1 + 6);
      }
    }

    function labelCountry(name) {
      const d = pts.find(o => o.country === name);
      if (!d) return;
      const cx = x2px(clamp(d.x, xMin, xMax));
      const cy = y2px(clamp(d.y, yMin, yMax));
      const r = r2px(d.n);
      const side = underrated.has(name) ? 1 : -1; // left/right alternation

      const tx = cx + side * (r + 14);
      const ty = cy - r - 4;

      p.stroke(0, 35); p.strokeWeight(1.5);
      p.line(cx, cy, tx, ty + 10);
      p.noStroke(); p.fill(32); p.textFont("Inter"); p.textSize(14);
      p.textAlign(side > 0 ? p.LEFT : p.RIGHT, p.BOTTOM);
      p.text(`${name} (${d.continent})`, tx, ty + 8);
    }

    function drawLegendPanel() {
      // sidebar box
      const x0 = W - SIDEBAR_W + 12, y0 = M.t - 10, w = SIDEBAR_W - 36, h = (H - M.b) - (M.t - 10);
      p.noStroke(); p.fill(255);
      p.rect(x0, y0, w, h, 10);

      // continent legend
      let y = y0 + 16, x = x0 + 16;
      p.fill(30); p.textFont("Inter"); p.textSize(16); p.textAlign(p.LEFT, p.TOP);
      p.text("Continent", x, y);
      y += 6;

      Object.keys(PALETTE).forEach(key => {
        y += 22;
        const col = PALETTE[key](p);
        p.noStroke(); p.fill(col);
        p.circle(x + 8, y, 10);
        p.fill(70); p.textSize(13); p.textAlign(p.LEFT, p.CENTER);
        p.text(key, x + 22, y);
      });

      // size legend
      y += 28; p.fill(30); p.textSize(16); p.text("Sample size", x, y); y += 6;
      [60, 300, 1000].forEach(n => {
        y += 26;
        p.noStroke(); p.fill(120, 130);
        p.circle(x + 10, y, r2px(n) * 2);
        p.fill(70); p.textSize(12); p.textAlign(p.LEFT, p.CENTER);
        p.text(n + " reviews", x + 28, y);
      });
    }

    function drawFooter() {
      // two clean lines, pinned inside chart width
      p.textFont("Inter"); p.textSize(13); p.fill(85);
      p.textAlign(p.LEFT, p.BOTTOM);
      const left = M.l, right = W - M.r;
      p.text(
        "Dataset: Wine Enthusiast (≈130k). Countries with ≥50 reviews. Price axis uses the 97th percentile for legibility.",
        left, H - 24, right - left, 40
      );
      p.textAlign(p.RIGHT, p.BOTTOM);
      p.text(
        "Takeaway: Look to Portugal, Chile and Argentina for 90+ wines at approachable prices.",
        right, H - 24, right - left, 40
      );
    }

    // hit test
    function pick(mx, my) {
      // ignore sidebar area
      if (mx > W - M.r) return null;
      for (let i = pts.length - 1; i >= 0; i--) {
        const d = pts[i];
        const cx = x2px(clamp(d.x, xMin, xMax));
        const cy = y2px(clamp(d.y, yMin, yMax));
        const r = r2px(d.n);
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
