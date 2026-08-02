/*
 * build-a-bath.js — assemble a noise spectrum from physical ingredients and
 * watch the coherence times fall out, for "What Spin Qubits Actually Hear".
 *
 * Three ingredients, each with a microscopic owner:
 *
 *   nuclear   a very slow Lorentzian — the Overhauser field of the host nuclei,
 *             frozen within a shot and redrawn between them
 *   1/f       the charge-noise background: many fluctuators with a broad
 *             distribution of switching rates, summing to a power law
 *   fluctuator a single two-level system with an adjustable switching rate —
 *             one Lorentzian, whose knee sits at ω = 1/τc
 *
 * TOP    the composed spectrum, with each ingredient shown faintly beneath
 *        the total, so you can see which one owns which part of the curve.
 * BOTTOM the coherence times that spectrum implies, on a log scale:
 *        T₂* (free evolution), Hahn echo, CPMG-16, CPMG-128.
 *
 * Every bar is obtained by numerically solving χ(T₂) = 1 with the exact filter
 * integral of NoiseFilterMath — no fitted formula, no interpolation table. The
 * platform presets are order-of-magnitude device models chosen so their T₂*
 * and echo times land near published values; they are not fits to any one
 * device.
 *
 * Usage:  var b = createBuildABath(el, { preset: "gaas" });
 *         b.setPreset("si28"); b.set("oneOverF", 1e-4);
 * Returns { setPreset, set, get, times, presetName, redraw, destroy }.
 */
(function (global) {
  "use strict";

  var M = global.NoiseFilterMath;

  // Units: time μs, ω rad/μs.
  var PRESETS = {
    gaas: {
      name: "GaAs",
      blurb: "every nucleus has spin — the Overhauser storm dominates everything",
      p: { nucSigma: 141, nucTau: 1000, oneOverF: 0, tlfSigma: 0, tlfTau: 3 },
    },
    sinat: {
      name: "natural Si",
      blurb: "only 4.7% of nuclei (²⁹Si) carry spin — same physics, 100× quieter",
      p: { nucSigma: 1.41, nucTau: 1000, oneOverF: 2e-6, tlfSigma: 0, tlfTau: 3 },
    },
    si28: {
      name: "purified ²⁸Si",
      blurb: "the nuclear bath is nearly gone; charge noise is now the limit",
      p: { nucSigma: 0.05, nucTau: 2000, oneOverF: 2e-6, tlfSigma: 0, tlfTau: 3 },
    },
    gehole: {
      name: "Ge hole qubit",
      blurb: "strong spin–orbit buys all-electrical control — and full exposure to charge noise",
      p: { nucSigma: 0, nucTau: 1000, oneOverF: 2e-3, tlfSigma: 1.2, tlfTau: 2 },
    },
  };

  var SEQS = [
    { key: "T₂* (free)", kind: "fid", n: 0 },
    { key: "Hahn echo", kind: "hahn", n: 1 },
    { key: "CPMG-16", kind: "cpmg", n: 16 },
    { key: "CPMG-128", kind: "cpmg", n: 128 },
  ];

  function createBuildABath(container, opts) {
    if (!container) throw new Error("createBuildABath: container required");
    if (!M) throw new Error("createBuildABath: noise-filter-math.js must load first");
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

    var mL = 54, mR = 16, mT = 26, gap = 62, mB = 34;
    var panelH = (H - mT - mB - gap) / 2;
    var pW = W - mL - mR;
    var topY = mT, botY = mT + panelH + gap;

    var preset = opts.preset || "gaas";
    var P = JSON.parse(JSON.stringify(PRESETS[preset].p));

    // fast settings for interactive dragging; the physics is unchanged
    var FAST = { tLo: 1e-5, tHi: 1e7, wMin: 1e-5, nLin: 2200, nLog: 800, iters: 26 };

    function theme() {
      var cs = getComputedStyle(document.documentElement);
      var dark = document.documentElement.getAttribute("data-theme") === "dark";
      return {
        text: (cs.getPropertyValue("--global-text-color") || "").trim() || "#888",
        acc: (cs.getPropertyValue("--global-theme-color") || "").trim() || "#1fb2a6",
        amber: dark ? "#e0a63a" : "#b3760a",
        red: dark ? "#e0705a" : "#b3543f",
      };
    }

    function parts() {
      var out = [];
      if (P.nucSigma > 0) out.push({ label: "nuclear", comps: [{ type: "lorentzian", sigma: P.nucSigma, tauc: P.nucTau }] });
      if (P.oneOverF > 0) out.push({ label: "1/f charge", comps: [{ type: "oneOverF", A: P.oneOverF, alpha: 1 }] });
      if (P.tlfSigma > 0) out.push({ label: "fluctuator", comps: [{ type: "lorentzian", sigma: P.tlfSigma, tauc: P.tlfTau }] });
      return out;
    }
    function allComps() {
      var c = [];
      parts().forEach(function (p) { c = c.concat(p.comps); });
      if (!c.length) c = [{ type: "white", S0: 1e-12 }];
      return c;
    }

    var wLo = 1e-4, wHi = 1e3, sLo = 1e-8, sHi = 1e8;
    function lx(v) { return mL + ((Math.log10(v) - Math.log10(wLo)) / (Math.log10(wHi) - Math.log10(wLo))) * pW; }
    function ly(v) {
      var f = (Math.log10(v) - Math.log10(sLo)) / (Math.log10(sHi) - Math.log10(sLo));
      return topY + panelH * (1 - Math.max(0, Math.min(1, f)));
    }
    function supr(d) {
      var s = String(d).replace("-", "⁻");
      var map = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
      return s.replace(/[0-9]/g, function (c) { return map[c]; });
    }
    function fmtT(T) {
      if (T === null) return "—";
      if (T < 1e-3) return (T * 1e6).toFixed(0) + " ps";
      if (T < 1) return (T * 1e3).toFixed(T < 0.01 ? 1 : 0) + " ns";
      if (T < 1e3) return T.toFixed(T < 10 ? 2 : 1) + " μs";
      return (T / 1e3).toFixed(2) + " ms";
    }

    function spectrumCurve(comps, color, width, alpha, dash) {
      ctx.save();
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.globalAlpha = alpha;
      if (dash) ctx.setLineDash(dash);
      ctx.beginPath();
      for (var i = 0; i <= 500; i++) {
        var w = Math.pow(10, Math.log10(wLo) + (i / 500) * (Math.log10(wHi) - Math.log10(wLo)));
        var S = M.spectrumAt(w, comps);
        var x = lx(w), y = ly(Math.max(S, 1e-30));
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    function times() {
      var comps = allComps();
      return SEQS.map(function (s) {
        return { key: s.key, T: M.coherenceTime(s.kind, s.n, comps, FAST) };
      });
    }

    function redraw() {
      var th = theme();
      ctx.clearRect(0, 0, W, H);

      // ===== TOP: the composed spectrum =====
      ctx.save();
      ctx.strokeStyle = th.text; ctx.fillStyle = th.text;
      ctx.font = "11px system-ui, sans-serif"; ctx.lineWidth = 1;
      ctx.globalAlpha = 0.35; ctx.strokeRect(mL, topY, pW, panelH);
      ctx.globalAlpha = 0.12;
      var d;
      for (d = Math.ceil(Math.log10(wLo)); d <= Math.log10(wHi); d++) {
        ctx.beginPath(); ctx.moveTo(lx(Math.pow(10, d)), topY); ctx.lineTo(lx(Math.pow(10, d)), topY + panelH); ctx.stroke();
      }
      ctx.globalAlpha = 0.8; ctx.textAlign = "center"; ctx.textBaseline = "top";
      for (d = Math.ceil(Math.log10(wLo)); d <= Math.log10(wHi); d += 1) {
        if (d % 2 !== 0) continue;
        ctx.fillText("10" + supr(d), lx(Math.pow(10, d)), topY + panelH + 5);
      }
      ctx.textAlign = "right";
      ctx.fillText("ω (rad/μs)", mL + pW, topY + panelH + 18);
      ctx.save();
      ctx.translate(15, topY + panelH / 2); ctx.rotate(-Math.PI / 2);
      ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillText("S(ω)", 0, 0);
      ctx.restore();
      ctx.restore();

      // ingredients faint, total bold
      var ps = parts();
      var cols = [th.amber, th.acc, th.red];
      ps.forEach(function (p, i) {
        spectrumCurve(p.comps, cols[i % 3], 1.3, 0.55, [5, 4]);
      });
      spectrumCurve(allComps(), th.text, 2.4, 0.95, null);

      ctx.save();
      ctx.font = "11px system-ui, sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "top";
      var ly0 = topY + 6;
      ctx.fillStyle = th.text; ctx.globalAlpha = 0.95;
      ctx.fillText("total", mL + 6, ly0); ly0 += 14;
      ps.forEach(function (p, i) {
        ctx.fillStyle = cols[i % 3]; ctx.globalAlpha = 0.9;
        ctx.fillText(p.label, mL + 6, ly0); ly0 += 14;
      });
      ctx.restore();

      // ===== BOTTOM: coherence times as log bars =====
      var ts = times();
      var tLo = 1e-3, tHi = 1e4; // μs
      function bx(v) { return mL + ((Math.log10(v) - Math.log10(tLo)) / (Math.log10(tHi) - Math.log10(tLo))) * pW; }
      ctx.save();
      ctx.strokeStyle = th.text; ctx.fillStyle = th.text;
      ctx.font = "11px system-ui, sans-serif"; ctx.lineWidth = 1;
      ctx.globalAlpha = 0.35; ctx.strokeRect(mL, botY, pW, panelH);
      ctx.globalAlpha = 0.12;
      for (d = Math.ceil(Math.log10(tLo)); d <= Math.log10(tHi); d++) {
        ctx.beginPath(); ctx.moveTo(bx(Math.pow(10, d)), botY); ctx.lineTo(bx(Math.pow(10, d)), botY + panelH); ctx.stroke();
      }
      ctx.globalAlpha = 0.8; ctx.textAlign = "center"; ctx.textBaseline = "top";
      var labs = { "-3": "1 ns", "-2": "10 ns", "-1": "100 ns", 0: "1 μs", 1: "10 μs", 2: "100 μs", 3: "1 ms", 4: "10 ms" };
      for (d = Math.ceil(Math.log10(tLo)); d <= Math.log10(tHi); d++) {
        ctx.fillText(labs[String(d)] || "", bx(Math.pow(10, d)), botY + panelH + 5);
      }
      ctx.restore();

      var bh = panelH / (SEQS.length + 0.8);
      ts.forEach(function (r, i) {
        var y = botY + 8 + i * bh;
        var x1 = r.T === null ? mL : bx(Math.max(tLo, Math.min(tHi, r.T)));
        ctx.save();
        ctx.fillStyle = th.acc; ctx.globalAlpha = 0.28;
        ctx.fillRect(mL, y, Math.max(0, x1 - mL), bh * 0.62);
        ctx.globalAlpha = 0.95; ctx.strokeStyle = th.acc; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x1, y + bh * 0.62); ctx.stroke();
        ctx.font = "11.5px system-ui, sans-serif";
        ctx.fillStyle = th.text; ctx.globalAlpha = 0.95;
        ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.fillText(r.key, mL + 6, y + bh * 0.31);
        ctx.textAlign = "left";
        ctx.fillStyle = th.acc;
        ctx.fillText(fmtT(r.T), Math.min(x1 + 7, mL + pW - 62), y + bh * 0.31);
        ctx.restore();
      });

      // echo gain — the diagnostic
      var t0 = ts[0].T, t1 = ts[1].T;
      ctx.save();
      ctx.font = "11.5px system-ui, sans-serif";
      ctx.fillStyle = th.amber; ctx.textAlign = "right"; ctx.textBaseline = "top";
      if (t0 && t1) ctx.fillText("echo gain  T₂/T₂* ≈ ×" + (t1 / t0).toFixed(0), mL + pW, botY - 17);
      ctx.restore();

      ctx.save();
      ctx.font = "12px system-ui, sans-serif";
      ctx.fillStyle = th.text; ctx.globalAlpha = 0.9;
      ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillText(PRESETS[preset] ? PRESETS[preset].name : "custom", mL, 6);
      ctx.restore();
    }

    redraw();

    return {
      setPreset: function (k) {
        if (!PRESETS[k]) return;
        preset = k;
        P = JSON.parse(JSON.stringify(PRESETS[k].p));
        redraw();
      },
      set: function (key, val) { P[key] = +val; preset = "custom"; redraw(); },
      get: function (key) { return P[key]; },
      times: times,
      presetName: function () { return PRESETS[preset] ? PRESETS[preset].name : "custom bath"; },
      presetBlurb: function () { return PRESETS[preset] ? PRESETS[preset].blurb : "your own mixture of ingredients"; },
      redraw: redraw,
      destroy: function () { if (canvas.parentNode) canvas.parentNode.removeChild(canvas); },
    };
  }

  global.createBuildABath = createBuildABath;
  global.BATH_PRESETS = PRESETS;
})(typeof window !== "undefined" ? window : this);
