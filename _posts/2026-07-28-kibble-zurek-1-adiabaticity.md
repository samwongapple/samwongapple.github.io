---
layout: post
title: "When Adiabaticity Fails: Kibble–Zurek, Part 1"
date: 2026-07-28 15:00:00-0700
description: A phase transition crossed at finite speed cannot stay in equilibrium — something must go wrong, and Kibble–Zurek claims the wreckage is universal. Part 1 builds the single-mode foundations — the adiabatic theorem and the exact Landau–Zener formula — and states the freeze-out heuristic honestly, ending on a prediction left deliberately unverified.
tags: [kibble-zurek, landau-zener, quantum-quench, transverse-field-ising, adiabaticity]
categories: [kibble-zurek]
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

<!-- =====================================================================
     SERIES: "Kibble–Zurek", Part 1. Quantum-first route: quantum quenches
     + TFIM first, exact free-fermion solution next, the classical/thermal
     story folded in later.

     THROUGH-LINE (recurs in .thread-note callouts): KZM looks like a
     phenomenological freeze-out heuristic, but in the quantum Ising chain
     every step can be checked against an exact calculation; "freeze-out"
     is an adiabaticity cutoff in momentum space, and the KZ length ξ̂ is
     the causal horizon v·t̂ of critical quasiparticles.

     HOW THE SERIES IS TOLD (Sam, 2026-07-28): each post is a coherent
     story on its own and ends by opening ONE interesting question that
     the next post takes up. Do NOT print a full multi-post plan in
     reader-facing text — no "Part 3 will…, Part 4 will…" roadmaps. The
     arc below is PROVISIONAL internal planning and is expected to change;
     it exists to keep forward pointers consistent, not to be published.
       Post 1 (this): adiabatic theorem + exact LZ + KZ heuristic stated
               honestly; n ~ τ_Q^(−1/2) predicted but NOT verified here.
               Ends owing the reader that verification.
       Likely next: JW/BdG exact solution; mode-by-mode LZ; exact kink
               density; ξ̂ = v·t̂ made exact. (Do NOT derive JW here.)
       Possible later, order open: dynamical scaling + the classical/
               thermal story; full counting statistics of kinks;
               breakdowns (anti-KZ, dissipation, beyond-KZ correlations);
               hardware tests on annealers and analog simulators.

     SERIES-WIDE CONVENTIONS (fixed here, used everywhere):
     - LZ convention: H(t) = (vt/2)σ_z + (Δ/2)σ_x, minimum gap Δ at t=0,
       P_ex = exp(−πΔ²/2ħv). Never restate with a different convention.
     - ħ and J kept visible in general/LZ sections; ħ = J = 1 in TFIM
       sections, stated explicitly at the point of first use.
     - Ramp parametrization: ε(t) = t/τ_Q.
     - KZ exponents: t̂ ∝ τ_Q^{zν/(1+zν)}, ξ̂ ∝ τ_Q^{ν/(1+zν)},
       n ∝ τ_Q^{−dν/(1+zν)}; TFIM (d=ν=z=1): n ~ τ_Q^{−1/2}.
     - The exact prefactor n = 1/(2π√(2τ_Q)) is NEVER stated as
       established in this post — at most "the next post will show".
     - Refs in _bibliography/refs_kibble_zurek.bib (all DOIs verified);
       cite at point of use with a study-guide sentence, plus a
       "Suggested study path" reading-order list at the end.

     Audience: physics grad student, knows QM + basic stat mech, NOT
     assumed to know critical dynamics. Intuition in main text,
     derivations in collapsible .learn-more-box; main text must read
     cleanly with every box closed.

     Widget (build ONLY after all prose approved): assets/js/
     landau-zener-explorer.js — Bloch sphere + P_ex(t) trace, RK4,
     analytic comparison to <1% across slider range; reuse the Bloch
     sphere module from the spin-qubit posts if factorable.
     ===================================================================== -->

Take a quantum system with a phase transition, put it in its ground state on one side,
and drag the control knob across the critical point at finite speed. The endpoint you
are aiming for — the ground state on the far side — is an equilibrium object. But the
crossing itself cannot be an equilibrium process, no matter how slowly you drive. At
the critical point the energy gap closes, and with it goes the system's ability to keep
up: the time it needs to adjust to a change in the knob diverges exactly where you are
asking it to adjust. Arbitrarily slow is still too fast. Something *must* go wrong.

The Kibble–Zurek mechanism (KZM) is the claim that what goes wrong is *universal*. The
system exits the transition not in its ground state but peppered with defects —
domain walls, kinks, vortices, excitations — and KZM predicts that their density scales
as a **power law in the driving rate**, with an exponent built entirely out of the
equilibrium critical exponents of the transition. A statement about how badly you fail
to stay in equilibrium, controlled by equilibrium data alone.

<figure style="margin:1.75rem auto;text-align:center;color:var(--global-text-color);">
  <svg viewBox="0 0 760 660" width="760" style="max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Three stacked panels sharing a horizontal axis, the control knob g. Panel a: a phase strip split at a critical point g-c. To the left, the ferromagnet, drawn as six spins all pointing up, with two degenerate ground states, all up or all down. To the right, the paramagnet, drawn as six spins all pointing along the transverse field, so the up-down order is gone. An arrow above the strip shows the knob being dragged from the paramagnet across the critical point into the ferromagnet at finite speed. Panel b: two curves against the same axis. The energy gap forms a V, closing linearly to zero at the critical point; the response time, h-bar over the gap, is nearly flat away from the transition and diverges sharply at it. A shaded vertical band around the critical point is annotated: somewhere in here, no ramp is slow enough. Panel c: a chain of sixteen spins emerging after the crossing, broken into four domains separated by three kinks, each kink marked by a dashed vertical line. Caption inside the panel asks how many kinks, and notes that Kibble-Zurek predicts a power law in the ramp rate.">
    <defs>
      <marker id="kz-tip" markerWidth="7" markerHeight="7" refX="3.2" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="currentColor"/></marker>
      <marker id="kz-tip-teal" markerWidth="8" markerHeight="8" refX="3.6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--global-theme-color)"/></marker>
    </defs>

    <!-- ============ shared critical-point guide line (broken around text) ============ -->
    <g stroke="var(--global-theme-color)" stroke-opacity="0.55" stroke-width="1.3" stroke-dasharray="5 4">
      <line x1="390" y1="96" x2="390" y2="206"/>
      <line x1="390" y1="284" x2="390" y2="446"/>
    </g>

    <!-- ===================== PANEL (a): the knob and the phases ===================== -->
    <text x="20" y="40" fill="currentColor" font-size="11.5" font-family="system-ui, sans-serif" font-weight="600">(a)&#8195;the control knob, and the two phases it separates</text>

    <!-- the ramp -->
    <text x="395" y="66" fill="var(--global-theme-color)" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle">drag the knob across at finite speed</text>
    <line x1="660" y1="80" x2="132" y2="80" stroke="var(--global-theme-color)" stroke-width="2" marker-end="url(#kz-tip-teal)"/>

    <text x="384" y="93" fill="var(--global-theme-color)" font-size="10" font-family="system-ui, sans-serif" text-anchor="end">critical point</text>

    <!-- phase strip -->
    <rect x="90" y="100" width="300" height="48" fill="var(--global-theme-color)" fill-opacity="0.13"/>
    <rect x="390" y="100" width="300" height="48" fill="currentColor" fill-opacity="0.05"/>
    <rect x="90" y="100" width="600" height="48" fill="none" stroke="currentColor" stroke-opacity="0.25" stroke-width="1"/>

    <!-- ordered side: aligned spins -->
    <g stroke="currentColor" stroke-opacity="0.8" stroke-width="1.5">
      <line x1="122" y1="140" x2="122" y2="114" marker-end="url(#kz-tip)"/>
      <line x1="167" y1="140" x2="167" y2="114" marker-end="url(#kz-tip)"/>
      <line x1="212" y1="140" x2="212" y2="114" marker-end="url(#kz-tip)"/>
      <line x1="257" y1="140" x2="257" y2="114" marker-end="url(#kz-tip)"/>
      <line x1="302" y1="140" x2="302" y2="114" marker-end="url(#kz-tip)"/>
      <line x1="347" y1="140" x2="347" y2="114" marker-end="url(#kz-tip)"/>
    </g>

    <!-- disordered side: spins following the transverse field -->
    <g stroke="currentColor" stroke-opacity="0.55" stroke-width="1.5">
      <line x1="415" y1="124" x2="439" y2="124" marker-end="url(#kz-tip)"/>
      <line x1="460" y1="124" x2="484" y2="124" marker-end="url(#kz-tip)"/>
      <line x1="505" y1="124" x2="529" y2="124" marker-end="url(#kz-tip)"/>
      <line x1="550" y1="124" x2="574" y2="124" marker-end="url(#kz-tip)"/>
      <line x1="595" y1="124" x2="619" y2="124" marker-end="url(#kz-tip)"/>
      <line x1="640" y1="124" x2="664" y2="124" marker-end="url(#kz-tip)"/>
    </g>

    <text x="240" y="170" fill="currentColor" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle">ferromagnet &#8212; ordered</text>
    <text x="540" y="170" fill="currentColor" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle">paramagnet &#8212; disordered</text>
    <g fill="currentColor" fill-opacity="0.7" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle">
      <text x="240" y="187">two ground states: all &#8593; or all &#8595;</text>
      <text x="540" y="187">every spin follows the field</text>
    </g>

    <!-- ===================== PANEL (b): gap and response time ===================== -->
    <text x="20" y="252" fill="currentColor" font-size="11.5" font-family="system-ui, sans-serif" font-weight="600">(b)&#8195;the gap closes &#8212; and the time the system needs diverges</text>

    <text x="390" y="274" fill="currentColor" fill-opacity="0.85" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle">somewhere in here, no ramp is slow enough</text>

    <!-- the region where adiabaticity must fail -->
    <rect x="342" y="284" width="96" height="156" fill="currentColor" fill-opacity="0.075"/>

    <!-- axis -->
    <line x1="80" y1="440" x2="706" y2="440" stroke="currentColor" stroke-opacity="0.45" stroke-width="1.2" marker-end="url(#kz-tip)"/>
    <line x1="390" y1="440" x2="390" y2="447" stroke="var(--global-theme-color)" stroke-width="1.3"/>
    <text x="390" y="461" fill="var(--global-theme-color)" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle">g<tspan font-size="8" dy="2">c</tspan></text>
    <text x="700" y="461" fill="currentColor" fill-opacity="0.8" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="end">control knob&#8195;g</text>

    <!-- the gap: closes linearly at g_c -->
    <polyline points="90,315 390,440 690,315" fill="none" stroke="currentColor" stroke-opacity="0.85" stroke-width="2"/>
    <text x="628" y="364" fill="currentColor" font-size="10.5" font-family="system-ui, sans-serif">gap &#916;(g)</text>

    <!-- the response time h-bar/gap: diverges at g_c -->
    <g fill="none" stroke="var(--global-theme-color)" stroke-width="2">
      <polyline points="105,427 180,422 240,415 285,404 315,390 336,371 351,344 360,315 366,286"/>
      <polyline points="675,427 600,422 540,415 495,404 465,390 444,371 429,344 420,315 414,286"/>
    </g>
    <text x="150" y="396" fill="var(--global-theme-color)" font-size="10.5" font-family="system-ui, sans-serif">response time &#8463;/&#916;</text>

    <!-- ===================== PANEL (c): the wreckage ===================== -->
    <text x="20" y="520" fill="currentColor" font-size="11.5" font-family="system-ui, sans-serif" font-weight="600">(c)&#8195;what comes out the other side</text>

    <!-- kink markers -->
    <g stroke="var(--global-theme-color)" stroke-opacity="0.75" stroke-width="1.3" stroke-dasharray="4 3">
      <line x1="282" y1="550" x2="282" y2="602"/>
      <line x1="426" y1="550" x2="426" y2="602"/>
      <line x1="570" y1="550" x2="570" y2="602"/>
    </g>
    <g fill="var(--global-theme-color)" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle">
      <text x="282" y="542">kink</text>
      <text x="426" y="542">kink</text>
      <text x="570" y="542">kink</text>
    </g>

    <!-- the broken chain: four domains -->
    <g stroke="currentColor" stroke-opacity="0.8" stroke-width="1.5">
      <line x1="120" y1="592" x2="120" y2="562" marker-end="url(#kz-tip)"/>
      <line x1="156" y1="592" x2="156" y2="562" marker-end="url(#kz-tip)"/>
      <line x1="192" y1="592" x2="192" y2="562" marker-end="url(#kz-tip)"/>
      <line x1="228" y1="592" x2="228" y2="562" marker-end="url(#kz-tip)"/>
      <line x1="264" y1="592" x2="264" y2="562" marker-end="url(#kz-tip)"/>
      <line x1="300" y1="562" x2="300" y2="592" marker-end="url(#kz-tip)"/>
      <line x1="336" y1="562" x2="336" y2="592" marker-end="url(#kz-tip)"/>
      <line x1="372" y1="562" x2="372" y2="592" marker-end="url(#kz-tip)"/>
      <line x1="408" y1="562" x2="408" y2="592" marker-end="url(#kz-tip)"/>
      <line x1="444" y1="592" x2="444" y2="562" marker-end="url(#kz-tip)"/>
      <line x1="480" y1="592" x2="480" y2="562" marker-end="url(#kz-tip)"/>
      <line x1="516" y1="592" x2="516" y2="562" marker-end="url(#kz-tip)"/>
      <line x1="552" y1="592" x2="552" y2="562" marker-end="url(#kz-tip)"/>
      <line x1="588" y1="562" x2="588" y2="592" marker-end="url(#kz-tip)"/>
      <line x1="624" y1="562" x2="624" y2="592" marker-end="url(#kz-tip)"/>
      <line x1="660" y1="562" x2="660" y2="592" marker-end="url(#kz-tip)"/>
    </g>

    <text x="390" y="634" fill="var(--global-theme-color)" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle">how many kinks? KZM answers with a power law in the ramp rate</text>
  </svg>
  <figcaption style="font-size:0.85rem;opacity:0.8;max-width:34rem;margin:0.5rem auto 0;">
    The crossing, schematically — drawn for the transverse-field Ising chain that arrives in
    §3, though the shape is generic. Sweeping the knob from the disordered side to the
    ordered one, the system must choose between two degenerate ground states, all ↑ or all
    ↓. It cannot choose the same way everywhere: near the critical point the gap Δ closes,
    the response time ħ/Δ diverges, and no finite ramp rate stays adiabatic through the
    shaded window. What emerges is the ordered phase broken into domains, with a kink
    wherever two disagreeing choices meet. Their density is what the rest of this series is
    about.
  </figcaption>
</figure>

The standard telling of KZM is a freeze-out story: near the transition the system
"stops responding," its correlation length freezes at whatever value it had, and the
frozen domains convert into defects. Told this way it sounds — and is — heuristic:
nothing literally freezes, and nobody said what "stops responding" means at the level
of a wavefunction. That is precisely why I want to start the story in the quantum
Ising chain, where the heuristic's every step can be put on trial.

<p class="thread-note"><span class="thread-label">The through-line</span> The
Kibble–Zurek mechanism is usually told as a freeze-out story. In the quantum Ising
chain we can do better: every step of the heuristic can be checked against an exact
solution, and the frozen length will turn out to be a causal horizon. This series
builds that verdict from the ground up.</p>

**The plan for this post.** Everything in KZM rests on knowing, quantitatively, when a
driven quantum system can and cannot follow its ground state. So we build that
foundation first: the adiabatic theorem, stated carefully enough to trust (§1); then
the Landau–Zener problem — a single avoided crossing swept at constant rate — which is
the *minimal* quench and is solvable **exactly** (§2). With the exact formula in hand,
the "adiabatic vs. impulse" language that KZM leans on stops being folklore and
becomes a controlled description of two limits of a known answer. Then the
transverse-field Ising chain enters as a continuum of Landau–Zener crossings, one per
momentum mode (§3), and the KZ freeze-out argument is stated honestly, weak joints
flagged, delivering its headline prediction for the Ising chain: defect density
$$n \sim \tau_Q^{-1/2}$$ in the quench time $$\tau_Q$$ (§4). What this post
deliberately does *not* do is verify that prediction. Checking it means actually
solving the driven many-body problem, and that is where the next post starts.

<div class="sec-divider" aria-hidden="true">•••</div>

## 1 · The adiabatic theorem, stated carefully

Everything below concerns a Hamiltonian $$H(t)$$ that changes in time because *we*
change it — a field being ramped, a coupling being tuned. At each instant $$t$$ we can
diagonalize the snapshot:

$$
H(t)\,\lvert n(t)\rangle = E_n(t)\,\lvert n(t)\rangle .
$$

These **instantaneous eigenstates** are a family of stills from a film: each one is a
perfectly good eigenbasis *of that snapshot*, but no physical state is obliged to
follow them. The adiabatic theorem is the statement of when one does: if the system
starts in an instantaneous eigenstate $$\lvert n \rangle$$ that stays non-degenerate —
its energy gap to the rest of the spectrum never closes — and $$H(t)$$ changes slowly
enough, the state tracks $$\lvert n(t)\rangle$$ up to a phase, with corrections that
vanish as the driving slows. The theorem is as old as quantum mechanics itself; the
original proof is Born and Fock's 1928 paper
{% cite born1928 --file refs_kibble_zurek %}, worth a look mostly to see how early
this question was considered settled.

"Slowly enough" compared to *what* is the entire content. The standard practical
criterion: the drive is adiabatic with respect to the pair of levels $$n, m$$ when

$$
\frac{\hbar \,\bigl\lvert \langle m(t)\rvert\, \partial_t H \,\lvert n(t)\rangle \bigr\rvert}{\bigl[ E_m(t) - E_n(t) \bigr]^2} \;\ll\; 1
\qquad \text{for all } m \neq n .
$$

Read the dimensions off first, because they carry the physics: the matrix element
$$\langle m \rvert \partial_t H \lvert n \rangle$$ is an energy per unit time, so the
numerator $$\hbar \times \text{energy}/\text{time}$$ is an energy squared, and the
ratio is dimensionless — a genuine speedometer. The criterion compares two rates: how
fast the drive stirs amplitude between levels (numerator) against how fast quantum
phases separate those levels (denominator, through the gap).

Notice what the criterion is *not*: it is not "$$\hbar / \Delta^2$$ times the ramp
rate of some parameter." The matrix element is part of the statement, and dropping it
is how folk versions of the theorem go wrong — a drive can be slow and still
non-adiabatic if it stirs the right transition. For the ramps in this series the
distinction will be benign: we drive one parameter linearly, the matrix element
$$\langle m \rvert \partial_t H \lvert n \rangle$$ is simply proportional to the ramp
rate and stays bounded, and all the drama lives in the denominator. That is worth
saying now, because it is the shape of everything that follows: **adiabaticity dies
by the gap**, as $$1/\Delta^2$$.

<div class="learn-more-box" markdown="0">
{% details Where the criterion comes from (and when not to trust it) %}
Expand the state in the instantaneous basis, peeling off the dynamical phases:

$$
\lvert \psi(t) \rangle = \sum_m c_m(t)\, e^{i\theta_m(t)} \lvert m(t) \rangle,
\qquad
\theta_m(t) = -\frac{1}{\hbar} \int_0^t E_m(t')\, dt' .
$$

Insert into the Schrödinger equation $$i\hbar\,\partial_t \lvert\psi\rangle = H \lvert\psi\rangle$$
and project onto $$\langle m \rvert$$. The dynamical phases cancel the energies, leaving

$$
\dot c_m = -\, c_m \langle m \vert \partial_t m \rangle
\;-\; \sum_{n \neq m} c_n\, \langle m \vert \partial_t n \rangle\, e^{i(\theta_n - \theta_m)} .
$$

The first term is a phase (it becomes the Berry phase for cyclic drives — a story for
another day). The second term is the one that moves population. Differentiating
$$H \lvert n \rangle = E_n \lvert n \rangle$$ and projecting gives, for $$m \neq n$$,

$$
\langle m \vert \partial_t n \rangle = \frac{\langle m \rvert\, \partial_t H \,\lvert n \rangle}{E_n - E_m} ,
$$

so the interlevel coupling is the ratio of the drive's matrix element to the gap.
Whether that coupling actually transfers population depends on the phase factor
$$e^{i(\theta_n - \theta_m)}$$, which oscillates at the gap frequency
$$(E_m - E_n)/\hbar$$. A slowly varying coupling fighting a fast-oscillating phase
transfers almost nothing — the oscillations average the transfer away. "Slowly
varying" compared to that oscillation means

$$
\frac{\bigl\lvert \langle m \vert \partial_t n \rangle \bigr\rvert}{(E_m - E_n)/\hbar}
= \frac{\hbar\, \bigl\lvert \langle m \rvert\, \partial_t H \,\lvert n \rangle \bigr\rvert}{(E_m - E_n)^2}
\;\ll\; 1 ,
$$

which is the criterion in the main text.

One honest caveat. This argument bounds the *instantaneous* transfer rate; it does not
by itself control the accumulated transfer over a long drive, and there are engineered
counterexamples — drives with an oscillating component tuned near the gap frequency —
where the criterion is satisfied yet adiabaticity fails badly. The classic
demonstration is Marzlin and Sanders {% cite marzlin2004 --file refs_kibble_zurek %},
which set off a small literature on what the "right" adiabatic condition is. For the
monotone, linear-in-time sweeps used throughout this series none of this bites: the
phase $$\theta_n - \theta_m$$ is monotone and stationary only near the minimum gap, and
the criterion's verdict matches the exact Landau–Zener answer of §2. We are on the
safe side of the fine print — but it seemed wrong to print the criterion without it.
{% enddetails %}
</div>

The framing to carry forward is a race. A gapped quantum system has an internal
response time,

$$
\tau_{\text{response}} \sim \frac{\hbar}{\Delta} ,
$$

the time it takes the phases of the ground state and the nearest excited state to
decohere from one another — effectively, the time the system needs to *notice* that
its Hamiltonian has changed and re-relax into the new snapshot's ground state.
Adiabaticity holds while the drive gives it that time; it fails when the Hamiltonian
changes appreciably within one response time. For a gapped system you can always win
this race by slowing down. But at a quantum critical point $$\Delta \to 0$$, the
response time diverges, and *no finite ramp rate wins near the transition*. The only
question — and it is a quantitative one — is *where* on the approach the system drops
out of the race, and what state it is left holding when it does.

Before facing a closing many-body gap, we should understand a single closing gap
completely. That is the Landau–Zener problem, and it has the rare decency of being
exactly solvable.

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 2 — Landau–Zener: the minimal quench, solved exactly.
     (~700 words + two boxes. TO BE DRAFTED after §0–1 approved.)
     - Convention fixed ONCE for the series:
       H(t) = (vt/2)σ_z + (Δ/2)σ_x; instantaneous gap √((vt)²+Δ²),
       minimum Δ at t=0. Sweep from t=−∞ in ground state:
         P_ex = exp(−πΔ²/2ħv)   [dimensionless: Δ²/(ħv) — check]
       Cite zener1932 at the formula; landau1932/stueckelberg1932/
       majorana1932 in a naming footnote; damski2005 prominently as the
       "KZM *is* LZ" antecedent.
     - Adiabatic limit (πΔ²/2ħv ≫ 1) and sudden limit (≪ 1) derived FROM
       the exact formula; crossover at πΔ²/2ħv ~ 1. Introduce
       "adiabatic vs impulse" as the two limits of an exact result —
       reader meets the impulse approximation as a caricature of known
       dynamics, not as an axiom.
     - learn-more-box: route to the exact solution (Weber / parabolic
       cylinder functions), references only, no full asymptotics.
     - Timescale analysis: adiabaticity fails when time-to-crossing |t|
       equals response time ħ/Δ(t); solve self-consistently →
       t̂_LZ ~ √(ħ/v) (small Δ); show it reproduces the P_ex crossover.
       SAY EXPLICITLY: this is the KZ argument in embryo.
     ===================================================================== -->

## 2 · Landau–Zener: the minimal quench, solved exactly

Strip the quench to its bones. Keep two levels, let them approach each other at constant
speed, and give them a constant coupling so they do not actually cross:

$$
H(t) \;=\; \frac{v t}{2}\,\sigma_z \;+\; \frac{\Delta}{2}\,\sigma_x .
$$

**This convention is fixed for the rest of the series**, so it is worth reading slowly.
The $$\sigma_z$$ term is the *diabatic* energy difference: the two basis states
$$\lvert \uparrow \rangle, \lvert \downarrow \rangle$$ have energies $$\pm vt/2$$, which
sweep linearly through each other at $$t = 0$$ with relative rate $$v$$ (an energy per
unit time). The $$\sigma_x$$ term is the coupling that turns that crossing into an
avoided one. Diagonalizing the snapshot gives instantaneous energies
$$\pm\tfrac{1}{2}\sqrt{(vt)^2 + \Delta^2}$$, so the instantaneous gap is

$$
\Delta(t) \;=\; \sqrt{(vt)^2 + \Delta^2} ,
$$

which pinches down to its minimum value $$\Delta$$ exactly at $$t = 0$$ and grows
linearly away from it. (The same symbol is doing double duty: $$\Delta(t)$$ is the gap
at time $$t$$, plain $$\Delta$$ is its minimum. I keep the convention because both are
standard.)

This is a quench in miniature. Far from $$t = 0$$ the system is comfortably gapped and
the drive is adiabatic; approaching $$t = 0$$ the gap collapses toward $$\Delta$$ and
adiabaticity comes under maximum stress; afterwards the gap reopens and the damage is
done. Every ingredient of the phase-transition story is here — except that this one we
can solve.

### The exact answer

Start in the instantaneous ground state at $$t = -\infty$$ and sweep all the way to
$$t = +\infty$$. The probability of arriving in the excited state is

<div class="key-eq" markdown="1">

$$
P_{\text{ex}} \;=\; \exp\!\left(-\,\frac{\pi \Delta^2}{2 \hbar v}\right).
$$

</div>

This is exact — not a leading asymptotic, not a two-state approximation to something
larger — for the infinite linear sweep. It dates to Zener's 1932 paper
{% cite zener1932 --file refs_kibble_zurek %}, which is short, readable, and still the
clearest statement of the calculation; the details box below sketches its route.

Before using it, notice that the formula could hardly have looked otherwise. We have
three quantities — $$\Delta$$, $$v$$, $$\hbar$$ — carrying two dimensions between them
(energy and time), so exactly *one* dimensionless group can be built from them, and
$$\Delta^2/\hbar v$$ is it. Whatever the answer was going to be, it had to be a function
of that combination alone. The content of the calculation is the *function*: a pure
exponential, with a $$\pi/2$$ in the exponent.

Two limits follow immediately, and they are the two regimes the whole subject is
organized around.

**Adiabatic.** If $$\pi\Delta^2 / 2\hbar v \gg 1$$ — a small ramp rate, or a comfortable
gap — then $$P_{\text{ex}}$$ is *exponentially* small. This is a stronger statement than
the adiabatic theorem promised: not merely that excitation vanishes as the drive slows,
but that it vanishes faster than any power of the rate. The state tracks the moving
ground state and arrives essentially unexcited.

**Sudden, or diabatic.** If $$\pi \Delta^2/2\hbar v \ll 1$$, expand:
$$P_{\text{ex}} \approx 1 - \pi\Delta^2/2\hbar v$$. The excitation probability is nearly
one. This deserves a moment, because "nearly certain excitation" sounds violent and is
in fact the opposite: the sweep is so fast that the state has no time to rotate at all.
It sits still in the $$\lvert\uparrow\rangle, \lvert\downarrow\rangle$$ basis while the
Hamiltonian's eigenvectors swap underneath it — and a state that has not moved, in a
frame whose labels have swapped, *is* the excited state. Nothing was violently kicked.
Nothing moved.

The two regimes meet where the exponent is of order one,

$$
\Delta^2 \;\sim\; \hbar v
\qquad\Longleftrightarrow\qquad
\Delta \;\sim\; \sqrt{\hbar v} ,
$$

and this single scale is what the rest of the post keeps rediscovering.

<div class="learn-more-box" markdown="0">
{% details How the exact solution actually goes (and whose name is on it) %}
In the diabatic basis, write $$\lvert \psi \rangle = a_\uparrow \lvert \uparrow \rangle + a_\downarrow \lvert \downarrow \rangle$$.
The Schrödinger equation is the pair

$$
i\hbar\, \dot a_\uparrow = \frac{vt}{2}\, a_\uparrow + \frac{\Delta}{2}\, a_\downarrow ,
\qquad
i\hbar\, \dot a_\downarrow = -\frac{vt}{2}\, a_\downarrow + \frac{\Delta}{2}\, a_\uparrow .
$$

Solve the first for $$a_\downarrow$$ and substitute into the second, and you get a single
second-order equation with a coefficient quadratic in $$t$$ — after rescaling time to a
dimensionless variable, the **Weber equation**, whose solutions are the parabolic
cylinder functions $$D_\nu(z)$$. The physics then lives entirely in a connection
problem: fix the solution by its behaviour as $$t \to -\infty$$ (all amplitude in the
ground state), propagate it through the crossing, and read off the amplitudes as
$$t \to +\infty$$ using the known asymptotics of $$D_\nu$$ in different sectors of the
complex plane. Those asymptotics are messy; the modulus-squared of the connection
coefficient collapses, almost miraculously, to the clean exponential above. Zener's
paper {% cite zener1932 --file refs_kibble_zurek %} does exactly this and is the place to
read it.

There is a cheaper route worth knowing: treat the problem semiclassically and note that
the transition amplitude is governed by the complex time at which the two instantaneous
energies become degenerate, $$t_\ast = \pm i\Delta/v$$. Integrating the gap along a
contour to that point produces $$\exp(-\text{Im}\!\int\! \Delta(t)\,dt/\hbar)$$, and the
integral delivers the same $$\pi\Delta^2/2\hbar v$$. This is Landau's argument, and it
generalizes to non-linear sweeps where the exact solution is unavailable.

*On the name.* Four people published this problem in 1932, independently and within
months of each other: Landau {% cite landau1932 --file refs_kibble_zurek %}, Zener
{% cite zener1932 --file refs_kibble_zurek %}, Stückelberg
{% cite stueckelberg1932 --file refs_kibble_zurek %}, and Majorana
{% cite majorana1932 --file refs_kibble_zurek %} — the last in the context of spins in a
varying magnetic field, which is arguably the closest to how we are using it here.
"Landau–Zener" is entrenched shorthand; "Landau–Zener–Stückelberg–Majorana" is the
honest version and does appear in the literature.
{% enddetails %}
</div>

### Cross-examining the adiabatic criterion

We now have two independent statements about when this sweep is adiabatic: the exact
formula, and §1's criterion. They should agree, and checking that they do is the best
possible test of whether §1's criterion can be trusted later, where no exact answer will
be available.

The criterion needs the matrix element of $$\partial_t H = (v/2)\sigma_z$$ between the
two instantaneous eigenstates. Writing $$H(t) = \tfrac{1}{2}\vec{B}(t)\cdot\vec{\sigma}$$
with $$\vec{B} = (\Delta, 0, vt)$$, the eigenstates point along $$\pm\hat{B}$$, and the
off-diagonal element of $$\sigma_z$$ between them is $$\sin\theta$$, where $$\theta$$ is
the angle of $$\vec B$$ from the $$z$$ axis — so $$\sin\theta = \Delta/\Delta(t)$$.
(Derivation in the box below.) The criterion therefore reads

$$
\frac{\hbar\,\lvert\langle e \rvert \partial_t H \lvert g \rangle\rvert}{\Delta(t)^2}
\;=\; \frac{\hbar v \Delta}{2\,\bigl[(vt)^2 + \Delta^2\bigr]^{3/2}} \;\ll\; 1 .
$$

This is a function that is small at large $$\lvert t \rvert$$, rises as the crossing
approaches, and peaks precisely at $$t = 0$$, where it takes the value

$$
\frac{\hbar v}{2\Delta^2} .
$$

So §1 predicts: the sweep is adiabatic throughout if $$\hbar v/2\Delta^2 \ll 1$$, that is
if $$\Delta^2 \gg \hbar v /2$$. Compare with the exact crossover, $$\Delta^2 \sim
2\hbar v/\pi$$. **The same scale, differing only in an $$O(1)$$ factor** — the criterion
finds the right physics and misses the number, which is exactly the reputation a
scaling argument should have. Keep that verdict in mind; the Kibble–Zurek argument in
§4 is a scaling argument of precisely this kind, and it will earn precisely this grade.

<div class="learn-more-box" markdown="0">
{% details The matrix element, explicitly %}
For $$H = \tfrac{1}{2}\vec B \cdot \vec\sigma$$ with $$\vec B$$ in the $$xz$$ plane at
angle $$\theta$$ from $$\hat z$$, the eigenstates are

$$
\lvert g \rangle = \begin{pmatrix} -\sin(\theta/2) \\ \cos(\theta/2)\end{pmatrix},
\qquad
\lvert e \rangle = \begin{pmatrix} \cos(\theta/2) \\ \sin(\theta/2)\end{pmatrix},
$$

with $$\cos\theta = vt/\Delta(t)$$ and $$\sin\theta = \Delta/\Delta(t)$$. Acting with
$$\sigma_z$$ flips the sign of the lower component, so

$$
\begin{aligned}
\sigma_z \lvert e \rangle &= \begin{pmatrix} \cos(\theta/2) \\ -\sin(\theta/2)\end{pmatrix}, \\[4pt]
\langle g \rvert \sigma_z \lvert e \rangle
&= -\sin\tfrac{\theta}{2}\cos\tfrac{\theta}{2} \;-\; \cos\tfrac{\theta}{2}\sin\tfrac{\theta}{2}
\;=\; -\sin\theta .
\end{aligned}
$$

Since $$\partial_t H = (v/2)\sigma_z$$, this gives

$$
\bigl\lvert \langle e \rvert \partial_t H \lvert g \rangle \bigr\rvert
\;=\; \frac{v}{2}\sin\theta
\;=\; \frac{v\,\Delta}{2\,\Delta(t)} .
$$

Dividing by $$\Delta(t)^2$$ and restoring $$\hbar$$ gives the expression in the main text.
Note the structure: the numerator is proportional to the ramp rate $$v$$, as promised in
§1, and every bit of the drama is in the $$\Delta(t)^{-3}$$.
{% enddetails %}
</div>

### Freeze-out, in embryo

Here is a third way to get at the same scale, and it is the one that matters, because it
is the Kibble–Zurek argument in miniature — applied to a problem where we already know
the answer, so we can grade it.

Forget matrix elements. Ask only: *does the system have time to react?* At time $$t$$
before the crossing, two clocks are running. The system's internal clock is the response
time $$\hbar/\Delta(t)$$ from §1. The external clock is how long is left before the
crossing arrives, which is just $$\lvert t \rvert$$. While $$\lvert t \rvert$$ is the
longer of the two, the system has time to keep re-relaxing into the current ground state
and adiabaticity holds. When the two become equal, it no longer does. Setting them equal
defines a **freeze-out time** $$\hat{t}$$:

$$
\lvert \hat t \rvert \;=\; \frac{\hbar}{\Delta(\hat t\,)} \;=\; \frac{\hbar}{\sqrt{(v \hat t\,)^2 + \Delta^2}} .
$$

Take the interesting regime, where the minimum gap is small enough that the crossing is
dangerous ($$\Delta \ll \sqrt{\hbar v}$$). Then at the moment of freeze-out the gap is
dominated by the sweeping part, $$\Delta(\hat t\,) \approx v \lvert \hat t \rvert$$, and
the condition collapses to $$v \hat t^{\,2} = \hbar$$:

$$
\hat t \;\sim\; \sqrt{\hbar / v} .
$$

Check it for consistency. The gap at that moment is $$v \hat t \sim \sqrt{\hbar v}$$,
whose associated response time is $$\hbar / \sqrt{\hbar v} = \sqrt{\hbar/v} = \hat t$$ —
the estimate reproduces itself, as a self-consistent solution should. Note also what
$$\hat t$$ does *not* depend on: the minimum gap $$\Delta$$. The moment the system gives
up is set by the sweep rate alone.

Now grade it. The freeze-out picture says the system stops tracking at $$\lvert t\rvert =
\hat t$$ and is carried through the crossing unchanged. That produces substantial
excitation whenever the frozen window is wide enough to swallow the minimum-gap region —
that is, when the gap the system freezes at, $$\sqrt{\hbar v}$$, is not much bigger than
the minimum gap $$\Delta$$ it was frozen to avoid noticing. The crossover is therefore at
$$\Delta \sim \sqrt{\hbar v}$$, or $$\Delta^2 \sim \hbar v$$ — which is, once again, the
combination sitting in the exponent of the exact answer.

Three routes, one scale. That agreement is the licence on which the next two sections
operate: the freeze-out story, which will look alarmingly loose when applied to a phase
transition, is here demonstrably a correct way to find *where* things break, even though
it knows nothing about the $$\pi/2$$. Damski made exactly this point
{% cite damski2005 --file refs_kibble_zurek %}, arguing that the Landau–Zener problem is
the minimal model exhibiting the Kibble–Zurek mechanism — the closest published
antecedent of this post's framing, and the paper to read alongside §4.

One honesty note, and it is the seed of a complaint that gets much louder in §4. The
freeze-out picture is usually dressed up as the **adiabatic–impulse approximation**: the
evolution is taken to be perfectly adiabatic for $$\lvert t \rvert > \hat t$$ and
perfectly frozen for $$\lvert t \rvert < \hat t$$. But we have the exact solution here,
and it contains no such switch. Nothing freezes at $$\hat t$$; nothing thaws afterwards.
The state's overlap with the instantaneous ground state slides smoothly the whole way
through, most rapidly near the crossing. The adiabatic–impulse picture is a caricature
of that smooth curve — two straight lines drawn through a bend. It is a caricature that
gets the scale right, which is why it is useful and why it is dangerous.

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 3 — The TFIM: a continuum of avoided crossings.
     (~600 words + recap box + SVG figure. TO BE DRAFTED.)
     - H = −J Σ (σˣσˣ + g σᶻ); STATE HERE: ħ = J = 1 from this point in
       TFIM contexts. Phases g<1 FM / g>1 PM, critical g=1.
     - State (derived in the NEXT post): ε_k = 2J√(1+g²−2gcos k), gap 2J|1−g|,
       ν = z = 1; operational meaning of ν, z (ξ ~ |g−1|^−ν, τ ~ ξ^z).
       Footnote: which k the gap closes at is convention-dependent;
       be internally consistent (with this sign convention the gap closes
       at k = 0; many refs write σᶻσᶻ+σˣ and get k = π).
     - JW recap in learn-more-box for readers who know it; cite
       dziarmaga2005 ONLY as a next-post preview.
     - Key picture: long-wavelength modes = continuum of LZ crossings,
       min gap → 0 as k → k_c; slow ramp adiabatic for short-wavelength
       modes, sudden for long-wavelength — seed of momentum-space cutoff.
     - Static SVG: ε_k(g) sheets, closing gap highlighted (teal accent,
       currentColor + --global-theme-color pattern as in other posts).
     ===================================================================== -->

## 3 · The transverse-field Ising chain: a continuum of avoided crossings

Now the many-body case. The model this series lives in is a chain of spins-½ with an
Ising coupling along $$x$$ and a magnetic field along $$z$$:

$$
H \;=\; -J \sum_n \left( \sigma^x_n \sigma^x_{n+1} \;+\; g\, \sigma^z_n \right).
$$

Two terms, in open disagreement. The coupling ($$J > 0$$) rewards neighbours for
pointing the same way along $$x$$, and it can be satisfied in two ways — all
$$\rightarrow$$ or all $$\leftarrow$$. The field rewards every spin for pointing along
$$z$$, which it can do in only one way, and which is maximally uncommitted about $$x$$.
The dimensionless knob $$g$$ sets who wins. For $$g \gg 1$$ the field wins: a
**paramagnet**, unique ground state, no magnetic order along $$x$$. For $$g \ll 1$$ the
coupling wins: a **ferromagnet** with two degenerate ground states. Somewhere between,
the two terms balance, and for this model that happens exactly at

$$
g_c = 1 .
$$

That is the transition the reader has been staring at since §0, and $$g$$ is the control
knob being dragged.

**Units.** From here on I set $$\hbar = 1$$ and $$J = 1$$, so energies are measured in
units of the coupling and times in units of $$\hbar/J$$. I will write $$J$$ explicitly in
the next two displayed formulas so you can see where it sits, then drop it.

### What we are allowed to assume

The Ising chain in a transverse field is exactly solvable — that is the entire reason
this series can do what it claims. Deriving the solution is the next post's job, so here
I will simply *state* the two facts we need and flag them as debts.

The excitations are non-interacting quasiparticles labelled by a momentum $$k$$, with
energies

$$
\varepsilon_k \;=\; 2J \sqrt{\, 1 + g^2 - 2 g \cos k \,} .
$$

Every eigenstate of the model is built by occupying some set of these modes. The cheapest
excitation is the smallest $$\varepsilon_k$$, which sits at $$k = 0$$, so the energy gap
of the whole many-body system is

$$
\Delta_{\text{gap}} \;=\; \min_k \varepsilon_k \;=\; 2J\,\lvert 1 - g \rvert ,
$$

vanishing linearly as $$g \to 1$$ and reopening on the far side. There is the closing gap
of §0's panel (b), now an actual formula.

Two exponents summarize the approach to $$g_c$$, and it is worth being concrete about
what they mean operationally rather than reciting definitions. The **correlation length**
$$\xi$$ is the distance over which the spins remember each other's orientation; as the
critical point is approached it diverges as $$\xi \sim \lvert g - 1\rvert^{-\nu}$$, and
for this chain $$\nu = 1$$. The **relaxation time** is the response time we have been
using all along, $$\tau \sim \hbar/\Delta_{\text{gap}}$$, and it diverges too; the
**dynamical exponent** $$z$$ is defined by how the two divergences are tied together,
$$\tau \sim \xi^{\,z}$$, and for this chain $$z = 1$$. Equivalently
$$\Delta_{\text{gap}} \sim \lvert g-1 \rvert^{z\nu}$$, which for $$z\nu = 1$$ is the
linear closing we just wrote down.

$$z = 1$$ is a strong statement and will do real work in §4. It says length and time are
interchangeable near the critical point through a single conversion factor with units of
speed. You can see it directly by expanding $$\varepsilon_k$$ near $$g = 1$$ and small
$$k$$:

$$
\varepsilon_k \;\approx\; \sqrt{\, \Delta_{\text{gap}}^2 + (v k)^2 \,},
\qquad v = 2J ,
$$

the dispersion of a relativistic particle of mass $$\Delta_{\text{gap}}$$ and speed
$$v$$. Right at criticality the gap term vanishes and $$\varepsilon_k = v\lvert k\rvert$$:
gapless, linear, and propagating at $$v = 2J$$. That velocity is the fastest rate at
which the chain can send news to itself, and §4 will want it.

### One Landau–Zener problem per mode

Here is the picture that makes the rest of the series work.

Because the quasiparticles do not interact, a ramp of $$g$$ does not drive one
complicated many-body system. It drives an *independent two-level problem in every
momentum mode* — a mode is either excited or it is not — and each of those two-level
problems has an avoided crossing as $$g$$ sweeps past. The mode-$$k$$ gap
$$\varepsilon_k(g)$$, read as a function of $$g$$ at fixed $$k$$, dips to a minimum and
comes back up:

$$
\min_g \varepsilon_k \;=\; 2J \lvert \sin k \rvert ,
\qquad \text{attained at } g = \cos k .
$$

Compare that to §2's $$\Delta(t) = \sqrt{(vt)^2 + \Delta^2}$$ and the resemblance is not
an analogy — it is the same functional form. **The transverse-field Ising chain is a
continuum of Landau–Zener problems, one per momentum, sharing a single sweep.**

<figure style="margin:1.75rem auto;text-align:center;color:var(--global-text-color);">
  <svg viewBox="0 0 760 476" width="760" style="max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A plot of the quasiparticle energy epsilon-k against the transverse field g, for five momenta k equal to 0, 0.25, 0.5, 0.9 and 1.5. Every curve dips to a minimum and rises again, forming an avoided crossing. The k equals zero curve is a sharp V touching zero exactly at the critical field g equals one; the curves for larger k have progressively larger minima occurring at progressively smaller g. A dotted arc traces the locus of the minima, two J times the square root of one minus g squared. An arrow at the top shows the ramp sweeping g from the paramagnetic side toward the ferromagnetic side. The message is that the chain is a continuum of Landau-Zener crossings, one per momentum, with the smallest gaps belonging to the smallest momenta.">
    <defs>
      <marker id="kz3-tip" markerWidth="7" markerHeight="7" refX="3.2" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="currentColor"/></marker>
      <marker id="kz3-tip-teal" markerWidth="8" markerHeight="8" refX="3.6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--global-theme-color)"/></marker>
    </defs>

    <text x="425" y="70" fill="var(--global-theme-color)" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle">the ramp sweeps g this way</text>
    <line x1="650" y1="82" x2="202" y2="82" stroke="var(--global-theme-color)" stroke-width="1.8" marker-end="url(#kz3-tip-teal)"/>

    <line x1="395.0" y1="90" x2="395.0" y2="400" stroke="var(--global-theme-color)" stroke-opacity="0.5" stroke-width="1.3" stroke-dasharray="5 4"/>
    <text x="395.0" y="433" fill="var(--global-theme-color)" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle">g<tspan font-size="8" dy="2">c</tspan></text>
    <text x="395.0" y="452" fill="var(--global-theme-color)" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle">only k = 0 closes here</text>

    <line x1="85" y1="400" x2="712" y2="400" stroke="currentColor" stroke-opacity="0.45" stroke-width="1.2" marker-end="url(#kz3-tip)"/>
    <line x1="95" y1="400" x2="95" y2="78" stroke="currentColor" stroke-opacity="0.45" stroke-width="1.2" marker-end="url(#kz3-tip)"/>
      <line x1="95.0" y1="400" x2="95.0" y2="406" stroke="currentColor" stroke-opacity="0.45" stroke-width="1"/>
      <text x="95.0" y="419" fill="currentColor" fill-opacity="0.7" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle">0</text>
      <line x1="245.0" y1="400" x2="245.0" y2="406" stroke="currentColor" stroke-opacity="0.45" stroke-width="1"/>
      <text x="245.0" y="419" fill="currentColor" fill-opacity="0.7" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle">0.5</text>
      <line x1="395.0" y1="400" x2="395.0" y2="406" stroke="currentColor" stroke-opacity="0.45" stroke-width="1"/>
      <text x="395.0" y="419" fill="currentColor" fill-opacity="0.7" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle">1</text>
      <line x1="545.0" y1="400" x2="545.0" y2="406" stroke="currentColor" stroke-opacity="0.45" stroke-width="1"/>
      <text x="545.0" y="419" fill="currentColor" fill-opacity="0.7" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle">1.5</text>
      <line x1="695.0" y1="400" x2="695.0" y2="406" stroke="currentColor" stroke-opacity="0.45" stroke-width="1"/>
      <text x="695.0" y="419" fill="currentColor" fill-opacity="0.7" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle">2</text>
      <line x1="89" y1="400.0" x2="95" y2="400.0" stroke="currentColor" stroke-opacity="0.45" stroke-width="1"/>
      <text x="84" y="403.5" fill="currentColor" fill-opacity="0.7" font-size="10" font-family="system-ui, sans-serif" text-anchor="end">0</text>
      <line x1="89" y1="332.6" x2="95" y2="332.6" stroke="currentColor" stroke-opacity="0.45" stroke-width="1"/>
      <text x="84" y="336.1" fill="currentColor" fill-opacity="0.7" font-size="10" font-family="system-ui, sans-serif" text-anchor="end">1</text>
      <line x1="89" y1="265.2" x2="95" y2="265.2" stroke="currentColor" stroke-opacity="0.45" stroke-width="1"/>
      <text x="84" y="268.7" fill="currentColor" fill-opacity="0.7" font-size="10" font-family="system-ui, sans-serif" text-anchor="end">2</text>
      <line x1="89" y1="197.8" x2="95" y2="197.8" stroke="currentColor" stroke-opacity="0.45" stroke-width="1"/>
      <text x="84" y="201.3" fill="currentColor" fill-opacity="0.7" font-size="10" font-family="system-ui, sans-serif" text-anchor="end">3</text>
      <line x1="89" y1="130.4" x2="95" y2="130.4" stroke="currentColor" stroke-opacity="0.45" stroke-width="1"/>
      <text x="84" y="133.9" fill="currentColor" fill-opacity="0.7" font-size="10" font-family="system-ui, sans-serif" text-anchor="end">4</text>
    <text x="706" y="440" fill="currentColor" fill-opacity="0.8" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="end">transverse field&#8195;g</text>
    <text x="95" y="66" fill="currentColor" fill-opacity="0.8" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle">&#949;<tspan font-size="8" dy="2">k</tspan><tspan dy="-2">&#8201;/&#8201;J</tspan></text>

    <polyline points="95.0,265.2 101.0,265.2 107.0,265.3 113.0,265.5 119.0,265.6 125.0,265.9 131.0,266.2 137.0,266.5 143.0,267.0 149.0,267.4 155.0,267.9 161.0,268.5 167.0,269.2 173.0,269.9 179.0,270.6 185.0,271.4 191.0,272.3 197.0,273.2 203.0,274.3 209.0,275.3 215.0,276.5 221.0,277.7 227.0,279.0 233.0,280.3 239.0,281.8 245.0,283.3 251.0,284.9 257.0,286.6 263.0,288.3 269.0,290.2 275.0,292.2 281.0,294.2 287.0,296.4 293.0,298.7 299.0,301.2 305.0,303.7 311.0,306.5 317.0,309.3 323.0,312.4 329.0,315.7 335.0,319.1 341.0,322.9 347.0,326.9 353.0,331.2 359.0,336.0 365.0,341.2 371.0,347.2 377.0,354.0 383.0,362.3 389.0,373.2 395.0,400.0" fill="none" stroke="currentColor" stroke-opacity="0.42" stroke-width="1.3" stroke-dasharray="2 4"/>

      <polyline points="95.0,265.2 101.0,267.9 107.0,270.6 113.0,273.3 119.0,276.0 125.0,278.7 131.0,281.4 137.0,284.1 143.0,286.8 149.0,289.5 155.0,292.2 161.0,294.9 167.0,297.6 173.0,300.3 179.0,303.0 185.0,305.7 191.0,308.3 197.0,311.0 203.0,313.7 209.0,316.4 215.0,319.1 221.0,321.8 227.0,324.5 233.0,327.2 239.0,329.9 245.0,332.6 251.0,335.3 257.0,338.0 263.0,340.7 269.0,343.4 275.0,346.1 281.0,348.8 287.0,351.5 293.0,354.2 299.0,356.9 305.0,359.6 311.0,362.3 317.0,365.0 323.0,367.7 329.0,370.3 335.0,373.0 341.0,375.7 347.0,378.4 353.0,381.1 359.0,383.8 365.0,386.5 371.0,389.2 377.0,391.9 383.0,394.6 389.0,397.3 395.0,400.0 401.0,397.3 407.0,394.6 413.0,391.9 419.0,389.2 425.0,386.5 431.0,383.8 437.0,381.1 443.0,378.4 449.0,375.7 455.0,373.0 461.0,370.3 467.0,367.7 473.0,365.0 479.0,362.3 485.0,359.6 491.0,356.9 497.0,354.2 503.0,351.5 509.0,348.8 515.0,346.1 521.0,343.4 527.0,340.7 533.0,338.0 539.0,335.3 545.0,332.6 551.0,329.9 557.0,327.2 563.0,324.5 569.0,321.8 575.0,319.1 581.0,316.4 587.0,313.7 593.0,311.0 599.0,308.3 605.0,305.7 611.0,303.0 617.0,300.3 623.0,297.6 629.0,294.9 635.0,292.2 641.0,289.5 647.0,286.8 653.0,284.1 659.0,281.4 665.0,278.7 671.0,276.0 677.0,273.3 683.0,270.6 689.0,267.9 695.0,265.2" fill="none" stroke="var(--global-theme-color)" stroke-opacity="1.0" stroke-width="2.4" stroke-linejoin="round"/>
      <polyline points="95.0,265.2 101.0,267.8 107.0,270.4 113.0,273.0 119.0,275.6 125.0,278.2 131.0,280.8 137.0,283.4 143.0,286.0 149.0,288.6 155.0,291.1 161.0,293.7 167.0,296.3 173.0,298.8 179.0,301.3 185.0,303.9 191.0,306.4 197.0,308.9 203.0,311.4 209.0,313.9 215.0,316.4 221.0,318.8 227.0,321.3 233.0,323.7 239.0,326.1 245.0,328.5 251.0,330.9 257.0,333.3 263.0,335.6 269.0,337.9 275.0,340.1 281.0,342.4 287.0,344.5 293.0,346.7 299.0,348.7 305.0,350.7 311.0,352.7 317.0,354.6 323.0,356.4 329.0,358.0 335.0,359.6 341.0,361.1 347.0,362.4 353.0,363.6 359.0,364.6 365.0,365.4 371.0,366.0 377.0,366.4 383.0,366.6 389.0,366.6 395.0,366.4 401.0,366.0 407.0,365.3 413.0,364.5 419.0,363.4 425.0,362.3 431.0,360.9 437.0,359.5 443.0,357.9 449.0,356.2 455.0,354.4 461.0,352.5 467.0,350.5 473.0,348.5 479.0,346.4 485.0,344.3 491.0,342.1 497.0,339.9 503.0,337.6 509.0,335.3 515.0,333.0 521.0,330.7 527.0,328.3 533.0,325.9 539.0,323.5 545.0,321.0 551.0,318.6 557.0,316.1 563.0,313.6 569.0,311.1 575.0,308.6 581.0,306.1 587.0,303.6 593.0,301.1 599.0,298.5 605.0,296.0 611.0,293.4 617.0,290.9 623.0,288.3 629.0,285.7 635.0,283.1 641.0,280.5 647.0,277.9 653.0,275.4 659.0,272.8 665.0,270.2 671.0,267.5 677.0,264.9 683.0,262.3 689.0,259.7 695.0,257.1" fill="none" stroke="var(--global-theme-color)" stroke-opacity="0.62" stroke-width="1.8" stroke-linejoin="round"/>
      <polyline points="95.0,265.2 101.0,267.6 107.0,269.9 113.0,272.3 119.0,274.6 125.0,276.9 131.0,279.2 137.0,281.4 143.0,283.7 149.0,285.9 155.0,288.1 161.0,290.3 167.0,292.5 173.0,294.6 179.0,296.7 185.0,298.8 191.0,300.9 197.0,302.9 203.0,304.9 209.0,306.9 215.0,308.8 221.0,310.7 227.0,312.5 233.0,314.3 239.0,316.1 245.0,317.7 251.0,319.4 257.0,321.0 263.0,322.5 269.0,323.9 275.0,325.3 281.0,326.6 287.0,327.9 293.0,329.0 299.0,330.1 305.0,331.1 311.0,332.0 317.0,332.8 323.0,333.5 329.0,334.1 335.0,334.5 341.0,334.9 347.0,335.2 353.0,335.3 359.0,335.4 365.0,335.3 371.0,335.1 377.0,334.8 383.0,334.4 389.0,333.9 395.0,333.3 401.0,332.6 407.0,331.8 413.0,330.9 419.0,329.9 425.0,328.8 431.0,327.6 437.0,326.3 443.0,325.0 449.0,323.6 455.0,322.1 461.0,320.6 467.0,319.0 473.0,317.3 479.0,315.6 485.0,313.9 491.0,312.1 497.0,310.2 503.0,308.3 509.0,306.4 515.0,304.4 521.0,302.4 527.0,300.4 533.0,298.3 539.0,296.2 545.0,294.1 551.0,292.0 557.0,289.8 563.0,287.6 569.0,285.4 575.0,283.1 581.0,280.9 587.0,278.6 593.0,276.3 599.0,274.0 605.0,271.7 611.0,269.4 617.0,267.0 623.0,264.6 629.0,262.3 635.0,259.9 641.0,257.5 647.0,255.1 653.0,252.7 659.0,250.2 665.0,247.8 671.0,245.4 677.0,242.9 683.0,240.4 689.0,238.0 695.0,235.5" fill="none" stroke="var(--global-theme-color)" stroke-opacity="0.38" stroke-width="1.8" stroke-linejoin="round"/>
      <polyline points="95.0,265.2 101.0,266.9 107.0,268.5 113.0,270.1 119.0,271.6 125.0,273.2 131.0,274.6 137.0,276.1 143.0,277.5 149.0,278.8 155.0,280.1 161.0,281.4 167.0,282.6 173.0,283.7 179.0,284.8 185.0,285.9 191.0,286.9 197.0,287.8 203.0,288.7 209.0,289.5 215.0,290.3 221.0,291.0 227.0,291.6 233.0,292.2 239.0,292.7 245.0,293.2 251.0,293.5 257.0,293.8 263.0,294.1 269.0,294.3 275.0,294.4 281.0,294.4 287.0,294.4 293.0,294.3 299.0,294.1 305.0,293.9 311.0,293.6 317.0,293.2 323.0,292.8 329.0,292.3 335.0,291.7 341.0,291.1 347.0,290.4 353.0,289.6 359.0,288.8 365.0,288.0 371.0,287.0 377.0,286.0 383.0,285.0 389.0,283.9 395.0,282.7 401.0,281.6 407.0,280.3 413.0,279.0 419.0,277.7 425.0,276.3 431.0,274.9 437.0,273.4 443.0,271.9 449.0,270.3 455.0,268.8 461.0,267.1 467.0,265.5 473.0,263.8 479.0,262.1 485.0,260.3 491.0,258.6 497.0,256.7 503.0,254.9 509.0,253.0 515.0,251.2 521.0,249.2 527.0,247.3 533.0,245.4 539.0,243.4 545.0,241.4 551.0,239.3 557.0,237.3 563.0,235.2 569.0,233.2 575.0,231.1 581.0,229.0 587.0,226.8 593.0,224.7 599.0,222.5 605.0,220.4 611.0,218.2 617.0,216.0 623.0,213.7 629.0,211.5 635.0,209.3 641.0,207.0 647.0,204.8 653.0,202.5 659.0,200.2 665.0,197.9 671.0,195.6 677.0,193.3 683.0,191.0 689.0,188.7 695.0,186.3" fill="none" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.6" stroke-linejoin="round"/>
      <polyline points="95.0,265.2 101.0,265.4 107.0,265.5 113.0,265.5 119.0,265.5 125.0,265.5 131.0,265.4 137.0,265.2 143.0,265.0 149.0,264.8 155.0,264.4 161.0,264.1 167.0,263.6 173.0,263.2 179.0,262.6 185.0,262.0 191.0,261.4 197.0,260.7 203.0,260.0 209.0,259.2 215.0,258.4 221.0,257.6 227.0,256.6 233.0,255.7 239.0,254.7 245.0,253.6 251.0,252.5 257.0,251.4 263.0,250.3 269.0,249.0 275.0,247.8 281.0,246.5 287.0,245.2 293.0,243.8 299.0,242.5 305.0,241.0 311.0,239.6 317.0,238.1 323.0,236.6 329.0,235.0 335.0,233.5 341.0,231.9 347.0,230.2 353.0,228.6 359.0,226.9 365.0,225.2 371.0,223.4 377.0,221.7 383.0,219.9 389.0,218.1 395.0,216.3 401.0,214.4 407.0,212.5 413.0,210.6 419.0,208.7 425.0,206.8 431.0,204.9 437.0,202.9 443.0,200.9 449.0,198.9 455.0,196.9 461.0,194.9 467.0,192.8 473.0,190.8 479.0,188.7 485.0,186.6 491.0,184.5 497.0,182.4 503.0,180.3 509.0,178.2 515.0,176.0 521.0,173.8 527.0,171.7 533.0,169.5 539.0,167.3 545.0,165.1 551.0,162.9 557.0,160.6 563.0,158.4 569.0,156.2 575.0,153.9 581.0,151.6 587.0,149.4 593.0,147.1 599.0,144.8 605.0,142.5 611.0,140.2 617.0,137.9 623.0,135.6 629.0,133.3 635.0,130.9 641.0,128.6 647.0,126.2 653.0,123.9 659.0,121.5 665.0,119.2 671.0,116.8 677.0,114.4 683.0,112.0 689.0,109.7 695.0,107.3" fill="none" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.6" stroke-linejoin="round"/>
      <circle cx="395.0" cy="400.0" r="3.2" fill="var(--global-theme-color)" fill-opacity="0.9"/>
      <circle cx="385.7" cy="366.7" r="3.2" fill="var(--global-theme-color)" fill-opacity="0.9"/>
      <circle cx="358.3" cy="335.4" r="3.2" fill="var(--global-theme-color)" fill-opacity="0.9"/>
      <circle cx="281.5" cy="294.4" r="3.2" fill="var(--global-theme-color)" fill-opacity="0.9"/>
      <circle cx="116.2" cy="265.6" r="3.2" fill="var(--global-theme-color)" fill-opacity="0.9"/>

      <line x1="120" y1="112" x2="152" y2="112" stroke="var(--global-theme-color)" stroke-opacity="1.0" stroke-width="2.4"/>
      <text x="160" y="116" fill="currentColor" fill-opacity="0.85" font-size="10.5" font-family="system-ui, sans-serif">k = 0</text>
      <line x1="120" y1="129" x2="152" y2="129" stroke="var(--global-theme-color)" stroke-opacity="0.62" stroke-width="1.8"/>
      <text x="160" y="132" fill="currentColor" fill-opacity="0.85" font-size="10.5" font-family="system-ui, sans-serif">k = 0.25</text>
      <line x1="120" y1="146" x2="152" y2="146" stroke="var(--global-theme-color)" stroke-opacity="0.38" stroke-width="1.8"/>
      <text x="160" y="150" fill="currentColor" fill-opacity="0.85" font-size="10.5" font-family="system-ui, sans-serif">k = 0.5</text>
      <line x1="120" y1="163" x2="152" y2="163" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.6"/>
      <text x="160" y="166" fill="currentColor" fill-opacity="0.85" font-size="10.5" font-family="system-ui, sans-serif">k = 0.9</text>
      <line x1="120" y1="180" x2="152" y2="180" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.6"/>
      <text x="160" y="184" fill="currentColor" fill-opacity="0.85" font-size="10.5" font-family="system-ui, sans-serif">k = 1.5</text>
      <line x1="120" y1="197" x2="152" y2="197" stroke="currentColor" stroke-opacity="0.42" stroke-width="1.3" stroke-dasharray="2 4"/>
      <text x="160" y="200" fill="currentColor" fill-opacity="0.85" font-size="10.5" font-family="system-ui, sans-serif">minima: 2J&#8730;(1&#8722;g&#178;)</text>
  </svg>
  <figcaption style="font-size:0.85rem;opacity:0.8;max-width:34rem;margin:0.5rem auto 0;">
    The same ramp, seen by five different modes. Each curve is the exact quasiparticle
    energy ε<sub>k</sub> = 2J√(1 + g² − 2g cos k) plotted against the knob, and each one is
    an avoided crossing: a dip to a minimum 2J|sin k| at g = cos k, then a recovery. Only
    k = 0 pinches all the way to zero, at g<sub>c</sub> = 1 — but the modes just above it
    have minima just above zero, crowding down along the dotted arc. A ramp slow enough for
    the grey curves is still far too fast for the modes near the bottom of the teal family,
    which is why a single sweep is adiabatic and sudden at the same time.
  </figcaption>
</figure>

And now look at how those minimum gaps are distributed. For a generic mode — $$k$$ of
order one — the minimum gap is of order $$J$$, big, and a slow ramp sails through it
adiabatically. As $$k \to 0$$ the minimum gap $$2J\lvert\sin k\rvert \to 0$$, and no
matter how slowly you ramp, there are always modes near $$k = 0$$ whose gap is smaller
than anything your sweep rate can respect. Only the single mode $$k = 0$$ closes
completely; but it does not sit alone, it sits at the bottom of a continuum crowding
down to zero with it.

So the same ramp is simultaneously adiabatic and sudden, depending on which mode you ask
about. Somewhere between "fast enough to matter" and "too slow to notice" there is a
**crossover momentum** separating the modes that survive from the modes that get excited,
and its location depends on the ramp rate. That number is the whole ballgame: it converts
a statement about time (how fast you dragged the knob) into a statement about length (how
far apart the resulting defects sit). §4 estimates it by pure scaling, without ever
mentioning momentum; the next post computes it exactly, mode by mode, and the two answers
are what this series is really about.

<div class="learn-more-box" markdown="0">
{% details Recap for readers who know Jordan–Wigner (and a word on conventions) %}
If you have seen the solution before, here is the whole thing in a paragraph, purely as
orientation — the derivation is the next post's business.

The Jordan–Wigner transformation trades spins for spinless fermions, with a non-local
string attached so that spin operators on different sites, which commute, become fermion
operators, which anticommute:

$$
\sigma^z_n \;=\; 1 - 2\, c^\dagger_n c_n ,
\qquad
\sigma^x_n \;=\; \bigl(c_n + c^\dagger_n\bigr) \prod_{m < n} \bigl(1 - 2 c^\dagger_m c_m\bigr) .
$$

The Ising term becomes nearest-neighbour hopping plus pairing, the field term a chemical
potential, and $$H$$ is quadratic in fermions — the free-fermion structure this blog has
already met from the entanglement side. Fourier transforming, the Hamiltonian breaks into
independent $$2\times 2$$ blocks acting on each pair $$(k, -k)$$,

$$
H_k = 2J\bigl[\,(g - \cos k)\,\tau^z + \sin k\; \tau^x \,\bigr],
$$

with $$\tau$$ the Pauli matrices in the two-dimensional space spanned by "the pair
$$(k,-k)$$ is empty" and "the pair is occupied". Diagonalizing by a Bogoliubov rotation
gives $$\pm\varepsilon_k$$ with the $$\varepsilon_k$$ quoted above. Set that block beside
§2's $$H(t) = (vt/2)\sigma_z + (\Delta/2)\sigma_x$$: ramping $$g$$ linearly in time makes
the $$\tau^z$$ coefficient sweep linearly through zero while the $$\tau^x$$ coefficient
stays fixed at $$2J \sin k$$. It is *literally* a Landau–Zener sweep, with minimum gap set
by the momentum. That correspondence — and the exact excitation probability it yields for
each $$k$$ — is where the next post starts {% cite dziarmaga2005 --file refs_kibble_zurek %}.

*On conventions.* Which momentum goes critical is not physics, it is bookkeeping. With
the Hamiltonian written as above — ferromagnetic coupling on $$\sigma^x$$, field on
$$\sigma^z$$ — the gap closes at $$k = 0$$. Flip the sign of the coupling, put the
coupling on $$\sigma^z$$ and the field on $$\sigma^x$$, or choose the opposite sign in the
Fourier convention, and the critical mode moves to $$k = \pi$$; references differ, and
both appear in the literature. What is convention-independent is the structure: one mode
whose gap vanishes linearly in $$\lvert g - 1 \rvert$$, with a continuum of modes whose
gaps vanish linearly in their distance from it.
{% enddetails %}
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 4 — The Kibble–Zurek heuristic. (~700 words. TO BE DRAFTED.)
     - ε(t) = t/τ_Q; τ(ε) = τ₀/|ε|^{zν}; ξ(ε) = ξ₀/|ε|^ν.
     - Freeze-out: τ(ε(t)) = |t| →
         t̂ = (τ₀ τ_Q^{zν})^{1/(1+zν)},  ξ̂ = ξ₀ (τ_Q/τ₀)^{ν/(1+zν)},
         n ~ ξ̂^{−d} ~ τ_Q^{−dν/(1+zν)}.
       Dimensional analysis on every boxed equation.
     - TFIM d=ν=z=1: t̂ ~ √(τ₀τ_Q), ξ̂ ~ √(τ_Q/τ₀), n ~ τ_Q^{−1/2} —
       stated as PREDICTION, explicitly undelivered here.
     - Two weak joints, each with forward pointer:
       (1) nothing literally freezes → NEXT post (smooth mode-by-mode LZ);
       (2) n ~ ξ̂^{−d} assumes frozen length ↔ defect spacing one-for-one;
           O(1) prefactor + statistics → next post / a later one.
     - Cite zurek1996 (companion read), damski2005, zurek2005 (TFIM KZM).
     - Teaser identity, stated not cashed out: ξ̂/t̂ = ξ₀/τ₀ = v =
       quasiparticle velocity → "the frozen length is a causal horizon";
       exact in the next post. Echo the through-line thread-note here.
     ===================================================================== -->

## 4 · The Kibble–Zurek heuristic

*(to be drafted)*

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 5 — What we owe the next post. (~half page, bullet-free
     prose. TO BE DRAFTED.)
     NOTE ON FORM: this is a HOOK, not a roadmap. Do NOT enumerate Posts
     2–6 — the arc in the scaffold at top is provisional and stays
     internal. State the open question this post leaves standing and hand
     exactly that to the next post; anything further is at most a vague
     "later" gesture.
     - The debt: a power law predicted from a freeze-out picture whose two
       weak joints (§4) were flagged and not repaired. The Ising chain is
       exactly solvable, so the heuristic can be put on trial rather than
       trusted — that trial is the next post.
     - ONE historical paragraph only: kibble1976 (causality + domains in
       the early universe), zurek1985 (condensed-matter translation,
       quench-rate prediction; the series' namesake paper). Short — the
       classical narrative gets its own post later.
     - Further reading woven in: polkovnikov2011, dziarmaga2010,
       delcampo2014 (the standing reference text).
     - End with "Suggested study path" list in reading order.
     ===================================================================== -->

## 5 · What we owe the next post

*(to be drafted)*

<!-- Widget (landau-zener-explorer) + full-post integration pass happen
     only after all prose sections are approved — see scaffold at top. -->

<div class="sec-divider" aria-hidden="true">•••</div>

## References

{% bibliography --file refs_kibble_zurek --cited --group_by none %}

---

> A learning-in-public post: I write these to teach myself the physics behind my PhD, with
> **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
{: .block-tip }

<script src="{{ '/assets/js/equation-numbers.js' | relative_url }}"></script>
