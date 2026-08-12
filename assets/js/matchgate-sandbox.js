/*
 * matchgate-sandbox.js — brickwork matchgate circuit sandbox, for the blog
 * post "Matchgates: Free Fermions Wearing Qubit Clothing" (series Post 1).
 *
 * Physics (all live, nothing canned; conventions as the series):
 *   - State = covariance matrix Gamma_ab = (i/2)<[g_a, g_b]>, 2n x 2n real
 *     antisymmetric; vacuum = direct sum of [[0,-1],[1,0]] blocks.
 *   - One "layer" = one brick row of random matchgates G = exp(i a XX + i b YY)
 *     dressed with random single-qubit Z-phases. Gate action on Gamma is the
 *     verified pair of plane rotations: (2j+1, 2j+2) by 2a and (2j, 2j+3) by
 *     -2b; a Z-phase t on site j rotates (2j, 2j+1) by 2t.
 *   - Entanglement profile: for a cut after qubit x, take the 2x x 2x block
 *     Gamma_A; the Williamson spectrum {lambda} comes from the eigenvalues of
 *     the symmetric PSD matrix M = Gamma_A^T Gamma_A (each lambda^2 twice),
 *     occupations zeta = (1 + lambda)/2, and
 *     S(x) = sum over pairs of binary entropies — the free-fermion post's
 *     formula, computed with a cyclic Jacobi eigensolver.
 *   - The SWAP button is honest: SWAP is not a matchgate (det A = 1,
 *     det B = -1), its Majorana action is not linear, and Gamma stops being
 *     the whole state — so the simulation HALTS with an overlay instead of
 *     faking data past it.
 *
 * Vanilla JS, no dependencies, theme-aware via the site's CSS variables.
 * Usage: createMatchgateSandbox(el, { n: 14 })
 */
(function (global) {
  "use strict";

  function rotPlane(G, p, q, th) {
    var c = Math.cos(th), s = Math.sin(th), m = G.length, k, a, b;
    for (k = 0; k < m; k++) { a = G[p][k]; b = G[q][k]; G[p][k] = c * a + s * b; G[q][k] = -s * a + c * b; }
    for (k = 0; k < m; k++) { a = G[k][p]; b = G[k][q]; G[k][p] = c * a + s * b; G[k][q] = -s * a + c * b; }
  }
  function vacuumGamma(n) {
    var m = 2 * n, G = [];
    for (var i = 0; i < m; i++) G.push(new Array(m).fill(0));
    for (var j = 0; j < n; j++) { G[2 * j][2 * j + 1] = -1; G[2 * j + 1][2 * j] = 1; }
    return G;
  }

  // eigenvalues of a symmetric matrix (cyclic Jacobi), values only
  function symEigenvalues(A0) {
    var n = A0.length, A = A0.map(function (r) { return r.slice(); });
    for (var sweep = 0; sweep < 60; sweep++) {
      var off = 0;
      for (var p = 0; p < n; p++)
        for (var q = p + 1; q < n; q++) off += A[p][q] * A[p][q];
      if (off < 1e-18) break;
      for (p = 0; p < n - 1; p++) {
        for (q = p + 1; q < n; q++) {
          var apq = A[p][q];
          if (Math.abs(apq) < 1e-14) continue;
          var tau = (A[q][q] - A[p][p]) / (2 * apq);
          var t = tau >= 0 ? 1 / (tau + Math.sqrt(1 + tau * tau)) : -1 / (-tau + Math.sqrt(1 + tau * tau));
          var c = 1 / Math.sqrt(1 + t * t), s = t * c, k, x, y;
          for (k = 0; k < n; k++) { x = A[k][p]; y = A[k][q]; A[k][p] = c * x - s * y; A[k][q] = s * x + c * y; }
          for (k = 0; k < n; k++) { x = A[p][k]; y = A[q][k]; A[p][k] = c * x - s * y; A[q][k] = s * x + c * y; }
        }
      }
    }
    var ev = [];
    for (var i = 0; i < n; i++) ev.push(A[i][i]);
    return ev;
  }

  function binEntropy(z) {
    if (z <= 1e-12 || z >= 1 - 1e-12) return 0;
    return -z * Math.log(z) - (1 - z) * Math.log(1 - z);
  }

  // S(x) for cuts after qubit x = 1..n-1, from Williamson eigenvalues of
  // the reduced Gamma (free-fermion post's formula).
  function entropyProfile(G, n) {
    var S = [];
    for (var x = 1; x < n; x++) {
      var d = 2 * x, M = [];
      for (var i = 0; i < d; i++) {
        M.push(new Array(d).fill(0));
      }
      // M = Gamma_A^T Gamma_A  (= -Gamma_A^2, symmetric PSD; eigenvalues lambda^2, each twice)
      for (i = 0; i < d; i++)
        for (var j = i; j < d; j++) {
          var v = 0;
          for (var k = 0; k < d; k++) v += G[k][i] * G[k][j];
          M[i][j] = v;
          M[j][i] = v;
        }
      var ev = symEigenvalues(M), sum = 0;
      for (i = 0; i < d; i++) {
        var lam = Math.sqrt(Math.max(0, Math.min(1, ev[i])));
        sum += binEntropy((1 + lam) / 2);
      }
      S.push(sum / 2); // each Williamson pair counted twice in ev
    }
    return S;
  }

  function theme() {
    var cs = getComputedStyle(document.documentElement);
    function v(nm, f) { return (cs.getPropertyValue(nm) || f).trim() || f; }
    var dark = (document.documentElement.getAttribute("data-theme") || "") === "dark";
    return {
      text: v("--global-text-color", "#333"),
      accent: v("--global-theme-color", "#1fb2a6"),
      divider: v("--global-divider-color", "#ccc"),
      dark: dark,
      dim: dark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)",
      faint: dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.09)",
      alert: dark ? "#e0a63a" : "#b3760a",
      overlay: dark ? "rgba(10,12,16,0.82)" : "rgba(250,250,250,0.88)",
    };
  }
  function parseRGB(str, fb) {
    var m = /rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/.exec(str);
    if (m) return [+m[1], +m[2], +m[3]];
    m = /^#([0-9a-f]{6})$/i.exec(str.trim());
    if (m) {
      var x = parseInt(m[1], 16);
      return [(x >> 16) & 255, (x >> 8) & 255, x & 255];
    }
    return fb;
  }

  function createMatchgateSandbox(container, opts) {
    if (!container) throw new Error("createMatchgateSandbox: container required");
    opts = opts || {};
    var n = opts.n || 14,
      m = 2 * n;

    var reduced = false;
    try {
      reduced = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) { reduced = false; }

    var HM = 252, GAP = 30, PW = 320, PADT = 26, PADB = 34;
    var W = HM + GAP + PW + 8, H = PADT + HM + PADB;

    var canvas = document.createElement("canvas");
    canvas.style.cssText = "width:100%;max-width:" + W + "px;height:auto;display:block;margin:0 auto;";
    var ctx = canvas.getContext("2d");
    (function () {
      var dp = Math.max(1, global.devicePixelRatio || 1);
      canvas.width = W * dp;
      canvas.height = H * dp;
      ctx.setTransform(dp, 0, 0, dp, 0, 0);
    })();
    container.appendChild(canvas);

    var controls = document.createElement("div");
    controls.style.cssText = "display:flex;gap:0.9rem;align-items:center;justify-content:center;margin-top:0.65rem;font-size:0.9rem;flex-wrap:wrap;";
    function btn(txt) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = txt;
      b.style.cssText = "cursor:pointer;min-width:5.2em;";
      return b;
    }
    var stepBtn = btn("⏭ step"),
      runBtn = btn("▶ run"),
      swapBtn = btn("✂ insert a SWAP layer"),
      resetBtn = btn("↺ reset");
    swapBtn.style.minWidth = "12em";
    var counter = document.createElement("span");
    counter.style.cssText = "font-variant-numeric:tabular-nums;opacity:0.85;";
    controls.appendChild(stepBtn);
    controls.appendChild(runBtn);
    controls.appendChild(swapBtn);
    controls.appendChild(resetBtn);
    controls.appendChild(counter);
    container.appendChild(controls);

    var note = document.createElement("p");
    note.style.cssText = "text-align:center;font-size:0.82rem;opacity:0.75;margin:0.55rem auto 0;max-width:38rem;";
    note.textContent = "Each step applies one brickwork layer of random matchgates to the covariance matrix (verified plane-rotation updates); S(x) comes from the Williamson eigenvalues of the reduced Γ. The SWAP layer genuinely halts the simulation — no data is faked past it.";
    container.appendChild(note);

    // ---------------- state ----------------
    var G, layer, halted, running = false, timer = null;

    function reset() {
      G = vacuumGamma(n);
      layer = 0;
      halted = false;
      running = false;
      if (timer) { global.clearInterval(timer); timer = null; }
      runBtn.textContent = "▶ run";
      stepBtn.disabled = false;
      runBtn.disabled = false;
      swapBtn.disabled = false;
      render();
    }

    function applyLayer() {
      if (halted) return;
      for (var j = layer % 2; j < n - 1; j += 2) {
        var a = Math.random() * Math.PI,
          b = Math.random() * Math.PI;
        rotPlane(G, 2 * j + 1, 2 * j + 2, 2 * a); // XX part
        rotPlane(G, 2 * j, 2 * j + 3, -2 * b);    // YY part
        rotPlane(G, 2 * j, 2 * j + 1, 2 * Math.random() * Math.PI);     // Z dressings
        rotPlane(G, 2 * j + 2, 2 * j + 3, 2 * Math.random() * Math.PI);
      }
      layer++;
      render();
    }

    function insertSwap() {
      if (halted) return;
      halted = true;
      running = false;
      if (timer) { global.clearInterval(timer); timer = null; }
      runBtn.textContent = "▶ run";
      stepBtn.disabled = true;
      runBtn.disabled = true;
      swapBtn.disabled = true;
      layer++;
      render();
    }

    // ---------------- drawing ----------------
    function drawHeat(th) {
      var cell = HM / m;
      var acc = parseRGB(th.accent, [31, 178, 166]);
      for (var i = 0; i < m; i++)
        for (var j = 0; j < m; j++) {
          var v = Math.min(1, Math.abs(G[i][j]));
          if (v < 1e-4) continue;
          var a = 0.06 + 0.94 * Math.pow(v, 0.6);
          ctx.fillStyle = "rgba(" + acc[0] + "," + acc[1] + "," + acc[2] + "," + a.toFixed(3) + ")";
          ctx.fillRect(4 + j * cell, PADT + i * cell, Math.ceil(cell), Math.ceil(cell));
        }
      ctx.strokeStyle = th.faint;
      ctx.strokeRect(4.5, PADT + 0.5, HM - 1, HM - 1);
      ctx.fillStyle = th.dim;
      ctx.font = "500 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("|Γ|  — the light cone", 4 + HM / 2, PADT - 9);
    }

    function drawProfile(th) {
      var x0 = 4 + HM + GAP;
      var S = entropyProfile(G, n);
      var sMax = ((n / 2) * Math.LN2) * 1.08; // Page-ish ceiling for the axis
      ctx.strokeStyle = th.faint;
      ctx.strokeRect(x0 + 0.5, PADT + 0.5, PW - 1, HM - 1);
      ctx.fillStyle = th.dim;
      ctx.font = "500 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("entanglement S(x) across each cut", x0 + PW / 2, PADT - 9);
      ctx.fillText("cut position x", x0 + PW / 2, PADT + HM + 22);
      // gridline at ln2 multiples
      ctx.textAlign = "left";
      for (var g = 1; g <= Math.floor(sMax / Math.LN2); g += 2) {
        var gy = PADT + HM * (1 - (g * Math.LN2) / sMax);
        ctx.strokeStyle = th.faint;
        ctx.beginPath();
        ctx.moveTo(x0, gy);
        ctx.lineTo(x0 + PW, gy);
        ctx.stroke();
        ctx.fillStyle = th.dim;
        ctx.fillText(g + " ln2", x0 + 4, gy - 3);
      }
      // bars
      var acc = parseRGB(th.accent, [31, 178, 166]);
      var bw = PW / (n - 1);
      for (var x = 0; x < S.length; x++) {
        var hgt = (HM * Math.min(S[x], sMax)) / sMax;
        ctx.fillStyle = "rgba(" + acc[0] + "," + acc[1] + "," + acc[2] + ",0.65)";
        ctx.fillRect(x0 + x * bw + 2, PADT + HM - hgt, bw - 4, hgt);
      }
    }

    function drawOverlay(th) {
      ctx.fillStyle = th.overlay;
      ctx.fillRect(0, PADT - 20, W, H - PADT + 20);
      ctx.fillStyle = th.alert;
      ctx.font = "700 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("SWAP inserted — this is not a matchgate.", W / 2, PADT + HM / 2 - 26);
      ctx.fillStyle = th.text;
      ctx.font = "500 12.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.fillText("det A = +1, det B = −1: the Majorana action is no longer linear,", W / 2, PADT + HM / 2 - 2);
      ctx.fillText("and Γ is no longer the whole state. Honest simulation from here", W / 2, PADT + HM / 2 + 18);
      ctx.fillText("would cost 2¹⁴ = 16 384 amplitudes — so the sandbox stops.", W / 2, PADT + HM / 2 + 38);
    }

    function render() {
      var th = theme();
      ctx.clearRect(0, 0, W, H);
      drawHeat(th);
      drawProfile(th);
      if (halted) drawOverlay(th);
      counter.textContent = "layer " + layer + (halted ? " (halted)" : "");
    }

    stepBtn.addEventListener("click", applyLayer);
    runBtn.addEventListener("click", function () {
      if (halted) return;
      if (reduced) { applyLayer(); return; } // reduced motion: run == step
      if (running) {
        running = false;
        global.clearInterval(timer);
        timer = null;
        runBtn.textContent = "▶ run";
      } else {
        running = true;
        runBtn.textContent = "⏸ pause";
        timer = global.setInterval(applyLayer, 650);
      }
    });
    swapBtn.addEventListener("click", insertSwap);
    resetBtn.addEventListener("click", reset);

    var mo = new MutationObserver(render);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    global.addEventListener("resize", render);

    reset();

    return {
      step: applyLayer,
      redraw: render,
      destroy: function () {
        if (timer) global.clearInterval(timer);
        mo.disconnect();
        global.removeEventListener("resize", render);
        container.innerHTML = "";
      },
    };
  }

  global.createMatchgateSandbox = createMatchgateSandbox;
})(window);
