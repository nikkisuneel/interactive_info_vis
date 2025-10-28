// Global registry used by sketch files to register instance-mode factories
window._sketchRegistry = window._sketchRegistry || {};
window._sketchInstances = window._sketchInstances || {};
window._sketchScriptsLoaded = window._sketchScriptsLoaded || {};

window.registerSketch = function (id, factory) {
    window._sketchRegistry[id] = factory;
};

// map sketch ids to script paths
const SKETCH_SCRIPT_BY_ID = {
    sk1: 'sketch1.js',
    sk2: 'sketch2.js',
    sk3: 'sketch3.js',
    sk4: 'sketch4.js',
    sk5: 'sketch5.js',
    sk6: 'sketch6.js',
    sk7: 'sketch7.js',
    sk8: 'sketch8.js',
    sk9: 'sketch9.js',
    sk10: 'sketch10.js',
    sk11: 'sketch11.js',
    sk12: 'sketch12.js',
};

function loadSketchScriptIfNeeded(sketchId) {
    return new Promise((resolve, reject) => {
        // if (window._sketchScriptsLoaded[sketchId]) return resolve();
        const src = SKETCH_SCRIPT_BY_ID[sketchId];
        if (!src) return reject(new Error('No script configured for ' + sketchId));
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => { window._sketchScriptsLoaded[sketchId] = true; resolve(); };
        s.onerror = () => reject(new Error('Failed to load ' + src));
        document.body.appendChild(s);
    });
}

function createOrShowSketch(sketchId) {
    const container = document.getElementById('sketch-container-' + sketchId);
    // hide other canvases
    Object.keys(window._sketchInstances).forEach(id => {
        const inst = window._sketchInstances[id];
        if (inst && inst.canvas) inst.canvas.style.display = (id === sketchId) ? '' : 'none';
    });

    if (window._sketchInstances[sketchId]) {
        const inst = window._sketchInstances[sketchId];
        if (inst && inst.canvas && container) container.appendChild(inst.canvas);
        if (inst && inst.canvas) inst.canvas.style.display = '';
        return;
    }

    const factory = window._sketchRegistry[sketchId];
    if (!factory) return; // sketch will register itself when its script loads

    const p5inst = new p5(factory, container);
    window._sketchInstances[sketchId] = p5inst;
}

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    buttons.forEach(btn => {
        btn.addEventListener('click', async () => {
            buttons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
            contents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            const target = document.getElementById(btn.dataset.target);
            if (target) target.classList.add('active');

            const sketchId = btn.dataset.sketch;
            if (sketchId) {
                try {
                    await loadSketchScriptIfNeeded(sketchId);
                    // if the sketch file registered a factory, create it; if not, wait a tick
                    if (window._sketchRegistry[sketchId]) createOrShowSketch(sketchId);
                    else setTimeout(() => { if (window._sketchRegistry[sketchId]) createOrShowSketch(sketchId); }, 50);
                } catch (err) { console.error(err); }
            } else {
                Object.values(window._sketchInstances).forEach(inst => { if (inst && inst.canvas) inst.canvas.style.display = 'none'; });
            }

            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center' // Scroll until the div is centered in the viewport
                });
            } else {
                console.warn("Target div not found!");
            }
        });
    });

    // kick off first tab (lazy load its sketch)
    const first = document.querySelector('.tab-btn');
    if (first) first.click();
});