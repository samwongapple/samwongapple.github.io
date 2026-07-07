/*
 * double-dot-levels.js — two-electron energy levels of a double dot vs. detuning ε.
 *
 * Two singlets, S(1,1) and S(0,2), are tunnel-coupled (coupling t_c) and anticross; the
 * three triplets T0, T+, T- live only in (1,1) and stay flat (T± split by the Zeeman
 * energy E_Z). In the m=0 sector the (lower) singlet and T0 can be mixed by a magnetic
 * field GRADIENT ΔB_z, opening the S–T0 avoided crossing that gives the singlet–triplet
 * qubit its x-axis. The exchange J(ε) is the S–T0 gap; it is small deep in (1,1) and
 * grows toward the anticrossing — the tunable z-axis. At large ε the singlet drops into
 * (0,2) while triplets stay blocked in (1,1): Pauli spin blockade, the readout.
 *
 *   S branches:  E±(ε) = -ε/2 ± ½√(ε² + 4 t_c²)
 *   J(ε)       = ε/2 + ½√(ε² + 4 t_c²)          (gap between T0 and lower singlet)
 *
 * Vanilla JS, theme-aware, redraws on demand (no animation loop).
 * createDoubleDotLevels(el, cfg) -> { setEps, setGradient, redraw, destroy }.
 */
(function (global) {
  "use strict";

  function createDoubleDotLevels(container, opts) {
    if (!container) throw new Error("createDoubleDotLevels: container required");
    opts = opts || {};
    var cfg = {
      w: opts.w || 440, h: opts.h || 300,
      tc: opts.tc || 1.0,          // tunnel coupling
      ez: opts.ez != null ? opts.ez : 0.55, // Zeeman splitting of T±
      grad: opts.grad || 0.0,      // magnetic gradient ΔB_z (S–T0 mixing)
      gradOn: !!opts.gradOn,
      eps: opts.eps != null ? opts.eps : -2.0,
      epsMax: opts.epsMax || 6.0,
      gradVal: opts.gradVal || 0.5,
    };
    var padL = 44, padR = 16, padT = 14, padB = 34;

    var canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.maxWidth = cfg.w + "px";
    canvas.style.height = "auto";
    canvas.style.display = "block";
    canvas.style.margin = "0 auto";
    container.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var dpr = 1;
    function resize() {
      dpr = Math.max(1, global.devicePixelRatio || 1);
      canvas.width = cfg.w * dpr; canvas.height = cfg.h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    var epsMin = -cfg.epsMax, epsMax = cfg.epsMax;
    var Emax = cfg.epsMax * 0.6 + 1, Emin = -cfg.epsMax - 0.6;

    function xOf(e) { return padL + (e - epsMin) / (epsMax - epsMin) * (cfg.w - padL - padR); }
    function yOf(E) { return padT + (Emax - E) / (Emax - Emin) * (cfg.h - padT - padB); }

    function root(e) { return Math.sqrt(e * e + 4 * cfg.tc * cfg.tc); }
    function EsLower(e) { return -e / 2 - 0.5 * root(e); }
    function EsUpper(e) { return -e / 2 + 0.5 * root(e); }
    function g() { return cfg.gradOn ? cfg.gradVal : 0; }
    // m=0 sector: mix lower singlet with T0(=0) by the gradient
    function m0(e) {
      var s = EsLower(e), mid = s / 2, rad = 0.5 * Math.sqrt(s * s + 4 * g() * g());
      return { lo: mid - rad, hi: mid + rad };
    }

    function theme() {
      var cs = getComputedStyle(document.documentElement);
      return {
        text: (cs.getPropertyValue("--global-text-color") || "#888").trim() || "#888",
        acc: (cs.getPropertyValue("--global-theme-color") || "#1fb2a6").trim() || "#1fb2a6",
      };
    }

    function curve(fn, color, width, dash, alpha) {
      ctx.save();
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.globalAlpha = alpha == null ? 1 : alpha;
      if (dash) ctx.setLineDash(dash);
      ctx.beginPath();
      var first = true;
      for (var px = 0; px <= cfg.w - padL - padR; px += 2) {
        var e = epsMin + (px / (cfg.w - padL - padR)) * (epsMax - epsMin);
        var E = fn(e);
        if (E < Emin || E > Emax) { first = true; continue; }
        var X = padL + px, Y = yOf(E);
        if (first) { ctx.moveTo(X, Y); first = false; } else ctx.lineTo(X, Y);
      }
      ctx.stroke();
      ctx.restore();
    }

    function label(text, x, y, color, size, align) {
      ctx.save();
      ctx.fillStyle = color; ctx.font = (size || 12) + "px system-ui, sans-serif";
      ctx.textAlign = align || "left"; ctx.textBaseline = "middle";
      ctx.fillText(text, x, y);
      ctx.restore();
    }

    function redraw() {
      var th = theme();
      ctx.clearRect(0, 0, cfg.w, cfg.h);

      // axes
      ctx.save();
      ctx.strokeStyle = th.text; ctx.globalAlpha = 0.5; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, padT); ctx.lineTo(padL, cfg.h - padB); ctx.lineTo(cfg.w - padR, cfg.h - padB);
      ctx.stroke();
      // ε = 0 (anticrossing) gridline
      ctx.globalAlpha = 0.18; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(xOf(0), padT); ctx.lineTo(xOf(0), cfg.h - padB); ctx.stroke();
      ctx.restore();
      label("energy", padL - 6, padT + 4, th.text, 11, "right");
      label("detuning ε →", cfg.w - padR, cfg.h - padB + 20, th.text, 11, "right");
      label("(1,1)", padL + 6, cfg.h - padB - 8, th.text, 11, "left");
      label("(0,2)", cfg.w - padR - 6, cfg.h - padB - 8, th.text, 11, "right");

      // upper singlet (faint dashed — the (0,2) partner)
      curve(EsUpper, th.text, 1.3, [5, 4], 0.4);
      // triplets T± (neutral)
      curve(function () { return cfg.ez; }, th.text, 1.5, null, 0.75);
      curve(function () { return -cfg.ez; }, th.text, 1.5, null, 0.75);
      // m=0 sector: T0 branch (upper) neutral, S branch (lower) accent
      curve(function (e) { return m0(e).hi; }, th.text, 2, null, 0.9);
      curve(function (e) { return m0(e).lo; }, th.acc, 2.5, null, 1);

      // labels on the right edge for the levels
      var xr = cfg.w - padR - 4;
      label("T₊", xr, yOf(cfg.ez), th.text, 12, "right");
      label("T₋", xr, yOf(-cfg.ez), th.text, 12, "right");
      label("T₀", xOf(epsMin) + 30, yOf(m0(epsMin).hi) - 10, th.text, 12, "left");
      label("S", xOf(epsMin) + 30, yOf(m0(epsMin).lo) + 12, th.acc, 12, "left");

      // J(ε) indicator at the marker
      var e0 = cfg.eps, xM = xOf(e0);
      var lv = m0(e0);
      ctx.save();
      ctx.strokeStyle = th.text; ctx.globalAlpha = 0.55; ctx.setLineDash([2, 3]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(xM, padT); ctx.lineTo(xM, cfg.h - padB); ctx.stroke();
      ctx.restore();
      // J double arrow between S (lo) and T0 (hi) at marker
      var yLo = yOf(lv.lo), yHi = yOf(lv.hi);
      ctx.save();
      ctx.strokeStyle = th.acc; ctx.fillStyle = th.acc; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(xM, yHi); ctx.lineTo(xM, yLo); ctx.stroke();
      [[yHi, -1], [yLo, 1]].forEach(function (a) {
        ctx.beginPath(); ctx.moveTo(xM, a[0]);
        ctx.lineTo(xM - 4, a[0] + 6 * a[1]); ctx.lineTo(xM + 4, a[0] + 6 * a[1]);
        ctx.closePath(); ctx.fill();
      });
      label("J(ε)", xM + 7, (yLo + yHi) / 2, th.acc, 12, "left");
      ctx.restore();

      // PSB annotation on the right where the singlet plunges below the triplets
      label("Pauli spin blockade", cfg.w - padR - 6, yOf(cfg.ez) - 16, th.text, 10.5, "right");
    }

    redraw();

    return {
      setEps: function (x) { cfg.eps = +x; redraw(); },
      setGradient: function (on) { cfg.gradOn = !!on; redraw(); },
      redraw: redraw,
      destroy: function () { if (canvas.parentNode) canvas.parentNode.removeChild(canvas); },
    };
  }

  global.createDoubleDotLevels = createDoubleDotLevels;
})(typeof window !== "undefined" ? window : this);
