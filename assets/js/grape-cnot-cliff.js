/*
 * grape-cnot-cliff.js — CNOT infidelity vs gate time, for the quantum-control
 * post "GRAPE — pure states and gate synthesis".
 *
 * Left panel: best GRAPE infidelity 1−F vs gate time T/T_min (log scale),
 * measured by the post's from-scratch Julia GRAPE (K=32 piecewise-constant
 * segments, drift J σz⊗σz, four unbounded local controls, six L-BFGS restarts
 * per point). Overlaid: the instantaneous-locals envelope
 * (1 − sin 2JT)/2 and the Khaneja–Glaser time-optimal bound T_min = π/(4J).
 * Right panel: the optimized control waveforms at a selectable gate time.
 *
 * All data points are measured output of the post's Julia script — nothing
 * here is recomputed or simulated in JS; the envelope curve alone is drawn
 * from its closed form. Vanilla JS, no dependencies; colours read from the
 * site's CSS theme variables.
 *
 * Usage: const w = createGrapeCnotCliff(mountEl, DATA_INLINED_BELOW);
 */
(function (global) {
  "use strict";

  function createGrapeCnotCliff(mount, data) {
    function themeColor(name, fallback) {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fallback;
    }
    function colors() {
      return {
        accent: themeColor("--global-theme-color", "#1fb2a6"),
        text: themeColor("--global-text-color", "#333"),
        faint: "rgba(128,128,128,0.35)",
        amber: "#d99a2b",
      };
    }

    var state = {
      sel: data.pulses.findIndex(function (p) {
        return p.x === 1.0;
      }),
    };
    if (state.sel < 0) state.sel = 0;

    var root = document.createElement("div");
    root.style.cssText = "display:flex;flex-wrap:wrap;gap:1.2rem;justify-content:center;align-items:flex-start;";
    mount.appendChild(root);
    var cvA = document.createElement("canvas");
    cvA.width = 340;
    cvA.height = 300;
    cvA.style.cssText = "max-width:100%;height:auto;";
    root.appendChild(cvA);
    var cvB = document.createElement("canvas");
    cvB.width = 340;
    cvB.height = 300;
    cvB.style.cssText = "max-width:100%;height:auto;";
    root.appendChild(cvB);

    var FLOOR = 1e-15,
      TOP = 1.0;
    function ylog(v, y0, y1) {
      var t = (Math.log10(Math.max(v, FLOOR)) - Math.log10(FLOOR)) / (Math.log10(TOP) - Math.log10(FLOOR));
      return y0 - t * (y0 - y1);
    }

    function drawCliff() {
      var ctx = cvA.getContext("2d"),
        c = colors();
      var W = cvA.width,
        H = cvA.height,
        x0 = 46,
        y0 = H - 40,
        x1 = W - 10,
        y1 = 16;
      var xmin = 0,
        xmax = 1.5;
      function px(x) {
        return x0 + ((x - xmin) / (xmax - xmin)) * (x1 - x0);
      }
      ctx.clearRect(0, 0, W, H);
      ctx.font = "11px sans-serif";

      // axes + log gridlines
      ctx.strokeStyle = c.faint;
      ctx.fillStyle = c.text;
      for (var e = 0; e >= -15; e -= 3) {
        var y = ylog(Math.pow(10, e), y0, y1);
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.textAlign = "right";
        ctx.fillText(e === 0 ? "1" : "1e" + e, x0 - 4, y + 3.5);
      }
      ctx.textAlign = "center";
      for (var xv = 0; xv <= 1.5001; xv += 0.5) {
        ctx.fillText(xv.toFixed(1), px(xv), y0 + 14);
      }
      ctx.fillText("gate time  T / T_min", (x0 + x1) / 2, y0 + 28);
      ctx.save();
      ctx.translate(12, (y0 + y1) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("CNOT infidelity  1 − F", 0, 0);
      ctx.restore();

      // KBG bound
      ctx.strokeStyle = c.amber;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(px(1), y0);
      ctx.lineTo(px(1), y1);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = c.amber;
      ctx.textAlign = "left";
      ctx.fillText("T_min = π/4J", px(1) + 4, y1 + 10);

      // instantaneous-locals envelope (closed form, x<1)
      ctx.strokeStyle = c.faint;
      ctx.lineWidth = 1.6;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      for (var i = 0; i <= 200; i++) {
        var x = xmin + ((1 - xmin) * i) / 200;
        var v = (1 - Math.sin((2 * x * Math.PI) / 4)) / 2;
        var xp = px(x),
          yp = ylog(v, y0, y1);
        i === 0 ? ctx.moveTo(xp, yp) : ctx.lineTo(xp, yp);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // K = 64 / 128 cliff-region overlays (measured), fading toward the bound
      if (data.overlay) {
        var keys = Object.keys(data.overlay).sort(function (a, b) {
          return a - b;
        });
        keys.forEach(function (Kk, idx) {
          var pts = data.overlay[Kk];
          ctx.strokeStyle = c.accent;
          ctx.globalAlpha = 0.55 - 0.2 * idx;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          for (var m = 0; m < pts.length; m++) {
            var xo = px(pts[m][0]),
              yo = ylog(pts[m][1], y0, y1);
            m === 0 ? ctx.moveTo(xo, yo) : ctx.lineTo(xo, yo);
          }
          ctx.stroke();
          ctx.globalAlpha = 1;
        });
      }

      // measured GRAPE points
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (var j = 0; j < data.xs.length; j++) {
        var xp2 = px(data.xs[j]),
          yp2 = ylog(data.infid[j], y0, y1);
        j === 0 ? ctx.moveTo(xp2, yp2) : ctx.lineTo(xp2, yp2);
      }
      ctx.stroke();
      for (var j2 = 0; j2 < data.xs.length; j2++) {
        ctx.fillStyle = c.accent;
        ctx.beginPath();
        ctx.arc(px(data.xs[j2]), ylog(data.infid[j2], y0, y1), 2.6, 0, 2 * Math.PI);
        ctx.fill();
      }

      // selected point marker
      var sp = data.pulses[state.sel];
      ctx.strokeStyle = c.text;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(px(sp.x), ylog(sp.infid, y0, y1), 5.5, 0, 2 * Math.PI);
      ctx.stroke();

      // legend (lower-left region is empty: sub-cliff data sits high)
      ctx.textAlign = "left";
      ctx.font = "10.5px sans-serif";
      ctx.fillStyle = c.accent;
      ctx.fillText("● GRAPE, K=32 (measured)", x0 + 8, y0 - 44);
      ctx.fillText("— fainter: K=64, 128", x0 + 8, y0 - 31);
      ctx.fillStyle = c.text;
      ctx.fillText("┄ locals-only envelope", x0 + 8, y0 - 18);
    }

    function drawPulse() {
      var ctx = cvB.getContext("2d"),
        c = colors();
      var W = cvB.width,
        H = cvB.height,
        x0 = 42,
        y0 = H - 40,
        x1 = W - 10,
        y1 = 16;
      var sp = data.pulses[state.sel];
      var K = sp.u[0].length;
      var umax = 1e-9;
      for (var j = 0; j < 4; j++) for (var k = 0; k < K; k++) umax = Math.max(umax, Math.abs(sp.u[j][k]));
      umax *= 1.08;
      function px(k) {
        return x0 + (k / K) * (x1 - x0);
      }
      function py(v) {
        return (y0 + y1) / 2 - ((v / umax) * (y0 - y1)) / 2;
      }
      ctx.clearRect(0, 0, W, H);
      ctx.font = "11px sans-serif";

      ctx.strokeStyle = c.faint;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(x0, py(0));
      ctx.lineTo(x1, py(0));
      ctx.stroke();
      ctx.strokeStyle = c.faint;
      ctx.strokeRect(x0, y1, x1 - x0, y0 - y1);
      ctx.fillStyle = c.text;
      ctx.textAlign = "center";
      ctx.fillText("t / T", (x0 + x1) / 2, y0 + 14);
      ctx.save();
      ctx.translate(12, (y0 + y1) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("uⱼ(t) / J", 0, 0);
      ctx.restore();
      ctx.textAlign = "right";
      ctx.fillText(+umax.toFixed(0), x0 - 4, y1 + 9);
      ctx.fillText("−" + +umax.toFixed(0), x0 - 4, y0);

      // 4 controls: accent / accent-dashed / amber / amber-dashed
      var styles = [
        { s: c.accent, d: [] },
        { s: c.accent, d: [4, 3] },
        { s: c.amber, d: [] },
        { s: c.amber, d: [4, 3] },
      ];
      for (var jj = 0; jj < 4; jj++) {
        ctx.strokeStyle = styles[jj].s;
        ctx.setLineDash(styles[jj].d);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (var kk = 0; kk < K; kk++) {
          var v = sp.u[jj][kk];
          ctx.moveTo(px(kk), py(v));
          ctx.lineTo(px(kk + 1), py(v));
          if (kk + 1 < K) ctx.lineTo(px(kk + 1), py(sp.u[jj][kk + 1]));
        }
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.textAlign = "left";
      ctx.font = "10.5px sans-serif";
      ctx.fillStyle = c.accent;
      ctx.fillText("— u1x   ┄ u1y", x0 + 6, y1 + 12);
      ctx.fillStyle = c.amber;
      ctx.fillText("— u2x   ┄ u2y", x0 + 6, y1 + 25);
      ctx.fillStyle = c.text;
      ctx.textAlign = "right";
      var lbl = "T = " + sp.x.toFixed(2) + "·T_min    1−F = " + (sp.infid < 1e-12 ? "≤1e−12" : sp.infid.toExponential(2));
      ctx.fillText(lbl, x1 - 4, y0 - 6);
    }

    function draw() {
      drawCliff();
      drawPulse();
    }
    draw();

    // redraw on theme flips
    var mo = new MutationObserver(draw);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return {
      setSel: function (i) {
        state.sel = Math.max(0, Math.min(data.pulses.length - 1, i));
        draw();
      },
      pulses: data.pulses,
      destroy: function () {
        mo.disconnect();
        root.remove();
      },
    };
  }

  global.createGrapeCnotCliff = createGrapeCnotCliff;
})(window);
