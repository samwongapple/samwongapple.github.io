/*
 * decay-shape.js — decay-shape explorer for the dephasing blog post
 * "Why Your Qubit Forgets".
 *
 * Physics.  Gaussian dephasing by Ornstein–Uhlenbeck (Gauss–Markov) noise:
 * autocorrelation C(τ) = σ² exp(−|τ|/τc), Lorentzian spectrum
 * S(ω) = 2σ²τc / (1 + ω²τc²).  The attenuation function follows exactly from
 * the double time integral of C (done in closed form in the post):
 *
 *     χ(t) = σ² τc² ( t/τc + e^(−t/τc) − 1 ),      W(t) = exp(−χ(t)).
 *
 * Limits at FIXED noise power σ²:
 *   τc → ∞  (quasistatic):        χ → σ²t²/2        → Gaussian decay,
 *   τc → 0  (motional narrowing): χ → σ²τc·t        → exponential decay.
 * The widget plots the exact W(t) against both limiting forms, with the time
 * axis rescaled so the full decay is always in view.  Every curve is computed
 * from these formulas — nothing is sketched or faked.  Units: σ = 1, so t and
 * τc are both measured in 1/σ.
 *
 * Vanilla JS, theme-aware (reads CSS variables). Redraws on demand.
 *
 * Usage:  var ds = createDecayShape(el, { tauc: 10 });
 *         ds.setTauC(0.1);
 * Returns { setTauC, redraw, destroy }.
 */
(function (global) {
  "use strict";

  function createDecayShape(container, opts) {
    if (!container) throw new Error("createDecayShape: container required");
    opts = opts || {};
    var cfg = {
      sigma: 1, // fixed noise power σ² = 1: t, τc in units of 1/σ
      tauc: opts.tauc != null ? +opts.tauc : 10,
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

    var mL = 40, mR = 14, mT = 50, mB = 30;
    var pW = W - mL - mR, pH = H - mT - mB;

    function theme() {
      var cs = getComputedStyle(document.documentElement);
      var dark = document.documentElement.getAttribute("data-theme") === "dark";
      return {
        text: (cs.getPropertyValue("--global-text-color") || "").trim() || "#888888",
        acc: (cs.getPropertyValue("--global-theme-color") || "").trim() || "#1fb2a6",
        amber: dark ? "#e0a63a" : "#b3760a",
      };
    }

    // exact OU attenuation function; expm1 keeps t ≪ τc numerically clean
    function chi(t) {
      var s2 = cfg.sigma * cfg.sigma, tc = cfg.tauc, x = t / tc;
      return s2 * tc * tc * (Math.expm1(-x) + x);
    }
    function Wexact(t) { return Math.exp(-chi(t)); }
    function Wgauss(t) { var s = cfg.sigma; return Math.exp(-0.5 * s * s * t * t); }
    function Wexp(t) { return Math.exp(-cfg.sigma * cfg.sigma * cfg.tauc * t); }

    // time axis: run until the exact curve has decayed to ~1% (χ = 4.6)
    function tMax() {
      var lo = 1e-6, hi = 1e-6;
      while (chi(hi) < 4.6 && hi < 1e9) hi *= 2;
      for (var i = 0; i < 60; i++) {
        var mid = 0.5 * (lo + hi);
        if (chi(mid) < 4.6) lo = mid; else hi = mid;
      }
      return hi;
    }

    function niceStep(x) {
      var p = Math.pow(10, Math.floor(Math.log(x) / Math.LN10));
      var f = x / p;
      return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * p;
    }

    function redraw() {
      var th = theme(), T = tMax();
      function xOf(t) { return mL + (t / T) * pW; }
      function yOf(w) { return mT + (1 - w / 1.04) * pH; }

      ctx.clearRect(0, 0, W, H);

      // frame + gridlines
      ctx.save();
      ctx.strokeStyle = th.text; ctx.fillStyle = th.text;
      ctx.font = "11px system-ui, sans-serif";
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.35;
      ctx.beginPath(); ctx.moveTo(mL, mT); ctx.lineTo(mL, mT + pH); ctx.lineTo(mL + pW, mT + pH); ctx.stroke();
      // y ticks: 1, 1/e, 0.5, 0
      var yticks = [[1, "1"], [0.5, "0.5"], [0, "0"]];
      ctx.textAlign = "right"; ctx.textBaseline = "middle";
      for (var i = 0; i < yticks.length; i++) {
        ctx.globalAlpha = 0.2;
        ctx.beginPath(); ctx.moveTo(mL, yOf(yticks[i][0])); ctx.lineTo(mL + pW, yOf(yticks[i][0])); ctx.stroke();
        ctx.globalAlpha = 0.75;
        ctx.fillText(yticks[i][1], mL - 6, yOf(yticks[i][0]));
      }
      // 1/e reference line
      ctx.globalAlpha = 0.3;
      ctx.setLineDash([2, 4]);
      ctx.beginPath(); ctx.moveTo(mL, yOf(1 / Math.E)); ctx.lineTo(mL + pW, yOf(1 / Math.E)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 0.6;
      ctx.fillText("1/e", mL - 6, yOf(1 / Math.E));
      // x ticks
      var step = niceStep(T / 4);
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      for (var t = step; t <= T * 1.001; t += step) {
        ctx.globalAlpha = 0.35;
        ctx.beginPath(); ctx.moveTo(xOf(t), mT + pH); ctx.lineTo(xOf(t), mT + pH - 4); ctx.stroke();
        ctx.globalAlpha = 0.75;
        ctx.fillText(String(+t.toPrecision(3)), xOf(t), mT + pH + 8);
      }
      ctx.textAlign = "left";
      ctx.fillText("t (units of 1/σ)", mL, mT + pH + 8);
      ctx.restore();

      function trace(fn, color, alpha, dash, width) {
        ctx.save();
        ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = width;
        ctx.setLineDash(dash);
        ctx.beginPath();
        var samples = Math.max(400, pW);
        for (var k = 0; k <= samples; k++) {
          var t = (k / samples) * T;
          var x = xOf(t), y = yOf(fn(t));
          if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }

      trace(Wgauss, th.text, 0.55, [7, 4], 1.4); // quasistatic (Gaussian) limit
      trace(Wexp, th.text, 0.55, [2, 4], 1.4); // motional-narrowing (exponential) limit
      trace(Wexact, th.acc, 1, [], 2.4); // exact OU result

      // legend
      ctx.save();
      ctx.font = "11px system-ui, sans-serif";
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      var lx = mL + 4, ly = 12, gap = 14;
      function legendLine(color, alpha, dash, width, label) {
        ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = width;
        ctx.setLineDash(dash);
        ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 26, ly); ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 0.85; ctx.fillStyle = th.text;
        ctx.fillText(label, lx + 32, ly);
        ly += gap;
      }
      legendLine(th.acc, 1, [], 2.4, "exact W(t) = e^−χ(t), OU noise, τc = " + (+cfg.tauc.toPrecision(3)));
      legendLine(th.text, 0.55, [7, 4], 1.4, "quasistatic limit: Gaussian e^−σ²t²/2  (τc → ∞)");
      legendLine(th.text, 0.55, [2, 4], 1.4, "motional-narrowing limit: exponential e^−σ²τc t  (τc → 0)");
      ctx.restore();
    }

    redraw();

    return {
      setTauC: function (x) { cfg.tauc = +x; redraw(); },
      redraw: redraw,
      destroy: function () { if (canvas.parentNode) canvas.parentNode.removeChild(canvas); },
    };
  }

  global.createDecayShape = createDecayShape;
})(typeof window !== "undefined" ? window : this);
