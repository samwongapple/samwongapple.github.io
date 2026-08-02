/*
 * mps-compression.js — "what does this Gaussian state cost as an MPS?" explorer,
 * for the Gaussian tensor-network blog thread ("Trading One Matrix for a Train of Tensors").
 *
 * Physics.  Ground state of a dimerized hopping chain at half filling,
 *
 *     H = -Σ_j t_j (c†_j c_{j+1} + h.c.),     t_j = 1 + δ·(-1)^j,   open boundaries.
 *
 * δ = 0 is the critical uniform chain; δ > 0 opens a gap (SSH-style dimerization).
 *
 * For a cut after site x, the eigenvalues ζ_k of the prefix block C|_[0..x-1] give the
 * FULL Schmidt spectrum of the state across that cut: because ρ_A factorizes into
 * independent natural-orbital modes (post A1 §2), every Schmidt weight is a product
 *
 *     w = Π_k  (ζ_k  or  1-ζ_k),    one factor per mode.
 *
 * Pinned modes (ζ ≈ 0 or 1) contribute a factor ≈ 1 and are compression-free; each
 * fractional ("straddling") mode doubles the number of non-negligible products.  The bond
 * dimension an MPS needs at that cut, for truncation error ε, is the number of Schmidt
 * weights (sorted descending) required before the discarded weight drops below ε.  This
 * widget enumerates the products exactly (depth-first with a floor cutoff) — no entropy
 * heuristics, no canned curves.
 *
 * Panels: (A) required bond dimension χ(x) across every cut of the chain (log₂ bars);
 *         (B) χ at the centre cut versus chain length L — grows at δ = 0, saturates gapped;
 *         (C) the ζ spectrum at the centre cut, pinned teal / fractional amber (the same
 *             plot as the first post's widget, now read as a price list).
 *
 * Vanilla JS, no dependencies.  Colours read from the site's CSS theme variables.
 *
 * Usage:
 *   const m = createMpsCompression(el, { N: 48, delta: 0, epsExp: -6 });
 *   m.setDelta(0.3); m.setEpsExp(-4); m.redraw(); m.destroy();
 */
(function (global) {
  "use strict";

  function zeros2(n) {
    var A = new Array(n);
    for (var i = 0; i < n; i++) A[i] = new Float64Array(n);
    return A;
  }

  // ---- real symmetric Jacobi eigensolver ----
  function jacobiEigen(A, n, wantVectors) {
    var V = null, i, j, k;
    if (wantVectors) {
      V = zeros2(n);
      for (i = 0; i < n; i++) V[i][i] = 1;
    }
    for (var sweep = 0; sweep < 100; sweep++) {
      var off = 0;
      for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) off += A[i][j] * A[i][j];
      if (off < 1e-22) break;
      for (var p = 0; p < n - 1; p++) {
        for (var q = p + 1; q < n; q++) {
          var apq = A[p][q];
          if (Math.abs(apq) < 1e-18) continue;
          var tau = (A[q][q] - A[p][p]) / (2 * apq);
          var t = tau >= 0
            ? 1 / (tau + Math.sqrt(1 + tau * tau))
            : -1 / (-tau + Math.sqrt(1 + tau * tau));
          var cs = 1 / Math.sqrt(1 + t * t), sn = t * cs;
          for (k = 0; k < n; k++) {
            var akp = A[k][p], akq = A[k][q];
            A[k][p] = cs * akp - sn * akq;
            A[k][q] = sn * akp + cs * akq;
          }
          for (k = 0; k < n; k++) {
            var apk = A[p][k], aqk = A[q][k];
            A[p][k] = cs * apk - sn * aqk;
            A[q][k] = sn * apk + cs * aqk;
          }
          if (V) for (k = 0; k < n; k++) {
            var vkp = V[k][p], vkq = V[k][q];
            V[k][p] = cs * vkp - sn * vkq;
            V[k][q] = sn * vkp + cs * vkq;
          }
        }
      }
    }
    var vals = new Float64Array(n);
    for (i = 0; i < n; i++) vals[i] = A[i][i];
    return { values: vals, vectors: V };
  }

  // ---- ground-state C of the dimerized chain at half filling ----
  function buildC(N, delta) {
    var h = zeros2(N), i;
    for (i = 0; i < N - 1; i++) {
      var t = 1 + delta * (i % 2 === 0 ? 1 : -1);
      h[i][i + 1] = -t;
      h[i + 1][i] = -t;
    }
    var eig = jacobiEigen(h, N, true);
    // indices of the N/2 lowest single-particle energies
    var idx = [];
    for (i = 0; i < N; i++) idx.push(i);
    idx.sort(function (a, b) { return eig.values[a] - eig.values[b]; });
    var C = zeros2(N);
    for (var m = 0; m < N / 2; m++) {
      var kcol = idx[m];
      for (i = 0; i < N; i++) {
        var vik = eig.vectors[i][kcol];
        if (vik === 0) continue;
        for (var j = 0; j < N; j++) C[i][j] += vik * eig.vectors[j][kcol];
      }
    }
    return C;
  }

  // eigenvalues of the prefix block C[0..x-1, 0..x-1]
  function prefixZetas(C, x) {
    var B = zeros2(x), i, j;
    for (i = 0; i < x; i++) for (j = 0; j < x; j++) B[i][j] = C[i][j];
    var v = Array.from(jacobiEigen(B, x, false).values);
    return v.map(function (z) { return Math.max(0, Math.min(1, z)); });
  }

  // ---- exact Schmidt weights as products of (ζ, 1-ζ) --------------------------
  // Enumerates every product above `floor` (depth-first, pruned); pinned modes are
  // absorbed into a base factor. Returns weights sorted descending.
  function schmidtWeights(zetas, floor, cap) {
    floor = floor || 1e-13;
    cap = cap || 300000;
    var frac = [], base = 1, i;
    for (i = 0; i < zetas.length; i++) {
      var z = zetas[i];
      if (z < 1e-13 || z > 1 - 1e-13) base *= Math.max(z, 1 - z);
      else frac.push(z);
    }
    // sort by decreasing "spread" so pruning bites early
    frac.sort(function (a, b) { return Math.min(b, 1 - b) - Math.min(a, 1 - a); });
    var out = [], count = 0;
    (function dfs(k, prod) {
      if (prod < floor || count > cap) return;
      if (k === frac.length) { out.push(prod); count++; return; }
      var z = frac[k];
      dfs(k + 1, prod * Math.max(z, 1 - z));   // larger branch first
      dfs(k + 1, prod * Math.min(z, 1 - z));
    })(0, base);
    out.sort(function (a, b) { return b - a; });
    return { weights: out, nFrac: frac.length };
  }

  // bond dimension for truncation error eps: smallest χ with discarded weight ≤ eps
  function chiFromWeights(weights, eps) {
    var kept = 0;
    for (var i = 0; i < weights.length; i++) {
      kept += weights[i];
      if (1 - kept <= eps) return i + 1;
    }
    return weights.length; // enumeration floor reached; lower bound
  }

  function binEntropy(z) {
    if (z <= 1e-13 || z >= 1 - 1e-13) return 0;
    return -z * Math.log(z) - (1 - z) * Math.log(1 - z);
  }

  function createMpsCompression(container, opts) {
    if (!container) throw new Error("createMpsCompression: container required");
    opts = opts || {};
    var N = opts.N || 48;                       // even
    var delta = opts.delta != null ? +opts.delta : 0;
    var epsExp = opts.epsExp != null ? +opts.epsExp : -6;   // ε = 10^epsExp
    var Lmax = opts.Lmax || 64;
    var onState = opts.onState || null;

    // ---- computed data ----
    var chiProfile = [];      // χ at cut x = 1..N-1
    var centreZetas = [];
    var centreS = 0, centreChi = 1, centreFrac = 0;
    var lengths = [], chiVsL = [];

    function recomputeProfile() {
      var C = buildC(N, delta);
      var eps = Math.pow(10, epsExp);
      chiProfile = [];
      for (var x = 1; x < N; x++) {
        var z = prefixZetas(C, x);
        var sw = schmidtWeights(z);
        chiProfile.push(chiFromWeights(sw.weights, eps));
        if (x === N / 2) {
          centreZetas = z.slice().sort(function (a, b) { return a - b; });
          centreFrac = sw.nFrac;
          centreChi = chiProfile[chiProfile.length - 1];
          centreS = 0;
          for (var q = 0; q < z.length; q++) centreS += binEntropy(z[q]);
        }
      }
      if (onState) onState({ delta: delta, eps: eps, chi: centreChi, S: centreS, nFrac: centreFrac });
    }

    function recomputeCurve() {
      var eps = Math.pow(10, epsExp);
      lengths = []; chiVsL = [];
      for (var L = 8; L <= Lmax; L += 8) {
        var C = buildC(L, delta);
        var z = prefixZetas(C, L / 2);
        chiVsL.push(chiFromWeights(schmidtWeights(z).weights, eps));
        lengths.push(L);
      }
    }

    // ---- layout ----
    var W = 520;
    var prX = 42, prY = 40, prW = W - prX - 14, prH = 128;      // panel A: χ(x)
    var cvX = 42, cvY = prY + prH + 44, cvW = 210, cvH = 120;   // panel B: χ vs L
    var zsX = cvX + cvW + 44, zsY = cvY, zsW = W - 14 - zsX, zsH = cvH; // panel C: ζ strip
    var H = cvY + cvH + 44;

    var canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.maxWidth = W + "px";
    canvas.style.height = "auto";
    canvas.style.display = "block";
    canvas.style.margin = "0 auto";
    container.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    function resize() {
      var dpr = Math.max(1, global.devicePixelRatio || 1);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    var col = {};
    function refreshTheme() {
      var cs = getComputedStyle(document.documentElement);
      col.accent = (cs.getPropertyValue("--global-theme-color") || "#1fb2a6").trim() || "#1fb2a6";
      col.text = (cs.getPropertyValue("--global-text-color") || "#888").trim() || "#888";
      col.divider = (cs.getPropertyValue("--global-divider-color") || "#8884").trim() || "#8884";
      col.amber = "#e0a63a";
    }
    refreshTheme();

    function panelTitle(txt, x, y) {
      ctx.save();
      ctx.fillStyle = col.text; ctx.globalAlpha = 0.85;
      ctx.font = "600 11px system-ui, sans-serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText(txt, x, y);
      ctx.restore();
    }

    // log2 vertical scale shared by panels A and B
    function makeLogScale(y0, y1, chiMax) {
      var top = Math.max(2, Math.ceil(Math.log2(chiMax)));
      return {
        Y: function (chi) { return y1 - (Math.log2(Math.max(1, chi)) / top) * (y1 - y0); },
        top: top,
      };
    }

    function drawTicksLog(x0, y0, y1, scale) {
      ctx.save();
      ctx.fillStyle = col.text; ctx.globalAlpha = 0.7;
      ctx.font = "10px system-ui, sans-serif";
      ctx.textAlign = "right"; ctx.textBaseline = "middle";
      for (var e = 0; e <= scale.top; e += Math.ceil(scale.top / 4) || 1) {
        var chi = Math.pow(2, e);
        ctx.fillText(String(chi), x0 - 4, scale.Y(chi));
      }
      ctx.restore();
    }

    function render() {
      ctx.clearRect(0, 0, W, H);
      var chiMax = 2;
      var i;
      for (i = 0; i < chiProfile.length; i++) chiMax = Math.max(chiMax, chiProfile[i]);
      for (i = 0; i < chiVsL.length; i++) chiMax = Math.max(chiMax, chiVsL[i]);

      // ---- panel A: χ across cuts ----
      panelTitle("bond dimension χ needed at every cut  (log scale)", prX - 28, prY - 10);
      var sA = makeLogScale(prY, prY + prH, chiMax);
      ctx.save();
      ctx.strokeStyle = col.text; ctx.globalAlpha = 0.45; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(prX, prY); ctx.lineTo(prX, prY + prH); ctx.lineTo(prX + prW, prY + prH); ctx.stroke();
      ctx.restore();
      drawTicksLog(prX, prY, prY + prH, sA);
      var bw = prW / (N - 1);
      ctx.save();
      for (i = 0; i < chiProfile.length; i++) {
        var xx = prX + i * bw;
        var yy = sA.Y(chiProfile[i]);
        var centre = (i + 1) === N / 2;
        ctx.fillStyle = centre ? col.amber : col.accent;
        ctx.globalAlpha = centre ? 1 : 0.75;
        ctx.fillRect(xx + 0.5, yy, Math.max(1, bw - 1), prY + prH - yy);
      }
      ctx.fillStyle = col.text; ctx.globalAlpha = 0.7;
      ctx.font = "10px system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText("cut position along the chain (N = " + N + ")", prX + prW / 2, prY + prH + 5);
      ctx.restore();

      // ---- panel B: χ(centre) vs L ----
      panelTitle("χ at the centre cut vs chain length", cvX - 28, cvY - 10);
      var sB = makeLogScale(cvY, cvY + cvH, chiMax);
      ctx.save();
      ctx.strokeStyle = col.text; ctx.globalAlpha = 0.45; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cvX, cvY); ctx.lineTo(cvX, cvY + cvH); ctx.lineTo(cvX + cvW, cvY + cvH); ctx.stroke();
      ctx.restore();
      drawTicksLog(cvX, cvY, cvY + cvH, sB);
      ctx.save();
      ctx.strokeStyle = col.accent; ctx.lineWidth = 2; ctx.globalAlpha = 0.9;
      ctx.beginPath();
      for (i = 0; i < lengths.length; i++) {
        var px = cvX + (lengths[i] / Lmax) * cvW;
        var py = sB.Y(chiVsL[i]);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.fillStyle = col.accent;
      for (i = 0; i < lengths.length; i++) {
        ctx.beginPath();
        ctx.arc(cvX + (lengths[i] / Lmax) * cvW, sB.Y(chiVsL[i]), 3, 0, 2 * Math.PI);
        ctx.fill();
      }
      ctx.fillStyle = col.text; ctx.globalAlpha = 0.7;
      ctx.font = "10px system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText("L", cvX + cvW / 2, cvY + cvH + 5);
      ctx.fillText(String(Lmax), cvX + cvW, cvY + cvH + 5);
      ctx.restore();

      // ---- panel C: ζ spectrum at centre cut ----
      panelTitle("ζ spectrum at the centre cut", zsX - 6, zsY - 10);
      var zy0 = zsY + 6, zy1 = zsY + zsH - 18;
      ctx.save();
      ctx.strokeStyle = col.text; ctx.globalAlpha = 0.4; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(zsX, zy1); ctx.lineTo(zsX + zsW, zy1); ctx.stroke();
      ctx.font = "10px system-ui, sans-serif"; ctx.fillStyle = col.text;
      ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.globalAlpha = 0.75;
      [["0", 0], ["½", 0.5], ["1", 1]].forEach(function (tk) {
        var tx = zsX + tk[1] * zsW;
        ctx.globalAlpha = 0.3;
        ctx.beginPath(); ctx.moveTo(tx, zy0); ctx.lineTo(tx, zy1); ctx.stroke();
        ctx.globalAlpha = 0.75;
        ctx.fillText(tk[0], tx, zy1 + 3);
      });
      for (i = 0; i < centreZetas.length; i++) {
        var z = centreZetas[i];
        var frac = z > 0.02 && z < 0.98;
        var dy = zy0 + (zy1 - zy0) * (0.15 + 0.7 * (i / Math.max(1, centreZetas.length - 1)));
        ctx.globalAlpha = frac ? 0.95 : 0.45;
        ctx.fillStyle = frac ? col.amber : col.accent;
        ctx.beginPath();
        ctx.arc(zsX + z * zsW, dy, frac ? 3.6 : 2.6, 0, 2 * Math.PI);
        ctx.fill();
      }
      ctx.restore();

      // ---- readout ----
      ctx.save();
      ctx.fillStyle = col.text; ctx.globalAlpha = 0.9;
      ctx.font = "11px system-ui, sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillText("centre cut:  " + centreFrac + " straddling modes   →   χ = " + centreChi +
                   "   ·   S = " + centreS.toFixed(3) + "   ·   ε = 10^" + epsExp,
                   prX - 28, H - 18);
      ctx.restore();
    }

    var dirty = true, raf = null, lastTheme = "";
    function frame() {
      refreshTheme();
      var key = col.accent + col.text;
      if (dirty || key !== lastTheme) { lastTheme = key; render(); dirty = false; }
      raf = global.requestAnimationFrame(frame);
    }

    var pending = null;
    function scheduleRecompute() {
      if (pending) clearTimeout(pending);
      pending = setTimeout(function () {
        pending = null;
        recomputeProfile();
        recomputeCurve();
        dirty = true;
      }, 120);
    }

    recomputeProfile();
    recomputeCurve();
    raf = global.requestAnimationFrame(frame);

    return {
      setDelta: function (v) { delta = Math.max(0, Math.min(0.8, +v)); scheduleRecompute(); },
      setEpsExp: function (v) { epsExp = Math.round(+v); scheduleRecompute(); },
      redraw: function () { resize(); dirty = true; },
      getState: function () { return { delta: delta, epsExp: epsExp, chi: centreChi, S: centreS, nFrac: centreFrac }; },
      refreshTheme: refreshTheme,
      destroy: function () {
        if (raf) global.cancelAnimationFrame(raf);
        if (pending) clearTimeout(pending);
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      },
    };
  }

  global.createMpsCompression = createMpsCompression;
  createMpsCompression._test = {
    buildC: buildC, prefixZetas: prefixZetas, schmidtWeights: schmidtWeights,
    chiFromWeights: chiFromWeights, binEntropy: binEntropy, jacobiEigen: jacobiEigen,
  };
})(typeof window !== "undefined" ? window : this);
