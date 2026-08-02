/*
 * influence-matrix-rotation.js — space-time rotation explorer for the influence-matrix
 * blog post "The Influence Matrix: Integrating Out Everything But the Question".
 *
 * Physics.  Kicked Ising chain, one Floquet period = Ising layer then kick layer:
 *
 *     U_F = exp(-i b Σ X_j) · exp(-i J Σ Z_j Z_{j+1}),   L sites, site 1 = "system".
 *
 * Everything here is exact dense linear algebra at small sizes (L = 5, T = 6):
 *
 *   · brute force:  evolve the full 2^L pure state |↑…↑⟩ period by period and read
 *     off ⟨Z_1(t)⟩ — the "contract in time" order (carrying 2^L amplitudes).
 *
 *   · influence matrix:  contract the bath (sites 2…L) once.  Because the coupling
 *     gate is diagonal, the bath's evolution depends on the system only through the
 *     trajectory s = (s_1,…,s_T), s_t = system spin ENTERING step t (1-indexed, as
 *     in the post).  With a pure bath state |ψ_b⟩,
 *
 *         u_s = V_s |ψ_b⟩,   V_s = Π_t [ K_bath · D_int · e^{-iJ s_t z_boundary} ],
 *         IM[s, s̄] = ⟨u_s̄ | u_s⟩            (a Gram matrix — the influence matrix),
 *
 *     built once as a tree over trajectory prefixes.  ⟨Z_1(t)⟩ is then a purely
 *     1D contraction of system-only data (initial state, kicks, observable) against
 *     IM — the "contract in space" order (carrying 4^T components).
 *
 * The two must agree to machine precision; panel B displays the max deviation.
 * Panel C swaps the system drive REUSING the cached IM — only the cheap system-side
 * contraction reruns, which is the "solve the bath once" point of the post.
 *
 * Vanilla JS, no dependencies.  Colours read from the site's CSS theme variables.
 *
 * Usage:
 *   const w = createInfluenceMatrixRotation(el, { L: 5, T: 6 });
 *   w.setParams(b, J); w.setDrive('half'); w.sweep('time'); w.destroy();
 */
(function (global) {
  "use strict";

  // ---- tiny complex arithmetic on interleaved Float64Arrays [re0,im0,re1,im1,…] ----
  function cvec(n) { return new Float64Array(2 * n); }

  // out ← A(2x2 complex, as [r00,i00,r01,i01,r10,i10,r11,i11]) applied to the
  // single-site index `site` (0-based from the LEFT / most significant bit) of a
  // length-2^n interleaved state vector. Returns a new vector.
  function applySingleSite(A, v, n, site) {
    var out = cvec(1 << n);
    var stride = 1 << (n - 1 - site); // distance between the two states differing at `site`
    var dim = 1 << n;
    for (var base = 0; base < dim; base++) {
      if (base & stride) continue; // handle each pair once, from its bit=0 member
      var i0 = base, i1 = base | stride;
      var r0 = v[2 * i0], im0 = v[2 * i0 + 1], r1 = v[2 * i1], im1 = v[2 * i1 + 1];
      out[2 * i0]     = A[0] * r0 - A[1] * im0 + A[2] * r1 - A[3] * im1;
      out[2 * i0 + 1] = A[0] * im0 + A[1] * r0 + A[2] * im1 + A[3] * r1;
      out[2 * i1]     = A[4] * r0 - A[5] * im0 + A[6] * r1 - A[7] * im1;
      out[2 * i1 + 1] = A[4] * im0 + A[5] * r0 + A[6] * im1 + A[7] * r1;
    }
    return out;
  }

  // elementwise multiply by a diagonal of unit phases given as [cos_k, sin_k] pairs
  function applyDiag(ph, v, dim) {
    var out = cvec(dim);
    for (var k = 0; k < dim; k++) {
      var c = ph[2 * k], s = ph[2 * k + 1], r = v[2 * k], i = v[2 * k + 1];
      out[2 * k] = c * r - s * i;
      out[2 * k + 1] = c * i + s * r;
    }
    return out;
  }

  function kickMat(b) { // exp(-i b X) in the Z basis
    var c = Math.cos(b), s = Math.sin(b);
    return [c, 0, 0, -s, 0, -s, c, 0];
  }

  function zOfBit(bit) { return 1 - 2 * bit; }

  // ---- physics: brute force -------------------------------------------------------
  // <Z_1(t)>, t = 1..T, for the full chain from |↑…↑⟩, kick angle bSys on site 1
  // (possibly a per-step array) and bBath elsewhere.
  function bruteZ1(L, T, J, bBath, bSysSeq) {
    var dim = 1 << L;
    var psi = cvec(dim); psi[0] = 1;
    // Ising layer: diagonal phases over ALL bonds (1,2)…(L-1,L)
    var ph = new Float64Array(2 * dim);
    for (var idx = 0; idx < dim; idx++) {
      var e = 0;
      for (var j = 0; j < L - 1; j++)
        e += zOfBit((idx >> (L - 1 - j)) & 1) * zOfBit((idx >> (L - 2 - j)) & 1);
      ph[2 * idx] = Math.cos(-J * e); ph[2 * idx + 1] = Math.sin(-J * e);
    }
    var Kb = kickMat(bBath);
    var out = new Float64Array(T);
    for (var t = 0; t < T; t++) {
      psi = applyDiag(ph, psi, dim);
      psi = applySingleSite(kickMat(bSysSeq[t]), psi, L, 0);
      for (var s2 = 1; s2 < L; s2++) psi = applySingleSite(Kb, psi, L, s2);
      var z = 0;
      for (idx = 0; idx < dim; idx++)
        z += zOfBit((idx >> (L - 1)) & 1) * (psi[2 * idx] * psi[2 * idx] + psi[2 * idx + 1] * psi[2 * idx + 1]);
      out[t] = z;
    }
    return out;
  }

  // ---- physics: the influence matrix ---------------------------------------------
  // Contract the bath once: u-tree over trajectory prefixes. levels[t] is an array of
  // 2^t interleaved bath vectors; the trajectory is read off the index bits,
  // MSB = s_1 (bit 0 ⇒ s=+1). Returns {levels, Lb}.
  function buildIMTree(L, T, J, bBath) {
    var Lb = L - 1, dimb = 1 << Lb;
    // internal bath Ising phases + boundary z (bath site adjacent to the system)
    var phInt = new Float64Array(2 * dimb), zb0 = new Float64Array(dimb);
    for (var i = 0; i < dimb; i++) {
      var e = 0;
      for (var j = 0; j < Lb - 1; j++)
        e += zOfBit((i >> (Lb - 1 - j)) & 1) * zOfBit((i >> (Lb - 2 - j)) & 1);
      phInt[2 * i] = Math.cos(-J * e); phInt[2 * i + 1] = Math.sin(-J * e);
      zb0[i] = zOfBit((i >> (Lb - 1)) & 1);
    }
    var Kb = kickMat(bBath);
    var step = function (u, s) { // one period of V_s for one trajectory entry s = ±1
      var ph = new Float64Array(2 * dimb);
      for (var k = 0; k < dimb; k++) {
        ph[2 * k] = Math.cos(-J * s * zb0[k]); ph[2 * k + 1] = Math.sin(-J * s * zb0[k]);
      }
      var v = applyDiag(ph, applyDiag(phInt, u, dimb), dimb);
      for (var q = 0; q < Lb; q++) v = applySingleSite(Kb, v, Lb, q);
      return v;
    };
    var psi0 = cvec(dimb); psi0[0] = 1;
    var levels = [[psi0]];
    for (var t = 0; t < T; t++) {
      var prev = levels[t], next = new Array(prev.length * 2);
      for (var p = 0; p < prev.length; p++) {
        next[2 * p] = step(prev[p], +1);     // bit 0 ⇒ s_t = +1
        next[2 * p + 1] = step(prev[p], -1); // bit 1 ⇒ s_t = -1
      }
      levels.push(next);
    }
    return { levels: levels, Lb: Lb };
  }

  // <Z_1(t)> from the cached IM tree: contract system-only data against IM_t.
  // System side: ρ_s = |↑⟩, per-step kicks bSysSeq, observable Z at step t.
  function imZ1(tree, T, bSysSeq) {
    var out = new Float64Array(T);
    for (var t = 1; t <= T; t++) {
      var us = tree.levels[t], n = us.length, dimb = 1 << tree.Lb;
      // forward endpoint amplitudes w[traj] (2 complex numbers), 0 unless s_1 = +1
      var wr = new Float64Array(2 * n), wi = new Float64Array(2 * n); // [end0,end1] per traj
      for (var traj = 0; traj < n; traj++) {
        if ((traj >> (t - 1)) & 1) continue; // s_1 must be +1 (|↑⟩): MSB of t-bit index
        var ar = 1, ai = 0;
        for (var k = 0; k < t - 1; k++) {
          var sFrom = (traj >> (t - 1 - k)) & 1, sTo = (traj >> (t - 2 - k)) & 1;
          var K = kickMat(bSysSeq[k]);
          var m = [K[(sTo * 2 + sFrom) * 2], K[(sTo * 2 + sFrom) * 2 + 1]];
          var nr = ar * m[0] - ai * m[1], ni = ar * m[1] + ai * m[0];
          ar = nr; ai = ni;
        }
        var Kf = kickMat(bSysSeq[t - 1]), sLast = traj & 1;
        for (var end = 0; end < 2; end++) {
          var mr = Kf[(end * 2 + sLast) * 2], mi = Kf[(end * 2 + sLast) * 2 + 1];
          wr[2 * traj + end] = ar * mr - ai * mi;
          wi[2 * traj + end] = ar * mi + ai * mr;
        }
      }
      // Σ_{s,s̄} IM[s,s̄] Σ_end z(end) w_s(end) w*_s̄(end),  IM[s,s̄] = ⟨u_s̄|u_s⟩
      var val = 0;
      for (var sA = 0; sA < n; sA++) {
        var a0r = wr[2 * sA], a0i = wi[2 * sA], a1r = wr[2 * sA + 1], a1i = wi[2 * sA + 1];
        if (a0r === 0 && a0i === 0 && a1r === 0 && a1i === 0) continue;
        for (var sB = 0; sB < n; sB++) {
          var b0r = wr[2 * sB], b0i = wi[2 * sB], b1r = wr[2 * sB + 1], b1i = wi[2 * sB + 1];
          if (b0r === 0 && b0i === 0 && b1r === 0 && b1i === 0) continue;
          // IM = ⟨u_sB|u_sA⟩
          var gr = 0, gi = 0, uA = us[sA], uB = us[sB];
          for (var k2 = 0; k2 < dimb; k2++) {
            var xr = uB[2 * k2], xi = uB[2 * k2 + 1], yr = uA[2 * k2], yi = uA[2 * k2 + 1];
            gr += xr * yr + xi * yi; gi += xr * yi - xi * yr;
          }
          // sys factor: Σ_end z(end) w_sA(end) conj(w_sB(end)); z(0)=+1, z(1)=-1
          var fr = (a0r * b0r + a0i * b0i) - (a1r * b1r + a1i * b1i);
          var fi = (a0i * b0r - a0r * b0i) - (a1i * b1r - a1r * b1i);
          val += gr * fr - gi * fi;
        }
      }
      out[t - 1] = val;
    }
    return out;
  }

  // available system drives for panel C — each maps (t, bBath) → kick angle at step t
  var DRIVES = {
    same:   { label: "same kick as the bath", f: function (t, b) { return b; } },
    half:   { label: "half the kick", f: function (t, b) { return b / 2; } },
    none:   { label: "no drive at all (bₛ = 0)", f: function () { return 0; } },
    pipulse:{ label: "π/2-pulse train", f: function () { return Math.PI / 4; } },
    ramp:   { label: "ramp: kick grows each step", f: function (t, b) { return b * (t + 1) / 6; } }
  };

  // ---- widget ---------------------------------------------------------------------
  function createInfluenceMatrixRotation(mount, opts) {
    opts = opts || {};
    var L = opts.L || 5, T = opts.T || 6;
    var state = { b: opts.b || 0.6, J: opts.J || 0.7, drive: "same", tree: null, anim: null };

    function themeColor(name, fallback) {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fallback;
    }
    function colors() {
      return {
        accent: themeColor("--global-theme-color", "#1fb2a6"),
        text: themeColor("--global-text-color", "#e6e6e6"),
        faint: "rgba(128,128,128,0.35)"
      };
    }

    // --- DOM scaffold: two panels side by side (stack on narrow screens) ---
    var root = document.createElement("div");
    root.style.cssText = "display:flex;flex-wrap:wrap;gap:1.2rem;justify-content:center;align-items:flex-start;";
    var colA = document.createElement("div"), colB = document.createElement("div");
    root.appendChild(colA); root.appendChild(colB);
    mount.appendChild(root);

    var cvA = document.createElement("canvas");
    cvA.width = 340; cvA.height = 300; cvA.style.cssText = "max-width:100%;height:auto;";
    colA.appendChild(cvA);
    var btnRow = document.createElement("div");
    btnRow.style.cssText = "display:flex;gap:0.6rem;justify-content:center;margin-top:0.4rem;";
    function mkBtn(txt) {
      var b = document.createElement("button");
      b.textContent = txt;
      b.style.cssText = "font-size:0.8rem;padding:0.3rem 0.7rem;border-radius:6px;border:1px solid " +
        colors().accent + ";background:transparent;color:inherit;cursor:pointer;";
      return b;
    }
    var btnTime = mkBtn("sweep in time"), btnSpace = mkBtn("sweep in space");
    btnRow.appendChild(btnTime); btnRow.appendChild(btnSpace);
    colA.appendChild(btnRow);

    var cvB = document.createElement("canvas");
    cvB.width = 340; cvB.height = 250; cvB.style.cssText = "max-width:100%;height:auto;";
    colB.appendChild(cvB);
    var badge = document.createElement("div");
    badge.style.cssText = "text-align:center;font-size:0.85rem;margin-top:0.35rem;font-variant-numeric:tabular-nums;";
    colB.appendChild(badge);
    var reuse = document.createElement("div");
    reuse.style.cssText = "text-align:center;font-size:0.75rem;opacity:0.75;margin-top:0.15rem;";
    colB.appendChild(reuse);

    // --- panel A: the network + sweep animation ---
    // progress: {mode:'time'|'space', k} — number of rows (time) or columns (space) absorbed
    function drawNetwork(progress) {
      var ctx = cvA.getContext("2d"), c = colors();
      var W = cvA.width, H = cvA.height;
      ctx.clearRect(0, 0, W, H);
      var x0 = 46, dx = (W - 90) / (L - 1), y0 = H - 64, dy = (H - 130) / T;
      // shading of the absorbed region
      ctx.fillStyle = "rgba(128,128,128,0.10)";
      if (progress && progress.mode === "time" && progress.k > 0)
        ctx.fillRect(x0 - 16, y0 - progress.k * dy + dy / 2, (L - 1) * dx + 32, progress.k * dy);
      if (progress && progress.mode === "space" && progress.k > 0)
        ctx.fillRect(x0 + (L - 1 - progress.k) * dx + dx / 2, y0 - T * dy + dy / 2, progress.k * dx, T * dy);
      // wires
      for (var j = 0; j < L; j++) {
        ctx.strokeStyle = j === 0 ? c.accent : c.faint;
        ctx.lineWidth = j === 0 ? 2 : 1.2;
        ctx.beginPath();
        ctx.moveTo(x0 + j * dx, y0 + 8); ctx.lineTo(x0 + j * dx, y0 - T * dy + dy / 2 - 6);
        ctx.stroke();
      }
      // gates: bond rects between wires + kick squares on wires, one row per period
      for (var t = 0; t < T; t++) {
        var y = y0 - t * dy;
        for (j = 0; j < L - 1; j++) {
          ctx.fillStyle = j === 0 ? c.accent : "rgba(128,128,128,0.30)";
          ctx.globalAlpha = j === 0 ? 0.8 : 1;
          ctx.fillRect(x0 + j * dx + dx * 0.22, y - 3.5, dx * 0.56, 7);
          ctx.globalAlpha = 1;
        }
        for (j = 0; j < L; j++) {
          ctx.fillStyle = "rgba(128,128,128,0.45)";
          ctx.fillRect(x0 + j * dx - 4, y - dy * 0.5 - 4, 8, 8);
        }
      }
      // cut
      ctx.strokeStyle = c.accent; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x0 + dx * 0.12, y0 + 14); ctx.lineTo(x0 + dx * 0.12, y0 - T * dy + dy / 2 - 12);
      ctx.stroke(); ctx.setLineDash([]);
      // labels
      ctx.fillStyle = c.text; ctx.font = "10px system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("system", x0, H - 34);
      ctx.fillText("bath", x0 + dx * (L / 2), H - 34);
      // dimension bar: log-scale cost of the carried object
      var label, frac;
      if (progress && progress.mode === "space") {
        label = "carrying the temporal state: 4^" + T + " = " + Math.pow(4, T) + " components";
        frac = (2 * T) / (2 * T); // log2(4^T)/max
      } else {
        label = "carrying the spatial state: 2^" + L + " = " + Math.pow(2, L) + " amplitudes";
        frac = L / (2 * T);
      }
      var bw = W - 80;
      ctx.fillStyle = "rgba(128,128,128,0.22)"; ctx.fillRect(40, H - 22, bw, 8);
      ctx.fillStyle = c.accent; ctx.fillRect(40, H - 22, bw * Math.min(1, frac), 8);
      ctx.fillStyle = c.text; ctx.font = "9.5px system-ui, sans-serif";
      ctx.fillText(label, W / 2, H - 6);
      ctx.textAlign = "start";
    }

    function sweep(mode) {
      if (state.anim) cancelAnimationFrame(state.anim);
      var total = mode === "time" ? T : L - 1, k = 0, last = 0;
      function frame(ts) {
        if (ts - last > 420) { k++; last = ts; }
        drawNetwork({ mode: mode, k: Math.min(k, total) });
        if (k <= total) state.anim = requestAnimationFrame(frame);
      }
      state.anim = requestAnimationFrame(frame);
    }

    // --- panel B: the two curves + agreement badge ---
    function drawCurves(brute, im) {
      var ctx = cvB.getContext("2d"), c = colors();
      var W = cvB.width, H = cvB.height;
      ctx.clearRect(0, 0, W, H);
      var x0 = 40, x1 = W - 16, y0 = H - 34, y1 = 18;
      var xOf = function (t) { return x0 + (t - 1) / (T - 1) * (x1 - x0); };
      var yOf = function (v) { return y0 + (v + 1) / 2 * (y1 - y0); };
      // axes
      ctx.strokeStyle = c.faint; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
      ctx.beginPath(); ctx.setLineDash([3, 4]); ctx.moveTo(x0, yOf(0)); ctx.lineTo(x1, yOf(0)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = c.text; ctx.font = "10px system-ui, sans-serif";
      ctx.textAlign = "center";
      for (var t = 1; t <= T; t++) ctx.fillText(String(t), xOf(t), H - 20);
      ctx.fillText("t  (Floquet steps)", (x0 + x1) / 2, H - 6);
      ctx.save(); ctx.translate(12, (y0 + y1) / 2); ctx.rotate(-Math.PI / 2);
      ctx.fillText("⟨Z₁(t)⟩", 0, 0); ctx.restore();
      ctx.textAlign = "start";
      ctx.fillText("+1", x0 - 24, yOf(1) + 3); ctx.fillText("−1", x0 - 24, yOf(-1) + 3);
      // brute force: solid line
      ctx.strokeStyle = c.text; ctx.lineWidth = 1.6; ctx.beginPath();
      for (t = 1; t <= T; t++) { var x = xOf(t), y = yOf(brute[t - 1]); t === 1 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.stroke();
      // IM: open circles
      ctx.strokeStyle = c.accent; ctx.lineWidth = 2;
      for (t = 1; t <= T; t++) {
        ctx.beginPath(); ctx.arc(xOf(t), yOf(im[t - 1]), 5, 0, 2 * Math.PI); ctx.stroke();
      }
      // legend
      ctx.fillStyle = c.text; ctx.font = "9.5px system-ui, sans-serif";
      ctx.fillText("— brute force (2^" + L + " state)", x0 + 6, y1 + 10);
      ctx.fillStyle = c.accent;
      ctx.fillText("○ via the influence matrix", x0 + 6, y1 + 24);
    }

    // --- computation & wiring ---
    function driveSeq() {
      var f = DRIVES[state.drive].f, seq = new Array(T);
      for (var t = 0; t < T; t++) seq[t] = f(t, state.b);
      return seq;
    }
    function recompute(reuseTree) {
      if (!reuseTree || !state.tree) state.tree = buildIMTree(L, T, state.J, state.b);
      var seq = driveSeq();
      var brute = bruteZ1(L, T, state.J, state.b, seq);
      var im = imZ1(state.tree, T, seq);
      var dev = 0;
      for (var t = 0; t < T; t++) dev = Math.max(dev, Math.abs(brute[t] - im[t]));
      drawCurves(brute, im);
      var c = colors();
      badge.innerHTML = "max deviation&nbsp;<span style='color:" + c.accent +
        ";font-weight:600'>|Δ| " + (dev < 1e-10 ? "&lt; 1e−10" : "= " + dev.toExponential(1)) + "</span>";
      reuse.textContent = reuseTree
        ? "bath NOT re-contracted — cached IM reused, only the 1D system contraction reran"
        : "bath contracted afresh (IM rebuilt for these b, J)";
    }

    btnTime.addEventListener("click", function () { sweep("time"); });
    btnSpace.addEventListener("click", function () { sweep("space"); });

    drawNetwork(null);
    recompute(false);

    return {
      setParams: function (b, J) { state.b = +b; state.J = +J; recompute(false); },
      setDrive: function (d) { if (DRIVES[d]) { state.drive = d; recompute(true); } },
      drives: DRIVES,
      sweep: sweep,
      redraw: function () { drawNetwork(null); recompute(true); },
      destroy: function () { if (state.anim) cancelAnimationFrame(state.anim); mount.removeChild(root); }
    };
  }

  global.createInfluenceMatrixRotation = createInfluenceMatrixRotation;
  // exposed for offline testing (node): pure physics, no DOM
  global.__imRotationPhysics = { bruteZ1: bruteZ1, buildIMTree: buildIMTree, imZ1: imZ1 };
})(typeof window !== "undefined" ? window : globalThis);
