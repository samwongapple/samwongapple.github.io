---
layout: post
title: Spin Qubits from the Ground Up
date: 2026-07-06 03:00:00-0700
description: How you build a qubit out of a single electron spin — trapping it, driving it, coupling two of them, and the coherence price you pay for control.
tags: [quantum-computing, spin-qubits]
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
    --thread-color: #b3760a; /* amber — a distinct 'narrative thread' colour, not the teal accent */
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
</style>

## 1 · Why spins?

A useful qubit has to do two contradictory things at once. It must be **isolated** —
sealed off from its noisy surroundings so the fragile quantum information doesn't leak
away — and it must be **controllable** — coupled to the outside world strongly enough
that we can write, rotate, and read it on demand. Isolation and control pull in opposite
directions, and essentially every qubit platform is a particular compromise between them.
Hold that tension in mind: it is the thread running through this whole post.

The spin of a single electron is one of nature's neatest answers. A spin-½ is a *genuine*
two-level system: it has exactly two states, up and down, and no third level to
accidentally leak into. That sounds trivial until you compare it with the leading
superconducting qubits, the transmons, which are really weakly anharmonic oscillators with
a whole ladder of levels — you engineer them so the qubit only ever uses the bottom two
rungs, and leakage out of that subspace is a constant worry. A spin has no such ladder.
The Hilbert space *is* the qubit.

Why is a spin so well isolated? Because its only handle on the world is a tiny magnetic
moment — about one Bohr magneton. Magnetic dipoles couple weakly to their surroundings, so
the electron's spin barely notices the electric bustle of the solid around it. That weak
coupling is exactly what buys spin qubits their long coherence times. But — and this is the
whole story in miniature — the same weak coupling that protects the spin also makes it
*hard to drive*. Whatever isolates the qubit from noise also isolates it from your control
fields. Every technique in the sections that follow is, at bottom, a way of buying back
control without giving up too much isolation.

<p class="thread-note"><span class="thread-label">The through-line</span> Isolation and control are one knob turned opposite ways. Every section below comes back to this trade-off — watch for it.</p>

There is one more reason to single out spins: they live in semiconductors. The founding
proposal of the field — Loss and DiVincenzo's scheme for encoding a qubit in the spin of a
single electron confined to a gate-defined quantum dot {% cite loss1998quantum --file refs_spin_qubits %} —
was compelling precisely because that electron sits on a semiconductor chip. If your qubit
is one electron trapped under a metal gate on silicon, then in principle the whole toolbox
of the semiconductor industry — lithography, integration, decades of materials science — is
available to scale it up. That is a motivation, not a promise; the engineering is genuinely
hard. But it is why so much effort goes into a system whose control problem we just admitted
is difficult. (For broad reviews of semiconductor spin qubits, see
{% cite hanson2007spins chatterjee2021semiconductor burkard2023semiconductor --file refs_spin_qubits %}.)

So the plan is set: trap a single electron somewhere we can reach it, and find a way to
talk to its spin. First, the trap.

<div class="sec-divider" aria-hidden="true">•••</div>

## 2 · Hosting a spin: the quantum dot

To trap one electron we build an *artificial atom*. Start with a two-dimensional electron
gas (2DEG) — a sheet of mobile electrons pinned to a plane at the interface of a
semiconductor heterostructure, or in a silicon quantum well. Then pattern metal gate
electrodes on the surface above it. Negative voltages on those gates repel the electrons
underneath, sculpting the smooth 2DEG into a small bowl-shaped potential — a **quantum
dot** — deep enough to hold a countable number of electrons. Like a real atom, this
artificial one has discrete energy levels; unlike a real atom, we get to set its depth and
occupancy by turning knobs.

<figure style="margin:1.5rem auto;text-align:center;color:var(--global-text-color);">
  <svg viewBox="0 0 420 218" width="440" style="max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Gate-defined double quantum dot potential-energy landscape">
    <defs><marker id="dd-ax" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="currentColor"/></marker></defs>
    <!-- gate electrodes -->
    <g fill="currentColor" fill-opacity="0.14" stroke="currentColor" stroke-opacity="0.5">
      <rect x="112" y="10" width="46" height="15" rx="4"/>
      <rect x="177" y="10" width="44" height="15" rx="4"/>
      <rect x="238" y="10" width="46" height="15" rx="4"/>
    </g>
    <g fill="currentColor" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle">
      <text x="135" y="21">V<tspan baseline-shift="sub" font-size="8">L</tspan></text>
      <text x="199" y="21">V<tspan baseline-shift="sub" font-size="8">M</tspan></text>
      <text x="261" y="21">V<tspan baseline-shift="sub" font-size="8">R</tspan></text>
    </g>
    <g stroke="currentColor" stroke-opacity="0.3" stroke-dasharray="3 3">
      <line x1="135" y1="25" x2="139" y2="146"/>
      <line x1="199" y1="25" x2="200" y2="96"/>
      <line x1="261" y1="25" x2="241" y2="146"/>
    </g>
    <!-- reservoir Fermi seas -->
    <g fill="var(--global-theme-color)" fill-opacity="0.16">
      <rect x="12" y="138" width="52" height="42"/>
      <rect x="316" y="138" width="52" height="42"/>
    </g>
    <g stroke="currentColor" stroke-opacity="0.35" stroke-dasharray="4 3">
      <line x1="12" y1="138" x2="64" y2="138"/>
      <line x1="316" y1="138" x2="368" y2="138"/>
    </g>
    <!-- potential U(x): source | barrier | dot1 | barrier | dot2 | barrier | drain -->
    <path d="M 15 138 H 60 Q 86 46 112 150 Q 138 166 165 150 Q 190 82 216 150 Q 241 166 268 150 Q 294 46 320 138 H 365"
          fill="none" stroke="currentColor" stroke-width="2"/>
    <!-- discrete dot levels + electrons -->
    <line x1="126" y1="149" x2="152" y2="149" stroke="var(--global-theme-color)" stroke-width="2"/>
    <line x1="228" y1="149" x2="254" y2="149" stroke="var(--global-theme-color)" stroke-width="2"/>
    <circle cx="139" cy="149" r="4.5" fill="var(--global-theme-color)"/>
    <circle cx="241" cy="149" r="4.5" fill="var(--global-theme-color)"/>
    <!-- labels -->
    <g fill="currentColor" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.85">
      <text x="38" y="198">source</text>
      <text x="342" y="198">drain</text>
      <text x="139" y="179">dot 1</text>
      <text x="241" y="179">dot 2</text>
      <text x="200" y="70">tunnel barrier</text>
      <text x="70" y="132" text-anchor="start" font-style="italic">&#956;</text>
    </g>
    <!-- energy axis -->
    <line x1="12" y1="192" x2="12" y2="38" stroke="currentColor" stroke-opacity="0.5" stroke-width="1" marker-end="url(#dd-ax)"/>
    <text x="19" y="44" fill="currentColor" font-size="11" text-anchor="start" fill-opacity="0.85">E</text>
  </svg>
  <figcaption style="font-size:0.85rem;opacity:0.8;max-width:32rem;margin:0.5rem auto 0;">
    Potential-energy landscape of a gate-defined double dot. Negative gate voltages raise
    tunnel barriers that carve two wells out of the 2DEG, each holding a countable number of
    electrons at a discrete level near the reservoir chemical potential μ. The middle gate
    V<sub>M</sub> sets the interdot tunnel coupling; the plunger gates V<sub>L</sub>,
    V<sub>R</sub> set each dot's occupancy.
  </figcaption>
</figure>

The knob that matters is electron number, and the effect that turns it *into* a knob is
**Coulomb blockade**. Cramming electrons into a tiny dot costs energy: admitting one more
means paying a charging energy fixed by the dot's minuscule capacitance, and that cost is
large compared with the thermal energy available at the ~100 mK of a dilution
refrigerator. Because thermal fluctuations can't cover the price, the electron number is
*pinned* to an integer. Sweep a gate voltage and nothing happens… nothing… then at one
special voltage it becomes favourable to admit exactly one more electron, and the
occupancy clicks up by one. Gate voltage in, integer electron number out. That staircase
is how we load a dot with a single spin.

For two electrons — which we'll need in Section 4 — the natural device is a **double
quantum dot**: two bowls side by side, each with its own gate, with a tunnel barrier
between them. The relevant knobs become the two occupancies $(N_L, N_R)$, and the map of
which charge state is stable versus the two gate voltages is the **charge stability
diagram**, the famous "honeycomb" {% cite vanderwiel2002electron --file refs_spin_qubits %}:

<figure style="margin:1.5rem auto;text-align:center;color:var(--global-text-color);">
  <svg viewBox="60 25 300 285" width="360" style="max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Double quantum dot charge stability diagram (honeycomb)">
    <defs>
      <marker id="eps-arrow" markerWidth="9" markerHeight="9" refX="4.5" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="var(--global-theme-color)"/></marker>
      <marker id="ax-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="currentColor"/></marker>
    </defs>
    <!-- highlighted cells (1,1) and (0,2) -->
    <polygon points="200,106 238.1,128 238.1,172 200,194 161.9,172 161.9,128" fill="var(--global-theme-color)" fill-opacity="0.14"/>
    <polygon points="161.9,40 200,62 200,106 161.9,128 123.8,106 123.8,62" fill="var(--global-theme-color)" fill-opacity="0.14"/>
    <!-- honeycomb cells -->
    <g fill="none" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.3">
      <polygon points="200,106 238.1,128 238.1,172 200,194 161.9,172 161.9,128"/>
      <polygon points="123.8,106 161.9,128 161.9,172 123.8,194 85.7,172 85.7,128"/>
      <polygon points="276.2,106 314.3,128 314.3,172 276.2,194 238.1,172 238.1,128"/>
      <polygon points="161.9,40 200,62 200,106 161.9,128 123.8,106 123.8,62"/>
      <polygon points="238.1,40 276.2,62 276.2,106 238.1,128 200,106 200,62"/>
      <polygon points="161.9,172 200,194 200,238 161.9,260 123.8,238 123.8,194"/>
      <polygon points="238.1,172 276.2,194 276.2,238 238.1,260 200,238 200,194"/>
    </g>
    <!-- cell labels -->
    <g fill="currentColor" font-size="13" font-family="system-ui, sans-serif" text-anchor="middle" dominant-baseline="central">
      <text x="200" y="150" font-weight="600">(1,1)</text>
      <text x="161.9" y="84" font-weight="600">(0,2)</text>
      <text x="123.8" y="150">(0,1)</text>
      <text x="276.2" y="150">(2,1)</text>
      <text x="238.1" y="84">(1,2)</text>
      <text x="161.9" y="216">(1,0)</text>
      <text x="238.1" y="216">(2,0)</text>
    </g>
    <!-- detuning epsilon across the (1,1)-(0,2) interdot transition -->
    <line x1="191" y1="134" x2="172" y2="100" stroke="var(--global-theme-color)" stroke-width="1.7" stroke-dasharray="4 3" marker-start="url(#eps-arrow)" marker-end="url(#eps-arrow)"/>
    <text x="150" y="118" fill="var(--global-theme-color)" font-size="15" font-style="italic" text-anchor="middle" font-family="system-ui, sans-serif">&#949;</text>
    <!-- gate-voltage compass -->
    <g stroke="currentColor" fill="currentColor">
      <line x1="80" y1="102" x2="110" y2="102" stroke-width="1.2" marker-end="url(#ax-arrow)"/>
      <line x1="80" y1="102" x2="80" y2="72" stroke-width="1.2" marker-end="url(#ax-arrow)"/>
      <text x="114" y="105" font-size="11" text-anchor="start" font-family="system-ui, sans-serif">V<tspan baseline-shift="sub" font-size="8">L</tspan></text>
      <text x="80" y="64" font-size="11" text-anchor="middle" font-family="system-ui, sans-serif">V<tspan baseline-shift="sub" font-size="8">R</tspan></text>
    </g>
  </svg>
  <figcaption style="font-size:0.85rem;opacity:0.8;max-width:30rem;margin:0.5rem auto 0;">
    Charge stability diagram of a double dot. Each cell is a fixed charge state
    (N<sub>L</sub>, N<sub>R</sub>); raising a gate voltage adds an electron to that dot. The
    detuning ε tunes across the (1,1)–(0,2) interdot transition (highlighted), shuttling one
    electron from the left dot to the right.
  </figcaption>
</figure>

Each cell is a region of fixed $(N_L, N_R)$; crossing a boundary adds or moves one
electron. Two cells will matter for us: $(1,1)$, one electron on each dot, and $(0,2)$,
both electrons bunched on the right dot. They meet along the *interdot transition*, and the
gate-voltage combination that drives the system across that boundary — shuttling one
electron from left to right — is the **detuning** $\varepsilon$. Remember that axis; the
entire two-qubit story in Section 4 plays out on it.

<style>
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
</style>

<div class="learn-more-box" markdown="0">
{% details Why is the stability diagram a honeycomb? (the capacitance model) %}
A double dot is, electrostatically, just two coupled capacitors. In the
**constant-interaction model** {% cite vanderwiel2002electron --file refs_spin_qubits %} the energy of
the charge state $(N_1, N_2)$ at gate-induced
charges $(n_{g1}, n_{g2}) \propto (V_{g1}, V_{g2})$ is

$$
U(N_1,N_2) = \tfrac{1}{2}E_{c1}\,(N_1 - n_{g1})^2 + \tfrac{1}{2}E_{c2}\,(N_2 - n_{g2})^2
  + E_{cm}\,(N_1 - n_{g1})(N_2 - n_{g2}),
$$

where $E_{c1}$ and $E_{c2}$ are the single-dot charging energies and $E_{cm}$ is the
**interdot (mutual) charging energy**. The dot settles into whichever integer $(N_1, N_2)$
minimises $U$, so the $(n_{g1}, n_{g2})$ plane tiles into regions of fixed charge.

The region boundaries come in three families: add an electron to dot 1
($(N_1,N_2)\,\to\,(N_1{+}1,N_2)$), add one to dot 2, or move one across the middle
($(N_1{+}1,N_2)\,\to\,(N_1,N_2{+}1)$). Each is a straight line, and each has a different
slope. When $E_{cm} = 0$ the dots are independent: only the first two families survive,
they run horizontal and vertical, and the plane is a plain **square grid**. Turn $E_{cm}$
on and the interdot term lifts the degeneracy at every four-corner, splitting it into two
**triple points** joined by a short interdot segment — the segment that carries the
$\varepsilon$ axis. That is the honeycomb. Slide the coupling from zero and watch the square
grid open up:

<div style="border:1px solid var(--global-divider-color);border-radius:8px;padding:1rem;margin:1.25rem 0;">
  <div id="cs1-mount"></div>
  <div style="display:flex;flex-wrap:wrap;gap:1rem;align-items:center;justify-content:center;margin-top:0.75rem;font-size:0.9rem;">
    <label style="display:flex;align-items:center;gap:0.5rem;">
      interdot coupling E<sub>cm</sub>
      <input id="cs1-ecm" type="range" min="0" max="0.6" step="0.02" value="0.3">
      <span id="cs1-ecm-val" style="min-width:2.6em;font-variant-numeric:tabular-nums;">0.30</span>
    </label>
    <span style="opacity:0.7;">0 → square grid&nbsp;·&nbsp;larger → honeycomb</span>
  </div>
</div>

The highlighted cells are the $(1,1)$ and $(0,2)$ states from the main text; at $E_{cm}=0$
they touch only at a point, and as the coupling grows they develop the shared
$\varepsilon$ edge that the whole two-qubit story rides on.
{% enddetails %}
</div>

<script src="{{ '/assets/js/charge-stability.js' | relative_url }}"></script>
<script>
  (function () {
    var mount = document.getElementById("cs1-mount");
    if (!mount || typeof createChargeStability !== "function") return;
    var cs = createChargeStability(mount, { size: 300, ecm: 0.3 });
    var w = document.getElementById("cs1-ecm"), v = document.getElementById("cs1-ecm-val");
    w.addEventListener("input", function () { cs.setCoupling(w.value); v.textContent = (+w.value).toFixed(2); });
    var det = mount.closest("details");
    if (det) det.addEventListener("toggle", function () { if (det.open) cs.redraw(); });
  })();
</script>

Trapping the electron is only half the job — we also have to *read it out*, and here a spin
hides a problem: a single spin's magnetic moment is far too faint to detect directly. The
trick is **spin-to-charge conversion** — arrange things so the spin decides whether the
electron can *move*, then detect the motion instead. In Elzerman readout {% cite elzerman2004single --file refs_spin_qubits %} you tune the dot
so a spin-up electron has just enough energy to tunnel out to a nearby reservoir while a
spin-down electron does not; the spin state becomes a charge-tunnelling event. A second
mechanism we'll meet in Section 4 — **Pauli spin blockade**, where two electrons may share
one dot only if their spins form a singlet {% cite ono2002current --file refs_spin_qubits %} — turns a *two*-spin state into a charge signal
the same way. Either route, we never measure the spin directly: we build a situation where
a charge has to move if and only if the spin is in a particular state, and then we watch
the charge with a nearby electrometer (a quantum point contact or single-electron
transistor). We never ask the spin what it's doing — we get a charge to snitch on it.

One last choice colours everything downstream: the host material. GaAs was the workhorse
for years — clean, well understood — but it carries a hidden tax we'll pay in Section 5:
every gallium and arsenic nucleus has a spin, so the electron sits in a storm of
$\sim\,10^5$–$10^6$ fluctuating nuclear magnets. Silicon can be **isotopically purified**
into nearly spin-free $^{28}$Si, giving the electron a quiet neighbourhood to live in. That
single decision — move to a quieter host — is why so much of the field has migrated to
silicon.

<div class="sec-divider" aria-hidden="true">•••</div>

## 3 · Single-spin control

We have one electron parked in a quantum dot. How do we turn it into a qubit we can
actually rotate? Everything starts with a static magnetic field.

### Larmor precession and the Bloch sphere

Put the electron in a field $B_0$ along $z$. Its two spin states split in energy by the
Zeeman effect, described by

$$
H_0 = \tfrac{1}{2}\hbar\omega_0\,\sigma_z , \qquad \omega_0 = \frac{g\mu_B B_0}{\hbar},
$$

where $\omega_0$ is the **Larmor frequency**. Any state that isn't exactly $\lvert 0\rangle$
or $\lvert 1\rangle$ has a transverse component that rotates about $z$ at $\omega_0$ — the
spin *precesses*, like a gyroscope in gravity.

It pays to picture this geometrically. Every pure single-qubit state maps to a point on
the unit sphere through the expectation value of the Pauli operators,
$\mathbf{r} = \langle\boldsymbol{\sigma}\rangle$ — the **Bloch vector**. The north pole is
$\lvert 0\rangle$, the south pole $\lvert 1\rangle$, and the equator holds the equal
superpositions. Under $H_0$ the Bloch vector just spins about the vertical axis. That is
motion, but not yet *control*: to steer the spin anywhere on the sphere we need a knob
transverse to $z$.

### Driving the spin: ESR and the rotating frame

The knob is a small oscillating magnetic field along $x$ — magnetic resonance. Add

$$
H_1(t) = \tfrac{1}{2}\hbar\omega_1\cos(\omega t)\,\sigma_x ,
$$

with drive frequency $\omega$ and strength set by $\omega_1 = g\mu_B B_1/\hbar$ (the same
Zeeman form as $H_0$, now with a small oscillating field $B_1$). The full Hamiltonian is
messy because it is time-dependent, but it simplifies enormously if we stop watching from
the lab and instead co-rotate with the drive. Moving to the frame rotating at $\omega$
about $z$, and dropping the fast counter-rotating term that averages to nothing (the
**rotating-wave approximation**), the Hamiltonian becomes *static*:

$$
H = \tfrac{1}{2}\hbar\left(\Omega\,\sigma_x + \Delta\,\sigma_z\right),
\qquad \Delta = \omega_0 - \omega, \qquad \Omega = \tfrac{1}{2}\omega_1 .
$$

<div class="learn-more-box" markdown="0">
{% details Derivation: from the lab frame to the static rotating-frame Hamiltonian %}
Start in the lab frame with the static field plus the drive:

$$
H_\text{lab}(t) = \tfrac{1}{2}\hbar\omega_0\,\sigma_z + \tfrac{1}{2}\hbar\omega_1\cos(\omega t)\,\sigma_x .
$$

Move into the frame rotating at the drive frequency $\omega$ about $z$ with
$U(t) = e^{\,i\omega t\,\sigma_z/2}$, so $\lvert\tilde\psi\rangle = U(t)\lvert\psi\rangle$. A
time-dependent change of frame adds a generator term to the Hamiltonian:

$$
\tilde H = U H_\text{lab} U^\dagger + i\hbar\,(\partial_t U)\,U^\dagger .
$$

That generator term is $i\hbar(\partial_t U)U^\dagger = -\tfrac12\hbar\omega\,\sigma_z$, and since
$U$ commutes with $\sigma_z$ the field part collapses to $\tfrac12\hbar(\omega_0-\omega)\sigma_z$.
The drive is the interesting piece; rotating $\sigma_x$ gives

$$
U\,\sigma_x\,U^\dagger = \sigma_x\cos\omega t - \sigma_y\sin\omega t ,
$$

so the drive term becomes

$$
U\,\left(\tfrac12\hbar\omega_1\cos\omega t\,\sigma_x\right)\,U^\dagger
  = \tfrac12\hbar\omega_1\cos\omega t\,\big(\sigma_x\cos\omega t - \sigma_y\sin\omega t\big).
$$

Now use $\cos^2\omega t = \tfrac12(1+\cos 2\omega t)$ and
$\cos\omega t\,\sin\omega t = \tfrac12\sin 2\omega t$ to split it into a slow and a fast part:

$$
= \underbrace{\tfrac14\hbar\omega_1\,\sigma_x}_{\text{slow — co-rotating}}
  \;+\; \underbrace{\tfrac14\hbar\omega_1\big(\cos 2\omega t\,\sigma_x - \sin 2\omega t\,\sigma_y\big)}_{\text{fast — counter-rotating, }\sim 2\omega} .
$$

The **rotating-wave approximation** discards the fast $2\omega$ terms. This is legitimate when
the drive is weak compared with the splitting, $\omega_1 \ll \omega_0 \approx \omega$: over one
Rabi period those terms oscillate many times and average to nothing. What is left is
*time-independent*:

$$
\tilde H = \tfrac12\hbar(\omega_0-\omega)\,\sigma_z + \tfrac14\hbar\omega_1\,\sigma_x
  = \tfrac12\hbar\big(\Omega\,\sigma_x + \Delta\,\sigma_z\big),
\qquad \Delta = \omega_0-\omega, \quad \Omega = \tfrac12\omega_1 .
$$

The factor of two in $\Omega = \tfrac12\omega_1$ is the RWA's fingerprint: a linearly polarised
drive is really two counter-rotating circular fields, and only the co-rotating half does the
work.
{% enddetails %}
</div>

This little Hamiltonian is the workhorse of the entire field. Two knobs: the **Rabi
frequency** $\Omega$ (how hard you drive) and the **detuning** $\Delta$ (how far off
resonance you sit). In Bloch-vector language it says the state precesses about a fixed
axis $\mathbf{n} \propto (\Omega, 0, \Delta)$ at the **generalized Rabi frequency**

$$
\Omega_R = \sqrt{\Omega^2 + \Delta^2}.
$$

### Rabi oscillations, geometrically

Everything about single-qubit gates is in that tilted axis. Start at the north pole
$\lvert 0\rangle$ and let it evolve:

- **On resonance** ($\Delta = 0$) the axis lies flat along $x$. The state swings in the
  $y$–$z$ plane straight through both poles: full-contrast **Rabi flopping** between
  $\lvert 0\rangle$ and $\lvert 1\rangle$, with excited-state population
  $P_1(t) = \sin^2(\Omega t/2)$.
- **Detuned** ($\Delta \neq 0$) the axis tilts up toward $z$. Now the state cones around
  a slanted axis and never reaches the south pole: the oscillation is *faster* (at
  $\Omega_R$) but has *reduced contrast*, $P_1^{\max} = \Omega^2/\Omega_R^2 < 1$.

Drag the sliders below and watch it happen — the labels $\Omega$ and $\Delta$ are exactly
the two knobs in the Hamiltonian above.

<div class="bloch-widget" style="border:1px solid var(--global-divider-color);border-radius:8px;padding:1rem 1rem 1.25rem;margin:1.5rem 0;">
  <div id="bs1-mount" style="display:flex;justify-content:center;"></div>
  <div style="display:flex;flex-wrap:wrap;gap:1.25rem;align-items:center;justify-content:center;margin-top:0.75rem;font-size:0.9rem;">
    <label style="display:flex;align-items:center;gap:0.5rem;">
      Ω <input id="bs1-omega" type="range" min="0" max="3" step="0.05" value="1">
      <span id="bs1-omega-val" style="min-width:2.4em;font-variant-numeric:tabular-nums;">1.00</span>
    </label>
    <label style="display:flex;align-items:center;gap:0.5rem;">
      Δ <input id="bs1-delta" type="range" min="-3" max="3" step="0.05" value="0">
      <span id="bs1-delta-val" style="min-width:2.8em;font-variant-numeric:tabular-nums;">0.00</span>
    </label>
    <span>P<sub>1</sub> = <span id="bs1-p1" style="font-variant-numeric:tabular-nums;">0.00</span></span>
    <span style="display:flex;gap:0.5rem;">
      <button id="bs1-toggle" type="button" style="cursor:pointer;padding:0.25rem 0.75rem;border-radius:6px;border:1px solid var(--global-divider-color);background:transparent;color:var(--global-text-color);">Pause</button>
      <button id="bs1-reset" type="button" style="cursor:pointer;padding:0.25rem 0.75rem;border-radius:6px;border:1px solid var(--global-divider-color);background:transparent;color:var(--global-text-color);">Reset</button>
    </span>
  </div>
</div>

<script src="{{ '/assets/js/bloch-sphere.js' | relative_url }}"></script>
<script>
  (function () {
    var mount = document.getElementById("bs1-mount");
    if (!mount || typeof createBlochSphere !== "function") return;
    var p1 = document.getElementById("bs1-p1");
    var bs = createBlochSphere(mount, {
      omega: 1, delta: 0, size: 320,
      onState: function (s) { p1.textContent = s.p1.toFixed(2); },
    });
    var wO = document.getElementById("bs1-omega"), wD = document.getElementById("bs1-delta");
    var vO = document.getElementById("bs1-omega-val"), vD = document.getElementById("bs1-delta-val");
    wO.addEventListener("input", function () { bs.setOmega(wO.value); vO.textContent = (+wO.value).toFixed(2); });
    wD.addEventListener("input", function () { bs.setDelta(wD.value); vD.textContent = (+wD.value).toFixed(2); });
    var tg = document.getElementById("bs1-toggle");
    tg.addEventListener("click", function () { tg.textContent = bs.toggle() ? "Pause" : "Play"; });
    document.getElementById("bs1-reset").addEventListener("click", function () { bs.reset(); });
  })();
</script>

### From resonance to a real gate

There is a catch we flagged at the very start: the electron spin barely couples to
anything, which is wonderful for coherence and painful for control. A raw oscillating
magnetic field of the size we can generate on-chip drives $\Omega$ only weakly. The
engineering fix is **electric-dipole spin resonance (EDSR)**: instead of waving a
magnetic field at the spin, we shake the electron *spatially* with a fast electric gate
voltage, and let either a micromagnet's field gradient or the material's intrinsic
spin–orbit coupling convert that motion into an effective transverse magnetic drive.
Electric fields are easy to apply quickly and locally, so EDSR buys back the control
handle that isolation took away — the same tension, resolved by clever engineering.

<p class="thread-note"><span class="thread-label">The through-line</span> There it is again — EDSR buys back the control that isolation took away. In §5 we'll pay for that electric handle with charge noise.</p>

Once you can set $\Omega$ and $\Delta$, a **gate is just a timed pulse**. Sit on
resonance ($\Delta = 0$) and leave the drive on for exactly half a Rabi period,
$t_\pi = \pi/\Omega$: the Bloch vector rotates from the north pole to the south pole — an
$X$ gate. Stop at a quarter period and you have a Hadamard-like $\pi/2$ rotation; change
the drive's phase and you rotate about $y$ instead of $x$. With typical numbers
($\Omega/2\pi \sim 1\text{–}10\,\text{MHz}$) a full $\pi$ rotation takes on the order of
$t_\pi \sim 100\,\text{ns}$. Every single-qubit gate in the rest of this series is a
choice of axis, angle, and duration on the sphere you just played with.

<div class="sec-divider" aria-hidden="true">•••</div>

## 4 · Two spins: exchange

One spin gave us a qubit. To compute we need two qubits that can *interact*, and the
interaction that couples neighbouring spins in a double dot is the **exchange** coupling.
Where does it come from? Not from any magnetic force between the spins — that is absurdly
weak. It comes from a charge process, dressed up by the Pauli principle.

Put one electron in each dot — the $(1,1)$ charge state from §2. The tunnel barrier lets an
electron briefly hop next door and back, and whether it *may* is decided by Pauli. If the
two spins form a **singlet** (antisymmetric in spin), the orbital part may be symmetric, so
both electrons are allowed to pile momentarily into the same dot — the $(0,2)$ state. If
they form a **triplet** (symmetric in spin), they are forbidden from sharing the lowest
orbital. Only the singlet gets to lower its energy through these virtual excursions to
$(0,2)$, and second-order perturbation theory gives the size of the push-down:

$$
J \approx \frac{4t^2}{U},
$$

with $t$ the tunnel coupling and $U$ the cost of double occupancy {% cite burkard1999coupled --file refs_spin_qubits %}.
That singlet–triplet splitting *is* the exchange energy.

Sit with that for a moment, because it is the condensed-matter jewel of the whole subject:
a **charge** process — virtual tunnelling, set by a Coulomb energy — produces a **spin**
interaction, purely because Pauli welds spin symmetry to orbital symmetry. We never wrote
down a spin–spin force; it *emerged* from the question of who is allowed to be where.
Packaged as a Heisenberg coupling, it reads

$$
H_\text{exch} = J(\varepsilon)\,\mathbf{S}_1 \cdot \mathbf{S}_2 .
$$

And here is why it is useful: $J$ is a **knob**. It depends on the detuning $\varepsilon$ and
the barrier — pull the dots apart and $J \to 0$; push toward the $(1,1)$–$(0,2)$ anticrossing
and $J$ swells, exponentially sensitive and switchable in **nanoseconds**. (Compare a fixed
magnetic dipole coupling, which you are simply stuck with.) Turn $J$ on for a set time and
the two spins partly trade places; the pulse that produces a half-swap, $\sqrt{\text{SWAP}}$,
is an entangling two-qubit gate — together with the single-spin rotations of §3, that is a
universal set {% cite loss1998quantum --file refs_spin_qubits %}.

There is a slicker way to use exchange, and it reorganises everything. Instead of one qubit
per spin, encode **one qubit in two spins**, living in the $m=0$ subspace $\{S, T_0\}$. Now
exchange is not the coupler between qubits — it is the qubit's own **z-axis**: $J(\varepsilon)$
is the energy splitting between $S$ and $T_0$, so a pulse of $\varepsilon$ is a $z$-rotation.
What supplies the **x-axis**? A magnetic field *difference* between the two dots,
$\Delta B_z$, which couples $S$ and $T_0$ directly. In GaAs the always-present hyperfine
field gradient — the very nuclear-spin noise that will torment single spins in §5 — can be
pressed into service as exactly this control axis: a bug turned into a feature
{% cite petta2005coherent --file refs_spin_qubits %}.

Best of all, control and readout live in the same diagram. Sweep $\varepsilon$ to the right
and the singlet dives into the $(0,2)$ dot while any triplet stays stuck in $(1,1)$ — **Pauli
spin blockade** again — turning the spin state into the charge signal of §2. The plot below
is the whole story on one axis: on the left (deep $(1,1)$) the tunable $J(\varepsilon)$ gap
that runs the gates; on the right the singlet plunging into $(0,2)$ for readout. Drag
$\varepsilon$, and toggle the gradient to open the $S$–$T_0$ avoided crossing that is the
qubit's x-axis.

<div style="border:1px solid var(--global-divider-color);border-radius:8px;padding:1rem;margin:1.5rem 0;">
  <div id="dd1-mount"></div>
  <div style="display:flex;flex-wrap:wrap;gap:1.25rem;align-items:center;justify-content:center;margin-top:0.75rem;font-size:0.9rem;">
    <label style="display:flex;align-items:center;gap:0.5rem;">
      detuning ε
      <input id="dd1-eps" type="range" min="-6" max="6" step="0.1" value="-2">
      <span id="dd1-eps-val" style="min-width:3em;font-variant-numeric:tabular-nums;">−2.0</span>
    </label>
    <label style="display:flex;align-items:center;gap:0.4rem;cursor:pointer;">
      <input id="dd1-grad" type="checkbox"> magnetic gradient ΔB<sub>z</sub>
    </label>
  </div>
</div>

<script src="{{ '/assets/js/double-dot-levels.js' | relative_url }}"></script>
<script>
  (function () {
    var mount = document.getElementById("dd1-mount");
    if (!mount || typeof createDoubleDotLevels !== "function") return;
    var dd = createDoubleDotLevels(mount, { eps: -2, gradVal: 0.6 });
    var e = document.getElementById("dd1-eps"), ev = document.getElementById("dd1-eps-val");
    e.addEventListener("input", function () { dd.setEps(e.value); ev.textContent = (+e.value).toFixed(1); });
    document.getElementById("dd1-grad").addEventListener("change", function () { dd.setGradient(this.checked); });
  })();
</script>

One last step completes a pattern. §3 controlled a single spin with a microwave drive; here
two spins gave us both a qubit and an entangling gate. Push once more: **three** spins in a
row, coupled by exchange *alone*, can encode a qubit and perform every gate with no microwave
drive at all — "exchange-only" operation, universal from a single tunable interaction
{% cite divincenzo2000universal --file refs_spin_qubits %}. One spin, two spins, three spins;
each rung adds a layer of control, and exchange is the thread running up the ladder.

<div class="sec-divider" aria-hidden="true">•••</div>

## 5 · Coherence and its enemies

We can now trap a spin, rotate it, couple two of them, and read them out. The hardest
question is the one left: how long does the quantum information survive? Three timescales
tell the story. **$T_1$** is the relaxation time — how long before the spin flips from
excited to ground, dumping its energy into the environment; for spins this is mercifully
long, often milliseconds to seconds. **$T_2$** is the coherence time — how long a
superposition keeps its phase; this is the one that hurts. And **$T_2^{\ast}$** is the coherence
you actually measure in a plain experiment, cut short by *slow* noise that varies from one
shot to the next. The gap between $T_2$ and $T_2^{\ast}$ is the whole game — and it is where the
next post lives.

Two enemies dominate, and each is an old friend from an earlier section.

The first is **hyperfine coupling** to the nuclei of the host. In GaAs every atom carries a
nuclear spin, so the electron sits in a bath of $\sim\,10^5$–$10^6$ tiny magnets whose net
field — the Overhauser field — drifts slowly and randomly. The electron's Larmor frequency
wanders with it, scrambling the phase and giving a dishearteningly short
$T_2^{\ast} \sim 10\,\text{ns}$ in GaAs. There are two escapes: purify the host to nearly
spin-free $^{28}$Si so the bath all but vanishes {% cite veldhorst2015two --file refs_spin_qubits %},
or — because the field drifts *slowly* — refocus it with echo pulses, which is exactly the
doorway into dynamical decoupling {% cite petta2005coherent --file refs_spin_qubits %}.

The second enemy is the sharper irony. Everything that made the spin *controllable* in §3
and §4 — EDSR, exchange, the electric knob on $\varepsilon$ — coupled it to electric fields.
And electric fields are noisy: charges trap and release in the oxide and at interfaces,
jittering the very potentials that define the dots. **Charge noise** is the price of
electrical control {% cite burkard2023semiconductor --file refs_spin_qubits %}.

<p class="thread-note"><span class="thread-label">The through-line</span> And there is the bill. §1 warned that isolation and control are one knob turned opposite ways; charge noise is what you pay for turning it toward control.</p>

Put a number on it. Even a good $T_2^{\ast} \sim 1\,\mu\text{s}$ against $\sim 100\,\text{ns}$
gates leaves only $\sim 10^3$–$10^4$ operations before coherence is gone — not enough for a
fault-tolerant machine. But here is the hopeful part, and the hook for what comes next: much
of this noise is *slow*, and slow noise can be undone. Keep flipping the qubit so the
wandering error averages away — **dynamical decoupling** — and the effective coherence time
stretches by orders of magnitude. That is the subject of the next post.

<div class="sec-divider" aria-hidden="true">•••</div>

## 6 · The landscape

Gate-defined dots are not the only way to hold a spin, and the alternatives are worth a
glance — each strikes a different bargain with the same isolation-versus-control trade-off.

**Donors.** Instead of trapping an electron under a gate, use the electron or nuclear spin of
a single phosphorus atom implanted in silicon — the idea Kane proposed in 1998
{% cite kane1998silicon --file refs_spin_qubits %}. In isotopically purified $^{28}$Si these
spins hold coherence records — seconds for the nuclear spin. The price is placement: putting
individual atoms exactly where you want them, and wiring up to them, is brutally hard.

**Hole spins.** Use the *absence* of an electron — a hole — instead. Holes carry strong
spin–orbit coupling, so they can be driven all-electrically and fast, with no micromagnet, in
silicon or germanium. The same spin–orbit that buys the speed also opens fresh noise
channels, so it is a trade rather than a free lunch — but it is one of the field's liveliest
frontiers.

**NV centres.** A nitrogen–vacancy defect in diamond is a different regime entirely: an
optically addressable spin that works at room temperature, prized less for building processors
than for quantum *sensing* — magnetometry at the nanoscale.

Every one of these — gate dots, donors, holes, NV centres, and the silicon two-qubit gates
now emerging {% cite veldhorst2015two --file refs_spin_qubits %} — is answering the question
we started with: how do you isolate a quantum system well enough to keep it, yet couple to it
well enough to use it? The whole field is a catalogue of answers to that single tension.
Which is where we came in.

<div class="sec-divider" aria-hidden="true">•••</div>

## References

{% bibliography --file refs_spin_qubits --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public post: I write these to teach myself the physics behind my PhD, with
> **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
{: .block-tip }

