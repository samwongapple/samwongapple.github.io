/*
 * kitaev-entanglement.js — Kitaev-chain phase explorer for the free-fermion blog arc
 * ("Pairing: Majoranas, BdG, and the Kitaev Chain").
 *
 * Physics.  The Kitaev chain with open boundaries,
 *
 *   H = -mu Σ_j c†_j c_j - t Σ_j (c†_j c_{j+1} + h.c.) + Δ Σ_j (c_j c_{j+1} + h.c.),
 *
 * written in Majoranas  γ_{2j-1} = c_j + c†_j,  γ_{2j} = i(c†_j - c_j)  (the sign
 * convention used across this blog) becomes  H = (i/4) Σ_ab M_ab γ_a γ_b  with M real
 * antisymmetric and only three nonzero couplings per cell:
 *
 *   M_{2j-1,2j}   = -mu          (intra-site  — trivial dimerization)
 *   M_{2j,2j+1}   =  t + Δ       (inter-site  — topological dimerization)
 *   M_{2j-1,2j+2} =  Δ - t
 *
 * At mu = 0, t = Δ this reduces to Kitaev's famous H = i t Σ_j γ_{2j} γ_{2j+1}: every
 * Majorana is bonded to one on the NEXT site, and γ_1, γ_{2N} drop out of H entirely —
 * the unpaired edge modes.
 *
 * Ground-state covariance matrix.  Γ_ab = (i/2)<[γ_a, γ_b]> minimises (1/4)Σ M_ab Γ_ab
 * over antisymmetric Γ with Γ^T Γ = 1 on the support of M.  The minimiser is minus the
 * orthogonal polar factor of M,
 *
 *   Γ = -M (M^T M)^{-1/2},
 *
 * with the inverse square root taken as a pseudo-inverse (kernel -> 0, i.e. exactly the
 * maximally mixed unpaired edge Majoranas).  Everything here is REAL SYMMETRIC, so one
 * Jacobi eigensolver does the whole job — no complex arithmetic anywhere.
 *
 * Entanglement.  Restrict Γ to the Majorana indices of region A.  The canonical (Youla)
 * values λ_k of the restricted block are the square roots of the eigenvalues of
 * Γ|_A^T Γ|_A (doubly degenerate), and the natural-orbital occupations are
 * ζ_k = (1 ± λ_k)/2, so the entropy is the same binary-entropy sum as the
 * number-conserving case.  A Majorana in A whose partner lies in B leaves λ = 0, i.e. an
 * eigenvalue pinned at ζ = 1/2 worth exactly ln 2.
 *
 * Vanilla JS, no dependencies.  Colours read from the site's CSS theme variables.
 *
 * Usage:
 *   const k = createKitaevEntanglement(el, { N: 20, mu: 0, delta: 1 });
 *   k.setMu(-1.5); k.setDelta(0.8); k.redraw(); k.destroy();
 */
(function (global) {
  "use strict";

  // ---- real symmetric eigen-decomposition (cyclic Jacobi) --------------------
  // A: n x n as array of Float64Array (destroyed). Returns { values, vectors }
  // with vectors[i] the i-th column-eigenvector as a Float64Array.
  function jacobiEigen(A, n) {
    var V = new Array(n), i, j, k;
    for (i = 0; i < n; i++) {
      V[i] = new Float64Array(n);
      V[i][i] = 1;
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
    return { values: vals, vectors: V };   // V[row][col], column c = eigenvector c
  }

  function zeros(n) {
    var A = new Array(n);
    for (var i = 0; i < n; i++) A[i] = new Float64Array(n);
    return A;
  }

  // ---- Kitaev chain Majorana coupling matrix M (2N x 2N, real antisymmetric) --
  // Majorana index a = 0..2N-1 corresponds to γ_{a+1}; site j (0-based) owns 2j, 2j+1.
  function buildM(N, mu, t, delta) {
    var M = zeros(2 * N), j;
    for (j = 0; j < N; j++) {
      // intra-site: M_{2j-1,2j} = -mu   (1-based) -> indices (2j, 2j+1) 0-based
      M[2 * j][2 * j + 1] = -mu;
      M[2 * j + 1][2 * j] = mu;
    }
    for (j = 0; j < N - 1; j++) {
      // inter-site: M_{2j,2j+1} = t + delta (1-based) -> (2j+1, 2j+2) 0-based
      M[2 * j + 1][2 * j + 2] = t + delta;
      M[2 * j + 2][2 * j + 1] = -(t + delta);
      // M_{2j-1,2j+2} = delta - t (1-based) -> (2j, 2j+3) 0-based
      M[2 * j][2 * j + 3] = delta - t;
      M[2 * j + 3][2 * j] = -(delta - t);
    }
    return M;
  }

  // ---- ground-state covariance Γ = -M (M^T M)^{-1/2}  (pseudo-inverse) -------
  function groundStateGamma(M, n) {
    // S = M^T M  (real symmetric PSD)
    var S = zeros(n), i, j, k, s;
    for (i = 0; i < n; i++) {
      for (j = 0; j < n; j++) {
        s = 0;
        for (k = 0; k < n; k++) s += M[k][i] * M[k][j];
        S[i][j] = s;
      }
    }
    var eig = jacobiEigen(S, n);
    // scale tolerance to the largest singular value
    var smax = 0;
    for (i = 0; i < n; i++) smax = Math.max(smax, eig.values[i]);
    var tol = Math.max(1e-12, smax * 1e-10);
    // W = V diag(f) V^T  with f = 1/sqrt(s) on the support, 0 on the kernel
    var W = zeros(n);
    for (k = 0; k < n; k++) {
      var sv = eig.values[k];
      if (sv <= tol) continue;
      var f = 1 / Math.sqrt(sv);
      for (i = 0; i < n; i++) {
        var vik = eig.vectors[i][k];
        if (vik === 0) continue;
        for (j = 0; j < n; j++) W[i][j] += f * vik * eig.vectors[j][k];
      }
    }
    // Γ = -M W
    var G = zeros(n);
    for (i = 0; i < n; i++) {
      for (j = 0; j < n; j++) {
        s = 0;
        for (k = 0; k < n; k++) s += M[i][k] * W[k][j];
        G[i][j] = -s;
      }
    }
    return G;
  }

  // ---- entanglement of Majorana indices [0, m) of Γ --------------------------
  // Returns { lambdas (length m/2, descending), zetas, S }.
  function entanglementFromGamma(G, m) {
    var B = zeros(m), i, j, k, s;
    for (i = 0; i < m; i++) for (j = 0; j < m; j++) B[i][j] = G[i][j];
    // P = B^T B (real symmetric PSD); eigenvalues are λ² each twice
    var P = zeros(m);
    for (i = 0; i < m; i++) {
      for (j = 0; j < m; j++) {
        s = 0;
        for (k = 0; k < m; k++) s += B[k][i] * B[k][j];
        P[i][j] = s;
      }
    }
    var vals = Array.from(jacobiEigen(P, m).values);
    vals.sort(function (a, b) { return b - a; });
    var lambdas = [], zetas = [], S = 0;
    for (i = 0; i < m; i += 2) {          // take one of each degenerate pair
      var lam = Math.sqrt(Math.max(0, Math.min(1, vals[i])));
      lambdas.push(lam);
      var z = (1 + lam) / 2;
      zetas.push(z);
      if (z > 1e-13 && z < 1 - 1e-13) S += -(z * Math.log(z) + (1 - z) * Math.log(1 - z));
    }
    return { lambdas: lambdas, zetas: zetas, S: S };
  }

  function createKitaevEntanglement(container, opts) {
    if (!container) throw new Error("createKitaevEntanglement: container required");
    opts = opts || {};
    var N = opts.N || 20;
    var t = 1;
    var mu = opts.mu != null ? +opts.mu : 0;
    var delta = opts.delta != null ? +opts.delta : 1;
    var onState = opts.onState || null;

    var G = null, ent = null;
    var sweepMu = [], sweepZ = [], sweepS = [];   // fan-plot cache

    // ---- layout ----
    var W = 520;
    var bcX = 16, bcY = 46, bcW = W - 32, bcH = 96;          // panel A: bond cartoon
    var fpX = 46, fpY = 210, fpW = W - 66, fpH = 168;        // panel B: fan plot
    var H = fpY + fpH + 46;

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

    // ---- compute ----
    function recompute() {
      G = groundStateGamma(buildM(N, mu, t, delta), 2 * N);
      ent = entanglementFromGamma(G, N);   // A = left half: N Majoranas = N/2 sites
      if (onState) onState({ mu: mu, delta: delta, S: ent.S, zetas: ent.zetas.slice() });
    }

    function computeSweep() {
      sweepMu = []; sweepZ = []; sweepS = [];
      for (var m = -4; m <= 4.0001; m += 0.1) {
        var g = groundStateGamma(buildM(N, m, t, delta), 2 * N);
        var e = entanglementFromGamma(g, N);
        sweepMu.push(m);
        sweepZ.push(e.zetas);
        sweepS.push(e.S);
      }
    }

    // ---- drawing ----
    function panelTitle(txt, x, y) {
      ctx.save();
      ctx.fillStyle = col.text; ctx.globalAlpha = 0.85;
      ctx.font = "600 11px system-ui, sans-serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText(txt, x, y);
      ctx.restore();
    }

    // Majorana screen position: site j (0-based), which = 0 (γ_{2j+1}) or 1 (γ_{2j+2})
    var siteW = 0, majR = 3.4;
    function majX(j, which) {
      return bcX + (j + 0.5) * siteW + (which === 0 ? -siteW * 0.22 : siteW * 0.22);
    }
    var majY = 0;

    function drawBondCartoon() {
      panelTitle("Majorana pairing  (bond opacity ∝ |Γ| · two dots per site)", bcX, bcY - 12);
      siteW = bcW / N;
      majY = bcY + bcH * 0.52;
      ctx.save();

      // site boxes (faint) to make "inside a site" visible
      for (var j = 0; j < N; j++) {
        ctx.globalAlpha = 0.07;
        ctx.fillStyle = col.text;
        ctx.fillRect(bcX + j * siteW + 1.5, majY - 15, siteW - 3, 30);
      }

      // pairing "purity" per Majorana: p_a = Σ_b Γ_ab²  (1 = fully paired, 0 = free)
      var p = new Float64Array(2 * N), a, b;
      for (a = 0; a < 2 * N; a++) {
        var s = 0;
        for (b = 0; b < 2 * N; b++) s += G[a][b] * G[a][b];
        p[a] = s;
      }

      // intra-site bonds (trivial dimerization) — drawn BELOW the axis
      for (j = 0; j < N; j++) {
        var w = Math.abs(G[2 * j][2 * j + 1]);
        if (w < 0.04) continue;
        var x0 = majX(j, 0), x1 = majX(j, 1);
        ctx.globalAlpha = Math.min(1, w) * 0.95;
        ctx.strokeStyle = col.text;
        ctx.lineWidth = 1 + 2.4 * Math.min(1, w);
        ctx.beginPath();
        ctx.moveTo(x0, majY);
        ctx.quadraticCurveTo((x0 + x1) / 2, majY + 17, x1, majY);
        ctx.stroke();
      }
      // inter-site bonds (topological dimerization) — drawn ABOVE the axis, teal
      for (j = 0; j < N - 1; j++) {
        var w2 = Math.abs(G[2 * j + 1][2 * j + 2]);
        if (w2 < 0.04) continue;
        var xa = majX(j, 1), xb = majX(j + 1, 0);
        ctx.globalAlpha = Math.min(1, w2) * 0.95;
        ctx.strokeStyle = col.accent;
        ctx.lineWidth = 1 + 2.4 * Math.min(1, w2);
        ctx.beginPath();
        ctx.moveTo(xa, majY);
        ctx.quadraticCurveTo((xa + xb) / 2, majY - 19, xb, majY);
        ctx.stroke();
      }

      // the Majorana dots; unpaired ones (p small) get an amber halo
      for (j = 0; j < N; j++) {
        for (var wch = 0; wch < 2; wch++) {
          a = 2 * j + wch;
          var x = majX(j, wch);
          var free = 1 - Math.min(1, p[a]);
          if (free > 0.25) {
            ctx.globalAlpha = 0.85 * free;
            ctx.fillStyle = col.amber;
            ctx.beginPath(); ctx.arc(x, majY, majR + 5.5, 0, 2 * Math.PI); ctx.fill();
          }
          ctx.globalAlpha = 1;
          ctx.fillStyle = free > 0.25 ? col.amber : col.text;
          ctx.beginPath(); ctx.arc(x, majY, majR, 0, 2 * Math.PI); ctx.fill();
        }
      }

      // the entanglement cut, after site N/2
      var cutX = bcX + (N / 2) * siteW;
      ctx.globalAlpha = 0.95;
      ctx.strokeStyle = col.amber; ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(cutX, majY - 34); ctx.lineTo(cutX, majY + 30); ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 0.9; ctx.fillStyle = col.amber;
      ctx.font = "10px system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("cut", cutX, majY - 38);

      // A / B labels
      ctx.globalAlpha = 0.7; ctx.fillStyle = col.text;
      ctx.font = "11px system-ui, sans-serif";
      ctx.fillText("A", (bcX + cutX) / 2, majY + 34);
      ctx.fillText("B", cutX + (bcX + bcW - cutX) / 2, majY + 34);
      ctx.restore();
    }

    function drawFanPlot() {
      panelTitle("entanglement spectrum of the half chain,  ζ  vs  μ/t", fpX - 30, fpY - 12);
      var x0 = fpX, x1 = fpX + fpW, y0 = fpY, y1 = fpY + fpH;
      function X(m) { return x0 + ((m + 4) / 8) * (x1 - x0); }
      function Y(z) { return y1 - z * (y1 - y0); }
      ctx.save();

      // topological region shading |mu| < 2
      ctx.globalAlpha = 0.09; ctx.fillStyle = col.accent;
      ctx.fillRect(X(-2), y0, X(2) - X(-2), y1 - y0);

      // axes
      ctx.globalAlpha = 0.45; ctx.strokeStyle = col.text; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();

      // zeta = 1/2 guide
      ctx.globalAlpha = 0.5; ctx.strokeStyle = col.amber; ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(x0, Y(0.5)); ctx.lineTo(x1, Y(0.5)); ctx.stroke();
      ctx.setLineDash([]);

      // y ticks
      ctx.globalAlpha = 0.75; ctx.fillStyle = col.text;
      ctx.font = "10px system-ui, sans-serif"; ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillText("1", x0 - 5, Y(1));
      ctx.fillText("½", x0 - 5, Y(0.5));
      ctx.fillText("0", x0 - 5, Y(0));
      ctx.save();
      ctx.translate(x0 - 30, (y0 + y1) / 2); ctx.rotate(-Math.PI / 2);
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("ζ", 0, 0);
      ctx.restore();

      // x ticks + phase labels
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      [-4, -2, 0, 2, 4].forEach(function (m) {
        ctx.globalAlpha = 0.75;
        ctx.fillText(String(m), X(m), y1 + 4);
        if (m === -2 || m === 2) {
          ctx.globalAlpha = 0.35; ctx.strokeStyle = col.text;
          ctx.beginPath(); ctx.moveTo(X(m), y0); ctx.lineTo(X(m), y1); ctx.stroke();
        }
      });
      ctx.globalAlpha = 0.8;
      ctx.fillText("μ/t", (x0 + x1) / 2, y1 + 20);
      ctx.font = "600 10px system-ui, sans-serif";
      ctx.fillStyle = col.accent; ctx.globalAlpha = 0.95;
      ctx.fillText("topological", X(0), y0 + 3);
      ctx.fillStyle = col.text; ctx.globalAlpha = 0.6;
      ctx.fillText("trivial", X(-3), y0 + 3);
      ctx.fillText("trivial", X(3), y0 + 3);

      // the fan: every ζ_k as a faint dot at each swept μ
      ctx.globalAlpha = 0.5; ctx.fillStyle = col.accent;
      for (var i = 0; i < sweepMu.length; i++) {
        var zs = sweepZ[i], px = X(sweepMu[i]);
        for (var k = 0; k < zs.length; k++) {
          var z = zs[k];
          ctx.beginPath(); ctx.arc(px, Y(z), 1.1, 0, 2 * Math.PI); ctx.fill();
          ctx.beginPath(); ctx.arc(px, Y(1 - z), 1.1, 0, 2 * Math.PI); ctx.fill();
        }
      }

      // current mu marker + its spectrum highlighted
      ctx.globalAlpha = 0.95; ctx.strokeStyle = col.amber; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(X(mu), y0); ctx.lineTo(X(mu), y1); ctx.stroke();
      ctx.fillStyle = col.amber;
      for (var q = 0; q < ent.zetas.length; q++) {
        var zz = ent.zetas[q];
        ctx.beginPath(); ctx.arc(X(mu), Y(zz), 3.2, 0, 2 * Math.PI); ctx.fill();
        ctx.beginPath(); ctx.arc(X(mu), Y(1 - zz), 3.2, 0, 2 * Math.PI); ctx.fill();
      }
      ctx.restore();
    }

    function render() {
      ctx.clearRect(0, 0, W, H);
      drawBondCartoon();
      drawFanPlot();
      // readout
      ctx.save();
      ctx.fillStyle = col.text; ctx.globalAlpha = 0.9;
      ctx.font = "11px system-ui, sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "top";
      var closest = 1;
      for (var q = 0; q < ent.zetas.length; q++) closest = Math.min(closest, Math.abs(ent.zetas[q] - 0.5));
      ctx.fillText(
        "S_A = " + ent.S.toFixed(3) + "  =  " + (ent.S / Math.LN2).toFixed(3) + " × ln2" +
        "   ·   closest eigenvalue to ½:  ζ = " + (0.5 + closest).toFixed(4),
        bcX, H - 22);
      ctx.restore();
    }

    var dirty = true, raf = null, lastTheme = "";
    function frame() {
      refreshTheme();
      var key = col.accent + col.text;
      if (dirty || key !== lastTheme) { lastTheme = key; render(); dirty = false; }
      raf = global.requestAnimationFrame(frame);
    }

    recompute();
    computeSweep();
    raf = global.requestAnimationFrame(frame);

    return {
      setMu: function (v) { mu = +v; recompute(); dirty = true; },
      setDelta: function (v) { delta = +v; recompute(); computeSweep(); dirty = true; },
      redraw: function () { resize(); dirty = true; },
      getState: function () { return { mu: mu, delta: delta, S: ent.S, zetas: ent.zetas.slice() }; },
      refreshTheme: refreshTheme,
      destroy: function () {
        if (raf) global.cancelAnimationFrame(raf);
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      },
    };
  }

  global.createKitaevEntanglement = createKitaevEntanglement;
  createKitaevEntanglement._test = {
    buildM: buildM, groundStateGamma: groundStateGamma,
    entanglementFromGamma: entanglementFromGamma, jacobiEigen: jacobiEigen,
  };
})(typeof window !== "undefined" ? window : this);
