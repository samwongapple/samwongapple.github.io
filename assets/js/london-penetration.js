/*
 * london-penetration.js — how far the field actually gets into a slab.
 *
 * A slab of thickness d sits in a uniform field B0 applied parallel to its
 * faces. The London equation
 *
 *     d²B/dx² = B / λ_L²
 *
 * with B(±d/2) = B0 has the exact solution
 *
 *     B(x) = B0 · cosh(x/λ_L) / cosh(d/2λ_L),
 *
 * which is what this widget plots — no curve is sketched. A normal metal has
 * no such equation and simply sits at B(x) = B0 everywhere; that is the toggle.
 *
 * The point the slider makes, and the reason it is a slider and not a picture:
 * "the field is expelled" is a statement about BULK samples. Expulsion is
 * measured by
 *
 *     f_expelled = 1 − (2λ_L/d)·tanh(d/2λ_L),
 *
 * which goes to 1 only when d >> λ_L. Squeeze the slab down to a few λ_L and a
 * superconductor barely expels anything at all, because there is no interior
 * left for the field to be excluded from.
 *
 * Vanilla JS, self-contained, theme-aware.
 * Usage:  createLondonPenetration(el) -> { setRatio, setMaterial, destroy }
 */
(function (global) {
  "use strict";

  var W = 660,
    H = 360;
  var PLOT_L = 62,
    PLOT_R = 18,
    PLOT_T = 150,
    PLOT_B = 46; // profile plot occupies the lower half
  var SLAB_T = 26,
    SLAB_B = 126; // cross-section band on top

  // x axis runs over ±XMAX slab half-thicknesses
  var XMAX = 1.55;

  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }

  function theme() {
    var cs = getComputedStyle(document.documentElement);
    function v(n, f) {
      return (cs.getPropertyValue(n) || f).trim() || f;
    }
    var dark = (document.documentElement.getAttribute("data-theme") || "") === "dark";
    return {
      text: v("--global-text-color", "#333"),
      accent: v("--global-theme-color", "#1fb2a6"),
      dim: dark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)",
      faint: dark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.11)",
      grid: dark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)",
      field: dark ? "#7fb2ff" : "#2f6fd0",
      dark: dark,
    };
  }

  function createLondonPenetration(container, opts) {
    if (!container) throw new Error("createLondonPenetration: container required");
    opts = opts || {};

    var state = {
      // λ_L / d, log-spaced from a bulk sample to a film thinner than λ_L
      ratio: opts.ratio != null ? opts.ratio : 0.06,
      material: opts.material || "super",
    };

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

    // ------------------------------------------------------------- physics
    // u = x/(d/2), so the slab is |u| <= 1 and λ_L/d = r means
    // x/λ_L = u·(d/2)/λ_L = u/(2r).
    function profile(u) {
      if (state.material === "normal") return 1;
      if (Math.abs(u) >= 1) return 1;
      var a = 1 / (2 * state.ratio);
      // cosh ratio, written so large a does not overflow
      return Math.exp(a * (Math.abs(u) - 1)) * ((1 + Math.exp(-2 * a * Math.abs(u))) / (1 + Math.exp(-2 * a)));
    }

    function expelledFraction() {
      if (state.material === "normal") return 0;
      var a = 1 / (2 * state.ratio); // = d/(2λ_L)
      return 1 - Math.tanh(a) / a;
    }

    // ------------------------------------------------------------- drawing
    function xPix(u) {
      return PLOT_L + ((u + XMAX) / (2 * XMAX)) * (W - PLOT_L - PLOT_R);
    }
    function yPix(b) {
      return H - PLOT_B - b * (H - PLOT_B - PLOT_T);
    }

    function render() {
      var th = theme();
      ctx.clearRect(0, 0, W, H);

      var xL = xPix(-1),
        xR = xPix(1);

      // ---- slab cross-section, top band
      ctx.save();
      ctx.fillStyle = state.material === "normal" ? th.faint : "rgba(0,0,0,0)";
      ctx.fillRect(xL, SLAB_T, xR - xL, SLAB_B - SLAB_T);
      if (state.material === "super") {
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = th.accent;
        ctx.fillRect(xL, SLAB_T, xR - xL, SLAB_B - SLAB_T);
      }
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = state.material === "super" ? th.accent : th.dim;
      ctx.lineWidth = 1.6;
      ctx.strokeRect(xL, SLAB_T, xR - xL, SLAB_B - SLAB_T);
      ctx.restore();

      // field lines whose LOCAL DENSITY tracks B(x): sample the profile and
      // draw a line wherever the accumulated flux crosses a threshold.
      ctx.save();
      ctx.strokeStyle = th.field;
      ctx.lineWidth = 1.3;
      var step = 0.004,
        acc = 0,
        quantum = 0.055;
      for (var u = -XMAX; u <= XMAX; u += step) {
        acc += profile(u) * step;
        if (acc >= quantum) {
          acc -= quantum;
          var xp = xPix(u);
          ctx.globalAlpha = 0.35 + 0.55 * profile(u);
          ctx.beginPath();
          ctx.moveTo(xp, SLAB_T + 4);
          ctx.lineTo(xp, SLAB_B - 4);
          ctx.stroke();
        }
      }
      ctx.restore();

      ctx.save();
      ctx.font = "500 10.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.fillStyle = th.dim;
      ctx.textAlign = "center";
      ctx.fillText("field lines, drawn at a density proportional to B(x)", W / 2, SLAB_T - 10);
      ctx.textAlign = "left";
      ctx.fillText("outside", xPix(-XMAX) + 4, SLAB_B + 13);
      ctx.textAlign = "center";
      ctx.fillStyle = state.material === "super" ? th.accent : th.dim;
      ctx.fillText(state.material === "super" ? "superconductor, thickness d" : "normal metal, thickness d", (xL + xR) / 2, SLAB_B + 13);
      ctx.restore();

      // ---- profile plot
      // axes
      ctx.save();
      ctx.strokeStyle = th.grid;
      ctx.lineWidth = 1;
      for (var g = 0; g <= 4; g++) {
        var yg = yPix(g / 4);
        ctx.beginPath();
        ctx.moveTo(PLOT_L, yg);
        ctx.lineTo(W - PLOT_R, yg);
        ctx.stroke();
      }
      ctx.restore();

      // slab region shading behind the curve
      ctx.save();
      ctx.globalAlpha = state.material === "super" ? 0.1 : 0.06;
      ctx.fillStyle = state.material === "super" ? th.accent : th.text;
      ctx.fillRect(xL, PLOT_T, xR - xL, H - PLOT_B - PLOT_T);
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = th.faint;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(xL, PLOT_T);
      ctx.lineTo(xL, H - PLOT_B);
      ctx.moveTo(xR, PLOT_T);
      ctx.lineTo(xR, H - PLOT_B);
      ctx.stroke();
      ctx.restore();

      // the curve itself
      ctx.save();
      ctx.strokeStyle = th.field;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      var first = true;
      for (var uu = -XMAX; uu <= XMAX + 1e-9; uu += 0.002) {
        var xp2 = xPix(uu),
          yp = yPix(profile(uu));
        if (first) {
          ctx.moveTo(xp2, yp);
          first = false;
        } else ctx.lineTo(xp2, yp);
      }
      ctx.stroke();
      ctx.restore();

      // axis labels
      ctx.save();
      ctx.font = "500 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.fillStyle = th.dim;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText("1", PLOT_L - 8, yPix(1));
      ctx.fillText("0", PLOT_L - 8, yPix(0));
      ctx.save();
      ctx.translate(16, (PLOT_T + H - PLOT_B) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = "center";
      ctx.fillText("B(x) / B₀", 0, 0);
      ctx.restore();
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("−d/2", xL, H - PLOT_B + 7);
      ctx.fillText("+d/2", xR, H - PLOT_B + 7);
      ctx.fillText("x", (xL + xR) / 2, H - PLOT_B + 7);
      ctx.restore();

      // λ_L scale bar, measured in from the left face — the length being talked about
      if (state.material === "super" && state.ratio < 0.75) {
        var uLam = -1 + 2 * state.ratio; // x = −d/2 + λ_L
        ctx.save();
        ctx.strokeStyle = th.accent;
        ctx.lineWidth = 1.6;
        var yb = yPix(0.14);
        ctx.beginPath();
        ctx.moveTo(xL, yb);
        ctx.lineTo(xPix(uLam), yb);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(xL, yb - 4);
        ctx.lineTo(xL, yb + 4);
        ctx.moveTo(xPix(uLam), yb - 4);
        ctx.lineTo(xPix(uLam), yb + 4);
        ctx.stroke();
        ctx.font = "600 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        ctx.fillStyle = th.accent;
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillText("λ_L", xPix(uLam) + 5, yb + 4);
        ctx.restore();
      }

      updateReadout();
    }

    // ------------------------------------------------------------ controls
    var controls = document.createElement("div");
    controls.style.cssText = "display:flex;flex-wrap:wrap;gap:1rem;align-items:center;justify-content:center;margin-top:0.85rem;font-size:0.9rem;";
    controls.innerHTML =
      '<label style="display:flex;align-items:center;gap:0.5rem;">λ<sub>L</sub>/d' +
      '<input type="range" min="-2.3" max="0.3" step="0.01" value="-1.22" aria-label="ratio of penetration depth to slab thickness">' +
      '<span style="min-width:4.6em;font-variant-numeric:tabular-nums;"></span></label>' +
      '<span style="display:flex;gap:0.35rem;align-items:center;"><span style="opacity:0.75;">material:</span>' +
      '<button type="button" data-mat="super">superconductor</button>' +
      '<button type="button" data-mat="normal">normal metal</button></span>';
    container.appendChild(controls);

    var slider = controls.querySelector("input");
    var ratioLabel = controls.querySelector("label span");
    var matBtns = controls.querySelectorAll("button[data-mat]");

    var readout = document.createElement("p");
    readout.style.cssText = "text-align:center;font-size:0.9rem;margin:0.7rem 0 0;font-variant-numeric:tabular-nums;";
    container.appendChild(readout);

    function updateReadout() {
      var th = theme();
      ratioLabel.textContent = state.ratio.toFixed(3);
      var f = expelledFraction();
      var bc = profile(0);
      if (state.material === "normal") {
        readout.innerHTML = '<span style="opacity:0.75;">the field is simply everywhere: </span>B(0) = B₀, nothing expelled.';
        return;
      }
      var verdict;
      if (f > 0.9) verdict = "a bulk sample — this is what &ldquo;expels the field&rdquo; means";
      else if (f > 0.5) verdict = "still mostly expelling, but the surface shell is a real fraction of the sample";
      else verdict = "barely expelling anything: the slab is all surface, with no interior to exclude a field from";
      readout.innerHTML =
        "B(0)/B₀ = <strong>" +
        (bc < 0.001 ? bc.toExponential(1) : bc.toFixed(3)) +
        "</strong> &nbsp;·&nbsp; flux expelled: <strong style='color:" +
        th.accent +
        "'>" +
        (100 * f).toFixed(1) +
        "%</strong><br><span style='opacity:0.75;'>" +
        verdict +
        "</span>";
    }

    function syncButtons() {
      for (var i = 0; i < matBtns.length; i++) {
        var on = matBtns[i].getAttribute("data-mat") === state.material;
        matBtns[i].style.fontWeight = on ? "700" : "400";
        matBtns[i].style.opacity = on ? "1" : "0.6";
      }
    }

    slider.addEventListener("input", function () {
      state.ratio = Math.pow(10, parseFloat(slider.value));
      render();
    });
    for (var i = 0; i < matBtns.length; i++) {
      matBtns[i].addEventListener("click", function (e) {
        state.material = e.currentTarget.getAttribute("data-mat");
        syncButtons();
        render();
      });
    }

    var mo = new MutationObserver(render);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    global.addEventListener("resize", render);

    slider.value = String(Math.log(state.ratio) / Math.LN10);
    syncButtons();
    render();

    return {
      setRatio: function (r) {
        state.ratio = clamp(r, 0.005, 2);
        slider.value = String(Math.log(state.ratio) / Math.LN10);
        render();
      },
      setMaterial: function (m) {
        state.material = m === "normal" ? "normal" : "super";
        syncButtons();
        render();
      },
      destroy: function () {
        mo.disconnect();
        global.removeEventListener("resize", render);
        [canvas, controls, readout].forEach(function (n) {
          if (n.parentNode) n.parentNode.removeChild(n);
        });
      },
    };
  }

  global.createLondonPenetration = createLondonPenetration;
})(window);
