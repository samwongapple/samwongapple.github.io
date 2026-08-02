/*
 * spectrometer-game.js — the inverse problem, played forwards, for
 * "The Qubit as a Spectrometer".
 *
 * A hidden spectrum S(ω) is chosen at random. You do not get to see it. What
 * you get is what an experimentalist gets: a device, a knob (the pulse number
 * n), and a decay curve. Each virtual CPMG run returns a coherence time T₂(n),
 * measured with finite statistics, and each T₂ converts into ONE point of the
 * spectrum via the leading-harmonic inversion
 *
 *     χ(T₂) = 1   ⇒   S(ω₁) ≈ π²/(4 T₂),      ω₁ = π n / T₂ .
 *
 * Collect enough points, guess the shape, then reveal the truth.
 *
 * Everything is exact: T₂ comes from solving χ(t) = 1 with the same
 * NoiseFilterMath used everywhere else in the series, so the systematic error
 * of the inversion (harmonic leakage) is really there in the scatter — it has
 * not been idealised away. Only the measurement scatter is synthetic, and it is
 * a deterministic pseudo-random draw so a repeat of the same n behaves like a
 * genuine repeat.
 *
 * Usage:  var g = createSpectrometerGame(el, {});
 *         g.run(16); g.sweep(); g.reveal(true); g.newDevice();
 * Returns { run, sweep, reveal, newDevice, clear, deviceName, redraw, destroy }.
 */
(function (global) {
  "use strict";

  var M = global.NoiseFilterMath;

  // Hidden devices. Units: time μs, ω rad/μs, S rad²/μs.
  var DEVICES = [
    {
      name: "pure 1/f charge noise",
      hint: "a featureless power law — a straight line on log–log",
      comps: [{ type: "oneOverF", A: 0.02, alpha: 1 }],
    },
    {
      name: "1/f plus one loud fluctuator",
      hint: "a power law with a Lorentzian shoulder sitting on it",
      comps: [
        { type: "oneOverF", A: 0.008, alpha: 1 },
        { type: "lorentzian", sigma: 0.30, tauc: 1.5 },
      ],
    },
    {
      name: "a single two-level fluctuator",
      hint: "flat below 1/τc, then falling as 1/ω²",
      comps: [{ type: "lorentzian", sigma: 0.42, tauc: 4 }],
    },
    {
      name: "quiet 1/f with a nuclear line",
      hint: "a power law with a bump at one particular frequency",
      comps: [
        { type: "oneOverF", A: 0.005, alpha: 1 },
        { type: "peak", sigma: 0.34, w0: 4.0, width: 0.7 },
      ],
    },
  ];

  function createSpectrometerGame(container, opts) {
    if (!container) throw new Error("createSpectrometerGame: container required");
    if (!M) throw new Error("createSpectrometerGame: noise-filter-math.js must load first");
    opts = opts || {};

    var W = opts.width || 680, H = opts.height || 470;
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

    var mL = 52, mR = 16, mT = 26, gap = 56, mB = 42;
    var panelH = (H - mT - mB - gap) / 2;
    var pW = W - mL - mR;
    var topY = mT, botY = mT + panelH + gap;

    var state = {
      dev: 0,
      seed: 1,
      pts: [],       // {n, T2, w, S}
      revealed: false,
    };

    function theme() {
      var cs = getComputedStyle(document.documentElement);
      var dark = document.documentElement.getAttribute("data-theme") === "dark";
      return {
        text: (cs.getPropertyValue("--global-text-color") || "").trim() || "#888",
        acc: (cs.getPropertyValue("--global-theme-color") || "").trim() || "#1fb2a6",
        amber: dark ? "#e0a63a" : "#b3760a",
      };
    }

    // deterministic pseudo-random in [0,1) from integers — same n, same device,
    // same repeat index ⇒ same draw, so the scatter is reproducible.
    function rnd(a, b, c) {
      var x = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
      return x - Math.floor(x);
    }

    function comps() { return DEVICES[state.dev].comps; }

    // one virtual experiment at pulse number n
    function measure(n) {
      var T2 = M.coherenceTime("cpmg", n, comps(), { tLo: 1e-3, tHi: 1e5, wMin: 1e-6 });
      if (!T2) return null;
      // finite statistics: ~4% relative scatter on the fitted T₂
      var rep = state.pts.filter(function (p) { return p.n === n; }).length;
      var g = (rnd(n, state.seed, rep) + rnd(n * 3, state.seed * 7, rep + 1) - 1) * 0.07;
      var T2m = T2 * (1 + g);
      return {
        n: n,
        T2: T2m,
        w: (Math.PI * n) / T2m,
        S: (Math.PI * Math.PI) / (4 * T2m),
      };
    }

    // ---- axis helpers (both panels are log–log) ----
    function bounds() {
      var wLo = 1e-2, wHi = 1e2, sLo = 1e-4, sHi = 1e1;
      var nLo = 1, nHi = 256, tLo = 1e0, tHi = 1e3;
      return { wLo: wLo, wHi: wHi, sLo: sLo, sHi: sHi, nLo: nLo, nHi: nHi, tLo: tLo, tHi: tHi };
    }
    function lx(v, lo, hi) { return mL + ((Math.log10(v) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo))) * pW; }
    function ly(v, lo, hi, y0) {
      var f = (Math.log10(v) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo));
      return y0 + panelH * (1 - Math.max(0, Math.min(1, f)));
    }

    function supr(d) {
      var s = String(d).replace("-", "⁻");
      var map = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
      return s.replace(/[0-9]/g, function (c) { return map[c]; });
    }

    function frame(y0, xlo, xhi, ylo, yhi, xlab, ylab, th) {
      ctx.save();
      ctx.strokeStyle = th.text; ctx.fillStyle = th.text;
      ctx.font = "11px system-ui, sans-serif"; ctx.lineWidth = 1;
      ctx.globalAlpha = 0.35;
      ctx.strokeRect(mL, y0, pW, panelH);
      ctx.globalAlpha = 0.12;
      var d;
      for (d = Math.ceil(Math.log10(xlo)); d <= Math.log10(xhi); d++) {
        var x = lx(Math.pow(10, d), xlo, xhi);
        ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + panelH); ctx.stroke();
      }
      for (d = Math.ceil(Math.log10(ylo)); d <= Math.log10(yhi); d++) {
        var y = ly(Math.pow(10, d), ylo, yhi, y0);
        ctx.beginPath(); ctx.moveTo(mL, y); ctx.lineTo(mL + pW, y); ctx.stroke();
      }
      ctx.globalAlpha = 0.8;
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      for (d = Math.ceil(Math.log10(xlo)); d <= Math.log10(xhi); d++) {
        ctx.fillText("10" + supr(d), lx(Math.pow(10, d), xlo, xhi), y0 + panelH + 5);
      }
      ctx.textAlign = "right"; ctx.textBaseline = "middle";
      for (d = Math.ceil(Math.log10(ylo)); d <= Math.log10(yhi); d++) {
        ctx.fillText("10" + supr(d), mL - 6, ly(Math.pow(10, d), ylo, yhi, y0));
      }
      ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.globalAlpha = 0.9;
      ctx.fillText(xlab, mL + pW - 150, y0 + panelH + 20);
      ctx.save();
      ctx.translate(14, y0 + panelH / 2); ctx.rotate(-Math.PI / 2);
      ctx.textAlign = "center"; ctx.fillText(ylab, 0, 0);
      ctx.restore();
      ctx.restore();
    }

    function redraw() {
      var th = theme(), b = bounds();
      ctx.clearRect(0, 0, W, H);

      // ============ TOP: the raw data — T₂ versus n ============
      frame(topY, b.nLo, b.nHi, b.tLo, b.tHi, "pulse number n", "T₂ (μs)", th);
      ctx.save();
      ctx.font = "11.5px system-ui, sans-serif";
      ctx.fillStyle = th.text; ctx.globalAlpha = 0.85;
      ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillText("what you measure: coherence time vs pulse number", mL + 6, topY + 6);
      ctx.restore();
      ctx.save();
      ctx.fillStyle = th.acc;
      state.pts.forEach(function (p) {
        var x = lx(p.n, b.nLo, b.nHi), y = ly(p.T2, b.tLo, b.tHi, topY);
        ctx.beginPath(); ctx.arc(x, y, 3.6, 0, 2 * Math.PI); ctx.fill();
      });
      ctx.restore();

      // ============ BOTTOM: the inferred spectrum ============
      frame(botY, b.wLo, b.wHi, b.sLo, b.sHi, "ω (rad/μs)", "S(ω)", th);
      ctx.save();
      ctx.font = "11.5px system-ui, sans-serif";
      ctx.fillStyle = th.text; ctx.globalAlpha = 0.85;
      ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillText("what you infer: S(π n/T₂) ≈ π²/(4 T₂)", mL + 6, botY + 6);
      ctx.restore();

      if (state.revealed) {
        ctx.save();
        ctx.strokeStyle = th.amber; ctx.lineWidth = 2; ctx.globalAlpha = 0.95;
        ctx.beginPath();
        for (var i = 0; i <= 400; i++) {
          var w = Math.pow(10, Math.log10(b.wLo) + (i / 400) * (Math.log10(b.wHi) - Math.log10(b.wLo)));
          var S = M.spectrumAt(w, comps());
          var x = lx(w, b.wLo, b.wHi), y = ly(Math.max(S, 1e-30), b.sLo, b.sHi, botY);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.globalAlpha = 0.9;
        ctx.font = "11.5px system-ui, sans-serif";
        ctx.fillStyle = th.amber; ctx.textAlign = "right"; ctx.textBaseline = "top";
        ctx.fillText("truth: " + DEVICES[state.dev].name, mL + pW - 6, botY + 6);
        ctx.restore();
      }

      ctx.save();
      ctx.fillStyle = th.acc;
      state.pts.forEach(function (p) {
        var x = lx(p.w, b.wLo, b.wHi), y = ly(p.S, b.sLo, b.sHi, botY);
        ctx.beginPath(); ctx.arc(x, y, 3.6, 0, 2 * Math.PI); ctx.fill();
      });
      ctx.restore();

      // counter
      ctx.save();
      ctx.font = "11.5px system-ui, sans-serif";
      ctx.fillStyle = th.text; ctx.globalAlpha = 0.7;
      ctx.textAlign = "right"; ctx.textBaseline = "top";
      ctx.fillText(state.pts.length + " experiment" + (state.pts.length === 1 ? "" : "s") + " run", mL + pW, 6);
      ctx.restore();
    }

    redraw();

    return {
      run: function (n) {
        var p = measure(Math.max(1, Math.round(n)));
        if (p) state.pts.push(p);
        redraw();
        return p;
      },
      sweep: function () {
        [2, 4, 8, 16, 32, 64, 128].forEach(function (n) {
          var p = measure(n);
          if (p) state.pts.push(p);
        });
        redraw();
      },
      reveal: function (on) { state.revealed = on !== false; redraw(); },
      isRevealed: function () { return state.revealed; },
      newDevice: function () {
        state.seed += 1;
        state.dev = Math.floor(rnd(state.seed * 17, 3, 11) * DEVICES.length) % DEVICES.length;
        state.pts = []; state.revealed = false;
        redraw();
      },
      clear: function () { state.pts = []; redraw(); },
      deviceName: function () { return DEVICES[state.dev].name; },
      deviceHint: function () { return DEVICES[state.dev].hint; },
      redraw: redraw,
      destroy: function () { if (canvas.parentNode) canvas.parentNode.removeChild(canvas); },
    };
  }

  global.createSpectrometerGame = createSpectrometerGame;
})(typeof window !== "undefined" ? window : this);
