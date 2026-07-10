---
layout: post
title: "Why Your Qubit Forgets: Dephasing from First Principles"
date: 2026-07-08 03:00:00-0700
description: T2* is not a decay rate — it is a shot-to-shot spread easily mistaken for one. Random signals, the Gaussian machinery, and why the shape of the decay is your first piece of noise spectroscopy.
tags: [quantum-computing, spin-qubits, decoherence]
categories: [spin-qubits]
related_posts: false
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
    --thread-color: #b3760a; /* amber — the series' 'narrative thread' colour */
    border-left: 4px solid var(--thread-color);
    background: color-mix(in srgb, var(--thread-color) 8%, transparent);
    border-radius: 0 6px 6px 0;
    padding: 0.6rem 0.9rem;
    margin: 1.4rem 0;
    font-size: 0.95rem;
  }
  html[data-theme="dark"] .thread-note {
    --thread-color: #e0a63a; /* brighter amber for dark backgrounds */
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
    --ledger-color: #b3543f; /* muted brick red — assumptions we owe an account of */
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

## 1 · Why dephasing is the enemy

The last post ended on a loose thread. We met three timescales — $$T_1$$ for energy
relaxation, $$T_2$$ for phase coherence, and $$T_2^{\ast}$$ for the coherence you actually
measure in a plain experiment — and I claimed that the gap between $$T_2$$ and
$$T_2^{\ast}$$ is the whole game, and that it is where the next post lives. This is that
post. By the end of it you will know exactly what $$T_2^{\ast}$$ is, and — more usefully —
what it is *not*.

First, why is dephasing the fight that matters? Recall the hierarchy for spins:
$$T_1 \gg T_2$$, often by many orders of magnitude. Relaxation — actually flipping the spin
from up to down — requires the environment to *pay energy*: it must hand the qubit a
quantum $$\hbar\omega_0$$ at the Larmor frequency, through a magnetic coupling, and we
spent all of the last post establishing that the spin's magnetic handle on the world is
feeble. High-frequency magnetic noise at $$\omega_0$$ is scarce, so $$T_1$$ stretches to
milliseconds or seconds. But *phase* costs nothing. Any drift of the qubit's energy
splitting — however slow, however gentle — makes the superposition's phase advance at the
wrong rate, and low-frequency environmental noise is everywhere: nuclear spins wandering,
charge traps clicking. Formally $$1/T_2 = 1/2T_1 + 1/T_\varphi$$, and for spins the first
term is negligible: coherence dies almost entirely by dephasing, at rate $$1/T_\varphi$$.
So we drop relaxation from the model altogether and study **pure dephasing**.

The model is one line. The qubit's splitting wobbles:

$$
H(t) = \frac{\hbar}{2}\left[\,\Omega + \beta(t)\,\right]\sigma_z .
$$

Here $$\Omega$$ is the average qubit frequency — the $$\omega_0$$ of the last post; there
is no drive anywhere in this post, so the symbol is free — and $$\beta(t)$$ is a random
frequency shift: the environment's fingerprint. Nothing here can flip the spin
($$[H, \sigma_z] = 0$$, so populations are frozen); all the Hamiltonian can do is make the
phase between $$\lvert 0\rangle$$ and $$\lvert 1\rangle$$ accumulate at a rate that
fluctuates. That is dephasing, the entire mechanism, in one term.

<p class="ledger-note"><span class="ledger-label">Assumptions ledger</span> Look hard at what we just did: we replaced the <em>physical</em> environment — 10<sup>5</sup>–10<sup>6</sup> quantum nuclear spins, charge traps that are themselves quantum two-level systems — by a <em>classical random signal</em> β(t). No back-action, no entanglement between qubit and bath, just a noisy c-number riding on the qubit frequency. This is a real assumption, not a convenience, and it can fail. We flag it loudly here and will interrogate it properly in a later post; for this one, β(t) is classical and that's the rules.</p>

<p class="thread-note"><span class="thread-label">The through-line</span> Here is the claim this whole post orbits: <strong>T<sub>2</sub>* is not a decay rate — it is a shot-to-shot ensemble spread easily mistaken for one.</strong> The same measured "decay" can mean irreversible loss of phase or mere ignorance of it, and learning to tell the two apart is the door to the next post.</p>

<div class="sec-divider" aria-hidden="true">•••</div>

## 2 · What a Ramsey experiment actually measures

How do you measure a phase you can't see? The standard probe is the **Ramsey
experiment**, built entirely from parts we own from last time. A $$\pi/2$$ pulse rotates
the spin from the north pole of the Bloch sphere onto the equator — an equal
superposition. Then you *wait*, drive off, for a time $$t$$: the Bloch vector precesses
about $$z$$, accumulating phase. Finally a second $$\pi/2$$ pulse converts phase back into
population, and you read the spin out. Repeat the whole sequence many times per delay
$$t$$, average the outcomes, step $$t$$, and the averaged signal traces an oscillation —
a **Ramsey fringe** — whose amplitude shrinks as $$t$$ grows.

What controls the shrinking? During the wait, the phase advances at the instantaneous
frequency $$\Omega + \beta(t')$$, so relative to a clock ticking at $$\Omega$$ the qubit
picks up a random extra phase

$$
\phi(t) = \int_0^t \beta(t')\,\mathrm{d}t' .
$$

Each repetition of the experiment draws a fresh realization of the noise, hence a fresh
$$\phi$$. Averaging the measured outcomes over shots therefore averages the phase factor,
and the fringe amplitude is exactly the modulus of that average — the **coherence
function**:

$$
W(t) = \left|\left\langle e^{-i\phi(t)} \right\rangle\right| .
$$

In Bloch-sphere language: each shot's Bloch vector sits *on* the equator, full length,
pointing at angle $$\phi_i$$ away from where the clock says it should. The average of many
unit arrows fanned out over angles is a shorter arrow. $$W(t)$$ is its length — the
equatorial component of the *averaged* state, shrinking not because any single arrow
shrank but because they no longer agree. Keep that picture; it is the through-line in
geometric form.

<div class="learn-more-box" markdown="0">
{% details Derivation: why the off-diagonal element picks up exactly this average %}
Populations and coherences separate cleanly under pure dephasing. Write the density matrix
in the energy basis and evolve it with $$H(t) = \tfrac{\hbar}{2}[\Omega + \beta(t)]\sigma_z$$.
Since $$H$$ is diagonal, the von Neumann equation
$$i\hbar\,\dot\rho = [H, \rho]$$ gives, element by element,

$$
\dot\rho_{00} = \dot\rho_{11} = 0,
\qquad
\dot\rho_{01} = -\,i\,[\Omega + \beta(t)]\,\rho_{01} .
$$

The populations are constants — nothing relaxes, as promised — and the coherence just
integrates a phase:

$$
\rho_{01}(t) = \rho_{01}(0)\; e^{-i\Omega t}\, e^{-i\phi(t)},
\qquad
\phi(t) = \int_0^t \beta(t')\,\mathrm{d}t' .
$$

For a *single* shot this is a pure phase — $$\lvert\rho_{01}\rvert$$ is untouched. But the
experiment never sees a single shot: readout is projective, so every point on the fringe
is an average over many repetitions, each with its own noise realization. The measured
(averaged) density matrix has

$$
\overline{\rho}_{01}(t) = \rho_{01}(0)\, e^{-i\Omega t}\,
\big\langle e^{-i\phi(t)} \big\rangle ,
$$

and since the transverse Bloch components are
$$\langle\sigma_x\rangle + i\langle\sigma_y\rangle = 2\rho_{01}^{\,*}$$, the length of the
equatorial part of the averaged Bloch vector is

$$
\big|\langle \sigma_x \rangle + i \langle \sigma_y \rangle\big|
 = \big|2\rho_{01}(0)\big| \cdot W(t),
\qquad
W(t) = \big|\langle e^{-i\phi(t)}\rangle\big| .
$$

The second $$\pi/2$$ pulse maps one equatorial component onto $$\sigma_z$$ for readout, so
the measured excited-state probability oscillates as
$$P(t) = \tfrac{1}{2}\left[1 + W(t)\cos(\Omega t + \varphi)\right]$$ (for zero-mean,
sign-symmetric noise the extra phase $$\varphi$$ vanishes). The fringe contrast *is*
$$W(t)$$ — nothing else survives the averaging.
{% enddetails %}
</div>

So the entire physics of dephasing is compressed into one object,
$$\langle e^{-i\phi}\rangle$$: the average of a phase factor over the statistics of the
noise. To evaluate it we need to know how to *speak about* random signals. That's the next
section — a crash course, kept gentle.

<p class="thread-note"><span class="thread-label">The through-line</span> Notice where the decay lives: in the brackets ⟨·⟩. Each single run keeps a full-length Bloch vector to the very end. Whatever "decays" in a Ramsey experiment, it is a property of the <em>ensemble</em>, not necessarily of any individual qubit run. Hold that thought until §5.</p>

<div class="sec-divider" aria-hidden="true">•••</div>

## 3 · A crash course in random signals

Three concepts, each introduced with a paragraph of honest intuition and then the math:
stationarity, the autocorrelation function, and the power spectral density.

**Stationarity.** The noise is a signal $$\beta(t)$$ we cannot predict, so we describe it
statistically — and the first simplifying assumption is that those statistics don't care
what time it is. The nuclear bath at 2 pm behaves like the nuclear bath at 3 pm; the
experiment is not drifting systematically, just fluctuating. Formally: all statistical
moments are invariant under time translation. We also take $$\langle\beta\rangle = 0$$ —
any constant offset is not noise, it's a miscalibration of $$\Omega$$, and we absorb it
there.

**Autocorrelation.** The single most useful question you can ask a random signal: *if I
know its value now, for how long is that knowledge worth anything?* White-hot fast noise
forgets itself instantly; a lazy drift stays where it was for a long time. The
autocorrelation function measures exactly this self-memory,

$$
C(\tau) = \langle \beta(t + \tau)\,\beta(t) \rangle ,
$$

which by stationarity depends only on the lag $$\tau$$. At $$\tau = 0$$ it is the noise
power $$C(0) = \sigma^2$$, the variance of $$\beta$$; as $$\tau$$ grows it falls off over
a characteristic **correlation time** $$\tau_c$$ — the memory span of the noise.

**Power spectral density.** The same information, reorganized by frequency: how much of
the noise power lives in slow wiggles, how much in fast ones? That is what a spectrum
analyzer shows you when you feed it the signal. The **Wiener–Khinchin theorem** says the
spectrum is nothing but the Fourier transform of the autocorrelation:

$$
S(\omega) = \int_{-\infty}^{\infty} C(\tau)\, e^{-i\omega\tau}\,\mathrm{d}\tau ,
\qquad
C(\tau) = \int_{-\infty}^{\infty} \frac{\mathrm{d}\omega}{2\pi}\, S(\omega)\, e^{i\omega\tau} .
$$

Memory in time and concentration in frequency are the same fact viewed twice: long memory
(large $$\tau_c$$) means the power is piled up at low frequencies; no memory means the
power is spread flat.

Two anchor cases bracket everything that follows.

**White noise** is the memoryless extreme: the signal forgets itself instantly, so the
autocorrelation is a spike and the spectrum is flat —

$$
C(\tau) = S_0\,\delta(\tau), \qquad S(\omega) = S_0 \;\;\text{(all frequencies equally)}.
$$

**Quasistatic noise** is the opposite extreme: within any one shot of the experiment
$$\beta$$ doesn't budge — it is *frozen* — but from shot to shot it is redrawn at random
from a distribution of variance $$\sigma^2$$. Perfect memory within a run:

$$
C(\tau) = \sigma^2 \;\;\text{(constant)}, \qquad S(\omega) = 2\pi\sigma^2\,\delta(\omega)
\;\;\text{(all power at zero frequency)}.
$$

Real noise lives between the extremes, and the tidiest interpolation is
**Ornstein–Uhlenbeck** (Gauss–Markov) noise, with exponential memory and a Lorentzian
spectrum:

$$
C(\tau) = \sigma^2 e^{-|\tau|/\tau_c},
\qquad
S(\omega) = \frac{2\sigma^2\tau_c}{1 + \omega^2\tau_c^2} .
$$

Slide $$\tau_c \to 0$$ (at fixed power delivered per unit time) and it becomes white;
slide $$\tau_c \to \infty$$ and it becomes quasistatic. We will ride this dial in §5.

<div class="sec-divider" aria-hidden="true">•••</div>

## 4 · The Gaussian machinery

We need $$\langle e^{-i\phi}\rangle$$. In general that requires the full probability
distribution of $$\phi(t)$$ — every moment of it. But there is a large and physically
motivated class of noise for which *one* number suffices: **Gaussian noise**. If
$$\beta(t)$$ is a Gaussian process, then $$\phi(t) = \int_0^t \beta$$ — a linear
functional of it — is a plain Gaussian random variable, and averaging a phase factor over
a Gaussian is a closed-book exam:

<div class="key-eq" markdown="1">

$$
W(t) = e^{-\chi(t)},
\qquad
\chi(t) = \tfrac{1}{2}\big\langle \phi^2(t) \big\rangle .
$$

</div>

That is the central result of this post — the **attenuation function** $$\chi(t)$$. All of
dephasing (Gaussian dephasing, see the ledger below) reduces to computing the *variance*
of the accumulated phase. Writing the variance out with the autocorrelation function of
§3,

$$
\chi(t) = \frac{1}{2}\int_0^t \mathrm{d}t_1 \int_0^t \mathrm{d}t_2\; C(t_1 - t_2),
$$

everything measurable about Ramsey decay is contained in $$C(\tau)$$ — equivalently, in
the spectrum $$S(\omega)$$. That equivalence becomes a genuinely practical tool in §6.

<div class="learn-more-box" markdown="0">
{% details Derivation: the cumulant expansion, and the Gaussian integral behind it %}
For any random variable $$\phi$$, the average of $$e^{-i\phi}$$ has a systematic expansion
in **cumulants** $$\kappa_n$$:

$$
\big\langle e^{-i\phi} \big\rangle
= \exp\!\left[\sum_{n=1}^{\infty} \frac{(-i)^n}{n!}\,\kappa_n\right],
\qquad
\kappa_1 = \langle\phi\rangle,\quad
\kappa_2 = \langle\phi^2\rangle - \langle\phi\rangle^2,\quad \dots
$$

(The logarithm of the characteristic function generates the cumulants — that is their
definition.) Zero-mean noise kills $$\kappa_1$$. The defining property of a **Gaussian**
random variable is that *every cumulant beyond the second vanishes identically*, so the
series terminates:

$$
\big\langle e^{-i\phi} \big\rangle = e^{-\langle\phi^2\rangle / 2} .
$$

If the formalism feels slippery, do it by hand. For Gaussian $$\phi$$ with variance
$$s^2$$:

$$
\big\langle e^{-i\phi} \big\rangle
= \int_{-\infty}^{\infty} \frac{\mathrm{d}\phi}{\sqrt{2\pi s^2}}\;
  e^{-\phi^2/2s^2}\, e^{-i\phi} .
$$

Complete the square in the exponent:

$$
-\frac{\phi^2}{2s^2} - i\phi
= -\frac{1}{2s^2}\big(\phi + i s^2\big)^2 - \frac{s^2}{2} .
$$

The shifted integral is still a normalized Gaussian (shift the contour; nothing obstructs
it), so it integrates to 1 and leaves

$$
\big\langle e^{-i\phi} \big\rangle = e^{-s^2/2},
$$

which is real and positive — so $$W = \lvert\langle e^{-i\phi}\rangle\rvert = e^{-s^2/2}$$
directly, no modulus gymnastics needed. Identifying $$s^2 = \langle\phi^2(t)\rangle$$ gives
the boxed result. Finally, expanding the square in
$$\langle\phi^2\rangle = \int_0^t\!\int_0^t \langle\beta(t_1)\beta(t_2)\rangle\,
\mathrm{d}t_1\mathrm{d}t_2$$ and using stationarity gives the double integral of
$$C(t_1 - t_2)$$ quoted in the main text.
{% enddetails %}
</div>

When are you *entitled* to the Gaussian assumption? Two distinct situations justify it:

1. **Many weak sources.** If $$\beta(t)$$ is a sum of many small, roughly independent
   contributions, the central limit theorem makes it Gaussian regardless of what the
   individual sources look like. This is precisely the spin qubit's situation: the
   Overhauser field is the sum of $$10^5$$–$$10^6$$ nuclear moments
   {% cite merkulov2002electron --file refs_spin_qubits %}.
2. **Weak coupling.** Even for non-Gaussian noise, if the phase accumulated over the
   experiment is small, the higher cumulants enter at higher order in the coupling and the
   second cumulant dominates — Gaussian *as an approximation* rather than a property
   {% cite cywinski2008how --file refs_spin_qubits %}.

And what breaks it? A **single strong fluctuator** — one charge trap toggling between two
states, coupled hard to the qubit. Then $$\beta$$ takes two values, nothing is Gaussian,
higher cumulants are as big as the second, and the machinery above gives qualitatively
wrong answers (the coherence can even *revive*)
{% cite bergli2009decoherence --file refs_spin_qubits %}. That story — random telegraph
noise and its very non-Gaussian fingerprints — is a later post. File it next to the
ledger.

<div class="sec-divider" aria-hidden="true">•••</div>

## 5 · Two limits, worked to the end

Now cash in. Take the two anchor spectra of §3 and push each through the boxed formula.

**White noise → exponential decay.** Insert $$C(\tau) = S_0\,\delta(\tau)$$ into the
double integral: the delta function collapses one integration and the other just measures
the interval,

$$
\chi(t) = \frac{1}{2}\int_0^t\!\!\int_0^t S_0\,\delta(t_1 - t_2)\,
\mathrm{d}t_1\mathrm{d}t_2 = \frac{S_0\,t}{2}
\quad\Longrightarrow\quad
W(t) = e^{-\Gamma t},
\qquad \Gamma = \frac{S_0}{2},
\quad T_2 = \frac{1}{\Gamma}.
$$

Exponential decay at a genuine, honest *rate*. Memoryless noise deals fresh, independent
phase kicks in every instant; each shot's phase random-walks away and never comes back.
This loss is **irreversible in every meaningful sense** — and, as we'll see next post,
no pulse trick can undo it, because there is no memory to exploit. This is the noise
your $$T_2$$ ultimately answers to.

**Quasistatic Gaussian noise → Gaussian decay.** Here the derivation is two lines. Within
one shot $$\beta$$ is frozen, so the phase is simply

$$
\phi(t) = \beta\,t
\quad\Longrightarrow\quad
\chi(t) = \tfrac{1}{2}\langle\beta^2\rangle\,t^2 = \tfrac{1}{2}\sigma^2 t^2 ,
$$

and therefore

<div class="key-eq" markdown="1">

$$
W(t) = e^{-\sigma^2 t^2/2} = e^{-(t/T_2^{\ast})^2},
\qquad
T_2^{\ast} = \frac{\sqrt{2}}{\sigma}.
$$

</div>

Same experiment, same axes, and yet *everything* about this decay is different. It is
Gaussian in time, not exponential — flat at $$t = 0$$, then collapsing — so there is no
constant "decay rate" at all. And its timescale $$T_2^{\ast}$$ is not set by any
dissipative process: it is $$\sqrt{2}/\sigma$$, the inverse *width of a distribution*.

Sit with that for a moment, because this is the payoff of the whole post. In the
quasistatic case, **nothing irreversible happened**. Each individual shot precessed
perfectly cleanly, a full-length Bloch vector at frequency $$\Omega + \beta_i$$ — slightly
wrong, but constant and, in principle, knowable. The "decay" appeared at the last step,
when we averaged shots that no longer agreed on where the phase should be. $$T_2^{\ast}$$
does not measure how fast a qubit loses coherence; it measures how fast our *ensemble of
answers spreads out*. It is ignorance wearing the costume of dissipation.

<p class="thread-note"><span class="thread-label">The through-line</span> There it is, no longer a claim but a two-line derivation: T<sub>2</sub>* = √2/σ is literally the inverse width of the shot-to-shot frequency distribution. A decay <em>rate</em> and a frequency <em>spread</em> produce the same shrinking fringe — one is irreversible loss, the other reversible ignorance — and a single Ramsey trace cannot tell you which you have.</p>

Watch it happen. Below are thirty single-shot Ramsey fringes, each an *undamped* cosine at
its own frequency $$\Omega + \beta_i$$, with $$\beta_i$$ drawn from a Gaussian of width
$$\sigma$$ — plus their average, which decays under the exact envelope
$$e^{-\sigma^2 t^2/2}$$ even though no single curve decays at all.

<div style="border:1px solid var(--global-divider-color);border-radius:8px;padding:1rem;margin:1.5rem 0;">
  <div id="re1-mount"></div>
  <div style="display:flex;flex-wrap:wrap;gap:1rem;align-items:center;justify-content:center;margin-top:0.75rem;font-size:0.9rem;">
    <label style="display:flex;align-items:center;gap:0.5rem;">
      spread σ
      <input id="re1-sigma" type="range" min="0" max="3" step="0.05" value="1">
      <span id="re1-sigma-val" style="min-width:2.6em;font-variant-numeric:tabular-nums;">1.00</span>
    </label>
    <button id="re1-resample" type="button" style="cursor:pointer;padding:0.25rem 0.75rem;border-radius:6px;border:1px solid var(--global-theme-color);background:transparent;color:var(--global-theme-color);">↻ resample β</button>
  </div>
  <p style="font-size:0.85rem;opacity:0.8;max-width:36rem;margin:0.75rem auto 0;text-align:center;">
    Ensemble dephasing, computed live from the real formulas (nothing is sketched): thirty
    undamped fringes cos([Ω+β<sub>i</sub>]t) with β<sub>i</sub> ~ 𝒩(0, σ²), their running
    average, and the exact infinite-ensemble envelope ±e<sup>−σ²t²/2</sup>. Widen σ and the
    "decay" accelerates — yet every individual shot still oscillates at full amplitude
    forever. That is T<sub>2</sub>* = √2/σ: a spread, not a rate.
  </p>
</div>

<script src="{{ '/assets/js/ramsey-ensemble.js' | relative_url }}"></script>
<script>
  (function () {
    var mount = document.getElementById("re1-mount");
    if (!mount || typeof createRamseyEnsemble !== "function") return;
    var re = createRamseyEnsemble(mount, { sigma: 1.0, n: 30 });
    var w = document.getElementById("re1-sigma"), v = document.getElementById("re1-sigma-val");
    w.addEventListener("input", function () { re.setSigma(w.value); v.textContent = (+w.value).toFixed(2); });
    document.getElementById("re1-resample").addEventListener("click", function () { re.resample(); });
  })();
</script>

Now connect $$\sigma$$ to the physics of the last post. For a spin in a semiconductor, the
dominant quasistatic noise *is* the **Overhauser field**: the electron's wavefunction
overlaps $$N \sim 10^5$$–$$10^6$$ nuclei, each a randomly oriented moment, and their net
hyperfine field is — by the central limit theorem, as promised in §4 — Gaussian, with a
width that Merkulov, Efros and Rosen worked out scales as $$1/\sqrt{N}$$ of the
fully-polarized field {% cite merkulov2002electron --file refs_spin_qubits %}. Crucially,
the nuclear bath rearranges over microseconds to seconds, while one Ramsey shot lasts
nanoseconds: frozen per shot, redrawn between shots. Quasistatic is not a toy limit —
it is the *actual regime* of the hyperfine storm. The numbers land exactly where the last
post left them {% cite burkard2023semiconductor --file refs_spin_qubits %}:

- **GaAs**: every nucleus carries spin; the field width is a few mT, giving
  $$T_2^{\ast} \sim 10\,\text{ns}$$ — the dishearteningly short figure we quoted, now
  derived (exercise 1 below puts the numbers in)
  {% cite merkulov2002electron petta2005coherent --file refs_spin_qubits %}.
- **Natural silicon**: only the 4.7% of $$^{29}$$Si nuclei carry spin; the storm quiets to
  $$T_2^{\ast} \sim 1\,\mu\text{s}$$.
- **Isotopically purified $$^{28}$$Si**: the bath all but vanishes and $$T_2^{\ast}$$
  stretches to $$\sim 100\,\mu\text{s}$$ — at which point the residual dephasing is
  dominated by **charge noise** rattling the gates, the price of electrical control that
  §5 of the last post warned about
  {% cite veldhorst2015two burkard2023semiconductor --file refs_spin_qubits %}.

Between the two anchor limits sits real noise with finite memory. For Ornstein–Uhlenbeck
noise the double integral closes exactly (a two-line exercise in integrating
exponentials):

$$
\chi(t) = \sigma^2 \tau_c^2 \left( \frac{t}{\tau_c} + e^{-t/\tau_c} - 1 \right),
$$

which is $$\sigma^2 t^2/2$$ (Gaussian, quasistatic) for $$t \ll \tau_c$$ and
$$\sigma^2 \tau_c\, t$$ (exponential) for $$t \gg \tau_c$$. That second limit is
**motional narrowing**: make the noise *faster* at fixed power and the decay gets
*slower*, because the qubit averages the kicks away within a single shot before they can
accumulate. The crossover means the *shape* of a measured decay curve is information: a
Gaussian profile says "the noise is slow compared to me", an exponential says "fast".
You are already doing noise spectroscopy with no equipment beyond the qubit itself.

<div style="border:1px solid var(--global-divider-color);border-radius:8px;padding:1rem;margin:1.5rem 0;">
  <div id="ds1-mount"></div>
  <div style="display:flex;flex-wrap:wrap;gap:1rem;align-items:center;justify-content:center;margin-top:0.75rem;font-size:0.9rem;">
    <label style="display:flex;align-items:center;gap:0.5rem;">
      correlation time τ<sub>c</sub>
      <input id="ds1-tauc" type="range" min="-2" max="2" step="0.05" value="1">
      <span id="ds1-tauc-val" style="min-width:3.4em;font-variant-numeric:tabular-nums;">10.0</span>
    </label>
    <span style="opacity:0.7;">small τ<sub>c</sub> → exponential&nbsp;·&nbsp;large τ<sub>c</sub> → Gaussian</span>
  </div>
  <p style="font-size:0.85rem;opacity:0.8;max-width:36rem;margin:0.75rem auto 0;text-align:center;">
    The decay-shape explorer, computed live from the exact Gaussian result for
    Ornstein–Uhlenbeck noise at fixed power σ² (no curve is sketched or faked):
    W(t) = exp[−σ²τ<sub>c</sub>²(t/τ<sub>c</sub> + e<sup>−t/τ<sub>c</sub></sup> − 1)].
    Drag τ<sub>c</sub> and watch the exact curve peel off the Gaussian limit and land on the
    exponential one — the decay shape is your first piece of noise spectroscopy. (Note the
    time axis rescaling: fast noise at fixed power dephases <em>more slowly</em> — motional
    narrowing.)
  </p>
</div>

<script src="{{ '/assets/js/decay-shape.js' | relative_url }}"></script>
<script>
  (function () {
    var mount = document.getElementById("ds1-mount");
    if (!mount || typeof createDecayShape !== "function") return;
    var ds = createDecayShape(mount, { tauc: 10 });
    var w = document.getElementById("ds1-tauc"), v = document.getElementById("ds1-tauc-val");
    w.addEventListener("input", function () {
      var tc = Math.pow(10, +w.value);
      ds.setTauC(tc);
      v.textContent = tc >= 10 ? tc.toFixed(0) : tc >= 1 ? tc.toFixed(1) : tc.toFixed(2);
    });
  })();
</script>

<div class="sec-divider" aria-hidden="true">•••</div>

## 6 · Free evolution is a filter

One more step and the whole subject snaps into a single picture. Take the double-integral
formula for $$\chi(t)$$ and trade the autocorrelation function for the spectrum using
Wiener–Khinchin:

$$
\chi(t) = \frac{1}{2}\int_0^t\!\!\int_0^t \mathrm{d}t_1\,\mathrm{d}t_2
\int_{-\infty}^{\infty} \frac{\mathrm{d}\omega}{2\pi}\, S(\omega)\,
e^{i\omega(t_1 - t_2)} .
$$

The time integrals factorize into a product of one integral and its complex conjugate,
$$\big|\int_0^t e^{i\omega t'} \mathrm{d}t'\big|^2 = 4\sin^2(\omega t/2)/\omega^2$$, giving

<div class="key-eq" markdown="1">

$$
\chi(t) = \int_{-\infty}^{\infty} \frac{\mathrm{d}\omega}{2\pi}\;
S(\omega)\, \frac{2\sin^2(\omega t / 2)}{\omega^2} .
$$

</div>

<div class="learn-more-box" markdown="0">
{% details Derivation: the two steps compressed above %}
Step one, factorize. The double time integral acts only on the exponential:

$$
\int_0^t\!\!\int_0^t e^{i\omega(t_1 - t_2)}\,\mathrm{d}t_1\,\mathrm{d}t_2
= \left(\int_0^t e^{i\omega t_1}\,\mathrm{d}t_1\right)
  \left(\int_0^t e^{-i\omega t_2}\,\mathrm{d}t_2\right)
= \left|\int_0^t e^{i\omega t'}\,\mathrm{d}t'\right|^2 .
$$

Step two, evaluate:

$$
\int_0^t e^{i\omega t'}\,\mathrm{d}t' = \frac{e^{i\omega t} - 1}{i\omega}
\quad\Longrightarrow\quad
\left|\frac{e^{i\omega t} - 1}{i\omega}\right|^2
= \frac{2 - 2\cos\omega t}{\omega^2}
= \frac{4\sin^2(\omega t/2)}{\omega^2},
$$

using $$1 - \cos x = 2\sin^2(x/2)$$. Multiply by the overall $$\tfrac12$$ and the spectral
measure $$\mathrm{d}\omega/2\pi$$ to get the boxed formula. Sanity checks: a flat spectrum
$$S = S_0$$ gives $$\chi = S_0 t/2$$ (exercise 2), and $$S = 2\pi\sigma^2\delta(\omega)$$
gives $$\chi = \sigma^2 t^2/2$$ — both §5 results recovered on the nose.
{% enddetails %}
</div>

Read it as an engineer would: the decay is the noise spectrum $$S(\omega)$$ weighted by a
**filter**, $$F(\omega, t) = 2\sin^2(\omega t/2)/\omega^2$$. And this particular filter is
a *low-pass probe*: it is peaked at $$\omega = 0$$ with height $$t^2/2$$ and bandwidth
$$\sim 1/t$$, so a free evolution of duration $$t$$ interrogates the noise power in a
narrowing window around zero frequency, with a weight at DC that grows as $$t^2$$. Freely
precessing, the qubit is maximally sensitive to exactly the *slowest* noise it has — and
§5 just told us that a spin qubit's noise budget (Overhauser drift, $$1/f$$ charge noise)
is piled up precisely at low frequency. The plain Ramsey experiment is, by construction,
the worst-case probe of a spin qubit's environment. This filter-function way of seeing
dephasing {% cite cywinski2008how --file refs_spin_qubits %} is the organizing idea of
everything that comes next; the review by Szańkowski and coauthors
{% cite szankowski2017environmental --file refs_spin_qubits %} is where to go deeper when
you want the full machinery.

But turn the logic around and it becomes hopeful. If the dominant noise is slow, then by
the through-line it isn't destroying phase information — it is hiding it, shot by shot, in
a frequency offset that barely changes during a run. Reversible ignorance should be
*reversible*. Concretely: let the qubit precess for a time $$t/2$$, flip it with a single
$$\pi$$ pulse, and let it precess for $$t/2$$ more. Whatever extra phase a frozen
$$\beta_i$$ wound up in the first half unwinds *exactly* in the second — for every shot at
once, whatever its $$\beta_i$$, no knowledge of the noise required. One pulse, and the
quasistatic contribution to dephasing is simply gone.

<p class="thread-note"><span class="thread-label">The through-line</span> That is the operational meaning of the distinction this post has been circling: reversible ignorance can be <em>undone</em> — one π pulse — while true irreversible loss (the white-noise part) cannot. The echo that comes back is the experiment that separates T<sub>2</sub> from T<sub>2</sub>*; in filter language, the π pulse re-shapes F(ω, t) to kill its DC peak. Echoes and filter functions are the next post.</p>

<div class="sec-divider" aria-hidden="true">•••</div>

## 7 · Exercises

**Exercise 1 — the quasistatic workhorse.** Starting from
$$W(t) = \lvert\langle e^{-i\phi(t)}\rangle\rvert$$ with $$\phi = \beta t$$ and
$$\beta \sim \mathcal{N}(0, \sigma^2)$$, derive $$T_2^{\ast} = \sqrt{2}/\sigma$$. Then put
in the GaAs numbers: the Overhauser field fluctuates with r.m.s. width
$$\delta B \approx 2.5\,\text{mT}$$ {% cite merkulov2002electron --file refs_spin_qubits %},
and the electron g-factor in GaAs is $$g \approx -0.44$$. How close do you land to the
$$T_2^{\ast} \sim 10\,\text{ns}$$ quoted in the last post?

<div class="learn-more-box" markdown="0">
{% details Solution %}
The Gaussian average (§4, or the complete-the-square integral directly) gives
$$\langle e^{-i\beta t}\rangle = e^{-\sigma^2 t^2/2}$$. Matching to the definition
$$W = e^{-(t/T_2^{\ast})^2}$$ requires $$(T_2^{\ast})^{-2} = \sigma^2/2$$, i.e.

$$
T_2^{\ast} = \frac{\sqrt{2}}{\sigma}.
$$

The frequency spread produced by a field spread $$\delta B$$ is
$$\sigma = |g|\mu_B\,\delta B / \hbar$$. With $$|g| = 0.44$$,
$$\mu_B = 9.27\times 10^{-24}\,\text{J/T}$$ and $$\delta B = 2.5\,\text{mT}$$:

$$
\sigma = \frac{0.44 \times 9.27\times10^{-24} \times 2.5\times10^{-3}}
{1.055\times10^{-34}}\,\text{s}^{-1} \approx 9.7\times10^{7}\,\text{s}^{-1}
\qquad (\sigma/2\pi \approx 15\,\text{MHz}),
$$

so

$$
T_2^{\ast} = \frac{\sqrt{2}}{9.7\times10^{7}\,\text{s}^{-1}} \approx 15\,\text{ns}.
$$

Same ballpark as the quoted $$\sim 10\,\text{ns}$$ — the difference is nothing more than
the exact value of $$\delta B$$, which varies with dot size (it scales as
$$1/\sqrt{N}$$ with the number of nuclei under the wavefunction). A millisecond-scale
$$T_1$$ and a 15 ns $$T_2^{\ast}$$, five orders of magnitude apart, from one dot: that is
the $$T_1 \gg T_2^{\ast}$$ hierarchy of §1 in the flesh.
{% enddetails %}
</div>

**Exercise 2 — white noise through the general formula.** In §5 we got exponential decay
from the delta-function autocorrelation. Get it again, this time from the filter formula
of §6: insert a flat spectrum $$S(\omega) = S_0$$ into the boxed $$\chi(t)$$ and show that
$$W(t) = e^{-S_0 t/2}$$. (Useful fact: $$\int_{-\infty}^{\infty} \sin^2 u / u^2 \,\mathrm{d}u = \pi$$.)

<div class="learn-more-box" markdown="0">
{% details Solution %}
With $$S(\omega) = S_0$$,

$$
\chi(t) = S_0 \int_{-\infty}^{\infty} \frac{\mathrm{d}\omega}{2\pi}\,
\frac{2\sin^2(\omega t/2)}{\omega^2} .
$$

Substitute $$u = \omega t / 2$$, so $$\omega = 2u/t$$ and
$$\mathrm{d}\omega = (2/t)\,\mathrm{d}u$$:

$$
\chi(t) = \frac{S_0}{\pi} \int_{-\infty}^{\infty}
\frac{\sin^2 u}{(2u/t)^2}\,\frac{2}{t}\,\mathrm{d}u
= \frac{S_0\,t}{2\pi} \int_{-\infty}^{\infty} \frac{\sin^2 u}{u^2}\,\mathrm{d}u
= \frac{S_0\,t}{2},
$$

using the quoted integral. Hence $$W(t) = e^{-S_0 t/2} = e^{-\Gamma t}$$ with
$$\Gamma = S_0/2$$ — exponential decay, $$T_2 = 1/\Gamma = 2/S_0$$, in agreement with the
direct calculation of §5. Linear-in-$$t$$ growth of $$\chi$$ is the fingerprint of
memoryless noise: each instant contributes an independent, irreversible increment of
phase variance.
{% enddetails %}
</div>

**Exercise 3 — say what's wrong.** A colleague reports: "our device has
$$T_2^{\ast} = 1\,\mu\text{s}$$, so each qubit loses coherence at a rate of
$$1\ \text{per microsecond}$$." Explain precisely what is wrong with that sentence.

<div class="learn-more-box" markdown="0">
{% details Solution %}
Nearly every word after "so" is doing something illegitimate.

**"Rate" is wrong.** If $$T_2^{\ast}$$ comes from slow (quasistatic-dominated) noise —
which is the usual reason one quotes $$T_2^{\ast}$$ at all — the decay is Gaussian,
$$W = e^{-(t/T_2^{\ast})^2}$$, not exponential. A Gaussian has no constant rate: the
instantaneous decay rate $$-\dot W/W = 2t/(T_2^{\ast})^2$$ starts at *zero* and grows.
Early on, the qubit is far more coherent than an exponential-decay picture predicts —
which is exactly why quoting a single "rate" misleads.

**"Each qubit loses coherence" is more deeply wrong.** In the quasistatic picture nothing
is lost in any single run: every shot precesses cleanly at its own frozen
$$\Omega + \beta_i$$, with a full-length Bloch vector throughout. The decay of the
*averaged* signal reflects the spread $$\sigma = \sqrt{2}/T_2^{\ast}$$ of frequencies
across shots — ensemble ignorance, not per-qubit dissipation. The honest paraphrase of the
measurement is: "the shot-to-shot frequency spread of our device is
$$\sigma/2\pi \approx 0.23\,\text{MHz}$$."

**And the proof is operational.** If the colleague were right — if phase coherence were
genuinely destroyed at $$1\,\mu\text{s}^{-1}$$ — no pulse sequence could recover it. In
reality a single $$\pi$$ pulse (next post) rephases the quasistatic part and the echo
coherence time comes back longer, often by orders of magnitude. What a Hahn echo
resurrects was never lost; $$T_2^{\ast}$$ conflates that recoverable ignorance with true
decoherence. The one caveat: the fraction of the decay caused by genuinely fast noise
*is* rate-like and *is* per-qubit — telling those two apart is precisely the job of the
echo experiments this series turns to next.
{% enddetails %}
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

## References

{% bibliography --file refs_spin_qubits --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public post: I write these to teach myself the physics behind my PhD, with
> **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
{: .block-tip }
