/*
 * bloch-sphere.js — reusable pseudo-3D Bloch sphere for the spin-qubit blog series.
 *
 * Simulates a Bloch vector r evolving under the rotating-frame drive Hamiltonian
 *
 *     H = (1/2) hbar ( Omega * sigma_x + Delta * sigma_z ),
 *
 * whose Bloch-equation form is a rigid precession of r about the axis
 * n = (Omega, 0, Delta) at the generalized Rabi frequency
 * Omega_R = sqrt(Omega^2 + Delta^2).  On resonance (Delta = 0) the axis is x and the
 * state flops all the way |0> <-> |1> through the poles; detuned, the axis tilts toward
 * z and the trajectory cones around it with reduced contrast.
 *
 * Vanilla JS, no dependencies. Colours are read from the site's CSS theme variables so
 * it tracks the dark/light toggle and the teal accent automatically.
 *
 * Usage:
 *   const bs = createBlochSphere(el, { omega: 1, delta: 0, size: 320 });
 *   bs.setOmega(2); bs.setDelta(0.5); bs.play(); bs.pause(); bs.reset();
 * Returns: { setOmega, setDelta, setState, play, pause, toggle, reset,
 *            isRunning, getState, refreshTheme, destroy }.
 * Designed to be extended later (noise, pi-pulses) without touching callers.
 */
(function (global) {
  "use strict";

  // ---- small vec3 helpers ---------------------------------------------------
  function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function norm(a) { return Math.hypot(a[0], a[1], a[2]); }

  // Rotate vector v about UNIT axis k by angle th (Rodrigues' formula). Keeps |v| exact.
  function rotateAbout(v, k, th) {
    var c = Math.cos(th), s = Math.sin(th), d = dot(k, v), kv = cross(k, v);
    return [
      v[0] * c + kv[0] * s + k[0] * d * (1 - c),
      v[1] * c + kv[1] * s + k[1] * d * (1 - c),
      v[2] * c + kv[2] * s + k[2] * d * (1 - c),
    ];
  }

  function createBlochSphere(container, opts) {
    if (!container) throw new Error("createBlochSphere: container element required");
    opts = opts || {};
    var cfg = {
      omega: opts.omega != null ? opts.omega : 1.0,
      delta: opts.delta != null ? opts.delta : 0.0,
      size: opts.size || 320,
      timeScale: opts.timeScale || 1.4,      // sim seconds per wall-clock second
      showAxis: opts.showAxis !== false,
      showTrail: opts.showTrail !== false,
      autoplay: opts.autoplay !== false,
      az: opts.az != null ? opts.az : 0.62,  // view azimuth (rad)
      el: opts.el != null ? opts.el : 0.52,  // view elevation (rad)
      onState: opts.onState || null,
    };
    var state0 = opts.state0 || [0, 0, 1];   // start at |0> (north pole)

    // ---- canvas / hi-dpi setup ----------------------------------------------
    var canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.maxWidth = cfg.size + "px";
    canvas.style.height = "auto";
    canvas.style.touchAction = "none";
    container.appendChild(canvas);
    var ctx = canvas.getContext("2d");

    var S = cfg.size, cx = S / 2, cy = S / 2, R = S * 0.34, dpr = 1;
    function resize() {
      dpr = Math.max(1, global.devicePixelRatio || 1);
      canvas.width = S * dpr;
      canvas.height = S * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    // ---- view projection (fixed camera) -------------------------------------
    var ca = Math.cos(cfg.az), sa = Math.sin(cfg.az);
    var ce = Math.cos(cfg.el), se = Math.sin(cfg.el);
    // Rz(az) then Rx(el); screen X = x', screen Y = -z' (up), depth = y' (+ = toward us).
    function view(v) {
      var x1 = ca * v[0] - sa * v[1];
      var y1 = sa * v[0] + ca * v[1];
      var z1 = v[2];
      return [x1, ce * y1 - se * z1, se * y1 + ce * z1];
    }
    function project(v) {
      var p = view(v);
      return { x: cx + p[0] * R, y: cy - p[2] * R, depth: p[1] };
    }

    // ---- theme colours ------------------------------------------------------
    var col = {};
    function refreshTheme() {
      var cs = getComputedStyle(document.documentElement);
      col.accent = (cs.getPropertyValue("--global-theme-color") || "#1fb2a6").trim() || "#1fb2a6";
      col.text = (cs.getPropertyValue("--global-text-color") || "#888").trim() || "#888";
      col.axis = "#e0a63a"; // amber for the rotation axis — distinct from the accent
    }
    refreshTheme();

    // ---- physics state ------------------------------------------------------
    var r = state0.slice();
    var trail = [];
    var running = cfg.autoplay;
    var last = null, raf = null;

    function rotationAxis() {
      var w = [cfg.omega, 0, cfg.delta];
      var m = norm(w);
      return { unit: m < 1e-9 ? [1, 0, 0] : [w[0] / m, w[1] / m, w[2] / m], rate: m };
    }

    function step(dt) {
      var ax = rotationAxis();
      var dth = ax.rate * dt * cfg.timeScale;
      if (dth !== 0) r = rotateAbout(r, ax.unit, dth);
      if (cfg.showTrail) {
        trail.push(r.slice());
        if (trail.length > 240) trail.shift();
      }
      if (cfg.onState) cfg.onState({ r: r.slice(), p1: (1 - r[2]) / 2, rabi: ax.rate });
    }

    // ---- drawing ------------------------------------------------------------
    function strokeArc(points, color, width, alpha, dashed) {
      ctx.save();
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.globalAlpha = alpha;
      if (dashed) ctx.setLineDash([3, 4]);
      ctx.beginPath();
      for (var i = 0; i < points.length; i++) {
        var p = project(points[i]);
        if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // one great circle, drawn per-segment so back-facing halves fade + dash
    function drawCircle(fn) {
      var N = 96;
      for (var j = 0; j < N; j++) {
        var t0 = (j / N) * 2 * Math.PI, t1 = ((j + 1) / N) * 2 * Math.PI;
        var v0 = fn(t0), v1 = fn(t1);
        var back = view(v0)[1] < 0 && view(v1)[1] < 0;
        strokeArc([v0, v1], col.text, 1, back ? 0.16 : 0.4, back);
      }
    }

    function drawAxisLabel(v, label, color) {
      var p = project([v[0] * 1.16, v[1] * 1.16, v[2] * 1.16]);
      ctx.save();
      ctx.fillStyle = color; ctx.globalAlpha = 0.85;
      ctx.font = "13px system-ui, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(label, p.x, p.y);
      ctx.restore();
    }

    function drawArrow(vec, color, width, headSize) {
      var tip = project(vec), o = project([0, 0, 0]);
      var behind = tip.depth < 0;
      ctx.save();
      ctx.globalAlpha = behind ? 0.45 : 1;
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width;
      ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(tip.x, tip.y); ctx.stroke();
      var ang = Math.atan2(tip.y - o.y, tip.x - o.x);
      ctx.beginPath();
      ctx.moveTo(tip.x, tip.y);
      ctx.lineTo(tip.x - headSize * Math.cos(ang - 0.4), tip.y - headSize * Math.sin(ang - 0.4));
      ctx.lineTo(tip.x - headSize * Math.cos(ang + 0.4), tip.y - headSize * Math.sin(ang + 0.4));
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    function render() {
      ctx.clearRect(0, 0, S, S);

      // sphere silhouette
      ctx.save();
      ctx.strokeStyle = col.text; ctx.globalAlpha = 0.5; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.stroke();
      ctx.restore();

      // equator + two meridians for 3D cue
      drawCircle(function (t) { return [Math.cos(t), Math.sin(t), 0]; });
      drawCircle(function (t) { return [Math.cos(t), 0, Math.sin(t)]; });
      drawCircle(function (t) { return [0, Math.cos(t), Math.sin(t)]; });

      // cartesian axes + kets
      var axes = [
        { v: [1, 0, 0], l: "x" }, { v: [0, 1, 0], l: "y" },
        { v: [0, 0, 1], l: "|0⟩" }, { v: [0, 0, -1], l: "|1⟩" },
      ];
      axes.forEach(function (a) {
        var p1 = project([a.v[0], a.v[1], a.v[2]]), o = project([0, 0, 0]);
        ctx.save();
        ctx.strokeStyle = col.text; ctx.globalAlpha = 0.28; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
        ctx.restore();
        drawAxisLabel(a.v, a.l, col.text);
      });

      // rotation axis n (dashed, both directions)
      if (cfg.showAxis) {
        var ax = rotationAxis();
        var n = ax.unit;
        strokeArc([[-n[0], -n[1], -n[2]], [n[0], n[1], n[2]]], col.axis, 1.5, 0.9, true);
        drawAxisLabel(n, "n", col.axis);
      }

      // trajectory trail
      if (cfg.showTrail && trail.length > 1) {
        for (var i = 1; i < trail.length; i++) {
          var back = view(trail[i])[1] < 0;
          strokeArc([trail[i - 1], trail[i]], col.accent, 1.5, (i / trail.length) * (back ? 0.3 : 0.7), false);
        }
      }

      // state vector
      drawArrow(r, col.accent, 2.5, 9);
    }

    // ---- loop ---------------------------------------------------------------
    function frame(ts) {
      if (last == null) last = ts;
      var dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;
      if (running) step(dt);
      refreshTheme();
      render();
      raf = global.requestAnimationFrame(frame);
    }
    raf = global.requestAnimationFrame(frame);

    // ---- public API ---------------------------------------------------------
    return {
      setOmega: function (x) { cfg.omega = +x; },
      setDelta: function (x) { cfg.delta = +x; },
      setState: function (v) { r = v.slice(); trail = []; },
      play: function () { running = true; last = null; },
      pause: function () { running = false; },
      toggle: function () { running = !running; last = null; return running; },
      reset: function () { r = state0.slice(); trail = []; },
      isRunning: function () { return running; },
      getState: function () { return { r: r.slice(), p1: (1 - r[2]) / 2 }; },
      refreshTheme: refreshTheme,
      destroy: function () { if (raf) global.cancelAnimationFrame(raf); if (canvas.parentNode) canvas.parentNode.removeChild(canvas); },
    };
  }

  global.createBlochSphere = createBlochSphere;
})(typeof window !== "undefined" ? window : this);
