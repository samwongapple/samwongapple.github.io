/*
 * correlation-entanglement.js — entanglement explorer for a tight-binding chain,
 * for the free-fermion blog post "All the Entanglement Is in One Matrix".
 *
 * Physics.  The ground state of the hopping chain H = -t Σ (c_j† c_{j+1} + h.c.)
 * at filling ν fills the lowest M = νN plane-wave modes, |k| < k_F = πν.  Its
 * correlation matrix has the closed-form sinc kernel (no diagonalization needed):
 *
 *     C_ij = <c_i† c_j> = sin(k_F (i-j)) / (π (i-j)),     C_ii = ν.
 *
 * To get the entanglement of a region A = [a, b] we restrict C to those sites and
 * diagonalize the L_A × L_A submatrix C|_A (Jacobi).  Its eigenvalues ζ_k ∈ [0,1]
 * are the natural-orbital occupations; the entanglement entropy is the sum of
 * their binary entropies,  S_A = -Σ_k [ζ_k ln ζ_k + (1-ζ_k) ln(1-ζ_k)].
 *
 * Four panels: (A) heatmap of |C_ij|, (B) the chain with a draggable/resizable
 * region A, (C) the live spectrum {ζ_k} on [0,1], (D) S_A vs L_A with an optional
 * (1/3) ln L_A guide (the c=1 Calabrese–Cardy law).
 *
 * Vanilla JS, no dependencies.  Colours read from the site's CSS theme variables.
 *
 * Usage:
 *   const w = createCorrelationEntanglement(el, { N: 80, filling: 0.5 });
 *   w.setFilling(0.3); w.setGuide(true); w.redraw(); w.destroy();
 */
(function (global) {
  "use strict";

  // ---- physics --------------------------------------------------------------
  // Full-chain correlation matrix as a flat Float64Array (row-major), sinc kernel.
  function buildC(N, nu) {
    var kF = Math.PI * nu;
    var C = new Float64Array(N * N);
    for (var i = 0; i < N; i++) {
      for (var j = 0; j < N; j++) {
        var d = i - j;
        C[i * N + j] = d === 0 ? nu : Math.sin(kF * d) / (Math.PI * d);
      }
    }
    return C;
  }

  // Binary entropy (nats). Certainly-empty / certainly-full orbitals contribute 0.
  function binaryEntropy(z) {
    if (z <= 1e-13 || z >= 1 - 1e-13) return 0;
    return -z * Math.log(z) - (1 - z) * Math.log(1 - z);
  }

  // Eigenvalues of a symmetric submatrix C[a..b, a..b] via the cyclic Jacobi
  // algorithm. Returns the sorted eigenvalue array (ascending). n = b-a+1.
  function submatrixEigenvalues(C, N, a, b) {
    var n = b - a + 1;
    // copy the submatrix into a dense 2D working array
    var A = new Array(n);
    for (var r = 0; r < n; r++) {
      A[r] = new Float64Array(n);
      for (var c = 0; c < n; c++) A[r][c] = C[(a + r) * N + (a + c)];
    }
    for (var sweep = 0; sweep < 100; sweep++) {
      var off = 0;
      for (var p = 0; p < n; p++)
        for (var q = p + 1; q < n; q++) off += A[p][q] * A[p][q];
      if (off < 1e-20) break;
      for (p = 0; p < n - 1; p++) {
        for (q = p + 1; q < n; q++) {
          var apq = A[p][q];
          if (Math.abs(apq) < 1e-16) continue;
          var tau = (A[q][q] - A[p][p]) / (2 * apq);
          var t = tau >= 0
            ? 1 / (tau + Math.sqrt(1 + tau * tau))
            : -1 / (-tau + Math.sqrt(1 + tau * tau));
          var cs = 1 / Math.sqrt(1 + t * t), sn = t * cs;
          var k;
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
        }
      }
    }
    var ev = new Array(n);
    for (var m = 0; m < n; m++) ev[m] = A[m][m];
    ev.sort(function (x, y) { return x - y; });
    return ev;
  }

  function entropyFromSpectrum(ev) {
    var S = 0;
    for (var i = 0; i < ev.length; i++) S += binaryEntropy(ev[i]);
    return S;
  }

  // ---- colour helpers -------------------------------------------------------
  function parseRGB(str, fallback) {
    str = (str || "").trim();
    var m;
    if ((m = str.match(/^#([0-9a-f]{3})$/i)))
      return [parseInt(m[1][0] + m[1][0], 16), parseInt(m[1][1] + m[1][1], 16), parseInt(m[1][2] + m[1][2], 16)];
    if ((m = str.match(/^#([0-9a-f]{6})$/i)))
      return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)];
    if ((m = str.match(/rgba?\(([^)]+)\)/i))) {
      var p = m[1].split(",").map(function (x) { return parseFloat(x); });
      return [p[0], p[1], p[2]];
    }
    return fallback;
  }

  function createCorrelationEntanglement(container, opts) {
    if (!container) throw new Error("createCorrelationEntanglement: container required");
    opts = opts || {};
    var N = opts.N || 80;
    var nu = opts.filling != null ? +opts.filling : 0.5;
    var showGuide = opts.guide !== false;
    var onState = opts.onState || null;

    // selection: region A = sites [a, b] inclusive
    var a = Math.round(N * 0.30), b = Math.round(N * 0.55);

    // physics caches
    var C = buildC(N, nu);
    var spectrum = [], SA = 0;
    var refL = [], refS = [], guideConst = 0;  // reference S(L_A) curve for centred blocks

    // ---- layout (logical px) ----
    var W = 470;
    var P = 10;
    var hmX = P, hmY = 26, hmS = 176;                       // panel A: heatmap
    var spX = hmX + hmS + 22, spY = hmY, spW = W - P - spX, spH = hmS; // panel C: spectrum
    var chX = P, chY = hmY + hmS + 30, chW = W - 2 * P, chH = 34;      // panel B: chain
    var cvX = P + 34, cvY = chY + chH + 34, cvW = W - P - cvX, cvH = 150; // panel D: curve
    var H = cvY + cvH + 24;

    // ---- canvas / hi-dpi ----
    var canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.maxWidth = W + "px";
    canvas.style.height = "auto";
    canvas.style.display = "block";
    canvas.style.margin = "0 auto";
    canvas.style.touchAction = "none";
    container.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var dpr = 1;
    function resize() {
      dpr = Math.max(1, global.devicePixelRatio || 1);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    // offscreen heatmap (N×N), rebuilt when C or theme changes
    var heat = document.createElement("canvas");
    heat.width = N; heat.height = N;
    var hctx = heat.getContext("2d");

    // ---- theme ----
    var col = {}, themeKey = "";
    function refreshTheme() {
      var cs = getComputedStyle(document.documentElement);
      col.accent = (cs.getPropertyValue("--global-theme-color") || "#1fb2a6").trim() || "#1fb2a6";
      col.text = (cs.getPropertyValue("--global-text-color") || "#888").trim() || "#888";
      col.divider = (cs.getPropertyValue("--global-divider-color") || "#8884").trim() || "#8884";
      col.accentRGB = parseRGB(col.accent, [31, 178, 166]);
      col.amber = "#e0a63a";
      var key = col.accent + "|" + col.text;
      if (key !== themeKey) { themeKey = key; buildHeatmap(); }
    }

    function buildHeatmap() {
      var img = hctx.createImageData(N, N);
      var d = img.data;
      var vmax = Math.max(nu, 1 - nu);   // diagonal is the brightest entry
      var rC = col.accentRGB[0], gC = col.accentRGB[1], bC = col.accentRGB[2];
      for (var i = 0; i < N; i++) {
        for (var j = 0; j < N; j++) {
          var v = Math.abs(C[i * N + j]) / vmax;
          v = Math.pow(Math.min(1, v), 0.55);      // gamma-boost the tails
          var o = (i * N + j) * 4;
          d[o] = rC; d[o + 1] = gC; d[o + 2] = bC; d[o + 3] = Math.round(v * 255);
        }
      }
      hctx.putImageData(img, 0, 0);
    }

    // ---- recompute selection spectrum + entropy ----
    function recompute() {
      if (b < a) { var t = a; a = b; b = t; }
      a = Math.max(0, Math.min(N - 1, a));
      b = Math.max(a, Math.min(N - 1, b));
      spectrum = submatrixEigenvalues(C, N, a, b);
      SA = entropyFromSpectrum(spectrum);
      if (onState) onState({ a: a, b: b, LA: b - a + 1, S: SA, spectrum: spectrum });
    }

    // ---- reference curve S(L_A) for centred blocks, + guide constant ----
    function computeReference() {
      refL = []; refS = [];
      for (var L = 2; L <= N; L += 2) {
        var lo = Math.floor((N - L) / 2), hi = lo + L - 1;
        refL.push(L);
        refS.push(entropyFromSpectrum(submatrixEigenvalues(C, N, lo, hi)));
      }
      // least-squares fit of const in  S ≈ (1/3) ln L + const  (using L ≥ 8)
      var s = 0, m = 0;
      for (var k = 0; k < refL.length; k++) {
        if (refL[k] < 8) continue;
        s += refS[k] - Math.log(refL[k]) / 3; m++;
      }
      guideConst = m ? s / m : 0;
    }

    // ---- drawing helpers ----
    function panelTitle(txt, x, y) {
      ctx.save();
      ctx.fillStyle = col.text; ctx.globalAlpha = 0.85;
      ctx.font = "600 11px system-ui, sans-serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText(txt, x, y);
      ctx.restore();
    }

    function siteX(i) { return chX + (i + 0.5) * (chW / N); }
    function edgeX(i) { return chX + i * (chW / N); }   // left edge of site i

    function drawHeatmap() {
      panelTitle("|Cᵢⱼ|  correlation matrix", hmX, hmY - 8);
      ctx.save();
      ctx.strokeStyle = col.divider; ctx.lineWidth = 1;
      ctx.strokeRect(hmX - 0.5, hmY - 0.5, hmS + 1, hmS + 1);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(heat, hmX, hmY, hmS, hmS);
      // mark region A as a box on the diagonal block
      var s = hmS / N;
      ctx.strokeStyle = col.amber; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.95;
      ctx.strokeRect(hmX + a * s, hmY + a * s, (b - a + 1) * s, (b - a + 1) * s);
      ctx.restore();
    }

    function drawSpectrum() {
      panelTitle("entanglement spectrum  ζₖ", spX, hmY - 8);
      var y0 = spY + 8, y1 = spY + spH - 24;
      var axX0 = spX + 6, axX1 = spX + spW - 6;
      function X(z) { return axX0 + z * (axX1 - axX0); }
      ctx.save();
      // axis 0..1
      ctx.strokeStyle = col.text; ctx.globalAlpha = 0.4; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(axX0, y1); ctx.lineTo(axX1, y1); ctx.stroke();
      // ticks 0, 1/2, 1
      ctx.globalAlpha = 0.7; ctx.fillStyle = col.text;
      ctx.font = "10px system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "top";
      [0, 0.5, 1].forEach(function (z) {
        ctx.globalAlpha = 0.35;
        ctx.beginPath(); ctx.moveTo(X(z), y0); ctx.lineTo(X(z), y1); ctx.stroke();
        ctx.globalAlpha = 0.75;
        ctx.fillText(z === 0.5 ? "½" : String(z), X(z), y1 + 4);
      });
      // dots: pinned (near 0/1) muted teal; fractional (straddling) amber
      for (var i = 0; i < spectrum.length; i++) {
        var z = Math.max(0, Math.min(1, spectrum[i]));
        var frac = z > 0.02 && z < 0.98;
        var yy = y0 + (y1 - y0) * (0.15 + 0.7 * (i / Math.max(1, spectrum.length - 1)));
        ctx.beginPath();
        ctx.globalAlpha = frac ? 0.95 : 0.5;
        ctx.fillStyle = frac ? col.amber : col.accent;
        ctx.arc(X(z), yy, frac ? 4 : 3, 0, 2 * Math.PI);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawChain() {
      panelTitle("region A  (drag to move · drag an edge to resize)", chX, chY - 8);
      ctx.save();
      // baseline of sites
      var cw = chW / N;
      // selected region shading
      ctx.fillStyle = col.accent; ctx.globalAlpha = 0.16;
      ctx.fillRect(edgeX(a), chY, (b - a + 1) * cw, chH);
      ctx.globalAlpha = 1;
      // site ticks
      for (var i = 0; i < N; i++) {
        var inA = i >= a && i <= b;
        ctx.fillStyle = inA ? col.accent : col.text;
        ctx.globalAlpha = inA ? 0.9 : 0.35;
        ctx.beginPath();
        ctx.arc(siteX(i), chY + chH / 2, inA ? 2.6 : 1.8, 0, 2 * Math.PI);
        ctx.fill();
      }
      // resize handles
      ctx.globalAlpha = 1; ctx.strokeStyle = col.amber; ctx.lineWidth = 2.5;
      [edgeX(a), edgeX(b + 1)].forEach(function (x) {
        ctx.beginPath(); ctx.moveTo(x, chY - 3); ctx.lineTo(x, chY + chH + 3); ctx.stroke();
      });
      // L_A readout
      ctx.globalAlpha = 0.85; ctx.fillStyle = col.text;
      ctx.font = "11px system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText("Lₐ = " + (b - a + 1), (edgeX(a) + edgeX(b + 1)) / 2, chY + chH + 4);
      ctx.restore();
    }

    function drawCurve() {
      panelTitle("Sₐ vs Lₐ", cvX, cvY - 8);
      var x0 = cvX, x1 = cvX + cvW, y0 = cvY, y1 = cvY + cvH;
      var smax = 0;
      for (var i = 0; i < refS.length; i++) smax = Math.max(smax, refS[i]);
      smax = Math.max(smax, SA) * 1.15 + 1e-6;
      function X(L) { return x0 + (L / N) * (x1 - x0); }
      function Y(s) { return y1 - (s / smax) * (y1 - y0); }
      ctx.save();
      // axes
      ctx.strokeStyle = col.text; ctx.globalAlpha = 0.4; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.globalAlpha = 0.7; ctx.fillStyle = col.text; ctx.font = "10px system-ui, sans-serif";
      ctx.textAlign = "end"; ctx.textBaseline = "middle";
      ctx.fillText(smax.toFixed(1), x0 - 4, y0 + 4);
      ctx.fillText("0", x0 - 4, y1);
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText("Lₐ", (x0 + x1) / 2, y1 + 4);
      ctx.fillText(String(N), x1, y1 + 4);
      // guide (1/3) ln L + const
      if (showGuide) {
        ctx.strokeStyle = col.amber; ctx.globalAlpha = 0.9; ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]); ctx.beginPath();
        var started = false;
        for (var L = 2; L <= N; L++) {
          var sg = Math.log(L) / 3 + guideConst;
          if (sg < 0) continue;
          var px = X(L), py = Y(sg);
          if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
        }
        ctx.stroke(); ctx.setLineDash([]);
      }
      // reference curve
      ctx.strokeStyle = col.accent; ctx.globalAlpha = 0.85; ctx.lineWidth = 2;
      ctx.beginPath();
      for (var k = 0; k < refL.length; k++) {
        var qx = X(refL[k]), qy = Y(refS[k]);
        if (k === 0) ctx.moveTo(qx, qy); else ctx.lineTo(qx, qy);
      }
      ctx.stroke();
      // current selection point
      ctx.globalAlpha = 1; ctx.fillStyle = col.amber;
      ctx.beginPath(); ctx.arc(X(b - a + 1), Y(SA), 4.5, 0, 2 * Math.PI); ctx.fill();
      ctx.globalAlpha = 0.85; ctx.fillStyle = col.text;
      ctx.font = "11px system-ui, sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "bottom";
      ctx.fillText("Sₐ = " + SA.toFixed(3), X(b - a + 1) + 7, Y(SA) - 2);
      // guide label
      if (showGuide) {
        ctx.fillStyle = col.amber; ctx.globalAlpha = 0.9; ctx.textAlign = "right"; ctx.textBaseline = "top";
        ctx.fillText("⅓ ln Lₐ + const", x1, y0);
      }
      ctx.restore();
    }

    var dirty = true;
    function render() {
      ctx.clearRect(0, 0, W, H);
      drawHeatmap();
      drawSpectrum();
      drawChain();
      drawCurve();
    }

    // ---- interaction ----
    var drag = null;  // 'move' | 'left' | 'right'
    var dragStartPx = 0, dragA = 0, dragB = 0;
    function localX(ev) {
      var rect = canvas.getBoundingClientRect();
      var cxp = (ev.touches ? ev.touches[0].clientX : ev.clientX) - rect.left;
      return cxp * (W / rect.width);
    }
    function localY(ev) {
      var rect = canvas.getBoundingClientRect();
      var cyp = (ev.touches ? ev.touches[0].clientY : ev.clientY) - rect.top;
      return cyp * (H / rect.height);
    }
    function onDown(ev) {
      var x = localX(ev), y = localY(ev);
      if (y < chY - 10 || y > chY + chH + 10) return;  // only the chain row is interactive
      ev.preventDefault();
      var lx = edgeX(a), rx = edgeX(b + 1);
      if (Math.abs(x - lx) < 8) drag = "left";
      else if (Math.abs(x - rx) < 8) drag = "right";
      else drag = "move";
      dragStartPx = x; dragA = a; dragB = b;
      window.addEventListener("mousemove", onMove);
      window.addEventListener("touchmove", onMove, { passive: false });
      window.addEventListener("mouseup", onUp);
      window.addEventListener("touchend", onUp);
    }
    function onMove(ev) {
      if (!drag) return;
      ev.preventDefault();
      var cw = chW / N;
      var x = localX(ev);
      var site = Math.round((x - chX) / cw);
      if (drag === "left") a = Math.max(0, Math.min(dragB, site));
      else if (drag === "right") b = Math.min(N - 1, Math.max(dragA, site - 1));
      else {
        var delta = Math.round((x - dragStartPx) / cw);
        var len = dragB - dragA;
        var na = Math.max(0, Math.min(N - 1 - len, dragA + delta));
        a = na; b = na + len;
      }
      recompute(); dirty = true;
    }
    function onUp() {
      drag = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    }
    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("touchstart", onDown, { passive: false });

    // ---- loop (renders only when dirty or theme changed) ----
    var raf = null, lastKey = "";
    function frame() {
      refreshTheme();
      if (dirty || col.accent + col.text !== lastKey) {
        lastKey = col.accent + col.text;
        render();
        dirty = false;
      }
      raf = global.requestAnimationFrame(frame);
    }

    // ---- init ----
    refreshTheme();
    computeReference();
    recompute();
    dirty = true;
    raf = global.requestAnimationFrame(frame);

    return {
      setFilling: function (v) {
        nu = Math.max(0.02, Math.min(0.98, +v));
        C = buildC(N, nu);
        buildHeatmap();
        computeReference();
        recompute();
        dirty = true;
      },
      setGuide: function (on) { showGuide = !!on; dirty = true; },
      redraw: function () { resize(); buildHeatmap(); dirty = true; },
      getState: function () { return { a: a, b: b, LA: b - a + 1, S: SA, spectrum: spectrum.slice() }; },
      refreshTheme: refreshTheme,
      destroy: function () {
        if (raf) global.cancelAnimationFrame(raf);
        onUp();
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      },
    };
  }

  global.createCorrelationEntanglement = createCorrelationEntanglement;
  // exposed for unit testing (Node); harmless in the browser
  createCorrelationEntanglement._test = { buildC: buildC, submatrixEigenvalues: submatrixEigenvalues, binaryEntropy: binaryEntropy, entropyFromSpectrum: entropyFromSpectrum };
})(typeof window !== "undefined" ? window : this);
