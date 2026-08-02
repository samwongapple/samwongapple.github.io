/*
 * correlation-collapse.js — dual-unitary correlation explorer for the
 * solvable-circuits post "Dual Unitarity: Exactly Solvable, Genuinely Chaotic".
 *
 * Physics. Brickwork circuit of the two-qubit gate
 *   U(J,b,ε) = (e^{ibX} ⊗ e^{ibX}) · exp[i((π/4−ε)XX + (π/4)YY + J·ZZ)],
 * dual-unitary iff ε = 0. Layers: even (0,1),(2,3),… then odd (1,2),…,(9,0),
 * PBC, L = 10, site 0 = MSB — identical conventions to the series reference
 * numerics (scratchpad du_reference.py / p2_ref.py).
 *
 * LEFT panel: spacetime map of C^{αα}(x,t) = 2^{-L} Tr[σ_x(t) σ_0].
 *   rows t ≤ 2: dense brute force (evolve σ_0 forward gate by gate; the
 *   support wraps the 10-site ring at t = 3, so t ≤ 2 is the honest window);
 *   rows t = 3,4: with ε = 0, the exact infinite-chain result — zero interior,
 *   ray value from channel powers; with ε > 0, question marks (nothing exact
 *   is known there).
 * RIGHT panel: eigenvalues of the light-ray channel
 *   M₊(a) = ½ Tr₂[U†(1⊗a)U]   (right-moving ray; M₊ = M₋ for our symmetric
 *   kicks) in the unit disk, plus the predicted ray decay |M₊^{2t}|_{σσ} with
 *   the brute-force points overlaid. Channel matrix is real in the Hermitian
 *   basis {1,X,Y,Z}/√2; eigenvalues via Faddeev–LeVerrier + Durand–Kerner.
 *
 * Verified against numpy references (p2_refs.json) in the node harness.
 * Vanilla JS, no dependencies; colours from the site's CSS theme variables.
 *
 * Usage:
 *   const w = createCorrelationCollapse(el, {});
 *   w.setParams(J, b, eps); w.setOperator('Z'|'X'); w.onStatus(cb); w.destroy();
 */
(function (global) {
  "use strict";

  var L = 10, DIM = 1 << L, TBRUTE = 2, TSHOW = 4, TCURVE = 7;

  // ---------- complex 4x4 gate ----------
  function cmul(a, b) { return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re }; }

  function gateMatrix(J, b, eps) {
    var jx = Math.PI / 4 - eps, jy = Math.PI / 4, jz = J;
    var cm = Math.cos(jx - jy), sm = Math.sin(jx - jy);
    var cp = Math.cos(jx + jy), sp = Math.sin(jx + jy);
    var ez = { re: Math.cos(jz), im: Math.sin(jz) }, ezc = { re: ez.re, im: -ez.im };
    var V = [];
    for (var i = 0; i < 16; i++) V.push({ re: 0, im: 0 });
    V[0] = cmul(ez, { re: cm, im: 0 });
    V[3] = cmul(ez, { re: 0, im: sm });
    V[12] = cmul(ez, { re: 0, im: sm });
    V[15] = cmul(ez, { re: cm, im: 0 });
    V[5] = cmul(ezc, { re: cp, im: 0 });
    V[6] = cmul(ezc, { re: 0, im: sp });
    V[9] = cmul(ezc, { re: 0, im: sp });
    V[10] = cmul(ezc, { re: cp, im: 0 });
    var c = Math.cos(b), s = Math.sin(b);
    var k = [{ re: c, im: 0 }, { re: 0, im: s }, { re: 0, im: s }, { re: c, im: 0 }];
    var K = [];
    for (var r = 0; r < 4; r++) for (var cc = 0; cc < 4; cc++) {
      K.push(cmul(k[(r >> 1) * 2 + (cc >> 1)], k[(r & 1) * 2 + (cc & 1)]));
    }
    var U = [];
    for (r = 0; r < 4; r++) for (cc = 0; cc < 4; cc++) {
      var acc = { re: 0, im: 0 };
      for (var m = 0; m < 4; m++) {
        var p = cmul(K[r * 4 + m], V[m * 4 + cc]);
        acc.re += p.re; acc.im += p.im;
      }
      U.push(acc);
    }
    return U;
  }

  function swapG(G) {
    var P = [0, 2, 1, 3], out = [];
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) out.push(G[P[r] * 4 + P[c]]);
    return out;
  }

  // ---------- dense operator evolution on L sites ----------
  function gateLeft(Ore, Oim, G, i, j) {
    var si = 1 << (L - 1 - i), sj = 1 << (L - 1 - j);
    for (var col = 0; col < DIM; col++) {
      for (var base = 0; base < DIM; base++) {
        if ((base & si) || (base & sj)) continue;
        var i0 = base * DIM + col, i1 = (base + sj) * DIM + col,
            i2 = (base + si) * DIM + col, i3 = (base + si + sj) * DIM + col;
        var v0r = Ore[i0], v1r = Ore[i1], v2r = Ore[i2], v3r = Ore[i3];
        var v0i = Oim[i0], v1i = Oim[i1], v2i = Oim[i2], v3i = Oim[i3];
        var idx = [i0, i1, i2, i3], vr = [v0r, v1r, v2r, v3r], vi = [v0i, v1i, v2i, v3i];
        for (var r = 0; r < 4; r++) {
          var ar = 0, ai = 0;
          for (var c = 0; c < 4; c++) {
            var g = G[r * 4 + c];
            ar += g.re * vr[c] - g.im * vi[c];
            ai += g.re * vi[c] + g.im * vr[c];
          }
          Ore[idx[r]] = ar; Oim[idx[r]] = ai;
        }
      }
    }
  }

  function gateRightDag(Ore, Oim, G, i, j) {
    var si = 1 << (L - 1 - i), sj = 1 << (L - 1 - j);
    for (var row = 0; row < DIM; row++) {
      var off = row * DIM;
      for (var base = 0; base < DIM; base++) {
        if ((base & si) || (base & sj)) continue;
        var idx = [off + base, off + base + sj, off + base + si, off + base + si + sj];
        var vr = [Ore[idx[0]], Ore[idx[1]], Ore[idx[2]], Ore[idx[3]]];
        var vi = [Oim[idx[0]], Oim[idx[1]], Oim[idx[2]], Oim[idx[3]]];
        for (var c = 0; c < 4; c++) {
          var ar = 0, ai = 0;
          for (var r = 0; r < 4; r++) {
            var g = G[c * 4 + r];
            ar += vr[r] * g.re + vi[r] * g.im;
            ai += vi[r] * g.re - vr[r] * g.im;
          }
          Ore[idx[c]] = ar; Oim[idx[c]] = ai;
        }
      }
    }
  }

  var bufRe = null, bufIm = null;
  function bruteMap(G, op) {
    // returns rows t = 0..TBRUTE of C(x,t), x = 0..L-1, source at site 0
    if (!bufRe) { bufRe = new Float64Array(DIM * DIM); bufIm = new Float64Array(DIM * DIM); }
    var Ore = bufRe, Oim = bufIm;
    Ore.fill(0); Oim.fill(0);
    var s0 = 1 << (L - 1);
    var d;
    if (op === "Z") {
      for (d = 0; d < DIM; d++) Ore[d * DIM + d] = (d & s0) ? -1 : 1;
    } else { // X at site 0
      for (d = 0; d < DIM; d++) Ore[(d ^ s0) * DIM + d] = 1;
    }
    var Gs = swapG(G);
    var rows = [];
    for (var t = 0; t <= TBRUTE; t++) {
      var row = [];
      for (var x = 0; x < L; x++) {
        var sx = 1 << (L - 1 - x), tr = 0;
        if (op === "Z") {
          for (d = 0; d < DIM; d++) tr += (d & sx) ? -Ore[d * DIM + d] : Ore[d * DIM + d];
        } else {
          for (d = 0; d < DIM; d++) tr += Ore[(d ^ sx) * DIM + d];
        }
        row.push(tr / DIM);
      }
      rows.push(row);
      if (t === TBRUTE) break;
      for (var l = 0; l < 2; l++) {
        for (var i = l; i < L; i += 2) {
          var j = (i + 1) % L;
          if (i < j) { gateLeft(Ore, Oim, G, i, j); gateRightDag(Ore, Oim, G, i, j); }
          else { gateLeft(Ore, Oim, Gs, j, i); gateRightDag(Ore, Oim, Gs, j, i); }
        }
      }
    }
    return rows;
  }

  // ---------- light-ray channel ----------
  var PAULI = [
    [{ re: 1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 1, im: 0 }],   // I
    [{ re: 0, im: 0 }, { re: 1, im: 0 }, { re: 1, im: 0 }, { re: 0, im: 0 }],   // X
    [{ re: 0, im: 0 }, { re: 0, im: -1 }, { re: 0, im: 1 }, { re: 0, im: 0 }],  // Y
    [{ re: 1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: -1, im: 0 }]   // Z
  ];

  function channelMatrix(G) {
    // M[i][j] = (1/4) tr[ σ_i · Tr₂[U†(1⊗σ_j)U] ]   (basis {1,X,Y,Z}/√2 ⇒ real 4×4)
    // build W_j = U†(1⊗σ_j)U as 4x4 complex, partial-trace second factor.
    var M = [];
    for (var i = 0; i < 4; i++) M.push([0, 0, 0, 0]);
    for (var j = 0; j < 4; j++) {
      // A = (1⊗σ_j) U : rows (a,b) -> σ_j on second factor
      var A = [];
      for (var r = 0; r < 4; r++) {
        for (var c = 0; c < 4; c++) {
          var a1 = r >> 1, b1 = r & 1;
          var acc = { re: 0, im: 0 };
          for (var b2 = 0; b2 < 2; b2++) {
            var s = PAULI[j][b1 * 2 + b2];
            if (s.re === 0 && s.im === 0) continue;
            acc.re += s.re * G[(a1 * 2 + b2) * 4 + c].re - s.im * G[(a1 * 2 + b2) * 4 + c].im;
            acc.im += s.re * G[(a1 * 2 + b2) * 4 + c].im + s.im * G[(a1 * 2 + b2) * 4 + c].re;
          }
          A.push(acc);
        }
      }
      // W = U† A
      var W = [];
      for (r = 0; r < 4; r++) {
        for (c = 0; c < 4; c++) {
          var acc2 = { re: 0, im: 0 };
          for (var m = 0; m < 4; m++) {
            // (U†)_{rm} = conj(U_{mr})
            var u = G[m * 4 + r], a = A[m * 4 + c];
            acc2.re += u.re * a.re + u.im * a.im;
            acc2.im += u.re * a.im - u.im * a.re;
          }
          W.push(acc2);
        }
      }
      // R = (1/2) Tr₂ W : R_{a c} = ½ Σ_b W_{(a b),(c b)}
      var R = [];
      for (var a2 = 0; a2 < 2; a2++) for (var c2 = 0; c2 < 2; c2++) {
        var s2 = { re: 0, im: 0 };
        for (var bb = 0; bb < 2; bb++) {
          var w = W[(a2 * 2 + bb) * 4 + (c2 * 2 + bb)];
          s2.re += w.re; s2.im += w.im;
        }
        R.push({ re: s2.re / 2, im: s2.im / 2 });
      }
      // M[i][j] = ½ tr[σ_i R]  (real by construction; imaginary part checked ≈ 0)
      for (i = 0; i < 4; i++) {
        var tr = { re: 0, im: 0 };
        for (a2 = 0; a2 < 2; a2++) for (c2 = 0; c2 < 2; c2++) {
          var sv = PAULI[i][a2 * 2 + c2]; // (σ_i)_{a2 c2}
          var rv = R[c2 * 2 + a2];        // R_{c2 a2}
          tr.re += sv.re * rv.re - sv.im * rv.im;
          tr.im += sv.re * rv.im + sv.im * rv.re;
        }
        M[i][j] = tr.re / 2;
      }
    }
    return M;
  }

  function matPow(M, n) {
    var R = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]], A = M;
    while (n > 0) {
      if (n & 1) R = matMul(R, A);
      A = matMul(A, A); n >>= 1;
    }
    return R;
  }
  function matMul(A, B) {
    var C = [];
    for (var i = 0; i < 4; i++) {
      C.push([0, 0, 0, 0]);
      for (var j = 0; j < 4; j++) {
        var s = 0;
        for (var k = 0; k < 4; k++) s += A[i][k] * B[k][j];
        C[i][j] = s;
      }
    }
    return C;
  }

  function rayCurve(M, opIdx, tmax) {
    var out = [], P = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
    var step = matMul(M, M); // per period = 2 layers
    for (var t = 0; t <= tmax; t++) {
      out.push(P[opIdx][opIdx]);
      P = matMul(P, step);
    }
    return out;
  }

  function eigenvalues(M) {
    // characteristic polynomial by Faddeev–LeVerrier, roots by Durand–Kerner.
    var I4 = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
    var Mk = M, cs = [1];
    var c1 = -(Mk[0][0] + Mk[1][1] + Mk[2][2] + Mk[3][3]); cs.push(c1);
    Mk = matMul(M, addDiag(Mk, c1));
    var c2 = -(Mk[0][0] + Mk[1][1] + Mk[2][2] + Mk[3][3]) / 2; cs.push(c2);
    Mk = matMul(M, addDiag(Mk, c2));
    var c3 = -(Mk[0][0] + Mk[1][1] + Mk[2][2] + Mk[3][3]) / 3; cs.push(c3);
    Mk = matMul(M, addDiag(Mk, c3));
    var c4 = -(Mk[0][0] + Mk[1][1] + Mk[2][2] + Mk[3][3]) / 4; cs.push(c4);
    // p(λ) = λ⁴ + c1λ³ + c2λ² + c3λ + c4
    var roots = [{ re: 0.4, im: 0.9 }, { re: -0.9, im: 0.4 }, { re: -0.4, im: -0.9 }, { re: 0.9, im: -0.4 }];
    function pEval(z) {
      var p = { re: 1, im: 0 };
      for (var k = 1; k <= 4; k++) { p = cmul(p, z); p.re += cs[k] * 1; p.im += 0; }
      return p;
    }
    for (var it = 0; it < 200; it++) {
      var moved = 0;
      for (var i = 0; i < 4; i++) {
        var num = pEval(roots[i]), den = { re: 1, im: 0 };
        for (var j = 0; j < 4; j++) {
          if (j === i) continue;
          den = cmul(den, { re: roots[i].re - roots[j].re, im: roots[i].im - roots[j].im });
        }
        var d2 = den.re * den.re + den.im * den.im;
        if (d2 < 1e-30) continue;
        var dz = { re: (num.re * den.re + num.im * den.im) / d2, im: (num.im * den.re - num.re * den.im) / d2 };
        roots[i] = { re: roots[i].re - dz.re, im: roots[i].im - dz.im };
        moved = Math.max(moved, Math.abs(dz.re) + Math.abs(dz.im));
      }
      if (moved < 1e-14) break;
    }
    return roots;
  }

  function addDiag(A, c) {
    return A.map(function (row, i) { return row.map(function (v, j) { return i === j ? v + c : v; }); });
  }

  // ---------- widget ----------
  function themeColors() {
    var cs = getComputedStyle(document.body);
    function v(name, fb) { var s = cs.getPropertyValue(name).trim(); return s || fb; }
    return {
      accent: v("--global-theme-color", "#1fb2a6"),
      text: v("--global-text-color", "#e8e8e8"),
      divider: v("--global-divider-color", "#444"),
      warn: "#cf6a50"
    };
  }
  function hexA(hex, a) {
    var m = hex.match(/^#?([0-9a-f]{6})$/i);
    if (!m) return hex;
    var n = parseInt(m[1], 16);
    return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
  }

  function createCorrelationCollapse(mount, opts) {
    opts = opts || {};
    var root = document.createElement("div");
    root.style.cssText = "display:flex;flex-wrap:wrap;gap:1rem;justify-content:center;align-items:flex-start;";
    var canL = document.createElement("canvas"), canR = document.createElement("canvas");
    root.appendChild(canL); root.appendChild(canR);
    mount.appendChild(root);
    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    var WL = 470, HL = 330, WR = 240, HR = 330;
    canL.width = WL * dpr; canL.height = HL * dpr; canL.style.width = WL + "px"; canL.style.height = HL + "px";
    canR.width = WR * dpr; canR.height = HR * dpr; canR.style.width = WR + "px"; canR.style.height = HR + "px";
    canL.style.maxWidth = "100%"; canR.style.maxWidth = "100%";

    var state = { J: 0.37, b: 0.6, eps: 0, op: "Z", data: null, busy: false, statusCb: null };

    function compute() {
      var G = gateMatrix(state.J, state.b, state.eps);
      var brute = bruteMap(G, state.op);
      var M = channelMatrix(G);
      var opIdx = state.op === "Z" ? 3 : 1;
      var ray = rayCurve(M, opIdx, TCURVE);
      var eigs = eigenvalues(M);
      // validation (only meaningful when dual-unitary): max |brute − analytic| for t ≤ TBRUTE
      var dev = 0;
      for (var t = 0; t <= TBRUTE; t++) {
        for (var x = 0; x < L; x++) {
          var exact = (x === (2 * t) % L && (t > 0 || x === 0)) ? ray[t] : 0;
          if (t === 0) exact = x === 0 ? 1 : 0;
          dev = Math.max(dev, Math.abs(brute[t][x] - exact));
        }
      }
      var absNT = eigs.map(function (e) { return Math.hypot(e.re, e.im); }).sort(function (a, b2) { return b2 - a; });
      // drop ONE trivial unit eigenvalue (the identity)
      var idx = absNT.findIndex(function (v) { return Math.abs(v - 1) < 1e-7; });
      if (idx >= 0) absNT.splice(idx, 1);
      state.data = { brute: brute, ray: ray, eigs: eigs, secondEig: absNT[0] || 0, dev: dev };
    }

    function status() {
      if (!state.statusCb) return;
      var d = state.data, msg;
      if (state.eps === 0) {
        var cls = d.secondEig > 1 - 1e-7
          ? "nonergodic — a soliton rides the ray"
          : "ergodic &amp; mixing — decay per period " + (d.secondEig * d.secondEig).toFixed(3);
        msg = "dual-unitary &#10003; &nbsp; " + cls +
          " &nbsp;|&nbsp; brute force vs channel (t &#8804; 2): max dev " + d.dev.toExponential(1);
      } else {
        msg = "duality broken (&#949; = " + state.eps.toFixed(2) +
          "): the interior floods back, and no exact result applies beyond the brute-force window";
      }
      state.statusCb(msg);
    }

    function cellColor(v, C) {
      if (Math.abs(v) < 1e-13) return null;
      var a = 0.10 + 0.88 * Math.min(1, Math.abs(v));
      return v > 0 ? hexA(C.accent, a) : hexA("#cf6a50", a);
    }

    function draw() {
      var C = themeColors();
      var ctx = canL.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, WL, HL);
      ctx.font = "10px system-ui, sans-serif";
      var d = state.data;
      // columns: display x = -1..8  → site (x+L) mod L; rows t = 0..TSHOW upward
      var padL2 = 34, padB2 = 40, cw = (WL - padL2 - 10) / L, ch = (HL - padB2 - 30) / (TSHOW + 1);
      for (var t = 0; t <= TSHOW; t++) {
        var y = HL - padB2 - (t + 1) * ch;
        for (var col = 0; col < L; col++) {
          var xd = col - 1, site = ((xd % L) + L) % L, px = padL2 + col * cw;
          var v = null, unknown = false;
          if (t <= TBRUTE) v = d.brute[t][site];
          else if (state.eps === 0) v = (xd === 2 * t) ? d.ray[t] : 0;
          else unknown = true;
          ctx.strokeStyle = C.divider; ctx.lineWidth = 1;
          ctx.strokeRect(px, y, cw - 2, ch - 2);
          if (unknown) {
            ctx.fillStyle = C.text; ctx.globalAlpha = 0.35;
            ctx.fillText("?", px + cw / 2 - 4, y + ch / 2 + 3);
            ctx.globalAlpha = 1;
          } else {
            var fc = cellColor(v, C);
            if (fc) { ctx.fillStyle = fc; ctx.fillRect(px, y, cw - 2, ch - 2); }
            if (Math.abs(v) > 0.005) {
              ctx.fillStyle = C.text; ctx.globalAlpha = 0.9;
              ctx.fillText(v.toFixed(2).replace("0.", "."), px + 3, y + ch / 2 + 3);
              ctx.globalAlpha = 1;
            }
          }
        }
        ctx.fillStyle = C.text; ctx.globalAlpha = 0.7;
        var lab = "t=" + t + (t > TBRUTE && state.eps === 0 ? " ∞" : "");
        ctx.fillText(lab, 2, y + ch / 2 + 3);
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = C.text; ctx.globalAlpha = 0.7;
      for (col = 0; col < L; col += 2) {
        ctx.fillText(String(col - 1), padL2 + col * cw + cw / 2 - 4, HL - padB2 + 14);
      }
      ctx.fillText("x (source at 0; ray at x = 2t)", padL2 + 90, HL - padB2 + 28);
      ctx.fillText("C(x,t) — teal +, brick −; blank = exactly 0", padL2, 14);
      ctx.fillText("rows t ≤ 2 brute force · rows marked ∞ exact analytic", padL2, 26);
      ctx.globalAlpha = 1;

      // right panel
      var cr = canR.getContext("2d");
      cr.setTransform(dpr, 0, 0, dpr, 0, 0);
      cr.clearRect(0, 0, WR, HR);
      cr.font = "10px system-ui, sans-serif";
      var dim = state.eps > 0;
      cr.globalAlpha = dim ? 0.35 : 1;
      // unit disk
      var cx = WR / 2, cy = 92, rad = 62;
      cr.strokeStyle = C.divider; cr.beginPath(); cr.arc(cx, cy, rad, 0, 2 * Math.PI); cr.stroke();
      cr.beginPath(); cr.moveTo(cx - rad - 6, cy); cr.lineTo(cx + rad + 6, cy); cr.stroke();
      cr.beginPath(); cr.moveTo(cx, cy - rad - 6); cr.lineTo(cx, cy + rad + 6); cr.stroke();
      d.eigs.forEach(function (e) {
        var isTrivial = Math.abs(e.re - 1) < 1e-6 && Math.abs(e.im) < 1e-6;
        cr.beginPath();
        cr.arc(cx + e.re * rad, cy - e.im * rad, 4, 0, 2 * Math.PI);
        if (isTrivial) { cr.strokeStyle = C.accent; cr.lineWidth = 1.5; cr.stroke(); }
        else { cr.fillStyle = C.accent; cr.fill(); }
      });
      cr.fillStyle = C.text;
      cr.fillText("spec M₊ (hollow = identity)", 46, 16);
      // decay curve
      var oy = HR - 24, ox = 30, wcurve = WR - 44, hcurve = 110;
      cr.strokeStyle = C.divider;
      cr.strokeRect(ox, oy - hcurve, wcurve, hcurve);
      var opIdx = state.op === "Z" ? 3 : 1;
      cr.strokeStyle = C.accent; cr.lineWidth = 1.5; cr.beginPath();
      for (var tt = 0; tt <= TCURVE; tt++) {
        var vx = ox + tt * wcurve / TCURVE, vy = oy - Math.abs(d.ray[tt]) * hcurve;
        if (tt === 0) cr.moveTo(vx, vy); else cr.lineTo(vx, vy);
      }
      cr.stroke();
      // brute points
      cr.fillStyle = C.text;
      for (tt = 0; tt <= TBRUTE; tt++) {
        var site = (2 * tt) % L;
        var bx = ox + tt * wcurve / TCURVE, by = oy - Math.abs(d.brute[tt][site]) * hcurve;
        cr.beginPath(); cr.arc(bx, by, 3, 0, 2 * Math.PI); cr.fill();
      }
      cr.fillText("|C| on the ray vs t", ox + 30, oy - hcurve - 8);
      cr.fillText("dots: brute force", ox + 30, oy + 14);
      cr.globalAlpha = 1;
      if (dim) {
        cr.fillStyle = C.text; cr.globalAlpha = 0.8;
        cr.fillText("ε ≠ 0: the channel no", 60, 150);
        cr.fillText("longer generates C", 60, 163);
        cr.globalAlpha = 1;
      }
    }

    function recompute() {
      if (state.busy) return;
      state.busy = true;
      if (state.statusCb) state.statusCb("computing (dense, 2¹⁰ × 2¹⁰)…");
      setTimeout(function () {
        compute();
        draw();
        status();
        state.busy = false;
      }, 30);
    }

    var mo = new MutationObserver(function () { if (state.data) draw(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    recompute();

    return {
      setParams: function (J, b, eps) { state.J = +J; state.b = +b; state.eps = +eps; recompute(); },
      setOperator: function (op) { state.op = op === "X" ? "X" : "Z"; recompute(); },
      onStatus: function (cb) { state.statusCb = cb; },
      destroy: function () { mo.disconnect(); mount.removeChild(root); }
    };
  }

  global.createCorrelationCollapse = createCorrelationCollapse;
  global.__ccPhysics = {
    gateMatrix: gateMatrix,
    bruteMap: bruteMap,
    channelMatrix: channelMatrix,
    rayCurve: rayCurve,
    eigenvalues: eigenvalues
  };
})(typeof window !== "undefined" ? window : globalThis);
