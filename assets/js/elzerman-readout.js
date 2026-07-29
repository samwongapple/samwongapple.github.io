/*
 * elzerman-readout.js — Elzerman energy-selective spin-to-charge readout.
 *
 * A single dot holds one electron in one of two Zeeman-split spin levels. The reservoir's
 * chemical potential μ is tuned BETWEEN them: the higher-energy (excited) level sits above
 * μ, the lower-energy (ground) level below. Readout:
 *   - excited: the electron can tunnel OUT to an empty reservoir state, the dot goes empty,
 *     then a ground-state electron tunnels back IN — the charge sensor sees a blip.
 *   - ground: below μ, the electron has nowhere to go (states below μ are filled) — it
 *     stays put, and the charge sensor reads a flat, occupied trace.
 * The spin never touches the detector; a charge does the talking.
 *
 * Vanilla JS, theme-aware. createElzermanReadout(el, cfg) -> { setSpin, run, reset, destroy }.
 */
(function (global) {
  "use strict";

  function createElzermanReadout(container, opts) {
    if (!container) throw new Error("createElzermanReadout: container required");
    opts = opts || {};
    var W = opts.w || 460, H = opts.h || 280;
    var cfg = { spin: opts.spin || "up", dur: opts.dur || 2600 };

    var canvas = document.createElement("canvas");
    canvas.style.width = "100%"; canvas.style.maxWidth = W + "px";
    canvas.style.height = "auto"; canvas.style.display = "block"; canvas.style.margin = "0 auto";
    container.appendChild(canvas);
    var ctx = canvas.getContext("2d"), dpr = 1;
    function resize() {
      dpr = Math.max(1, global.devicePixelRatio || 1);
      canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    // geometry (energy diagram on top, charge trace on bottom)
    var xDot = 96, xRes0 = 250, xResEnd = W - 14;
    var yUp = 66, yDown = 132, yMu = 99;         // energy levels + reservoir μ
    var traceTop = 214, traceBot = 264;

    var running = false, t = 0, last = null, raf = null, onDone = null;

    function theme() {
      var cs = getComputedStyle(document.documentElement);
      return {
        text: (cs.getPropertyValue("--global-text-color") || "#888").trim() || "#888",
        acc: (cs.getPropertyValue("--global-theme-color") || "#1fb2a6").trim() || "#1fb2a6",
      };
    }
    function lerp(a, b, u) { return a + (b - a) * Math.max(0, Math.min(1, u)); }

    // occupation N(t) for the excited run: 1, dip to 0, back to 1
    function occ(p) {
      if (cfg.spin !== "up") return 1;
      if (p < 0.32 || p > 0.78) return 1;
      return 0;
    }

    function ball(x, y, spinUp, alpha, color) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, 8, 0, 2 * Math.PI); ctx.fill();
      // spin arrow
      ctx.beginPath();
      var dir = spinUp ? -1 : 1;
      ctx.moveTo(x + 13, y + dir * 9); ctx.lineTo(x + 13, y - dir * 9); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 13, y - dir * 9);
      ctx.lineTo(x + 10, y - dir * 4); ctx.moveTo(x + 13, y - dir * 9); ctx.lineTo(x + 16, y - dir * 4);
      ctx.stroke();
      ctx.restore();
    }

    function label(s, x, y, color, size, align) {
      ctx.save(); ctx.fillStyle = color; ctx.font = (size || 12) + "px system-ui, sans-serif";
      ctx.textAlign = align || "left"; ctx.textBaseline = "middle"; ctx.fillText(s, x, y); ctx.restore();
    }

    function render(p) {
      var th = theme();
      ctx.clearRect(0, 0, W, H);

      // reservoir Fermi sea (filled below μ)
      ctx.save();
      ctx.fillStyle = th.acc; ctx.globalAlpha = 0.14;
      ctx.fillRect(xRes0, yMu, xResEnd - xRes0, 185 - yMu);
      ctx.restore();
      ctx.save(); ctx.strokeStyle = th.text; ctx.globalAlpha = 0.4; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(xRes0, yMu); ctx.lineTo(xResEnd, yMu); ctx.stroke(); ctx.restore();
      label("reservoir", (xRes0 + xResEnd) / 2, 30, th.text, 11, "center");
      label("μ", xResEnd - 4, yMu - 9, th.text, 12, "right");

      // tunnel barrier
      ctx.save(); ctx.strokeStyle = th.text; ctx.globalAlpha = 0.25;
      for (var bx = 150; bx <= 232; bx += 8) { ctx.beginPath(); ctx.moveTo(bx, 40); ctx.lineTo(bx, 185); ctx.stroke(); }
      ctx.restore();
      label("barrier", 191, 30, th.text, 11, "center");

      // dot: two spin levels
      ctx.save(); ctx.strokeStyle = th.text; ctx.globalAlpha = 0.85; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(xDot - 34, yUp); ctx.lineTo(xDot + 22, yUp); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(xDot - 34, yDown); ctx.lineTo(xDot + 22, yDown); ctx.stroke();
      ctx.restore();
      label("|↑⟩", xDot - 40, yUp, th.text, 12, "right");
      label("|↓⟩", xDot - 40, yDown, th.text, 12, "right");
      label("quantum dot", xDot - 6, 30, th.text, 11, "center");

      // electron(s)
      var occNow = occ(p);
      if (cfg.spin === "up") {
        if (p < 0.32) {                                   // excited electron leaving
          var x = lerp(xDot, xRes0 + 40, p / 0.32);
          ball(x, yUp, true, 1 - Math.max(0, (p - 0.24) / 0.08), th.acc);
        } else if (p >= 0.55) {                           // ground electron entering
          var xi = lerp(xRes0 + 40, xDot, (p - 0.55) / 0.27);
          ball(Math.max(xDot, xi), yDown, false, Math.min(1, (p - 0.55) / 0.1), th.acc);
        }
      } else {
        ball(xDot, yDown, false, 1, th.acc);              // ground: stays put
        if (p > 0.15 && p < 0.85) label("✕ blocked (below μ)", 191, 150, th.text, 11, "center");
      }

      // ---- charge-sensor trace ----
      ctx.save(); ctx.strokeStyle = th.text; ctx.globalAlpha = 0.3; ctx.lineWidth = 1;
      ctx.strokeRect(14, traceTop, W - 28, traceBot - traceTop); ctx.restore();
      label("charge sensor", 20, traceTop - 8, th.text, 11, "left");
      var yHi = traceBot - 12, yLo = traceTop + 12;
      label("full", W - 20, yHi, th.text, 10, "right");
      label("empty", W - 20, yLo, th.text, 10, "right");
      // draw N(t) up to current progress
      ctx.save(); ctx.strokeStyle = th.acc; ctx.lineWidth = 2; ctx.beginPath();
      var x0 = 20, x1 = W - 46, steps = 120, started = false;
      for (var i = 0; i <= steps; i++) {
        var pp = (i / steps);
        if (pp > p) break;
        var xt = lerp(x0, x1, pp), yt = occ(pp) === 1 ? yHi : yLo;
        if (!started) { ctx.moveTo(xt, yt); started = true; } else { ctx.lineTo(xt, yt); }
      }
      ctx.stroke(); ctx.restore();
    }

    function frame(ts) {
      if (last == null) last = ts;
      t += (ts - last) / cfg.dur; last = ts;
      if (t >= 1) { t = 1; running = false; }
      render(t);
      if (running) raf = global.requestAnimationFrame(frame);
      else if (onDone) { var cb = onDone; onDone = null; cb(); }
    }

    render(0);
    return {
      setSpin: function (s) { cfg.spin = s === "down" ? "down" : "up"; t = 0; render(0); },
      run: function (done) { t = 0; last = null; running = true; onDone = done || null; raf = global.requestAnimationFrame(frame); },
      reset: function () { running = false; t = 0; render(0); },
      destroy: function () { if (raf) global.cancelAnimationFrame(raf); if (canvas.parentNode) canvas.parentNode.removeChild(canvas); },
    };
  }

  global.createElzermanReadout = createElzermanReadout;
})(typeof window !== "undefined" ? window : this);
