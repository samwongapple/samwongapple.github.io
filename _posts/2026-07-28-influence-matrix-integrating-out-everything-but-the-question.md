---
layout: post
title: "The Influence Matrix: Integrating Out Everything But the Question"
date: 2026-07-28 03:00:00-0700
description: A local observable is a handful of numbers, yet the naive route simulates the exponentially large whole. The influence matrix is what survives when you integrate out everything but the question — the environment, made concrete as a single state in the time direction.
tags: [influence-matrix, tensor-networks, many-body-dynamics, temporal-entanglement]
categories: [influence-matrix]
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
</style>

<!-- =====================================================================
     SERIES: "The Influence Matrix" — Part 1 of 5 (a 6th may be added).
     Arc: the IM approach to condensed-matter dynamics (Abanin group line).
     Framing: the bath is a many-body system in its own right; the IM is a
     window into its dynamical phase. NOT the open-quantum-systems /
     process-tensor lens — that connection gets at most ONE sentence in
     Post 5's outlook, nowhere else.

     THROUGH-LINE (recurs in .thread-note callouts, escalating over the
     series): a many-body system, seen from inside, is a state in time.
       Post 1: that state exists.
       Post 2: its entanglement is the system's memory of itself;
               chaotic can mean memoryless (perfect dephaser).
       Post 3: dynamical phases are visible in it.
       Post 4: for free fermions it's Gaussian — one temporal correlation
               matrix (inherits the free-fermion post's machinery).
       Post 5: compressing it solves impurity/transport problems that
               resisted every spatial method.

     Audience: curious undergrads AND PhD peers simultaneously. Intuition
     in the main text, derivations in collapsible .learn-more-box.

     Companion: every post pairs with a programming-section entry.
     Companion 1 = exact dense IM for small Floquet chains, plain Julia.
     Widget: assets/js/influence-matrix-rotation.js (space-time rotation
     explorer; built after sections 2–3 are stable).
     ===================================================================== -->

<!-- =====================================================================
     SECTION 1 — The question the bath must answer (~450 words, minimal
     math; WRITE AFTER sections 2–4 exist — hooks read better then).
     - Open with the condensed matter framing directly: in a quench or a
       driven chain, any local subsystem — one site, one impurity —
       experiences the rest of the system as its bath. Local observables
       <O(t)> are a handful of numbers, yet the naive route simulates the
       exponentially large whole.
     - Feynman & Vernon's 1963 dream: integrate the environment out once.
       What survives is a *functional* — a weight on system trajectories
       encoding everything the environment will ever do. One historical
       paragraph; path-integral details deferred.
     - The modern twist: for a lattice system in discrete time (Floquet
       circuit), that functional is a concrete finite-dimensional VECTOR —
       the influence matrix — living in the temporal Hilbert space, and
       tensor-network tools apply to it directly.
     - Set expectations: this post constructs the IM exactly; the payoff
       (compressibility, and what TE says about the many-body dynamics
       itself) starts in Post 2.
     - Intro line naming this as Part 1 of the series goes here.
     ===================================================================== -->

## 1 · The question the bath must answer

*This is Part 1 of a series on the influence matrix approach to many-body dynamics — the
"tools from my research" thread continues. Each part pairs with a hands-on numerical
companion in the [programming section]({{ '/programming/' | relative_url }}).*

Here is a dishonest fraction, and every many-body theorist has paid for it. Take a chain of
$$L$$ interacting spins, quench it or drive it, and ask the most modest question available:
what does *one site* do? The answer, $$\langle Z_1(t)\rangle$$, is a handful of real
numbers — one per time step. But the machine that produces those numbers is the full
many-body state, $$2^L$$ complex amplitudes churning under the dynamics, and the standard
route to the handful is to simulate the churn. Exponential cost in, a few numbers out. The
ratio of what you compute to what you wanted is as bad as ratios get in physics.

The frustration has a precise shape. The site you care about never meets the whole system —
it meets its neighbour, which meets the next, and everything beyond arrives filtered through
that one contact. From where site 1 sits, the other $$L-1$$ spins are not "the rest of the
many-body problem"; they are a **bath** — and everything a bath does to you is summarized
in what crosses the boundary. Whatever that summary is, it is a function of one site's
worth of contact over $$T$$ steps. It ought to be *small*. So why are we paying $$2^L$$?

Feynman and Vernon asked the question in 1963 and answered half of it
{% cite feynman1963theory --file refs_influence_matrix %}. Integrate the environment out
*once*, they said, and what survives is a single object — the **influence functional** — a
weight attached to each trajectory of the system, encoding everything the environment will
ever do to it: every memory, every back-reaction, every correlation between what it did at
one time and what it will do at another. It is a beautiful, complete answer with a famous
practical flaw: for a general many-body environment the functional is a function on pairs
of paths, and sixty years of quantum dissipation theory is largely the art of not having to
write it down.

The modern twist — the subject of this series, following work by Lerose, Sonner and Abanin
{% cite lerose2021influence --file refs_influence_matrix %} — is that for a lattice system
evolving in discrete time, the influence functional stops being an intimidating formal
object and becomes a concrete, finite-dimensional **vector**: the **influence matrix**, a
tensor with one leg per time step, living in a Hilbert space whose "sites" are *instants*.
And a vector on a one-dimensional lattice is exactly the kind of object tensor-network
methods were built to handle — except the lattice direction is time.

This post constructs that object exactly and takes it apart: what it is, where it lives,
what its components mean. No approximations yet, and no payoff either — the exact influence
matrix is as expensive as the problem it came from. The payoff begins in Part 2, when we
ask how *entangled* this vector is and discover that the answer is a property of the bath's
own dynamical phase. First, the construction.

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 2 — Reduced dynamics, discretized (~550 words + collapsible)
     - Running model of the series: kicked Ising chain (Floquet unitary:
       Ising coupling J layer + transverse kick b layer), leftmost site as
       "system," rest as "bath." Tensor network: space horizontal, time
       vertical. Honest note: "system vs bath" is a cut we choose, not a
       physical distinction — a homogeneous many-body system observing
       itself.
     - Folded picture: density-matrix evolution folds bra and ket into one
       network, local dimension 4 per site per step. Diagram before
       formulas; folding is bookkeeping, but it's what makes the IM a
       vector.
     - Define the object: cutting between system and bath, the bath side
       contracts to a single tensor with one (folded) leg per time step —
       IM ∈ (C⁴)^{⊗T}.
     - Displayed key equation: <O(T)> as contraction of (system gates +
       initial state + O) against the IM; system dynamics becomes a 1D
       problem in time.
     - COLLAPSIBLE BOX: fully explicit T = 2, two-site construction with
       every index written out; statement that this is the discrete avatar
       of Feynman–Vernon (Grassmann version deferred to Post 4).
     ===================================================================== -->

## 2 · Reduced dynamics, discretized

The running model for this whole series is the **kicked Ising chain**: $$L$$ spins-½ in a
line, evolved not continuously but in discrete strokes. One time step applies an Ising
layer that couples neighbours, then a "kick" that rotates every spin about $$x$$:

$$
U_F \;=\; \underbrace{\textstyle e^{-i b \sum_j X_j}}_{\text{kick}}\;\;
\underbrace{\textstyle e^{-i J \sum_j Z_j Z_{j+1}}}_{\text{Ising coupling}},
$$

and the state after $$T$$ steps is $$U_F^T\lvert\psi_0\rangle$$. Two knobs, $$J$$ and
$$b$$; both layers are products of commuting one- and two-site gates, so the evolution is
literally a circuit — a brick wall of small tensors, space running horizontally, time
running vertically. Floquet systems like this are the natural habitat of the influence
matrix {% cite lerose2021influence --file refs_influence_matrix %}: time is discrete from
the start, no Trotter apology required.

Now choose a site — say the leftmost, $$j=1$$ — and call it the **system**. Everything
else, sites $$2$$ through $$L$$, is the **bath**. Be honest about what was just done:
nothing physical distinguishes site 1 from its neighbours. This is a homogeneous many-body
chain, and the "system–bath split" is a cut *we* draw because the question we care about —
say $$\langle Z_1(t)\rangle$$ — lives on one site. The bath is not a featureless reservoir
bolted on for realism; it is the rest of the same many-body system, observing itself.

One piece of bookkeeping before the main event. An expectation value needs both branches
of the evolution,

$$
\langle O(T)\rangle \;=\; \mathrm{Tr}\!\left[\, O \; U_F^{T}\, \rho_0 \, U_F^{\dagger T}\right],
$$

a forward copy of the circuit acting on the ket and a backward copy acting on the bra.
**Fold** them into one: stack the conjugated circuit behind the original, so each site at
each step carries a doubled leg — a ket index and a bra index, dimension $$2\times 2 = 4$$.
The folded network computes $$\langle O(T)\rangle$$ in a single contraction, closed at the
bottom by $$\rho_0$$ and at the top by the trace and the observable. Folding sounds like
mere bookkeeping, and it is — but it is the bookkeeping that turns what comes next into a
*vector* rather than a pair of dangling amplitudes.

One assumption gets baked in at this point, and it is worth naming out loud: the initial
state factorizes across the cut,

$$
\rho_0 \;=\; \rho_{\mathrm{s}} \otimes \rho_{\mathrm{bath}},
$$

which is why the figure below draws two separate blocks along the bottom rather than one bar
running the width of the chain. Feynman and Vernon assumed exactly this, and so does
essentially all of the influence-matrix literature. It is load-bearing rather than cosmetic:
if the system and the bath started out correlated, the bath side of the network would not
detach into an object that is ignorant of the system's initial condition, and the
solve-the-bath-once property that makes the whole construction worthwhile would fail.

<figure style="margin:1.75rem auto;text-align:center;color:var(--global-text-color);">
  <svg viewBox="0 0 500 152" width="500" style="max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A forward gate U acting on the ket and a backward gate U-star acting on the bra are stacked into a single folded gate whose every leg is doubled, carrying a ket index and a bra index of total dimension four">
    <defs>
      <marker id="fd-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--global-theme-color)"/></marker>
    </defs>

    <!-- forward copy: acts on the ket -->
    <g stroke="currentColor" stroke-opacity="0.5" stroke-width="1.3">
      <line x1="60" y1="42" x2="60" y2="66"/><line x1="88" y1="42" x2="88" y2="66"/>
      <line x1="60" y1="84" x2="60" y2="108"/><line x1="88" y1="84" x2="88" y2="108"/>
    </g>
    <rect x="48" y="66" width="52" height="18" rx="5" fill="currentColor" fill-opacity="0.10" stroke="currentColor" stroke-opacity="0.6" stroke-width="1.4"/>
    <text x="74" y="79" fill="currentColor" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle" font-style="italic">U</text>
    <text x="74" y="126" fill="currentColor" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.75">forward (ket)</text>

    <!-- backward copy: acts on the bra, drawn dashed -->
    <g stroke="currentColor" stroke-opacity="0.5" stroke-width="1.3" stroke-dasharray="3 3">
      <line x1="160" y1="42" x2="160" y2="66"/><line x1="188" y1="42" x2="188" y2="66"/>
      <line x1="160" y1="84" x2="160" y2="108"/><line x1="188" y1="84" x2="188" y2="108"/>
    </g>
    <rect x="148" y="66" width="52" height="18" rx="5" fill="currentColor" fill-opacity="0.10" stroke="currentColor" stroke-opacity="0.6" stroke-width="1.4" stroke-dasharray="3 3"/>
    <text x="174" y="79" fill="currentColor" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle" font-style="italic">U*</text>
    <text x="174" y="126" fill="currentColor" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.75">backward (bra)</text>

    <!-- the fold -->
    <line x1="224" y1="75" x2="260" y2="75" stroke="var(--global-theme-color)" stroke-width="1.6" marker-end="url(#fd-arrow)"/>
    <text x="242" y="66" fill="var(--global-theme-color)" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle">fold</text>

    <!-- folded gate: every leg is now a solid+dashed pair -->
    <g stroke="var(--global-theme-color)" stroke-width="1.3">
      <line x1="310" y1="42" x2="310" y2="66"/><line x1="314" y1="42" x2="314" y2="66" stroke-dasharray="3 3"/>
      <line x1="344" y1="42" x2="344" y2="66"/><line x1="348" y1="42" x2="348" y2="66" stroke-dasharray="3 3"/>
      <line x1="310" y1="84" x2="310" y2="108"/><line x1="314" y1="84" x2="314" y2="108" stroke-dasharray="3 3"/>
      <line x1="344" y1="84" x2="344" y2="108"/><line x1="348" y1="84" x2="348" y2="108" stroke-dasharray="3 3"/>
    </g>
    <rect x="292" y="66" width="74" height="18" rx="5" fill="var(--global-theme-color)" fill-opacity="0.20" stroke="var(--global-theme-color)" stroke-width="1.4"/>
    <text x="329" y="79" fill="currentColor" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle" font-style="italic">U &#8855; U*</text>
    <text x="329" y="126" fill="var(--global-theme-color)" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle">folded gate</text>

    <g fill="currentColor" font-size="10" font-family="system-ui, sans-serif" fill-opacity="0.8">
      <text x="384" y="71">each leg carries both</text>
      <text x="384" y="85">indices: 2 &#215; 2 = 4</text>
    </g>
  </svg>
  <figcaption style="font-size:0.85rem;opacity:0.8;max-width:32rem;margin:0.5rem auto 0;">
    Folding, drawn once. The forward gate acts on the ket, its conjugate on the bra; stacking
    them gives a single gate whose every leg carries both indices at once — dimension
    2 × 2 = 4. From here on, a solid line is the ket index and the dashed line beside it
    the bra, and the pair is one leg.
  </figcaption>
</figure>

Here is the definition. In the folded network, draw the cut just to the right of the system
wire, so that the Ising gates on the bond $$(1,2)$$ fall on the bath side. Then the only
things crossing the cut are the legs those gates reach out to the system with — exactly one
per time step. Cut them and contract **everything on the bath side**: the coupling gates,
all the bath gates, the bath's initial state, the closing trace.

<figure style="margin:1.75rem auto;text-align:center;color:var(--global-text-color);">
  <svg viewBox="0 0 500 552" width="500" style="max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The folded space-time network of the kicked Ising chain for five sites and three time steps. Space runs horizontally, time vertically. Each site is a doubled ket-bra wire. Ising bond gates and single-site kicks alternate. The bath wires are closed at the top by trace loops and at the bottom by the bath initial state; the system wire is closed at the top by the observable and at the bottom by its own initial state. A dashed cut runs between the system wire and the first bond gate, crossing exactly three horizontal legs, one per time step, labelled sigma one, sigma two and sigma three from bottom to top">
    <defs>
      <marker id="nw-ax" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="currentColor"/></marker>
    </defs>

    <!-- bath region shading (right of the cut) -->
    <rect x="84" y="188" width="388" height="316" rx="8" fill="currentColor" fill-opacity="0.045"/>

    <!-- bath site wires, each a folded (ket, bra) pair -->
    <g stroke="currentColor" stroke-opacity="0.42" stroke-width="1.15">
      <line x1="173.5" y1="214" x2="173.5" y2="470"/><line x1="176.5" y1="214" x2="176.5" y2="470" stroke-dasharray="3 3"/>
      <line x1="263.5" y1="214" x2="263.5" y2="470"/><line x1="266.5" y1="214" x2="266.5" y2="470" stroke-dasharray="3 3"/>
      <line x1="353.5" y1="214" x2="353.5" y2="470"/><line x1="356.5" y1="214" x2="356.5" y2="470" stroke-dasharray="3 3"/>
      <line x1="443.5" y1="214" x2="443.5" y2="470"/><line x1="446.5" y1="214" x2="446.5" y2="470" stroke-dasharray="3 3"/>
    </g>
    <!-- system site wire, also folded -->
    <g stroke="var(--global-theme-color)" stroke-width="1.6">
      <line x1="53.5" y1="214" x2="53.5" y2="470"/><line x1="56.5" y1="214" x2="56.5" y2="470" stroke-dasharray="3 3"/>
    </g>

    <!-- initial states: system and bath, separately, so the cut passes cleanly between them -->
    <rect x="38" y="470" width="34" height="22" rx="6" fill="var(--global-theme-color)" fill-opacity="0.16" stroke="var(--global-theme-color)" stroke-opacity="0.7"/>
    <text x="55" y="485" fill="currentColor" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle" font-style="italic">&#961;<tspan baseline-shift="sub" font-size="7">s</tspan></text>
    <rect x="88" y="470" width="374" height="22" rx="6" fill="currentColor" fill-opacity="0.12" stroke="currentColor" stroke-opacity="0.5"/>
    <text x="275" y="485" fill="currentColor" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle" font-style="italic">&#961;<tspan baseline-shift="sub" font-size="7">bath</tspan></text>

    <!-- Ising bond gates: a box between the two wires it couples, with a leg reaching to each -->
    <g stroke-width="1.4" stroke-linecap="round">
      <!-- the three legs that reach onto the SYSTEM wire: these are the ones the cut crosses -->
      <g stroke="var(--global-theme-color)" stroke-width="1.2">
        <line x1="56" y1="436" x2="90" y2="436"/><line x1="56" y1="440" x2="90" y2="440" stroke-dasharray="3 3"/>
        <line x1="56" y1="356" x2="90" y2="356"/><line x1="56" y1="360" x2="90" y2="360" stroke-dasharray="3 3"/>
        <line x1="56" y1="276" x2="90" y2="276"/><line x1="56" y1="280" x2="90" y2="280" stroke-dasharray="3 3"/>
      </g>
      <!-- all remaining bond legs, inside the bath -->
      <g stroke="currentColor" stroke-opacity="0.55">
        <line x1="140" y1="438" x2="175" y2="438"/><line x1="175" y1="438" x2="195" y2="438"/><line x1="245" y1="438" x2="265" y2="438"/>
        <line x1="265" y1="438" x2="285" y2="438"/><line x1="335" y1="438" x2="355" y2="438"/><line x1="355" y1="438" x2="375" y2="438"/><line x1="425" y1="438" x2="445" y2="438"/>
        <line x1="140" y1="358" x2="175" y2="358"/><line x1="175" y1="358" x2="195" y2="358"/><line x1="245" y1="358" x2="265" y2="358"/>
        <line x1="265" y1="358" x2="285" y2="358"/><line x1="335" y1="358" x2="355" y2="358"/><line x1="355" y1="358" x2="375" y2="358"/><line x1="425" y1="358" x2="445" y2="358"/>
        <line x1="140" y1="278" x2="175" y2="278"/><line x1="175" y1="278" x2="195" y2="278"/><line x1="245" y1="278" x2="265" y2="278"/>
        <line x1="265" y1="278" x2="285" y2="278"/><line x1="335" y1="278" x2="355" y2="278"/><line x1="355" y1="278" x2="375" y2="278"/><line x1="425" y1="278" x2="445" y2="278"/>
      </g>
    </g>
    <g stroke-width="1.5">
      <rect x="90" y="430" width="50" height="16" rx="5" fill="var(--global-theme-color)" fill-opacity="0.22" stroke="var(--global-theme-color)"/>
      <rect x="195" y="430" width="50" height="16" rx="5" fill="currentColor" fill-opacity="0.10" stroke="currentColor" stroke-opacity="0.55"/>
      <rect x="285" y="430" width="50" height="16" rx="5" fill="currentColor" fill-opacity="0.10" stroke="currentColor" stroke-opacity="0.55"/>
      <rect x="375" y="430" width="50" height="16" rx="5" fill="currentColor" fill-opacity="0.10" stroke="currentColor" stroke-opacity="0.55"/>
      <rect x="90" y="350" width="50" height="16" rx="5" fill="var(--global-theme-color)" fill-opacity="0.22" stroke="var(--global-theme-color)"/>
      <rect x="195" y="350" width="50" height="16" rx="5" fill="currentColor" fill-opacity="0.10" stroke="currentColor" stroke-opacity="0.55"/>
      <rect x="285" y="350" width="50" height="16" rx="5" fill="currentColor" fill-opacity="0.10" stroke="currentColor" stroke-opacity="0.55"/>
      <rect x="375" y="350" width="50" height="16" rx="5" fill="currentColor" fill-opacity="0.10" stroke="currentColor" stroke-opacity="0.55"/>
      <rect x="90" y="270" width="50" height="16" rx="5" fill="var(--global-theme-color)" fill-opacity="0.22" stroke="var(--global-theme-color)"/>
      <rect x="195" y="270" width="50" height="16" rx="5" fill="currentColor" fill-opacity="0.10" stroke="currentColor" stroke-opacity="0.55"/>
      <rect x="285" y="270" width="50" height="16" rx="5" fill="currentColor" fill-opacity="0.10" stroke="currentColor" stroke-opacity="0.55"/>
      <rect x="375" y="270" width="50" height="16" rx="5" fill="currentColor" fill-opacity="0.10" stroke="currentColor" stroke-opacity="0.55"/>
    </g>

    <!-- kick layers: one square per site, sitting on its wire -->
    <g fill="currentColor" fill-opacity="0.14" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.5">
      <rect x="48" y="399" width="14" height="14" rx="3"/><rect x="168" y="399" width="14" height="14" rx="3"/><rect x="258" y="399" width="14" height="14" rx="3"/><rect x="348" y="399" width="14" height="14" rx="3"/><rect x="438" y="399" width="14" height="14" rx="3"/>
      <rect x="48" y="319" width="14" height="14" rx="3"/><rect x="168" y="319" width="14" height="14" rx="3"/><rect x="258" y="319" width="14" height="14" rx="3"/><rect x="348" y="319" width="14" height="14" rx="3"/><rect x="438" y="319" width="14" height="14" rx="3"/>
      <rect x="48" y="239" width="14" height="14" rx="3"/><rect x="168" y="239" width="14" height="14" rx="3"/><rect x="258" y="239" width="14" height="14" rx="3"/><rect x="348" y="239" width="14" height="14" rx="3"/><rect x="438" y="239" width="14" height="14" rx="3"/>
    </g>

    <!-- top closure: observable on the system, trace loops on every bath site -->
    <rect x="41" y="196" width="28" height="18" rx="5" fill="var(--global-theme-color)" fill-opacity="0.9"/>
    <text x="55" y="209" fill="var(--global-bg-color, #fff)" font-size="12" font-family="system-ui, sans-serif" text-anchor="middle" font-style="italic">O</text>
    <g fill="none" stroke="currentColor" stroke-opacity="0.5" stroke-width="1.3">
      <path d="M 173.5 214 A 5 5 0 0 1 176.5 214"/>
      <path d="M 263.5 214 A 5 5 0 0 1 266.5 214"/>
      <path d="M 353.5 214 A 5 5 0 0 1 356.5 214"/>
      <path d="M 443.5 214 A 5 5 0 0 1 446.5 214"/>
    </g>
    <text x="310" y="192" fill="currentColor" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.75">trace: each bath ket closed onto its own bra</text>

    <!-- the cut, between the system wire and the first bond gate -->
    <line x1="80" y1="186" x2="80" y2="506" stroke="var(--global-theme-color)" stroke-width="1.75" stroke-dasharray="6 4"/>
    <text x="80" y="180" fill="var(--global-theme-color)" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle">the cut</text>

    <!-- the T legs the cut crosses, named -->
    <g font-size="10" font-family="system-ui, sans-serif" text-anchor="middle" fill="var(--global-theme-color)">
      <text x="68" y="428">&#963;&#8323;</text>
      <text x="68" y="348">&#963;&#8322;</text>
      <text x="68" y="268">&#963;&#8321;</text>
    </g>

    <!-- time axis -->
    <line x1="22" y1="460" x2="22" y2="250" stroke="currentColor" stroke-opacity="0.6" stroke-width="1.2" marker-end="url(#nw-ax)"/>
    <text x="22" y="242" fill="currentColor" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.85">time</text>

    <!-- region labels and the space axis, each on its own row -->
    <g font-size="11" font-family="system-ui, sans-serif" text-anchor="middle">
      <text x="55" y="514" fill="var(--global-theme-color)">system</text>
      <text x="275" y="514" fill="currentColor" fill-opacity="0.85">bath</text>
    </g>
    <line x1="150" y1="538" x2="222" y2="538" stroke="currentColor" stroke-opacity="0.6" stroke-width="1.2" marker-end="url(#nw-ax)"/>
    <text x="232" y="542" fill="currentColor" font-size="11" font-family="system-ui, sans-serif" text-anchor="start" fill-opacity="0.85">space</text>
  </svg>
  <figcaption style="font-size:0.85rem;opacity:0.8;max-width:34rem;margin:0.5rem auto 0;">
    The folded circuit for ⟨O(T)⟩, here L = 5 and T = 3, with every wire a doubled
    (ket, bra) leg. Rounded rectangles are Ising bond gates — each one a small tensor between
    the wires it couples, reaching a leg out to each — and squares are kicks. The network is
    closed at the bottom by the initial state and at the top by the observable on the system
    and by a trace loop on every bath site. The dashed cut runs between the system wire and
    the first bond gate, so those gates belong to the bath side; what it crosses is exactly
    three legs, σ₁, σ₂, σ₃, one per time step.
  </figcaption>
</figure>

Before going on, why is it legitimate to draw that coupling as a leg *tapping* the system's
wire, rather than as a block the wire disappears into — and to cut the leg rather than the
gate? Because the Ising gate is **diagonal**. $$e^{-iJZ_1Z_2}$$ never moves the system's
spin; it only multiplies by a phase that depends on the spin's value. A diagonal gate
therefore behaves like a copy: it reads $$z_1$$ off the wire, hands that value to the bath,
and lets the wire continue unchanged. That is precisely what allows the influence matrix to
be a functional of the system's *trajectory*. For a generic, non-diagonal coupling you would
have no choice but to cut through the gate itself, and the crossing index would be an
abstract bond index with no reading as "the system's spin at step $$t$$." The dimensions
agree either way, which is a useful check: writing
$$e^{-iJZ_1Z_2} = \cos J\,\mathbb{1}\otimes\mathbb{1} - i\sin J\, Z\otimes Z$$ shows the gate
has Schmidt rank 2 across the bond, and 2 forward × 2 backward is the same folded dimension
4 that the copied spin carries.

What remains is a single tensor with one folded leg of dimension 4 per time step — the
**influence matrix**,

$$
\mathrm{IM} \;\in\; \left(\mathbb{C}^{4}\right)^{\otimes T}.
$$

It is a state — a vector — but not in space: its "sites" are *time steps*. And it is all
the system will ever need to know. It is, quite literally, the bath side of the network and
nothing else: everything to the right of the cut, rolled into one tensor. (The name carries a
small historical awkwardness. Before folding, the object is a function of two trajectories at
once, the forward one and the backward one, so it is naturally a *matrix* indexed by a pair
of trajectories. Folding merges those two indices at every step, and the very same object
reads as a vector instead. I will keep calling it the influence matrix, as the literature
does, while treating it as a state.) Where exactly to put the coupling gates is a convention
rather than a fact: I have given them to the bath, so the open legs carry the system's own
spins. Hand them to the system instead and you get an equally valid object whose legs carry
the boundary bath spin; both choices appear in the literature, and only the bookkeeping
changes.

It is worth being precise about where those open legs sit, because they are easy to
mislocate. They are not at the top of the network: up there every bath wire has already been
sealed by its trace loop, and the system's wire by the observable. They are not at the
bottom either, where the initial state closes everything off. They are the $$T$$ places
*along the system's wire* where a coupling gate reached in — one per time step, and nothing
else. So $$\sigma_t$$ is the folded (ket, bra) value of the **system's own spin at step
$$t$$**: the thing the $$t$$-th Ising layer reads off the system before handing it to the
bath. The influence matrix is therefore a function of the system's entire trajectory
$$\sigma_1,\dots,\sigma_T$$ — which is exactly what an influence *functional* is supposed to
be. With that reading, the observable becomes

$$
\langle O(T)\rangle
\;=\; \sum_{\sigma_1,\dots,\sigma_T}
\mathcal{S}^{O}\!\left[\sigma_1,\dots,\sigma_T\right]\,
\mathrm{IM}\!\left[\sigma_1,\dots,\sigma_T\right],
$$

where $$\mathcal{S}^{O}$$ contains only single-site data: the system's initial state, its
kicks, and the observable. Stare at that sum. The $$L$$-site many-body problem has become a
**one-dimensional contraction along the time axis** — the system's trajectory, weighted
step by step by the bath's one-time offer of everything it will ever do. Different
observable? Same IM, different $$\mathcal{S}^{O}$$. Different system drive — replace site
1's kicks with any single-site gates you like, even time-dependent ones? Same IM. The bath
answers once.

<figure style="margin:1.75rem auto;text-align:center;color:var(--global-text-color);">
  <svg viewBox="0 0 560 470" width="560" style="max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The same computation after the bath has been contracted. On the left, the system column alone: its own initial state at the bottom, its kicks, and the observable on top, all enclosed in a dashed box labelled S to the O. On the right, a single blob labelled IM containing the coupling gates, the bath gates, the bath initial state and the trace loops. Three doubled legs join the system column to the blob, one per time step, labelled sigma one, sigma two and sigma three, each attached to the system wire exactly where an Ising gate used to reach it">
    <defs>
      <marker id="ct-ax" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="currentColor"/></marker>
    </defs>

    <!-- dashed enclosure: the single-site data S^O -->
    <rect x="86" y="66" width="72" height="330" rx="10" fill="none" stroke="var(--global-theme-color)" stroke-opacity="0.5" stroke-width="1.3" stroke-dasharray="5 4"/>
    <text x="122" y="418" fill="var(--global-theme-color)" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle">&#119982;<tspan baseline-shift="super" font-size="8">O</tspan></text>
    <text x="122" y="434" fill="currentColor" font-size="9.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.75">single-site data only</text>

    <!-- system wire, folded -->
    <g stroke="var(--global-theme-color)" stroke-width="1.6">
      <line x1="120.5" y1="100" x2="120.5" y2="360"/><line x1="123.5" y1="100" x2="123.5" y2="360" stroke-dasharray="3 3"/>
    </g>
    <!-- observable on top -->
    <rect x="108" y="82" width="28" height="18" rx="5" fill="var(--global-theme-color)" fill-opacity="0.9"/>
    <text x="122" y="95" fill="var(--global-bg-color, #fff)" font-size="12" font-family="system-ui, sans-serif" text-anchor="middle" font-style="italic">O</text>
    <!-- the system's own initial state at the bottom -->
    <rect x="102" y="360" width="40" height="20" rx="6" fill="var(--global-theme-color)" fill-opacity="0.16" stroke="var(--global-theme-color)" stroke-opacity="0.7"/>
    <text x="122" y="374" fill="currentColor" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle" font-style="italic">&#961;<tspan baseline-shift="sub" font-size="7">s</tspan></text>
    <!-- the system's kicks -->
    <g fill="currentColor" fill-opacity="0.14" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.5">
      <rect x="115" y="293" width="14" height="14" rx="3"/>
      <rect x="115" y="213" width="14" height="14" rx="3"/>
      <rect x="115" y="133" width="14" height="14" rx="3"/>
    </g>
    <text x="150" y="304" fill="currentColor" font-size="9.5" font-family="system-ui, sans-serif" text-anchor="start" fill-opacity="0.7">kicks</text>

    <!-- the T legs joining system to IM: the ones that were cut -->
    <g stroke="var(--global-theme-color)" stroke-width="1.3">
      <line x1="122" y1="330" x2="360" y2="330"/><line x1="122" y1="334" x2="360" y2="334" stroke-dasharray="3 3"/>
      <line x1="122" y1="250" x2="360" y2="250"/><line x1="122" y1="254" x2="360" y2="254" stroke-dasharray="3 3"/>
      <line x1="122" y1="170" x2="360" y2="170"/><line x1="122" y1="174" x2="360" y2="174" stroke-dasharray="3 3"/>
    </g>
    <!-- where each leg meets the system wire -->
    <g fill="var(--global-theme-color)">
      <circle cx="122" cy="332" r="3"/><circle cx="122" cy="252" r="3"/><circle cx="122" cy="172" r="3"/>
    </g>
    <g font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle" fill="var(--global-theme-color)">
      <text x="240" y="322">&#963;&#8321;&#8195;&#8212;&#8195;system spin read at step 1</text>
      <text x="240" y="242">&#963;&#8322;&#8195;&#8212;&#8195;system spin read at step 2</text>
      <text x="240" y="162">&#963;&#8323;&#8195;&#8212;&#8195;system spin read at step 3</text>
    </g>

    <!-- the IM blob -->
    <rect x="360" y="120" width="150" height="264" rx="14" fill="var(--global-theme-color)" fill-opacity="0.20" stroke="var(--global-theme-color)" stroke-width="1.8"/>
    <text x="435" y="152" fill="currentColor" font-size="16" font-family="system-ui, sans-serif" text-anchor="middle" font-weight="600">IM</text>
    <text x="435" y="170" fill="currentColor" font-size="9.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.75">4<tspan baseline-shift="super" font-size="7">T</tspan> components</text>
    <g font-size="9.5" font-family="system-ui, sans-serif" text-anchor="middle" fill="currentColor" fill-opacity="0.8">
      <text x="435" y="290">swallowed inside:</text>
      <text x="435" y="306">the coupling gates</text>
      <text x="435" y="320">every bath gate and kick</text>
      <text x="435" y="334">the bath&#8217;s initial state</text>
      <text x="435" y="348">all the trace loops</text>
    </g>

    <!-- what closing the legs means -->
    <text x="300" y="446" fill="currentColor" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">contracting these T legs — and nothing else — returns ⟨O(T)⟩</text>

    <!-- time axis -->
    <line x1="52" y1="356" x2="52" y2="146" stroke="currentColor" stroke-opacity="0.6" stroke-width="1.2" marker-end="url(#ct-ax)"/>
    <text x="52" y="138" fill="currentColor" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.85">time</text>
  </svg>
  <figcaption style="font-size:0.85rem;opacity:0.8;max-width:34rem;margin:0.5rem auto 0;">
    The same number, after the bath is gone. Nothing that was closed stays open: the bath's
    wires were sealed top and bottom by the trace and by ρ<sub>bath</sub>, and the system's
    own wire is still sealed by ρ<sub>s</sub> below and O above. The open legs are neither of
    those — they are the T horizontal legs the cut crossed, each one the place where an Ising
    gate reached from the bath onto the system wire at a given step. So σ<sub>t</sub> is the
    folded (ket, bra) value of the <em>system</em> spin at step t, the thing the coupling
    reads; the influence matrix is a function of the system's whole trajectory
    σ₁ … σ<sub>T</sub>, and closing those legs against the single-site data 𝒮<sup>O</sup>
    gives ⟨O(T)⟩ back.
  </figcaption>
</figure>

<div class="learn-more-box" markdown="0">
{% details Every index, written out: the smallest influence matrix (L = 2, T = 2) %}
Take one system spin coupled to a one-site bath, evolved for two steps — small enough that
nothing hides. Write $$s_t$$ and $$z_t$$ for the system and bath spins *entering* step
$$t$$ (so $$s_1, z_1$$ are the initial values, and the $$t$$-th Ising layer reads exactly
the pair $$s_t, z_t$$ — the same 1-indexing as the main text's $$\sigma_t$$). The kick gate
in the $$Z$$ basis ($$z = \pm 1$$) is

$$
K_{z' z} \;=\; \langle z'\rvert e^{-i b X}\lvert z\rangle
\;=\; \cos b \,\, \delta_{z' z} \;-\; i \sin b \,\left(1 - \delta_{z' z}\right),
$$

and the Ising gate is diagonal: acting on system spin $$s$$ and bath spin $$z$$ it
multiplies by $$e^{-iJsz}$$. Order within one period: Ising first, then kick.

Here is the whole thing as a picture, with every index in the sums below sitting somewhere
you can point at.

<figure style="margin:1.5rem auto;text-align:center;color:var(--global-text-color);">
  <svg viewBox="0 0 500 400" width="500" style="max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A ladder diagram of the two-site, two-step case. Two vertical bath world-lines, the forward branch on the left and the backward branch on the right, are joined at the bottom by the bath initial state and at the top by the trace. Reading each line upwards: the bath index z one, an Ising phase vertex, a kick box K that changes the index to z two, a second Ising vertex, a second kick box giving z three. Between the two lines sit the folded system legs sigma one and sigma two, each feeding s to the forward branch and s-bar to the backward branch">
    <defs>
      <marker id="lad-a" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="var(--global-theme-color)"/></marker>
    </defs>

    <!-- the two bath world-lines -->
    <g stroke="currentColor" stroke-opacity="0.55" stroke-width="1.5">
      <line x1="130" y1="104" x2="130" y2="336"/>
    </g>
    <g stroke="currentColor" stroke-opacity="0.55" stroke-width="1.5" stroke-dasharray="4 3">
      <line x1="370" y1="104" x2="370" y2="336"/>
    </g>

    <!-- the trace closes the two branches at the top -->
    <path d="M 130 104 C 130 72, 370 72, 370 104" fill="none" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.5"/>
    <text x="250" y="66" fill="currentColor" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.85">trace closes the top: z&#772;&#8323; = z&#8323;</text>

    <!-- the bath's initial state ties the two branches at the bottom -->
    <rect x="100" y="336" width="300" height="24" rx="7" fill="currentColor" fill-opacity="0.12" stroke="currentColor" stroke-opacity="0.5"/>
    <text x="250" y="352" fill="currentColor" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle" font-style="italic">(&#961;<tspan baseline-shift="sub" font-size="7.5">bath</tspan>)<tspan baseline-shift="sub" font-size="7.5">z&#8321; z&#772;&#8321;</tspan></text>

    <!-- kick gates: the only thing that moves the bath index -->
    <g stroke-width="1.5">
      <rect x="113" y="150" width="34" height="18" rx="5" fill="currentColor" fill-opacity="0.12" stroke="currentColor" stroke-opacity="0.6"/>
      <rect x="353" y="150" width="34" height="18" rx="5" fill="currentColor" fill-opacity="0.12" stroke="currentColor" stroke-opacity="0.6" stroke-dasharray="4 3"/>
      <rect x="113" y="250" width="34" height="18" rx="5" fill="currentColor" fill-opacity="0.12" stroke="currentColor" stroke-opacity="0.6"/>
      <rect x="353" y="250" width="34" height="18" rx="5" fill="currentColor" fill-opacity="0.12" stroke="currentColor" stroke-opacity="0.6" stroke-dasharray="4 3"/>
    </g>
    <g font-size="10" font-family="system-ui, sans-serif" text-anchor="middle" fill="currentColor" font-style="italic">
      <text x="130" y="163">K</text><text x="370" y="163">K*</text>
      <text x="130" y="263">K</text><text x="370" y="263">K*</text>
    </g>

    <!-- Ising vertices: a phase only, the index passes straight through -->
    <g fill="var(--global-theme-color)">
      <circle cx="130" cy="206" r="5"/><circle cx="370" cy="206" r="5"/>
      <circle cx="130" cy="306" r="5"/><circle cx="370" cy="306" r="5"/>
    </g>

    <!-- the folded system legs, feeding both branches -->
    <g>
      <rect x="226" y="195" width="48" height="22" rx="6" fill="var(--global-theme-color)" fill-opacity="0.22" stroke="var(--global-theme-color)" stroke-width="1.5"/>
      <text x="250" y="211" fill="currentColor" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle">&#963;&#8322;</text>
      <rect x="226" y="295" width="48" height="22" rx="6" fill="var(--global-theme-color)" fill-opacity="0.22" stroke="var(--global-theme-color)" stroke-width="1.5"/>
      <text x="250" y="311" fill="currentColor" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle">&#963;&#8321;</text>
    </g>
    <g stroke="var(--global-theme-color)" stroke-width="1.3" stroke-dasharray="4 3" marker-end="url(#lad-a)">
      <line x1="224" y1="206" x2="140" y2="206"/><line x1="276" y1="206" x2="360" y2="206"/>
      <line x1="224" y1="306" x2="140" y2="306"/><line x1="276" y1="306" x2="360" y2="306"/>
    </g>
    <g font-size="10" font-family="system-ui, sans-serif" text-anchor="middle" fill="var(--global-theme-color)">
      <text x="182" y="200">s&#8322;</text><text x="318" y="200">s&#772;&#8322;</text>
      <text x="182" y="300">s&#8321;</text><text x="318" y="300">s&#772;&#8321;</text>
    </g>

    <!-- the bath indices, one per segment -->
    <g font-size="10.5" font-family="system-ui, sans-serif" fill="currentColor" fill-opacity="0.9">
      <text x="120" y="132" text-anchor="end">z&#8323;</text>
      <text x="120" y="196" text-anchor="end">z&#8322;</text>
      <text x="120" y="330" text-anchor="end">z&#8321;</text>
      <text x="380" y="132" text-anchor="start">z&#772;&#8323;</text>
      <text x="380" y="196" text-anchor="start">z&#772;&#8322;</text>
      <text x="380" y="330" text-anchor="start">z&#772;&#8321;</text>
    </g>

    <!-- branch labels -->
    <g font-size="10" font-family="system-ui, sans-serif" text-anchor="middle" fill="currentColor" fill-opacity="0.75">
      <text x="130" y="380">forward branch (ket)</text>
      <text x="370" y="380">backward branch (bra)</text>
    </g>

    <!-- time axis -->
    <line x1="40" y1="330" x2="40" y2="130" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.2" marker-end="url(#lad-a)"/>
    <text x="40" y="122" fill="currentColor" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">time</text>
  </svg>
  <figcaption style="font-size:0.85rem;opacity:0.82;max-width:33rem;margin:0.5rem auto 0;">
    The whole L = 2, T = 2 computation. The bath has two world-lines, forward (solid) and
    backward (dashed), tied together at the bottom by ρ<sub>bath</sub> and at the top by the
    trace. Teal dots are Ising layers: they contribute a phase e<sup>∓iJ s<sub>t</sub>z<sub>t</sub></sup>
    and the bath index passes straight through them unchanged — that is what "diagonal"
    means. Only the kicks <em>K</em> move the index along, z₁ → z₂ → z₃. Each folded leg
    σ<sub>t</sub> = (s<sub>t</sub>, s̄<sub>t</sub>) sits in the middle and feeds one value to
    each branch, which is exactly why the influence matrix ends up a function of both
    trajectories at once.
  </figcaption>
</figure>

For a fixed *forward* system trajectory $$(s_1, s_2)$$, the bath's forward amplitude from
$$z_1$$ to $$z_3$$ is one Ising phase and one kick per period:

$$
A\!\left[s_1, s_2;\, z_1 \to z_3\right]
\;=\; \sum_{z_2}
K_{z_3 z_2}\, e^{-i J s_2 z_2}\,
K_{z_2 z_1}\, e^{-i J s_1 z_1}.
$$

The backward branch contributes the complex conjugate with its own trajectory
$$(\bar{s}_1, \bar{s}_2)$$ and bath variables $$\bar{z}$$. Sandwiching the bath's initial
state $$\rho_{\mathrm{bath}}$$ and closing the trace ($$\bar z_3 = z_3$$) gives the
influence matrix, component by component:

$$
\mathrm{IM}\!\left[(s_1,\bar{s}_1),(s_2,\bar{s}_2)\right]
= \!\!\sum_{z_1, z_2, z_3, \bar{z}_1, \bar{z}_2}\!\!
\left(\rho_{\mathrm{bath}}\right)_{z_1 \bar{z}_1}\,
K_{z_3 z_2} K_{z_2 z_1}\,
K^{*}_{z_3 \bar{z}_2} K^{*}_{\bar{z}_2 \bar{z}_1}\,
e^{-i J\left(s_1 z_1 + s_2 z_2\right)}\,
e^{+i J\left(\bar{s}_1 \bar{z}_1 + \bar{s}_2 \bar{z}_2\right)}.
$$

Each folded index $$\sigma_t = (s_t, \bar{s}_t)$$ takes four values, so this $$T=2$$
influence matrix has $$4^2 = 16$$ complex components — a completely explicit, finite
object. For general $$L$$ the bath side also contains its own Ising bonds and the sum runs
over all interior bath configurations, but the structure is identical: the system
trajectory enters only through the boundary phases $$e^{\mp i J s_t z_t}$$.

This is the discrete avatar of the **Feynman–Vernon influence functional**
{% cite feynman1963theory --file refs_influence_matrix %}: a weight assigned to each
*pair* of forward and backward system trajectories, obtained by integrating out the
environment once and for all. Feynman and Vernon wrote it as a path integral for a
continuum bath; here it is a finite vector you can hold in memory — $$4^T$$ complex
numbers. (The Grassmann path-integral version returns in Post 4, where the bath is made of
free fermions and the whole object collapses to one temporal correlation matrix.)
{% enddetails %}
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 3 — The space-time rotation (~550 words + WIDGET)
     - The conceptual heart. Two contraction orders for the same network:
       by ROWS = time layers (standard evolution, cost exp in SPACE) or by
       COLUMNS = site world-lines (transverse contraction, cost exp in
       TIME, naively). NB: a column is vertical (one site, all times); a
       row is horizontal (one time layer, all sites). The
       IM is the transverse contraction's output: each added bath site
       updates IM ← T̂[IM], with T̂ a dual transfer matrix acting on the
       temporal Hilbert space.
     - Role inversion, stated vividly: space is now the evolution
       direction; the "state" being evolved is a wavefunction on a 1D
       lattice whose sites are TIME STEPS. For a translationally invariant
       bath, the IM is a fixed point of T̂ — solve the bath once, reuse for
       any impurity, drive, or observable.
     - Forward pointers (one sentence each): weakly entangled fixed point →
       MPS in time → everything polynomial (Post 2); HOW entangled it is =
       fingerprint of the bath's dynamical phase (Post 3).
     - Lineage paragraph: transverse folding of Bañuls–Hastings–
       Verstraete–Cirac; dual-unitary circuits (Bertini–Kos–Prosen) as the
       solvable extreme of the rotation. Cite, don't derive.
     - Anchor to the widget.
     ===================================================================== -->

## 3 · The space-time rotation

A tensor network does not care in which order you contract it — the answer is the answer.
But the *cost* cares enormously, and the influence matrix is what you get by taking the
"wrong" order seriously.

The standard order sweeps **upward, one time layer at a time** — a whole row of the
network at each stroke. Contract the initial state
with the first layer of gates, then the next, maintaining the full many-body state (folded:
a $$4^L$$-component object) as you go. This is ordinary time evolution. Its currency is the
spatial Hilbert space: every step costs you the exponential of $$L$$, and the time
direction is cheap — just repeat.

Now rotate your head ninety degrees and sweep **sideways, one site at a time** — a whole
column at each stroke. Start at
the far edge of the bath, site $$L$$: contract its entire vertical world-line — initial
state, $$T$$ gates, closing trace — into one object. That object is a vector on the
*temporal* lattice: one leg per time step. Absorb site $$L-1$$: another world-line of
gates, another layer of contraction. Each bath site you absorb updates the same kind of
object,

$$
\mathrm{IM} \;\longleftarrow\; \hat{\mathcal{T}}\left[\,\mathrm{IM}\,\right],
$$

where $$\hat{\mathcal{T}}$$ — one site's worth of folded gates, read sideways — is a
**transfer matrix acting on the temporal Hilbert space**. When the sweep reaches the cut,
what pops out is precisely the influence matrix of section 2. Same network, same answer;
different order, and a completely different object in your hands along the way.

<figure style="margin:1.75rem auto;text-align:center;color:var(--global-text-color);">
  <svg viewBox="0 0 560 366" width="560" style="max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The same lattice contracted two ways, with space running left to right and time running bottom to top in both panels. On the left, whole time layers are absorbed one after another sweeping upward, so the boundary carried in memory is a horizontal cut whose legs run along space, one per site, giving an ordinary many-body state of size four to the L. On the right, one site's entire world-line is absorbed at a time sweeping inward from the far bath, so the boundary is a vertical cut whose legs run along time, one per step, giving a state of size four to the T whose lattice sites are instants">
    <defs>
      <marker id="sw-a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--global-theme-color)"/></marker>
      <marker id="sw-g" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="currentColor" fill-opacity="0.6"/></marker>
    </defs>

    <!-- ============================ LEFT PANEL ============================ -->
    <text x="124" y="22" fill="currentColor" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle" font-weight="600">absorb one time layer at a time</text>
    <text x="124" y="37" fill="currentColor" font-size="9.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.7">a row of the network &#8212; ordinary evolution</text>

    <rect x="48" y="120" width="152" height="60" fill="currentColor" fill-opacity="0.07"/>
    <g stroke="currentColor" stroke-opacity="0.38" stroke-width="1.1">
      <line x1="60" y1="62" x2="60" y2="180"/><line x1="92" y1="62" x2="92" y2="180"/><line x1="124" y1="62" x2="124" y2="180"/><line x1="156" y1="62" x2="156" y2="180"/><line x1="188" y1="62" x2="188" y2="180"/>
      <line x1="55" y1="75" x2="193" y2="75"/><line x1="55" y1="105" x2="193" y2="105"/><line x1="55" y1="135" x2="193" y2="135"/><line x1="55" y1="165" x2="193" y2="165"/>
    </g>
    <g fill="currentColor" fill-opacity="0.5">
      <circle cx="60" cy="75" r="2.6"/><circle cx="92" cy="75" r="2.6"/><circle cx="124" cy="75" r="2.6"/><circle cx="156" cy="75" r="2.6"/><circle cx="188" cy="75" r="2.6"/>
      <circle cx="60" cy="105" r="2.6"/><circle cx="92" cy="105" r="2.6"/><circle cx="124" cy="105" r="2.6"/><circle cx="156" cy="105" r="2.6"/><circle cx="188" cy="105" r="2.6"/>
      <circle cx="60" cy="135" r="2.6"/><circle cx="92" cy="135" r="2.6"/><circle cx="124" cy="135" r="2.6"/><circle cx="156" cy="135" r="2.6"/><circle cx="188" cy="135" r="2.6"/>
      <circle cx="60" cy="165" r="2.6"/><circle cx="92" cy="165" r="2.6"/><circle cx="124" cy="165" r="2.6"/><circle cx="156" cy="165" r="2.6"/><circle cx="188" cy="165" r="2.6"/>
    </g>
    <!-- the boundary carried in memory, and the legs crossing it -->
    <g stroke="var(--global-theme-color)" stroke-width="3.2">
      <line x1="60" y1="111" x2="60" y2="129"/><line x1="92" y1="111" x2="92" y2="129"/><line x1="124" y1="111" x2="124" y2="129"/><line x1="156" y1="111" x2="156" y2="129"/><line x1="188" y1="111" x2="188" y2="129"/>
    </g>
    <line x1="48" y1="120" x2="200" y2="120" stroke="var(--global-theme-color)" stroke-width="2.6"/>
    <!-- axes -->
    <line x1="32" y1="175" x2="32" y2="70" stroke="currentColor" stroke-opacity="0.6" stroke-width="1.2" marker-end="url(#sw-g)"/>
    <text x="32" y="58" fill="currentColor" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">time</text>
    <line x1="60" y1="194" x2="188" y2="194" stroke="currentColor" stroke-opacity="0.6" stroke-width="1.2" marker-end="url(#sw-g)"/>
    <text x="124" y="208" fill="currentColor" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">space</text>
    <!-- sweep direction -->
    <line x1="212" y1="170" x2="212" y2="84" stroke="var(--global-theme-color)" stroke-width="1.4" marker-end="url(#sw-a)"/>
    <text x="212" y="76" fill="var(--global-theme-color)" font-size="9.5" font-family="system-ui, sans-serif" text-anchor="middle">sweep</text>

    <text x="124" y="240" fill="currentColor" font-size="9.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">what you carry across the cut</text>
    <!-- the carried object: a bar with legs pointing along SPACE -->
    <rect x="64" y="262" width="120" height="16" rx="5" fill="var(--global-theme-color)" fill-opacity="0.22" stroke="var(--global-theme-color)" stroke-width="1.5"/>
    <text x="124" y="274" fill="currentColor" font-size="9.5" font-family="system-ui, sans-serif" text-anchor="middle">state</text>
    <g stroke="var(--global-theme-color)" stroke-width="1.3">
      <line x1="72" y1="278" x2="72" y2="298"/><line x1="100" y1="278" x2="100" y2="298"/><line x1="124" y1="278" x2="124" y2="298"/><line x1="148" y1="278" x2="148" y2="298"/><line x1="176" y1="278" x2="176" y2="298"/>
    </g>
    <g fill="var(--global-theme-color)">
      <circle cx="72" cy="298" r="2.4"/><circle cx="100" cy="298" r="2.4"/><circle cx="124" cy="298" r="2.4"/><circle cx="148" cy="298" r="2.4"/><circle cx="176" cy="298" r="2.4"/>
    </g>
    <text x="124" y="336" fill="currentColor" font-size="9.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.85">legs run along space, one per site</text>
    <text x="124" y="352" fill="var(--global-theme-color)" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle">4<tspan baseline-shift="super" font-size="8">L</tspan> numbers</text>

    <line x1="270" y1="56" x2="270" y2="352" stroke="currentColor" stroke-opacity="0.16" stroke-width="1"/>

    <!-- ============================ RIGHT PANEL ============================ -->
    <text x="414" y="22" fill="currentColor" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle" font-weight="600">absorb one site at a time</text>
    <text x="414" y="37" fill="currentColor" font-size="9.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.7">a column of the network &#8212; the transverse order</text>

    <rect x="398" y="62" width="87" height="118" fill="currentColor" fill-opacity="0.07"/>
    <g stroke="currentColor" stroke-opacity="0.38" stroke-width="1.1">
      <line x1="350" y1="62" x2="350" y2="180"/><line x1="382" y1="62" x2="382" y2="180"/><line x1="414" y1="62" x2="414" y2="180"/><line x1="446" y1="62" x2="446" y2="180"/><line x1="478" y1="62" x2="478" y2="180"/>
      <line x1="345" y1="75" x2="483" y2="75"/><line x1="345" y1="105" x2="483" y2="105"/><line x1="345" y1="135" x2="483" y2="135"/><line x1="345" y1="165" x2="483" y2="165"/>
    </g>
    <g fill="currentColor" fill-opacity="0.5">
      <circle cx="350" cy="75" r="2.6"/><circle cx="382" cy="75" r="2.6"/><circle cx="414" cy="75" r="2.6"/><circle cx="446" cy="75" r="2.6"/><circle cx="478" cy="75" r="2.6"/>
      <circle cx="350" cy="105" r="2.6"/><circle cx="382" cy="105" r="2.6"/><circle cx="414" cy="105" r="2.6"/><circle cx="446" cy="105" r="2.6"/><circle cx="478" cy="105" r="2.6"/>
      <circle cx="350" cy="135" r="2.6"/><circle cx="382" cy="135" r="2.6"/><circle cx="414" cy="135" r="2.6"/><circle cx="446" cy="135" r="2.6"/><circle cx="478" cy="135" r="2.6"/>
      <circle cx="350" cy="165" r="2.6"/><circle cx="382" cy="165" r="2.6"/><circle cx="414" cy="165" r="2.6"/><circle cx="446" cy="165" r="2.6"/><circle cx="478" cy="165" r="2.6"/>
    </g>
    <g stroke="var(--global-theme-color)" stroke-width="3.2">
      <line x1="389" y1="75" x2="407" y2="75"/><line x1="389" y1="105" x2="407" y2="105"/><line x1="389" y1="135" x2="407" y2="135"/><line x1="389" y1="165" x2="407" y2="165"/>
    </g>
    <line x1="398" y1="62" x2="398" y2="180" stroke="var(--global-theme-color)" stroke-width="2.6"/>
    <!-- axes: identical orientation to the left panel -->
    <line x1="322" y1="175" x2="322" y2="70" stroke="currentColor" stroke-opacity="0.6" stroke-width="1.2" marker-end="url(#sw-g)"/>
    <text x="322" y="58" fill="currentColor" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">time</text>
    <line x1="350" y1="194" x2="478" y2="194" stroke="currentColor" stroke-opacity="0.6" stroke-width="1.2" marker-end="url(#sw-g)"/>
    <text x="414" y="208" fill="currentColor" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">space</text>
    <!-- sweep runs inward, from the far bath toward the system -->
    <line x1="478" y1="224" x2="360" y2="224" stroke="var(--global-theme-color)" stroke-width="1.4" marker-end="url(#sw-a)"/>
    <text x="496" y="228" fill="var(--global-theme-color)" font-size="9.5" font-family="system-ui, sans-serif" text-anchor="start">sweep</text>

    <text x="414" y="240" fill="currentColor" font-size="9.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">what you carry across the cut</text>
    <!-- the carried object: a bar with legs pointing along TIME -->
    <rect x="406" y="248" width="16" height="61" rx="5" fill="var(--global-theme-color)" fill-opacity="0.22" stroke="var(--global-theme-color)" stroke-width="1.5"/>
    <text x="414" y="278" fill="currentColor" font-size="9.5" font-family="system-ui, sans-serif" text-anchor="middle" transform="rotate(-90 414 278)">state</text>
    <g stroke="var(--global-theme-color)" stroke-width="1.3">
      <line x1="406" y1="256" x2="386" y2="256"/><line x1="406" y1="271" x2="386" y2="271"/><line x1="406" y1="286" x2="386" y2="286"/><line x1="406" y1="301" x2="386" y2="301"/>
    </g>
    <g fill="var(--global-theme-color)">
      <circle cx="386" cy="256" r="2.4"/><circle cx="386" cy="271" r="2.4"/><circle cx="386" cy="286" r="2.4"/><circle cx="386" cy="301" r="2.4"/>
    </g>
    <text x="414" y="336" fill="currentColor" font-size="9.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.85">legs run along time, one per step</text>
    <text x="414" y="352" fill="var(--global-theme-color)" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle">4<tspan baseline-shift="super" font-size="8">T</tspan> numbers</text>
  </svg>
  <figcaption style="font-size:0.85rem;opacity:0.82;max-width:34rem;margin:0.5rem auto 0;">
    One network, two contraction orders, the same final number. In <em>both</em> panels the
    axes are the same — space runs left to right, one column per site, and time runs bottom
    to top, one row per step. Only the sweep differs. On the left you swallow a whole time
    layer at a time, so the boundary you must hold in memory is <em>horizontal</em>: the legs
    crossing it run along the space axis, one per site, and the object is an ordinary
    many-body state of 4<sup>L</sup> numbers. On the right you swallow one site's entire
    world-line at a time, so the boundary is <em>vertical</em>: its legs run along the time
    axis, one per step, and the object is a state whose lattice sites are <em>instants</em>,
    of 4<sup>T</sup> numbers. The influence matrix is what the right-hand sweep is carrying
    when it arrives at the system.
  </figcaption>
</figure>

The roles have swapped, and it is worth saying vividly: **space is now the evolution
direction.** The "state" being evolved is a wavefunction on a one-dimensional lattice whose
sites are time steps; the "Hamiltonian" driving it is the dual transfer matrix
$$\hat{\mathcal{T}}$$; the "time" it evolves in is distance into the bath. And this rotated
problem has the structure every many-body theorist reflexively looks for: if the chain is
translationally invariant, absorbing one more bath site is the *same operation* every time,
so as the bath grows deep the influence matrix converges to a **fixed point** of
$$\hat{\mathcal{T}}$$ {% cite lerose2021influence --file refs_influence_matrix %}. Solve
that fixed-point equation once and the bath is solved *forever* — for any impurity you
plant at the boundary, any drive you apply to it, any observable you measure. The
exponentially large environment has been distilled into one temporal state.

<figure style="margin:1.75rem auto;text-align:center;color:var(--global-text-color);">
  <svg viewBox="0 0 520 312" width="520" style="max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Two rows. In the top row, a blob labelled IM sub k joins through four folded legs into a tall box labelled T-hat, one bath site's world-line of gates read sideways, and the result equals a new blob labelled IM sub k plus one with four open legs. In the bottom row the same operation is applied to a blob labelled IM star and returns IM star unchanged: the fixed point reached deep inside the bath">
    <defs>
      <marker id="fx-a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="currentColor"/></marker>
    </defs>

    <!-- ===== row 1: absorbing one more bath site ===== -->
    <text x="34" y="24" fill="currentColor" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="start" fill-opacity="0.8">absorb one more bath site:</text>

    <rect x="40" y="34" width="68" height="90" rx="10" fill="var(--global-theme-color)" fill-opacity="0.18" stroke="var(--global-theme-color)" stroke-width="1.6"/>
    <text x="74" y="84" fill="currentColor" font-size="13" font-family="system-ui, sans-serif" text-anchor="middle" font-weight="600">IM<tspan baseline-shift="sub" font-size="9">k</tspan></text>

    <g stroke="var(--global-theme-color)" stroke-width="1.15">
      <line x1="108" y1="46" x2="152" y2="46"/><line x1="108" y1="49" x2="152" y2="49" stroke-dasharray="3 3"/>
      <line x1="108" y1="68" x2="152" y2="68"/><line x1="108" y1="71" x2="152" y2="71" stroke-dasharray="3 3"/>
      <line x1="108" y1="90" x2="152" y2="90"/><line x1="108" y1="93" x2="152" y2="93" stroke-dasharray="3 3"/>
      <line x1="108" y1="112" x2="152" y2="112"/><line x1="108" y1="115" x2="152" y2="115" stroke-dasharray="3 3"/>
    </g>

    <rect x="152" y="34" width="42" height="90" rx="6" fill="currentColor" fill-opacity="0.11" stroke="currentColor" stroke-opacity="0.6" stroke-width="1.5"/>
    <text x="173" y="84" fill="currentColor" font-size="13" font-family="system-ui, sans-serif" text-anchor="middle">&#84;&#770;</text>

    <g stroke="var(--global-theme-color)" stroke-width="1.15">
      <line x1="194" y1="46" x2="238" y2="46"/><line x1="194" y1="49" x2="238" y2="49" stroke-dasharray="3 3"/>
      <line x1="194" y1="68" x2="238" y2="68"/><line x1="194" y1="71" x2="238" y2="71" stroke-dasharray="3 3"/>
      <line x1="194" y1="90" x2="238" y2="90"/><line x1="194" y1="93" x2="238" y2="93" stroke-dasharray="3 3"/>
      <line x1="194" y1="112" x2="238" y2="112"/><line x1="194" y1="115" x2="238" y2="115" stroke-dasharray="3 3"/>
    </g>

    <text x="252" y="86" fill="currentColor" font-size="15" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">=</text>

    <rect x="268" y="34" width="68" height="90" rx="10" fill="var(--global-theme-color)" fill-opacity="0.18" stroke="var(--global-theme-color)" stroke-width="1.6"/>
    <text x="302" y="84" fill="currentColor" font-size="13" font-family="system-ui, sans-serif" text-anchor="middle" font-weight="600">IM<tspan baseline-shift="sub" font-size="9">k+1</tspan></text>
    <g stroke="var(--global-theme-color)" stroke-width="1.15">
      <line x1="336" y1="46" x2="378" y2="46"/><line x1="336" y1="49" x2="378" y2="49" stroke-dasharray="3 3"/>
      <line x1="336" y1="68" x2="378" y2="68"/><line x1="336" y1="71" x2="378" y2="71" stroke-dasharray="3 3"/>
      <line x1="336" y1="90" x2="378" y2="90"/><line x1="336" y1="93" x2="378" y2="93" stroke-dasharray="3 3"/>
      <line x1="336" y1="112" x2="378" y2="112"/><line x1="336" y1="115" x2="378" y2="115" stroke-dasharray="3 3"/>
    </g>
    <g fill="var(--global-theme-color)">
      <circle cx="378" cy="47.5" r="2.4"/><circle cx="378" cy="69.5" r="2.4"/><circle cx="378" cy="91.5" r="2.4"/><circle cx="378" cy="113.5" r="2.4"/>
    </g>

    <g fill="currentColor" font-size="9.5" font-family="system-ui, sans-serif" fill-opacity="0.75">
      <text x="396" y="70">one bath site&#8217;s</text>
      <text x="396" y="84">world-line of gates,</text>
      <text x="396" y="98">read sideways</text>
    </g>

    <!-- repeat: sits high and to the right, clear of the row-2 label below it -->
    <text x="258" y="144" fill="currentColor" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.65">repeat, site after site, deeper into the bath</text>

    <!-- ===== row 2: the fixed point (shifted down 18px to clear the line above) ===== -->
    <text x="34" y="174" fill="currentColor" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="start" fill-opacity="0.8">deep in a uniform bath:</text>

    <rect x="40" y="182" width="68" height="90" rx="10" fill="var(--global-theme-color)" fill-opacity="0.18" stroke="var(--global-theme-color)" stroke-width="1.6"/>
    <text x="74" y="232" fill="currentColor" font-size="13" font-family="system-ui, sans-serif" text-anchor="middle" font-weight="600">IM<tspan baseline-shift="super" font-size="9">&#8727;</tspan></text>

    <g stroke="var(--global-theme-color)" stroke-width="1.15">
      <line x1="108" y1="194" x2="152" y2="194"/><line x1="108" y1="197" x2="152" y2="197" stroke-dasharray="3 3"/>
      <line x1="108" y1="216" x2="152" y2="216"/><line x1="108" y1="219" x2="152" y2="219" stroke-dasharray="3 3"/>
      <line x1="108" y1="238" x2="152" y2="238"/><line x1="108" y1="241" x2="152" y2="241" stroke-dasharray="3 3"/>
      <line x1="108" y1="260" x2="152" y2="260"/><line x1="108" y1="263" x2="152" y2="263" stroke-dasharray="3 3"/>
    </g>

    <rect x="152" y="182" width="42" height="90" rx="6" fill="currentColor" fill-opacity="0.11" stroke="currentColor" stroke-opacity="0.6" stroke-width="1.5"/>
    <text x="173" y="232" fill="currentColor" font-size="13" font-family="system-ui, sans-serif" text-anchor="middle">&#84;&#770;</text>

    <g stroke="var(--global-theme-color)" stroke-width="1.15">
      <line x1="194" y1="194" x2="238" y2="194"/><line x1="194" y1="197" x2="238" y2="197" stroke-dasharray="3 3"/>
      <line x1="194" y1="216" x2="238" y2="216"/><line x1="194" y1="219" x2="238" y2="219" stroke-dasharray="3 3"/>
      <line x1="194" y1="238" x2="238" y2="238"/><line x1="194" y1="241" x2="238" y2="241" stroke-dasharray="3 3"/>
      <line x1="194" y1="260" x2="238" y2="260"/><line x1="194" y1="263" x2="238" y2="263" stroke-dasharray="3 3"/>
    </g>

    <text x="252" y="234" fill="currentColor" font-size="15" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">=</text>

    <rect x="268" y="182" width="68" height="90" rx="10" fill="var(--global-theme-color)" fill-opacity="0.18" stroke="var(--global-theme-color)" stroke-width="1.6"/>
    <text x="302" y="232" fill="currentColor" font-size="13" font-family="system-ui, sans-serif" text-anchor="middle" font-weight="600">IM<tspan baseline-shift="super" font-size="9">&#8727;</tspan></text>
    <g stroke="var(--global-theme-color)" stroke-width="1.15">
      <line x1="336" y1="194" x2="378" y2="194"/><line x1="336" y1="197" x2="378" y2="197" stroke-dasharray="3 3"/>
      <line x1="336" y1="216" x2="378" y2="216"/><line x1="336" y1="219" x2="378" y2="219" stroke-dasharray="3 3"/>
      <line x1="336" y1="238" x2="378" y2="238"/><line x1="336" y1="241" x2="378" y2="241" stroke-dasharray="3 3"/>
      <line x1="336" y1="260" x2="378" y2="260"/><line x1="336" y1="263" x2="378" y2="263" stroke-dasharray="3 3"/>
    </g>
    <g fill="var(--global-theme-color)">
      <circle cx="378" cy="195.5" r="2.4"/><circle cx="378" cy="217.5" r="2.4"/><circle cx="378" cy="239.5" r="2.4"/><circle cx="378" cy="261.5" r="2.4"/>
    </g>

    <g fill="currentColor" font-size="9.5" font-family="system-ui, sans-serif" fill-opacity="0.75">
      <text x="392" y="218">one more site now</text>
      <text x="392" y="232">changes nothing:</text>
      <text x="392" y="246">solve the bath once,</text>
      <text x="392" y="260">reuse it forever</text>
    </g>

    <text x="200" y="298" fill="var(--global-theme-color)" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle">space is the evolution direction; the legs are time</text>
  </svg>
  <figcaption style="font-size:0.85rem;opacity:0.82;max-width:34rem;margin:0.5rem auto 0;">
    The rotated problem, drawn as an evolution. Swallowing one more bath site means applying
    the dual transfer matrix T̂ — that site's whole world-line of gates, read sideways — to
    the temporal state, and getting back another temporal state with the same T legs. Because
    every bath site is identical, this is the <em>same</em> operation each time, so the
    sequence converges: deep enough into a uniform bath, one more site changes nothing and
    IM<sup>∗</sup> is a fixed point of T̂. That is the payoff of the rotation — solve the
    bath once and it is solved for every impurity, drive and observable you might attach at
    the boundary.
  </figcaption>
</figure>

<p class="thread-note"><span class="thread-label">The through-line</span> A many-body
system, seen from inside, is a state in time. This post establishes that the state
exists — the influence matrix is that state, and the space-time rotation is how you reach
it.</p>

So far the rotation only trades one exponential for another: a $$4^L$$ spatial state for a
$$4^T$$ temporal one. The reason this trade wins is a preview of Post 2: the temporal
state is often *far less entangled* than the spatial one, so a matrix-product state in the
time direction compresses it and everything becomes polynomial
{% cite sonner2021influence --file refs_influence_matrix %}. And *how much* temporal
entanglement the fixed point carries is not a numerical nuisance but a physical
fingerprint — chaotic, near-integrable, and localized baths write visibly different
signatures into it, which is Post 3's story.

This way of thinking has a lineage. Contracting the folded network transversally was
introduced by Bañuls, Hastings, Verstraete and Cirac as a route to long-time dynamics of
infinite chains {% cite banuls2009matrix --file refs_influence_matrix %}; the influence-
matrix program sharpened it by asking about the *boundary vector itself* — what it means,
and what its entanglement measures. At the opposite, maximally solvable extreme sit the
**dual-unitary circuits** of Bertini, Kos and Prosen, where the sideways evolution is
itself unitary and the rotation becomes exact rather than merely clever
{% cite bertini2019exact --file refs_influence_matrix %}. The kicked Ising chain touches
that extreme at a special point in its $$(b, J)$$ plane — a fact that will detonate in
Post 2.

The widget below is the whole section in one interactive picture: the same folded network
contracted both ways — rows of the network lighting up bottom-to-top as time layers are
absorbed, then columns lighting up right-to-left as whole site world-lines are absorbed and
the network collapses onto a single temporal state — with the dimension you are paying for
shown as it grows.

<div style="border:1px solid var(--global-divider-color);border-radius:8px;padding:1rem;margin:1.5rem 0;">
  <div id="imrot-mount"></div>
  <div style="display:flex;flex-wrap:wrap;gap:1.25rem;align-items:center;justify-content:center;margin-top:0.85rem;font-size:0.9rem;">
    <label style="display:flex;align-items:center;gap:0.5rem;">
      kick b
      <input id="imrot-b" type="range" min="0.05" max="1.55" step="0.01" value="0.60">
      <span id="imrot-b-val" style="min-width:2.6em;font-variant-numeric:tabular-nums;">0.60</span>
    </label>
    <label style="display:flex;align-items:center;gap:0.5rem;">
      coupling J
      <input id="imrot-j" type="range" min="0.05" max="1.55" step="0.01" value="0.70">
      <span id="imrot-j-val" style="min-width:2.6em;font-variant-numeric:tabular-nums;">0.70</span>
    </label>
    <label style="display:flex;align-items:center;gap:0.5rem;">
      system drive
      <select id="imrot-drive" style="font-size:0.85rem;background:transparent;color:inherit;border:1px solid var(--global-divider-color);border-radius:5px;padding:0.15rem 0.3rem;"></select>
    </label>
  </div>
  <p style="font-size:0.8rem;opacity:0.75;margin:0.7rem 0 0;text-align:center;">
    L = 5, T = 6, all exact. Moving a slider re-contracts the bath (new IM); changing only
    the <em>drive</em> reuses the cached IM — watch the note under the badge. The brute-force
    curve carries a pure state of 2⁵ amplitudes; the folded temporal state has 4⁶ components.
  </p>
</div>

<script src="{{ '/assets/js/influence-matrix-rotation.js' | relative_url }}"></script>
<script>
  (function () {
    var mount = document.getElementById("imrot-mount");
    if (!mount || typeof createInfluenceMatrixRotation !== "function") return;
    var w = createInfluenceMatrixRotation(mount, { L: 5, T: 6, b: 0.6, J: 0.7 });
    var bS = document.getElementById("imrot-b"), jS = document.getElementById("imrot-j");
    var bV = document.getElementById("imrot-b-val"), jV = document.getElementById("imrot-j-val");
    var sel = document.getElementById("imrot-drive");
    Object.keys(w.drives).forEach(function (k) {
      var o = document.createElement("option"); o.value = k; o.textContent = w.drives[k].label;
      sel.appendChild(o);
    });
    function upd() { w.setParams(bS.value, jS.value); }
    bS.addEventListener("input", function () { bV.textContent = (+bS.value).toFixed(2); });
    jS.addEventListener("input", function () { jV.textContent = (+jS.value).toFixed(2); });
    bS.addEventListener("change", upd);
    jS.addEventListener("change", upd);
    sel.addEventListener("change", function () { w.setDrive(sel.value); });
  })();
</script>

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 4 — What the IM knows (~500 words + collapsible box)
     - Cash the definition into physics on the kicked Ising example (small
       L, exact): (i) <Z_sys(t)> for a chosen system drive; (ii) same IM,
       different system drive — solve-once-reuse-everywhere demonstrated.
     - IM components as bath correlation functions: specific temporal
       index configurations of the IM ARE multi-time correlators of the
       bath (state which components give the two-time correlator
       controlling linear response / weak coupling). Framing: Born,
       Markov, weak coupling — the familiar hierarchy of approximations
       are structured truncations of this one object. One displayed
       example; details in the box.
     - Honest scope paragraph: at this point the IM is exact but
       4^T-dimensional. Conceptual gain only, so far. Reader should end
       knowing precisely the problem Post 2 solves.
     - COLLAPSIBLE BOX: component→correlator dictionary for one
       nontrivial case; check that a decoupled bath gives a product-form
       IM (first hint that "memoryless" = "product state in time").
     ===================================================================== -->

## 4 · What the IM knows

Time to cash the definition into physics. Fix a bath — say five kicked Ising sites at some
$$(b, J)$$ — and contract it once, exactly, by the transverse sweep of section 3. You now
hold $$4^T$$ numbers. Ask for $$\langle Z_1(t)\rangle$$ under some drive on site 1 and the
answer is a single one-dimensional sum along the time axis, no many-body evolution in sight.
Now change the question. Give site 1 a different kick angle: same IM, new $$\mathcal{S}^{O}$$,
contract again. Make its drive time-dependent, a different pulse at every step: same IM.
Measure $$X_1$$ instead of $$Z_1$$: same IM. Replace the spin at site 1 with a different
impurity altogether: still the same IM, because none of that is anything the bath was ever
told about. **The bath answered once, and every one of those questions is a cheap
re-contraction of one fixed object.**

That is worth writing down properly, because it also explains the object's name. Since the
coupling is diagonal, the bath never sees an operator — it sees the system's trajectory as a
sequence of numbers, and evolves under its own gates with those numbers inserted as phases.
Call that trajectory-dependent bath evolution $$V_{s}$$. Then

$$
\mathrm{IM}\!\left[s, \bar{s}\right]
\;=\; \mathrm{Tr}_{\mathrm{bath}}\!\left[\, V_{s}\; \rho_{\mathrm{bath}}\; V_{\bar{s}}^{\dagger} \right],
$$

a matrix whose row index is the forward trajectory and whose column index is the backward
one. It comes with a free check: if the system does the same thing on both branches,
$$s_t = \bar{s}_t$$ for every $$t$$, then $$V_s = V_{\bar s}$$ and the trace collapses to
$$\mathrm{Tr}\,\rho_{\mathrm{bath}} = 1$$. Unitarity of the bath, visible as a flat
diagonal.

Now the part that says the IM is not merely a bookkeeping device. Write $$Z_{\mathrm{b}}$$
for the boundary bath spin — site 2, the only bath operator the coupling ever touches — and
let $$Z_{\mathrm{b}}(t)$$ be that spin evolved by the bath's *own* dynamics. Because each
$$s_t = \pm 1$$ and $$Z_{\mathrm{b}}^2 = 1$$, every Ising factor is exactly two terms,
$$e^{-iJ s_t Z_{\mathrm{b}}} = \cos J - i\, s_t \sin J\, Z_{\mathrm{b}}$$. Expanding all
$$2T$$ of them makes the influence matrix a *multilinear polynomial* in the trajectories,
and its coefficients are not arbitrary numbers: the term carrying $$s_t \bar{s}_{t'}$$ is

$$
\sin^{2}\!J \,\cos^{2T-2}\!J \;\; \big\langle Z_{\mathrm{b}}(t')\, Z_{\mathrm{b}}(t) \big\rangle_{\rho_{\mathrm{bath}}},
$$

the bath's **two-time correlation function** — the object that controls linear response and
governs everything at weak coupling. Coefficients with more insertions are the bath's
higher multi-time correlators, ordered along the forward and backward branches. The
influence matrix is, quite literally, the generating function for all of them at once.

<figure style="margin:1.75rem auto;text-align:center;color:var(--global-text-color);">
  <svg viewBox="0 0 560 300" width="560" style="max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Three copies of the same Keldysh contour. Each has a solid forward branch and a dashed backward branch, joined by the bath initial state at the bottom and by the trace at the top, with four time steps marked as faint rungs. The first contour carries no operator insertions and gives the constant term. The second carries one insertion on each branch, at step two forward and step three backward, and equals the two-time correlator of the boundary spin. The third carries three insertions and equals a three-time correlator.">
    <defs>
      <marker id="kd-a" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="currentColor" fill-opacity="0.6"/></marker>
    </defs>

    <!-- time axis and step numbering, shown once on the left-hand contour -->
    <line x1="44" y1="190" x2="44" y2="92" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.2" marker-end="url(#kd-a)"/>
    <text x="44" y="84" fill="currentColor" font-size="9.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.8">time</text>
    <g fill="currentColor" font-size="8.5" font-family="system-ui, sans-serif" text-anchor="end" fill-opacity="0.6">
      <text x="64" y="183">1</text><text x="64" y="155">2</text><text x="64" y="127">3</text><text x="64" y="99">4</text>
    </g>

    <text x="100" y="34" fill="currentColor" font-size="9.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.7">no insertions</text>
    <g stroke="currentColor" stroke-opacity="0.18" stroke-width="1" stroke-dasharray="2 3">
      <line x1="70" y1="180" x2="130" y2="180"/>
      <line x1="70" y1="152" x2="130" y2="152"/>
      <line x1="70" y1="124" x2="130" y2="124"/>
      <line x1="70" y1="96" x2="130" y2="96"/>
    </g>
    <line x1="78" y1="70" x2="78" y2="200" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.5"/>
    <line x1="122" y1="70" x2="122" y2="200" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.5" stroke-dasharray="4 3"/>
    <path d="M 78 70 C 78 48, 122 48, 122 70" fill="none" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.5"/>
    <rect x="60" y="200" width="80" height="20" rx="6" fill="currentColor" fill-opacity="0.12" stroke="currentColor" stroke-opacity="0.5"/>
    <text x="100" y="214" fill="currentColor" font-size="9" font-family="system-ui, sans-serif" text-anchor="middle" font-style="italic">&#961;<tspan baseline-shift="sub" font-size="6.5">bath</tspan></text>
    <text x="100" y="248" fill="currentColor" font-size="9.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.85">the constant term</text>
    <text x="100" y="266" fill="var(--global-theme-color)" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle">(cos J)<tspan baseline-shift="super" font-size="7">2T</tspan></text>

    <text x="280" y="34" fill="currentColor" font-size="9.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.7">one insertion per branch</text>
    <g stroke="currentColor" stroke-opacity="0.18" stroke-width="1" stroke-dasharray="2 3">
      <line x1="250" y1="180" x2="310" y2="180"/>
      <line x1="250" y1="152" x2="310" y2="152"/>
      <line x1="250" y1="124" x2="310" y2="124"/>
      <line x1="250" y1="96" x2="310" y2="96"/>
    </g>
    <line x1="258" y1="70" x2="258" y2="200" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.5"/>
    <line x1="302" y1="70" x2="302" y2="200" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.5" stroke-dasharray="4 3"/>
    <path d="M 258 70 C 258 48, 302 48, 302 70" fill="none" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.5"/>
    <rect x="240" y="200" width="80" height="20" rx="6" fill="currentColor" fill-opacity="0.12" stroke="currentColor" stroke-opacity="0.5"/>
    <text x="280" y="214" fill="currentColor" font-size="9" font-family="system-ui, sans-serif" text-anchor="middle" font-style="italic">&#961;<tspan baseline-shift="sub" font-size="6.5">bath</tspan></text>
    <circle cx="258" cy="152" r="5" fill="var(--global-theme-color)"/>
    <circle cx="302" cy="124" r="5" fill="var(--global-theme-color)"/>
    <text x="249" y="155" fill="var(--global-theme-color)" font-size="9" font-family="system-ui, sans-serif" text-anchor="end">Z<tspan baseline-shift="sub" font-size="6.5">b</tspan>(2)</text>
    <text x="311" y="127" fill="var(--global-theme-color)" font-size="9" font-family="system-ui, sans-serif" text-anchor="start">Z<tspan baseline-shift="sub" font-size="6.5">b</tspan>(3)</text>
    <text x="280" y="248" fill="currentColor" font-size="9.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.85">coefficient of s&#8322; s&#772;&#8323;</text>
    <text x="280" y="266" fill="var(--global-theme-color)" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle">&#10216;Z<tspan baseline-shift="sub" font-size="6.5">b</tspan>(3) Z<tspan baseline-shift="sub" font-size="6.5">b</tspan>(2)&#10217;</text>

    <text x="460" y="34" fill="currentColor" font-size="9.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.7">three insertions</text>
    <g stroke="currentColor" stroke-opacity="0.18" stroke-width="1" stroke-dasharray="2 3">
      <line x1="430" y1="180" x2="490" y2="180"/>
      <line x1="430" y1="152" x2="490" y2="152"/>
      <line x1="430" y1="124" x2="490" y2="124"/>
      <line x1="430" y1="96" x2="490" y2="96"/>
    </g>
    <line x1="438" y1="70" x2="438" y2="200" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.5"/>
    <line x1="482" y1="70" x2="482" y2="200" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.5" stroke-dasharray="4 3"/>
    <path d="M 438 70 C 438 48, 482 48, 482 70" fill="none" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.5"/>
    <rect x="420" y="200" width="80" height="20" rx="6" fill="currentColor" fill-opacity="0.12" stroke="currentColor" stroke-opacity="0.5"/>
    <text x="460" y="214" fill="currentColor" font-size="9" font-family="system-ui, sans-serif" text-anchor="middle" font-style="italic">&#961;<tspan baseline-shift="sub" font-size="6.5">bath</tspan></text>
    <circle cx="438" cy="180" r="5" fill="var(--global-theme-color)"/>
    <circle cx="438" cy="124" r="5" fill="var(--global-theme-color)"/>
    <circle cx="482" cy="96" r="5" fill="var(--global-theme-color)"/>
    <text x="429" y="183" fill="var(--global-theme-color)" font-size="9" font-family="system-ui, sans-serif" text-anchor="end">Z<tspan baseline-shift="sub" font-size="6.5">b</tspan>(1)</text>
    <text x="429" y="127" fill="var(--global-theme-color)" font-size="9" font-family="system-ui, sans-serif" text-anchor="end">Z<tspan baseline-shift="sub" font-size="6.5">b</tspan>(3)</text>
    <text x="491" y="99" fill="var(--global-theme-color)" font-size="9" font-family="system-ui, sans-serif" text-anchor="start">Z<tspan baseline-shift="sub" font-size="6.5">b</tspan>(4)</text>
    <text x="460" y="248" fill="currentColor" font-size="9.5" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.85">coefficient of s&#8321; s&#8323; s&#772;&#8324;</text>
    <text x="460" y="266" fill="var(--global-theme-color)" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle">&#10216;Z<tspan baseline-shift="sub" font-size="6.5">b</tspan>(4) Z<tspan baseline-shift="sub" font-size="6.5">b</tspan>(3) Z<tspan baseline-shift="sub" font-size="6.5">b</tspan>(1)&#10217;</text>

    <text x="280" y="292" fill="currentColor" font-size="9" font-family="system-ui, sans-serif" text-anchor="middle" fill-opacity="0.65">solid = forward branch&#8195;·&#8195;dashed = backward branch&#8195;·&#8195;teal dot = an inserted Z<tspan baseline-shift="sub" font-size="6.5">b</tspan></text>
  </svg>
  <figcaption style="font-size:0.85rem;opacity:0.82;max-width:34rem;margin:0.5rem auto 0;">
    Reading a coefficient off the contour. Expanding every Ising factor into its two exact
    terms amounts to choosing, independently at each step and on each branch, whether to
    insert Z<sub>b</sub> (a teal dot) or the identity (nothing). Each pattern of dots is one
    monomial in the trajectories, and its coefficient is the bath correlator with Z<sub>b</sub>
    evaluated at exactly those times, read around the contour with the backward-branch
    insertions written first. Two dots, one per branch, give the two-time function that
    controls linear response; more dots give higher correlators. The influence matrix is the
    sum over <em>every</em> pattern of dots — which is why it holds all of the bath's
    multi-time correlations at once, and why truncating the patterns is what the familiar
    approximations do.
  </figcaption>
</figure>

Seen that way, the approximation schemes everyone already knows stop looking like separate
ideas and start looking like places to cut this one object. Keep only the terms with two
insertions — second order in $$J$$ — and you have kept exactly the two-time correlator: that
is the Born approximation. Assume in addition that
$$\langle Z_{\mathrm{b}}(t')Z_{\mathrm{b}}(t)\rangle$$ has died before the next Floquet step,
and the surviving terms all sit at a single time, so the influence matrix factorizes into one
independent tensor per step. That is the Markov approximation — and notice what it *is* in
this language: a **product state in time**. A memoryless bath is a temporal state with no
entanglement at all. Hold onto that sentence; Post 2 is built on it.

So what has actually been bought? Honestly: understanding, and not yet a single flop. The
influence matrix is exact, and it is $$4^T$$ numbers — an exponential in $$T$$ where we
started with an exponential in $$L$$. Worse, the way we built it was to contract the bath
exactly, which costs whatever the original many-body problem cost. Nothing has been
compressed; the difficulty has been *moved*, out of space and into time. The reason that is
progress rather than a lateral shuffle is the question it makes askable, which is the whole
of Post 2: the influence matrix is a state on a one-dimensional lattice, so **how entangled
is it?** If the answer is "barely," a matrix-product state in the time direction stores it in
polynomial space, and everything above becomes an algorithm instead of a definition.

<div class="learn-more-box" markdown="0">
{% details The dictionary: which components are which correlators, and why a memoryless bath is a product state %}
**1 · The expansion is exact, not perturbative.**
Each Ising layer contributes $$e^{-iJ s_t Z_{\mathrm{b}}}$$ to the forward branch. Since
$$s_t=\pm1$$ and $$Z_{\mathrm{b}}^2 = \mathbb{1}$$, this is *exactly* a two-term sum,

$$
e^{-iJ s_t Z_{\mathrm{b}}} \;=\; \cos J \,\mathbb{1} \;-\; i \sin J \, s_t\, Z_{\mathrm{b}},
$$

with no expansion in small $$J$$ anywhere. Doing this at all $$T$$ steps writes $$V_s$$ as a
sum over subsets $$S \subseteq \{1,\dots,T\}$$ — the steps at which $$Z_{\mathrm{b}}$$ is
inserted rather than the identity:

$$
V_{s} \;=\; \mathcal{K}\sum_{S} \left(\cos J\right)^{T-|S|}\left(-i\sin J\right)^{|S|}
\Big(\prod_{t\in S} s_t\Big)\;
\mathcal{T}\!\!\prod_{t \in S} Z_{\mathrm{b}}(t),
$$

where $$\mathcal{K}$$ collects the bath's own gates, $$Z_{\mathrm{b}}(t)$$ is the boundary
spin in the bath's free Heisenberg picture, and $$\mathcal{T}$$ time-orders.

**2 · Sandwiching gives contour-ordered correlators.**
Doing the same on the backward branch with its own subset $$\bar{S}$$ and taking the trace
against $$\rho_{\mathrm{bath}}$$,

$$
\mathrm{IM}\!\left[s,\bar s\right] = \sum_{S,\bar S}
c_{S \bar S}\,
\Big(\prod_{t\in S} s_t\Big)\Big(\prod_{t'\in \bar S} \bar s_{t'}\Big)
\Big\langle \bar{\mathcal{T}}\!\!\prod_{t'\in\bar S}\! Z_{\mathrm{b}}(t')\;\;
\mathcal{T}\!\!\prod_{t\in S}\! Z_{\mathrm{b}}(t) \Big\rangle,
$$

with $$c_{S\bar S} = (\cos J)^{2T-|S|-|\bar S|}(-i\sin J)^{|S|}(i \sin J)^{|\bar S|}$$. So
the dictionary is exact and complete: **the coefficient of a given monomial in the
trajectories is the bath's multi-time correlator with insertions at precisely those times**,
anti-time-ordered on the backward branch, time-ordered on the forward one — a
contour-ordered correlator. The case $$|S|=|\bar S|=1$$ is the two-time function quoted in
the main text; $$|S|=|\bar S|=0$$ is the constant $$(\cos J)^{2T}$$, and the requirement that
everything resum to 1 on the diagonal $$s=\bar s$$ is a nontrivial identity among all the
higher correlators.

**3 · A decoupled bath is a product state in time.**
Set $$J=0$$. Every Ising factor becomes the identity, $$V_s$$ stops depending on the
trajectory, and

$$
\mathrm{IM}\!\left[s,\bar s\right] = \mathrm{Tr}\!\left[V \rho_{\mathrm{bath}} V^\dagger\right] = 1
\qquad\text{for every trajectory.}
$$

A constant function of $$\sigma_1,\dots,\sigma_T$$ is a product state on the temporal
lattice — it factorizes as $$\prod_t f(\sigma_t)$$ with $$f \equiv 1$$ — so its temporal
entanglement is exactly zero across every cut. The same conclusion survives the coupling
being switched back on provided the bath's correlators never link different times: if
$$\langle Z_{\mathrm{b}}(t')Z_{\mathrm{b}}(t)\rangle \propto \delta_{tt'}$$, only $$S=\bar S$$
single-time terms survive in step 2 and the sum factorizes step by step,

$$
\mathrm{IM}\!\left[s,\bar s\right] \;=\; \prod_{t=1}^{T} f\!\left(\sigma_t\right).
$$

**Memory is temporal entanglement.** A bath that forgets gives a product state in time; a
bath that remembers correlates the legs. That equivalence is the hinge of the entire series,
and Post 2 turns it into a computational method — including the startling case of a bath so
chaotic that it forgets *perfectly*, and whose influence matrix is therefore an exact product
state even at strong coupling.
{% enddetails %}
</div>

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 5 — Where this goes (~300 words, no math)
     - One paragraph per future post, condensed-matter-framed:
       Post 2 (temporal entanglement; the perfect dephaser — a maximally
       chaotic chain whose IM is an exact product state in time, i.e. the
       best possible bath); Post 3 (TE scaling as diagnostic of dynamical
       phases — integrability, chaos, localization); Post 4 (free-fermion
       baths: IM is Gaussian, one temporal correlation matrix — direct
       reuse of the free-fermion post's machinery); Post 5 (quantum
       impurity problems and transport — temporal approach solves what
       spatial methods struggle with; DMFT on the horizon).
     - Point to the programming companion: "the exact computation behind
       this post's widget, at honest scales and with all the code, lives
       in [programming section link]" — companion ladder ends at a
       working impurity solver.
     - Restate the through-line: a many-body system, seen from inside, is
       a state in time — and we now know what that state looks like.
     - Forward refs cited here: lerose2021scaling, sonner2022characterizing,
       thoenniss2023nonequilibrium, thoenniss2023efficient.
     ===================================================================== -->

## 5 · Where this goes

The influence matrix now exists: an exact, finite, uncompressed answer to "what does the
rest of the system do to one site?" Everything that follows in this series is about what
that object *is like* — and it turns out to be like nothing the spatial picture prepares
you for.

**[Part 2]({% post_url 2026-07-29-temporal-entanglement-when-a-chaotic-system-is-a-perfect-bath %})** asks the obvious tensor-network question: how entangled is the temporal state,
across cuts in *time*? That number — the **temporal entanglement** — decides whether an MPS
in the time direction can compress the IM, and section 4's closing observation (memoryless
= product state in time) becomes quantitative. The centerpiece is a genuine shock: at the
kicked Ising chain's self-dual point, a *maximally chaotic* many-body system has an
influence matrix with no temporal entanglement at all — a **perfect dephaser**, the best
possible bath, memoryless at strong coupling {% cite lerose2021influence sonner2021influence --file refs_influence_matrix %}.
Chaos, seen from inside, can mean perfect forgetting.

**[Part 3]({% post_url 2026-07-30-dynamical-phases-through-the-temporal-lens %})** turns that observation into a diagnostic. Temporal entanglement scales
differently in a thermalizing bath, near an integrable point
{% cite lerose2021scaling --file refs_influence_matrix %}, and in a localized one
{% cite sonner2022characterizing --file refs_influence_matrix %} — the dynamical phase of
matter is legible in the entanglement of a single temporal state.

**[Part 4]({% post_url 2026-07-31-gaussian-influence-matrices-free-fermions-in-the-time-direction %})** specializes to baths of free fermions, where the IM collapses further: it is a
*Gaussian* state in the temporal fermionic Hilbert space, fully specified by one **temporal
correlation matrix** {% cite thoenniss2023nonequilibrium --file refs_influence_matrix %}.
Everything my [free-fermion post]({% post_url 2026-07-06-free-fermions-one-matrix %})
built for space — the correlation matrix, the $$\zeta$$-spectrum, entropies from
eigenvalues — gets reused wholesale on the time axis.

**[Part 5]({% post_url 2026-08-01-quantum-impurity-problems-the-influence-matrix-earns-its-keep %})** is the payoff: quantum impurity problems. A small interacting region coupled to
free-fermion leads is precisely "system + Gaussian bath," and compressing the leads'
influence matrices attacks nonequilibrium transport problems that resist every spatial
method {% cite thoenniss2023efficient --file refs_influence_matrix %} — with the impurity
solvers at the heart of DMFT waiting at the end of the road.

The exact computation behind this post's widget — same physics, honest scales, all the
code, and the measured walls where dense methods die — lives in the programming companion:
[**Exact influence matrices, by brute force**]({{ '/programming/influence-matrix-01-exact-dense/' | relative_url }}).
The companions form their own ladder, ending at a working toy impurity solver.

<p class="thread-note"><span class="thread-label">The through-line</span> A many-body
system, seen from inside, is a state in time. We now know that state exists and what it
holds — every multi-time correlation the bath will ever show you. The question the rest of
the series answers, one part at a time: what kind of state is it?</p>

One open question to carry out the door: the IM stores the bath's *entire* multi-time
memory, yet section 4 showed that a Markovian bath needs almost none of it. How much of
that memory does a *generic* many-body bath actually use? That is not a rhetorical
question — it is a number, and Part 2 computes it.

<div class="sec-divider" aria-hidden="true">•••</div>

## References

{% bibliography --file refs_influence_matrix --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public post: I write these to teach myself the physics behind my PhD, with
> **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
{: .block-tip }

<script src="{{ '/assets/js/equation-numbers.js' | relative_url }}"></script>
