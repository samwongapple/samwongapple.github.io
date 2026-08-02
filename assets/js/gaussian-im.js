/*
 * gaussian-im.js — the Gaussian influence matrix of a free-fermion lead, for the
 * influence-matrix post "One Matrix in Time: Gaussian Influence Matrices".
 *
 * Physics.  A semi-infinite tight-binding lead (hopping 1, half filled) coupled to
 * an impurity with strength γ, in discrete time (step δt). Because the bath is
 * quadratic, its influence matrix is a GAUSSIAN state in the temporal fermionic
 * Hilbert space, fully specified by the discrete Keldysh hybridization kernel
 *
 *     Δ_ab = s_a s_b γ² δt² · G_c(t_a, t_b),   a,b on the 2T-point contour,
 *
 * with G_c the contour-ordered surface Green's function of the lead — built here
 * from the analytic eigenbasis of an N-site chain (no diagonalization needed):
 * ε_k = −2cos(kπ/(N+1)), |φ_k(1)|² = (2/(N+1)) sin²(kπ/(N+1)).
 *
 * The temporal entanglement across a time cut comes from the BCS state with
 * pairing A = [[0, Δ], [−Δᵀ, 0]] via the closed forms validated in companion 4:
 *   ⟨c†c⟩ = A†(1+AA†)⁻¹A,   ⟨cc⟩ = −(1+AA†)⁻¹A,
 * assembled into the Majorana covariance Γ; S = Σ binary entropies of (1±λ)/2
 * with λ² the eigenvalues of −Γ² restricted to the cut's modes.
 *
 * Everything is single-particle linear algebra — which is the entire point of the
 * post: the panels you see would cost 4^T amplitudes in the spin language.
 *
 * Vanilla JS, no dependencies. Colours read from the site's CSS theme variables.
 *
 * Usage:
 *   const w = createGaussianIM(el, {}); w.setParams(gamma, dt); w.destroy();
 */
(function (global) {
  "use strict";

  var NLEAD = 300;

  // ---- lead surface correlators g^>(t), g^<(t) on a grid --------------------------
  function leadCorrelators(tmax, dt) {
    var eps = [], w1 = [];
    for (var k = 1; k <= NLEAD; k++) {
      eps.push(-2 * Math.cos(k * Math.PI / (NLEAD + 1)));
      w1.push(2 / (NLEAD + 1) * Math.pow(Math.sin(k * Math.PI / (NLEAD + 1)), 2));
    }
    var nt = Math.round(tmax / dt) + 1, ggr = new Float64Array(2 * nt), gle = new Float64Array(2 * nt);
    for (var i = 0; i < nt; i++) {
      var t = i * dt, gr = 0, gi = 0, lr = 0, li = 0;
      for (k = 0; k < NLEAD; k++) {
        var c = Math.cos(eps[k] * t), s = -Math.sin(eps[k] * t);
        if (eps[k] >= 0) { gr += w1[k] * c; gi += w1[k] * s; }
        else { lr += w1[k] * c; li += w1[k] * s; }
      }
      ggr[2 * i] = gr; ggr[2 * i + 1] = gi; gle[2 * i] = lr; gle[2 * i + 1] = li;
    }
    return { ggr: ggr, gle: gle, dt: dt };
  }

  // ---- the contour kernel Δ (2T×2T interleaved complex) ---------------------------
  function contourKernel(T, gamma, corr) {
    var dt = corr.dt, n = 2 * T;
    var times = [], signs = [];
    for (var k2 = 0; k2 < T; k2++) { times.push(k2 * dt); signs.push(1); }
    for (k2 = 0; k2 < T; k2++) { times.push((T - 1 - k2) * dt); signs.push(-1); }
    function gval(arr, t) { // g(t) with g(−t) = conj(g(t))
      var i = Math.round(Math.abs(t) / dt);
      return t >= 0 ? [arr[2 * i], arr[2 * i + 1]] : [arr[2 * i], -arr[2 * i + 1]];
    }
    var D = new Float64Array(2 * n * n), pref = gamma * gamma * dt * dt;
    for (var a = 0; a < n; a++) {
      for (var b = 0; b < n; b++) {
        var g = a >= b ? gval(corr.ggr, times[a] - times[b])
                       : gval(corr.gle, times[a] - times[b]).map(function (x) { return -x; });
        var s = signs[a] * signs[b] * pref;
        D[2 * (a * n + b)] = s * g[0]; D[2 * (a * n + b) + 1] = s * g[1];
      }
    }
    return D;
  }

  // ---- complex dense linear algebra (interleaved) ---------------------------------
  function cmatmul(A, B, n) { // n×n complex
    var C = new Float64Array(2 * n * n);
    for (var i = 0; i < n; i++) for (var k = 0; k < n; k++) {
      var ar = A[2 * (i * n + k)], ai = A[2 * (i * n + k) + 1];
      if (ar === 0 && ai === 0) continue;
      for (var j = 0; j < n; j++) {
        var br = B[2 * (k * n + j)], bi = B[2 * (k * n + j) + 1];
        C[2 * (i * n + j)] += ar * br - ai * bi;
        C[2 * (i * n + j) + 1] += ar * bi + ai * br;
      }
    }
    return C;
  }
  function cdagger(A, n) {
    var B = new Float64Array(2 * n * n);
    for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
      B[2 * (j * n + i)] = A[2 * (i * n + j)];
      B[2 * (j * n + i) + 1] = -A[2 * (i * n + j) + 1];
    }
    return B;
  }
  function csolve(M, B, n) { // solve M X = B by Gaussian elimination with pivoting
    var A = new Float64Array(M), X = new Float64Array(B);
    for (var col = 0; col < n; col++) {
      var piv = col, best = 0;
      for (var r = col; r < n; r++) {
        var m = Math.abs(A[2 * (r * n + col)]) + Math.abs(A[2 * (r * n + col) + 1]);
        if (m > best) { best = m; piv = r; }
      }
      if (piv !== col) {
        for (var c2 = 0; c2 < n; c2++) {
          for (var q = 0; q < 2; q++) {
            var tmp = A[2 * (col * n + c2) + q]; A[2 * (col * n + c2) + q] = A[2 * (piv * n + c2) + q]; A[2 * (piv * n + c2) + q] = tmp;
            tmp = X[2 * (col * n + c2) + q]; X[2 * (col * n + c2) + q] = X[2 * (piv * n + c2) + q]; X[2 * (piv * n + c2) + q] = tmp;
          }
        }
      }
      var dr = A[2 * (col * n + col)], di = A[2 * (col * n + col) + 1];
      var den = dr * dr + di * di;
      for (r = 0; r < n; r++) {
        if (r === col) continue;
        var fr = A[2 * (r * n + col)], fi = A[2 * (r * n + col) + 1];
        if (fr === 0 && fi === 0) continue;
        var qr = (fr * dr + fi * di) / den, qi = (fi * dr - fr * di) / den;
        for (c2 = col; c2 < n; c2++) {
          var ar = A[2 * (col * n + c2)], ai = A[2 * (col * n + c2) + 1];
          A[2 * (r * n + c2)] -= qr * ar - qi * ai;
          A[2 * (r * n + c2) + 1] -= qr * ai + qi * ar;
        }
        for (c2 = 0; c2 < n; c2++) {
          ar = X[2 * (col * n + c2)]; ai = X[2 * (col * n + c2) + 1];
          X[2 * (r * n + c2)] -= qr * ar - qi * ai;
          X[2 * (r * n + c2) + 1] -= qr * ai + qi * ar;
        }
      }
    }
    // scale rows
    var out = new Float64Array(2 * n * n);
    for (r = 0; r < n; r++) {
      var d2r = A[2 * (r * n + r)], d2i = A[2 * (r * n + r) + 1], dd = d2r * d2r + d2i * d2i;
      for (c2 = 0; c2 < n; c2++) {
        var xr = X[2 * (r * n + c2)], xi = X[2 * (r * n + c2) + 1];
        out[2 * (r * n + c2)] = (xr * d2r + xi * d2i) / dd;
        out[2 * (r * n + c2) + 1] = (xi * d2r - xr * d2i) / dd;
      }
    }
    return out;
  }

  // real symmetric Jacobi eigenvalues
  function jacobiEig(Ain, n) {
    var A = [];
    for (var r = 0; r < n; r++) { A.push(new Float64Array(n)); for (var c = 0; c < n; c++) A[r][c] = Ain[r * n + c]; }
    for (var sweep = 0; sweep < 30; sweep++) {
      var off = 0;
      for (var p = 0; p < n; p++) for (var q = p + 1; q < n; q++) off += A[p][q] * A[p][q];
      if (off < 1e-22) break;
      for (p = 0; p < n - 1; p++) for (q = p + 1; q < n; q++) {
        var apq = A[p][q];
        if (Math.abs(apq) < 1e-16) continue;
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

  // ---- TE of the Gaussian IM across the cut after step k --------------------------
  function teGaussian(D, T, k) {
    var n = 2 * T, N2 = 2 * n; // pairing over (out, in) families
    var A = new Float64Array(2 * N2 * N2);
    for (var a = 0; a < n; a++) for (var b = 0; b < n; b++) {
      A[2 * (a * N2 + (n + b))] = D[2 * (a * n + b)];
      A[2 * (a * N2 + (n + b)) + 1] = D[2 * (a * n + b) + 1];
      A[2 * ((n + b) * N2 + a)] = -D[2 * (a * n + b)];
      A[2 * ((n + b) * N2 + a) + 1] = -D[2 * (a * n + b) + 1];
    }
    var Ad = cdagger(A, N2);
    var X = cmatmul(A, Ad, N2);
    for (a = 0; a < N2; a++) X[2 * (a * N2 + a)] += 1;          // 1 + AA†
    var Cf = cmatmul(Ad, csolve(X, A, N2), N2);                  // ⟨c†c⟩
    var Ff = csolve(X, A, N2);                                    // (1+AA†)⁻¹A, negate below
    for (a = 0; a < 2 * N2 * N2; a++) Ff[a] = -Ff[a];            // ⟨cc⟩
    // subset: contour points with time ≤ t_k on both branches, both families
    var pts = [];
    for (var p = 0; p < k; p++) pts.push(p);
    for (p = 2 * T - k; p < 2 * T; p++) pts.push(p);
    var modes = pts.concat(pts.map(function (x) { return x + n; }));
    var m = modes.length;
    // Majorana covariance Γ restricted to the subset
    var Gam = new Float64Array(2 * m * 2 * m);
    for (a = 0; a < m; a++) for (b = 0; b < m; b++) {
      var ia = modes[a], ib = modes[b];
      var cc_r = Ff[2 * (ia * N2 + ib)], cc_i = Ff[2 * (ia * N2 + ib) + 1];
      var cd_r = Cf[2 * (ia * N2 + ib)], cd_i = Cf[2 * (ia * N2 + ib) + 1];
      var dc_r = (ia === ib ? 1 : 0) - Cf[2 * (ib * N2 + ia)], dc_i = -(-Cf[2 * (ib * N2 + ia) + 1]);
      dc_i = Cf[2 * (ib * N2 + ia) + 1]; // ⟨c c†⟩ = δ − ⟨c†c⟩ᵀ: real δ minus (Cf)_{ba}
      dc_r = (ia === ib ? 1 : 0) - Cf[2 * (ib * N2 + ia)];
      dc_i = -Cf[2 * (ib * N2 + ia) + 1];
      var dd_r = Ff[2 * (ib * N2 + ia)], dd_i = -Ff[2 * (ib * N2 + ia) + 1]; // conj(F_ba)
      // the four Majorana blocks; Γ = Im part of (⟨γγ⟩ − 1)/i, i.e. Im component
      var g00_i = cc_i + dc_i + cd_i + dd_i;
      var g01_i = -(cc_r - dc_r + cd_r - dd_r);
      var g10_i = -(cc_r + dc_r - cd_r - dd_r);
      var g11_i = -(cc_i - dc_i - cd_i + dd_i);
      Gam[(2 * a) * 2 * m + (2 * b)] = g00_i;
      Gam[(2 * a) * 2 * m + (2 * b + 1)] = g01_i;
      Gam[(2 * a + 1) * 2 * m + (2 * b)] = g10_i;
      Gam[(2 * a + 1) * 2 * m + (2 * b + 1)] = g11_i;
    }
    // eigenvalues of −Γ² (real symmetric PSD) are λ², each doubled
    var n2 = 2 * m, M2 = new Float64Array(n2 * n2);
    for (a = 0; a < n2; a++) for (b = 0; b < n2; b++) {
      var s2 = 0;
      for (var c3 = 0; c3 < n2; c3++) s2 += Gam[a * n2 + c3] * Gam[b * n2 + c3]; // ΓΓᵀ = −Γ²
      M2[a * n2 + b] = s2;
    }
    var ev = jacobiEig(M2, n2).map(function (x) { return Math.max(0, x); }).sort(function (x, y) { return y - x; });
    var S = 0;
    for (a = 0; a < ev.length; a += 2) {           // each λ² appears twice
      var l = Math.sqrt(Math.min(1, ev[a]));
      var z1 = (1 + l) / 2, z2 = (1 - l) / 2;
      if (z1 > 1e-12) S -= z1 * Math.log(z1);
      if (z2 > 1e-12) S -= z2 * Math.log(z2);
    }
    return S;   // ev has 2m entries = m doubled λ²'s; the a += 2 loop visits each mode pair once
  }

  // ---- widget ---------------------------------------------------------------------
  function createGaussianIM(mount, opts) {
    opts = opts || {};
    var state = { gamma: opts.gamma || 0.6, dt: opts.dt || 0.4, corr: null };

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
    var colA = document.createElement("div"), colB = document.createElement("div");
    root.appendChild(colA); root.appendChild(colB);
    var cvA = document.createElement("canvas");
    cvA.width = 290; cvA.height = 310; cvA.style.cssText = "max-width:100%;height:auto;";
    colA.appendChild(cvA);
    var cvB = document.createElement("canvas");
    cvB.width = 290; cvB.height = 310; cvB.style.cssText = "max-width:100%;height:auto;";
    colB.appendChild(cvB);
    var status = document.createElement("div");
    status.style.cssText = "flex-basis:100%;text-align:center;font-size:0.75rem;opacity:0.75;";
    root.appendChild(status);

    var TMAP = 36, TCURVE = [8, 16, 24, 32, 40];

    function drawKernel() {
      var ctx = cvA.getContext("2d"), c = colors();
      var W = cvA.width, H = cvA.height, x0 = 38, y0 = 34, sz = 220;
      ctx.clearRect(0, 0, W, H);
      var D = contourKernel(TMAP, state.gamma, state.corr);
      var n = 2 * TMAP, cell = sz / TMAP;
      // draw the forward-forward block |Δ_kl|
      var vmax = 0, vals = [];
      for (var a = 0; a < TMAP; a++) { vals.push([]);
        for (var b = 0; b < TMAP; b++) {
          var re = D[2 * (a * n + b)], im2 = D[2 * (a * n + b) + 1];
          var v = Math.sqrt(re * re + im2 * im2);
          vals[a].push(v); if (a !== b) vmax = Math.max(vmax, v);
        }
      }
      var m2 = /^#?([0-9a-f]{6})$/i.exec(c.accent.replace("#", ""));
      var ar2 = m2 ? parseInt(m2[1].slice(0, 2), 16) : 31, ag = m2 ? parseInt(m2[1].slice(2, 4), 16) : 178, ab = m2 ? parseInt(m2[1].slice(4, 6), 16) : 166;
      for (a = 0; a < TMAP; a++) for (var b2 = 0; b2 < TMAP; b2++) {
        var w = Math.min(1, vals[a][b2] / vmax);
        ctx.fillStyle = "rgba(" + ar2 + "," + ag + "," + ab + "," + (0.05 + 0.92 * Math.pow(w, 0.6)).toFixed(3) + ")";
        ctx.fillRect(x0 + b2 * cell, y0 + a * cell, cell + 0.4, cell + 0.4);
      }
      ctx.fillStyle = c.text; ctx.font = "10px system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("the memory kernel |Δ(t, t′)|", x0 + sz / 2, 18);
      ctx.fillText("t′ →", x0 + sz / 2, y0 + sz + 16);
      ctx.save(); ctx.translate(x0 - 12, y0 + sz / 2); ctx.rotate(-Math.PI / 2); ctx.fillText("t →", 0, 0); ctx.restore();
      ctx.font = "9px system-ui, sans-serif";
      ctx.fillText("bright ridge = recent memory · fading off-diagonal ~ |t−t′|^(−3/2)", x0 + sz / 2, y0 + sz + 32);
      ctx.textAlign = "start";
    }

    function drawCurve() {
      var ctx = cvB.getContext("2d"), c = colors();
      var W = cvB.width, H = cvB.height, x0 = 44, y0 = H - 56, x1 = W - 14, y1 = 30;
      ctx.clearRect(0, 0, W, H);
      var Ss = TCURVE.map(function (T) { return teGaussian(contourKernel(T, state.gamma, state.corr), T, Math.floor(T / 2)); });
      var Smax = Math.max(0.5, Math.max.apply(null, Ss) * 1.25);
      var xOf = function (T) { return x0 + (Math.log(T) - Math.log(6)) / (Math.log(44) - Math.log(6)) * (x1 - x0); };
      var yOf = function (S) { return y0 - S / Smax * (y0 - y1); };
      ctx.strokeStyle = c.faint; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
      ctx.fillStyle = c.text; ctx.font = "10px system-ui, sans-serif"; ctx.textAlign = "center";
      TCURVE.forEach(function (T) { ctx.fillText(String(T), xOf(T), y0 + 14); });
      ctx.fillText("T   (log axis)", (x0 + x1) / 2, y0 + 30);
      ctx.save(); ctx.translate(12, (y0 + y1) / 2); ctx.rotate(-Math.PI / 2); ctx.fillText("S(mid)", 0, 0); ctx.restore();
      // straight-line fit through the last two points, extended (log axis ⇒ log growth = straight)
      var i1 = TCURVE.length - 2, i2 = TCURVE.length - 1;
      var slope = (Ss[i2] - Ss[i1]) / (Math.log(TCURVE[i2]) - Math.log(TCURVE[i1]));
      ctx.strokeStyle = c.faint; ctx.setLineDash([3, 4]); ctx.beginPath();
      ctx.moveTo(xOf(6), yOf(Ss[i2] + slope * (Math.log(6) - Math.log(TCURVE[i2]))));
      ctx.lineTo(xOf(44), yOf(Ss[i2] + slope * (Math.log(44) - Math.log(TCURVE[i2]))));
      ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = c.accent; ctx.lineWidth = 2; ctx.beginPath();
      TCURVE.forEach(function (T, i) { var x = xOf(T), y = yOf(Ss[i]); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
      ctx.stroke();
      TCURVE.forEach(function (T, i) {
        ctx.fillStyle = c.accent; ctx.beginPath(); ctx.arc(xOf(T), yOf(Ss[i]), 3.4, 0, 2 * Math.PI); ctx.fill();
      });
      ctx.fillStyle = c.text; ctx.font = "10px system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("temporal entanglement, mid cut", (x0 + x1) / 2, 16);
      ctx.font = "9px system-ui, sans-serif";
      ctx.fillText("straight on a log axis = logarithmic growth", (x0 + x1) / 2, H - 8);
      ctx.fillText("slope ≈ " + slope.toFixed(3) + " per ln T", (x0 + x1) / 2, y1 + 12);
      ctx.textAlign = "start";
    }

    function recompute() {
      state.corr = leadCorrelators(50, state.dt);
      drawKernel();
      status.textContent = "computing the Gaussian temporal entanglement…";
      setTimeout(function () {
        drawCurve();
        status.textContent = "everything computed live — single-particle linear algebra only; the spin-language object at T=40 would have 4⁴⁰ ≈ 10²⁴ components";
      }, 30);
    }
    recompute();

    return {
      setParams: function (gamma, dt) { state.gamma = +gamma; state.dt = +dt; recompute(); },
      redraw: recompute,
      destroy: function () { mount.removeChild(root); }
    };
  }

  global.createGaussianIM = createGaussianIM;
  global.__gaussianImPhysics = { leadCorrelators: leadCorrelators, contourKernel: contourKernel, teGaussian: teGaussian };
})(typeof window !== "undefined" ? window : globalThis);
