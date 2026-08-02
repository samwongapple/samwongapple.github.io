---
layout: post
title: "From Spin Echo to Filter Functions"
date: 2026-07-28 18:00:00-0700
description: One π pulse buys back a hundredfold in coherence. Understanding why turns every pulse sequence into a frequency filter — and turns fighting noise into a design problem.
tags: [quantum-computing, spin-qubits, decoherence, dynamical-decoupling]
categories: [spin-qubits]
related_posts: false
provides: [hahn-echo, switching-function, sequence-filter-function, cpmg, uhrig-sequence, dynamical-decoupling]
requires:
  [
    pure-dephasing-model,
    coherence-function,
    attenuation-function,
    gaussian-dephasing,
    power-spectral-density,
    filter-function,
    quasistatic-noise,
    white-noise,
    t2-star-as-spread,
  ]
uses: [overhauser-field, charge-noise, ornstein-uhlenbeck-noise, coherence-timescales, ramsey-experiment]
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

## 1 · The one-pulse miracle

The last post left a promissory note. We had established that $$T_2^{\ast}$$ — the coherence
time you read off a plain Ramsey fringe — is not a decay rate at all but a shot-to-shot
spread: each run of the experiment precesses cleanly at its own slightly wrong frequency
$$\Omega + \beta_i$$, and only the *average* over runs decays. Nothing was destroyed. The
phase information was still there, hiding in a frequency offset that barely moved during
any single run. And I claimed that because it was merely hidden, it should be recoverable —
with one π pulse.

Let us collect on that note.

Here is the sequence, due to Erwin Hahn in 1950 {% cite hahn1950spin --file refs_spin_qubits %}.
Start as before: a $$\pi/2$$ pulse puts the spin on the equator of the Bloch sphere. Let it
precess freely for a time $$t/2$$. Now apply a **π pulse** — a full flip about an in-plane
axis. Let it precess for another $$t/2$$, and read out.

The claim is that at the end of the second interval, every spin in the ensemble is back
where it started, no matter what frequency it was precessing at.

<figure id="result-hahn-echo" style="margin:1.6rem auto;text-align:center;color:var(--global-text-color);">
  <svg viewBox="0 0 640 268" width="660" style="max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The Hahn echo: spins fan out, are flipped by a pi pulse, then refocus">
    <defs>
      <marker id="he-ar" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="currentColor"/></marker>
      <marker id="he-ac" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="var(--global-theme-color)"/></marker>
    </defs>

    <!-- four equator disks viewed from above -->
    <g fill="none" stroke="currentColor" stroke-opacity="0.3" stroke-width="1">
      <circle cx="78" cy="72" r="46"/>
      <circle cx="238" cy="72" r="46"/>
      <circle cx="398" cy="72" r="46"/>
      <circle cx="558" cy="72" r="46"/>
    </g>

    <!-- (a) all aligned after pi/2 -->
    <g stroke="var(--global-theme-color)" stroke-width="2" marker-end="url(#he-ac)">
      <line x1="78" y1="72" x2="78" y2="30"/>
    </g>

    <!-- (b) fanned out at t/2 -->
    <g stroke="currentColor" stroke-width="1.6" stroke-opacity="0.75" marker-end="url(#he-ar)">
      <line x1="238" y1="72" x2="238" y2="30"/>
      <line x1="238" y1="72" x2="264" y2="39"/>
      <line x1="238" y1="72" x2="212" y2="39"/>
      <line x1="238" y1="72" x2="278" y2="59"/>
      <line x1="238" y1="72" x2="198" y2="59"/>
    </g>

    <!-- (c) mirrored by the pi pulse -->
    <g stroke="currentColor" stroke-width="1.6" stroke-opacity="0.75" marker-end="url(#he-ar)">
      <line x1="398" y1="72" x2="398" y2="114"/>
      <line x1="398" y1="72" x2="424" y2="105"/>
      <line x1="398" y1="72" x2="372" y2="105"/>
      <line x1="398" y1="72" x2="438" y2="85"/>
      <line x1="398" y1="72" x2="358" y2="85"/>
    </g>

    <!-- (d) refocused at t -->
    <g stroke="var(--global-theme-color)" stroke-width="2" marker-end="url(#he-ac)">
      <line x1="558" y1="72" x2="558" y2="114"/>
    </g>

    <g fill="currentColor" font-size="11.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.9">
      <text x="78" y="138">aligned at t = 0</text>
      <text x="238" y="138">fanned out at t/2</text>
      <text x="398" y="138">mirrored by π</text>
      <text x="558" y="138">refocused at t</text>
      <text x="78" y="153" font-size="10" fill-opacity="0.7">after π/2</text>
      <text x="238" y="153" font-size="10" fill-opacity="0.7">fast ones lead</text>
      <text x="398" y="153" font-size="10" fill-opacity="0.7">now they trail</text>
      <text x="558" y="153" font-size="10" fill-opacity="0.7">echo</text>
    </g>

    <!-- the switching function y(t) -->
    <g>
      <line x1="40" y1="222" x2="600" y2="222" stroke="currentColor" stroke-opacity="0.35"/>
      <path d="M 60 200 H 318" stroke="var(--global-theme-color)" stroke-width="2.4" fill="none"/>
      <path d="M 318 244 H 578" stroke="var(--global-theme-color)" stroke-width="2.4" fill="none"/>
      <line x1="318" y1="200" x2="318" y2="244" stroke="var(--global-theme-color)" stroke-width="1" stroke-dasharray="3 3"/>
      <g fill="currentColor" font-size="11" font-family="system-ui, sans-serif">
        <text x="34" y="204" text-anchor="end">+1</text>
        <text x="34" y="248" text-anchor="end">−1</text>
        <text x="612" y="226" text-anchor="end" fill-opacity="0.8">t</text>
      </g>
      <text x="318" y="192" fill="var(--global-theme-color)" font-size="12" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="600">π</text>
      <text x="60" y="192" fill="currentColor" font-size="11" text-anchor="middle" fill-opacity="0.7" font-family="system-ui, sans-serif">π/2</text>
      <text x="578" y="192" fill="currentColor" font-size="11" text-anchor="middle" fill-opacity="0.7" font-family="system-ui, sans-serif">π/2</text>
      <text x="44" y="264" fill="currentColor" font-size="11" fill-opacity="0.75" font-family="system-ui, sans-serif">y(t) — the sign the qubit records phase with</text>
    </g>
  </svg>
  <figcaption style="font-size:0.85rem;opacity:0.8;max-width:34rem;margin:0.6rem auto 0;">
    The Hahn echo. Spins precessing at different frequencies fan out over the first
    interval; the π pulse mirrors the fan, so the ones that were ahead are now behind by
    exactly as much; the same precession that spread them now brings them back together.
    Below: the same story as a sign. The π pulse flips y(t), and the phase the qubit
    accumulates is weighted by that sign.
  </figcaption>
</figure>

Why does it work? The runners' analogy is genuinely the whole argument. Imagine runners of
different speeds starting together on a track. After thirty seconds they are strung out
along it — the fast ones far ahead. Now blow a whistle and have every runner *turn around*
and keep running at their own unchanged speed. After thirty more seconds every single one
is back at the start line, simultaneously. The fast runner went furthest out and came
furthest back. You did not need to know anyone's speed. You only needed each speed to stay
the same for the minute.

That last sentence is the entire content of this post, and the whole reason the echo has
limits. Hold onto it.

<div class="learn-more-box" markdown="0">
{% details Derivation: why the echo cancels a frozen detuning exactly %}
Work in the frame rotating at the mean frequency $$\Omega$$, so a shot with frequency
offset $$\beta$$ accumulates phase at rate $$\beta$$. Over the first interval it acquires

$$
\phi_1 = \int_0^{t/2} \beta(s)\,\mathrm{d}s .
$$

The π pulse is a rotation by π about an in-plane axis — take $$X$$. Its effect on the state
is to conjugate the phase: it maps $$\lvert 0\rangle \leftrightarrow \lvert 1\rangle$$, so
the relative phase $$\phi$$ becomes $$-\phi$$. Equivalently, and more usefully,
$$X Z X = -Z$$: **after the pulse the qubit records phase with the opposite sign**.

So the total phase at time $$t$$ is

$$
\phi(t) = \int_0^{t/2}\beta(s)\,\mathrm{d}s \;-\; \int_{t/2}^{t}\beta(s)\,\mathrm{d}s .
$$

Now suppose $$\beta$$ is *quasistatic* — frozen at some value $$\beta_i$$ for the whole
sequence, which is exactly the regime that produced $$T_2^{\ast}$$ in the last post. Then
both integrals are trivial:

$$
\phi(t) = \beta_i \cdot \tfrac{t}{2} - \beta_i \cdot \tfrac{t}{2} = 0 .
$$

Identically zero, for **every** shot, whatever $$\beta_i$$ happened to be that run. The
ensemble average $$\langle e^{-i\phi}\rangle = 1$$, so $$W(t) = 1$$: no decay at all. The
$$T_2^{\ast}$$ we spent a whole post deriving has been erased by one pulse — which is the
sharpest possible confirmation that it was never dissipation to begin with.

Note what the argument used: only that $$\beta$$ took the *same value* in both halves. It
never used the value. That is why a single pulse fixes an entire ensemble at once, and why
no knowledge of the noise is required.
{% enddetails %}
</div>

The experimental payoff is not subtle. In GaAs, the Overhauser storm gives
$$T_2^{\ast} \sim 10\,\text{ns}$$. Apply one π pulse and the coherence time jumps to
$$T_2 \sim 1\,\mu\text{s}$$ — a factor of a hundred, from a single extra pulse
{% cite petta2005coherent --file refs_spin_qubits %}. Nothing about the device changed. We
did not cool it, purify it, or shield it. We simply stopped letting a slow drift masquerade
as decoherence.

<p class="thread-note"><span class="thread-label">The through-line</span> Here is the claim this post orbits: <strong>a pulse sequence is a frequency filter.</strong> The echo did not remove noise — it made the qubit blind to the <em>slow</em> part of it. Every section below is that statement getting sharper, until "design a pulse sequence" becomes literally "design a filter."</p>

<div class="sec-divider" aria-hidden="true">•••</div>

## 2 · What the echo cannot fix

The runners come back to the start line only if each keeps a constant speed. If a runner
speeds up after the whistle, they overshoot. The echo is exact for *frozen* noise and
degrades smoothly as the noise starts moving during the sequence.

So an echo that works imperfectly is telling us something specific: the bath changed while
we were watching. And how *fast* it changed is what determines how badly the echo failed.
That is the thread we now pull, and it leads directly to frequency.

First, the bookkeeping. The derivation box above quietly introduced the general object.
Define the **switching function** $$y(s)$$: it equals $$+1$$ while the qubit records phase
with one sign, and flips to $$-1$$ at every π pulse.

<div id="model-switching-function" class="key-eq" markdown="1">

$$
\phi(t) = \int_0^t y(s)\,\beta(s)\,\mathrm{d}s ,
\qquad
y(s) = \pm 1 \ \ \text{flipping at each π pulse}.
$$

</div>

This one line covers every sequence in this post. Free evolution is $$y \equiv +1$$ — that
is the last post. The Hahn echo is $$+1$$ then $$-1$$. Any pulse train whatsoever is some
square wave of $$\pm 1$$, and choosing a pulse sequence *is* choosing that square wave.

The rest of the Gaussian machinery carries over untouched. The noise is still classical,
Gaussian and stationary; $$\phi$$ is still a linear functional of it, hence still Gaussian;
so the coherence is still

$$
W(t) = e^{-\chi(t)}, \qquad \chi(t) = \tfrac{1}{2}\big\langle \phi^2(t) \big\rangle ,
$$

and expanding the square with the autocorrelation function $$C(\tau)$$ now carries the
signs along:

$$
\chi(t) = \frac{1}{2}\int_0^t\!\!\int_0^t
y(t_1)\,y(t_2)\; C(t_1 - t_2)\; \mathrm{d}t_1 \mathrm{d}t_2 .
$$

<p class="ledger-note"><span class="ledger-label">Assumptions ledger</span> Two entries, one carried over and one new. <strong>Carried over:</strong> β(t) is still a <em>classical</em> stochastic field — no bath back-action, no qubit–environment entanglement. <strong>New:</strong> π pulses are treated as <em>instantaneous and perfect</em>. Real pulses take tens of nanoseconds and are themselves miscalibrated, and in a long train those errors accumulate — which is why real sequences (XY-4, XY-8) alternate rotation axes to make errors cancel rather than compound. Both assumptions get their reckoning later; neither changes the picture built here.</p>

<div class="sec-divider" aria-hidden="true">•••</div>

## 3 · The filter function

Now the move that reorganizes everything. Go to frequency, exactly as in the last post:
replace $$C(\tau)$$ by its Fourier transform $$S(\omega)$$ (Wiener–Khinchin), and the double
time integral factorizes into the squared modulus of a single one.

<div id="result-sequence-filter-function" class="key-eq" markdown="1">

$$
\chi(t) = \int_{-\infty}^{\infty} \frac{\mathrm{d}\omega}{2\pi}\;
S(\omega)\, F(\omega, t),
\qquad
F(\omega,t) = \frac{1}{2}\left| \tilde{y}(\omega,t) \right|^2,
\qquad
\tilde{y}(\omega,t) = \int_0^t y(s)\, e^{i\omega s}\,\mathrm{d}s .
$$

</div>

Read it slowly, because it is the organizing equation of the whole subject. The decay
exponent is an **overlap integral** between two things that have nothing to do with each
other:

- $$S(\omega)$$ — the noise the device *has*. Set by materials, fabrication, temperature.
  You do not control it.
- $$F(\omega,t)$$ — the **filter function**, set entirely by *where you put your pulses*.
  You control it completely.

Coherence dies in proportion to how much these two overlap. You cannot change the noise. You
can move the filter.

<div class="learn-more-box" markdown="0">
{% details Derivation: from the double time integral to the overlap %}
Start from the double integral and insert the Wiener–Khinchin representation
$$C(\tau) = \int \tfrac{\mathrm{d}\omega}{2\pi} S(\omega) e^{i\omega\tau}$$ with
$$\tau = t_1 - t_2$$:

$$
\chi(t) = \frac{1}{2}\int_0^t\!\!\int_0^t \mathrm{d}t_1 \mathrm{d}t_2\;
y(t_1) y(t_2) \int_{-\infty}^{\infty}\frac{\mathrm{d}\omega}{2\pi} S(\omega)\,
e^{i\omega(t_1 - t_2)} .
$$

Exchange the orders of integration. The exponential separates, so the two time integrals
decouple into a factor and its conjugate:

$$
\int_0^t \!\! \int_0^t y(t_1)y(t_2) e^{i\omega(t_1-t_2)}\,\mathrm{d}t_1\mathrm{d}t_2
= \left(\int_0^t y(t_1)e^{i\omega t_1}\mathrm{d}t_1\right)
  \overline{\left(\int_0^t y(t_2)e^{i\omega t_2}\mathrm{d}t_2\right)}
= \left|\tilde{y}(\omega,t)\right|^2 .
$$

Hence $$\chi = \tfrac12 \int \tfrac{\mathrm{d}\omega}{2\pi} S(\omega)|\tilde y|^2$$, which is
the boxed result with $$F \equiv \tfrac12|\tilde y|^2$$.

**Two checks.** For free evolution, $$y \equiv 1$$ gives
$$\tilde y = (e^{i\omega t}-1)/i\omega$$, so
$$|\tilde y|^2 = 4\sin^2(\omega t/2)/\omega^2$$ and

$$
F_{\text{FID}}(\omega,t) = \frac{2\sin^2(\omega t/2)}{\omega^2},
$$

exactly the filter derived at the end of the last post. The convention is fixed there and
this generalizes it — the factor of $$\tfrac12$$ in $$F = \tfrac12|\tilde y|^2$$ exists
precisely so the two agree.

**A closed form for any sequence.** With π pulses at times $$s_1 < \dots < s_n$$ in
$$(0,t)$$, split the integral at each pulse and telescope the sum:

$$
\tilde{y}(\omega,t) = \frac{1}{i\omega}\left[\,(-1)^n e^{i\omega t} - 1
- 2\sum_{j=1}^{n} (-1)^j e^{i\omega s_j} \right] .
$$

This is exact, and it is what the widget below evaluates — no numerical integration of the
time domain is needed anywhere in this post.
{% enddetails %}
</div>

Now compute the filter for the echo. Putting $$y = +1$$ on $$(0,t/2)$$ and $$-1$$ after into
the closed form gives

$$
F_{\text{echo}}(\omega, t) = \frac{8\sin^4(\omega t/4)}{\omega^2} .
$$

Compare the two filters at low frequency and the entire post falls out. As
$$\omega \to 0$$:

$$
F_{\text{FID}} \to \frac{t^2}{2}\ \ \text{(the peak!)},
\qquad
F_{\text{echo}} \to \frac{\omega^2 t^4}{128} \to 0 .
$$

Free evolution's filter is *maximal* at zero frequency. The echo's filter *vanishes* there —
and not approximately: identically, as $$\omega^4/\omega^2$$. That is the mathematical
statement of §1's miracle. Quasistatic noise is noise at $$\omega = 0$$; the echo's filter
has an exact zero at $$\omega = 0$$; therefore the echo is exactly blind to it.

<p class="thread-note"><span class="thread-label">The through-line</span> The runners' argument and the algebra are the same fact in two languages. "Each runner keeps a constant speed" = "the noise is at zero frequency". "The whistle brings them all back" = "F(0, t) = 0". And <em>any</em> sequence that spends equal time at +1 and −1 has F(0,t) = 0 — every echo-like sequence is automatically blind to DC.</p>

<div class="sec-divider" aria-hidden="true">•••</div>

## 4 · More pulses: CPMG and the moving passband

If one pulse helps, why not many? Apply $$n$$ π pulses, evenly spaced, at times
$$s_j = (j - \tfrac12)\,t/n$$. This is **CPMG**, after Carr and Purcell, who introduced the
pulse train {% cite carr1954effects --file refs_spin_qubits %}, and Meiboom and Gill, who
fixed its error-accumulation problem by adjusting the pulse phases
{% cite meiboom1958modified --file refs_spin_qubits %}. The filter has a closed form too:

$$
F_{\text{CPMG}}(\omega,t) = \frac{8 \sin^4\!\left(\dfrac{\omega t}{4n}\right)}{\omega^2\,
\cos^2\!\left(\dfrac{\omega t}{2n}\right)} \times
\begin{cases}
\sin^2(\omega t / 2), & n \ \text{even},\\[2pt]
\cos^2(\omega t / 2), & n \ \text{odd}.
\end{cases}
$$

Its shape is the point. CPMG's filter is a **bandpass**: still exactly zero at DC, rising to
a dominant peak at

$$
\omega_{\text{peak}} \approx \frac{\pi n}{t} ,
$$

with weaker harmonics above it. Adding pulses does not make the filter smaller — it *moves*
it, sliding the passband up in frequency, away from where the noise lives.

That is the design principle in one sentence, and it explains why dynamical decoupling works
so spectacularly for spin qubits specifically. Their noise budget — the Overhauser drift,
$$1/f$$ charge noise — is piled up at low frequency. Push the filter's sensitive band
upward and it lands where the device is quiet.

Play with it. The top panel puts the noise you have and the filter you build on the same
frequency axis; the bottom panel shows their overlap, whose area *is* the decay exponent.

<div style="border:1px solid var(--global-divider-color);border-radius:8px;padding:1rem;margin:1.5rem 0;">
  <div id="fe1-mount"></div>
  <div style="display:flex;flex-wrap:wrap;gap:0.9rem;align-items:center;justify-content:center;margin-top:0.85rem;font-size:0.9rem;">
    <span style="display:flex;gap:0.35rem;align-items:center;">
      <span style="opacity:0.75;">sequence:</span>
      <button class="fe1-seq" data-seq="fid" type="button">free</button>
      <button class="fe1-seq" data-seq="hahn" type="button">echo</button>
      <button class="fe1-seq" data-seq="cpmg" type="button">CPMG</button>
      <button class="fe1-seq" data-seq="udd" type="button">UDD</button>
    </span>
    <label style="display:flex;align-items:center;gap:0.5rem;">
      pulses n
      <input id="fe1-n" type="range" min="1" max="32" step="1" value="4">
      <span id="fe1-n-val" style="min-width:1.8em;font-variant-numeric:tabular-nums;">4</span>
    </label>
    <label style="display:flex;align-items:center;gap:0.5rem;">
      total time t
      <input id="fe1-t" type="range" min="-0.5" max="2" step="0.02" value="1">
      <span id="fe1-t-val" style="min-width:4.2em;font-variant-numeric:tabular-nums;">10.0 μs</span>
    </label>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:0.35rem;align-items:center;justify-content:center;margin-top:0.6rem;font-size:0.9rem;">
    <span style="opacity:0.75;">noise:</span>
    <button class="fe1-noise" data-noise="oneOverF" type="button">1/f charge</button>
    <button class="fe1-noise" data-noise="nuclear" type="button">nuclear</button>
    <button class="fe1-noise" data-noise="lorentzian" type="button">Lorentzian</button>
    <button class="fe1-noise" data-noise="white" type="button">white</button>
  </div>
  <p style="font-size:0.85rem;opacity:0.8;max-width:37rem;margin:0.85rem auto 0;text-align:center;">
    The overlap picture, computed live from the exact closed forms above — no curve is
    sketched. Top: the noise spectrum S(ω) and the filter F(ω,t) the sequence builds, each
    log-scaled and normalised to its own peak. Bottom: ω·S(ω)·F(ω,t), the quantity whose
    <em>visual</em> area on a log axis equals πχ. Add pulses and watch the filter's passband
    march away from the noise while χ collapses — then switch the noise to white and watch
    the trick stop working entirely.
  </p>
</div>

<script src="{{ '/assets/js/noise-filter-math.js' | relative_url }}"></script>
<script src="{{ '/assets/js/filter-explorer.js' | relative_url }}"></script>
<script>
  (function () {
    var mount = document.getElementById("fe1-mount");
    if (!mount || typeof createFilterExplorer !== "function") return;
    var fe = createFilterExplorer(mount, { seq: "cpmg", n: 4, t: 10, noise: "oneOverF" });
    var btnStyle = function (b, on) {
      b.style.cssText =
        "cursor:pointer;padding:0.2rem 0.6rem;border-radius:6px;font-size:0.85rem;" +
        "border:1px solid " + (on ? "var(--global-theme-color)" : "var(--global-divider-color)") + ";" +
        "background:transparent;color:" + (on ? "var(--global-theme-color)" : "var(--global-text-color)") + ";" +
        "font-weight:" + (on ? "700" : "400") + ";";
    };
    var seqs = [].slice.call(document.querySelectorAll(".fe1-seq"));
    var noises = [].slice.call(document.querySelectorAll(".fe1-noise"));
    function paint(list, active, attr) {
      list.forEach(function (b) { btnStyle(b, b.getAttribute(attr) === active); });
    }
    seqs.forEach(function (b) {
      b.addEventListener("click", function () {
        var s = b.getAttribute("data-seq");
        fe.setSeq(s); paint(seqs, s, "data-seq");
      });
    });
    noises.forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-noise");
        fe.setNoise(k); paint(noises, k, "data-noise");
      });
    });
    paint(seqs, "cpmg", "data-seq");
    paint(noises, "oneOverF", "data-noise");
    var nS = document.getElementById("fe1-n"), nV = document.getElementById("fe1-n-val");
    nS.addEventListener("input", function () { fe.setN(nS.value); nV.textContent = nS.value; });
    var tS = document.getElementById("fe1-t"), tV = document.getElementById("fe1-t-val");
    tS.addEventListener("input", function () {
      var t = Math.pow(10, +tS.value);
      fe.setT(t); tV.textContent = t.toFixed(t < 10 ? 2 : 1) + " μs";
    });
  })();
</script>

Two things are worth doing deliberately in that widget.

**Watch the passband move.** Keep the noise on $$1/f$$ and drag $$n$$ from 1 upward. The
filter's peak slides right, off the mountain of low-frequency noise, and $$\chi$$ drops fast.
This is the mechanism behind every reported "coherence extended by two orders of magnitude"
result in the field.

**Then switch the noise to white, and watch the trick die.** Nothing you do to $$n$$ changes
$$\chi$$ at all. That is not a bug in the widget; it is a theorem, and it is the subject of
the next section.

<div class="sec-divider" aria-hidden="true">•••</div>

## 5 · What decoupling cannot do

It would be easy to leave this post believing pulses beat noise. They do not. They beat
*slow* noise, and the boundary is sharp enough to prove.

Put white noise, $$S(\omega) = S_0$$, through the boxed formula for an arbitrary sequence.
The spectrum comes out of the integral, and what remains is a fact about the switching
function alone:

$$
\chi(t) = S_0\int_{-\infty}^{\infty}\frac{\mathrm{d}\omega}{2\pi} F(\omega,t)
= \frac{S_0}{2}\int_0^t y^2(s)\,\mathrm{d}s = \frac{S_0\, t}{2},
$$

because $$y^2 = 1$$ everywhere, whatever the pulses did. (The middle step is Parseval's
theorem; it is worked in exercise 2.) So

<div class="key-eq" markdown="1">

$$
W(t) = e^{-S_0 t/2} \qquad \text{for every pulse sequence, whatever } n \text{ and wherever the pulses sit.}
$$

</div>

**White noise is undecouplable.** Not "hard to decouple" — untouchable, exactly, by any
arrangement of any number of pulses. And the reason is the one we have been circling all
post: memoryless noise has nothing to refocus. The runners are not running at constant
speeds; they are diffusing. Turning them around at the whistle sends them diffusing right
back out again.

<p class="thread-note"><span class="thread-label">The through-line</span> This is the honest boundary of the filter picture, and it retroactively sharpens the last post. There we split "decay" into reversible ignorance and irreversible loss. Now the split has a formula: <strong>the reversible part is the noise at low frequency, and a pulse sequence is exactly the tool that decides which frequencies you are still exposed to.</strong> What survives every filter is what was genuinely irreversible.</p>

So the game is not "suppress noise" but "choose which band to be sensitive to" — and once
it is posed that way, it becomes a design problem with an optimum. Uhrig asked the natural
question: if the noise has a hard high-frequency cutoff, where should $$n$$ pulses go to
maximize coherence? The answer is *not* even spacing. It is
{% cite uhrig2007keeping --file refs_spin_qubits %}

$$
s_j = t \,\sin^2\!\left(\frac{\pi j}{2n + 2}\right),
$$

pulses bunched toward the ends of the sequence — **UDD**. This choice makes the filter
maximally flat at low frequency: the first $$2n$$ derivatives of $$F$$ vanish at
$$\omega = 0$$, so it suppresses a sharply cut-off spectrum better than CPMG does. Switch
the widget to UDD and compare. For the soft $$1/f$$ spectra of real spin qubits, though,
CPMG usually wins — a good reminder that "optimal" is always optimal *against an assumed
spectrum*.

Which raises the question that ends the post. All of this — echo, CPMG, UDD — presumes we
know $$S(\omega)$$. Nobody handed us $$S(\omega)$$.

But look at the boxed formula once more. $$\chi$$ is a *known* filter integrated against an
*unknown* spectrum, and we can choose the filter — we can make it narrow, and we can slide
it wherever we like. A narrow filter parked at frequency $$\omega_0$$ returns, in the decay
it produces, essentially the value $$S(\omega_0)$$.

We have been treating the qubit as a victim of its noise. It is also an instrument for
measuring it.

<p class="thread-note"><span class="thread-label">The through-line</span> A pulse sequence is a frequency filter — and a tunable filter plus a detector is a <em>spectrum analyser</em>. Next post: run the machinery backwards and let the qubit measure its own environment.</p>

<div class="sec-divider" aria-hidden="true">•••</div>

## 6 · Exercises

**Exercise 1 — the echo filter, and its zero.** Using the closed form for
$$\tilde{y}(\omega,t)$$, derive $$F_{\text{echo}} = 8\sin^4(\omega t/4)/\omega^2$$. Then show
that any sequence spending equal total time at $$y = +1$$ and $$y = -1$$ has
$$F(0,t) = 0$$ exactly.

<div class="learn-more-box" markdown="0">
{% details Solution %}
For the echo, $$n = 1$$ and $$s_1 = t/2$$, so

$$
\tilde{y} = \frac{1}{i\omega}\left[-e^{i\omega t} - 1 + 2e^{i\omega t/2}\right]
= \frac{-1}{i\omega}\left[e^{i\omega t/2} - 1\right]^2 ,
$$

recognising the perfect square. Therefore

$$
|\tilde{y}|^2 = \frac{\left|e^{i\omega t/2} - 1\right|^4}{\omega^2}
= \frac{\left(4\sin^2(\omega t/4)\right)^2}{\omega^2}
= \frac{16 \sin^4(\omega t /4)}{\omega^2},
$$

using $$|e^{i\theta} - 1|^2 = 4\sin^2(\theta/2)$$. Halving gives
$$F = 8\sin^4(\omega t/4)/\omega^2$$. As $$\omega \to 0$$ the numerator vanishes as
$$\omega^4$$ and the denominator only as $$\omega^2$$, so $$F \to 0$$ — the DC blindness.

For the general statement, note that at $$\omega = 0$$ the transform is just the signed area:

$$
\tilde{y}(0,t) = \int_0^t y(s)\,\mathrm{d}s = t_+ - t_- ,
$$

the time spent at $$+1$$ minus the time at $$-1$$. So
$$F(0,t) = \tfrac12 (t_+ - t_-)^2$$, which vanishes if and only if $$t_+ = t_-$$. Every
balanced sequence is exactly blind to DC; free evolution ($$t_- = 0$$) is maximally exposed
to it, with $$F(0,t) = t^2/2$$.
{% enddetails %}
</div>

**Exercise 2 — white noise is undecouplable.** Show directly from the boxed formula that a
flat spectrum gives $$\chi = S_0 t/2$$ for every sequence. (Hint: Parseval.)

<div class="learn-more-box" markdown="0">
{% details Solution %}
With $$S(\omega) = S_0$$ constant,

$$
\chi(t) = S_0 \int_{-\infty}^{\infty}\frac{\mathrm{d}\omega}{2\pi}\,
\frac{1}{2}\left|\tilde{y}(\omega,t)\right|^2 .
$$

Parseval's theorem says the frequency integral of $$|\tilde y|^2$$ equals the time integral
of $$|y|^2$$:

$$
\int_{-\infty}^{\infty}\frac{\mathrm{d}\omega}{2\pi}\left|\tilde{y}(\omega,t)\right|^2
= \int_0^t y^2(s)\,\mathrm{d}s .
$$

But $$y$$ only ever takes the values $$\pm1$$, so $$y^2(s) = 1$$ identically and the right
side is just $$t$$ — the pulses have left no trace whatsoever. Hence
$$\chi = S_0 t/2$$ and $$W = e^{-S_0t/2}$$, independent of $$n$$ and of the pulse
placement.

The physical reading: pulses can only *redistribute* the qubit's sensitivity across
frequency, never reduce its total. Parseval is the conservation law that says so. Against a
spectrum that is the same everywhere, redistribution buys nothing — which is why white noise
sets the floor that no amount of control can lift.
{% enddetails %}
</div>

**Exercise 3 — how fast does CPMG win?** Suppose the noise is a power law,
$$S(\omega) = A/\omega^{\alpha}$$ with $$\alpha > 0$$, and approximate CPMG's filter as a
narrow window centred on $$\omega_{\text{peak}} = \pi n/t$$. Show that the coherence time
grows with pulse number as $$T_2 \propto n^{\alpha/(\alpha+1)}$$, and evaluate the exponent
for $$1/f$$ noise ($$\alpha = 1$$) and for the $$\alpha = 2$$ noise often seen in GaAs.

<div class="learn-more-box" markdown="0">
{% details Solution %}
Treat the filter as concentrated at $$\omega_{\text{peak}} = \pi n/t$$. The spectral weight
it collects is $$S(\omega_{\text{peak}})$$, and the overall scale of $$\chi$$ grows linearly
with total time (each of the $$n$$ intervals contributes comparably), so

$$
\chi(t) \sim A\,\frac{t}{\omega_{\text{peak}}^{\alpha}}
= A\, t \left(\frac{t}{\pi n}\right)^{\alpha}
\propto \frac{t^{\alpha + 1}}{n^{\alpha}} .
$$

Define $$T_2$$ by $$\chi(T_2) = 1$$:

$$
\frac{T_2^{\alpha+1}}{n^{\alpha}} \sim \text{const}
\quad\Longrightarrow\quad
T_2 \propto n^{\alpha/(\alpha+1)} .
$$

For $$1/f$$ noise, $$\alpha = 1$$ and $$T_2 \propto n^{1/2}$$: a hundred pulses buy a factor
of ten. For $$\alpha = 2$$, $$T_2 \propto n^{2/3}$$ — steeper, because the noise falls off
faster, so moving the filter up in frequency is rewarded more.

Two things worth noticing. First, the exponent is a *measurement*: fit $$T_2$$ versus $$n$$,
read off $$\alpha/(\alpha+1)$$, and you have learned the spectrum's power law without ever
building a spectrum analyser. This is the seed of the next post — and it is exactly what
Medford and coauthors did in a GaAs double dot, where the observed scaling implied
$$\alpha \approx 2.6$$ {% cite medford2012scaling --file refs_spin_qubits %}. Second, the
exponent is always less than 1, so $$T_2$$ grows more slowly than the number of pulses —
and since $$\alpha \to 0$$ (white noise) sends the exponent to zero, the theorem of §5 is
recovered as the limiting case.
{% enddetails %}
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

## References

The filter-function formalism as used here is developed in
{% cite cywinski2008how --file refs_spin_qubits %}; the explicit "sequence design as filter
design" framing, including the comparison of CPMG and UDD against different spectra, is laid
out in {% cite biercuk2011dynamical --file refs_spin_qubits %}. For the original experiments,
{% cite hahn1950spin --file refs_spin_qubits %} is short and very readable. The general theory
of decoupling as a control-theoretic operation on an open system starts with
{% cite viola1998dynamical --file refs_spin_qubits %}. To go deeper on everything in this
post and the next, {% cite szankowski2017environmental --file refs_spin_qubits %} is the
review to sit down with.

{% bibliography --file refs_spin_qubits --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public post: I write these to teach myself the physics behind my PhD, with
> **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
{: .block-tip }

<script src="{{ '/assets/js/equation-numbers.js' | relative_url }}"></script>
