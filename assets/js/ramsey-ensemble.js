/*
 * ramsey-ensemble.js — ensemble-dephasing demo for the dephasing blog post
 * "Why Your Qubit Forgets".
 *
 * Physics.  Each "shot" of a Ramsey experiment on a qubit with quasistatic
 * frequency noise precesses cleanly at Ω + β_i, where β_i is drawn fresh each
 * shot from a Gaussian of standard deviation σ.  The single-shot fringe is a
 * pure, undamped cosine, cos([Ω + β_i] t) — nothing decays.  Only the AVERAGE
 * over shots decays, and for an infinite ensemble the average is exactly
 *
 *     ⟨cos([Ω + β] t)⟩ = cos(Ωt) · exp(−σ² t² / 2)
 *
 * (a complete-the-square Gaussian integral; the derivation is in the post).
 * The widget draws n individual fringes, their running average, and the exact
 * analytic envelope ± exp(−σ² t²/2).  Every curve is computed from these
 * formulas in real time — nothing is sketched or faked.
 *
 * The σ slider rescales the SAME underlying unit-normal sample (β_i = σ z_i),
 * so dragging it deforms the picture continuously; "resample" draws new z_i.
 *
 * Vanilla JS, theme-aware (reads CSS variables). No animation loop: redraws on
 * demand.
 *
 * Usage:  var re = createRamseyEnsemble(el, { sigma: 1.0, n: 30 });
 *         re.setSigma(2.0); re.resample();
 * Returns { setSigma, resample, redraw, destroy }.
 */
(function (global) {
  "use strict";

  function createRamseyEnsemble(container, opts) {
    if (!container) throw new Error("createRamseyEnsemble: container required");
    opts = opts || {};
    var cfg = {
      n: opts.n || 30, // number of shots
      omega: opts.omega || 8, // mean precession frequency Ω (rad / unit time)
      sigma: opts.sigma != null ? +opts.sigma : 1.0, // std dev of β
      tMax: opts.tMax || 4,
      width: opts.width || 660,
      height: opts.height || 330,
    };

    var W = cfg.width, H = cfg.height;
    var dpr = (global.devicePixelRatio || 1) > 1 ? 2 : 1;
    var canvas = document.createElement("canvas");
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = "100%";
    canvas.style.maxWidth = W + "px";
    canvas.style.height = "auto";
    canvas.style.display = "block";
    canvas.style.margin = "0 auto";
    container.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    // plot area
    var mL = 38, mR = 14, mT = 46, mB = 30;
    var pW = W - mL - mR, pH = H - mT - mB;
    function xOf(t) { return mL + (t / cfg.tMax) * pW; }
    function yOf(s) { return mT + (1 - (s + 1.08) / 2.16) * pH; } // s in [-1.08, 1.08]

    function theme() {
      var cs = getComputedStyle(document.documentElement);
      var dark = document.documentElement.getAttribute("data-theme") === "dark";
      return {
        text: (cs.getPropertyValue("--global-text-color") || "").trim() || "#888888",
        acc: (cs.getPropertyValue("--global-theme-color") || "").trim() || "#1fb2a6",
        amber: dark ? "#e0a63a" : "#b3760a", // matches the post's thread-note colour
      };
    }

    // one standard normal via Box–Muller
    function randn() {
      var u = 0, v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    var z = []; // unit-normal sample; β_i = σ z_i
    function resample() {
      z = [];
      for (var i = 0; i < cfg.n; i++) z.push(randn());
      redraw();
    }

    function tracePath(fn, samples) {
      ctx.beginPath();
      for (var k = 0; k <= samples; k++) {
        var t = (k / samples) * cfg.tMax;
        var x = xOf(t), y = yOf(fn(t));
        if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    function redraw() {
      var th = theme(), s = cfg.sigma;
      ctx.clearRect(0, 0, W, H);

      // axes
      ctx.save();
      ctx.strokeStyle = th.text; ctx.globalAlpha = 0.35; ctx.lineWidth = 1;
      ctx.beginPath(); // zero line
      ctx.moveTo(mL, yOf(0)); ctx.lineTo(mL + pW, yOf(0)); ctx.stroke();
      ctx.beginPath(); // y axis
      ctx.moveTo(mL, mT); ctx.lineTo(mL, mT + pH); ctx.stroke();
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = th.text;
      ctx.font = "11px system-ui, sans-serif";
      ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillText("+1", mL - 6, yOf(1));
      ctx.fillText("0", mL - 6, yOf(0));
      ctx.fillText("−1", mL - 6, yOf(-1));
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      for (var tt = 1; tt <= cfg.tMax; tt++) {
        ctx.globalAlpha = 0.25;
        ctx.beginPath(); ctx.moveTo(xOf(tt), yOf(0) - 3); ctx.lineTo(xOf(tt), yOf(0) + 3); ctx.stroke();
        ctx.globalAlpha = 0.75;
        ctx.fillText(String(tt), xOf(tt), mT + pH + 8);
      }
      ctx.textAlign = "left";
      ctx.fillText("t (arb. units)", mL, mT + pH + 8);
      ctx.restore();

      var samples = Math.max(400, pW);

      // individual shots: undamped cosines at Ω + β_i
      ctx.save();
      ctx.strokeStyle = th.text; ctx.globalAlpha = 0.13; ctx.lineWidth = 1;
      for (var i = 0; i < z.length; i++) {
        var w = cfg.omega + s * z[i];
        (function (wi) { tracePath(function (t) { return Math.cos(wi * t); }, samples); })(w);
      }
      ctx.restore();

      // shot average
      ctx.save();
      ctx.strokeStyle = th.acc; ctx.globalAlpha = 1; ctx.lineWidth = 2.2;
      tracePath(function (t) {
        var sum = 0;
        for (var i = 0; i < z.length; i++) sum += Math.cos((cfg.omega + s * z[i]) * t);
        return sum / z.length;
      }, samples);
      ctx.restore();

      // exact infinite-ensemble envelope ± exp(−σ²t²/2)
      ctx.save();
      ctx.strokeStyle = th.amber; ctx.globalAlpha = 0.95; ctx.lineWidth = 1.6;
      ctx.setLineDash([6, 4]);
      tracePath(function (t) { return Math.exp(-0.5 * s * s * t * t); }, samples);
      tracePath(function (t) { return -Math.exp(-0.5 * s * s * t * t); }, samples);
      ctx.restore();

      // legend
      ctx.save();
      ctx.font = "11px system-ui, sans-serif";
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      var lx = mL + 4, ly = 12, gap = 14;
      function legendLine(color, alpha, dash, label, width) {
        ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = width;
        ctx.setLineDash(dash);
        ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 26, ly); ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 0.85; ctx.fillStyle = theme().text;
        ctx.fillText(label, lx + 32, ly);
        ly += gap;
      }
      legendLine(th.text, 0.4, [], "single shots: cos([Ω + βᵢ]t), each undamped", 1);
      legendLine(th.acc, 1, [], "average of " + z.length + " shots", 2.2);
      legendLine(th.amber, 0.95, [6, 4], "exact ∞-ensemble envelope ±exp(−σ²t²/2)", 1.6);
      ctx.restore();
    }

    resample();

    return {
      setSigma: function (x) { cfg.sigma = +x; redraw(); },
      resample: resample,
      redraw: redraw,
      destroy: function () { if (canvas.parentNode) canvas.parentNode.removeChild(canvas); },
    };
  }

  global.createRamseyEnsemble = createRamseyEnsemble;
})(typeof window !== "undefined" ? window : this);
