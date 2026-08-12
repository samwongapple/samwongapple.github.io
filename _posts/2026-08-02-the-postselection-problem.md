---
layout: post
title: "The Postselection Problem"
date: 2026-08-02 05:20:00-0700
description: The measurement-induced transition is real, sharp — and priced in a currency no lab owns - to see a trajectory-resolved quantity you must see the same record twice, and records repeat with exponentially small probability. The workarounds that make the transition observable anyway - reference dynamics, cross-entropy benchmarks, and decoders that read the record instead of fighting it.
tags: [monitored-circuits, postselection, measurement-transitions, quantum-information]
categories: [monitored-dynamics]
related_posts: false
provides_planned: [postselection-barrier, cross-entropy-benchmark, reference-dynamics]
requires: [measurement-induced-transition, purification-transition, classical-shadow, quantum-trajectory]
uses: [matchgate-weak-simulation, monitored-free-fermions, clifford-group]
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
     THREAD: "Monitored dynamics" — Post M3 of 3 (thread closer).
     Opens on M2's closing question: is any trajectory-resolved quantity
     measurable in a lab, even in principle?

     ROLE: the reckoning. M1–M2 built physics on quantities nonlinear in
     the conditioned state; this post prices them honestly (exponential),
     then walks the three families of workarounds. It is also where the
     two threads finally interlock in public: the classical-shadow
     toolbox (R4) reappears inside McGinley's postselection-free
     learning, and the simulator's free conditioning (measuring post §3)
     is revealed as the exact thing nature refuses to sell.

     THROUGH-LINE: NATURE CHARGES 2^N PER TRAJECTORY REVISIT — every
     observable scheme either pays it, or restructures the question so
     the record is an INPUT instead of a filter.

     ANCHOR PAPER: mcginley2024postselection (PRX Quantum 5, 020347).
     Also: garratt2024probing (postselection problem framing);
     li2023cross (cross-entropy benchmark); gullans2020scalable
     (decoder/order-parameter framing). All in refs_monitored.

     NOTATION: no new glyphs expected (records m, probabilities p_m as
     M1; XEB's χ or F_XEB — F again! decorate as F_XEB and say so, or
     avoid the glyph; verify at writing time).
     ===================================================================== -->

<!-- =====================================================================
     SECTION 1 — The bill arrives (~450 words)
     - Open on the asymmetry the blog has been nursing since the
       measuring post's §3 (concept_link matchgate-weak-simulation):
       conditioning is FREE for a simulator, and every M1/M2 curve
       leaned on that freedom. Now price it for a lab: a
       trajectory-resolved expectation ⟨O⟩_m needs the same record m
       at least twice; records are exponentially many and Born-random.
       Waiting time ~ 2^{#measurements}. State it as a theorem-shaped
       claim (ANCHOR result-postselection-barrier when written,
       .key-eq with the scaling).
     - Why averaging doesn't rescue you (recall M1 §2's blindness
       theorem in one paragraph): record-averaged linear observables see
       a dephasing channel; the transition sits precisely in what
       averaging kills. The catch-22, stated cleanly.
     - Thread-note: the through-line — pay, or restructure.
     - Honest framing of stakes: this is not an engineering nuisance;
       it is why some call the MIPT "a phase transition of the
       simulation" (garratt2024probing's framing of the debate). The
       post takes the question seriously rather than as rhetoric.
     ===================================================================== -->

## 1 · The bill arrives

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 2 — Workaround I: bring a reference (~500 words + box)
     - The structural insight all workarounds share: stop asking
       "what is the state GIVEN record m" (a filter — exponential) and
       start asking "what does the record itself, paired with classical
       computation, reveal" (an input — every shot counts).
     - Reference dynamics (mcginley2024postselection as the anchor
       instance): run the experiment once per shot; feed the OBSERVED
       record into a classical simulation of reference dynamics; build
       estimators that correlate lab outcomes with simulated
       conditional states. Every shot contributes — no revisits needed.
       What it costs instead: the reference must be classically
       simulable (Clifford, free-fermion — concept_link
       monitored-free-fermions; M2's exactness becomes an experimental
       ASSET here, close the loop explicitly).
     - ANCHOR result-reference-dynamics (.key-eq protocol block).
     - Where R4 re-enters (one honest paragraph): the estimator
       machinery is shadow-flavored — randomized data, classical
       postprocessing, linear-functional unbiasedness (concept_link
       classical-shadow) — cite mcginley2024postselection's actual
       construction rather than forcing the analogy.
     - COLLAPSIBLE BOX: the simplest reference-dynamics estimator
       worked end to end on a 2-qubit monitored toy: what is computed
       classically, what is measured, why the cross-term survives
       averaging.
     ===================================================================== -->

## 2 · Workaround I: bring a reference

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 3 — Workaround II: cross-entropy, and III: decoders
     (~550 words + box)
     - Cross-entropy benchmark (li2023cross): compare the distribution
       of measurement records from the experiment against the
       classically computed record distribution of a REFERENCE circuit;
       the XEB-style linear cross-entropy is (i) estimable from single
       shots, (ii) an order parameter for the transition — sensitive to
       the phase without ever conditioning. State what must be
       classically computable and for which circuit families that is
       honest (stabilizer, free-fermion), and the glyph decision
       (F_XEB, scoped).
     - ANCHOR result-cross-entropy-benchmark (.key-eq).
     - Decoder framing (gullans2020scalable): in the purification
       language (concept_link purification-transition), the transition
       is a decoding threshold — a classical decoder reading the record
       either CAN or CANNOT recover the reference qubit; scalable
       order parameter, single-shot, and the QEC reading of M1 §4
       becomes operational. One careful paragraph + pointer.
     - Taxonomy paragraph (the section's synthesis): all three
       workarounds are the same move — record as input to classical
       computation, never as filter — instantiated at three levels
       (state estimation / distribution test / decoding task). The
       through-line, cashed.
     - COLLAPSIBLE BOX: linear XEB estimator variance in the two
       phases (why the signal survives at p < p_c and dies at p > p_c),
       small exact example.
     ===================================================================== -->

## 3 · Workaround II: cross-entropy, and III: decoders

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 4 — The gap, drawn to scale (~300 words + WIDGET)
     - WIDGET: assets/js/postselection-cost.js — shots-required vs
       system size N, log y-axis. Two families of curves: naive
       postselection (2^{αN} — the α made explicit and honest for a
       chosen measurement density), vs the postselection-free scheme's
       polynomial cost (constants from mcginley2024postselection-class
       analysis, labeled as order-of-magnitude). Controls: measurement
       rate, target precision ε; a "years at 10 kHz" secondary axis so
       the exponential reads as TIME — the visual is the entire
       argument, keep the widget spartan. Optionally mark real-device
       scales (N where naive = 1 second, 1 day, age of universe). Dark
       bg, teal #1fb2a6.
     - Reading guide: two sentences. The gap is not closable by better
       hardware; it is closable by better QUESTIONS — which is what
       §§2–3 were.
     - CLOSE the thread on one open question (house rule): every
       workaround imported a classical simulator as the experiment's
       partner — the lab measures, the laptop conditions. The
       partnership works exactly when the reference is simulable. What
       happens to the observability of monitored phases in circuits
       that have NO classical partner — deep in the volume-law phase of
       a generic interacting circuit, is the transition there, in any
       operational sense, at all? (Hangs. Thread ends looking over the
       edge it started from.)
     ===================================================================== -->

## 4 · The gap, drawn to scale

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
