---
layout: post
title: "Shadow Tomography Without Control: Emergent Designs"
date: 2026-08-02 04:50:00-0700
description: Remove the programmable random gates entirely - a chaotic system manufactures its own measurement ensemble, a random evolution time is a basis rotation, and deep thermalization stops being a curiosity and becomes an experimental resource. Shadow tomography for analog machines that can only evolve and look.
tags: [classical-shadows, deep-thermalization, analog-simulators, quantum-information]
categories: [emergent-randomness]
related_posts: false
provides_planned: [emergent-state-design, analog-shadow-protocol, random-time-basis-rotation]
requires: [state-k-design, classical-shadow, deep-thermalization, frame-potential]
uses: [projected-ensemble, quadratic-hamiltonian, measurement-channel-inverse]
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
     THREAD: "Emergent randomness" — Post R6 of 6 (thread closer; ends on
     an open question that gestures across to monitored dynamics without
     announcing anything).
     Opens on R5's closing question: what if you cannot apply random
     gates at all?

     ROLE: close the loop. The thread began by DEFINING randomness (R1),
     learned to grade it (R2), found dynamics that generates its own
     brand of it (R3), and learned to spend injected randomness (R4–R5).
     Final move: the randomness you SPEND can itself be the randomness
     the system GENERATES — deep thermalization becomes a protocol.

     THROUGH-LINE: CHAOS IS A MEASUREMENT INSTRUMENT — if the dynamics
     is random enough at moment order k, you may bill it as a k-design
     and run shadows with no control hardware at all.

     ANCHOR PAPER: mcginley2023shadow (PRL 131, 160601 — shadow
     tomography from emergent state designs). Experiment:
     choi2023preparing (Nature 613 — also cited in the measuring post
     from refs_matchgates; a refs_randomness copy of the entry exists,
     cite whichever file convention prettier/scholar prefers — one key,
     one file, no double-citing across files in a single post).
     Free-fermion closing hook: kiser2026random (PRA 2026 — VERIFY
     entry details before citing; entered from planning prompt).

     NOTATION: t is physical evolution time here (uncontroversial);
     ensemble-of-times distribution p(t). No new glyph conflicts
     expected — verify against /notation/ at writing time.
     ===================================================================== -->

<!-- =====================================================================
     SECTION 1 — The device that can't be programmed (~450 words)
     - Open on the experimental reality R4–R5 politely ignored: analog
       simulators — Rydberg arrays, cold atoms in optical lattices,
       trapped-ion crystals in analog mode — have exquisite states and
       almost NO gate set. No random Cliffords, no matchgate compiler;
       you get: prepare, evolve under the native H, measure everything
       in one basis. Shadows as built in R4 are simply unavailable.
     - The heretical observation: R4 needed the random unitary to be
       KNOWN and WELL-DISTRIBUTED — nobody said it had to be APPLIED BY
       US. The system's own chaotic evolution is a unitary; if its
       statistics over some ensemble parameter (time, quench label,
       initial product state) mimic a design, it can do the twirl's job.
     - Thread-note: the through-line.
     - Recall in one paragraph what the reader owns: projected ensembles
       converge to maximal-entropy ensembles (concept_link
       deep-thermalization) — until now a statement about the SYSTEM'S
       randomness. This post re-reads the same theorem as a statement
       about a measurement RESOURCE.
     ===================================================================== -->

## 1 · The device that can't be programmed

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 2 — Emergent state designs, quantitatively (~550 words + box)
     - Setup (following mcginley2023shadow / the Cotler–Choi line):
       quench from a product state, evolve, measure a bath region B in
       the fixed native basis; conditional states on A form the
       projected ensemble. Statement: for chaotic H and long enough t,
       the ensemble is an approximate state k-design on A (cite
       cotler2023emergent via refs_matchgates for the mechanism,
       choi2023preparing for the observation).
     - "Chaotic enough", made quantitative — this is the section's job:
       the frame potential of the projected ensemble vs its Haar floor
       (R1's tool, applied to a STATE ensemble); convergence timescales;
       what integrable dynamics does instead (plateaus above floor —
       the reader has seen this movie in R2's widget, matchgate curve;
       say so explicitly). Honest about what is proven vs numerically
       observed (finite-size, energy conservation caveats — the
       ensemble is Haar WITHIN symmetry sectors / the Scrooge-ensemble
       subtlety at finite energy density; one careful paragraph, cite).
     - ANCHOR result-emergent-state-design (.key-eq on the design
       statement with its error terms).
     - COLLAPSIBLE BOX: frame potential of a projected ensemble defined
       and computed for a small exact model (the measuring post's
       6-qubit machinery, re-aimed); the k = 1 statement (= ordinary
       thermalization) separated from k ≥ 2 (= deep) cleanly.
     ===================================================================== -->

## 2 · Emergent state designs, quantitatively

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 3 — The protocol: bill the chaos as a design (~550 words + box)
     - The McGinley–Fava move, step by step: use the emergent design as
       the randomizing layer of a shadow protocol. Evolve (system
       supplies U), measure B (nature draws the label b), record
       (t, b, outcome on A). The measurement channel M is now determined
       by the EMERGENT ensemble; invert it as in R4. What must be known
       classically: the ensemble's low moments — not the microscopic
       trajectory. State the protocol's requirements and failure modes
       honestly (moment mismatch = bias, quantified; cite
       mcginley2023shadow's error analysis).
     - ANCHOR result-analog-shadow-protocol (.key-eq protocol block).
     - RANDOM-TIME EVOLUTION as the cleanest instance: draw t from p(t),
       evolve, measure. For free/noninteracting H the single-particle
       phases e^{iε_k t} randomize while the orbital structure stays
       rigid — a BASIS ROTATION drawn from a known, computable ensemble;
       the free-fermion instance (kiser2026random — charge-off-diagonal
       correlators from random-time noninteracting evolution) is the
       natural closing example and ties the thread back to its
       free-fermion roots. Work the two-mode toy example in the body:
       random-time evolution of one hopping term, the ensemble it
       generates on the Bloch circle, the observable it unlocks.
     - ANCHOR result-random-time-basis-rotation.
     - COLLAPSIBLE BOX: the two-mode random-time channel computed
       exactly (p(t) → dephasing profile → invertibility window); when
       p(t) too narrow ⇒ channel non-invertible ⇒ which observables are
       lost (an honest singular-channel discussion, small and concrete).
     ===================================================================== -->

## 3 · The protocol: bill the chaos as a design

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 4 — Design quality → inference quality (~350 words + WIDGET)
     - WIDGET: assets/js/emergent-design.js — two linked panels.
       LEFT: frame potential F^{(k)} of the emergent (projected /
       random-time) ensemble vs evolution time, chaotic vs integrable
       Hamiltonian on the same axes (chaotic: e.g. tilted-field Ising;
       integrable: transverse-field/free — reuse dispersion machinery
       conventions), Haar floor dashed; k toggle {1, 2}.
       RIGHT: downstream shadow-estimation error for a fixed observable
       USING that ensemble at the chosen time — the reader drags the
       time slider and watches design quality CONVERT into inference
       quality; with the integrable H the left curve plateaus above
       floor and the right error correspondingly floors out at a BIAS
       (not just slow: wrong — plot the bias honestly, distinguishable
       from variance). Dark bg, teal #1fb2a6; small n exact simulation,
       n stated on screen.
     - Reading guide: the two panels are the thread in miniature —
       moments (R1), floors (R2/R3), spending (R4/R5), and the closing
       equivalence: randomness quality IS measurement quality.
     - CLOSE on one open question (house rule; also the thread's exit):
       every protocol in this thread treated measurement as the FINAL
       act — randomize, measure once, stop. But the systems these
       methods target are increasingly ones where measurement happens
       DURING the dynamics, shot after shot, changing the state as it
       goes. What does "the state of the system" even mean when the
       record is part of the evolution? (Hangs. The monitored-dynamics
       thread exists; nothing is announced.)
     ===================================================================== -->

## 4 · Design quality → inference quality

<!-- (to be written; widget built last) -->

## References

{% bibliography --file refs_randomness --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public post: I write these to teach myself the physics behind my PhD, with
> **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
> {: .block-tip }

<script src="{{ '/assets/js/equation-numbers.js' | relative_url }}"></script>
