/*
 * pauli-blockade.js — Pauli spin blockade readout of a double dot.
 *
 * Two electrons sit one-per-dot, the (1,1) charge state, with the detuning biased to
 * favour both on the right dot, (0,2). Whether the left electron can join the right one
 * is decided by Pauli:
 *   - SINGLET (antiparallel, antisymmetric spin): the pair may share the right dot's
 *     lowest orbital, so the electron tunnels across → (0,2). A charge has moved.
 *   - TRIPLET (parallel spin): two electrons cannot occupy the same orbital, so the
 *     transition to (0,2) is forbidden — the electron is blocked and the system stays
 *     (1,1). No charge moves.
 * The charge sensor therefore reads out the spin state: (0,2) = singlet, (1,1) = triplet.
 *
 * Vanilla JS, theme-aware. createPauliBlockade(el, cfg) -> { setState, run, reset, destroy }.
 */
(function (global) {
  "use strict";

  function createPauliBlockade(container, opts) {
    if (!container) throw new Error("createPauliBlockade: container required");
    opts = opts || {};
    var W = opts.w || 460, H = opts.h || 240;
    var cfg = { mode: opts.mode || "singlet", dur: opts.dur || 2200 };

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

    var xL = 150, xR = 322, yc = 108, R = 50;
    var running = false, t = 0, last = null, raf = null, onDone = null;
    var AMBER = "#e0a63a";

    function theme() {
      var cs = getComputedStyle(document.documentElement);
      return {
        text: (cs.getPropertyValue("--global-text-color") || "#888").trim() || "#888",
        acc: (cs.getPropertyValue("--global-theme-color") || "#1fb2a6").trim() || "#1fb2a6",
      };
    }
    function lerp(a, b, u) { return a + (b - a) * Math.max(0, Math.min(1, u)); }

    function electron(x, y, spinUp, color) {
      ctx.save();
      ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, 9, 0, 2 * Math.PI); ctx.fill();
      var dir = spinUp ? -1 : 1;
      ctx.beginPath(); ctx.moveTo(x, y + dir * 20); ctx.lineTo(x, y - dir * 20); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y - dir * 20); ctx.lineTo(x - 4, y - dir * 13);
      ctx.moveTo(x, y - dir * 20); ctx.lineTo(x + 4, y - dir * 13); ctx.stroke();
      ctx.restore();
    }
    function label(s, x, y, color, size, align, weight) {
      ctx.save(); ctx.fillStyle = color;
      ctx.font = (weight ? weight + " " : "") + (size || 12) + "px system-ui, sans-serif";
      ctx.textAlign = align || "center"; ctx.textBaseline = "middle"; ctx.fillText(s, x, y); ctx.restore();
    }

    function render(p) {
      var th = theme();
      ctx.clearRect(0, 0, W, H);

      // dots
      ctx.save(); ctx.strokeStyle = th.text; ctx.globalAlpha = 0.55; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(xL, yc, R, 0, 2 * Math.PI); ctx.stroke();
      ctx.beginPath(); ctx.arc(xR, yc, R, 0, 2 * Math.PI); ctx.stroke();
      ctx.restore();
      label("left dot", xL, yc + R + 16, th.text, 11);
      label("right dot", xR, yc + R + 16, th.text, 11);
      label("detuning ε favours (0,2) →", W / 2, 22, th.text, 11);

      var singlet = cfg.mode === "singlet";
      var done = p >= 0.98;

      if (singlet) {
        // antiparallel (A up, B down); A tunnels fully into the right dot -> (0,2)
        if (p >= 0.9) {
          electron(xR - 20, yc, true, th.acc);          // A settled
          electron(xR + 20, yc, false, th.text);        // B
        } else {
          electron(xR, yc, false, th.text);             // B waits in right dot
          electron(lerp(xL, xR - 22, p), yc, true, th.acc); // A slides across
        }
      } else {
        // parallel (A up, B up); A advances to the barrier then recoils — blocked
        electron(xR, yc, true, th.text);                // B up
        var adv = p < 0.45 ? p / 0.45 : 1 - (p - 0.45) / 0.55;
        electron(lerp(xL, (xL + xR) / 2 - 6, adv), yc, true, th.acc);
        if (p > 0.3 && p < 0.7) label("⚡ Pauli blocked", (xL + xR) / 2, yc - R - 6, AMBER, 12, "center", "600");
      }

      // charge-sensor verdict
      ctx.save(); ctx.strokeStyle = th.text; ctx.globalAlpha = 0.3; ctx.lineWidth = 1;
      ctx.strokeRect(14, H - 42, W - 28, 30); ctx.restore();
      label("charge sensor:", 22, H - 27, th.text, 12, "left");
      if (done) {
        if (singlet) label("(0,2) — charge moved  ✓  singlet", 132, H - 27, th.acc, 12, "left", "600");
        else label("(1,1) — no charge moved  ✗  triplet (blocked)", 132, H - 27, AMBER, 12, "left", "600");
      } else {
        label(singlet ? "…transferring" : "…attempting transfer", 132, H - 27, th.text, 12, "left");
      }
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
      setState: function (m) { cfg.mode = m === "triplet" ? "triplet" : "singlet"; t = 0; render(0); },
      run: function (done) { t = 0; last = null; running = true; onDone = done || null; raf = global.requestAnimationFrame(frame); },
      reset: function () { running = false; t = 0; render(0); },
      destroy: function () { if (raf) global.cancelAnimationFrame(raf); if (canvas.parentNode) canvas.parentNode.removeChild(canvas); },
    };
  }

  global.createPauliBlockade = createPauliBlockade;
})(typeof window !== "undefined" ? window : this);
