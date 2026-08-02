---
layout: post
title: "The Qubit as a Spectrometer"
date: 2026-07-28 19:00:00-0700
description: Run the filter picture backwards and decay curves stop being a symptom and start being data. How a qubit measures the spectrum of its own environment — and what the reconstruction quietly assumes.
tags: [quantum-computing, spin-qubits, decoherence, noise-spectroscopy]
categories: [spin-qubits]
related_posts: false
provides: [noise-spectroscopy, spectral-reconstruction, inverse-problem-framing]
requires:
  [
    sequence-filter-function,
    cpmg,
    attenuation-function,
    power-spectral-density,
    gaussian-dephasing,
    dynamical-decoupling,
  ]
uses: [white-noise, hahn-echo, switching-function, random-telegraph-noise, charge-noise, overhauser-field, stationary-noise]
toc:
  sidebar: left
---

<style>
  .sec-divider {
    text-align: center;
    color: var(--global-theme-color);
    opacity: 0.6;
    letter-spacing: 0.6em;
    margin: 2.75rem 0 2rem;
    user-select: none;
  }
  .thread-note {
    --thread-color: #b3760a;
    border-left: 4px solid var(--thread-color);
    background: color-mix(in srgb, var(--thread-color) 8%, transparent);
    border-radius: 0 6px 6px 0;
    padding: 0.6rem 0.9rem;
    margin: 1.4rem 0;
    font-size: 0.95rem;
  }
  html[data-theme="dark"] .thread-note {
    --thread-color: #e0a63a;
  }
  .thread-note .thread-label {
    text-transform: uppercase;
    font-size: 0.7rem;
    letter-spacing: 0.09em;
    font-weight: 700;
    color: var(--thread-color);
    margin-right: 0.5rem;
  }
  .ledger-note {
    --ledger-color: #b3543f;
    border-left: 4px solid var(--ledger-color);
    background: color-mix(in srgb, var(--ledger-color) 8%, transparent);
    border-radius: 0 6px 6px 0;
    padding: 0.6rem 0.9rem;
    margin: 1.4rem 0;
    font-size: 0.95rem;
  }
  html[data-theme="dark"] .ledger-note {
    --ledger-color: #e0705a;
  }
  .ledger-note .ledger-label {
    text-transform: uppercase;
    font-size: 0.7rem;
    letter-spacing: 0.09em;
    font-weight: 700;
    color: var(--ledger-color);
    margin-right: 0.5rem;
  }
  .learn-more-box {
    border: 1.5px solid var(--global-theme-color);
    border-radius: 10px;
    background: color-mix(in srgb, var(--global-theme-color) 6%, transparent);
    margin: 1.5rem 0;
    overflow: hidden;
  }
  .learn-more-box > details > summary {
    cursor: pointer;
    padding: 0.7rem 1rem;
    font-weight: 600;
    color: var(--global-theme-color);
  }
  .learn-more-box > details > summary:hover {
    background: color-mix(in srgb, var(--global-theme-color) 10%, transparent);
  }
  .learn-more-box > details[open] > summary {
    border-bottom: 1px solid var(--global-divider-color);
  }
  .learn-more-box > details > *:not(summary) {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  .learn-more-box > details > summary + * {
    padding-top: 0.75rem;
  }
  .learn-more-box > details > *:not(summary):last-child {
    padding-bottom: 0.75rem;
  }
  .key-eq {
    border: 1.5px solid var(--global-theme-color);
    border-radius: 10px;
    background: color-mix(in srgb, var(--global-theme-color) 6%, transparent);
    padding: 0.4rem 1rem;
    margin: 1.5rem 0;
  }
</style>

## 1 · Reading the equation right to left

The last post ended by noticing something almost embarrassing. We had spent the whole post
using

$$
\chi(t) = \int_{-\infty}^{\infty}\frac{\mathrm{d}\omega}{2\pi}\, S(\omega)\, F(\omega,t)
$$

to predict decay from a spectrum we assumed we knew. But nobody knows $$S(\omega)$$. It is
not on a datasheet. It is a property of a particular device — this dot, this oxide, this
cooldown — and it changes when you fabricate the next one.

So read the equation the other way. On the left is $$\chi$$, which you *measure*: run the
sequence, watch the fringe contrast decay, take a logarithm. On the right is a filter
$$F(\omega,t)$$ that you *chose*, and that you know exactly, sitting against the one thing
you do not know. That is not a prediction problem. That is a measurement equation.

<p class="thread-note"><span class="thread-label">The through-line</span> The claim of this post: <strong>the decay curve is not a symptom, it is data.</strong> A qubit under dynamical decoupling is a tunable narrowband filter with a built-in detector — which is the definition of a spectrum analyser. The catch is that it is a bad one, and knowing precisely how it is bad is the difference between spectroscopy and self-deception.</p>

There is a reason this matters beyond tidiness. Every improvement to a spin qubit — a
different oxide, a new gate stack, a sweet spot in gate voltage, isotopic purification —
changes the noise. If all you can say is "$$T_2$$ got better," you are optimizing blind. If
you can say "the $$1/f$$ charge noise dropped by 6 dB but a fluctuator appeared at 400 kHz,"
you can go find the fluctuator. Noise spectroscopy is how device physics gets a feedback
loop.

<div class="sec-divider" aria-hidden="true">•••</div>

## 2 · The filter as a delta function

To turn the overlap integral into a measurement we need the filter to be *narrow*. If
$$F(\omega,t)$$ were a delta function at some frequency $$\omega_1$$, then $$\chi$$ would
return $$S(\omega_1)$$ and nothing else, and sliding $$\omega_1$$ would trace out the whole
spectrum point by point.

CPMG very nearly does this. Its switching function $$y(s)$$ is a square wave: $$n$$ pulses in
a time $$t$$ means it flips every $$\tau = t/n$$, so it is periodic with period $$2\tau$$ and
fundamental frequency

$$
\omega_1 = \frac{\pi}{\tau} = \frac{\pi n}{t} .
$$

A long periodic signal has a transform concentrated at its harmonics. So $$F(\omega,t)$$ is
not one delta but a **comb** of them, at $$\omega_1, 3\omega_1, 5\omega_1, \dots$$ — only odd
harmonics, because a symmetric square wave has no even ones — with weights falling off as
$$1/k^2$$. Working out those weights gives the central formula of noise spectroscopy:

<div id="result-noise-spectroscopy" class="key-eq" markdown="1">

$$
\chi(t) \;\simeq\; t \sum_{k \ \text{odd}} \frac{4}{k^2\pi^2}\, S(k\,\omega_1),
\qquad \omega_1 = \frac{\pi n}{t} .
$$

</div>

Keep only the fundamental — the $$k=1$$ term carries $$4/\pi^2 \approx 41\%$$ of the total
weight, more than all the harmonics combined — and invert:

<div class="key-eq" markdown="1">

$$
S(\omega_1) \;\approx\; \frac{\pi^2}{4}\,\frac{\chi(t)}{t} .
$$

</div>

That is the whole method. Measure a decay, get one number $$\chi$$, divide, and you have the
noise power at one frequency. Change $$n$$ or $$t$$, and you have moved the probe somewhere
else.

<div class="learn-more-box" markdown="0">
{% details Derivation: the harmonic comb, and where the 4/k²π² comes from %}
Expand the switching function as a complex Fourier series. For a symmetric square wave of
period $$2\tau$$ taking values $$\pm1$$,

$$
y(s) = \sum_{k} c_k\, e^{-i k \omega_1 s},
\qquad
c_k = \begin{cases} \dfrac{2}{i k \pi}, & k \ \text{odd},\\[4pt] 0, & k \ \text{even}.\end{cases}
$$

Then $$|c_k|^2 = 4/(k^2\pi^2)$$ for odd $$k$$, and as a check
$$\sum_k |c_k|^2 = \tfrac{8}{\pi^2}\sum_{k>0,\text{odd}} k^{-2} = \tfrac{8}{\pi^2}\cdot\tfrac{\pi^2}{8} = 1 = \langle y^2\rangle$$,
as Parseval demands.

Now transform over a window of duration $$t$$ containing many periods:

$$
\tilde y(\omega,t) = \sum_k c_k \int_0^t e^{i(\omega - k\omega_1)s}\,\mathrm{d}s .
$$

For large $$t$$ each term is sharply peaked at $$\omega = k\omega_1$$, and the standard
limit $$\left|\int_0^t e^{i\Delta s}\mathrm{d}s\right|^2 \to 2\pi t\,\delta(\Delta)$$ applies.
Cross terms between different harmonics oscillate away, so

$$
\left|\tilde y(\omega,t)\right|^2 \;\longrightarrow\; 2\pi t \sum_k |c_k|^2\, \delta(\omega - k\omega_1) .
$$

Substituting into $$\chi = \tfrac12\int \tfrac{\mathrm{d}\omega}{2\pi} S |\tilde y|^2$$ and
folding the $$\pm k$$ pairs together (S is even) gives the boxed comb formula.

**How good is it?** I checked the leading-order inversion against the exact filter integral
for several spectra. For $$1/f$$ noise it recovers $$S$$ to within a few percent once
$$n \gtrsim 4$$; for a Lorentzian it is good to about 1% by $$n = 8$$. The reason it works so
well is that the harmonics sit at $$3\omega_1, 5\omega_1,\dots$$ where a *falling* spectrum is
already small, so the term you keep is the term that matters.

The failure case is instructive, and it is exactly the case where the correction cannot be
small: for **white** noise, $$S(k\omega_1) = S_0$$ for every harmonic, so the full sum gives
$$\chi = S_0 t/2$$ (the undecouplable result of the last post) while the leading-order
inversion returns

$$
S_{\text{inferred}} = \frac{\pi^2}{4}\cdot\frac{S_0}{2} = \frac{\pi^2}{8}\,S_0 \approx 1.23\,S_0 ,
$$

overshooting by 23%. A flat spectrum is the worst case for a method that assumes the
harmonics do not matter.
{% enddetails %}
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

## 3 · The protocol

In practice you do not measure $$\chi$$ at one time and stop. You do this:

1. **Fix $$n$$.** Choose a pulse number.
2. **Sweep $$t$$** and record the decay $$W(t)$$. Fit it to find the coherence time
   $$T_2(n)$$ — the time at which $$W = 1/e$$, i.e. $$\chi = 1$$.
3. **Convert.** At that time, $$\chi = 1$$ by construction, so the formula above collapses to
   something with no free parameters at all:

   $$
   S\!\left(\frac{\pi n}{T_2}\right) \approx \frac{\pi^2}{4\,T_2}.
   $$

4. **Change $$n$$ and repeat.** More pulses push the probe frequency up; fewer bring it down.

Each pulse number contributes exactly one point of the spectrum, and the raw material is the
$$T_2$$-versus-$$n$$ curve — the same curve whose *slope* gave the power-law exponent in the
last post's third exercise. The scaling exponent was the crude version of this measurement;
this is the full one.

There is a pleasing self-consistency here. $$T_2$$ is defined by $$\chi = 1$$, so the
inferred noise power is just $$\pi^2/4T_2$$: a device that stays coherent for a long time is,
by definition, telling you the noise at that frequency is small. The physics is entirely in
*which* frequency each $$T_2$$ belongs to.

<div class="sec-divider" aria-hidden="true">•••</div>

## 4 · Play the inverse problem

Reading about an inverse problem is not the same as being stuck inside one. Below is a
device with a spectrum I am not going to show you. You have the same access an
experimentalist has: choose a pulse number, run the sequence, get a coherence time.

Run a few. Watch the points accumulate in the lower panel. Form a guess about the shape —
is it a straight line on log–log? does it have a shoulder? a bump? — and only then hit
reveal.

<div style="border:1px solid var(--global-divider-color);border-radius:8px;padding:1rem;margin:1.5rem 0;">
  <div id="sg1-mount"></div>
  <div style="display:flex;flex-wrap:wrap;gap:0.9rem;align-items:center;justify-content:center;margin-top:0.85rem;font-size:0.9rem;">
    <label style="display:flex;align-items:center;gap:0.5rem;">
      pulses n
      <input id="sg1-n" type="range" min="0" max="8" step="1" value="4">
      <span id="sg1-n-val" style="min-width:2.4em;font-variant-numeric:tabular-nums;">16</span>
    </label>
    <button id="sg1-run" type="button">▶ run experiment</button>
    <button id="sg1-sweep" type="button">run full sweep</button>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:0.4rem;align-items:center;justify-content:center;margin-top:0.55rem;font-size:0.9rem;">
    <button id="sg1-reveal" type="button">reveal the spectrum</button>
    <button id="sg1-new" type="button">new device</button>
    <button id="sg1-clear" type="button">clear points</button>
  </div>
  <p id="sg1-msg" style="font-size:0.85rem;opacity:0.85;text-align:center;margin:0.7rem 0 0;min-height:1.2em;"></p>
  <p style="font-size:0.85rem;opacity:0.8;max-width:37rem;margin:0.5rem auto 0;text-align:center;">
    A real inverse problem, not a simulation of one. Each T₂ is found by numerically solving
    χ(t) = 1 with the exact filter integral, so the systematic error of the leading-harmonic
    inversion is genuinely present in the scatter — nothing has been idealised away. Only the
    measurement noise on T₂ is synthetic. Top: the raw data you actually take. Bottom: the
    spectrum you infer from it, one point per pulse number.
  </p>
</div>

<script src="{{ '/assets/js/noise-filter-math.js' | relative_url }}"></script>
<script src="{{ '/assets/js/spectrometer-game.js' | relative_url }}"></script>
<script>
  (function () {
    var mount = document.getElementById("sg1-mount");
    if (!mount || typeof createSpectrometerGame !== "function") return;
    var g = createSpectrometerGame(mount, {});
    var NS = [1, 2, 4, 8, 16, 32, 64, 128, 256];
    var nS = document.getElementById("sg1-n"), nV = document.getElementById("sg1-n-val");
    var msg = document.getElementById("sg1-msg");
    function nOf() { return NS[+nS.value]; }
    ["sg1-run", "sg1-sweep", "sg1-reveal", "sg1-new", "sg1-clear"].forEach(function (id) {
      var b = document.getElementById(id);
      b.style.cssText =
        "cursor:pointer;padding:0.25rem 0.7rem;border-radius:6px;font-size:0.85rem;" +
        "border:1px solid " + (id === "sg1-run" ? "var(--global-theme-color)" : "var(--global-divider-color)") + ";" +
        "background:transparent;color:" + (id === "sg1-run" ? "var(--global-theme-color)" : "var(--global-text-color)") + ";";
    });
    nS.addEventListener("input", function () { nV.textContent = nOf(); });
    document.getElementById("sg1-run").addEventListener("click", function () {
      var p = g.run(nOf());
      msg.textContent = p
        ? "n = " + p.n + " → T₂ = " + p.T2.toFixed(1) + " μs, probing ω = " + p.w.toFixed(2) +
          " rad/μs, giving S = " + p.S.toExponential(2)
        : "no coherence time in range for that n";
    });
    document.getElementById("sg1-sweep").addEventListener("click", function () {
      g.sweep(); msg.textContent = "swept n = 2 … 128.";
    });
    document.getElementById("sg1-reveal").addEventListener("click", function () {
      g.reveal(true);
      msg.textContent = "this device was: " + g.deviceName() + " — " + g.deviceHint();
    });
    document.getElementById("sg1-new").addEventListener("click", function () {
      g.newDevice(); msg.textContent = "new device, spectrum hidden. Start measuring.";
    });
    document.getElementById("sg1-clear").addEventListener("click", function () {
      g.clear(); msg.textContent = "";
    });
  })();
</script>

A few things are worth hunting for deliberately.

**The straight line.** A pure $$1/f$$ spectrum gives points on a straight log–log line of
slope $$-1$$. This is the boring case and the most common one.

**The shoulder.** A single two-level fluctuator with correlation time $$\tau_c$$ gives a
Lorentzian: flat below $$1/\tau_c$$, falling as $$1/\omega^2$$ above. Finding the knee tells
you the switching rate of one defect in the device.

**The dip that is really a peak.** If a device has a spectral *line* — a narrow feature at
one frequency — then as you increase $$n$$ you will eventually slide the probe onto it, and
$$T_2$$ will suddenly get *worse* with more pulses. In the upper panel this looks like the
$$T_2$$-versus-$$n$$ curve turning over. More decoupling making things worse is not a
paradox; it means you have just tuned your filter onto a noise source you were previously
avoiding.

<div class="sec-divider" aria-hidden="true">•••</div>

## 5 · What the reconstruction assumes

A spectrum analyser you cannot trust is worse than none, so here is the bill.

**The filter is a comb, not a delta.** Everything you infer at $$\omega_1$$ is contaminated
by the true spectrum at $$3\omega_1, 5\omega_1, \dots$$. When $$S$$ falls off, this is a
few-percent effect. When $$S$$ is flat it is a 23% overshoot, as computed in §2. When the
spectrum has a sharp peak, a harmonic can hit the peak while the fundamental is nowhere near
it, and you will report noise at a frequency that has none. The systematic fix is to measure
at many $$n$$ and deconvolve the comb — this is what Álvarez and Suter's method does
{% cite alvarez2011measuring --file refs_spin_qubits %}, and it is why serious spectroscopy
never relies on a single pulse number.

**The band is limited at both ends.** The highest frequency you can reach is set by how fast
you can pulse; the lowest by how long the qubit stays coherent at all. Below $$\sim 1/T_2$$
there is simply no measurement. Slow drift is not measured, it is *calibrated away* — and if
you recalibrate the qubit frequency between runs, you have silently high-pass filtered your
own data.

**The noise is assumed Gaussian.** This is the big one. The entire chain —
$$W = e^{-\chi}$$, $$\chi$$ as a single overlap integral — rests on the second cumulant
being the whole story. A bath of many weak sources satisfies this. A device dominated by
*one* strong two-level fluctuator does not: its decay is not a simple exponential of an
overlap integral, coherence can partially revive, and feeding such a curve into the
inversion above yields a spectrum that is not wrong so much as meaningless — you have fitted
a two-parameter model to a phenomenon it cannot represent. Extending spectroscopy to
non-Gaussian baths means measuring higher-order spectra (polyspectra), which is an active
subject {% cite norris2016qubit --file refs_spin_qubits %}.

**The noise is assumed stationary and classical.** Stationary: the spectrum must not drift
while you spend hours collecting the sweep — often false, since $$1/f$$ noise by construction
has power at arbitrarily low frequency. Classical: the bath is a c-number field with no
back-action.

<p class="ledger-note"><span class="ledger-label">Assumptions ledger</span> That last one deserves to be stated as sharply as possible, because the whole series has been quietly relying on it. A <em>classical</em> spectrum obeys S(ω) = S(−ω). A <em>quantum</em> bath does not: emission and absorption differ by the detailed-balance factor e^{ℏω/k<sub>B</sub>T}, so the true spectrum is asymmetric, and the asymmetry is precisely what distinguishes a bath that can take energy from one that can give it. Pure dephasing is blind to the difference — the qubit exchanges no energy, so it samples only the symmetrised combination. So the object we have been reconstructing all post is not "the noise spectrum" but the classical, symmetrised shadow of one. Nothing here is wrong; it is just less than the truth, and the missing part is where Series B begins.</p>

<div class="sec-divider" aria-hidden="true">•••</div>

## 6 · The experiments this actually is

This is not a thought experiment. The method has been run on essentially every solid-state
qubit platform, and the results are what taught the field what its noise looks like.

Bylander and coauthors did it on a superconducting flux qubit, combining Ramsey, echo and
CPMG to reconstruct a spectrum across many decades and showing it was $$1/f$$ over most of
them {% cite bylander2011noise --file refs_spin_qubits %}. Álvarez and Suter formalised the
deconvolution of the harmonic comb {% cite alvarez2011measuring --file refs_spin_qubits %}.
And for spin qubits specifically, Medford and coauthors measured the $$T_2$$-versus-$$n$$
scaling in a GaAs double dot and inverted it to a power law, finding an Overhauser spectrum
falling roughly as $$\omega^{-2.6}$$ {% cite medford2012scaling --file refs_spin_qubits %} —
steep, which is the frequency-domain way of saying the nuclear bath is very slow, and
therefore the frequency-domain explanation for why echo works so well in GaAs.

Notice what has happened over these three posts. In the first, slow noise was the enemy that
made $$T_2^{\ast}$$ short. In the second, slowness was the property that made noise
*removable*. Here, slowness is a *number you can measure* — a spectral exponent extracted
from a scaling curve.

<p class="thread-note"><span class="thread-label">The through-line</span> The decay curve is data. And now that we can measure S(ω) rather than assume it, the obvious question is the one a materials physicist would have asked first: <em>what is actually making it?</em> Every feature in that spectrum — the 1/f slope, the Lorentzian shoulder, the line at one frequency — is a physical object inside the device. Next post: reading the spectrum as a list of suspects.</p>

<div class="sec-divider" aria-hidden="true">•••</div>

## 7 · Exercises

**Exercise 1 — the inversion constant.** Derive $$S(\omega_1) \approx \pi^2\chi/(4t)$$ from
the comb formula, and explain why the numerical factor is $$\pi^2/4$$ rather than 1.

<div class="learn-more-box" markdown="0">
{% details Solution %}
The comb formula is $$\chi(t) = t\sum_{k\,\text{odd}} \tfrac{4}{k^2\pi^2} S(k\omega_1)$$.
Keeping only $$k=1$$,

$$
\chi(t) \approx \frac{4t}{\pi^2}\,S(\omega_1)
\quad\Longrightarrow\quad
S(\omega_1) \approx \frac{\pi^2}{4}\frac{\chi(t)}{t} .
$$

The factor is not 1 because the fundamental does not carry all of the switching function's
power. Parseval fixes the total at $$\sum_k|c_k|^2 = 1$$, and the fundamental's share is
$$2\times\tfrac{4}{\pi^2}\cdot\tfrac{1}{2}$$ — that is, $$4/\pi^2 \approx 0.405$$. So the
fundamental sees only about 40% of the qubit's total sensitivity, and dividing by that share
is what the $$\pi^2/4 \approx 2.47$$ does. The rest of the sensitivity is spread over the odd
harmonics, and pretending it is not there is exactly the systematic error discussed in §5.
{% enddetails %}
</div>

**Exercise 2 — what a Lorentzian looks like coming out.** A device has one fluctuator:
$$S(\omega) = 2\sigma^2\tau_c/(1+\omega^2\tau_c^2)$$. Sketch what the reconstructed points
look like on log–log axes, and say how you would read $$\sigma$$ and $$\tau_c$$ off them.

<div class="learn-more-box" markdown="0">
{% details Solution %}
Two regimes joined by a knee.

For $$\omega \ll 1/\tau_c$$ the spectrum is flat at $$S \to 2\sigma^2\tau_c$$ — a horizontal
line on log–log. For $$\omega \gg 1/\tau_c$$ it falls as $$2\sigma^2/(\omega^2\tau_c)$$ — a
straight line of slope $$-2$$. The two asymptotes cross at $$\omega = 1/\tau_c$$.

So: **the knee frequency gives $$\tau_c$$ directly**, and **the height of the plateau gives
$$2\sigma^2\tau_c$$**, from which $$\sigma$$ follows once you have $$\tau_c$$. You have
measured both the coupling strength and the switching rate of a single defect, without ever
observing the defect.

Two practical cautions. If $$1/\tau_c$$ lies below your lowest accessible frequency
($$\sim 1/T_2$$) you will only ever see the flat part, and the fluctuator will be
indistinguishable from white noise in your band. If it lies above your fastest pulsing, you
see only the plateau's tail and it looks like an ordinary $$1/\omega^2$$ background. A
fluctuator is only identifiable *as* a fluctuator if its knee lands inside your window —
which is a good argument for widening the window rather than taking more data inside it.
{% enddetails %}
</div>

**Exercise 3 — the trap.** A colleague reports a beautifully flat reconstructed spectrum and
concludes the device is limited by white noise. From the material in §2 and §5, give two
distinct reasons this conclusion might be wrong, and propose a measurement that
distinguishes them.

<div class="learn-more-box" markdown="0">
{% details Solution %}
**Reason one — harmonic leakage on a real but non-flat spectrum.** The inversion assigns all
the decay to $$\omega_1$$ when part of it came from $$3\omega_1, 5\omega_1,\dots$$. This
systematically drags inferred points toward the value at higher frequencies, flattening any
true slope. A genuinely steep spectrum measured carelessly looks flatter than it is.

**Reason two — the spectrum may not exist in the sense assumed.** If the device is dominated
by one strong fluctuator, the noise is non-Gaussian, $$W = e^{-\chi}$$ is not the right
model, and the numbers coming out of the inversion are fit parameters of a wrong model
rather than measurements of anything. Such data can easily look featureless.

**The distinguishing measurement.** These predict different things beyond the reconstruction
itself, so test the *model*, not the spectrum:

- Check the **decay shape**. White noise predicts a strictly exponential $$W(t)$$ at every
  $$n$$. Harmonic-flattened coloured noise does not; a strong fluctuator gives distinctly
  non-exponential decay, sometimes with partial revivals — a signature no Gaussian model can
  produce.
- Check the **$$T_2$$-versus-$$n$$ scaling**. Genuine white noise gives
  $$T_2 = 2/S_0$$, *independent of $$n$$* — the undecouplable result. If $$T_2$$ improves at
  all with pulse number, the noise is not white, whatever the reconstruction says. This is
  the cleanest test, it uses data already in hand, and it needs no inversion.
- If a fluctuator is suspected, look for **telegraph switching directly**: repeat the same
  measurement many times and histogram the outcomes. A Gaussian bath gives a unimodal
  histogram; a single dominant fluctuator gives a bimodal one.

The moral is that the reconstruction cannot validate its own assumptions. The check always
lives outside it.
{% enddetails %}
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

## References

The review to read on all of this is
{% cite szankowski2017environmental --file refs_spin_qubits %} — it covers the comb
formalism, the deconvolution problem, and the non-Gaussian extensions in one place, and it is
the backbone of this post. The filter-function machinery it builds on is
{% cite cywinski2008how --file refs_spin_qubits %}. For the founding experiments see
{% cite bylander2011noise alvarez2011measuring --file refs_spin_qubits %}, and for the spin
qubit case specifically {% cite medford2012scaling --file refs_spin_qubits %}. On what breaks
when the bath is not Gaussian, {% cite norris2016qubit --file refs_spin_qubits %} is the entry
point.

{% bibliography --file refs_spin_qubits --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public post: I write these to teach myself the physics behind my PhD, with
> **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
{: .block-tip }

<script src="{{ '/assets/js/equation-numbers.js' | relative_url }}"></script>
