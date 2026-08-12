---
layout: post
title: "What Haar Measure Actually Does"
date: 2026-08-02 04:00:00-0700
description: '"Haar-random" is a physical claim, not a shrug. Left and right invariance alone fix the measure, and from invariance every moment you will ever need follows in closed form — the one- and two-fold twirls, the first Weingarten weights, and the frame potential that turns "how random?" into a number.'
tags: [haar-measure, random-circuits, quantum-information]
categories: [emergent-randomness]
related_posts: false
provides_planned: [haar-measure, unitary-twirl, moment-operator, weingarten-calculus, frame-potential]
requires: [density-matrix, partial-trace, pauli-algebra, bloch-sphere]
uses: [deep-thermalization, gaussian-haar-ensemble]
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
     THREAD: "Emergent randomness" — Post R1 of 6 (arc internal, never
     published as a roadmap; each post ends on ONE open question).
     R1 (this) → R2 designs → R3 commutant (keystone) → R4 shadows →
     R5 fermionic shadows → R6 emergent designs.

     ROLE: the thread's foundation stone. The measuring-free-fermions post
     used the word "Haar" 22 times on faith; this post pays the debt.
     Everything downstream (designs, commutants, shadows) is a statement
     about moments of this measure.

     THROUGH-LINE (thread-note near top): INVARIANCE ALONE DETERMINES THE
     MEASURE, AND EVERY MOMENT YOU WILL EVER NEED FOLLOWS FROM IT.

     SPINE REFERENCE: Mele, "Introduction to Haar measure tools in quantum
     information: a beginner's tutorial", Quantum 8, 1340 (2024)
     [mele2024introduction]. Weingarten: Collins–Śniady [collins2006integration].
     Frame potential: Roberts–Yoshida [roberts2017chaos].

     TARGET: ~2500–3500 words + collapsible derivation boxes.
     Anchors to place when prose lands: result-haar-measure,
     derivation-unitary-twirl, result-weingarten-calculus,
     result-frame-potential (+ moment-operator anchor, model- or result-).

     NOTATION (check /notation/ before writing — CONTRIBUTING §4):
       - k is the design/moment order HERE; the free-fermion thread owns
         k as a momentum index. Scope explicitly in prose the first time
         it appears ("k counts copies, not momenta").
       - Φ is NOT available for the moment channel (Φ_0 = flux quantum,
         superconductivity thread). Candidate: M^{(k)}_E with the script-E
         ensemble subscript, or T^{(k)}. DECIDE AT WRITING TIME and record
         the choice in the concepts.yml symbol fields.
       - F^{(k)}_E for the frame potential: F(ω,t) is the decoherence
         thread's filter function — superscript+subscript decoration keeps
         them apart; say so in prose where F^{(k)} is defined.
       - d = Hilbert space dimension (q is the solvable-circuits thread's
         local dimension; d is the standard glyph here and does not
         collide site-wide — verify against /notation/ when writing).
       - FLAG any further collisions found during writing; do not
         silently choose.
     ===================================================================== -->

<!-- =====================================================================
     SECTION 1 — "Pick a random unitary" (~400 words, minimal math)
     - Open on the debt: the measuring-free-fermions post leaned on
       "Haar-random" 22 times — deep thermalization, the Haar parabola
       ¾(1−m²), "maximally random" — without ever saying what Haar MEANS.
       Link back via concept_link to deep-thermalization /
       gaussian-haar-ensemble.
     - The everyday analogy ladder: uniform on a die (counting), uniform
       on a circle (rotation invariance), uniform on U(d) — each step
       replaces "equal weights" with "invariance under the group's own
       action", because on a continuum there is nothing to count.
     - The claim, stated as the post's engine (thread-note): invariance
       alone FIXES the measure uniquely — and once you have invariance,
       you never need the measure itself, only its moments, and those
       follow from invariance by symmetry arguments a Pauli algebra can
       finish.
     - Set expectations: no measure theory beyond one existence statement
       (cite mele2024introduction for the construction); everything else
       is computed in this post, explicitly, for k = 1 and k = 2.
     ===================================================================== -->

## 1 · "Pick a random unitary"

<!-- (to be written — Phase 3, section by section) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 2 — Invariance is the whole definition (~550 words + box)
     - Define left/right invariance: for any fixed V, the laws of VU and
       UV equal the law of U. State: there is exactly ONE probability
       measure on U(d) with this property (Haar's theorem, cited not
       proved; mele2024introduction §2).
     - Warmup on U(1): invariance under rotation forces the uniform
       measure on the circle — three lines, done in the body. This is the
       template for every argument that follows.
     - Single qubit picture: Haar on U(2) pushes forward to the uniform
       measure on the Bloch SPHERE (column of a Haar unitary = Haar-random
       pure state). Connect to Archimedes' hat-box flatness already used
       in the measuring post's GHE box — same uniformity, now named.
     - ANCHOR result-haar-measure on the invariance definition (.key-eq).
     - What invariance buys operationally: expectation values of any
       polynomial in U's entries are INVARIANT integrals — the measure
       never needs to be sampled or written down to compute them. This
       reframe (moments, not measure) is the pivot of the post.
     - COLLAPSIBLE BOX: the U(1) uniqueness argument in full; the
       push-forward from U(2) to S²; explicit parametrization
       (Euler-angle / Hurwitz) quoted for completeness with the warning
       that it is never needed again.
     ===================================================================== -->

## 2 · Invariance is the whole definition

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 3 — The k-th moment is a channel (~600 words + box)
     - Define the k-fold moment operator / twirl of an ensemble E:
       average of U^{⊗k} X U^{†⊗k} over E (glyph per notation decision —
       NOT Φ). Physical framing: "what survives averaging". k counts
       COPIES of the system — scope k against the free-fermion thread's
       momentum index explicitly here.
     - ANCHOR on the moment-operator definition (model- or result-).
     - k = 1 computed IN THE BODY, fully: invariance ⇒ the averaged
       operator commutes with every V ⇒ Schur ⇒ proportional to identity;
       trace preservation fixes the constant. Result: the twirl is the
       maximally depolarizing channel, X ↦ Tr[X]·1/d. Every unitary-
       invariant single-copy question has this one answer.
     - k = 2 computed IN THE BODY, structure first: the commutant of
       U⊗U is spanned by {1, SWAP} (stated here, cited to Schur–Weyl,
       full duality deferred to R3 — forward tension, name it honestly).
       Ansatz a·1 + b·SWAP, fix a, b by taking traces against 1 and SWAP.
       Display the closed form with the 1/(d²−1) structure.
     - ANCHOR derivation-unitary-twirl on the collapsible box.
     - Worked payoff in body: average purity of a Haar-random state's
       subsystem via the k = 2 twirl — recovers the Lubkin/Page-flavored
       (d_A + d_B)/(d_A d_B + 1) in two lines. Choose the example so it
       ECHOES the measuring post's var(m) = 1/5 parabola moment: same
       machine, now visible.
     - COLLAPSIBLE BOX: full k = 1 and k = 2 twirl derivations including
       the trace bookkeeping; the swap-trace identity Tr[SWAP(A⊗B)] =
       Tr[AB] proved in one line (it is the workhorse of the whole
       thread).
     ===================================================================== -->

## 3 · The k-th moment is a channel

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 4 — Weingarten, but only as much as we need (~450 words + box)
     - Reframe the twirl results as INTEGRALS of matrix-entry monomials:
       ∫dU U_{ij} U*_{kl} and the four-index k = 2 version. State the
       Weingarten formula's SHAPE (sum over permutation pairs σ, τ of
       Δ_σ Δ_τ Wg(στ⁻¹, d)) — and then instantiate it ONLY for k = 1, 2:
       Wg values 1/d for k=1; the (d²−1)-denominators pair for k=2,
       displayed as a small table. Do NOT attempt the general character
       formula — say so, and point to collins2006integration and
       mele2024introduction §5.
     - ANCHOR result-weingarten-calculus on the k ≤ 2 statement (.key-eq).
     - Sanity checks in body: recover §3's k = 1 twirl from the entry
       integral; recover E|U_{11}|² = 1/d by symmetry alone (all d²
       entries share the mass of one unit row). The POINT: Weingarten is
       the same invariance argument, bookkept once and for all — not new
       machinery.
     - COLLAPSIBLE BOX: derive the k = 2 Weingarten pair from the §3
       twirl by matching coefficients (no representation theory), and
       tabulate the four nonzero index patterns with their weights.
     ===================================================================== -->

## 4 · Weingarten, but only as much as we need

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 5 — How random is my ensemble? The frame potential
     (~450 words + box)
     - Motivate: everything so far assumed EXACT Haar. Real circuits give
       you some other ensemble E. Need a scalar that says how far E's
       k-th moment is from Haar's.
     - Define F^{(k)}_E = E_{U,V}|Tr(U†V)|^{2k} (decoration vs the filter
       function F(ω,t) stated in prose). Prove IN THE BODY the two facts
       that make it useful: (i) F^{(k)} = the Hilbert–Schmidt norm² of
       the moment operator, hence (ii) F^{(k)}_E ≥ F^{(k)}_Haar with
       equality iff the k-th moments match — "distance from Haar,
       measured moment by moment". Cite roberts2017chaos.
     - ANCHOR result-frame-potential on the inequality (.key-eq).
     - Haar floor values: F^{(1)} = 1, F^{(2)} = 2 (for d ≥ 2); the k!
       pattern and where it comes from (permutation counting — forward
       pointer to R3's commutant dimension, one sentence, no roadmap).
     - This section seeds the WIDGET and sets up the thread's next
       question without announcing a series.
     - COLLAPSIBLE BOX: F^{(k)} = ‖moment operator‖²_HS in full;
       F^{(2)}_Haar = 2 from the k = 2 twirl.
     ===================================================================== -->

## 5 · How random is my ensemble? The frame potential

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 6 — Watch the moments converge (~300 words + WIDGET)
     - WIDGET: assets/js/haar-sampler.js — EXTENDS bloch-sphere.js's
       rendering (do not duplicate the sphere code). Two sampling modes:
       (a) Haar-uniform single-qubit states, (b) a tunably biased
       ensemble (e.g. polar-cap concentration with a bias slider).
       Point cloud accumulates on the sphere; live readouts of the first
       moment (mean Bloch vector, Haar value 0) and second moment
       (⟨r_i r_j⟩ vs the Haar value δ_ij/3); a moment-convergence trace
       vs sample count on a log axis. Dark background, teal #1fb2a6,
       controls styled like existing widgets.
     - Reading guide: the biased ensemble can fake the first moment
       (center the cap) while the second moment stays visibly off —
       moments as a HIERARCHY of tests, seen live. This is the exact
       intuition R2 formalizes as k-designs.
     - CLOSE on one open question (house rule, no roadmap): the sphere
       took ~100 samples to look uniform — how DEEP does a random
       circuit have to be before its unitaries pass the k-th moment
       test? (That question is R2+; here it just hangs.)
     ===================================================================== -->

## 6 · Watch the moments converge

<!-- (to be written; widget built last, after all prose sections are approved) -->

## References

{% bibliography --file refs_randomness --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public post: I write these to teach myself the physics behind my PhD, with
> **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
> {: .block-tip }

<script src="{{ '/assets/js/equation-numbers.js' | relative_url }}"></script>
