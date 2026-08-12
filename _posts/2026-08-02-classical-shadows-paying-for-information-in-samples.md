---
layout: post
title: "Classical Shadows: Paying for Information in Samples"
date: 2026-08-02 04:30:00-0700
description: Rotate by a random unitary, measure once, keep the classical record — then invert the average and a handful of shots sketches the state. The shadow norm prices every observable before you take a single sample, and median-of-means makes the estimate survive its own tails.
tags: [classical-shadows, randomized-measurements, tomography, quantum-information]
categories: [emergent-randomness]
related_posts: false
provides_planned: [classical-shadow, measurement-channel-inverse, shadow-norm, median-of-means, shadow-sample-complexity]
requires: [unitary-k-design, unitary-twirl, clifford-group, density-matrix]
uses: [haar-measure, frame-potential, pauli-algebra]
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
     THREAD: "Emergent randomness" — Post R4 of 6.
     Opens on R3's closing question: when is an ensemble's structure an
     ASSET you can spend rather than an obstruction?

     ROLE: the thread's pivot from characterizing randomness to SPENDING
     it. Randomized measurement inverts the direction of every previous
     post: instead of asking how random the dynamics is, deliberately
     inject known randomness and buy information with it.

     THROUGH-LINE: RANDOMIZE, MEASURE, INVERT — the twirl is now a
     measurement channel, and because you built it, you can undo it.

     ANCHOR PAPER: huang2020predicting (Huang–Kueng–Preskill, Nat. Phys.
     16, 1050). Survey framing: elben2023randomized (Nat. Rev. Phys.).

     NOTATION: M for the measurement channel (calligraphic), M^{-1} its
     inverse — matches the registry symbol; check /notation/ at writing
     time (M_± is the solvable-circuits light-ray channel; calligraphic-M
     with no subscript, different thread — state the scoping in prose).
     N = number of shots; K = number of median batches (K collides with
     nothing site-wide; verify).
     ===================================================================== -->

<!-- =====================================================================
     SECTION 1 — Tomography is a scam (you're overpaying) (~450 words)
     - Open on the price of full state tomography: 4^n parameters,
       exponential shots, and then you throw 99% of the reconstruction
       away because you only wanted ⟨Z_1 Z_7⟩ and a fidelity. The
       question worth paying for: predict MANY specific properties from
       FEW samples, without ever holding ρ.
     - The protocol, stated in five lines (the whole post unpacks it):
       draw U from a known ensemble, apply, measure computational basis,
       record (U, b) — a CLASSICAL object. That pair is the "shadow".
       Repeat N times.
     - Thread-note: the through-line. The reader has seen this move
       before — the projected ensemble measured everything and
       conditioned; here we RANDOMIZE first and average after, and the
       known randomness is what lets us undo the damage.
     - Honest scope: this post is qubits + global/local Clifford
       ensembles (the fermionic version is its own story — no roadmap,
       one clause).
     ===================================================================== -->

## 1 · Tomography is a scam (you're overpaying)

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 2 — The measurement channel and its inverse (~600 words + box)
     - Define the measure-and-forget channel: M(ρ) = E_U E_b
       U†|b⟩⟨b|U conditioned reconstruction — the average of the
       snapshot U†|b⟩⟨b|U over ensemble and Born outcome. Key move: M is
       LINEAR in ρ and computable as a twirl (R1 §3's machine, aimed at
       a POVM). For any 2-design ensemble, M = depolarizing with known
       strength: M(ρ) = (ρ + Tr[ρ]·1)/(d+1). Derived in body via the
       k = 2 twirl — this is where R1's explicit computations pay off.
     - ANCHOR result-measurement-channel-inverse (.key-eq): the inverse
       M^{-1}(X) = (d+1)X − Tr[X]·1, and the shadow estimator
       ρ̂ = M^{-1}(U†|b⟩⟨b|U). Unbiasedness E[ρ̂] = ρ in two lines.
     - ANCHOR model-classical-shadow (or result-) on the protocol
       definition block.
     - The uncomfortable, load-bearing honesty: ρ̂ is NOT a state (not
       positive, eigenvalues way outside [0,1]) — it is an unbiased
       coin, not a snapshot photo. Individual shadows are garbage;
       averages of linear functionals are exact. One paragraph on why
       that is enough (and why nonlinear functionals need pairs of
       shadows — one clause, box detail).
     - Pauli-ensemble variant computed in body for one qubit (local
       Clifford = random Pauli basis): M = tensor product of one-qubit
       depolarizers, inverse factorizes, 3^{locality} structure appears
       — seeds §4's split.
     - COLLAPSIBLE BOX: full derivation of M for an exact 2-design via
       Weingarten/twirl; the one-qubit Pauli-ensemble channel; estimator
       unbiasedness; the U(1)-phase irrelevance remark.
     ===================================================================== -->

## 2 · The measurement channel and its inverse

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 3 — The shadow norm prices every observable (~550 words + box)
     - Variance is where ensembles differ. Define the shadow norm
       ‖O‖²_shadow = max over states of E_U E_b ⟨b|U M^{-1}(O) U†|b⟩² —
       the worst-case single-shot second moment. Var[ô] ≤ ‖O‖²_shadow;
       shots scale as ‖O‖²/ε². THIS is the price tag: computable BEFORE
       running anything, ensemble-dependent, observable-dependent.
     - ANCHOR result-shadow-norm (.key-eq).
     - Why the third moment shows up (the k = 3 twirl controls the
       variance of a k = 2 object) — one honest paragraph; the Clifford
       group being an exact 3-design (R2 §3) is EXACTLY why the variance
       is computable in closed form. The thread's earlier "trivia"
       (Clifford = 3-design) becomes load-bearing here; say so.
     - Global Clifford: ‖O‖²_shadow ≈ 3 Tr[O²] — great for fidelities
       (rank-1 O), terrible for local Paulis buried in big systems?
       No: Tr[O²] for a k-local Pauli is 2^n-normalized — work the
       bookkeeping honestly in the box; body carries the punchlines:
       Clifford pays Tr[O²], Pauli ensemble pays 3^k for k-local
       observables — INDEPENDENT of n.
     - ANCHOR result-shadow-sample-complexity on the two-column
       comparison (.key-eq or table + IAL): random Pauli 3^k vs random
       Clifford Tr[O²] — the exponential-vs-polynomial split by
       observable class. This is the section R5 will lean on.
     - COLLAPSIBLE BOX: shadow-norm computation for (a) a single-qubit
       Z under the Pauli ensemble (get 3), (b) k-local Pauli string
       (3^k), (c) rank-1 projector under global Clifford (the
       fidelity-estimation miracle).
     ===================================================================== -->

## 3 · The shadow norm prices every observable

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 4 — Median-of-means, or: surviving your own tails
     (~400 words + box)
     - The naive average fails not on variance but on TAILS: shadow
       estimators are unbounded (M^{-1} amplifies), a few wild shots can
       drag the mean anywhere, and Chebyshev's 1/δ failure-probability
       is too expensive when you want THOUSANDS of observables each at
       high confidence.
     - Median-of-means: K batches, batch means, median. The median
       needs only each batch to be "okay with probability > 1/2", so
       failure probability drops exponentially in K — log(#observables)
       cost, union bound over the whole prediction list.
     - ANCHOR result-median-of-means.
     - State the HKP theorem in its usable form (shots ~
       O(log(M_obs) · max_i ‖O_i‖²_shadow / ε²)), cite huang2020predicting;
       one paragraph on what is NOT promised (adaptivity, nonlinear
       functions need care, worst-case-state norm can be pessimistic —
       cite elben2023randomized for practice).
     - COLLAPSIBLE BOX: the median-of-means concentration argument in
       full (Chebyshev per batch + binomial tail on the median) — it is
       three inequalities and worth owning.
     ===================================================================== -->

## 4 · Median-of-means, or: surviving your own tails

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 5 — The budget, live (~300 words + WIDGET)
     - WIDGET: assets/js/shadow-budget.js — estimation error vs number
       of shots, log-log axes. Controls: observable locality k (1–5) and
       Frobenius weight; ensemble toggle (Pauli / Clifford); overlay the
       theoretical shadow-norm bound as a shaded envelope; show the
       empirical median-of-means trajectory vs the naive mean (with the
       naive mean's occasional tail-jumps VISIBLE — that is the honest
       point of plotting both). Simulate small n exactly (n ≤ 6), state
       n on screen. Dark bg, teal #1fb2a6.
     - Reading guide: slopes are −1/2 everywhere (CLT); the INTERCEPT is
       the shadow norm — ensembles differ by where the line sits, and
       swapping ensemble at fixed observable moves the intercept by
       exactly the §3 ratio.
     - CLOSE on one open question (house rule): the Pauli ensemble wins
       for local observables BECAUSE its channel factorizes; Clifford
       wins for global ones. Both are qubit ensembles. What plays their
       role when the natural observables are FERMIONIC — parity-strings
       whose locality is a Jordan–Wigner fiction? (Hangs; R5 exists but
       is not announced.)
     ===================================================================== -->

## 5 · The budget, live

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
