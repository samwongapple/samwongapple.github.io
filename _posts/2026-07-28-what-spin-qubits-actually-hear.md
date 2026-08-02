---
layout: post
title: "What Spin Qubits Actually Hear"
date: 2026-07-28 20:00:00-0700
description: Every feature of a noise spectrum has a microscopic owner — a nuclear bath, a defect switching in an oxide, a whole ensemble of them. Reading the curve as a list of suspects, and the one suspect that classical noise cannot describe.
tags: [quantum-computing, spin-qubits, decoherence, materials]
categories: [spin-qubits]
related_posts: false
provides: [hyperfine-bath, charge-noise, one-over-f, two-level-fluctuator, sweet-spot, isotopic-purification]
requires:
  [
    power-spectral-density,
    noise-spectroscopy,
    sequence-filter-function,
    hahn-echo,
    ornstein-uhlenbeck-noise,
  ]
uses:
  [
    overhauser-field,
    quasistatic-noise,
    t2-star-as-spread,
    random-telegraph-noise,
    motional-narrowing,
    cpmg,
    dynamical-decoupling,
    gaussian-dephasing,
  ]
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

## 1 · A curve is a list of suspects

Three posts ago the noise was an anonymous nuisance. Two posts ago it became a spectrum we
could filter against. Last post it became a spectrum we could *measure*. So we now have, for
any given device, a curve $$S(\omega)$$ — and a curve is not an explanation.

This post is about the last step: reading that curve as evidence. Every feature in it — the
slope, a shoulder, a line at one frequency — is made by a physical object sitting inside the
device. Learning which object makes which feature is what turns noise spectroscopy from a
diagnostic into an engineering tool, because objects can be removed.

<p class="thread-note"><span class="thread-label">The through-line</span> The claim: <strong>the noise spectrum is device physics.</strong> Not an abstract stochastic process — a bath of nuclear spins with a known isotope fraction, a defect in an oxide with a thermally activated switching rate. The spectral shape is the fingerprint that identifies which.</p>

For spin qubits there are two dominant suspects, and — pleasingly — they are the same two
enemies named at the end of the first post in this series. It just took three posts to learn
to hear them apart.

<div class="sec-divider" aria-hidden="true">•••</div>

## 2 · The nuclear bath

The electron sits in a semiconductor, and semiconductors are made of atoms whose nuclei may
carry spin. The electron's wavefunction overlaps $$N \sim 10^4$$–$$10^6$$ of them, and the
contact hyperfine interaction couples it to every one:

$$
H_{\text{hf}} = \sum_{k} A_k\, \mathbf{S}\cdot\mathbf{I}_k .
$$

Along the quantization axis this is exactly the pure-dephasing coupling we have been using
all series: the nuclei produce an effective magnetic field — the **Overhauser field** — that
adds to the applied one and shifts the qubit frequency by
$$\beta = \sum_k A_k I_k^z / \hbar$$.

Two facts about that sum decide everything.

**It is Gaussian, with a width set by $$1/\sqrt{N}$$.** The nuclei are essentially unpolarized
and uncorrelated, so $$\beta$$ is a sum of many small random contributions: the central limit
theorem applies, exactly as Merkulov, Efros and Rosen worked out
{% cite merkulov2002electron --file refs_spin_qubits %}. The individual couplings $$A_k$$ are
tiny, but there are $$N$$ of them adding in quadrature, so the width goes as
$$\sqrt{N}\times A \sim A_{\text{tot}}/\sqrt{N}$$ — suppressed by $$\sqrt{N}$$ relative to a
fully polarized bath, but nowhere near zero.

**It is slow.** The Overhauser field changes only when nuclei flip, and nuclei are heavy,
weakly coupled and far off-resonance from the electron. The relevant dynamics — nuclear
dipole–dipole flip-flops — take milliseconds. Compare that with a Ramsey shot lasting
nanoseconds and the conclusion is immediate: **frozen within a shot, redrawn between shots.**
That is the definition of quasistatic noise, and it is why the very first post's Gaussian
$$T_2^{\ast}$$ analysis described GaAs so well.

In spectral language: the nuclear bath is an enormous amount of power crammed into a very
narrow band near $$\omega = 0$$. It is the worst possible noise for free evolution, whose
filter peaks at DC — and the best possible noise for an echo, whose filter has an exact zero
there. Hence the ×100 echo gain of the second post. The nuclear bath is loud, but it is loud
in exactly the place we know how to be deaf.

<div class="learn-more-box" markdown="0">
{% details Derivation: why isotopic purification is such a good deal %}
Let each nucleus contribute a coupling of order $$A$$, and let a fraction $$f$$ of lattice
sites carry a spin at all. If the electron wavefunction covers $$N_{\text{sites}}$$ sites,
the number of *active* nuclei is $$N = f N_{\text{sites}}$$.

Adding $$N$$ independent random contributions in quadrature gives a frequency spread

$$
\sigma \;\propto\; A\sqrt{N} \;=\; A\sqrt{f\,N_{\text{sites}}}
\qquad\Longrightarrow\qquad
T_2^{\ast} = \frac{\sqrt{2}}{\sigma} \;\propto\; \frac{1}{\sqrt{f}} .
$$

Now put in isotope fractions. In GaAs, *every* isotope of Ga and As has nuclear spin, so
$$f = 1$$ — there is no escape by purification, which is the fundamental reason the field
moved away from GaAs. In natural silicon only $$^{29}$$Si carries spin, at
$$f = 4.7\%$$, giving $$1/\sqrt{f} \approx 4.6$$ — and indeed
$$T_2^{\ast}$$ goes from ~10 ns to ~1 μs, rather more than 4.6× because the hyperfine
coupling in Si is also intrinsically weaker than in GaAs.

Isotopic purification pushes $$f$$ down to $$0.08\%$$ or below. Relative to natural Si that is
another $$\sqrt{0.047/0.0008} \approx 7.7$$, and relative to a spinful host it is enormous.
Purified $$^{28}$$Si reaches $$T_2^{\ast}$$ of tens to hundreds of microseconds
{% cite veldhorst2015two muhonen2014storing --file refs_spin_qubits %}.

The scaling is only $$1/\sqrt{f}$$, which sounds weak — but $$f$$ can be changed by three
orders of magnitude by a centrifuge, and no operation on the qubit itself buys anything
comparable. It is the single highest-leverage materials decision in the field.

And it has a limit worth stating: as $$f \to 0$$ the nuclear contribution vanishes and
something else takes over. That something else is the subject of the next section, and it
does not go away when you purify.
{% enddetails %}
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

## 3 · Charge noise, and where 1/f comes from

Purify the silicon and the qubit keeps dephasing. The reason is the irony the first post
ended on: everything that made the spin *controllable* — EDSR, exchange, the electric knob on
detuning — coupled it to electric fields, and electric fields in a real device are not quiet.

The microscopic culprit is a **two-level fluctuator**: some defect — a trapped charge at an
interface, a dangling bond, an impurity with two configurations — that switches back and
forth between two states, randomly, at some rate $$\gamma$$. Each switch shifts the local
electrostatic potential, which shifts the dot, which shifts the qubit frequency.

One such fluctuator produces **random telegraph noise**, and its spectrum is a Lorentzian:

$$
S_{\text{TLF}}(\omega) = \frac{2\sigma^2 \gamma}{\gamma^2 + \omega^2} ,
$$

flat below the switching rate and falling as $$1/\omega^2$$ above it — exactly the
Ornstein–Uhlenbeck shape from the first post, with $$\tau_c = 1/\gamma$$. So a single defect
announces itself in the spectrum as a knee, and the knee's position *is* its switching rate.
This is the "shoulder" you could hunt for in the last post's game.

But measured devices rarely show one clean Lorentzian. They show $$1/f$$ — a featureless
power law running over many decades, the same shape found in essentially every solid-state
system anyone has ever measured {% cite dutta1981low paladino2014noise --file refs_spin_qubits %}.
Where does a scale-free curve come from, when the ingredients each have a scale?

The answer is one of the prettiest arguments in condensed matter, and it is short.

<div id="result-one-over-f" class="key-eq" markdown="1">

A collection of fluctuators whose switching rates are spread **uniformly in
$$\log\gamma$$** produces a $$1/\omega$$ spectrum — with no fine tuning.

</div>

<div class="learn-more-box" markdown="0">
{% details Derivation: summing Lorentzians into a power law (Dutta–Horn) %}
Take an ensemble of fluctuators with a distribution $$P(\gamma)$$ of switching rates, each
contributing its own Lorentzian. The total spectrum is the sum:

$$
S(\omega) = \int \mathrm{d}\gamma\; P(\gamma)\;\frac{2\sigma^2\gamma}{\gamma^2 + \omega^2}.
$$

Now suppose the rates are distributed **log-uniformly** — equal numbers per decade — over a
wide range $$[\gamma_1, \gamma_2]$$, i.e. $$P(\gamma) \propto 1/\gamma$$. The $$\gamma$$ in
the numerator cancels against the $$1/\gamma$$ in the measure, and the integral becomes
elementary:

$$
S(\omega) \propto \int_{\gamma_1}^{\gamma_2}\frac{2\sigma^2\,\mathrm{d}\gamma}{\gamma^2+\omega^2}
= \frac{2\sigma^2}{\omega}\left[\arctan\frac{\gamma}{\omega}\right]_{\gamma_1}^{\gamma_2} .
$$

For any $$\omega$$ comfortably inside the range, $$\gamma_1 \ll \omega \ll \gamma_2$$, the
bracket goes to $$\pi/2 - 0$$ and

$$
S(\omega) \;\simeq\; \frac{\pi\sigma^2}{\omega} .
$$

Exactly $$1/f$$, over the whole range of rates present, with the power law emerging from
ingredients none of which has a power law. (I checked this numerically with 400 Lorentzians
spread log-uniformly over six decades: $$\omega S(\omega)$$ is constant to better than 7%
across four decades in between.)

**Why would rates be log-uniform?** Because they are usually thermally activated:

$$
\gamma = \gamma_0\, e^{-E_a / k_B T} ,
$$

so $$\log\gamma$$ is linear in the activation energy $$E_a$$. A disordered material has
defects with a broad, roughly *uniform* spread of barrier heights — nothing special, just
disorder — and a uniform distribution of $$E_a$$ is precisely a log-uniform distribution of
$$\gamma$$. The ubiquity of $$1/f$$ noise is the ubiquity of disorder.

This also predicts something testable: heating the device shifts every rate, sliding the
whole distribution and changing where $$1/f$$ holds. Temperature-dependent noise
spectroscopy is a standard way to confirm the mechanism.
{% enddetails %}
</div>

Two consequences matter for qubits. First, $$1/f$$ has **no correlation time** — it is not
quasistatic, and not fast either; it has power at every timescale you can measure. So an echo
helps, but far less dramatically than against a nuclear bath. Second, $$1/f$$ formally
diverges at low frequency, which is not a catastrophe but a statement about experiments: the
lowest frequency that matters is set by how long you run before recalibrating. Slow drift is
not decoherence you suffer, it is drift you correct — provided you know it is there.

<div class="sec-divider" aria-hidden="true">•••</div>

## 4 · Four devices, one calculation

Now put the suspects together. Below you can compose a bath from these ingredients and see
what coherence times it implies — every number obtained by solving $$\chi(T_2) = 1$$ with the
exact filter integral of the previous two posts.

The presets are the four platforms this series keeps mentioning. Start by clicking through
them and watching one number: the **echo gain**, $$T_2 / T_2^{\ast}$$.

<div style="border:1px solid var(--global-divider-color);border-radius:8px;padding:1rem;margin:1.5rem 0;">
  <div id="bb1-mount"></div>
  <div style="display:flex;flex-wrap:wrap;gap:0.4rem;align-items:center;justify-content:center;margin-top:0.85rem;font-size:0.9rem;">
    <span style="opacity:0.75;">platform:</span>
    <button class="bb1-p" data-p="gaas" type="button">GaAs</button>
    <button class="bb1-p" data-p="sinat" type="button">natural Si</button>
    <button class="bb1-p" data-p="si28" type="button">purified ²⁸Si</button>
    <button class="bb1-p" data-p="gehole" type="button">Ge hole</button>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:1rem;align-items:center;justify-content:center;margin-top:0.7rem;font-size:0.88rem;">
    <label style="display:flex;align-items:center;gap:0.4rem;">
      nuclear
      <input id="bb1-nuc" type="range" min="-2" max="2.4" step="0.05" value="2.15">
    </label>
    <label style="display:flex;align-items:center;gap:0.4rem;">
      1/f charge
      <input id="bb1-of" type="range" min="-8" max="-1.5" step="0.05" value="-8">
    </label>
    <label style="display:flex;align-items:center;gap:0.4rem;">
      fluctuator
      <input id="bb1-tlf" type="range" min="-3" max="1" step="0.05" value="-3">
    </label>
    <label style="display:flex;align-items:center;gap:0.4rem;">
      its rate γ
      <input id="bb1-rate" type="range" min="-2" max="2" step="0.05" value="-0.3">
    </label>
  </div>
  <p id="bb1-msg" style="font-size:0.85rem;opacity:0.85;text-align:center;margin:0.7rem 0 0;min-height:1.2em;"></p>
  <p style="font-size:0.85rem;opacity:0.8;max-width:37rem;margin:0.4rem auto 0;text-align:center;">
    Every bar is computed, not tabulated: T₂ is found by numerically solving χ(T₂) = 1 with
    the exact filter functions, for each sequence, from whatever spectrum the sliders
    currently describe. The presets are order-of-magnitude device models tuned so their T₂*
    and echo times land near published values — they are illustrations of the physics, not
    fits to a particular device.
  </p>
</div>

<script src="{{ '/assets/js/noise-filter-math.js' | relative_url }}"></script>
<script src="{{ '/assets/js/build-a-bath.js' | relative_url }}"></script>
<script>
  (function () {
    var mount = document.getElementById("bb1-mount");
    if (!mount || typeof createBuildABath !== "function") return;
    var bb = createBuildABath(mount, { preset: "gaas" });
    var msg = document.getElementById("bb1-msg");
    var btns = [].slice.call(document.querySelectorAll(".bb1-p"));
    function paint(active) {
      btns.forEach(function (b) {
        var on = b.getAttribute("data-p") === active;
        b.style.cssText =
          "cursor:pointer;padding:0.22rem 0.6rem;border-radius:6px;font-size:0.85rem;" +
          "border:1px solid " + (on ? "var(--global-theme-color)" : "var(--global-divider-color)") + ";" +
          "background:transparent;color:" + (on ? "var(--global-theme-color)" : "var(--global-text-color)") + ";" +
          "font-weight:" + (on ? "700" : "400") + ";";
      });
    }
    var sN = document.getElementById("bb1-nuc"), sF = document.getElementById("bb1-of");
    var sT = document.getElementById("bb1-tlf"), sR = document.getElementById("bb1-rate");
    function syncSliders() {
      sN.value = bb.get("nucSigma") > 0 ? Math.log10(bb.get("nucSigma")) : -2;
      sF.value = bb.get("oneOverF") > 0 ? Math.log10(bb.get("oneOverF")) : -8;
      sT.value = bb.get("tlfSigma") > 0 ? Math.log10(bb.get("tlfSigma")) : -3;
      sR.value = Math.log10(1 / bb.get("tlfTau"));
    }
    function say() {
      msg.textContent = bb.presetName() + " — " + bb.presetBlurb();
    }
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-p");
        bb.setPreset(k); paint(k); syncSliders(); say();
      });
    });
    paint("gaas"); syncSliders(); say();
    function wire(el, key, xform) {
      el.addEventListener("input", function () {
        bb.set(key, xform(+el.value)); paint(""); say();
      });
    }
    wire(sN, "nucSigma", function (v) { return v <= -2 ? 0 : Math.pow(10, v); });
    wire(sF, "oneOverF", function (v) { return v <= -8 ? 0 : Math.pow(10, v); });
    wire(sT, "tlfSigma", function (v) { return v <= -3 ? 0 : Math.pow(10, v); });
    wire(sR, "tlfTau", function (v) { return 1 / Math.pow(10, v); });
  })();
</script>

The echo gain is a *diagnostic*, and this is the practical payoff of the whole series:

- **GaAs** — gain of order a hundred. Almost all the noise is quasistatic nuclear, and the
  echo's zero at DC removes almost all of it {% cite petta2005coherent bluhm2011dephasing --file refs_spin_qubits %}.
- **Natural Si** — a gain of tens. Same mechanism, weaker bath.
- **Purified $$^{28}$$Si** — the gain drops to single digits. Not because the echo got worse,
  but because what remains after purification is charge noise, which is not quasistatic. The
  echo can only refocus what stays still {% cite yoneda2018quantum --file refs_spin_qubits %}.
- **Ge hole qubit** — the smallest gain of all. Strong spin–orbit coupling makes these qubits
  fast and all-electrically controllable with no micromagnet, and hands them the electrical
  environment in full.

So a single ratio, measured in an afternoon, tells you which suspect you are dealing with
before you reconstruct anything. **A large echo gain means your noise is slow — nuclear. A
small one means it is broadband — electrical.**

<p class="thread-note"><span class="thread-label">The through-line</span> Same series, four devices, one calculation. The spectrum is device physics: change the isotope and the low-frequency mountain shrinks; change the confinement and the electrical background moves. The filter formalism turns those material facts into coherence times without any new theory.</p>

<div class="sec-divider" aria-hidden="true">•••</div>

## 5 · Sweet spots: turning down the coupling

There is a third option beyond "remove the noise" and "filter it out": arrange for the qubit
not to care.

The qubit frequency depends on some control parameter $$\varepsilon$$ — a gate voltage, a
detuning. Noise on that parameter becomes noise on the frequency through the derivative:

$$
\beta(t) = \frac{\partial \Omega}{\partial \varepsilon}\,\delta\varepsilon(t) .
$$

So operate where that derivative vanishes. At such a **sweet spot** the qubit is
first-order insensitive to its dominant noise source, and only the (much smaller) second-order
term survives {% cite burkard2023semiconductor --file refs_spin_qubits %}. This is not a spin
qubit invention — it is the same idea as the transmon's flux sweet spot, and it is one of the
most reliable free lunches in the business.

It is not entirely free, of course, and the cost is the tension this whole series opened with.
$$\partial\Omega/\partial\varepsilon$$ is *also* the lever you use to control the qubit. Making
it zero makes the qubit deaf to noise on $$\varepsilon$$ and simultaneously deaf to your
control on $$\varepsilon$$. Real operation therefore means moving between an idling sweet spot
and an operating point with real susceptibility — isolation and control, once again, as one
knob turned opposite ways.

This is where noise spectroscopy stops being descriptive and becomes design input: knowing
$$S(\omega)$$ and knowing the device's susceptibility landscape lets you *compute* where to
operate, which is exactly the programme of computer-assisted design for hole spin qubits
{% cite ciocoiu2022towards --file refs_spin_qubits %}.

<div class="sec-divider" aria-hidden="true">•••</div>

## 6 · The suspect that does not fit

Everything above rests on a picture we have never once questioned in this series: the
environment is a **classical random field** $$\beta(t)$$, drawn from a stationary
distribution, entirely described by its spectrum, and utterly indifferent to what the qubit
does.

The nuclear bath is not that.

It is a quantum system — $$10^5$$ spins with their own Hamiltonian and their own dynamics,
coupled to the electron by $$\sum_k A_k \mathbf{S}\cdot\mathbf{I}_k$$, an interaction that
runs in *both directions*. The electron does not merely listen to the nuclei; it acts on
them. The two become entangled. And the consequences are visible in things the classical
theory cannot reproduce, worked out in detail by Coish and Loss
{% cite coish2004hyperfine --file refs_spin_qubits %}:

- **Free-induction decay is not exponential**, and not Gaussian either. The long-time
  behaviour carries a power-law tail — a decay law no single $$S(\omega)$$ inserted into
  $$W = e^{-\chi}$$ produces.
- **The decay depends on how the bath was prepared**, not just on its spectrum. Narrow the
  Overhauser distribution by preparing the nuclei and the qubit's coherence improves — the
  bath has a *state*, not merely statistics.
- **Coherence can partially revive.** Information that has leaked into the environment can
  come back. A monotone decay function like $$e^{-\chi(t)}$$ with $$\chi$$ increasing simply
  cannot do this.

<p class="ledger-note"><span class="ledger-label">Assumptions ledger — the reckoning</span> Every post in this series has carried the same entry: β(t) is classical, with no back-action and no qubit–environment entanglement. We flagged it in post one, carried it through the filter formalism, and admitted in post three that pure dephasing can only ever see the symmetrised, classical shadow of a real bath's spectrum. Now the bill comes due. The classical picture is not a simplification of the quantum one — it is a <em>projection</em> of it, and the discarded part contains memory: the bath remembers what the qubit did to it. Nothing in this series is wrong within its domain. But its domain has an edge, and we have just walked up to it.</p>

<p class="thread-note"><span class="thread-label">The through-line</span> Series A's worldview in one sentence: noise is a classical field, a pulse sequence is a filter, and everything worth knowing is in S(ω). It has taken us from "why does a qubit forget" to "which defect is responsible" — a genuinely long way. The next question is the one it cannot answer: what if the environment is not a signal being broadcast <em>at</em> the qubit, but a quantum system entangled <em>with</em> it, keeping a record of what happened?</p>

That question needs a different object than a spectrum. Series B starts there.

<div class="sec-divider" aria-hidden="true">•••</div>

## 7 · Exercises

**Exercise 1 — the purification ledger.** A natural-silicon device
($$f = 4.7\%$$) has $$T_2^{\ast} = 1\,\mu\text{s}$$, limited entirely by $$^{29}$$Si. It is
rebuilt in $$^{28}$$Si purified to $$f = 0.01\%$$. Estimate the new $$T_2^{\ast}$$ from the
nuclear bath alone. The measured value comes out around $$100\,\mu\text{s}$$ — what does the
discrepancy tell you?

<div class="learn-more-box" markdown="0">
{% details Solution %}
From $$T_2^{\ast} \propto 1/\sqrt{f}$$,

$$
T_2^{\ast}(0.01\%) = 1\,\mu\text{s} \times \sqrt{\frac{4.7}{0.01}}
= 1\,\mu\text{s}\times\sqrt{470} \approx 22\,\mu\text{s}.
$$

So the nuclear bath alone predicts about 20 μs — and the device measures roughly 100 μs.
The measurement is *better* than the prediction, which at first looks like good news and is
actually just a sign the estimate was crude (the residual $$^{29}$$Si may be further
suppressed, the dot may be larger, and the hyperfine coupling in Si is weak).

The important question is the one that comes next: purify by another factor of ten and the
nuclear prediction improves to ~70 μs, but the *measured* $$T_2^{\ast}$$ will not follow it
down indefinitely. It saturates. Once the nuclear contribution drops below the charge-noise
contribution, further purification buys nothing at all, because the two add in quadrature:

$$
\frac{1}{(T_2^{\ast})^2} = \frac{1}{(T_2^{\ast})^2_{\text{nuc}}} + \frac{1}{(T_2^{\ast})^2_{\text{charge}}} .
$$

That crossover is exactly where the field now sits, and it is why effort has shifted from
isotopes to interfaces: the limiting suspect changed identity.
{% enddetails %}
</div>

**Exercise 2 — reading a knee.** A spectroscopy measurement shows a flat spectrum below
$$\omega \approx 2\times10^5\,\text{s}^{-1}$$ and a $$1/\omega^2$$ falloff above it, with a
plateau height $$S_0 = 4\times10^{-6}\,\text{s}^{-1}$$. Identify the source and extract its
parameters.

<div class="learn-more-box" markdown="0">
{% details Solution %}
Flat-then-$$1/\omega^2$$ is a Lorentzian, so this is a **single two-level fluctuator**, not a
$$1/f$$ ensemble (which would be a straight line of slope $$-1$$ throughout, with no knee).

The knee sits at $$\omega = \gamma$$, so the switching rate is

$$
\gamma \approx 2\times 10^{5}\,\text{s}^{-1},
\qquad \tau_c = 1/\gamma \approx 5\ \mu\text{s}.
$$

The plateau height is $$S(0) = 2\sigma^2/\gamma$$, giving the coupling strength

$$
\sigma = \sqrt{\tfrac{1}{2}S_0\,\gamma} = \sqrt{\tfrac12 \times 4\times10^{-6}\times 2\times10^5}
= \sqrt{0.4} \approx 0.63\ \text{rad/s} .
$$

So: one defect, switching about 200,000 times a second, shifting the qubit frequency by
roughly 0.6 rad/s when it does. You have characterised a single atomic-scale object using a
qubit as the instrument — which is worth pausing on.

Practical follow-up: since $$\gamma$$ is thermally activated, warming the device should move
the knee to higher frequency, confirming the identification. And because a fluctuator's
Lorentzian is *narrow*, CPMG with its passband parked above $$\gamma$$ will suppress it
efficiently — this is a suspect you can both identify and evade.
{% enddetails %}
</div>

**Exercise 3 — the diagnostic.** Two devices both report
$$T_2^{\ast} = 2\,\mu\text{s}$$. Device A has a Hahn-echo $$T_2 = 200\,\mu\text{s}$$; device B
has $$T_2 = 6\,\mu\text{s}$$. Without any spectroscopy, say what limits each, and predict
which benefits more from CPMG and which from better materials.

<div class="learn-more-box" markdown="0">
{% details Solution %}
The echo gain is the diagnostic: ×100 for A, ×3 for B.

**Device A** is dominated by noise that is essentially frozen on the scale of $$T_2$$ —
almost all its spectral weight sits near DC, where the echo has an exact zero. That is the
signature of a **quasistatic nuclear bath**. Prediction: CPMG keeps helping as $$n$$ grows
(the filter keeps sliding up, away from a steeply falling spectrum), so A should show a
strong $$T_2 \propto n^{\alpha/(\alpha+1)}$$ scaling with a large $$\alpha$$.

**Device B** has noise with substantial power spread across the band the echo is still
sensitive to — broadband, no single slow scale. That is the signature of **charge noise**,
$$1/f$$-like. Prediction: CPMG helps, but weakly ($$\alpha \approx 1$$ gives only
$$n^{1/2}$$), and the returns diminish.

**What to do about each.** A is nuclear-limited, so the highest-leverage fix is *materials* —
isotopic purification attacks the source directly, and A also happens to respond well to
pulses in the meantime. B is charge-limited, so purification would do nothing at all; B needs
better interfaces, a cleaner oxide, or operation at a sweet spot — and a fabrication change,
not a pulse sequence.

The general moral of the series in one line: **the echo gain tells you whether your problem
is a materials problem or a control problem**, and it costs one extra pulse to find out.
{% enddetails %}
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

## References

For the nuclear bath, {% cite merkulov2002electron --file refs_spin_qubits %} is the original
statistical treatment and {% cite coish2004hyperfine --file refs_spin_qubits %} is where the
quantum-bath features of §6 are worked out. On $$1/f$$ noise,
{% cite dutta1981low --file refs_spin_qubits %} is the classic review of the
sum-of-Lorentzians mechanism and {% cite paladino2014noise --file refs_spin_qubits %} is the
modern one aimed at qubits. For measurements on real devices see
{% cite bluhm2011dephasing --file refs_spin_qubits %} (GaAs echo and the nuclear bath),
{% cite yoneda2018quantum --file refs_spin_qubits %} (a purified-Si qubit limited by charge
noise) and {% cite connors2022charge --file refs_spin_qubits %} (charge-noise spectroscopy in
Si/SiGe). The broad review tying the materials story together is
{% cite burkard2023semiconductor --file refs_spin_qubits %}.

{% bibliography --file refs_spin_qubits --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public post: I write these to teach myself the physics behind my PhD, with
> **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
{: .block-tip }

<script src="{{ '/assets/js/equation-numbers.js' | relative_url }}"></script>
