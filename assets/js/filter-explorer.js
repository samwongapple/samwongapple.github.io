/*
 * filter-explorer.js — the overlap picture, for "From Spin Echo to Filter
 * Functions" (and reused by later posts in the series).
 *
 * Two stacked panels sharing one log-frequency axis:
 *
 *   TOP     S(ω) — the noise the device actually has — and F(ω,t), the filter
 *           the pulse sequence builds. Both log-scaled, each normalised to its
 *           own peak, because on a log axis a constant factor is only a shift
 *           and what matters here is WHERE each one lives.
 *
 *   BOTTOM  the integrand. On a LOGARITHMIC ω axis the quantity whose visual
 *           area equals the integral is ω·S(ω)·F(ω,t), since
 *           ∫ S F dω = ∫ ωSF d(ln ω). So the shaded area really is πχ — it is
 *           not a schematic.
 *
 * Everything is computed by NoiseFilterMath from the exact closed forms; the
 * decay W = e^{−χ} quoted in the readout is the same integral, not a fit.
 *
 * Usage:  var fe = createFilterExplorer(el, { seq: "cpmg", n: 4, t: 10 });
 *         fe.setSeq("hahn"); fe.setN(8); fe.setT(20); fe.setNoise("oneOverF");
 * Returns { setSeq, setN, setT, setNoise, state, redraw, destroy }.
 */
(function (global) {
  "use strict";

  var M = global.NoiseFilterMath;

  // Noise presets. Units: time in μs, ω in rad/μs.
  var NOISE = {
    oneOverF: {
      label: "1/f charge noise",
      comps: [{ type: "oneOverF", A: 0.02, alpha: 1 }],
      note: "power piled up at low frequency",
    },
    lorentzian: {
      label: "Lorentzian (one fluctuator)",
      comps: [{ type: "lorentzian", sigma: 0.35, tauc: 3 }],
      note: "flat below 1/τc, falling above",
    },
    white: {
      label: "white noise",
      comps: [{ type: "white", S0: 0.05 }],
      note: "same power at every frequency",
    },
    nuclear: {
      label: "quasistatic nuclear bath",
      comps: [{ type: "lorentzian", sigma: 0.5, tauc: 300 }],
      note: "essentially frozen during a shot",
    },
  };

  function createFilterExplorer(container, opts) {
    if (!container) throw new Error("createFilterExplorer: container required");
    if (!M) throw new Error("createFilterExplorer: noise-filter-math.js must load first");
    opts = opts || {};
    var cfg = {
      seq: opts.seq || "cpmg",
      n: opts.n != null ? opts.n : 4,
      t: opts.t != null ? opts.t : 10,
      noise: opts.noise || "oneOverF",
      width: opts.width || 680,
      height: opts.height || 460,
      wMin: 1e-3,
      wMax: 1e3,
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

    var mL = 46, mR = 16, mT = 30, gap = 54, mB = 42;
    var panelH = (H - mT - mB - gap) / 2;
    var pW = W - mL - mR;
    var topY = mT, botY = mT + panelH + gap;

    function theme() {
      var cs = getComputedStyle(document.documentElement);
      var dark = document.documentElement.getAttribute("data-theme") === "dark";
      return {
        text: (cs.getPropertyValue("--global-text-color") || "").trim() || "#888",
        acc: (cs.getPropertyValue("--global-theme-color") || "").trim() || "#1fb2a6",
        amber: dark ? "#e0a63a" : "#b3760a",
        dark: dark,
      };
    }

    var lw0 = Math.log10(cfg.wMin), lw1 = Math.log10(cfg.wMax);
    function xOf(w) { return mL + ((Math.log10(w) - lw0) / (lw1 - lw0)) * pW; }

    // sample grid: log-spaced across the plotted decades
    var NS = 900;
    function grid() {
      var g = new Float64Array(NS);
      for (var i = 0; i < NS; i++) g[i] = Math.pow(10, lw0 + ((lw1 - lw0) * i) / (NS - 1));
      return g;
    }
    var WG = grid();

    function curves() {
      var comps = NOISE[cfg.noise].comps;
      var sw = M.pulseTimes(cfg.seq, cfg.n, cfg.t);
      var S = new Float64Array(NS), F = new Float64Array(NS), P = new Float64Array(NS);
      for (var i = 0; i < NS; i++) {
        S[i] = M.spectrumAt(WG[i], comps);
        F[i] = M.filterF(WG[i], cfg.t, sw);
        P[i] = WG[i] * S[i] * F[i]; // integrand on a log axis
      }
      return { S: S, F: F, P: P, sw: sw, comps: comps };
    }

    function maxOf(a) { var m = 0; for (var i = 0; i < a.length; i++) if (a[i] > m) m = a[i]; return m; }

    function drawLogCurve(arr, norm, y0, hgt, decades, color, width, alpha, fill) {
      var top = Math.log10(norm), bot = top - decades;
      ctx.save();
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.globalAlpha = alpha;
      ctx.beginPath();
      var started = false;
      for (var i = 0; i < NS; i++) {
        var v = arr[i];
        var y = v <= 0 ? y0 + hgt : y0 + hgt * (1 - (Math.log10(v) - bot) / decades);
        if (y > y0 + hgt) y = y0 + hgt;
        if (y < y0) y = y0;
        var x = mL + (i / (NS - 1)) * pW;
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      }
      ctx.stroke();
      if (fill) {
        ctx.lineTo(mL + pW, y0 + hgt); ctx.lineTo(mL, y0 + hgt); ctx.closePath();
        ctx.globalAlpha = alpha * 0.22; ctx.fillStyle = color; ctx.fill();
      }
      ctx.restore();
    }

    function axes(th) {
      ctx.save();
      ctx.strokeStyle = th.text; ctx.fillStyle = th.text;
      ctx.font = "11px system-ui, sans-serif";
      ctx.lineWidth = 1;
      [topY, botY].forEach(function (y0) {
        ctx.globalAlpha = 0.35;
        ctx.strokeRect(mL, y0, pW, panelH);
        ctx.globalAlpha = 0.13;
        for (var d = Math.ceil(lw0); d <= lw1; d++) {
          var x = xOf(Math.pow(10, d));
          ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + panelH); ctx.stroke();
        }
      });
      ctx.globalAlpha = 0.8;
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      for (var d = Math.ceil(lw0); d <= lw1; d++) {
        var x = xOf(Math.pow(10, d));
        ctx.fillText("10" + supr(d), x, botY + panelH + 7);
      }
      ctx.fillText("ω  (rad/μs)", mL + pW / 2, botY + panelH + 24);
      ctx.restore();
    }

    function supr(d) {
      var s = String(d).replace("-", "⁻");
      var map = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
      return s.replace(/[0-9]/g, function (c) { return map[c]; });
    }

    function label(txt, x, y, color, align) {
      ctx.save();
      ctx.font = "11.5px system-ui, sans-serif";
      ctx.fillStyle = color; ctx.textAlign = align || "left"; ctx.textBaseline = "middle";
      ctx.fillText(txt, x, y);
      ctx.restore();
    }

    function redraw() {
      var th = theme();
      ctx.clearRect(0, 0, W, H);
      var c = curves();
      var DEC = 7;

      axes(th);

      // ---- top panel: S(ω) and F(ω,t)
      drawLogCurve(c.S, maxOf(c.S), topY, panelH, DEC, th.acc, 2, 1, false);
      drawLogCurve(c.F, maxOf(c.F), topY, panelH, DEC, th.amber, 2, 1, false);
      label("S(ω) — the noise you have", mL + 6, topY + 12, th.acc);
      label("F(ω,t) — the filter you build", mL + 6, topY + 27, th.amber);
      label("normalised, log scale", mL + pW - 6, topY + 12, th.text, "right");

      // mark the CPMG passband
      var n = c.sw.length;
      if (n > 0) {
        var wPeak = (Math.PI * n) / cfg.t;
        if (wPeak > cfg.wMin && wPeak < cfg.wMax) {
          ctx.save();
          ctx.strokeStyle = th.amber; ctx.globalAlpha = 0.5; ctx.setLineDash([3, 3]);
          ctx.beginPath(); ctx.moveTo(xOf(wPeak), topY); ctx.lineTo(xOf(wPeak), topY + panelH); ctx.stroke();
          ctx.restore();
          label("nπ/t", xOf(wPeak) + 4, topY + panelH - 10, th.amber);
        }
      }

      // ---- bottom panel: the integrand, area = πχ
      drawLogCurve(c.P, Math.max(maxOf(c.P), 1e-30), botY, panelH, DEC, th.text, 1.6, 0.95, true);
      label("ω·S(ω)·F(ω,t) — shaded area = πχ", mL + 6, botY + 12, th.text);

      // ---- readout
      var chi = M.chi(cfg.t, c.sw, c.comps, { wMin: 1e-4 });
      var Wv = Math.exp(-chi);
      ctx.save();
      ctx.font = "12px system-ui, sans-serif";
      ctx.fillStyle = th.acc; ctx.textAlign = "right"; ctx.textBaseline = "top";
      ctx.fillText("χ = " + chi.toFixed(3) + "     W = e^−χ = " + Wv.toFixed(3), mL + pW, 8);
      ctx.restore();
      ctx.save();
      ctx.font = "12px system-ui, sans-serif";
      ctx.fillStyle = th.text; ctx.globalAlpha = 0.85;
      ctx.textAlign = "left"; ctx.textBaseline = "top";
      var seqName = cfg.seq === "fid" ? "free evolution (no pulses)"
        : cfg.seq === "hahn" ? "Hahn echo (1 pulse)"
        : (cfg.seq.toUpperCase() + "-" + cfg.n + "  (" + cfg.n + " pulses)");
      ctx.fillText(seqName + " · t = " + cfg.t.toFixed(1) + " μs", mL, 8);
      ctx.restore();
    }

    redraw();

    return {
      setSeq: function (s) { cfg.seq = s; redraw(); },
      setN: function (v) { cfg.n = Math.max(1, Math.round(+v)); redraw(); },
      setT: function (v) { cfg.t = +v; redraw(); },
      setNoise: function (k) { cfg.noise = k; redraw(); },
      state: function () {
        var sw = M.pulseTimes(cfg.seq, cfg.n, cfg.t);
        var chi = M.chi(cfg.t, sw, NOISE[cfg.noise].comps, { wMin: 1e-4 });
        return { chi: chi, W: Math.exp(-chi), seq: cfg.seq, n: cfg.n, t: cfg.t };
      },
      noiseLabel: function () { return NOISE[cfg.noise].label; },
      redraw: redraw,
      destroy: function () { if (canvas.parentNode) canvas.parentNode.removeChild(canvas); },
    };
  }

  global.createFilterExplorer = createFilterExplorer;
  global.FILTER_NOISE_PRESETS = NOISE;
})(typeof window !== "undefined" ? window : this);
