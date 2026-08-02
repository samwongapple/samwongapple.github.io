/*
 * te-regimes.js — temporal-entanglement growth across dynamical regimes, for the
 * influence-matrix post "Dynamical Phases Through the Temporal Lens".
 *
 * Model: kicked Ising chain with longitudinal fields,
 *     U_F = e^{-ib ΣX} · e^{-i(J ΣZZ + Σ g_j Z_j)},   bath at infinite temperature.
 *
 * Four regimes, four curves of the half-cut temporal entanglement vs T:
 *   integrable    (J=0.7, b=0.6, g=0)        — the clean chain is JW-free
 *   chaotic       (J=0.7, b=0.6, g=0.4)      — longitudinal field breaks integrability
 *   dual-unitary  (J=b=π/4,      g=0.4)      — chaotic AND exactly memoryless (PD)
 *   localized     (J=0.25, b=0.2, g random)  — strong disorder, MBL regime
 *
 * The CURVES are precomputed by the companion script c3_te_regimes.jl (temporal
 * MPS, χ up to 256, bath depth T+4, disorder-averaged where applicable) — they are
 * data, not sketches. The DOTS at small T are computed live in your browser by
 * exact dense contraction (u-tree Gram construction, ∞-temperature bath), so you
 * can check the curves' small-T ends against an independent method on the spot.
 *
 * Vanilla JS, no dependencies. Colours from the site's CSS theme variables.
 *
 * Usage:
 *   const w = createTeRegimes(el, {}); w.toggle('chaotic'); w.destroy();
 */
(function (global) {
  "use strict";

  // ---- precomputed curves (c3_te_regimes.jl output; see companion 3) -------------
  var CURVES = {
    integrable: {
      label: "integrable (g = 0 — secretly free fermions)",
      T: [4, 8, 12, 16, 20], S: [0.526, 0.814, 0.974, 1.054, 1.099],
      note: "slow growth"
    },
    chaotic: {
      label: "chaotic (g = 0.4)",
      T: [4, 8, 12, 16, 20], S: [0.529, 1.090, 1.722, 2.335, 2.817],
      note: "linear growth — the temporal barrier"
    },
    dualunitary: {
      label: "dual-unitary chaos (b = J = π/4, g = 0.4)",
      T: [4, 8, 12, 16, 20], S: [0, 0, 0, 0, 0],
      note: "exactly zero — the perfect dephaser"
    },
    mbl: {
      label: "localized (strong disorder, 6 realizations)",
      T: [4, 8, 12, 16, 20], S: [0.190, 0.387, 0.555, 0.668, 0.741],
      note: "slow growth, small prefactor"
    }
  };
  // live-dot parameters per regime (g fixed; disorder uses one frozen realization)
  var LIVE = {
    integrable: { J: 0.7, b: 0.6, g: [0, 0, 0, 0, 0, 0, 0, 0] },
    chaotic: { J: 0.7, b: 0.6, g: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4] },
    dualunitary: { J: Math.PI / 4, b: Math.PI / 4, g: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4] },
    mbl: { J: 0.25, b: 0.2, g: [5.81, 1.34, 0.72, 4.29, 2.95, 5.05, 0.33, 3.62] }
  };

  // ---- exact dense physics (∞-T bath), same conventions as the other widgets ------
  function cvec(n) { return new Float64Array(2 * n); }
  function kickMat(b) { var c = Math.cos(b), s = Math.sin(b); return [c, 0, 0, -s, 0, -s, c, 0]; }
  function zOfBit(bit) { return 1 - 2 * bit; }
  function applySingleSite(A, v, n, site) {
    var out = cvec(1 << n), stride = 1 << (n - 1 - site), dim = 1 << n;
    for (var base = 0; base < dim; base++) {
      if (base & stride) continue;
      var i0 = base, i1 = base | stride;
      var r0 = v[2 * i0], m0 = v[2 * i0 + 1], r1 = v[2 * i1], m1 = v[2 * i1 + 1];
      out[2 * i0] = A[0] * r0 - A[1] * m0 + A[2] * r1 - A[3] * m1;
      out[2 * i0 + 1] = A[0] * m0 + A[1] * r0 + A[2] * m1 + A[3] * r1;
      out[2 * i1] = A[4] * r0 - A[5] * m0 + A[6] * r1 - A[7] * m1;
      out[2 * i1 + 1] = A[4] * m0 + A[5] * r0 + A[6] * m1 + A[7] * r1;
    }
    return out;
  }

  // dense folded IM for Lb bath sites with per-site longitudinal angles g[], ∞-T bath
  function denseIM(Lb, T, J, b, g) {
    var dimb = 1 << Lb, Kb = kickMat(b);
    var phInt = new Float64Array(2 * dimb), zb0 = new Float64Array(dimb);
    for (var i = 0; i < dimb; i++) {
      var e = 0;
      for (var j = 0; j < Lb - 1; j++)
        e += J * zOfBit((i >> (Lb - 1 - j)) & 1) * zOfBit((i >> (Lb - 2 - j)) & 1);
      for (j = 0; j < Lb; j++) e += g[j] * zOfBit((i >> (Lb - 1 - j)) & 1);
      phInt[2 * i] = Math.cos(-e); phInt[2 * i + 1] = Math.sin(-e);
      zb0[i] = zOfBit((i >> (Lb - 1)) & 1);
    }
    function step(u, s) {
      var v = cvec(dimb);
      for (var k = 0; k < dimb; k++) {
        var c1 = phInt[2 * k], s1 = phInt[2 * k + 1];
        var c2 = Math.cos(-J * s * zb0[k]), s2 = Math.sin(-J * s * zb0[k]);
        var cr = c1 * c2 - s1 * s2, ci = c1 * s2 + s1 * c2;
        var r = u[2 * k], m = u[2 * k + 1];
        v[2 * k] = cr * r - ci * m; v[2 * k + 1] = cr * m + ci * r;
      }
      for (var q = 0; q < Lb; q++) v = applySingleSite(Kb, v, Lb, q);
      return v;
    }
    var n = 1 << T, IM = cvec(Math.pow(4, T));
    for (var s0 = 0; s0 < dimb; s0++) {          // ∞-T: average over basis states
      var init = cvec(dimb); init[2 * s0] = 1;
      var level = [init];
      for (var t = 0; t < T; t++) {
        var nxt = new Array(level.length * 2);
        for (var p = 0; p < level.length; p++) {
          nxt[2 * p] = step(level[p], +1);
          nxt[2 * p + 1] = step(level[p], -1);
        }
        level = nxt;
      }
      for (var sf = 0; sf < n; sf++) for (var sb = 0; sb < n; sb++) {
        var gr = 0, gi = 0, uf = level[sf], ub = level[sb];
        for (var k2 = 0; k2 < dimb; k2++) {
          var xr = ub[2 * k2], xi = ub[2 * k2 + 1], yr = uf[2 * k2], yi = uf[2 * k2 + 1];
          gr += xr * yr + xi * yi; gi += xr * yi - xi * yr;
        }
        var idx = 0;
        for (var k3 = 0; k3 < T; k3++)
          idx = idx * 4 + 2 * ((sf >> (T - 1 - k3)) & 1) + ((sb >> (T - 1 - k3)) & 1);
        IM[2 * idx] += gr / dimb; IM[2 * idx + 1] += gi / dimb;
      }
    }
    return IM;
  }

  function jacobiEig(Ain, n) {
    var A = new Array(n);
    for (var r = 0; r < n; r++) A[r] = Ain[r].slice();
    for (var sweep = 0; sweep < 60; sweep++) {
      var off = 0;
      for (var p = 0; p < n; p++) for (var q = p + 1; q < n; q++) off += A[p][q] * A[p][q];
      if (off < 1e-24) break;
      for (p = 0; p < n - 1; p++) for (q = p + 1; q < n; q++) {
        var apq = A[p][q];
        if (Math.abs(apq) < 1e-18) continue;
        var tau = (A[q][q] - A[p][p]) / (2 * apq);
        var t = tau >= 0 ? 1 / (tau + Math.sqrt(1 + tau * tau)) : -1 / (-tau + Math.sqrt(1 + tau * tau));
        var cs = 1 / Math.sqrt(1 + t * t), sn = t * cs, k;
        for (k = 0; k < n; k++) { var akp = A[k][p], akq = A[k][q]; A[k][p] = cs * akp - sn * akq; A[k][q] = sn * akp + cs * akq; }
        for (k = 0; k < n; k++) { var apk = A[p][k], aqk = A[q][k]; A[p][k] = cs * apk - sn * aqk; A[q][k] = sn * apk + cs * aqk; }
      }
    }
    var ev = new Array(n);
    for (r = 0; r < n; r++) ev[r] = A[r][r];
    return ev;
  }

  function midCutEntropy(IM, T) {
    var k = Math.floor(T / 2);
    var rows = Math.pow(4, k), cols = Math.pow(4, T - k);
    var small = Math.min(rows, cols), byRow = rows <= cols;
    var Gr = [], Gi = [];
    for (var a = 0; a < small; a++) { Gr.push(new Float64Array(small)); Gi.push(new Float64Array(small)); }
    for (a = 0; a < small; a++) for (var b2 = 0; b2 <= a; b2++) {
      var sr = 0, si = 0, len = byRow ? cols : rows;
      for (var c = 0; c < len; c++) {
        var ia = byRow ? a * cols + c : c * cols + a;
        var ib = byRow ? b2 * cols + c : c * cols + b2;
        var xr = IM[2 * ia], xi = IM[2 * ia + 1], yr = IM[2 * ib], yi = IM[2 * ib + 1];
        sr += xr * yr + xi * yi; si += xi * yr - xr * yi;
      }
      Gr[a][b2] = sr; Gr[b2][a] = sr; Gi[a][b2] = si; Gi[b2][a] = -si;
    }
    var n2 = 2 * small, R = [];
    for (a = 0; a < n2; a++) R.push(new Float64Array(n2));
    for (a = 0; a < small; a++) for (b2 = 0; b2 < small; b2++) {
      R[a][b2] = Gr[a][b2]; R[a + small][b2 + small] = Gr[a][b2];
      R[a][b2 + small] = -Gi[a][b2]; R[a + small][b2] = Gi[a][b2];
    }
    var ev = jacobiEig(R, n2).filter(function (x) { return x > 0; }).sort(function (x, y) { return y - x; });
    var lam = [];
    for (var i2 = 0; i2 < ev.length; i2 += 2) lam.push(ev[i2]);
    var tot = lam.reduce(function (u, v) { return u + v; }, 0);
    if (tot <= 0) return 0;
    var S = 0;
    for (i2 = 0; i2 < lam.length; i2++) {
      var pr = lam[i2] / tot;
      if (pr > 1e-14) S -= pr * Math.log(pr);
    }
    return S;
  }

  // live dots: T = 2, 3, 4 with bath depth T+4 (matches the companion's depths)
  function liveDots(regime) {
    var p = LIVE[regime], out = [];
    for (var T = 2; T <= 4; T++) {
      var Lb = T + 4;
      var IM = denseIM(Lb, T, p.J, p.b, p.g.slice(0, Lb));
      out.push({ T: T, S: midCutEntropy(IM, T) });
    }
    return out;
  }

  // ---- widget ---------------------------------------------------------------------
  var PALETTE = { integrable: 0, chaotic: 1, dualunitary: 2, mbl: 3 };

  function createTeRegimes(mount, opts) {
    var state = { on: { integrable: true, chaotic: true, dualunitary: true, mbl: true }, dots: {} };

    function themeColor(name, fallback) {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fallback;
    }
    function colors() {
      var accent = themeColor("--global-theme-color", "#1fb2a6");
      return {
        text: themeColor("--global-text-color", "#e6e6e6"),
        faint: "rgba(128,128,128,0.35)",
        series: [accent, "#e0705a", themeColor("--global-text-color", "#e6e6e6"), "#e0a63a"]
      };
    }

    var root = document.createElement("div");
    root.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:0.6rem;";
    mount.appendChild(root);
    var cv = document.createElement("canvas");
    cv.width = 560; cv.height = 320; cv.style.cssText = "max-width:100%;height:auto;";
    root.appendChild(cv);
    var status = document.createElement("div");
    status.style.cssText = "font-size:0.75rem;opacity:0.75;text-align:center;";
    root.appendChild(status);

    function draw() {
      var ctx = cv.getContext("2d"), c = colors();
      var W = cv.width, H = cv.height, x0 = 52, y0 = H - 46, x1 = W - 20, y1 = 16;
      ctx.clearRect(0, 0, W, H);
      var Tmax = 21, Smax = 3.05;
      var xOf = function (T) { return x0 + (T - 1) / (Tmax - 1) * (x1 - x0); };
      var yOf = function (S) { return y0 - S / Smax * (y0 - y1); };
      ctx.strokeStyle = c.faint; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
      ctx.fillStyle = c.text; ctx.font = "10px system-ui, sans-serif"; ctx.textAlign = "center";
      for (var T = 4; T <= 20; T += 4) { ctx.fillText(String(T), xOf(T), y0 + 14); }
      ctx.fillText("T  (Floquet steps)", (x0 + x1) / 2, H - 8);
      ctx.save(); ctx.translate(14, (y0 + y1) / 2); ctx.rotate(-Math.PI / 2);
      ctx.fillText("half-cut temporal entanglement S(T/2)", 0, 0); ctx.restore();
      ctx.textAlign = "start";
      for (var Sg = 0; Sg <= 3; Sg++) {
        ctx.fillText(Sg.toFixed(0), x0 - 16, yOf(Sg) + 3);
        ctx.strokeStyle = "rgba(128,128,128,0.12)";
        ctx.beginPath(); ctx.moveTo(x0, yOf(Sg)); ctx.lineTo(x1, yOf(Sg)); ctx.stroke();
      }
      var yleg = y1 + 8;
      Object.keys(CURVES).forEach(function (key) {
        if (!state.on[key]) return;
        var col = c.series[PALETTE[key]], cur = CURVES[key];
        ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath();
        for (var i = 0; i < cur.T.length; i++) {
          var x = xOf(cur.T[i]), y = yOf(cur.S[i]);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        // precomputed points as filled squares
        for (i = 0; i < cur.T.length; i++) {
          ctx.fillStyle = col;
          ctx.fillRect(xOf(cur.T[i]) - 2.5, yOf(cur.S[i]) - 2.5, 5, 5);
        }
        // live dots as open circles
        (state.dots[key] || []).forEach(function (d) {
          ctx.strokeStyle = col; ctx.lineWidth = 1.8;
          ctx.beginPath(); ctx.arc(xOf(d.T), yOf(d.S), 4.5, 0, 2 * Math.PI); ctx.stroke();
        });
        // legend
        ctx.fillStyle = col; ctx.font = "10.5px system-ui, sans-serif";
        ctx.fillRect(x0 + 12, yleg - 4, 14, 3);
        ctx.fillText(cur.label + " — " + cur.note, x0 + 32, yleg);
        yleg += 16;
      });
    }

    // compute live dots asynchronously so first paint is instant
    function computeDots() {
      var keys = Object.keys(LIVE), i = 0;
      status.textContent = "computing exact small-T check dots in your browser…";
      function next() {
        if (i >= keys.length) {
          status.textContent = "lines: temporal-MPS data from companion 3 (χ ≤ 256) · squares: its T-grid · circles: exact dense contraction, computed live";
          return;
        }
        var k = keys[i++];
        state.dots[k] = liveDots(k);
        draw();
        setTimeout(next, 30);
      }
      setTimeout(next, 60);
    }

    draw();
    computeDots();

    return {
      toggle: function (key, on) { if (key in state.on) { state.on[key] = on === undefined ? !state.on[key] : !!on; draw(); } },
      redraw: draw,
      destroy: function () { mount.removeChild(root); }
    };
  }

  global.createTeRegimes = createTeRegimes;
  global.__teRegimesPhysics = { denseIM: denseIM, midCutEntropy: midCutEntropy, CURVES: CURVES };
})(typeof window !== "undefined" ? window : globalThis);
