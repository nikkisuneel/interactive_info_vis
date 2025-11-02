// sketches/sketch5.js  — INFO 474 HW5: Aroma Plume (instance-mode)
(function () {
  function factory(p) {
    const IG_W = 1080, IG_H = 1350;
    const lanes = ["80-85","86-90","91-95","96+"];
    const laneX = {};
    let data = null, particles = [];
    let titleFont = "Georgia";
    let legendItems = [
      ["fruit", p.color(150, 0, 40)],
      ["floral", p.color(110, 70, 160)],
      ["texture", p.color(120, 70, 30)],
      ["acidity", p.color(30, 130, 150)],
      ["emotion", p.color(190, 140, 20)]
    ];

    // --- fallback demo data (replace once JSON loads) ---
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
          {"word":"spice","freq":0.0014,"category":"texture","quote":"Hint of baking spice on the midpalate."},
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

    p.preload = function(){
      // try to load your real JSON; fallback if it fails (e.g., before you add the file)
      try {
        data = p.loadJSON("assets/wine_words.json");
      } catch (e) { data = null; }
    };

    p.setup = function(){
      const c = p.createCanvas(IG_W, IG_H);
      c.elt.style.borderRadius = "12px";
      p.textFont(titleFont);

      // lane positions (even across width)
      const margin = 80, gap = (p.width - 2*margin) / (lanes.length - 1);
      lanes.forEach((t,i)=> laneX[t] = margin + i*gap);

      // parse data or use fallback
      const src = (data && data.tiers) ? data : FALLBACK;
      buildParticles(src);

      // accessibility: large canvas background to off-white
      p.background(252,249,246);
    };

    function buildParticles(json){
      particles = [];
      // cap ~12 words per tier to avoid clutter
      json.tiers.forEach(tierObj => {
        const words = tierObj.words.slice(0, 12);
        words.forEach((w, i) => {
          particles.push(makeWord(w, tierObj.tier, i));
        });
      });
    }

    function makeWord(w, tier, idx){
      const baseX = laneX[tier] + p.random(-26,26);
      const baseY = tierY(tier) - idx*34 + p.random(-8,8);
      const maxF = maxFreqAcrossTiers();
      const size = p.map(w.freq || 0.001, 0, maxF, 16, 46, true);
      const col = categoryColor(w.category);
      const alpha = p.map(w.freq || 0.001, 0, maxF, 150, 255, true);
      return {word:w.word, quote:w.quote||"", x:baseX, y:baseY, size, col, alpha, tier};
    }

    function maxFreqAcrossTiers(){
      let m = 0.01;
      const src = (data && data.tiers) ? data : FALLBACK;
      src.tiers.forEach(t => t.words.forEach(w => { if (w.freq>m) m=w.freq; }));
      return m;
    }

    p.draw = function(){
      p.background(252,249,246);

      drawTitle();
      drawLegend();
      drawGlass();

      // horizontal tier guides + labels
      p.stroke(230); p.strokeWeight(1);
      lanes.forEach(t=>{
        const y = tierY(t);
        p.line(60, y, p.width-60, y);
        p.noStroke(); p.fill(110); p.textAlign(p.RIGHT, p.CENTER);
        p.textSize(18); p.text(t, 52, y);
      });

      // plume words
      particles.forEach(pt => {
        p.fill(p.red(pt.col), p.green(pt.col), p.blue(pt.col), pt.alpha);
        p.noStroke();
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(pt.size);
        p.text(pt.word, pt.x, pt.y);
      });

      // annotations (keep 2–3 only)
      annotate("‘silky’, ‘balanced’, ‘elegant’ dominate exceptional (96+) wines", laneX["96+"], tierY("96+")-160);
      annotate("language shifts from concrete → emotional as quality rises", p.width/2, tierY("91-95")+20);

      // footnote
      p.fill(90); p.textAlign(p.LEFT, p.TOP); p.textSize(14);
      p.text("Dataset: Wine Enthusiast (≈130k reviews). Size = normalized frequency per tier. Colors = semantic category. Includes all wine types.", 60, p.height-80, p.width-120, 70);

      // hover tooltip
      const hit = hitWord(p.mouseX, p.mouseY);
      if (hit) drawTooltip(hit);
    };

    function tierY(t){
      // bottom to top spacing
      const order = {"80-85": 1080, "86-90": 880, "91-95": 650, "96+": 440};
      return order[t] || 1080;
    }

    function drawTitle(){
      p.fill(30); p.textAlign(p.LEFT, p.TOP);
      p.textSize(42); p.text("The Language of Excellence", 60, 48);
      p.fill(90); p.textSize(22);
      p.text("Adjectives that appear more often in higher-rated wine reviews", 60, 96);
    }

    function drawLegend(){
      let x = 60, y = 136;
      p.textSize(18); p.fill(60); p.text("Legend", x, y);
      y += 10;
      legendItems.forEach(([label,col])=>{
        y += 22;
        p.fill(col); p.circle(x+10, y, 10);
        p.fill(70); p.noStroke(); p.textAlign(p.LEFT, p.CENTER);
        p.text(label, x+24, y+1);
      });
    }

    function drawGlass(){
      p.push();
      p.translate(p.width/2, 1180);
      p.noFill(); p.stroke(160); p.strokeWeight(2);
      p.beginShape();
      p.curveVertex(-120, 0); p.curveVertex(-120, 0);
      p.curveVertex(-60, -60); p.curveVertex(-40, -140);
      p.curveVertex(40, -140); p.curveVertex(60, -60);
      p.curveVertex(120, 0); p.curveVertex(120, 0);
      p.endShape();
      p.line(0, -140, 0, -220);
      p.arc(0, -220, 120, 40, p.PI, 0);
      p.pop();
    }

    function annotate(text, cx, cy){
      p.push();
      const boxW = 420, boxH = 64;
      const x = p.constrain(cx - boxW/2, 60, p.width - 60 - boxW);
      const y = p.constrain(cy, 220, p.height - 220);
      p.noStroke(); p.fill(255, 230);
      p.rect(x, y, boxW, boxH, 10);
      p.fill(30); p.textAlign(p.LEFT, p.CENTER); p.textSize(16);
      p.text(text, x+12, y+boxH/2, boxW-24, boxH-12);
      p.pop();
    }

    function categoryColor(cat){
      for (const [label, col] of legendItems) if (label===cat) return col;
      return p.color(120);
    }

    function hitWord(mx,my){
      // check from top to bottom for proper z-index feeling
      for (let i = particles.length-1; i >= 0; i--){
        const pt = particles[i];
        p.textSize(pt.size);
        const w = p.textWidth(pt.word), h = pt.size*0.9;
        if (mx > pt.x - w/2 && mx < pt.x + w/2 && my > pt.y - h/2 && my < pt.y + h/2) return pt;
      }
      return null;
    }

    function drawTooltip(pt){
      const boxW = 560, boxH = 150;
      let x = p.constrain(p.mouseX + 18, 40, p.width - boxW - 40);
      let y = p.constrain(p.mouseY + 18, 40, p.height - boxH - 40);
      p.fill(255); p.stroke(210); p.rect(x, y, boxW, boxH, 10);
      p.noStroke(); p.fill(20); p.textAlign(p.LEFT, p.TOP);
      p.textSize(22); p.text(pt.word, x+16, y+12);
      p.textSize(14); p.fill(80);
      const quote = (pt.quote && pt.quote.length>0) ? pt.quote : "No sample available";
      p.text(quote.slice(0, 250) + (quote.length>250 ? "…" : ""), x+16, y+44, boxW-32, boxH-56);
    }
  }

  // register with the class loader
  window.registerSketch('sk5', factory);
})();
