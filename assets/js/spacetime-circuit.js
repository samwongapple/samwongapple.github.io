/*
 * spacetime-circuit.js — brickwork spacetime explorer for the solvable-circuits
 * post "Brickwork Circuits: Locality and Unitarity, Nothing Else".
 *
 * Two panels.
 *
 * LEFT (structural, exact by construction): a brickwork circuit of L=12 sites,
 * 8 layers (4 periods), open ends. Click to place a source operator at the
 * bottom and a probe operator anywhere above; "contract" then applies the
 * unitarity rule U†U = 1 from the top boundary downward (gates outside the
 * probe's backward light cone) and from the bottom boundary upward (gates
 * outside the source's forward light cone). Survivors = the causal diamond;
 * when the diamond is empty the correlator is identically zero. Cone growth is
 * computed exactly from the gate pattern (even layer: (0,1),(2,3),…; odd layer:
 * (1,2),(3,4),…), NOT drawn as a schematic 45° triangle — the sublattice
 * asymmetry is real and visible.
 *
 * RIGHT (numerical, exact): operator weight w(x,t) of a Pauli Z placed at the
 * centre of an 8-site chain (PBC) and evolved forward t = 0..3 periods with a
 * generic kicked gate  (e^{i b X} ⊗ e^{i b X}) · exp[i(Jx XX + Jy YY + Jz ZZ)],
 * b=0.6, (Jx,Jy,Jz)=(0.55,0.35,0.37).  w(x,t) = 1 − ‖(1/2)Tr_x O(t)‖²·2/2^L
 * with O(0)=Z, O(t+1)=U_F O(t) U_F†; dense 256×256 complex arithmetic in the
 * browser. Verified against the numpy reference (scratchpad du_reference.py).
 *
 * Vanilla JS, no dependencies; colours read from the site's CSS theme vars.
 *
 * Usage:
 *   const w = createSpacetimeCircuit(el, {});
 *   w.contract(); w.reset(); w.setFolded(true); w.onStatus(cb); w.destroy();
 */
(function (global) {
  "use strict";

  // ================= physics: cones on the brickwork =================
  var L_GRID = 12, LAYERS = 8; // left panel

  function gatesInLayer(layer, L) {
    var out = [], start = layer % 2 === 0 ? 0 : 1;
    for (var i = start; i + 1 < L; i += 2) out.push([i, i + 1]);
    return out;
  }

  // forward cone: sets S[l] of sites reached BEFORE layer l is applied (S[0] = {x0})
  function forwardCone(x0, L, layers) {
    var S = [Object.create(null)];
    S[0][x0] = true;
    for (var l = 0; l < layers; l++) {
      var next = Object.create(null), k;
      for (k in S[l]) next[k] = true;
      gatesInLayer(l, L).forEach(function (g) {
        if (S[l][g[0]] || S[l][g[1]]) { next[g[0]] = true; next[g[1]] = true; }
      });
      S.push(next);
    }
    return S;
  }

  // backward cone: sets B[l] of sites at level l (after layer l-1) that can reach (xp, tau)
  function backwardCone(xp, tau, L, layers) {
    var B = new Array(layers + 1);
    for (var i = 0; i <= layers; i++) B[i] = Object.create(null);
    B[tau][xp] = true;
    for (var l = tau - 1; l >= 0; l--) {
      var k;
      for (k in B[l + 1]) B[l][k] = true;
      gatesInLayer(l, L).forEach(function (g) {
        if (B[l + 1][g[0]] || B[l + 1][g[1]]) { B[l][g[0]] = true; B[l][g[1]] = true; }
      });
    }
    return B;
  }

  // classification of every gate: 'top' (killed from above), 'bottom' (killed from
  // below), 'live' (in the diamond). Gates at layers >= tau are all 'top'.
  function classifyGates(x0, xp, tau, L, layers) {
    var S = forwardCone(x0, L, layers), B = backwardCone(xp, tau, L, layers);
    var out = [];
    for (var l = 0; l < layers; l++) {
      gatesInLayer(l, L).forEach(function (g) {
        var inBack = l < tau && (B[l + 1][g[0]] || B[l + 1][g[1]]);
        var inFwd = S[l][g[0]] || S[l][g[1]];
        var cls = !inBack ? "top" : (!inFwd ? "bottom" : "live");
        out.push({ layer: l, sites: g, cls: cls });
      });
    }
    var reachable = !!S[tau][xp];
    return { gates: out, reachable: reachable, live: out.filter(function (g) { return g.cls === "live"; }).length };
  }

  // ================= physics: operator weight, dense L=8 =================
  var LW = 8, DIMW = 1 << LW, TW = 3;

  function gateMatrix(b, jx, jy, jz) {
    // exp[i(jx XX + jy YY + jz ZZ)] in basis |00>,|01>,|10>,|11>, then kicks.
    // XX+YY block acts on {|01>,|10>}; ZZ diagonal. Closed form:
    //   V = diag block structure:
    //   <00|V|00> = e^{i jz} cos(jx-jy)        <00|V|11> = i e^{i jz} sin(jx-jy)
    //   <11|V|00> = i e^{i jz} sin(jx-jy)      <11|V|11> = e^{i jz} cos(jx-jy)
    //   <01|V|01> = e^{-i jz} cos(jx+jy)       <01|V|10> = i e^{-i jz} sin(jx+jy)
    //   (and symmetrically). Verified against scipy expm in the reference script.
    var cm = Math.cos(jx - jy), sm = Math.sin(jx - jy);
    var cp = Math.cos(jx + jy), sp = Math.sin(jx + jy);
    var ez = { re: Math.cos(jz), im: Math.sin(jz) }, ezc = { re: ez.re, im: -ez.im };
    function mul(a, b2) { return { re: a.re * b2.re - a.im * b2.im, im: a.re * b2.im + a.im * b2.re }; }
    var V = [];
    for (var i = 0; i < 16; i++) V.push({ re: 0, im: 0 });
    V[0] = mul(ez, { re: cm, im: 0 });          // 00,00
    V[3] = mul(ez, { re: 0, im: sm });          // 00,11
    V[12] = mul(ez, { re: 0, im: sm });         // 11,00
    V[15] = mul(ez, { re: cm, im: 0 });         // 11,11
    V[5] = mul(ezc, { re: cp, im: 0 });         // 01,01
    V[6] = mul(ezc, { re: 0, im: sp });         // 01,10
    V[9] = mul(ezc, { re: 0, im: sp });         // 10,01
    V[10] = mul(ezc, { re: cp, im: 0 });        // 10,10
    // kick k = exp[i b X] = [[cos b, i sin b],[i sin b, cos b]] on each site
    var c = Math.cos(b), s = Math.sin(b);
    var k = [{ re: c, im: 0 }, { re: 0, im: s }, { re: 0, im: s }, { re: c, im: 0 }];
    var K = []; // k ⊗ k
    for (var r = 0; r < 4; r++) for (var cc = 0; cc < 4; cc++) {
      var a1 = k[(r >> 1) * 2 + (cc >> 1)], a2 = k[(r & 1) * 2 + (cc & 1)];
      K.push(mul(a1, a2));
    }
    // U = K · V
    var U = [];
    for (r = 0; r < 4; r++) for (cc = 0; cc < 4; cc++) {
      var acc = { re: 0, im: 0 };
      for (var m = 0; m < 4; m++) {
        var p = mul(K[r * 4 + m], V[m * 4 + cc]);
        acc.re += p.re; acc.im += p.im;
      }
      U.push(acc);
    }
    return U; // row-major 4x4, basis index = 2*bit_i + bit_j
  }

  // apply G (4x4) to sites (i,j) of matrix O (dim x dim, interleaved re/im), from the left: O <- G O
  function gateLeft(Ore, Oim, G, i, j, L, dim) {
    var si = 1 << (L - 1 - i), sj = 1 << (L - 1 - j);
    for (var col = 0; col < dim; col++) {
      for (var base = 0; base < dim; base++) {
        if ((base & si) || (base & sj)) continue;
        var idx = [base, base + sj, base + si, base + si + sj];
        var vr = [], vi = [], r, c, ar, ai;
        for (r = 0; r < 4; r++) { vr.push(Ore[idx[r] * dim + col]); vi.push(Oim[idx[r] * dim + col]); }
        for (r = 0; r < 4; r++) {
          ar = 0; ai = 0;
          for (c = 0; c < 4; c++) {
            var g = G[r * 4 + c];
            ar += g.re * vr[c] - g.im * vi[c];
            ai += g.re * vi[c] + g.im * vr[c];
          }
          Ore[idx[r] * dim + col] = ar; Oim[idx[r] * dim + col] = ai;
        }
      }
    }
  }

  // O <- O G†
  function gateRightDag(Ore, Oim, G, i, j, L, dim) {
    var si = 1 << (L - 1 - i), sj = 1 << (L - 1 - j);
    for (var row = 0; row < dim; row++) {
      for (var base = 0; base < dim; base++) {
        if ((base & si) || (base & sj)) continue;
        var idx = [base, base + sj, base + si, base + si + sj];
        var vr = [], vi = [], r, c, ar, ai;
        for (c = 0; c < 4; c++) { vr.push(Ore[row * dim + idx[c]]); vi.push(Oim[row * dim + idx[c]]); }
        for (c = 0; c < 4; c++) {
          ar = 0; ai = 0;
          for (r = 0; r < 4; r++) {
            // (O G†)_{·c} = Σ_r O_{·r} conj(G[c*4+r])
            var g = G[c * 4 + r];
            ar += vr[r] * g.re + vi[r] * g.im;
            ai += vi[r] * g.re - vr[r] * g.im;
          }
          Ore[row * dim + idx[c]] = ar; Oim[row * dim + idx[c]] = ai;
        }
      }
    }
  }

  function weightProfile() {
    var G = gateMatrix(0.6, 0.55, 0.35, 0.37);
    var x0 = 4;
    var Ore = new Float64Array(DIMW * DIMW), Oim = new Float64Array(DIMW * DIMW);
    var sx = 1 << (LW - 1 - x0);
    for (var d = 0; d < DIMW; d++) Ore[d * DIMW + d] = (d & sx) ? -1 : 1; // Z at x0
    var prof = [];
    for (var t = 0; t <= TW; t++) {
      var row = [];
      for (var x = 0; x < LW; x++) row.push(siteWeight(Ore, Oim, x));
      prof.push(row);
      if (t === TW) break;
      // one period: even layer then odd layer, PBC (gate (L-1, 0) via generic index pair)
      var l, g, gs;
      for (l = 0; l < 2; l++) {
        gs = [];
        for (var i = l; i < LW; i += 2) gs.push([i, (i + 1) % LW]);
        for (g = 0; g < gs.length; g++) {
          var pair = orderPair(gs[g]);
          gateLeft(Ore, Oim, pair.G ? pair.G : G, pair.i, pair.j, LW, DIMW);
          gateRightDag(Ore, Oim, pair.G ? pair.G : G, pair.i, pair.j, LW, DIMW);
        }
      }
      function orderPair(g2) {
        // wrap gate (L-1, 0): swap tensor factors so we can use strides with i<j.
        if (g2[0] < g2[1]) return { i: g2[0], j: g2[1], G: null };
        return { i: g2[1], j: g2[0], G: swapG(G) };
      }
    }
    return prof;
  }

  function swapG(G) {
    // G' = SWAP · G · SWAP  (relabel the two tensor factors)
    var P = [0, 2, 1, 3], out = [];
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) out.push(G[P[r] * 4 + P[c]]);
    return out;
  }

  function siteWeight(Ore, Oim, x) {
    // R = (1/2) Tr_x O ; w = 1 − ‖R‖²_F /4 · 2 / dim   (‖Z_x0‖²_F = dim)
    var half = DIMW >> 1, sx = 1 << (LW - 1 - x);
    var lowMask = sx - 1, n2 = 0;
    for (var a = 0; a < half; a++) {
      var ra = ((a & ~lowMask) << 1) | (a & lowMask);
      for (var b2 = 0; b2 < half; b2++) {
        var rb = ((b2 & ~lowMask) << 1) | (b2 & lowMask);
        var re = 0, im = 0;
        for (var bit = 0; bit < 2; bit++) {
          var i2 = ra | (bit ? sx : 0), j2 = rb | (bit ? sx : 0);
          re += Ore[i2 * DIMW + j2]; im += Oim[i2 * DIMW + j2];
        }
        n2 += (re * re + im * im) / 4;
      }
    }
    var w = 1 - (n2 * 2) / DIMW;
    return w < 0 && w > -1e-12 ? 0 : w;
  }

  // ================= widget =================
  function themeColors(el) {
    var cs = getComputedStyle(el);
    function v(name, fb) { var s = cs.getPropertyValue(name).trim(); return s || fb; }
    return {
      accent: v("--global-theme-color", "#1fb2a6"),
      text: v("--global-text-color", "#e8e8e8"),
      divider: v("--global-divider-color", "#444"),
      bg: v("--global-bg-color", "#1c1c1d")
    };
  }

  function createSpacetimeCircuit(mount, opts) {
    opts = opts || {};
    var root = document.createElement("div");
    root.style.cssText = "display:flex;flex-wrap:wrap;gap:1rem;justify-content:center;align-items:flex-start;";
    var canL = document.createElement("canvas");
    var canR = document.createElement("canvas");
    root.appendChild(canL); root.appendChild(canR);
    mount.appendChild(root);

    var state = {
      x0: 3, xp: 7, tau: 5, folded: false,
      phase: "idle",       // idle | animating | done
      anim: 0,             // animation frontier (layer count faded)
      cls: null,
      statusCb: null,
      weights: null
    };

    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    var WL = 460, HL = 320, WR = 240, HR = 320;
    canL.width = WL * dpr; canL.height = HL * dpr; canL.style.width = WL + "px"; canL.style.height = HL + "px";
    canR.width = WR * dpr; canR.height = HR * dpr; canR.style.width = WR + "px"; canR.style.height = HR + "px";
    canL.style.maxWidth = "100%"; canR.style.maxWidth = "100%";
    canL.style.cursor = "pointer";

    // geometry of the left panel
    var padL = 26, padR = 12, padT = 24, padB = 34;
    function xOf(site) { return padL + (site + 0.5) * (WL - padL - padR) / L_GRID; }
    function yOf(level) { return HL - padB - level * (HL - padT - padB) / LAYERS; } // level 0..LAYERS

    function recompute() {
      state.cls = classifyGates(state.x0, state.xp, state.tau, L_GRID, LAYERS);
    }
    recompute();

    function status(msg) { if (state.statusCb) state.statusCb(msg); }

    function draw() {
      var C = themeColors(mount.closest("body") || document.body);
      var ctx = canL.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, WL, HL);
      ctx.font = "10px system-ui, sans-serif";

      // wires
      ctx.strokeStyle = C.divider; ctx.lineWidth = 1;
      for (var s = 0; s < L_GRID; s++) {
        ctx.beginPath(); ctx.moveTo(xOf(s), yOf(0)); ctx.lineTo(xOf(s), yOf(LAYERS)); ctx.stroke();
      }
      // gates
      var gw = (xOf(1) - xOf(0)) * 1.62, gh = 13;
      state.cls.gates.forEach(function (g) {
        var alpha = 1;
        if (state.phase !== "idle") {
          var frontTop = LAYERS - state.anim, frontBot = state.anim - LAYERS; // two passes packed in one counter
          if (g.cls === "top" && g.layer >= LAYERS - Math.min(state.anim, LAYERS)) alpha = 0.10;
          if (g.cls === "bottom" && state.anim > LAYERS && g.layer < state.anim - LAYERS) alpha = 0.10;
          if (state.phase === "done" && g.cls !== "live") alpha = 0.10;
        }
        var cx = (xOf(g.sites[0]) + xOf(g.sites[1])) / 2, cy = (yOf(g.layer) + yOf(g.layer + 1)) / 2;
        ctx.globalAlpha = alpha;
        roundRect(ctx, cx - gw / 2, cy - gh / 2, gw, gh, 5);
        ctx.fillStyle = hexA(C.accent, 0.18); ctx.fill();
        ctx.strokeStyle = C.accent; ctx.lineWidth = 1.3; ctx.stroke();
        if (state.folded) {
          roundRect(ctx, cx - gw / 2 + 3.5, cy - gh / 2 - 3.5, gw, gh, 5);
          ctx.setLineDash([3, 2]); ctx.stroke(); ctx.setLineDash([]);
        }
        if (state.phase === "done" && g.cls === "live") {
          ctx.strokeStyle = C.text; ctx.lineWidth = 1.6;
          roundRect(ctx, cx - gw / 2, cy - gh / 2, gw, gh, 5); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      });
      // source + probe
      ctx.fillStyle = C.accent;
      ctx.beginPath(); ctx.arc(xOf(state.x0), yOf(0) + 8, 5, 0, 2 * Math.PI); ctx.fill();
      ctx.fillText("σβ", xOf(state.x0) + 8, yOf(0) + 12);
      ctx.beginPath(); ctx.arc(xOf(state.xp), yOf(state.tau), 5, 0, 2 * Math.PI); ctx.fill();
      ctx.fillText("σα", xOf(state.xp) + 8, yOf(state.tau) - 6);
      // labels
      ctx.fillStyle = C.text; ctx.globalAlpha = 0.7;
      ctx.fillText("time ↑", 4, padT + 8);
      ctx.fillText("space →", WL - 62, HL - 8);
      ctx.globalAlpha = 1;

      drawRight(C);
    }

    function drawRight(C) {
      var ctx = canR.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, WR, HR);
      ctx.font = "10px system-ui, sans-serif";
      if (!state.weights) { // compute lazily, once
        ctx.fillStyle = C.text; ctx.globalAlpha = 0.7;
        ctx.fillText("computing exact weights…", 40, HR / 2);
        ctx.globalAlpha = 1;
        setTimeout(function () { state.weights = weightProfile(); draw(); }, 30);
        return;
      }
      var cw = (WR - 60) / LW, ch = 44, oy = 54;
      for (var t = 0; t <= TW; t++) {
        for (var x = 0; x < LW; x++) {
          var w = state.weights[t][x];
          var y = HR - oy - t * (ch + 8);
          ctx.fillStyle = hexA(C.accent, 0.06 + 0.85 * Math.min(1, w));
          ctx.fillRect(18 + x * cw, y - ch, cw - 2, ch);
          ctx.strokeStyle = C.divider; ctx.strokeRect(18 + x * cw, y - ch, cw - 2, ch);
          if (w > 0.004) {
            ctx.fillStyle = C.text; ctx.globalAlpha = 0.85;
            ctx.fillText(w.toFixed(2).replace("0.", "."), 20 + x * cw, y - ch / 2 + 3);
            ctx.globalAlpha = 1;
          }
        }
        ctx.fillStyle = C.text; ctx.globalAlpha = 0.65;
        ctx.fillText("t=" + t, WR - 34, HR - oy - t * (ch + 8) - ch / 2 + 3);
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = C.text; ctx.globalAlpha = 0.8;
      ctx.fillText("operator weight w(x,t) — exact, L=8", 18, 16);
      ctx.fillText("(generic gate; source at centre)", 18, 30);
      ctx.globalAlpha = 1;
    }

    function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }

    function hexA(hex, a) {
      var m = hex.match(/^#?([0-9a-f]{6})$/i);
      if (!m) return hex;
      var n = parseInt(m[1], 16);
      return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
    }

    canL.addEventListener("click", function (ev) {
      var r = canL.getBoundingClientRect();
      var px = (ev.clientX - r.left), py = (ev.clientY - r.top);
      var site = Math.round((px - padL) / ((WL - padL - padR) / L_GRID) - 0.5);
      site = Math.max(0, Math.min(L_GRID - 1, site));
      var level = Math.round((HL - padB - py) / ((HL - padT - padB) / LAYERS));
      level = Math.max(0, Math.min(LAYERS, level));
      if (level === 0) state.x0 = site;
      else { state.xp = site; state.tau = level; }
      state.phase = "idle"; state.anim = 0;
      recompute();
      status("");
      draw();
    });

    var timer = null;
    function contract() {
      if (state.phase === "animating") return;
      state.phase = "animating"; state.anim = 0;
      recompute();
      timer = setInterval(function () {
        state.anim++;
        if (state.anim >= 2 * LAYERS) {
          clearInterval(timer); timer = null;
          state.phase = "done";
          var n = state.cls.live, tot = state.cls.gates.length;
          status(state.cls.reachable
            ? n + " of " + tot + " bricks survive — the causal diamond"
            : "0 of " + tot + " bricks survive — C(x,t) = 0 identically");
        }
        draw();
      }, 110);
    }

    function reset() {
      if (timer) { clearInterval(timer); timer = null; }
      state.phase = "idle"; state.anim = 0;
      status("");
      draw();
    }

    var mo = new MutationObserver(function () { draw(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    draw();

    return {
      contract: contract,
      reset: reset,
      setFolded: function (f) { state.folded = !!f; draw(); },
      onStatus: function (cb) { state.statusCb = cb; },
      destroy: function () { if (timer) clearInterval(timer); mo.disconnect(); mount.removeChild(root); }
    };
  }

  global.createSpacetimeCircuit = createSpacetimeCircuit;
  global.__scPhysics = {
    gatesInLayer: gatesInLayer,
    forwardCone: forwardCone,
    backwardCone: backwardCone,
    classifyGates: classifyGates,
    gateMatrix: gateMatrix,
    weightProfile: weightProfile
  };
})(typeof window !== "undefined" ? window : globalThis);
