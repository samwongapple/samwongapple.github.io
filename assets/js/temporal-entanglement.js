/*
 * temporal-entanglement.js — temporal-entanglement explorer for the influence-matrix
 * post "Temporal Entanglement: When a Chaotic System Is a Perfect Bath".
 *
 * Physics.  Kicked Ising chain (one period = Ising layer then kick layer), the bath
 * contracted EXACTLY into its influence matrix at small sizes:
 *
 *   with a pure bath state |ψ⟩:      IM[s,s̄] = ⟨u_s̄ | u_s⟩,  u_s = V_s |ψ⟩
 *   with the ∞-temperature state:    IM[s,s̄] = 2^{-Lb} Σ_i ⟨u^i_s̄ | u^i_s⟩
 *
 * (u-tree over trajectory prefixes; identical conventions to the Part-1 widget:
 *  s_t = system spin entering step t, 1-indexed, σ_t = (s_t, s̄_t) folded.)
 *
 * The temporal entanglement across the cut after step k is the entropy of the
 * Schmidt spectrum of the folded 4^T vector reshaped to (4^k) × (4^{T-k}); we get
 * the squared singular values as eigenvalues of the smaller Gram matrix, via a
 * real-symmetric Jacobi eigensolver on the standard [[Re,−Im],[Im,Re]] embedding.
 *
 * Panel A: heatmap of the half-cut TE over the (b, J) plane (T=4, Lb=4) with the
 *          self-dual point marked — the dark cross at (π/4, π/4) is the point.
 * Panel B: bar chart of S(k) across every cut (T=6, Lb=6) at the slider (b, J).
 *
 * Vanilla JS, no dependencies. Colours read from the site's CSS theme variables.
 *
 * Usage:
 *   const w = createTemporalEntanglement(el, {});
 *   w.setParams(b, J); w.setBath('mixed'); w.snapSelfDual(); w.destroy();
 */
(function (global) {
  "use strict";

  // ---- complex helpers (interleaved Float64Arrays) --------------------------------
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

  // ---- the influence matrix, exactly ---------------------------------------------
  // dense folded IM (length 4^T interleaved complex, σ_1 = most significant base-4
  // digit) for a bath of Lb kicked-Ising sites; bath0 = 'up' | 'mixed'
  function denseIM(Lb, T, J, b, bath0) {
    var dimb = 1 << Lb, Kb = kickMat(b);
    var phInt = new Float64Array(2 * dimb), zb0 = new Float64Array(dimb);
    for (var i = 0; i < dimb; i++) {
      var e = 0;
      for (var j = 0; j < Lb - 1; j++)
        e += zOfBit((i >> (Lb - 1 - j)) & 1) * zOfBit((i >> (Lb - 2 - j)) & 1);
      phInt[2 * i] = Math.cos(-J * e); phInt[2 * i + 1] = Math.sin(-J * e);
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
    var inits = [];
    if (bath0 === "mixed") {
      for (i = 0; i < dimb; i++) { var w0 = cvec(dimb); w0[2 * i] = 1; inits.push(w0); }
    } else {
      var p0 = cvec(dimb); p0[0] = 1; inits.push(p0);
    }
    var n = 1 << T, IM = cvec(4 ** T);
    var weight = bath0 === "mixed" ? 1 / dimb : 1;
    for (var s0 = 0; s0 < inits.length; s0++) {
      // u-tree: level t holds 2^t vectors, trajectory bits MSB = s_1 (bit 0 ⇒ +1)
      var level = [inits[s0]];
      for (var t = 0; t < T; t++) {
        var nxt = new Array(level.length * 2);
        for (var p = 0; p < level.length; p++) {
          nxt[2 * p] = step(level[p], +1);
          nxt[2 * p + 1] = step(level[p], -1);
        }
        level = nxt;
      }
      for (var sf = 0; sf < n; sf++) {
        for (var sb = 0; sb < n; sb++) {
          var gr = 0, gi = 0, uf = level[sf], ub = level[sb];
          for (var k2 = 0; k2 < dimb; k2++) {
            var xr = ub[2 * k2], xi = ub[2 * k2 + 1], yr = uf[2 * k2], yi = uf[2 * k2 + 1];
            gr += xr * yr + xi * yi; gi += xr * yi - xi * yr;
          }
          var idx = 0;
          for (var k3 = 0; k3 < T; k3++)
            idx = idx * 4 + 2 * ((sf >> (T - 1 - k3)) & 1) + ((sb >> (T - 1 - k3)) & 1);
          IM[2 * idx] += weight * gr; IM[2 * idx + 1] += weight * gi;
        }
      }
    }
    return IM;
  }

  // ---- Schmidt spectra ------------------------------------------------------------
  // real symmetric Jacobi eigenvalues (in place on a copy)
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

  // entropy of the Schmidt spectrum across the cut after step k (1 ≤ k ≤ T−1)
  function cutEntropy(IM, T, k) {
    var rows = 4 ** k, cols = 4 ** (T - k);
    var small = Math.min(rows, cols), byRow = rows <= cols;
    // Gram of the smaller side: G = M M† (byRow) or M† M — complex hermitian
    var Gr = [], Gi = [];
    for (var a = 0; a < small; a++) { Gr.push(new Float64Array(small)); Gi.push(new Float64Array(small)); }
    for (a = 0; a < small; a++) {
      for (var b2 = 0; b2 <= a; b2++) {
        var sr = 0, si = 0;
        var len = byRow ? cols : rows;
        for (var c = 0; c < len; c++) {
          var ia = byRow ? a * cols + c : c * cols + a;
          var ib = byRow ? b2 * cols + c : c * cols + b2;
          var xr = IM[2 * ia], xi = IM[2 * ia + 1], yr = IM[2 * ib], yi = IM[2 * ib + 1];
          sr += xr * yr + xi * yi; si += xi * yr - xr * yi;
        }
        Gr[a][b2] = sr; Gr[b2][a] = sr; Gi[a][b2] = si; Gi[b2][a] = -si;
      }
    }
    // embed hermitian G into real symmetric [[Re,−Im],[Im,Re]] (eigenvalues doubled)
    var n2 = 2 * small, R = [];
    for (a = 0; a < n2; a++) R.push(new Float64Array(n2));
    for (a = 0; a < small; a++) for (b2 = 0; b2 < small; b2++) {
      R[a][b2] = Gr[a][b2]; R[a + small][b2 + small] = Gr[a][b2];
      R[a][b2 + small] = -Gi[a][b2]; R[a + small][b2] = Gi[a][b2];
    }
    var ev = jacobiEig(R, n2).filter(function (x) { return x > 0; }).sort(function (x, y) { return y - x; });
    // each true eigenvalue appears twice in the embedding — halve by taking every other
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

  function allCutEntropies(IM, T) {
    var out = [];
    for (var k = 1; k <= T - 1; k++) out.push(cutEntropy(IM, T, k));
    return out;
  }

  // ---- widget ---------------------------------------------------------------------
  function createTemporalEntanglement(mount, opts) {
    opts = opts || {};
    var TMAP = 4, LBMAP = 4;        // heatmap resolution economics
    var TBAR = 6, LBBAR = 6;        // bar-chart sizes
    var GRID = 36;
    var state = { b: opts.b || 0.6, J: opts.J || 0.7, bath: "up", maps: {} };

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
    var colA = document.createElement("div"), colB = document.createElement("div");
    root.appendChild(colA); root.appendChild(colB);
    mount.appendChild(root);
    var cvA = document.createElement("canvas");
    cvA.width = 300; cvA.height = 300; cvA.style.cssText = "max-width:100%;height:auto;";
    colA.appendChild(cvA);
    var capA = document.createElement("div");
    capA.style.cssText = "text-align:center;font-size:0.75rem;opacity:0.75;margin-top:0.3rem;max-width:300px;";
    capA.textContent = "half-cut TE over the (b, J) plane — T=4, bath 4 sites deep";
    colA.appendChild(capA);
    var cvB = document.createElement("canvas");
    cvB.width = 300; cvB.height = 260; cvB.style.cssText = "max-width:100%;height:auto;";
    colB.appendChild(cvB);
    var badge = document.createElement("div");
    badge.style.cssText = "text-align:center;font-size:0.85rem;margin-top:0.35rem;font-variant-numeric:tabular-nums;";
    colB.appendChild(badge);

    var bmin = 0.05, bmax = Math.PI / 2 - 0.02;

    function mapKey() { return state.bath; }
    function computeMap() {
      var key = mapKey();
      if (state.maps[key]) return state.maps[key];
      var m = new Float64Array(GRID * GRID), vmax = 0;
      for (var iy = 0; iy < GRID; iy++) {          // J on y
        var J = bmin + (bmax - bmin) * iy / (GRID - 1);
        for (var ix = 0; ix < GRID; ix++) {        // b on x
          var b = bmin + (bmax - bmin) * ix / (GRID - 1);
          var IM = denseIM(LBMAP, TMAP, J, b, state.bath);
          var S = cutEntropy(IM, TMAP, TMAP / 2);
          m[iy * GRID + ix] = S; vmax = Math.max(vmax, S);
        }
      }
      state.maps[key] = { m: m, vmax: vmax };
      return state.maps[key];
    }

    function drawMap() {
      var ctx = cvA.getContext("2d"), c = colors();
      var W = cvA.width, H = cvA.height, x0 = 40, y0 = H - 36, pw = W - 56, phh = H - 60;
      ctx.clearRect(0, 0, W, H);
      var map = computeMap();
      var cell = { w: pw / GRID, h: phh / GRID };
      // teal-intensity colormap: dark (low TE) → bright (high TE)
      var acc = c.accent, m = /^#?([0-9a-f]{6})$/i.exec(acc.replace("#", ""));
      var ar = m ? parseInt(m[1].slice(0, 2), 16) : 31, ag = m ? parseInt(m[1].slice(2, 4), 16) : 178, ab = m ? parseInt(m[1].slice(4, 6), 16) : 166;
      for (var iy = 0; iy < GRID; iy++) for (var ix = 0; ix < GRID; ix++) {
        var v = map.m[iy * GRID + ix] / (map.vmax || 1);
        ctx.fillStyle = "rgba(" + ar + "," + ag + "," + ab + "," + (0.08 + 0.9 * v).toFixed(3) + ")";
        ctx.fillRect(x0 + ix * cell.w, y0 - (iy + 1) * cell.h, cell.w + 0.5, cell.h + 0.5);
      }
      // self-dual marker
      var sd = (Math.PI / 4 - bmin) / (bmax - bmin);
      ctx.strokeStyle = c.text; ctx.lineWidth = 1.2;
      var sx = x0 + sd * pw, sy = y0 - sd * phh;
      ctx.beginPath(); ctx.moveTo(sx - 6, sy); ctx.lineTo(sx + 6, sy); ctx.moveTo(sx, sy - 6); ctx.lineTo(sx, sy + 6); ctx.stroke();
      // current (b, J) marker
      var px = x0 + (state.b - bmin) / (bmax - bmin) * pw, py = y0 - (state.J - bmin) / (bmax - bmin) * phh;
      ctx.strokeStyle = c.text; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(px, py, 6, 0, 2 * Math.PI); ctx.stroke();
      // axes
      ctx.fillStyle = c.text; ctx.font = "10px system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("kick b →", x0 + pw / 2, H - 8);
      ctx.save(); ctx.translate(12, y0 - phh / 2); ctx.rotate(-Math.PI / 2); ctx.fillText("coupling J →", 0, 0); ctx.restore();
      ctx.font = "9.5px system-ui, sans-serif";
      ctx.fillText("＋ = self-dual point (π/4, π/4)", x0 + pw / 2, 12);
      ctx.textAlign = "start";
    }

    function drawBars() {
      var ctx = cvB.getContext("2d"), c = colors();
      var W = cvB.width, H = cvB.height;
      ctx.clearRect(0, 0, W, H);
      var IM = denseIM(LBBAR, TBAR, state.J, state.b, state.bath);
      var S = allCutEntropies(IM, TBAR);
      var smax = Math.max(0.75, Math.max.apply(null, S));
      var x0 = 40, y0 = H - 40, pw = W - 60, phh = H - 66, bw = pw / (TBAR - 1);
      ctx.strokeStyle = c.faint; ctx.beginPath(); ctx.moveTo(x0, y0 - phh); ctx.lineTo(x0, y0); ctx.lineTo(x0 + pw, y0); ctx.stroke();
      // ln 2 guide (one perfectly shared bit of memory)
      var yln2 = y0 - Math.LN2 / smax * phh;
      ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(x0, yln2); ctx.lineTo(x0 + pw, yln2); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = c.text; ctx.font = "9px system-ui, sans-serif";
      ctx.fillText("ln 2", x0 + pw + 2, yln2 + 3);
      for (var k = 1; k <= TBAR - 1; k++) {
        var h = S[k - 1] / smax * phh;
        ctx.fillStyle = c.accent; ctx.globalAlpha = 0.85;
        ctx.fillRect(x0 + (k - 1) * bw + bw * 0.18, y0 - h, bw * 0.64, h);
        ctx.globalAlpha = 1;
        ctx.fillStyle = c.text; ctx.font = "10px system-ui, sans-serif"; ctx.textAlign = "center";
        ctx.fillText(String(k), x0 + (k - 0.5) * bw, y0 + 14);
      }
      ctx.fillStyle = c.text; ctx.textAlign = "center";
      ctx.fillText("cut after step k   (T = 6, bath 6 sites deep)", x0 + pw / 2, H - 8);
      ctx.save(); ctx.translate(12, y0 - phh / 2); ctx.rotate(-Math.PI / 2);
      ctx.fillText("S(k) — temporal entanglement", 0, 0); ctx.restore();
      ctx.textAlign = "start";
      var maxS = Math.max.apply(null, S);
      var isProd = maxS < 1e-10;
      badge.innerHTML = isProd
        ? "max TE = <span style='color:" + c.accent + ";font-weight:600'>0 — the IM is an exact product state in time</span>"
        : "max TE over cuts = <span style='color:" + c.accent + ";font-weight:600'>" + maxS.toFixed(4) + "</span>";
    }

    function redraw() { drawMap(); drawBars(); }
    redraw();

    return {
      setParams: function (b, J) { state.b = +b; state.J = +J; redraw(); },
      setBath: function (which) { state.bath = which === "mixed" ? "mixed" : "up"; redraw(); },
      snapSelfDual: function () { state.b = Math.PI / 4; state.J = Math.PI / 4; redraw(); return { b: state.b, J: state.J }; },
      redraw: redraw,
      destroy: function () { mount.removeChild(root); }
    };
  }

  global.createTemporalEntanglement = createTemporalEntanglement;
  global.__tePhysics = { denseIM: denseIM, cutEntropy: cutEntropy, allCutEntropies: allCutEntropies };
})(typeof window !== "undefined" ? window : globalThis);
