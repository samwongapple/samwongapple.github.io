/*
 * noise-filter-math.js — shared physics for the "Fighting Noise with Rhythm"
 * posts (A2 filter functions, A3 noise spectroscopy, A4 real baths).
 *
 * This module holds the formulas. The widgets that import it hold only drawing
 * code, so every post's curves come from one audited implementation.
 *
 * ---------------------------------------------------------------------------
 * CONVENTION (fixed in "Why Your Qubit Forgets" §6, generalized here)
 *
 *   phase:      phi(t) = ∫_0^t y(s) beta(s) ds,   y(s) = ±1, flipped by each π pulse
 *   attenuation: chi(t) = (1/2)<phi²> = ∫ dω/2π S(ω) F(ω,t)
 *   filter:     F(ω,t) = (1/2)|ytilde(ω,t)|²,  ytilde = ∫_0^t y(s) e^{iωs} ds
 *   coherence:  W(t) = exp(-chi(t))
 *
 * S(ω) is TWO-SIDED and even, so the integral folds to
 *   chi(t) = (1/π) ∫_0^∞ S(ω) F(ω,t) dω.
 *
 * With n π-pulses at times s_1 … s_n, telescoping the piecewise integral gives
 * the exact closed form used throughout (verified against direct numerical
 * integration for FID, Hahn, CPMG and uneven sequences):
 *
 *   ytilde(ω,t) = (1/iω) [ (-1)^n e^{iωt} − 1 − 2 Σ_j (−1)^j e^{iω s_j} ]
 *
 * Limits this reproduces exactly (all checked numerically):
 *   FID    F = 2 sin²(ωt/2)/ω²                    → the A1 result
 *   Hahn   F = 8 sin⁴(ωt/4)/ω²
 *   CPMG_n F = 8 sin⁴(ωt/4n)·{sin²|cos²}(ωt/2)/(ω² cos²(ωt/2n))   n even|odd
 *   F(0,t) = t²/2 for FID and EXACTLY 0 for any refocused sequence
 *   white noise: chi = S0·t/2 for every sequence (undecouplable)
 * ---------------------------------------------------------------------------
 */
(function (global) {
  "use strict";

  // ==== pulse sequences ====================================================
  // Return the π-pulse times inside (0, t). n is ignored where meaningless.
  function pulseTimes(kind, n, t) {
    var s = [], j;
    if (kind === "fid") return s;
    if (kind === "hahn") return [t / 2];
    if (kind === "cpmg") {
      // CPMG timing: τ/2, τ, …, τ, τ/2 with τ = t/n
      for (j = 1; j <= n; j++) s.push((j - 0.5) * (t / n));
      return s;
    }
    if (kind === "cp") {
      // Carr–Purcell timing: pulses equally spaced, no half-interval at the ends
      for (j = 1; j <= n; j++) s.push((j * t) / (n + 1));
      return s;
    }
    if (kind === "udd") {
      // Uhrig: s_j = t sin²(πj / (2n+2)) — optimal against a sharp high-ω cutoff
      for (j = 1; j <= n; j++) {
        s.push(t * Math.pow(Math.sin((Math.PI * j) / (2 * n + 2)), 2));
      }
      return s;
    }
    throw new Error("pulseTimes: unknown sequence " + kind);
  }

  // ==== filter function ====================================================
  // Exact F(ω,t) = ½|ytilde|² from the telescoped sum above.
  function filterF(w, t, sw) {
    if (w === 0) {
      // limit ω→0: ytilde → ∫ y ds = (signed) net time, so F = (net)²/2
      var net = 0, prev = 0, sign = 1;
      for (var i = 0; i < sw.length; i++) {
        net += sign * (sw[i] - prev);
        prev = sw[i];
        sign = -sign;
      }
      net += sign * (t - prev);
      return 0.5 * net * net;
    }
    var n = sw.length;
    // B = (-1)^n e^{iωt} − 1 − 2 Σ_j (−1)^j e^{iω s_j}
    var pn = n % 2 === 0 ? 1 : -1;
    var re = pn * Math.cos(w * t) - 1;
    var im = pn * Math.sin(w * t);
    for (var j = 0; j < n; j++) {
      var sgn = (j + 1) % 2 === 0 ? 1 : -1; // (−1)^j with j starting at 1
      re -= 2 * sgn * Math.cos(w * sw[j]);
      im -= 2 * sgn * Math.sin(w * sw[j]);
    }
    // |ytilde|² = |B/(iω)|² = |B|²/ω²
    return (0.5 * (re * re + im * im)) / (w * w);
  }

  // Oscillation-averaged filter, for grid cells coarser than one fringe.
  // Averaging the unit-modulus phases in B gives <|B|²> = 2 + 4n, so
  //   <F> = (2n+1)/ω².   (FID → 1/ω², Hahn → 3/ω²: both match exactly.)
  function filterFAvg(w, n) {
    return (2 * n + 1) / (w * w);
  }

  // ==== noise spectra ======================================================
  // A spectrum is a list of components; S(ω) is their sum. All two-sided.
  //   {type:"white",       S0}                       flat
  //   {type:"lorentzian",  sigma, tauc}              OU / a two-level fluctuator
  //   {type:"oneOverF",    A, alpha}                 A/|ω|^alpha
  //   {type:"quasistatic", sigma, tauc}              very slow Lorentzian (nuclear)
  //   {type:"peak",        sigma, w0, width}         a narrow line (e.g. Larmor)
  function spectrumAt(w, comps) {
    var a = Math.abs(w), S = 0;
    for (var i = 0; i < comps.length; i++) {
      var c = comps[i];
      if (c.enabled === false) continue;
      switch (c.type) {
        case "white":
          S += c.S0;
          break;
        case "lorentzian":
        case "quasistatic":
          S += (2 * c.sigma * c.sigma * c.tauc) / (1 + a * a * c.tauc * c.tauc);
          break;
        case "oneOverF":
          S += c.A / Math.pow(Math.max(a, 1e-12), c.alpha == null ? 1 : c.alpha);
          break;
        case "peak": {
          var d = (a - c.w0) / c.width;
          S += c.sigma * c.sigma * Math.exp(-0.5 * d * d);
          break;
        }
        default:
          throw new Error("spectrumAt: unknown component " + c.type);
      }
    }
    return S;
  }

  // ==== the overlap integral ==============================================
  // chi(t) = (1/π) ∫_0^∞ S(ω) F(ω,t) dω.
  //
  // Grid strategy. The filter's structure (the CPMG passband at ω ≈ nπ/t and
  // its harmonics) must be resolved, so we lay a DENSE LINEAR grid over the
  // region that carries it, then a LOG tail with the oscillation-averaged
  // filter, which is exact once a cell spans many fringes.
  //
  // wMin is a real physical parameter, not a fudge: 1/f noise has no finite
  // total power, and what regularizes it is the finite duration of the
  // experiment. Slower drifts than 1/T_expt are recalibrated away, not measured.
  //
  // The core region [wMin, wc] is sampled on the MERGE of a linear and a
  // logarithmic grid. Both are needed and neither alone is enough: the linear
  // grid resolves the filter's fringes (spaced ~2π/t, uniform in ω), while the
  // log grid resolves narrow spectral features (a nuclear bath with τc ~ ms is
  // a Lorentzian only ~10⁻³ rad/μs wide, which a linear grid steps straight
  // over). Both arrays are already sorted, so they merge in one pass.
  function chi(t, sw, comps, opts) {
    opts = opts || {};
    var n = sw.length;
    var wMin = opts.wMin != null ? opts.wMin : 1e-4 / t; // IR cutoff
    var nLin = opts.nLin || 6000;
    var nLog = opts.nLog || 2400;
    var i;

    // dense region: out to ~24 fringes of the fastest structure
    var wc = (24 * Math.PI * Math.max(n, 1)) / t;
    if (!(wc > wMin * 1.0000001)) wc = wMin * 10;

    var lin = new Float64Array(nLin + 1), dw = (wc - wMin) / nLin;
    for (i = 0; i <= nLin; i++) lin[i] = wMin + i * dw;
    var lg = new Float64Array(nLog + 1);
    var lo = Math.log(wMin), hi = Math.log(wc), dl = (hi - lo) / nLog;
    for (i = 0; i <= nLog; i++) lg[i] = Math.exp(lo + i * dl);

    // --- trapezoid over the merged grid, exact filter
    var acc = 0, a = 0, b = 0;
    var prevW = wMin, prevV = spectrumAt(wMin, comps) * filterF(wMin, t, sw);
    while (a <= nLin || b <= nLog) {
      var w;
      if (b > nLog || (a <= nLin && lin[a] <= lg[b])) w = lin[a++];
      else w = lg[b++];
      if (w <= prevW) continue;
      var v = spectrumAt(w, comps) * filterF(w, t, sw);
      acc += 0.5 * (prevV + v) * (w - prevW);
      prevW = w; prevV = v;
    }

    // --- log tail, oscillation-averaged filter (exact once a cell spans many fringes)
    var wMax = opts.wMax != null ? opts.wMax : wc * 1e5;
    var lo2 = Math.log(wc), hi2 = Math.log(wMax), dl2 = (hi2 - lo2) / nLog;
    for (i = 0; i <= nLog; i++) {
      var w2 = Math.exp(lo2 + i * dl2);
      var wg = i === 0 || i === nLog ? 0.5 : 1;
      acc += wg * spectrumAt(w2, comps) * filterFAvg(w2, n) * w2 * dl2; // dω = ω dl
    }

    return acc / Math.PI;
  }

  // W(t) = exp(−chi)
  function coherence(t, kind, n, comps, opts) {
    return Math.exp(-chi(t, pulseTimes(kind, n, t), comps, opts));
  }

  // Coherence time: solve chi(T) = 1 (i.e. W = 1/e) by bisection on log t.
  // Returns null if no crossing inside [tLo, tHi].
  function coherenceTime(kind, n, comps, opts) {
    opts = opts || {};
    var tLo = opts.tLo || 1e-4, tHi = opts.tHi || 1e4;
    function f(t) {
      return chi(t, pulseTimes(kind, n, t), comps, opts) - 1;
    }
    var a = f(tLo), b = f(tHi);
    if (a > 0 || b < 0) return null;
    var iters = opts.iters || 40;
    for (var k = 0; k < iters; k++) {
      var m = Math.sqrt(tLo * tHi); // geometric bisection
      if (f(m) < 0) tLo = m;
      else tHi = m;
    }
    return Math.sqrt(tLo * tHi);
  }

  global.NoiseFilterMath = {
    pulseTimes: pulseTimes,
    filterF: filterF,
    filterFAvg: filterFAvg,
    spectrumAt: spectrumAt,
    chi: chi,
    coherence: coherence,
    coherenceTime: coherenceTime,
  };
})(typeof window !== "undefined" ? window : this);
