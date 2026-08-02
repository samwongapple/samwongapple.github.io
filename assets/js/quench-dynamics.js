/*
 * quench-dynamics.js — free-fermion quench explorer for the free-fermion blog arc
 * ("Setting the Matrix in Motion").
 *
 * Physics.  A quadratic Hamiltonian H = Σ_ij h_ij c†_i c_j evolves the correlation matrix
 * by conjugation with the SINGLE-PARTICLE propagator:
 *
 *     C(t) = U(t) C(0) U(t)†,      U(t) = exp(-i h t).
 *
 * The initial state here is the charge-density wave |1010...>, a product state with
 * C(0) = diag(1,0,1,0,...).  It is quenched with the uniform hopping chain
 * h_ij = -t (δ_{i,j+1} + δ_{i,j-1}), open boundaries.
 *
 * Implementation.  h is real symmetric, so one Jacobi eigensolver gives h = V diag(e) V^T
 * ONCE, and then U(t) = V diag(e^{-i e_k t}) V^T is assembled cheaply at every frame.
 * C(t) is complex Hermitian; its restriction to a block is diagonalized by embedding
 *
 *     C = X + iY   ->   [[X, -Y], [Y, X]]   (real symmetric, 2n x 2n)
 *
 * whose eigenvalues are those of C, each appearing exactly twice.  So the same real
 * Jacobi routine serves the whole widget — no complex eigensolver needed.
 *
 * Entanglement entropy uses the same binary-entropy sum as the static case:
 *     S_A(t) = -Σ_k [ζ_k ln ζ_k + (1-ζ_k) ln(1-ζ_k)],  ζ_k = eigenvalues of C(t)|_A.
 *
 * Panels: (A) |C_ij(t)| heatmap — the light cone opening from the diagonal;
 *         (B) site density n_j(t) — the density wave melting;
 *         (C) S_A(t) traced live, with the ballistic-growth regime visible.
 *
 * Vanilla JS, no dependencies.  Colours read from the site's CSS theme variables.
 *
 * Usage:
 *   const q = createQuenchDynamics(el, { N: 40, LA: 12 });
 *   q.play(); q.pause(); q.toggle(); q.reset(); q.setLA(16); q.destroy();
 */
(function (global) {
  "use strict";

  function zeros2(n) {
    var A = new Array(n);
    for (var i = 0; i < n; i++) A[i] = new Float64Array(n);
    return A;
  }

  // ---- real symmetric Jacobi: returns {values, vectors} (vectors[row][col]) ----
  function jacobiEigen(A, n) {
    var V = zeros2(n), i, j, k;
    for (i = 0; i < n; i++) V[i][i] = 1;
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
          for (k = 0; k < n; k++) {
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

  // ---- eigenvalues of a complex Hermitian matrix (X + iY) via real embedding ----
  // Returns n eigenvalues (each of the 2n embedded ones appears twice; we take every other).
  function hermitianEigenvalues(X, Y, n) {
    var m = 2 * n, E = zeros2(m), i, j;
    for (i = 0; i < n; i++) {
      for (j = 0; j < n; j++) {
        E[i][j] = X[i][j];
        E[i][j + n] = -Y[i][j];
        E[i + n][j] = Y[i][j];
        E[i + n][j + n] = X[i][j];
      }
    }
    var vals = Array.from(jacobiEigen(E, m).values);
    vals.sort(function (a, b) { return a - b; });
    var out = [];
    for (i = 0; i < m; i += 2) out.push(vals[i]);
    return out;
  }

  function binEntropy(z) {
    if (z <= 1e-13 || z >= 1 - 1e-13) return 0;
    return -z * Math.log(z) - (1 - z) * Math.log(1 - z);
  }

  function parseRGB(str, fallback) {
    str = (str || "").trim();
    var m;
    if ((m = str.match(/^#([0-9a-f]{3})$/i)))
      return [parseInt(m[1][0] + m[1][0], 16), parseInt(m[1][1] + m[1][1], 16), parseInt(m[1][2] + m[1][2], 16)];
    if ((m = str.match(/^#([0-9a-f]{6})$/i)))
      return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)];
    if ((m = str.match(/rgba?\(([^)]+)\)/i))) {
      var p = m[1].split(",").map(parseFloat);
      return [p[0], p[1], p[2]];
    }
    return fallback;
  }

  // ---- DOM-free physics core (also used by the unit tests) -------------------
  // Diagonalizes the post-quench hopping chain once, then evolves C(0) = CDW.
  function makeSolver(N, hop) {
    var hmat = zeros2(N), i, j, k;
    for (i = 0; i < N - 1; i++) { hmat[i][i + 1] = -hop; hmat[i + 1][i] = -hop; }
    var eig = jacobiEigen(hmat, N);
    var energies = eig.values, Vv = eig.vectors;

    // initial charge-density-wave state |1010...>: C(0) = diag(1,0,1,0,...)
    var C0 = new Float64Array(N);
    for (i = 0; i < N; i++) C0[i] = i % 2 === 0 ? 1 : 0;

    var Ur = zeros2(N), Ui = zeros2(N);   // U(t) real / imaginary parts
    var Cr = zeros2(N), Ci = zeros2(N);   // C(t) real / imaginary parts
    var density = new Float64Array(N);

    // C(t) = U C0 U†  with C0 diagonal:  C_ab = Σ_m U_am C0_m conj(U_bm)
    function computeC(t) {
      var cosv = new Float64Array(N), sinv = new Float64Array(N);
      for (k = 0; k < N; k++) { cosv[k] = Math.cos(energies[k] * t); sinv[k] = -Math.sin(energies[k] * t); }
      for (i = 0; i < N; i++) {
        var Ri = Ur[i], Ii = Ui[i], Vi = Vv[i];
        Ri.fill(0); Ii.fill(0);
        for (k = 0; k < N; k++) {
          var vik = Vi[k];
          if (vik === 0) continue;
          var rc = vik * cosv[k], rs = vik * sinv[k];
          for (j = 0; j < N; j++) {
            var vjk = Vv[j][k];
            Ri[j] += rc * vjk;
            Ii[j] += rs * vjk;
          }
        }
      }
      for (i = 0; i < N; i++) {
        var cri = Cr[i], cii = Ci[i], uri = Ur[i], uii = Ui[i];
        cri.fill(0); cii.fill(0);
        for (var m = 0; m < N; m++) {
          var w = C0[m];
          if (w === 0) continue;
          var ar = uri[m], ai = uii[m];
          for (j = 0; j < N; j++) {
            var br = Ur[j][m], bi = -Ui[j][m];   // conj(U_jm)
            cri[j] += w * (ar * br - ai * bi);
            cii[j] += w * (ar * bi + ai * br);
          }
        }
      }
      for (i = 0; i < N; i++) density[i] = Cr[i][i];
    }

    // entanglement entropy of the CENTRED block of LA sites
    function blockEntropy(LA) {
      var lo = Math.floor((N - LA) / 2);
      var X = zeros2(LA), Y = zeros2(LA), a, b;
      for (a = 0; a < LA; a++) {
        for (b = 0; b < LA; b++) {
          X[a][b] = Cr[lo + a][lo + b];
          Y[a][b] = Ci[lo + a][lo + b];
        }
      }
      var ev = hermitianEigenvalues(X, Y, LA);
      var S = 0;
      for (a = 0; a < ev.length; a++) S += binEntropy(Math.max(0, Math.min(1, ev[a])));
      return S;
    }

    return {
      computeC: computeC, blockEntropy: blockEntropy,
      Cr: Cr, Ci: Ci, density: density, energies: energies,
    };
  }

  function createQuenchDynamics(container, opts) {
    if (!container) throw new Error("createQuenchDynamics: container required");
    opts = opts || {};
    var N = opts.N || 60;
    var LA = opts.LA || 16;               // centred block of LA sites
    var hop = 1;                          // t = 1 sets the unit of time
    var timeScale = opts.timeScale || 1.1; // sim time units per wall-clock second
    // default window stops just before quasiparticles reflect off the open ends
    // (reflection revival sets in around t ~ N/4) so growth + saturation stay clean
    var tMax = opts.tMax || 12;
    var onState = opts.onState || null;

    var solver = makeSolver(N, hop);
    var Cr = solver.Cr, Ci = solver.Ci, density = solver.density;
    var time = 0, SA = 0, trace = [];     // trace = [[t, S], ...]

    function step(t) {
      time = t;
      solver.computeC(t);
      SA = solver.blockEntropy(LA);
      if (onState) onState({ t: time, S: SA });
    }

    // ---- layout ----
    var W = 520;
    var hmX = 16, hmY = 40, hmS = 190;                      // panel A heatmap
    var dnX = hmX, dnY = hmY + hmS + 34, dnW = hmS, dnH = 74; // panel B density
    var stX = hmX + hmS + 52, stY = hmY, stW = W - 20 - stX, stH = hmS + 34 + 74; // panel C S(t)
    var H = dnY + dnH + 40;

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

    var heat = document.createElement("canvas");
    heat.width = N; heat.height = N;
    var hctx = heat.getContext("2d");

    var col = {};
    function refreshTheme() {
      var cs = getComputedStyle(document.documentElement);
      col.accent = (cs.getPropertyValue("--global-theme-color") || "#1fb2a6").trim() || "#1fb2a6";
      col.text = (cs.getPropertyValue("--global-text-color") || "#888").trim() || "#888";
      col.divider = (cs.getPropertyValue("--global-divider-color") || "#8884").trim() || "#8884";
      col.amber = "#e0a63a";
      col.accentRGB = parseRGB(col.accent, [31, 178, 166]);
    }
    refreshTheme();

    function paintHeat() {
      var img = hctx.createImageData(N, N), d = img.data;
      var r = col.accentRGB[0], g = col.accentRGB[1], b = col.accentRGB[2];
      for (var a = 0; a < N; a++) {
        for (var c = 0; c < N; c++) {
          var re = Cr[a][c], im = Ci[a][c];
          var v = Math.sqrt(re * re + im * im);
          v = Math.pow(Math.min(1, v / 0.5), 0.6);
          var o = (a * N + c) * 4;
          d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = Math.round(v * 255);
        }
      }
      hctx.putImageData(img, 0, 0);
    }

    function panelTitle(txt, x, y) {
      ctx.save();
      ctx.fillStyle = col.text; ctx.globalAlpha = 0.85;
      ctx.font = "600 11px system-ui, sans-serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText(txt, x, y);
      ctx.restore();
    }

    function render() {
      ctx.clearRect(0, 0, W, H);

      // ---- panel A: |C_ij(t)| ----
      panelTitle("|Cᵢⱼ(t)|  — the light cone", hmX, hmY - 10);
      paintHeat();
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(heat, hmX, hmY, hmS, hmS);
      ctx.strokeStyle = col.divider; ctx.lineWidth = 1;
      ctx.strokeRect(hmX - 0.5, hmY - 0.5, hmS + 1, hmS + 1);
      // subsystem block marker
      var lo = Math.floor((N - LA) / 2), s = hmS / N;
      ctx.strokeStyle = col.amber; ctx.lineWidth = 1.4; ctx.globalAlpha = 0.9;
      ctx.strokeRect(hmX + lo * s, hmY + lo * s, LA * s, LA * s);
      ctx.restore();

      // ---- panel B: density ----
      panelTitle("site density  nⱼ(t)", dnX, dnY - 10);
      ctx.save();
      ctx.strokeStyle = col.divider; ctx.lineWidth = 1;
      ctx.strokeRect(dnX - 0.5, dnY - 0.5, dnW + 1, dnH + 1);
      // half-filling guide
      ctx.globalAlpha = 0.35; ctx.strokeStyle = col.text;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(dnX, dnY + dnH / 2); ctx.lineTo(dnX + dnW, dnY + dnH / 2); ctx.stroke();
      ctx.setLineDash([]);
      var bw = dnW / N;
      for (var q = 0; q < N; q++) {
        var nq = Math.max(0, Math.min(1, density[q]));
        ctx.globalAlpha = 0.85; ctx.fillStyle = col.accent;
        ctx.fillRect(dnX + q * bw + 0.5, dnY + dnH * (1 - nq), Math.max(1, bw - 1), dnH * nq);
      }
      ctx.globalAlpha = 0.7; ctx.fillStyle = col.text;
      ctx.font = "10px system-ui, sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillText("½", dnX + 2, dnY + dnH / 2 + 2);
      ctx.restore();

      // ---- panel C: S_A(t) ----
      panelTitle("Sₐ(t)", stX, stY - 10);
      var x0 = stX, x1 = stX + stW, y0 = stY, y1 = stY + stH;
      var smax = Math.max(1e-6, LA * Math.LN2 * 0.85);
      function TX(t) { return x0 + (t / tMax) * (x1 - x0); }
      function TY(s) { return y1 - (s / smax) * (y1 - y0); }
      ctx.save();
      ctx.strokeStyle = col.text; ctx.globalAlpha = 0.45; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      // saturation scale marker
      ctx.globalAlpha = 0.75; ctx.fillStyle = col.text;
      ctx.font = "10px system-ui, sans-serif"; ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillText(smax.toFixed(1), x0 - 4, y0);
      ctx.fillText("0", x0 - 4, y1);
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText("t", (x0 + x1) / 2, y1 + 5);
      ctx.fillText(String(tMax), x1, y1 + 5);
      // the traced curve
      ctx.globalAlpha = 0.95; ctx.strokeStyle = col.accent; ctx.lineWidth = 2;
      ctx.beginPath();
      for (var p = 0; p < trace.length; p++) {
        var px = TX(trace[p][0]), py = TY(trace[p][1]);
        if (p === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      // current point
      if (trace.length) {
        ctx.fillStyle = col.amber;
        ctx.beginPath(); ctx.arc(TX(time), TY(SA), 4, 0, 2 * Math.PI); ctx.fill();
      }
      ctx.restore();

      // readout
      ctx.save();
      ctx.fillStyle = col.text; ctx.globalAlpha = 0.9;
      ctx.font = "11px system-ui, sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillText("t = " + time.toFixed(2) + "    Lₐ = " + LA +
                   "    Sₐ = " + SA.toFixed(3) + "  (" + (SA / Math.LN2).toFixed(2) + " × ln2)",
                   hmX, H - 20);
      ctx.restore();
    }

    // ---- animation ----
    var running = opts.autoplay !== false, raf = null, last = null;
    function frame(ts) {
      if (last == null) last = ts;
      var dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;
      refreshTheme();
      if (running) {
        var nt = time + dt * timeScale;
        if (nt > tMax) { nt = tMax; running = false; }
        step(nt);
        trace.push([time, SA]);
      }
      render();
      raf = global.requestAnimationFrame(frame);
    }

    step(0);
    trace.push([0, SA]);
    raf = global.requestAnimationFrame(frame);

    return {
      play: function () { if (time >= tMax) { time = 0; trace = []; } running = true; last = null; },
      pause: function () { running = false; },
      toggle: function () {
        if (time >= tMax) { time = 0; trace = []; step(0); trace.push([0, SA]); }
        running = !running; last = null; return running;
      },
      reset: function () { time = 0; trace = []; step(0); trace.push([0, SA]); },
      setLA: function (v) {
        LA = Math.max(2, Math.min(N - 2, Math.round(+v)));
        time = 0; trace = []; step(0); trace.push([0, SA]);
      },
      isRunning: function () { return running; },
      getState: function () { return { t: time, S: SA, LA: LA }; },
      redraw: function () { resize(); },
      refreshTheme: refreshTheme,
      destroy: function () {
        if (raf) global.cancelAnimationFrame(raf);
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      },
    };
  }

  global.createQuenchDynamics = createQuenchDynamics;
  createQuenchDynamics._test = {
    jacobiEigen: jacobiEigen, hermitianEigenvalues: hermitianEigenvalues,
    binEntropy: binEntropy, makeSolver: makeSolver,
  };
})(typeof window !== "undefined" ? window : this);
