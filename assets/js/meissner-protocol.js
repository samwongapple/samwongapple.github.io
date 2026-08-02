/*
 * meissner-protocol.js — the field-cooling experiment, as a 2x2 grid.
 *
 * Rows are the material:
 *   PERFECT CONDUCTOR   a hypothetical metal with rho = 0 and nothing else assumed.
 *                       E = 0 inside forces dB/dt = 0, so whatever flux is
 *                       threading it when it becomes perfect stays threading it.
 *   SUPERCONDUCTOR      the real thing.
 *
 * Columns are the protocol, and both end at the SAME (T < Tc, H = H0):
 *   ZERO-FIELD COOLED   cool first, then switch the field on.
 *   FIELD COOLED        switch the field on first, then cool through Tc.
 *
 * Three of the four panels agree. The fourth — field-cooled superconductor —
 * expels the flux as it crosses Tc, which no amount of "resistance is zero"
 * reasoning will give you. That panel is the Meissner effect, and it is why the
 * superconducting state is an equilibrium phase rather than a memory of how the
 * sample got there.
 *
 * One shared timeline drives all four panels; the two columns simply do their
 * two steps in the opposite order. No sliders beyond the scrub bar: this is an
 * animation, not a widget.
 *
 * Vanilla JS, self-contained, theme-aware, honours prefers-reduced-motion by
 * rendering a three-frame filmstrip instead of animating.
 *
 * Usage:  createMeissnerProtocol(el) -> { setT, play, pause, destroy }
 */
(function (global) {
  "use strict";

  var W = 700,
    H = 462;
  var PAD_L = 122,
    PAD_T = 44,
    PAD_R = 12,
    GAP_X = 18,
    GAP_Y = 46,
    FOOT = 52;
  var PANEL_W = (W - PAD_L - PAD_R - GAP_X) / 2;
  var PANEL_H = (H - PAD_T - FOOT - GAP_Y) / 2;

  // Stage boundaries on the shared timeline t in [0,1].
  var S1 = 0.34,
    S2 = 0.68;

  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }
  function smooth(u) {
    u = clamp(u, 0, 1);
    return u * u * (3 - 2 * u);
  }

  /*
   * The physics of the whole figure, in one function.
   *
   *   sup   0 = normal, 1 = fully superconducting (or "perfect")
   *   hExt  applied field outside the sample, 0..1
   *   bIn   field actually inside the sample, 0..1
   *
   * ZFC: the sample is already in its zero-resistance state when the field
   * arrives, so the field never gets in — both materials exclude it, and they
   * do it for the same reason. The columns agree here.
   *
   * FC: the field is already inside when the sample crosses Tc. The perfect
   * conductor freezes it there (dB/dt = 0 is all it knows how to do). The
   * superconductor throws it out. This is the entire experiment.
   */
  function stateFor(material, protocol, t) {
    var sup, hExt, bIn;
    if (protocol === "zfc") {
      sup = smooth(t / S1);
      hExt = smooth((t - S1) / (S2 - S1));
      bIn = 0; // already excluding by the time the field turns on
    } else {
      hExt = smooth(t / S1);
      sup = smooth((t - S1) / (S2 - S1));
      if (material === "perfect") {
        bIn = hExt; // frozen in: it entered while normal and can never leave
      } else {
        bIn = hExt * (1 - sup); // expelled as it crosses Tc — the Meissner effect
      }
    }
    return { sup: sup, hExt: hExt, bIn: bIn };
  }

  function theme() {
    var cs = getComputedStyle(document.documentElement);
    function v(n, f) {
      return (cs.getPropertyValue(n) || f).trim() || f;
    }
    var text = v("--global-text-color", "#333");
    var accent = v("--global-theme-color", "#1fb2a6");
    var divider = v("--global-divider-color", "#ccc");
    var dark = (document.documentElement.getAttribute("data-theme") || "") === "dark";
    return {
      text: text,
      accent: accent,
      divider: divider,
      dark: dark,
      dim: dark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)",
      faint: dark ? "rgba(255,255,255,0.13)" : "rgba(0,0,0,0.11)",
      field: dark ? "#7fb2ff" : "#2f6fd0", // magnetic field lines
      normal: dark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.13)",
      alert: dark ? "#e0a63a" : "#b3760a", // the odd panel out
    };
  }

  function createMeissnerProtocol(container, opts) {
    if (!container) throw new Error("createMeissnerProtocol: container required");
    opts = opts || {};

    var reduced = false;
    try {
      reduced = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {
      reduced = false;
    }

    // ---------------------------------------------------------------- drawing

    function drawPanel(ctx, px, py, pw, ph, material, protocol, t, th) {
      var st = stateFor(material, protocol, t);
      var cx = px + pw / 2,
        cy = py + ph / 2;
      var sw = pw * 0.36,
        sh = ph * 0.54;

      // panel frame
      ctx.strokeStyle = th.faint;
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);

      // The Meissner panel earns a highlight once it has actually done the thing.
      var isTheOne = material === "super" && protocol === "fc";
      if (isTheOne && t > S2 - 0.06) {
        var glow = clamp((t - (S2 - 0.06)) / 0.12, 0, 1);
        ctx.save();
        ctx.globalAlpha = 0.85 * glow;
        ctx.strokeStyle = th.alert;
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 1, py + 1, pw - 2, ph - 2);
        ctx.restore();
      }

      // ---- field lines
      // Deflection is an order-preserving remap: at a height where the sample
      // blocks a half-width `occl`, a line's offset |dx0| ∈ [0, hw] maps to
      // occl + |dx0|·(hw − occl)/hw. Strictly monotonic in |dx0|, so the
      // bundle compresses into the gap beside the sample without any two
      // lines ever landing on the same path or crossing.
      var expel = st.hExt > 1e-6 ? clamp(1 - st.bIn / st.hExt, 0, 1) : 0;
      var nLines = 11;
      var y0 = py + 8,
        y1 = py + ph - 8;
      var hw = pw / 2 - 4; // usable half-width of the panel
      function sideFor(dx0, idx) {
        // A line dead-centre has no side to prefer; alternate so the bundle splits evenly.
        return Math.abs(dx0) < 1e-9 ? (idx % 2 ? 1 : -1) : dx0 > 0 ? 1 : -1;
      }
      function lineX(dx0, side, y) {
        var vert = Math.exp(-Math.pow((y - cy) / (sh * 0.78), 2));
        var occl = (sw / 2 + 9) * expel * vert; // half-width blocked at this height
        return cx + side * (occl + (Math.abs(dx0) / hw) * (hw - occl));
      }
      ctx.save();
      ctx.globalAlpha = 0.25 + 0.75 * st.hExt;
      ctx.strokeStyle = th.field;
      ctx.lineWidth = 1.4;
      for (var i = 0; i < nLines; i++) {
        var xBase = px + ((i + 0.5) / nLines) * pw;
        var dx0 = xBase - cx;
        var side = sideFor(dx0, i);
        ctx.beginPath();
        for (var k = 0; k <= 40; k++) {
          var y = y0 + ((y1 - y0) * k) / 40;
          var x = lineX(dx0, side, y);
          if (k === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // arrowheads, so the field reads as a direction and not as hatching —
      // anchored on the (possibly deflected) line, not at its undeflected base
      for (var a = 0; a < nLines; a += 2) {
        var dxa = px + ((a + 0.5) / nLines) * pw - cx;
        var xa = lineX(dxa, sideFor(dxa, a), y1 - 5);
        ctx.beginPath();
        ctx.moveTo(xa - 3, y1 - 8);
        ctx.lineTo(xa, y1 - 2);
        ctx.lineTo(xa + 3, y1 - 8);
        ctx.stroke();
      }
      ctx.restore();

      // ---- the sample
      var rx = cx - sw / 2,
        ry = cy - sh / 2,
        r = 5;
      ctx.beginPath();
      ctx.moveTo(rx + r, ry);
      ctx.arcTo(rx + sw, ry, rx + sw, ry + sh, r);
      ctx.arcTo(rx + sw, ry + sh, rx, ry + sh, r);
      ctx.arcTo(rx, ry + sh, rx, ry, r);
      ctx.arcTo(rx, ry, rx + sw, ry, r);
      ctx.closePath();

      // normal grey shading fades into accent as the sample goes super
      ctx.save();
      ctx.fillStyle = th.normal;
      ctx.fill();
      ctx.globalAlpha = 0.45 * st.sup;
      ctx.fillStyle = th.accent;
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.35 + 0.65 * st.sup;
      ctx.strokeStyle = st.sup > 0.5 ? th.accent : th.dim;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.restore();

      // (No separate "trapped flux" strokes: whenever bIn > 0 the through-lines
      // above already thread the sample — expel < 1 exactly then — so extra
      // interior lines would just double-draw the same flux at other positions.)

      // ---- state chips: where we are on the (T, H) axes right now
      ctx.save();
      ctx.font = "500 10.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.textBaseline = "middle";
      var chips = [
        { s: st.sup > 0.5 ? "T < Tc" : "T > Tc", on: st.sup > 0.5 },
        { s: st.hExt > 0.5 ? "H = H₀" : "H = 0", on: st.hExt > 0.5 },
      ];
      var chx = px + 8;
      for (var c = 0; c < chips.length; c++) {
        var tw = ctx.measureText(chips[c].s).width + 12;
        ctx.globalAlpha = chips[c].on ? 0.9 : 0.42;
        ctx.fillStyle = th.faint;
        ctx.fillRect(chx, py + 7, tw, 16);
        ctx.fillStyle = th.text;
        ctx.fillText(chips[c].s, chx + 6, py + 15.5);
        chx += tw + 5;
      }
      ctx.restore();

      // ---- verdict, under the panel
      var verdict, vcol;
      if (st.sup < 0.5 && st.hExt < 0.5) {
        verdict = "nothing to see yet";
        vcol = th.dim;
      } else if (st.bIn > 0.5) {
        verdict = "flux frozen in";
        vcol = th.field;
      } else if (st.hExt > 0.5) {
        verdict = "flux excluded  —  B = 0 inside";
        vcol = isTheOne ? th.alert : th.accent;
      } else {
        verdict = "cold, no field applied";
        vcol = th.dim;
      }
      ctx.save();
      ctx.font = (isTheOne && st.hExt > 0.5 ? "600 " : "500 ") + "11.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.fillStyle = vcol;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(verdict, cx, py + ph + 7);
      ctx.restore();
    }

    function drawGrid(ctx, t, th, showFoot) {
      ctx.clearRect(0, 0, W, H);

      // column headers
      ctx.save();
      ctx.font = "600 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.fillStyle = th.text;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var cols = ["zero-field cooled", "field cooled"];
      var subs = ["cool first, then apply H", "apply H first, then cool"];
      for (var c = 0; c < 2; c++) {
        var cxh = PAD_L + c * (PANEL_W + GAP_X) + PANEL_W / 2;
        ctx.fillStyle = th.text;
        ctx.font = "600 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        ctx.fillText(cols[c], cxh, PAD_T - 27);
        ctx.fillStyle = th.dim;
        ctx.font = "400 10.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        ctx.fillText(subs[c], cxh, PAD_T - 12);
      }
      ctx.restore();

      // row labels
      var rows = [
        { key: "perfect", a: "perfect", b: "conductor", c: "(hypothetical)" },
        { key: "super", a: "super-", b: "conductor", c: "(real)" },
      ];
      ctx.save();
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (var r = 0; r < 2; r++) {
        var cyh = PAD_T + r * (PANEL_H + GAP_Y) + PANEL_H / 2;
        ctx.fillStyle = th.text;
        ctx.font = "600 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        ctx.fillText(rows[r].a, PAD_L - 14, cyh - 13);
        ctx.fillText(rows[r].b, PAD_L - 14, cyh + 1);
        ctx.fillStyle = th.dim;
        ctx.font = "400 10.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        ctx.fillText(rows[r].c, PAD_L - 14, cyh + 16);
      }
      ctx.restore();

      for (var rr = 0; rr < 2; rr++) {
        for (var cc = 0; cc < 2; cc++) {
          drawPanel(
            ctx,
            PAD_L + cc * (PANEL_W + GAP_X),
            PAD_T + rr * (PANEL_H + GAP_Y),
            PANEL_W,
            PANEL_H,
            rows[rr].key,
            cc === 0 ? "zfc" : "fc",
            t,
            th
          );
        }
      }

      if (showFoot) {
        var msg;
        if (t < S1) msg = "①  left column: cool through Tc in zero field   ·   right column: switch the field on while still normal";
        else if (t < S2) msg = "②  left column: now switch the field on   ·   right column: now cool through Tc";
        else msg = "③  same temperature, same applied field, four samples — and one of them disagrees";
        ctx.save();
        ctx.font = "500 11.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        ctx.fillStyle = t >= S2 ? th.text : th.dim;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(msg, W / 2, H - FOOT / 2 - 4);
        ctx.restore();
      }
    }

    // ------------------------------------------------------- reduced motion
    // Same physics, three frozen frames, no animation and no controls.
    if (reduced) {
      var strip = document.createElement("div");
      var caps = ["① first step", "② second step", "③ final state"];
      [0.2, 0.55, 0.97].forEach(function (tf, idx) {
        var cv = document.createElement("canvas");
        var dp = Math.max(1, global.devicePixelRatio || 1);
        cv.width = W * dp;
        cv.height = H * dp;
        cv.style.width = "100%";
        cv.style.maxWidth = W + "px";
        cv.style.height = "auto";
        cv.style.display = "block";
        cv.style.margin = "0 auto";
        var c2 = cv.getContext("2d");
        c2.setTransform(dp, 0, 0, dp, 0, 0);
        drawGrid(c2, tf, theme(), false);
        var cap = document.createElement("p");
        cap.textContent = caps[idx];
        cap.style.cssText = "text-align:center;font-size:0.85rem;opacity:0.75;margin:0.2rem 0 1rem;";
        strip.appendChild(cv);
        strip.appendChild(cap);
      });
      container.appendChild(strip);
      return {
        setT: function () {},
        play: function () {},
        pause: function () {},
        destroy: function () {
          if (strip.parentNode) strip.parentNode.removeChild(strip);
        },
      };
    }

    // ------------------------------------------------------------ animated
    var canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.maxWidth = W + "px";
    canvas.style.height = "auto";
    canvas.style.display = "block";
    canvas.style.margin = "0 auto";
    container.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    function resize() {
      var dp = Math.max(1, global.devicePixelRatio || 1);
      canvas.width = W * dp;
      canvas.height = H * dp;
      ctx.setTransform(dp, 0, 0, dp, 0, 0);
    }
    resize();

    var controls = document.createElement("div");
    controls.style.cssText = "display:flex;gap:0.8rem;align-items:center;justify-content:center;margin-top:0.7rem;font-size:0.9rem;flex-wrap:wrap;";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "▶ play";
    btn.style.cssText = "min-width:5.6em;cursor:pointer;";
    var scrub = document.createElement("input");
    scrub.type = "range";
    scrub.min = "0";
    scrub.max = "1000";
    scrub.step = "1";
    scrub.value = "0";
    scrub.setAttribute("aria-label", "protocol timeline");
    scrub.style.cssText = "flex:1;min-width:min(340px,72vw);";
    controls.appendChild(btn);
    controls.appendChild(scrub);
    container.appendChild(controls);

    var t = 0,
      running = false,
      raf = null,
      last = null;
    var DUR = 9000; // ms for one pass — slow enough to read the two-step ordering

    function render() {
      drawGrid(ctx, t, theme(), true);
    }

    function frame(now) {
      if (last == null) last = now;
      var dt = now - last;
      last = now;
      if (running) {
        t += dt / DUR;
        if (t >= 1) {
          t = 1;
          running = false;
          btn.textContent = "↺ replay";
        }
        scrub.value = String(Math.round(t * 1000));
        render();
      }
      raf = global.requestAnimationFrame(frame);
    }
    raf = global.requestAnimationFrame(frame);

    btn.addEventListener("click", function () {
      if (running) {
        running = false;
        btn.textContent = "▶ play";
      } else {
        if (t >= 1) t = 0;
        running = true;
        last = null;
        btn.textContent = "⏸ pause";
      }
    });
    scrub.addEventListener("input", function () {
      running = false;
      btn.textContent = "▶ play";
      t = clamp(parseFloat(scrub.value) / 1000, 0, 1);
      render();
    });

    var mo = new MutationObserver(render);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    global.addEventListener("resize", render);

    render();

    return {
      setT: function (v) {
        t = clamp(v, 0, 1);
        scrub.value = String(Math.round(t * 1000));
        render();
      },
      play: function () {
        if (t >= 1) t = 0;
        running = true;
        last = null;
        btn.textContent = "⏸ pause";
      },
      pause: function () {
        running = false;
        btn.textContent = "▶ play";
      },
      destroy: function () {
        running = false;
        if (raf) global.cancelAnimationFrame(raf);
        mo.disconnect();
        global.removeEventListener("resize", render);
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        if (controls.parentNode) controls.parentNode.removeChild(controls);
      },
    };
  }

  global.createMeissnerProtocol = createMeissnerProtocol;
})(window);
