---
layout: post
title: "Monitored Circuits and the Purification Transition"
date: 2026-08-02 05:00:00-0700
description: Leave the detector on while the circuit runs and the state's fate becomes a competition - unitaries spread entanglement, every measurement claws some back, and between the two sits a genuine phase transition. Volume law against area law, fast purification against a stalling clock — visible along trajectories, invisible in the average.
tags: [monitored-circuits, measurement-transitions, entanglement, quantum-circuits]
categories: [monitored-dynamics]
related_posts: false
provides_planned: [quantum-trajectory, monitored-circuit, measurement-induced-transition, purification-transition]
requires: [brickwork-circuit, gaussian-measurement-update, von-neumann-entropy, density-matrix]
uses: [area-law, clifford-group]
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
    --thread-color: #b3760a; /* amber — the series' 'narrative thread' colour, not the teal accent */
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
     THREAD: "Monitored dynamics" — Post M1 of 3 (arc internal; each post
     ends on ONE open question, no published roadmap).

     ROLE: thread opener. The randomness thread's exit question ("what is
     the state when measurement happens DURING the dynamics?") is this
     post's opening move — but the post must stand alone for a reader
     arriving cold from /blog/.

     THROUGH-LINE: THE TRANSITION LIVES IN THE TRAJECTORIES, NOT THE
     AVERAGE — every observable linear in ρ̄ is blind to it; the order
     parameters are nonlinear in the conditioned state.

     KEY REFS: skinner2019measurement (PRX 9, 031009);
     li2019measurement (PRB 100, 134306); gullans2020dynamical
     (PRX 10, 041020). All in refs_monitored.

     NOTATION (fix at writing time, per registry header note):
       - measurement rate glyph: p vs γ — γ is a decoherence-thread
         fluctuator switching rate AND the Majorana glyph is γ_a
         site-wide; p collides with outcome probabilities p_s locally
         but p is the field's standard and p_s carries its subscript.
         LIKELY: p for rate, said explicitly in prose. FLAG if the
         collision reads badly in drafts.
       - S(x) entanglement profile, S(t) growth — matches existing
         free-fermion/matchgate usage.
     ===================================================================== -->

<!-- =====================================================================
     SECTION 1 — The detector joins the circuit (~450 words)
     - Open cold and concrete: a brickwork circuit (concept_link
       brickwork-circuit) scrambles — entanglement grows linearly, then
       volume law; the reader owns this picture. Now sprinkle projective
       single-site measurements between layers at rate p. Each
       measurement yields a random outcome and COLLAPSES its site —
       entanglement locally destroyed, and (via the entanglement-swap
       reading the measuring post taught) redistributed.
     - Define the object: one RUN = one measurement record = one
       QUANTUM TRAJECTORY — a pure state conditioned on its record,
       Born-weighted. ANCHOR model-quantum-trajectory when written.
     - Define the model class: monitored (hybrid) circuit — unitary
       brickwork + rate-p measurements. ANCHOR model-monitored-circuit.
     - The naive guesses that both fail: (a) any p > 0 eventually kills
       entanglement (Zeno-ish intuition); (b) any p < 1 eventually
       scrambles (unitarity wins). The truth — a sharp transition at
       p_c — is the thread's founding surprise (skinner2019measurement,
       li2019measurement).
     - Thread-note: the through-line — and the warning that makes this
       field subtle: average over records first, and EVERYTHING linear
       washes out; ρ̄ evolves by a boring dephasing channel. The physics
       is in moments nonlinear in the conditioned state.
     ===================================================================== -->

## 1 · The detector joins the circuit

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 2 — Born-weighted bookkeeping (~500 words + box)
     - The formal skeleton, kept light: trajectory = alternating
       (brickwork layer) and (for each site, with prob. p: measure).
       Record m; conditioned state |ψ_m⟩; weight = Born probability of
       m. Trajectory-averaged expectation of any LINEAR functional =
       expectation in ρ̄ = Σ p_m |ψ_m⟩⟨ψ_m| — prove in the body in
       three lines that ρ̄ is exactly the unmonitored circuit with
       dephasing noise: measurement-as-noise, the blindness theorem of
       the thread-note.
     - Therefore the observables that CAN see the transition are
       nonlinear in the trajectory: E_m[S_A(|ψ_m⟩)] (entanglement
       averaged AFTER the entropy, not before), fluctuations,
       trajectory-resolved correlators. One paragraph on why this is
       experimentally ominous (the record enters — seeds M3's crisis
       honestly, one clause, no roadmap).
     - COLLAPSIBLE BOX: ρ̄ = dephasing-circuit proof; the Kraus/POVM
       bookkeeping for rate-p monitoring; why Born weighting (not
       uniform-over-records) is the physical ensemble.
     ===================================================================== -->

## 2 · Born-weighted bookkeeping

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 3 — The entanglement transition (~600 words + box)
     - The phase diagram in one figure-paragraph: p < p_c volume-law
       trajectories (scrambling wins; entanglement extensive, protected
       BY the scrambling from the sparse measurements); p > p_c area law
       (measurements win; state pinned near a product state, concept_link
       area-law). At p_c: critical, logarithmic entanglement, emergent
       conformal symmetry in spacetime (stated, cited — no CFT detour).
     - Mechanism intuition worth spelling out (skinner2019measurement's
       percolation picture): a measurement cuts a leg out of the circuit
       tensor network; enough cuts disconnect the past from the future —
       the transition as a percolation of cuts through spacetime,
       exact for Haar gates at large local dimension, approximate
       otherwise. This gives the reader a PICTURE, and it composes with
       the tensor-network diagrams they own from solvable-circuits.
     - ANCHOR result-measurement-induced-transition (.key-eq or the
       phase-diagram statement).
     - Honesty paragraph: p_c and exponents are numerical (stabilizer
       circuits via Clifford simulability — concept_link clifford-group,
       the randomness thread's tool showing up as a WORKHORSE here);
       the universality class is NOT percolation for qubits; open
       problems flagged as open.
     - COLLAPSIBLE BOX: the cut-counting/percolation argument made
       precise at the level this post needs; minimal-cut reading of
       volume vs area law; what large-q makes exact.
     ===================================================================== -->

## 3 · The entanglement transition

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 4 — The same transition, read as purification (~500 words + box)
     - Gullans–Huse reframe: start the system MAXIMALLY MIXED (entangled
       with a reference you never touch). Monitor. In the area-law
       phase, the record rapidly identifies the state — purity of the
       conditioned state rises fast (purification time ~ log L or
       poly); in the volume-law phase the scrambling HIDES the initial
       information from local measurements — purification time
       exponential in L. Same p_c, new order parameter: the entropy of
       the system CONDITIONED on the record, i.e. how much the record
       has learned.
     - The information-theoretic reading (the deep one, one careful
       paragraph): volume-law phase = a dynamically generated quantum
       error-correcting code — the circuit protects a logical qubit
       (the reference entanglement) against the measurements' repeated
       attempts to read it out. Cite gullans2020dynamical; connect by
       one clause to the ZX/QEC thread's language (uses-level, if the
       glyphs allow) without a detour.
     - ANCHOR result-purification-transition (.key-eq).
     - COLLAPSIBLE BOX: two-qubit toy purification computed exactly
       (one monitored qubit + reference): purity vs time for p small/
       large, the crossover visible in a 2×2 computation.
     ===================================================================== -->

## 4 · The same transition, read as purification

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 5 — Watch the competition (~350 words + WIDGET)
     - WIDGET: assets/js/monitored-circuit.js — REUSE the circuit
       rendering from spacetime-circuit.js (import/extend its drawing
       helpers; do not fork the brickwork renderer). Stabilizer/Clifford
       simulation backend (n ~ 16–24 feasible in JS; state n on screen)
       so volume-law depths are honest. Controls: measurement-rate
       slider p, run/pause, reset, "single trajectory vs average"
       toggle. Displays: the circuit diagram with measurement events
       marked as they happen; S(t) for the running single trajectory
       (jagged, record-dependent) alongside the trajectory-averaged
       curve (smooth); a small S̄(p) summary panel accumulating the
       area/volume crossover as the user sweeps p — the transition
       assembling itself from the user's own sweeps. Dark bg, teal
       #1fb2a6.
     - Reading guide: at small p the single trajectory hugs the
       unmonitored growth with visible measurement dents that heal; at
       large p it saw-tooths near zero; near p_c it wanders — the
       critical fluctuations are the point, not noise.
     - CLOSE on one open question (house rule): every curve on screen
       came from a simulator that knows the record. An experiment
       drawing the same curves would need the SAME record twice — and
       records are exponentially unlikely to repeat. Is this transition
       physics, or bookkeeping only a classical computer can see?
       (Hangs; M3's crisis, not announced.)
     ===================================================================== -->

## 5 · Watch the competition

<!-- (to be written; widget built last) -->

## References

{% bibliography --file refs_monitored --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public post: I write these to teach myself the physics behind my PhD, with
> **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
> {: .block-tip }

<script src="{{ '/assets/js/equation-numbers.js' | relative_url }}"></script>
