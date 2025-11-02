// sketches/sketch5.js — INFO 474 HW5: Aroma Plume Poster (p5 instance-mode)
(function () {
  function factory(p) {

    const IG_W = 1080, IG_H = 1350;


    const M = { l: 80, r: 80, t: 70, b: 120 };
    const lanes = ["80-85", "86-90", "91-95", "96+"]; // columns
    const laneX = {};

    // Fonts from google fonts
    let titleFont = "Libre Baskerville";
    let uiFont = "Inter";

    // Colors
    const COL = {
      bgTop:  p.color(252, 249, 246),
      bgMid:  p.color(248, 240, 228),
      bgBot:  p.color(242, 230, 212),
      ink:    p.color(36, 32, 28),
      mute:   p.color(90, 82, 76),
      plume:  {
        fruit:   p.color(184, 52, 73, 38),   // rosy
        aroma:   p.color(214, 120, 66, 38),  // amber
        texture: p.color(150, 104, 67, 38),  // toffee
        acidity: p.color(46, 140, 150, 38),  // teal
        emotion: p.color(205, 164, 57, 38)   // gold
      },
      dots:   {
        fruit:   p.color(184, 52, 73),
        aroma:   p.color(214, 120, 66),
        texture: p.color(150, 104, 67),
        acidity: p.color(46, 140, 150),
        emotion: p.color(205, 164, 57)
      }
    };

    let legendItems;
    let data = null;              // JSON from assets/wine_words.json (if present)
    let particles = [];         

/*
    const FALLBACK = {
      "tiers":[
        {"tier":"80-85","words":[
          {"word":"bright","freq":0.0020,"category":"acidity","quote":"A bright, simple wine with citrusy snap."},
          {"word":"fruity","freq":0.0018,"category":"fruit","quote":"Lively and fruity with lemon and apple notes."},
          {"word":"crisp","freq":0.0015,"category":"acidity","quote":"Crisp palate, easy weeknight pour."},
          {"word":"apple","freq":0.0013,"category":"fruit","quote":"Green-apple flavors lead the palate."},
          {"word":"fresh","freq":0.0012,"category":"acidity","quote":"Fresh and light-bodied."}
        ]},
        {"tier":"86-90","words":[
          {"word":"cherry","freq":0.0022,"category":"fruit","quote":"Red-cherry core with a zesty finish."},
          {"word":"citrus","freq":0.0019,"category":"fruit","quote":"Citrus peel and saline lift."},
          {"word":"floral","freq":0.0015,"category":"floral","quote":"Floral tones frame the fruit."},
          {"word":"spice","freq":0.0014,"category":"aroma","quote":"Hint of baking spice on the midpalate."},
          {"word":"zesty","freq":0.0013,"category":"acidity","quote":"Zesty acidity keeps it lively."}
        ]},
        {"tier":"91-95","words":[
          {"word":"velvety","freq":0.0024,"category":"texture","quote":"Velvety tannins wrap ripe blackberries."},
          {"word":"layered","freq":0.0022,"category":"emotion","quote":"Layered and energetic, with depth."},
          {"word":"plum","freq":0.0018,"category":"fruit","quote":"Plum and cocoa accents."},
          {"word":"polished","freq":0.0017,"category":"texture","quote":"Polished texture, long finish."},
          {"word":"complex","freq":0.0016,"category":"emotion","quote":"Complex yet balanced."}
        ]},
        {"tier":"96+","words":[
          {"word":"elegant","freq":0.0030,"category":"emotion","quote":"Utterly elegant; a wine of poise."},
          {"word":"balanced","freq":0.0027,"category":"emotion","quote":"Perfectly balanced, seamless."},
          {"word":"silky","freq":0.0025,"category":"texture","quote":"Silky from start to finish."},
          {"word":"graceful","freq":0.0018,"category":"emotion","quote":"Graceful and precise."},
          {"word":"violet","freq":0.0016,"category":"floral","quote":"Violet and spice perfume the nose."}
        ]}
      ]
    };
*/
    p.preload = function () {
  
      try {
        data = p.loadJSON("assets/wine_words.json");
      } catch (e) {
        data = null;
      }
    };

    p.setup = function () {
      const c = p.createCanvas(IG_W, IG_H);
      c.elt.style.borderRadius = "16px";
      p.textFont(uiFont);

      // lane x-positions across width
      const gap = (p.width - (M.l + M.r)) / (lanes.length - 1);
      lanes.forEach((t, i) => laneX[t] = M.l + i * gap);

      legendItems = [
        ["fruit",   COL.dots.fruit],
        ["aroma",   COL.dots.aroma],
        ["texture", COL.dots.texture],
        ["acidity", COL.dots.acidity],
        ["emotion", COL.dots.emotion]
      ];


      buildParticles((data && data.tiers) ? data : FALLBACK);
    };

    // Build & placement
    function buildParticles(json) {
      particles = [];
      const order = {"80-85":0,"86-90":1,"91-95":2,"96+":3};


      const tiers = [...json.tiers].sort((a,b)=> order[a.tier]-order[b.tier]);

      tiers.forEach(tierObj => {
        const words = tierObj.words.slice(0, 12); // cap to avoid clutter
        words.forEach((w, i) => {
          particles.push(makeWord(w, tierObj.tier, i));
        });
      });
    }

    function makeWord(w, tier, idx) {
      const maxF = maxFreqAcrossTiers();
      const size = p.map(w.freq || 0.001, 0, maxF, 16, 52, true);
      const colKey = w.category || "emotion";
      const col = COL.dots[colKey] || p.color(120);
      const alpha = p.map(w.freq || 0.001, 0, maxF, 160, 255, true);

      // initial y stagger per tier; higher tiers sit higher
      let y = tierStartY(tier) - idx * 42 + p.random(-6, 6);
      let x = laneCurveX(tier, y);

      // nudge to avoid overlapping previously placed labels
      let tries = 0;
      while (collides(x, y, size) && tries < 80) {
        y -= 10;
        x = laneCurveX(tier, y);
        tries++;
      }

      return { word: w.word, quote: w.quote || "", x, y, size, col, alpha, tier, colKey };
    }

    function maxFreqAcrossTiers() {
      let m = 0.01;
      const src = (data && data.tiers) ? data : FALLBACK;
      src.tiers.forEach(t => t.words.forEach(w => { if ((w.freq || 0) > m) m = w.freq; }));
      return m;
    }

    // Wider spread higher up (so plumes open)
    function laneCurveX(tier, y) {
      const x = laneX[tier];
      const ymin = tierStartY("80-85");       // lowest band start
      const ymax = M.t + 200;                 // upper clamp where plumes narrow
      const t = p.constrain((y - ymax) / (ymin - ymax), 0, 1);
      const spread = p.lerp(40, 180, t);      // widen with height
      return x + p.random(-spread, spread);
    }

    function collides(x, y, s) {
      // compare with words already added to particles
      const halfH = s * 0.55;
      for (const pt of particles) {
        const w = p.textWidth(pt.word);
        const hw = w / 2, hh = pt.size * 0.55;
        if (Math.abs(x - pt.x) < (hw + p.textWidth("M") * 0.6) &&
            Math.abs(y - pt.y) < (halfH + hh)) return true;
      }
      return false;
    }

    // Vertical anchors for tiers
    function tierStartY(t) {
      // from bottom to top
      const map = {
        "80-85": IG_H - 260,
        "86-90": IG_H - 470,
        "91-95": IG_H - 710,
        "96+":   IG_H - 910
      };
      return map[t] || (IG_H - 260);
    }

    // Draw loop
    p.draw = function () {
      drawBackground();
      drawTitle();
      drawLegend();

      // Soft plumes (one per lane) behind words
      lanes.forEach(t => {
        const cat = dominantCategoryForTier(t) || "emotion";
        drawPlume(t, cat);
      });

      // Words
      particles.forEach(pt => {
        p.fill(p.red(pt.col), p.green(pt.col), p.blue(pt.col), pt.alpha);
        p.noStroke();
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(pt.size);
        p.text(pt.word, pt.x, pt.y);
      });

      // One concise annotation
      annotate("Vocabulary becomes more emotional and textural as quality rises.", p.width * 0.46, tierStartY("91-95") + 8);

      drawGlass();
      drawFooter();

      // Hover tooltip
      const hit = hitWord(p.mouseX, p.mouseY);
      if (hit) drawTooltip(hit);
    };

    // Background and frame
    function drawBackground() {
      for (let y = 0; y < p.height; y++) {
        const t = y / p.height;
        const c = p.lerpColor(
          p.lerpColor(COL.bgTop, COL.bgMid, t * 1.2),
          COL.bgBot,
          Math.max(0, t - 0.2)
        );
        p.stroke(c); p.line(0, y, p.width, y);
      }
      drawVignette();
    }

    function drawVignette() {
      p.noFill();
      for (let r = 0; r < 80; r++) {
        const a = p.map(r, 0, 79, 0, 90);
        p.stroke(0, a * 0.3);
        p.rect(M.l - r, M.t - r, p.width - (M.l + M.r) + 2 * r, p.height - (M.t + M.b) + 2 * r, 24);
      }
    }

    // Wine glass
    function drawGlass() {
      p.push();
      const cx = p.width / 2, baseY = p.height - 90;
      p.translate(cx, baseY);
      p.noFill(); p.stroke(140); p.strokeWeight(2);

      // bowl
      p.beginShape();
      p.curveVertex(-110, 0); p.curveVertex(-110, 0);
      p.curveVertex(-60, -120); p.curveVertex(-38, -190);
      p.curveVertex(38, -190);  p.curveVertex(60, -120);
      p.curveVertex(110, 0);    p.curveVertex(110, 0);
      p.endShape();

      // stem + rim
      p.line(0, -190, 0, -250);
      p.arc(0, -250, 110, 36, p.PI, 0);

      // soft base shadow
      p.fill(0, 20); p.noStroke();
      p.rect(-80, 6, 160, 6, 6);
      p.pop();
    }

    // Plumes
    function drawPlume(tier, cat) {
      const x = laneX[tier];
      const y0 = tierStartY("80-85") + 40;   // near glass
      const y3 = tierStartY(tier) - 260;     // top for this lane
      const wBase = 160, wTop = 420;         // width envelope
      const c = COL.plume[cat] || p.color(120, 30);

      p.noStroke(); p.fill(c);
      p.beginShape();
      // left edge
      p.curveVertex(x, y0);
      p.curveVertex(x - wBase / 2, y0);
      p.curveVertex(x - wTop / 2, y3);
      p.curveVertex(x, y3 - 80);
      // right edge (reverse)
      p.curveVertex(x + wTop / 2, y3);
      p.curveVertex(x + wBase / 2, y0);
      p.curveVertex(x, y0);
      p.endShape(p.CLOSE);
    }

    function dominantCategoryForTier(tier) {
      const group = particles.filter(pt => pt.tier === tier);
      const byCat = {};
      group.forEach(pt => byCat[pt.colKey] = (byCat[pt.colKey] || 0) + pt.size);
      let best = null, bestV = -1;
      for (const k in byCat) {
        if (byCat[k] > bestV) { bestV = byCat[k]; best = k; }
      }
      return best;
    }

    // Title, legend, fotoer
    function drawTitle() {
      p.fill(COL.ink);
      p.textAlign(p.LEFT, p.TOP);

      p.textFont(titleFont); p.textSize(44);
      p.text("The Language of Excellence", M.l, M.t);

      p.textFont(uiFont); p.fill(COL.mute); p.textSize(20);
      p.text("Words drift upward, mirroring sensory refinement.", M.l, M.t + 48);
    }

    function drawLegend() {
      let x = p.width - M.r - 160, y = M.t + 6;
      p.textSize(18); p.fill(COL.ink); p.text("Legend", x, y);
      y += 6;
      legendItems.forEach(([label, col]) => {
        y += 22;
        p.fill(col); p.noStroke(); p.circle(x, y, 10);
        p.fill(COL.mute); p.textAlign(p.LEFT, p.CENTER);
        p.textSize(16); p.text(label, x + 14, y + 1);
      });
    }

    function drawFooter() {
      p.fill(COL.mute); p.textAlign(p.LEFT, p.BOTTOM); p.textSize(14);
      p.text("80–85          86–90          91–95          96+", M.l, p.height - 24);
      p.textAlign(p.RIGHT, p.BOTTOM);
      p.text("Dataset: Wine Enthusiast (≈130k reviews). Size = normalized frequency per tier. Colors = semantic category. Includes all wine types.", p.width - M.r, p.height - 24);
    }

    // Annotation
    function annotate(text, cx, cy) {
      const boxW = 420, boxH = 56;
      const x = p.constrain(cx - boxW / 2, M.l, p.width - M.r - boxW);
      const y = p.constrain(cy, M.t + 120, p.height - 260);
      p.noStroke(); p.fill(255, 220);
      p.rect(x, y, boxW, boxH, 10);
      p.fill(COL.ink); p.textAlign(p.LEFT, p.CENTER); p.textSize(16);
      p.text(text, x + 12, y + boxH / 2, boxW - 24, boxH - 12);
    }

    function hitWord(mx, my) {
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        p.textSize(pt.size);
        const w = p.textWidth(pt.word), h = pt.size * 0.9;
        if (mx > pt.x - w / 2 && mx < pt.x + w / 2 &&
            my > pt.y - h / 2 && my < pt.y + h / 2) return pt;
      }
      return null;
    }

    function drawTooltip(pt) {
      const boxW = 560, boxH = 150;
      let x = p.constrain(p.mouseX + 18, 40, p.width - boxW - 40);
      let y = p.constrain(p.mouseY + 18, 40, p.height - boxH - 40);
      p.fill(255); p.stroke(210); p.rect(x, y, boxW, boxH, 10);
      p.noStroke(); p.fill(COL.ink); p.textAlign(p.LEFT, p.TOP);
      p.textSize(22); p.text(pt.word, x + 16, y + 12);
      p.textSize(14); p.fill(COL.mute);
      const q = (pt.quote && pt.quote.length > 0) ? pt.quote : "No sample available.";
      p.text(q.slice(0, 250) + (q.length > 250 ? "…" : ""), x + 16, y + 44, boxW - 32, boxH - 56);
    }
  }


  window.registerSketch('sk5', factory);
})();
