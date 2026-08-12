---
layout: post
title: "Monitored Free Fermions"
date: 2026-08-02 05:10:00-0700
description: Monitor a free-fermion chain and every trajectory stays Gaussian — collapse is still one covariance-matrix update, so the sharpest questions about measurement-induced phases stay exactly computable. What the exactness buys is a surprise - no volume law at all, a critical logarithmic phase in its place, and a clean lesson in why free is not generic.
tags: [monitored-circuits, free-fermions, matchgates, entanglement]
categories: [monitored-dynamics]
related_posts: false
provides_planned: [monitored-free-fermions, log-law-phase, gaussian-trajectory]
requires: [monitored-circuit, gaussian-measurement-update, correlation-matrix, purification-transition, measurement-induced-transition]
uses: [critical-log-entropy, matchgate-weak-simulation, quadratic-hamiltonian, born-rule-gaussian]
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
     THREAD: "Monitored dynamics" — Post M2 of 3. Direct sequel to M1 AND
     to "Measuring Free Fermions" (the two parents named in §1).

     ROLE: the exactly solvable case of M1's physics — and the case where
     the generic story FAILS, instructively. Free fermions under
     monitoring have no volume-law phase; the interesting structure is a
     log-law regime and its (dimension/symmetry-dependent) fate.

     THROUGH-LINE: EVERY TRAJECTORY IS GAUSSIAN — the whole monitored
     ensemble is a stochastic process on covariance matrices, so
     trajectory physics that is exponentially hard generically is
     polynomial here, and the answers come out DIFFERENT from generic:
     solvable and non-generic are the same fact, twice.

     KEY REFS: cao2019entanglement (SciPost 7, 024 — continuous
     monitoring, log phase); alberton2021entanglement (PRL 126, 170602 —
     extended criticality to area law); fava2023nonlinear (PRX 13,
     041045 — sigma-model picture, DESCRIPTIVE treatment only).
     All in refs_monitored.

     NOTATION: inherits everything (Γ, γ_a, S(ℓ) with ℓ the subsystem
     length as in critical-log-entropy's ln L_A — reconcile ℓ vs L_A
     with the free-fermion thread's usage AT WRITING TIME; likely keep
     L_A). Monitoring rate: M1's glyph decision carries over; continuous
     monitoring adds a strength/rate γ-like parameter — MUST NOT be bare
     γ (Majoranas!); candidate: λ_m? NO — λ is Kibble–Zurek's. Candidate:
     Γ_m collides with covariance Γ. The field uses γ; a decorated
     γ_meas may be least-bad. DECIDE AT WRITING TIME; flag prominently.
     ===================================================================== -->

<!-- =====================================================================
     SECTION 1 — Two parents, one experiment (~400 words)
     - Name the two posts this one fuses: M1 (monitored brickwork,
       transition, order parameters) and Measuring Free Fermions
       (collapse as a closed-form Γ update — concept_link
       gaussian-measurement-update). The obvious next move was always:
       monitor a FREE chain and keep the exactness.
     - The closure argument in one paragraph (this is the post's licence
       to exist): unitary layer = rotation of Γ; occupation measurement
       = the measuring post's update; therefore EVERY trajectory of a
       monitored quadratic chain is Gaussian end to end — the ensemble
       is a stochastic process on 2n×2n matrices. ANCHOR
       result-gaussian-trajectory when written (.key-eq).
     - Thread-note: the through-line, with its warning half — exactness
       will buy big systems and clean scaling, and it will also buy an
       answer that generic circuits do NOT give. Solvability and
       non-genericity arrive together (the blog's oldest theme, now in
       the time direction).
     - Model statement: hopping chain + continuous or stroboscopic
       occupation monitoring (both defined; continuous treated as the
       weak-measurement limit, box for the unraveling). ANCHOR
       model-monitored-free-fermions.
     ===================================================================== -->

## 1 · Two parents, one experiment

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 2 — The missing volume law (~550 words + box)
     - The headline negative result first (cao2019entanglement): for
       monitored free fermions in 1D, ANY nonzero monitoring strength
       kills the volume law. No M1-style scrambling-protected phase.
       State it, then explain the mechanism at the level of straddling
       orbitals: free dynamics spreads correlations ballistically but
       cannot HIDE them nonlocally the way interacting scrambling does
       — each measurement finds the mode structure intact and prunes
       it. (Careful, physical, no sigma model yet.)
     - What replaces it: at weak monitoring, a CRITICAL regime with
       S(L_A) ~ ln L_A — the log-law phase — crossing over to area law
       at strong monitoring (alberton2021entanglement). The log echoes
       the ground-state critical logarithm the reader owns (concept_link
       critical-log-entropy) but its origin is dynamical; work the
       contrast honestly.
     - ANCHOR result-log-law-phase (.key-eq on the S ~ ln L_A statement
       with its regime of validity).
     - Honesty paragraph (the field's genuinely subtle bit, descriptive
       only): whether the log phase is a true phase or a finite-size
       crossover depends on symmetry class and dimension; the
       sigma-model picture (fava2023nonlinear) organizes this — quote
       its conclusions for the number-conserving 1D case, flag the
       weak-localization analogy, DO NOT derive. One paragraph, clearly
       labeled as the current understanding.
     - COLLAPSIBLE BOX: the stroboscopic trajectory update assembled
       explicitly from existing pieces (rotate Γ, Born-draw via
       born-rule-gaussian, update via gaussian-measurement-update);
       the continuous-monitoring limit sketched; parameters mapped to
       cao2019entanglement's.
     ===================================================================== -->

## 2 · The missing volume law

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 3 — Why free is not generic (~500 words + box)
     - The section the thread exists for: put M1's generic story and
       M2's free story side by side and extract WHY they differ.
       Three aligned contrasts, one paragraph each:
       (a) Scrambling vs spreading: interacting dynamics hides
           information in high-weight operators (measurement-proof);
           free dynamics only rotates single-particle orbitals —
           information stays low-degree, measurement-findable. (Tie to
           R3's commutant if the randomness thread has landed by then:
           the same largeness of the matchgate commutant. One clause,
           uses-level.)
       (b) Error-correction reading: M1's volume phase = dynamical QEC;
           quadratic dynamics cannot build a code — say what fails
           (no magic, no high-weight logicals; descriptive).
       (c) Order parameters: purification behaves accordingly — quote
           the free-fermion purification behavior against
           gullans2020dynamical's generic one.
     - The moral, stated as the through-line's payoff: exact
       solvability was purchased by exactly the structure whose absence
       makes generic monitored circuits interesting. Free fermions are
       the perfect microscope and the wrong universe — both, always.
     - COLLAPSIBLE BOX: operator-weight bookkeeping under quadratic
       evolution (degree preserved) vs one interacting gate (degree
       grows) — three lines each, concrete.
     ===================================================================== -->

## 3 · Why free is not generic

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 4 — Watch the log law assemble (~350 words + WIDGET)
     - WIDGET: EXTEND assets/js/quench-dynamics.js (the free-fermion
       thread's quench widget) with a monitoring rate — do not fork;
       the unmonitored quench must remain the default view its existing
       embeds render. New control: monitoring strength; new display:
       S(ℓ) profile at fixed late time, log-x toggle so the log law
       reads as a straight line; overlay of the unmonitored volume-law
       growth for the same chain as the ghost reference. Sweep
       behavior: strength 0 → the familiar linear growth/volume
       profile; weak → S(ℓ) bends onto a clean logarithm; strong →
       area-law flat. Trajectory averaging over a handful of records
       with the spread shown (thin lines), not hidden. Backend:
       covariance-matrix simulation, n ~ 100+ sites feasible — say so
       on screen; THIS scale is the exactness dividend, make it felt.
       Dark bg, teal #1fb2a6.
     - Reading guide: one paragraph — the same slider sweep in M1's
       widget crossed volume→area through a transition; here it crosses
       log→area, and no setting produces volume. Two widgets, one
       lesson: the phase diagram belongs to the dynamics' algebra, not
       to measurement itself.
     - CLOSE on one open question (house rule): the simulator averaged
       over records because it could postselect for free (the measuring
       post's superpower — concept_link matchgate-weak-simulation). An
       experiment cannot. Every trajectory-resolved quantity in this
       post — is ANY of it measurable in a lab, even in principle?
       (Hangs; M3.)
     ===================================================================== -->

## 4 · Watch the log law assemble

<!-- (to be written; widget extension built last) -->

## References

{% bibliography --file refs_monitored --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public post: I write these to teach myself the physics behind my PhD, with
> **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
> {: .block-tip }

<script src="{{ '/assets/js/equation-numbers.js' | relative_url }}"></script>
