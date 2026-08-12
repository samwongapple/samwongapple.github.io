---
layout: post
title: "Designs: Random Enough for the Question You're Asking"
date: 2026-08-02 04:10:00-0700
description: Nobody can sample the Haar measure — and nobody needs to. A k-design matches it moment by moment, the observable you care about sets the k you must pay for, the Clifford group fakes it to third order exactly, and random circuits buy approximate randomness at a depth you can budget.
tags: [unitary-designs, clifford-group, random-circuits, quantum-information]
categories: [emergent-randomness]
related_posts: false
provides_planned: [state-k-design, unitary-k-design, clifford-group, approximate-design, design-depth-scaling]
requires: [haar-measure, frame-potential, moment-operator, brickwork-circuit]
uses: [matchgate-family, unitary-twirl, classical-simulability, lightcone-causality]
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
     THREAD: "Emergent randomness" — Post R2 of 6.
     Opens on R1's closing question (how deep before a circuit passes the
     k-th moment test?) per the house continuation contract.

     ROLE: make "random enough" a budgetable, k-indexed statement. The
     k-design ladder replaces the unpayable Haar measure with finite (even
     classically simulable) ensembles, priced by the moment order the
     question actually probes.

     THROUGH-LINE: THE OBSERVABLE'S MOMENT ORDER — NOT THE ENSEMBLE'S
     GLAMOUR — SETS THE RANDOMNESS YOU MUST PAY FOR.

     KEY REFS: dankert2009exact (Clifford 2-designs, fidelity estimation);
     gross2007evenly (design structure); webb2016clifford + zhu2017multiqubit
     (Clifford = exact 3-design, not 4); brandao2016local (local random
     circuits are approximate poly-designs).

     NOTATION: inherits R1's decisions (k = copies; frame potential
     F^{(k)}_E). New here: ε for design error — ε is the spin-qubit
     detuning site-wide (CONTRIBUTING §4); the approximate-design section
     must scope ε explicitly in prose or pick δ-decorated alternative —
     but δ is the geometric-control tolerance. Likely resolution:
     ε_design or writing the error inline; DECIDE AT WRITING TIME, flag
     in prose.
     ===================================================================== -->

<!-- =====================================================================
     SECTION 1 — The measure nobody can sample (~400 words)
     - Open on R1's cliffhanger: the moments converged on screen, but a
       Haar-random unitary on n qubits takes exp(4^n) real parameters —
       no lab, no RNG, no compiler produces one. Continuous, unphysical,
       and yet every formula in R1 assumed it.
     - The escape: no experiment ever measures "the measure" — only
       moments (R1's reframe, now cashed). If a FINITE ensemble matches
       Haar's k-th moment operator, then for every degree-k question the
       two are indistinguishable. Name that: a k-design.
     - Thread-note: state the through-line.
     - Honest scope-setting: this post classifies randomness by k; which
       ensembles are CHEAP to sample (Clifford: yes, poly-time; Haar:
       never) is what makes the classification useful rather than
       taxonomic.
     ===================================================================== -->

## 1 · The measure nobody can sample

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 2 — State designs, unitary designs (~550 words + box)
     - Define state k-design: ensemble of pure states whose k-copy
       average equals ∫|ψ⟩⟨ψ|^{⊗k} dψ. Compute the Haar k-copy average
       in the body for k = 1 (maximally mixed) and quote k = 2 (symmetric
       subspace projector / (dim)); full derivation in box.
     - ANCHOR model-state-k-design (or result-) on the definition.
     - Smallest honest example: single qubit, the 6 stabilizer states =
       exact state 2-design; the 4-state SIC is another. Verify the
       stabilizer 2-design claim numerically (note verification in the
       scaffold tradition — claim checked before prose lands).
     - Define unitary k-design via moment operators (R1 §3's object):
       M^{(k)}_E = M^{(k)}_Haar. Frame-potential criterion as the
       practical test: F^{(k)}_E = F^{(k)}_Haar iff E is a k-design
       (cite gross2007evenly, roberts2017chaos).
     - ANCHOR on unitary-k-design definition (.key-eq).
     - The hierarchy: k-design ⇒ (k−1)-design; Haar = ∞-design; Pauli
       ensemble = 1-design but NOT 2 (one-line frame-potential check,
       done in body — first use of the new tool).
     - Which k do YOU need? Table tying questions to moment order:
       average fidelity → k=2 (dankert2009exact); purity/OTOC variance →
       k=2 at two copies, benchmarking tails → k=3; shadow-norm variance
       → k=3 (forward tension for R4, one sentence).
     - COLLAPSIBLE BOX: Haar k=2 state moment via symmetric subspace;
       stabilizer-states-are-a-2-design check; frame potential of the
       Pauli ensemble.
     ===================================================================== -->

## 2 · State designs, unitary designs

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 3 — The Clifford group: an exact 3-design for free
     (~550 words + box)
     - Define the Clifford group as the Pauli normalizer; size, poly-time
       sampling, Gottesman–Knill simulability in one paragraph (no
       stabilizer-formalism detour — cite).
     - ANCHOR model-clifford-group.
     - The theorem: multiqubit Clifford is an EXACT unitary 3-design
       (webb2016clifford, zhu2017multiqubit), and exactly NOT a 4-design.
     - Show the failure at k = 4 concretely rather than abstractly: the
       fourth-moment discriminator (e.g. the |Tr U|^8 frame-potential
       value or the stabilizer-purity witness) — numbers, not slogans.
       Full computation in box for d = 2.
     - Physical reading: a classically simulable gate set impersonates
       full quantum randomness up to third moments — "random" and
       "computationally powerful" are different axes. (This is the same
       moral as matchgates-vs-universality in the circuits thread; say so
       in one sentence, concept_link to classical-simulability.)
     - COLLAPSIBLE BOX: single-qubit Clifford frame potentials F^{(k)}
       for k = 1..4 computed exactly (24 elements, finite sum): 1, 2, 6,
       30 vs Haar's 1, 2, 6, 24 — the k = 4 gap is THE number to show.
     ===================================================================== -->

## 3 · The Clifford group: an exact 3-design for free

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 4 — Approximate designs and the depth they cost
     (~550 words + box)
     - Real circuits are never exact designs past small k — define
       ε-approximate k-design (diamond-norm / relative-error flavors
       named honestly, one chosen for use; scope the ε glyph per the
       notation note in the header comment).
     - ANCHOR on approximate-design definition.
     - The production law: local random brickwork circuits (concept_link
       brickwork-circuit — the solvable-circuits thread's object, now
       with random gates) converge to ε-approximate k-designs in depth
       O(poly(k)·(n + log 1/ε)) — brandao2016local, stated with the
       polynomial left explicit and NOT oversold; one paragraph on what
       is known to be tight-ish since (linear-in-n intuition, light
       touch, cite reviews rather than chasing the frontier).
     - ANCHOR result-design-depth-scaling (.key-eq).
     - Mechanism intuition (no proof): each brickwork layer contracts
       the non-Haar components of the k-copy moment operator by a gap —
       randomness spreads like correlations do, at finite speed. Connect
       to the light-cone picture the reader already owns (concept_link
       lightcone-causality, uses-level).
     - COLLAPSIBLE BOX: the two-copy tensor-network picture of a twirled
       brickwork layer; why a spectral gap of the transfer object implies
       exponential moment convergence (schematic, honest about what is
       asserted vs proved).
     ===================================================================== -->

## 4 · Approximate designs and the depth they cost

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 5 — Four ensembles race (~350 words + WIDGET)
     - WIDGET: assets/js/frame-potential.js — frame potential vs circuit
       depth, log y-axis, four ensembles on shared axes:
         (a) Haar — analytic floor, drawn as a line, k! for U(d);
         (b) random Clifford circuits — converge to the floor for k ≤ 3,
             plateau ABOVE it at k = 4 (slider k ∈ {1,2,3} per spec plus
             the k=4 gap shown as an inset/note if k slider stays ≤ 3 —
             decide at build time, honesty first);
         (c) random brickwork (Haar 2-site gates) — exponential approach,
             rate visibly depth-linear;
         (d) random MATCHGATE brickwork — visibly plateaus above the
             Haar floor at k = 2 already. THE HOOK: the plateau is not
             slowness, it is an obstruction. No explanation offered here.
       Controls: k ∈ {1,2,3}, system size n ∈ {2..6}, ensemble toggles;
       dashed k-design floor reference line. Dark bg, teal #1fb2a6.
       Estimator note: finite-sample frame potential is biased low —
       show the sample count and the known-floor lines, no faked
       convergence.
     - Reading guide paragraph: Clifford hugging the floor at k ≤ 3 is
       §3 made visible; the brickwork slope is §4's depth law; the
       matchgate plateau is the one curve the post cannot explain.
     - CLOSE on one open question (house rule): the matchgate ensemble
       is maximally random BY ITS OWN LIGHTS (the measuring post proved
       its deep thermalization) yet pins above the Haar floor forever —
       what property of a gate set decides the floor it converges to?
     ===================================================================== -->

## 5 · Four ensembles race

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
