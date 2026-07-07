/*
 * charge-stability.js — interactive double-dot charge stability diagram.
 *
 * Constant-interaction (capacitance) model. For gate-induced charges (ng1, ng2) the
 * electrostatic energy of the charge state (N1, N2) is
 *
 *   U(N1,N2) = (Ec1/2)(N1-ng1)^2 + (Ec2/2)(N2-ng2)^2 + Ecm (N1-ng1)(N2-ng2),
 *
 * where Ecm is the interdot (mutual) charging energy. The occupied state minimises U
 * over integer (N1,N2); the plane of (ng1,ng2) tiles into stable-charge regions. With
 * Ecm = 0 the dots are independent and the tiling is a SQUARE grid; turning Ecm on
 * splits each 4-fold vertex into two triple points joined by an interdot segment — the
 * square grid morphs into the HONEYCOMB. Drag the coupling slider to watch it happen.
 *
 * Vanilla JS, theme-aware (reads CSS variables). No animation loop: it redraws on demand.
 *
 * Usage:  var cs = createChargeStability(el, { size: 300, ecm: 0.3 });
 *         cs.setCoupling(0.0);   // -> square grid
 * Returns { setCoupling, redraw, destroy }.
 */
(function (global) {
  "use strict";

  function createChargeStability(container, opts) {
    if (!container) throw new Error("createChargeStability: container required");
    opts = opts || {};
    var cfg = {
      size: opts.size || 300,
      ec1: opts.ec1 || 1.0,
      ec2: opts.ec2 || 1.0,
      ecm: opts.ecm != null ? opts.ecm : 0.3, // interdot coupling
      nMax: opts.nMax || 3,
      ngMin: opts.ngMin != null ? opts.ngMin : -0.6,
      ngMax: opts.ngMax != null ? opts.ngMax : 2.6,
      highlight: opts.highlight || [[1, 1], [0, 2]],
      labels: opts.labels || [[0, 0], [1, 1], [0, 2], [2, 0], [2, 2]],
    };

    var W = cfg.size, H = cfg.size;
    var canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    canvas.style.width = "100%";
    canvas.style.maxWidth = W + "px";
    canvas.style.height = "auto";
    canvas.style.display = "block";
    canvas.style.margin = "0 auto";
    container.appendChild(canvas);
    var ctx = canvas.getContext("2d");

    // parse "#rgb", "#rrggbb", or "rgb(r,g,b)" -> [r,g,b]; fall back to `def`.
    function toRgb(str, def) {
      if (!str) return def;
      str = str.trim();
      var m = str.match(/^#([0-9a-f]{3})$/i);
      if (m) return [0, 1, 2].map(function (i) { var c = m[1][i]; return parseInt(c + c, 16); });
      m = str.match(/^#([0-9a-f]{6})$/i);
      if (m) return [0, 2, 4].map(function (i) { return parseInt(m[1].slice(i, i + 2), 16); });
      m = str.match(/rgba?\(([^)]+)\)/i);
      if (m) { var p = m[1].split(",").map(function (v) { return parseInt(v, 10); }); if (p.length >= 3) return [p[0], p[1], p[2]]; }
      return def;
    }
    function theme() {
      var cs = getComputedStyle(document.documentElement);
      var textCss = (cs.getPropertyValue("--global-text-color") || "").trim() || "#888888";
      var accCss = (cs.getPropertyValue("--global-theme-color") || "").trim() || "#1fb2a6";
      var bgCss = (cs.getPropertyValue("--global-bg-color") || "").trim() || "#111111";
      return {
        text: toRgb(textCss, [136, 136, 136]),
        acc: toRgb(accCss, [31, 178, 166]),
        bg: toRgb(bgCss, [17, 17, 17]),
        textCss: textCss, accCss: accCss,
      };
    }

    function ng1of(px) { return cfg.ngMin + (px / (W - 1)) * (cfg.ngMax - cfg.ngMin); }
    function ng2of(py) { return cfg.ngMin + ((H - 1 - py) / (H - 1)) * (cfg.ngMax - cfg.ngMin); }
    function pxOf(ng1) { return (ng1 - cfg.ngMin) / (cfg.ngMax - cfg.ngMin) * (W - 1); }
    function pyOf(ng2) { return H - 1 - (ng2 - cfg.ngMin) / (cfg.ngMax - cfg.ngMin) * (H - 1); }

    // ground-state charge (N1,N2) at (ng1,ng2)
    function stateAt(ng1, ng2) {
      var best = 1e18, bn1 = 0, bn2 = 0;
      for (var n1 = 0; n1 <= cfg.nMax; n1++) {
        for (var n2 = 0; n2 <= cfg.nMax; n2++) {
          var a = n1 - ng1, b = n2 - ng2;
          var u = 0.5 * cfg.ec1 * a * a + 0.5 * cfg.ec2 * b * b + cfg.ecm * a * b;
          if (u < best) { best = u; bn1 = n1; bn2 = n2; }
        }
      }
      return bn1 * (cfg.nMax + 1) + bn2; // packed id
    }

    function isHi(n1, n2) {
      for (var i = 0; i < cfg.highlight.length; i++)
        if (cfg.highlight[i][0] === n1 && cfg.highlight[i][1] === n2) return true;
      return false;
    }

    function redraw() {
      var th = theme();
      // compute state grid
      var grid = new Int16Array(W * H);
      for (var py = 0; py < H; py++)
        for (var px = 0; px < W; px++)
          grid[py * W + px] = stateAt(ng1of(px), ng2of(py));

      var img = ctx.createImageData(W, H);
      var d = img.data, np1 = cfg.nMax + 1;
      for (py = 0; py < H; py++) {
        for (px = 0; px < W; px++) {
          var idx = py * W + px, s = grid[idx];
          var n1 = Math.floor(s / np1), n2 = s % np1;
          // faint stepped shading by total charge so regions read as distinct
          var tot = n1 + n2, shade = 0.05 + 0.045 * tot;
          var base = th.bg, over = th.text, col = over, a = shade;
          if (isHi(n1, n2)) { over = th.acc; a = 0.22; }
          // boundary: differs from left or top neighbour
          var bnd = (px > 0 && grid[idx - 1] !== s) || (py > 0 && grid[idx - W] !== s);
          var o = idx * 4;
          if (bnd) {
            d[o] = th.text[0]; d[o + 1] = th.text[1]; d[o + 2] = th.text[2]; d[o + 3] = 200;
          } else {
            d[o] = over[0]; d[o + 1] = over[1]; d[o + 2] = over[2]; d[o + 3] = Math.round(a * 255);
          }
        }
      }
      ctx.clearRect(0, 0, W, H);
      ctx.putImageData(img, 0, 0);

      // labels
      ctx.save();
      ctx.font = "12px system-ui, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      for (var i = 0; i < cfg.labels.length; i++) {
        var L = cfg.labels[i], lx = pxOf(L[0]), ly = pyOf(L[1]);
        if (lx < 6 || lx > W - 6 || ly < 6 || ly > H - 6) continue;
        ctx.fillStyle = isHi(L[0], L[1]) ? th.accCss : th.textCss;
        ctx.globalAlpha = isHi(L[0], L[1]) ? 1 : 0.75;
        ctx.fillText("(" + L[0] + "," + L[1] + ")", lx, ly);
      }
      ctx.restore();
    }

    redraw();

    return {
      setCoupling: function (x) { cfg.ecm = +x; redraw(); },
      redraw: redraw,
      destroy: function () { if (canvas.parentNode) canvas.parentNode.removeChild(canvas); },
    };
  }

  global.createChargeStability = createChargeStability;
})(typeof window !== "undefined" ? window : this);
