/*
 * givens-elimination.js — the matchgate compiler, run live, for the blog post
 * "Building Gaussian States, One Rotation at a Time" (matchgate series, Post 2).
 *
 * Physics (all computed live, no canned data):
 *   1. Ground state of the dimerized hopping chain t_j = 1 + delta*(-1)^j on
 *      n = 16 sites at half filling: Jacobi-diagonalize the single-particle
 *      Hamiltonian, fill the lowest n/2 orbitals, C = V_occ V_occ^T, and
 *      Gamma_{A_i B_j} = -delta_ij + 2 C_ij (site-j Majoranas at indices
 *      2j, 2j+1; vacuum blocks are -1, matching the series convention).
 *   2. Givens elimination: zero out each Majorana row from the far end inward
 *      with adjacent-plane rotations, theta = atan2(G[a][b], G[a][b-1]);
 *      skip rotations whose target entry is below the tolerance eps; parity
 *      fix (pi-rotation in the next plane) when a finished block lands at +1.
 *   3. The compiled circuit = the rotation list reversed with negated angles
 *      (plane p even -> Z-rotation on qubit p/2; p odd -> XX-rotation on
 *      qubits ((p-1)/2, (p-1)/2+1)). The reconstruction error readout is
 *      honest: the compiled circuit is actually replayed on the vacuum and
 *      max|Gamma_rebuilt - Gamma_target| reported.
 *   4. Depth = greedy brickwork layering of the reversed gate list.
 *
 * The elimination order and the circuit run OPPOSITE ways: the first entry
 * you zero corresponds to the LAST gate of the preparation circuit, so the
 * circuit diagram fills in from its right-hand end as the heatmap empties.
 *
 * Vanilla JS, no dependencies, theme-aware via the site's CSS variables.
 * Usage: createGivensElimination(el, { n: 16 })
 */
(function (global) {
  "use strict";

  // ---------------- linear algebra ----------------
  function jacobiEig(Ain) {
    var n = Ain.length,
      A = Ain.map(function (r) { return r.slice(); }),
      V = [];
    for (var i = 0; i < n; i++) {
      V.push(new Array(n).fill(0));
      V[i][i] = 1;
    }
    for (var sweep = 0; sweep < 120; sweep++) {
      var off = 0;
      for (var p = 0; p < n; p++)
        for (var q = p + 1; q < n; q++) off += A[p][q] * A[p][q];
      if (off < 1e-22) break;
      for (p = 0; p < n - 1; p++) {
        for (q = p + 1; q < n; q++) {
          var apq = A[p][q];
          if (Math.abs(apq) < 1e-18) continue;
          var tau = (A[q][q] - A[p][p]) / (2 * apq);
          var t = tau >= 0 ? 1 / (tau + Math.sqrt(1 + tau * tau)) : -1 / (-tau + Math.sqrt(1 + tau * tau));
          var c = 1 / Math.sqrt(1 + t * t),
            s = t * c,
            k, x, y;
          for (k = 0; k < n; k++) { x = A[k][p]; y = A[k][q]; A[k][p] = c * x - s * y; A[k][q] = s * x + c * y; }
          for (k = 0; k < n; k++) { x = A[p][k]; y = A[q][k]; A[p][k] = c * x - s * y; A[q][k] = s * x + c * y; }
          for (k = 0; k < n; k++) { x = V[k][p]; y = V[k][q]; V[k][p] = c * x - s * y; V[k][q] = s * x + c * y; }
        }
      }
    }
    var val = [];
    for (i = 0; i < n; i++) val.push(A[i][i]);
    return { val: val, vec: V };
  }

  function rotPlane(G, p, q, th) { // G -> R G R^T, plane rotation in (p,q)
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

  function groundGamma(n, delta) {
    var h = [];
    for (var i = 0; i < n; i++) h.push(new Array(n).fill(0));
    for (var j = 0; j < n - 1; j++) {
      var t = 1 + delta * (j % 2 === 0 ? 1 : -1);
      h[j][j + 1] = -t;
      h[j + 1][j] = -t;
    }
    var e = jacobiEig(h);
    var idx = e.val.map(function (v, k) { return [v, k]; }).sort(function (x, y) { return x[0] - y[0]; });
    var C = [];
    for (i = 0; i < n; i++) C.push(new Array(n).fill(0));
    for (var f = 0; f < n / 2; f++) {
      var col = idx[f][1];
      for (i = 0; i < n; i++)
        for (j = 0; j < n; j++) C[i][j] += e.vec[i][col] * e.vec[j][col];
    }
    var m = 2 * n, G = [];
    for (i = 0; i < m; i++) G.push(new Array(m).fill(0));
    for (i = 0; i < n; i++)
      for (j = 0; j < n; j++) {
        var g = (i === j ? -1 : 0) + 2 * C[i][j];
        G[2 * i][2 * j + 1] += g;
        G[2 * j + 1][2 * i] -= g;
      }
    return G;
  }

  // Elimination: returns {ops:[{p,th}], err, layers, layerOf[]}
  function compile(Gtarget, eps) {
    var m = Gtarget.length,
      G = Gtarget.map(function (r) { return r.slice(); }),
      ops = [];
    function rot(p, th) { rotPlane(G, p, p + 1, th); ops.push({ p: p, th: th }); }
    for (var a = 0; a < m - 2; a += 2) {
      for (var b = m - 1; b > a + 1; b--) {
        if (Math.abs(G[a][b]) < eps) continue;
        rot(b - 1, Math.atan2(G[a][b], G[a][b - 1]));
      }
      if (G[a][a + 1] > 0) rot(a + 1, Math.PI); // parity fix
    }
    // honest error: replay compiled circuit (reversed, negated) on the vacuum
    var H = vacuumGamma(m / 2);
    for (var k = ops.length - 1; k >= 0; k--) rotPlane(H, ops[k].p, ops[k].p + 1, -ops[k].th);
    var err = 0;
    for (var i = 0; i < m; i++)
      for (var j = 0; j < m; j++) err = Math.max(err, Math.abs(H[i][j] - Gtarget[i][j]));
    // greedy brickwork layering of the circuit (reversed op order)
    var busy = new Array(m).fill(-1),
      layerOf = new Array(ops.length).fill(0),
      nLayers = 0;
    for (k = ops.length - 1; k >= 0; k--) {
      var p = ops[k].p;
      var l = Math.max(busy[p], busy[p + 1]) + 1;
      busy[p] = l;
      busy[p + 1] = l;
      layerOf[k] = l;
      nLayers = Math.max(nLayers, l + 1);
    }
    return { ops: ops, err: err, nLayers: nLayers, layerOf: layerOf };
  }

  // ---------------- theming ----------------
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

  // ---------------- widget ----------------
  function createGivensElimination(container, opts) {
    if (!container) throw new Error("createGivensElimination: container required");
    opts = opts || {};
    var n = opts.n || 16,
      m = 2 * n;

    var reduced = false;
    try {
      reduced = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) { reduced = false; }

    // layout: heatmap (left) + circuit (right) on one canvas
    var HM = 264, GAP = 26, CW = 380, PADT = 26, PADB = 14;
    var W = HM + GAP + CW + 8, H = PADT + HM + PADB;

    var canvas = document.createElement("canvas");
    canvas.style.cssText = "width:100%;max-width:" + W + "px;height:auto;display:block;margin:0 auto;";
    var ctx = canvas.getContext("2d");
    function resize() {
      var dp = Math.max(1, global.devicePixelRatio || 1);
      canvas.width = W * dp;
      canvas.height = H * dp;
      ctx.setTransform(dp, 0, 0, dp, 0, 0);
    }
    resize();
    container.appendChild(canvas);

    var readout = document.createElement("div");
    readout.style.cssText = "display:flex;gap:1.6rem;justify-content:center;margin-top:0.55rem;font-size:0.92rem;flex-wrap:wrap;font-variant-numeric:tabular-nums;";
    container.appendChild(readout);

    var controls = document.createElement("div");
    controls.style.cssText = "display:flex;gap:1rem;align-items:center;justify-content:center;margin-top:0.55rem;font-size:0.9rem;flex-wrap:wrap;";
    function mkLabel(txt) {
      var l = document.createElement("label");
      l.style.cssText = "display:flex;align-items:center;gap:0.45rem;";
      l.appendChild(document.createTextNode(txt));
      return l;
    }
    var dSlider = document.createElement("input");
    dSlider.type = "range"; dSlider.min = "0"; dSlider.max = "0.95"; dSlider.step = "0.01"; dSlider.value = "0";
    dSlider.setAttribute("aria-label", "dimerization delta");
    var dVal = document.createElement("span");
    dVal.style.minWidth = "2.7em";
    var eSlider = document.createElement("input");
    eSlider.type = "range"; eSlider.min = "0"; eSlider.max = "1"; eSlider.step = "0.005"; eSlider.value = "0.82";
    eSlider.setAttribute("aria-label", "truncation tolerance");
    var eVal = document.createElement("span");
    eVal.style.minWidth = "4.4em";
    var lab1 = mkLabel("dimerization δ"); lab1.appendChild(dSlider); lab1.appendChild(dVal);
    var lab2 = mkLabel("tolerance ε"); lab2.appendChild(eSlider); lab2.appendChild(eVal);
    var runBtn = document.createElement("button");
    runBtn.type = "button"; runBtn.textContent = "▶ compile";
    runBtn.style.cssText = "min-width:7em;cursor:pointer;";
    var resetBtn = document.createElement("button");
    resetBtn.type = "button"; resetBtn.textContent = "↺ reset";
    resetBtn.style.cssText = "cursor:pointer;";
    controls.appendChild(lab1); controls.appendChild(lab2);
    controls.appendChild(runBtn); controls.appendChild(resetBtn);
    container.appendChild(controls);

    var note = document.createElement("p");
    note.style.cssText = "text-align:center;font-size:0.82rem;opacity:0.75;margin:0.5rem auto 0;max-width:38rem;";
    note.textContent = "Everything is computed live: exact diagonalization builds Γ, the elimination runs rotation by rotation, and the error is measured by actually replaying the compiled circuit on the vacuum. The first entry zeroed is the last gate of the circuit, so the diagram fills from its right end.";
    container.appendChild(note);

    // ---------------- state ----------------
    var delta = 0, epsExp; // eps = 10^epsExp mapped from slider
    var target, plan, Gw, pos = 0, running = false, raf = null;

    function epsFromSlider() {
      // slider 0 -> 1e-12 (exact), 1 -> 1e-1 (very lossy)
      return Math.pow(10, -12 + 11 * parseFloat(eSlider.value));
    }

    function recompute() {
      delta = parseFloat(dSlider.value);
      var eps = epsFromSlider();
      dVal.textContent = delta.toFixed(2);
      eVal.textContent = eps.toExponential(0).replace("e", "·10^");
      target = groundGamma(n, delta);
      plan = compile(target, eps);
      Gw = target.map(function (r) { return r.slice(); });
      pos = 0;
      running = false;
      runBtn.textContent = "▶ compile";
      render();
    }

    function stepOps(count) {
      while (count-- > 0 && pos < plan.ops.length) {
        var o = plan.ops[pos];
        rotPlane(Gw, o.p, o.p + 1, o.th);
        pos++;
      }
    }

    // ---------------- drawing ----------------
    function drawHeat(th) {
      var cell = HM / m;
      var acc = parseRGB(th.accent, [31, 178, 166]);
      for (var i = 0; i < m; i++) {
        for (var j = 0; j < m; j++) {
          var v = Math.min(1, Math.abs(Gw[i][j]));
          if (v < 1e-4) continue;
          var a = 0.06 + 0.94 * Math.pow(v, 0.6);
          ctx.fillStyle = "rgba(" + acc[0] + "," + acc[1] + "," + acc[2] + "," + a.toFixed(3) + ")";
          ctx.fillRect(4 + j * cell, PADT + i * cell, Math.ceil(cell), Math.ceil(cell));
        }
      }
      ctx.strokeStyle = th.faint;
      ctx.strokeRect(4.5, PADT + 0.5, HM - 1, HM - 1);
      ctx.fillStyle = th.dim;
      ctx.font = "500 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("|Γ|  (" + m + "×" + m + ")", 4 + HM / 2, PADT - 9);
    }

    function drawCircuit(th) {
      var x0 = 4 + HM + GAP;
      var wireGap = HM / (n + 1);
      var L = Math.max(1, plan.nLayers);
      var colW = Math.min(18, (CW - 30) / L);
      ctx.strokeStyle = th.faint;
      ctx.lineWidth = 1;
      for (var q = 0; q < n; q++) {
        var y = PADT + (q + 1) * wireGap;
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x0 + 20 + L * colW, y);
        ctx.stroke();
      }
      ctx.fillStyle = th.dim;
      ctx.font = "500 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("compiled circuit — " + plan.ops.length + " gates, depth " + plan.nLayers, x0 + (20 + L * colW) / 2, PADT - 9);
      // gates: op k sits at layer plan.layerOf[k]; derived ops are pos..end? No:
      // elimination order draws ops 0..pos-1; those are the LAST gates of the circuit.
      for (var k = 0; k < plan.ops.length; k++) {
        var done = k < pos;
        var cur = k === pos - 1 && running;
        if (!done) continue;
        var o = plan.ops[k];
        var lx = x0 + 12 + plan.layerOf[k] * colW + colW / 2;
        var col = cur ? th.alert : th.accent;
        ctx.strokeStyle = col;
        ctx.fillStyle = col;
        if (o.p % 2 === 0) {
          // Z-rotation on qubit p/2
          var qy = PADT + (o.p / 2 + 1) * wireGap;
          ctx.beginPath();
          ctx.arc(lx, qy, 2.6, 0, 2 * Math.PI);
          ctx.fill();
        } else {
          // XX-rotation on ((p-1)/2, (p-1)/2 + 1)
          var qa = (o.p - 1) / 2;
          var y1 = PADT + (qa + 1) * wireGap,
            y2 = PADT + (qa + 2) * wireGap;
          ctx.lineWidth = cur ? 3 : 2;
          ctx.beginPath();
          ctx.moveTo(lx, y1);
          ctx.lineTo(lx, y2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(lx, y1, 1.9, 0, 2 * Math.PI);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(lx, y2, 1.9, 0, 2 * Math.PI);
          ctx.fill();
          ctx.lineWidth = 1;
        }
      }
    }

    function render() {
      var th = theme();
      ctx.clearRect(0, 0, W, H);
      drawHeat(th);
      drawCircuit(th);
      var done = pos >= plan.ops.length;
      readout.innerHTML =
        "<span>gates <b>" + plan.ops.length + "</b></span>" +
        "<span>depth <b>" + plan.nLayers + "</b></span>" +
        "<span>replay error <b>" + plan.err.toExponential(1) + "</b></span>" +
        "<span style='opacity:0.75'>" + (done ? "eliminated → vacuum ✓" : "rotation " + pos + " / " + plan.ops.length) + "</span>";
    }

    function frame() {
      if (running) {
        stepOps(3);
        if (pos >= plan.ops.length) {
          running = false;
          runBtn.textContent = "▶ compile";
        }
        render();
      }
      raf = global.requestAnimationFrame(frame);
    }
    raf = global.requestAnimationFrame(frame);

    runBtn.addEventListener("click", function () {
      if (running) {
        running = false;
        runBtn.textContent = "▶ compile";
        return;
      }
      if (pos >= plan.ops.length) { Gw = target.map(function (r) { return r.slice(); }); pos = 0; }
      if (reduced) {
        stepOps(plan.ops.length);
        render();
        return;
      }
      running = true;
      runBtn.textContent = "⏸ pause";
    });
    resetBtn.addEventListener("click", recompute);
    dSlider.addEventListener("input", recompute);
    eSlider.addEventListener("input", recompute);

    var mo = new MutationObserver(render);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    global.addEventListener("resize", render);

    recompute();

    return {
      redraw: render,
      destroy: function () {
        running = false;
        if (raf) global.cancelAnimationFrame(raf);
        mo.disconnect();
        global.removeEventListener("resize", render);
        container.innerHTML = "";
      },
    };
  }

  global.createGivensElimination = createGivensElimination;
})(window);
