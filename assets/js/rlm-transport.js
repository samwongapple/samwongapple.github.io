/*
 * rlm-transport.js — resonant-level transport explorer, for the influence-matrix
 * post "Quantum Impurity Problems: The Influence Matrix Earns Its Keep".
 *
 * Physics.  A single level ε_d between two semi-infinite tight-binding leads
 * (hopping 1, coupling γ each), bias V split symmetrically. The model is exactly
 * solvable; at zero temperature the current is the Landauer integral
 *
 *     I(V) = (1/2π) ∫_{−V/2}^{+V/2} T(ω) dω ,
 *     T(ω) = Γ_L Γ_R / [ (ω − ε_d − Λ(ω))² + (Γ/2)² ],
 *
 * with the EXACT energy-dependent hybridization of the tight-binding lead:
 * retarded surface GF g^R(ω) = (ω − i√(4−ω²))/2 inside the band, so each lead
 * contributes  Γ_i(ω) = γ² √(4−ω²)  and a level shift  Λ(ω) = γ² ω  (both leads
 * summed). The dashed overlay is the wide-band approximation everyone writes
 * first (constant Γ = 2γ², no shift) — the difference IS the band structure.
 *
 * This widget shows the exact solution the companion's influence-matrix solver
 * is benchmarked against; the kernel-side computation lives in companion 5.
 *
 * Vanilla JS, no dependencies. Colours read from the site's CSS theme variables.
 *
 * Usage:
 *   const w = createRlmTransport(el, {}); w.setParams(eps, gamma, V); w.destroy();
 */
(function (global) {
  "use strict";

  // exact transmission of the two-lead RLM with tight-binding leads
  function transmission(w, eps, gamma) {
    if (Math.abs(w) >= 2) return 0;
    var root = Math.sqrt(4 - w * w);
    var Gam1 = gamma * gamma * root;            // Γ_L(ω) = Γ_R(ω)
    var Lam = gamma * gamma * w;                // Λ_L + Λ_R = 2 · γ²ω/2
    var de = w - eps - Lam, G = 2 * Gam1;
    return (Gam1 * Gam1) / (de * de + (G / 2) * (G / 2));
  }
  function transmissionWB(w, eps, gamma) {      // wide-band: Γ = 2γ² const, Λ = 0
    var Gam1 = 2 * gamma * gamma;
    var de = w - eps, G = 2 * Gam1;
    return (Gam1 * Gam1) / (de * de + (G / 2) * (G / 2));
  }
  function current(V, eps, gamma, wb) {
    var f = wb ? transmissionWB : transmission;
    var a = -V / 2, b = V / 2, n = 400, h = (b - a) / n, s = 0;
    for (var i = 0; i <= n; i++) {
      var w = a + i * h, wgt = (i === 0 || i === n) ? 1 : (i % 2 ? 4 : 2);
      s += wgt * f(w, eps, gamma);
    }
    return s * h / 3 / (2 * Math.PI);
  }

  function createRlmTransport(mount, opts) {
    opts = opts || {};
    var state = { eps: opts.eps || 0.2, gamma: opts.gamma || 0.4, V: opts.V || 1.0 };

    function themeColor(name, fallback) {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fallback;
    }
    function colors() {
      return { accent: themeColor("--global-theme-color", "#1fb2a6"),
               text: themeColor("--global-text-color", "#e6e6e6"),
               faint: "rgba(128,128,128,0.35)" };
    }

    var root = document.createElement("div");
    root.style.cssText = "display:flex;flex-wrap:wrap;gap:1.2rem;justify-content:center;align-items:flex-start;";
    mount.appendChild(root);
    var cvA = document.createElement("canvas");
    cvA.width = 300; cvA.height = 270; cvA.style.cssText = "max-width:100%;height:auto;";
    root.appendChild(cvA);
    var cvB = document.createElement("canvas");
    cvB.width = 300; cvB.height = 270; cvB.style.cssText = "max-width:100%;height:auto;";
    root.appendChild(cvB);

    function drawT() {
      var ctx = cvA.getContext("2d"), c = colors();
      var W = cvA.width, H = cvA.height, x0 = 40, y0 = H - 44, x1 = W - 12, y1 = 26;
      ctx.clearRect(0, 0, W, H);
      var xOf = function (w) { return x0 + (w + 2.4) / 4.8 * (x1 - x0); };
      var yOf = function (T) { return y0 - T * (y0 - y1); };
      // bias window
      ctx.fillStyle = "rgba(128,128,128,0.12)";
      ctx.fillRect(xOf(-state.V / 2), y1, xOf(state.V / 2) - xOf(-state.V / 2), y0 - y1);
      ctx.strokeStyle = c.faint; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
      // band edges
      ctx.setLineDash([3, 4]);
      [-2, 2].forEach(function (be) {
        ctx.beginPath(); ctx.moveTo(xOf(be), y1); ctx.lineTo(xOf(be), y0); ctx.stroke();
      });
      ctx.setLineDash([]);
      // wide-band dashed
      ctx.strokeStyle = c.text; ctx.globalAlpha = 0.55; ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (var i = 0; i <= 240; i++) {
        var w = -2.4 + i * 4.8 / 240, T = transmissionWB(w, state.eps, state.gamma);
        i === 0 ? ctx.moveTo(xOf(w), yOf(T)) : ctx.lineTo(xOf(w), yOf(T));
      }
      ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      // exact
      ctx.strokeStyle = c.accent; ctx.lineWidth = 2;
      ctx.beginPath();
      for (i = 0; i <= 240; i++) {
        w = -2.4 + i * 4.8 / 240; T = transmission(w, state.eps, state.gamma);
        i === 0 ? ctx.moveTo(xOf(w), yOf(T)) : ctx.lineTo(xOf(w), yOf(T));
      }
      ctx.stroke();
      // level marker
      ctx.strokeStyle = c.text; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(xOf(state.eps), y0); ctx.lineTo(xOf(state.eps), y0 + 6); ctx.stroke();
      ctx.fillStyle = c.text; ctx.font = "9.5px system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("ε_d", xOf(state.eps), y0 + 16);
      ctx.font = "10px system-ui, sans-serif";
      ctx.fillText("transmission T(ω)", (x0 + x1) / 2, 14);
      ctx.fillText("ω", (x0 + x1) / 2, H - 6);
      ctx.font = "9px system-ui, sans-serif";
      ctx.fillText("shaded = bias window · dotted = band edges", (x0 + x1) / 2, H - 30);
      ctx.textAlign = "start";
      ctx.fillText("1", x0 - 12, yOf(1) + 3); ctx.fillText("0", x0 - 12, yOf(0) + 3);
    }

    function drawIV() {
      var ctx = cvB.getContext("2d"), c = colors();
      var W = cvB.width, H = cvB.height, x0 = 46, y0 = H - 44, x1 = W - 12, y1 = 26;
      ctx.clearRect(0, 0, W, H);
      var Vmax = 4.4;
      var Imax = 0, ex = [], wbv = [];
      for (var i = 0; i <= 88; i++) {
        var V = i * Vmax / 88;
        var Ie = current(V, state.eps, state.gamma, false);
        var Iw = current(V, state.eps, state.gamma, true);
        ex.push([V, Ie]); wbv.push([V, Iw]);
        Imax = Math.max(Imax, Ie, Iw);
      }
      Imax *= 1.15;
      var xOf = function (V) { return x0 + V / Vmax * (x1 - x0); };
      var yOf = function (I) { return y0 - I / Imax * (y0 - y1); };
      ctx.strokeStyle = c.faint; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
      ctx.strokeStyle = c.text; ctx.globalAlpha = 0.55; ctx.setLineDash([4, 4]); ctx.beginPath();
      wbv.forEach(function (p, i2) { i2 === 0 ? ctx.moveTo(xOf(p[0]), yOf(p[1])) : ctx.lineTo(xOf(p[0]), yOf(p[1])); });
      ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      ctx.strokeStyle = c.accent; ctx.lineWidth = 2; ctx.beginPath();
      ex.forEach(function (p, i2) { i2 === 0 ? ctx.moveTo(xOf(p[0]), yOf(p[1])) : ctx.lineTo(xOf(p[0]), yOf(p[1])); });
      ctx.stroke();
      // marker at current bias
      var Inow = current(state.V, state.eps, state.gamma, false);
      ctx.fillStyle = c.accent;
      ctx.beginPath(); ctx.arc(xOf(state.V), yOf(Inow), 4.5, 0, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = c.text; ctx.font = "10px system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("current–bias:  I(V)", (x0 + x1) / 2, 14);
      ctx.fillText("bias V", (x0 + x1) / 2, H - 6);
      ctx.font = "9px system-ui, sans-serif";
      ctx.fillText("teal = exact (tight-binding leads) · dashed = wide-band approx.", (x0 + x1) / 2, H - 30);
      ctx.fillText("I(" + state.V.toFixed(1) + ") = " + Inow.toFixed(4), xOf(state.V), yOf(Inow) - 10);
      ctx.textAlign = "start";
    }

    function redraw() { drawT(); drawIV(); }
    redraw();

    return {
      setParams: function (eps, gamma, V) { state.eps = +eps; state.gamma = +gamma; state.V = +V; redraw(); },
      redraw: redraw,
      destroy: function () { mount.removeChild(root); }
    };
  }

  global.createRlmTransport = createRlmTransport;
  global.__rlmPhysics = { transmission: transmission, transmissionWB: transmissionWB, current: current };
})(typeof window !== "undefined" ? window : globalThis);
