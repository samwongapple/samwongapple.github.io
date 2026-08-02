/*
 * projected-ensemble.js — deep thermalization of matchgate circuits, live,
 * for the blog post "Measuring Free Fermions: Gaussian In, Gaussian Out"
 * (matchgate series, Post 3).
 *
 * Physics (all computed live, nothing canned):
 *   1. A random brickwork matchgate circuit on n = 10 qubits acts on the
 *      vacuum covariance matrix as a product of plane rotations
 *      (XX: plane (2j+1, 2j+2) by 2a; YY: plane (2j, 2j+3) by -2b;
 *      Z: plane (2j, 2j+1) by 2t) — the series' verified convention.
 *   2. Each "shot" measures qubits 2..n-1 in the computational basis by the
 *      chain rule: outcome s = +-1 drawn with p_s = (1 - s*G[a][b])/2, then
 *      the exact Gaussian conditioning update
 *        G'_cd = G_cd + (G_ca G_bd - G_cb G_ad)/(G_ab - s),
 *      measured pair pinned and decoupled. (Formula verified against
 *      statevector simulation.)
 *   3. The conditional state of A = qubits {0,1} is pure Gaussian; the
 *      observable m = <i g1 g2> = G[0][1] is histogrammed over shots.
 *      Overlays: the Gaussian-Haar-ensemble prediction (m uniform on
 *      [-1,1], flat line — Archimedes on SO(4)/U(2) = S^2) and the
 *      two-qubit Haar prediction P(m) = (3/4)(1 - m^2) (parabola).
 *   4. W1 readout: Wasserstein-1 distance between the empirical
 *      distribution and the flat GHE, from the binned CDFs.
 *
 * By default every shot uses a FRESH random circuit: at n = 10 a single
 * circuit's ensemble mean fluctuates by ~1/sqrt(2n) (the deep-thermalization
 * statement is a large-n one), so circuit-averaging is what makes the GHE
 * visible at widget scale. The "freeze circuit" toggle pins one circuit and
 * honestly exposes that finite-size offset instead of hiding it.
 *
 * Vanilla JS, no dependencies, theme-aware via the site's CSS variables.
 * Usage: createProjectedEnsemble(el, { n: 10, depth: 16 })
 */
(function (global) {
  "use strict";

  var BINS = 40;

  function rotPlane(G, p, q, th) {
    var c = Math.cos(th), s = Math.sin(th), m = G.length, k, a, b;
    for (k = 0; k < m; k++) { a = G[p][k]; b = G[q][k]; G[p][k] = c * a + s * b; G[q][k] = -s * a + c * b; }
    for (k = 0; k < m; k++) { a = G[k][p]; b = G[k][q]; G[k][p] = c * a + s * b; G[k][q] = -s * a + c * b; }
  }
  function vacuumGamma(n) {
    var m = 2 * n, G = [];
    for (var i = 0; i < m; i++) G.push(new Array(m).fill(0));
    for (var j = 0; j < n; j++) { G[2 * j][2 * j + 1] = -1; G[2 * j + 1][2 * j] = 1; }
    return G;
  }
  function mulberry(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Output covariance matrix of a depth-d random brickwork matchgate circuit.
  function circuitGamma(n, depth, seed) {
    var G = vacuumGamma(n), r = mulberry(seed);
    for (var l = 0; l < depth; l++) {
      for (var j = l % 2; j < n - 1; j += 2) {
        var a = r() * Math.PI, b = r() * Math.PI;
        rotPlane(G, 2 * j + 1, 2 * j + 2, 2 * a);
        rotPlane(G, 2 * j, 2 * j + 3, -2 * b);
      }
      for (j = 0; j < n; j++) rotPlane(G, 2 * j, 2 * j + 1, 2 * r() * Math.PI);
    }
    return G;
  }

  // One shot: measure qubits 2..n-1 of a copy of Gout; return m = G[0][1].
  function sampleShot(Gout, n) {
    var m = 2 * n;
    var G = new Array(m);
    for (var i = 0; i < m; i++) G[i] = Gout[i].slice();
    var alive = new Array(m).fill(true);
    for (var j = 2; j < n; j++) {
      var a = 2 * j, b = 2 * j + 1;
      var g = G[a][b];
      var s = Math.random() < (1 - g) / 2 ? 1 : -1;
      var denom = g - s;
      // snapshot the measured pair's columns
      var colA = new Array(m), colB = new Array(m);
      for (i = 0; i < m; i++) { colA[i] = G[i][a]; colB[i] = G[i][b]; }
      for (var c = 0; c < m; c++) {
        if (!alive[c] || c === a || c === b) continue;
        for (var d = c + 1; d < m; d++) {
          if (!alive[d] || d === a || d === b) continue;
          var corr = (colB[c] * colA[d] - colA[c] * colB[d]) / denom;
          G[c][d] += corr;
          G[d][c] -= corr;
        }
      }
      for (i = 0; i < m; i++) { G[a][i] = G[i][a] = G[b][i] = G[i][b] = 0; }
      G[a][b] = -s; G[b][a] = s;
      alive[a] = alive[b] = false;
    }
    return G[0][1];
  }

  // Wasserstein-1 distance to uniform[-1,1] from binned counts.
  function w1ToUniform(hist, total) {
    if (total === 0) return NaN;
    var w = 0, cdfE = 0, cdfU = 0, dx = 2 / BINS;
    for (var i = 0; i < BINS; i++) {
      cdfE += hist[i] / total;
      cdfU += 1 / BINS;
      w += Math.abs(cdfE - cdfU) * dx;
    }
    return w;
  }

  function theme() {
    var cs = getComputedStyle(document.documentElement);
    function v(nm, f) { return (cs.getPropertyValue(nm) || f).trim() || f; }
    var dark = (document.documentElement.getAttribute("data-theme") || "") === "dark";
    return {
      text: v("--global-text-color", "#333"),
      accent: v("--global-theme-color", "#1fb2a6"),
      divider: v("--global-divider-color", "#ccc"),
      dark: dark,
      dim: dark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)",
      faint: dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.09)",
      alert: dark ? "#e0a63a" : "#b3760a",
    };
  }

  function createProjectedEnsemble(container, opts) {
    if (!container) throw new Error("createProjectedEnsemble: container required");
    opts = opts || {};
    var n = opts.n || 10;
    var depth = opts.depth || 16;
    var seed = 12345;

    var W = 640, H = 320, PADL = 46, PADR = 14, PADT = 30, PADB = 40;

    var canvas = document.createElement("canvas");
    canvas.style.cssText = "width:100%;max-width:" + W + "px;height:auto;display:block;margin:0 auto;";
    var ctx = canvas.getContext("2d");
    (function resize() {
      var dp = Math.max(1, global.devicePixelRatio || 1);
      canvas.width = W * dp;
      canvas.height = H * dp;
      ctx.setTransform(dp, 0, 0, dp, 0, 0);
    })();
    container.appendChild(canvas);

    var readout = document.createElement("div");
    readout.style.cssText = "display:flex;gap:1.6rem;justify-content:center;margin-top:0.55rem;font-size:0.92rem;flex-wrap:wrap;font-variant-numeric:tabular-nums;";
    container.appendChild(readout);

    var controls = document.createElement("div");
    controls.style.cssText = "display:flex;gap:1rem;align-items:center;justify-content:center;margin-top:0.55rem;font-size:0.9rem;flex-wrap:wrap;";
    var lab = document.createElement("label");
    lab.style.cssText = "display:flex;align-items:center;gap:0.45rem;";
    lab.appendChild(document.createTextNode("circuit depth"));
    var dSlider = document.createElement("input");
    dSlider.type = "range"; dSlider.min = "1"; dSlider.max = "24"; dSlider.step = "1"; dSlider.value = String(depth);
    dSlider.setAttribute("aria-label", "circuit depth");
    var dVal = document.createElement("span");
    dVal.style.minWidth = "1.8em";
    lab.appendChild(dSlider); lab.appendChild(dVal);
    var runBtn = document.createElement("button");
    runBtn.type = "button"; runBtn.textContent = "▶ sample";
    runBtn.style.cssText = "min-width:6.6em;cursor:pointer;";
    var newBtn = document.createElement("button");
    newBtn.type = "button"; newBtn.textContent = "⟳ new circuit";
    newBtn.style.cssText = "cursor:pointer;";
    var resetBtn = document.createElement("button");
    resetBtn.type = "button"; resetBtn.textContent = "↺ clear shots";
    resetBtn.style.cssText = "cursor:pointer;";
    var freezeLab = document.createElement("label");
    freezeLab.style.cssText = "display:flex;align-items:center;gap:0.35rem;cursor:pointer;";
    var freezeBox = document.createElement("input");
    freezeBox.type = "checkbox";
    freezeLab.appendChild(freezeBox);
    freezeLab.appendChild(document.createTextNode("freeze circuit"));
    controls.appendChild(lab); controls.appendChild(runBtn);
    controls.appendChild(freezeLab);
    controls.appendChild(newBtn); controls.appendChild(resetBtn);
    container.appendChild(controls);

    var note = document.createElement("p");
    note.style.cssText = "text-align:center;font-size:0.82rem;opacity:0.75;margin:0.5rem auto 0;max-width:38rem;";
    note.textContent = "Every shot is a real simulated experiment: outcomes for qubits 3–" + n + " are drawn from their exact Born probabilities and the covariance matrix is collapsed by the conditioning update, eight clicks per shot. Each shot uses a fresh random circuit unless you freeze one — a single frozen 10-qubit circuit shows an honest finite-size offset from the flat line, of order 1/√(2n). Both overlay curves are exact predictions, not fits.";
    container.appendChild(note);

    // ---------------- state ----------------
    var Gout, hist, total, running = false, raf = null;

    function rebuild() {
      depth = parseInt(dSlider.value, 10);
      dVal.textContent = String(depth);
      Gout = circuitGamma(n, depth, seed);
      clearShots();
    }
    function clearShots() {
      hist = new Array(BINS).fill(0);
      total = 0;
      render();
    }

    function doSamples(count) {
      var frozen = freezeBox.checked;
      for (var i = 0; i < count; i++) {
        var G = frozen ? Gout : circuitGamma(n, depth, (Math.random() * 4294967296) >>> 0);
        var mval = sampleShot(G, n);
        var bin = Math.min(BINS - 1, Math.max(0, Math.floor(((mval + 1) / 2) * BINS)));
        hist[bin]++;
        total++;
      }
    }

    // ---------------- drawing ----------------
    function render() {
      var th = theme();
      ctx.clearRect(0, 0, W, H);
      var pw = W - PADL - PADR, ph = H - PADT - PADB;
      var yMax = 1.1; // density axis cap (flat GHE = 0.5, Haar peak = 0.75)

      // axes
      ctx.strokeStyle = th.faint;
      ctx.lineWidth = 1;
      ctx.strokeRect(PADL + 0.5, PADT + 0.5, pw - 1, ph - 1);
      ctx.fillStyle = th.dim;
      ctx.font = "500 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      [-1, -0.5, 0, 0.5, 1].forEach(function (x) {
        var px = PADL + ((x + 1) / 2) * pw;
        ctx.fillText(String(x), px, H - PADB + 16);
        ctx.strokeStyle = th.faint;
        ctx.beginPath();
        ctx.moveTo(px, H - PADB);
        ctx.lineTo(px, H - PADB + 4);
        ctx.stroke();
      });
      ctx.fillText("m = ⟨iγ₁γ₂⟩ of the conditional state on A", PADL + pw / 2, H - 8);
      ctx.save();
      ctx.translate(13, PADT + ph / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("probability density", 0, 0);
      ctx.restore();

      function yOf(dens) { return PADT + ph * (1 - Math.min(dens, yMax) / yMax); }

      // histogram bars (density normalization: count/total * BINS/2)
      if (total > 0) {
        ctx.fillStyle = th.accent;
        ctx.globalAlpha = 0.55;
        var bw = pw / BINS;
        for (var i = 0; i < BINS; i++) {
          var dens = (hist[i] / total) * (BINS / 2);
          var y = yOf(dens);
          ctx.fillRect(PADL + i * bw + 0.5, y, bw - 1, H - PADB - y);
        }
        ctx.globalAlpha = 1;
      }

      // GHE flat line
      ctx.strokeStyle = th.alert;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(PADL, yOf(0.5));
      ctx.lineTo(PADL + pw, yOf(0.5));
      ctx.stroke();
      // Haar parabola
      ctx.strokeStyle = th.dim;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      for (var k = 0; k <= 80; k++) {
        var xm = -1 + (2 * k) / 80;
        var py = yOf(0.75 * (1 - xm * xm));
        var px2 = PADL + ((xm + 1) / 2) * pw;
        if (k === 0) ctx.moveTo(px2, py);
        else ctx.lineTo(px2, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // legend
      ctx.font = "500 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.textAlign = "left";
      ctx.fillStyle = th.alert;
      ctx.fillText("— Gaussian Haar ensemble (flat)", PADL + 8, PADT + 16);
      ctx.fillStyle = th.dim;
      ctx.fillText("- - full Haar, 2 qubits: ¾(1−m²)", PADL + 8, PADT + 31);

      var w1 = w1ToUniform(hist, total);
      readout.innerHTML =
        "<span>depth <b>" + depth + "</b></span>" +
        "<span>shots <b>" + total + "</b></span>" +
        "<span>W₁ to GHE <b>" + (isNaN(w1) ? "—" : w1.toFixed(3)) + "</b></span>";
    }

    function frame() {
      if (running) {
        doSamples(80);
        render();
      }
      raf = global.requestAnimationFrame(frame);
    }
    raf = global.requestAnimationFrame(frame);

    runBtn.addEventListener("click", function () {
      running = !running;
      runBtn.textContent = running ? "⏸ pause" : "▶ sample";
    });
    newBtn.addEventListener("click", function () {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      freezeBox.checked = true; // a specific circuit only matters when frozen
      rebuild();
    });
    resetBtn.addEventListener("click", clearShots);
    freezeBox.addEventListener("change", clearShots); // don't mix the two ensembles
    dSlider.addEventListener("input", rebuild);

    var mo = new MutationObserver(render);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    global.addEventListener("resize", render);

    rebuild();

    return {
      redraw: render,
      destroy: function () {
        running = false;
        if (raf) global.cancelAnimationFrame(raf);
        mo.disconnect();
        global.removeEventListener("resize", render);
        container.innerHTML = "";
      },
    };
  }

  global.createProjectedEnsemble = createProjectedEnsemble;
})(window);
