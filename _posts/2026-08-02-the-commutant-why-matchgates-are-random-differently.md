---
layout: post
title: "The Commutant: Why Matchgates Are Random Differently"
date: 2026-08-02 04:20:00-0700
description: A gate set does not decide what its circuits can randomize — its commutant does. Schur–Weyl duality in the two-copy form, the matchgate commutant that is strictly bigger than the unitary one, and the payoff owed since the measuring post - why the histogram went flat at var(m) = 1/3 instead of bending to 1/5.
tags: [matchgates, unitary-designs, schur-weyl, deep-thermalization]
categories: [emergent-randomness]
related_posts: false
provides_planned: [commutant-of-a-gate-set, schur-weyl-duality, matchgate-commutant]
requires: [unitary-k-design, frame-potential, matchgate-family, projected-ensemble, deep-thermalization, gaussian-state, gaussian-haar-ensemble]
uses: [matchgate-weak-simulation, majorana-so2n-rotation, clifford-group]
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
     THREAD: "Emergent randomness" — Post R3 of 6. THE KEYSTONE POST.
     Opens on R2's closing question: what property of a gate set decides
     the randomness floor its circuits converge to?

     ROLE: fuse the two arcs of the blog. The circuits-simulation thread
     proved matchgate circuits deep-thermalize to the GHE (measuring
     post); R1–R2 built moments/designs/frame potentials. This post
     explains BOTH with one object: the commutant. Retroactively explains
     the var(m) = 1/3 vs 1/5 numerics already published in "Measuring
     Free Fermions" §5 — the flat histogram was a commutant speaking.

     THROUGH-LINE: THE ENSEMBLE EQUILIBRATES TO MAXIMAL RANDOMNESS
     *MODULO WHATEVER COMMUTES WITH IT* — the commutant is the ledger of
     what averaging can never erase.

     ANCHOR PAPERS: bejan2025matchgate (refs_matchgates — REUSE, do not
     duplicate the entry); sierant2026theory (arXiv:2603.12392, theory
     of the matchgate commutant — VERIFY id/title/authors before citing,
     entered from the planning prompt). Projected-ensemble background:
     cotler2023emergent, ho2022exact in refs_matchgates — reuse those
     keys with --file refs_matchgates.

     SCOPE DISCIPLINE: Schur–Weyl at k = 2 ONLY. No symmetric-group
     representation theory beyond {1, SWAP}; the Majorana-parity
     operators entering the matchgate commutant are introduced
     concretely, as operators the reader can multiply.

     NOTE (registry decision, Phase 0): the GHE itself is PROVIDED by the
     measuring post (gaussian-haar-ensemble) — this post REQUIRES it and
     explains WHY it is the attractor; it does not re-own it.
     ===================================================================== -->

<!-- =====================================================================
     SECTION 1 — A plateau that would not move (~400 words)
     - Open on R2's widget: every ensemble raced to the Haar floor except
       one. Deeper matchgate circuits, bigger systems — the frame
       potential pins above the floor by a fixed factor. Not slowness:
       an obstruction with a value.
     - Recall (concept_link, one paragraph) what the measuring post
       PROVED: matchgate projected ensembles converge to the GHE, uniform
       on the Gaussian manifold — maximally random by their own lights,
       var(m) = 1/3 flat histogram vs Haar's 1/5 parabola. Two threads,
       same anomaly, no shared explanation yet.
     - Thread-note: the through-line. The object that unifies them is
       whatever survives averaging — the commutant.
     ===================================================================== -->

## 1 · A plateau that would not move

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 2 — What survives the average (~550 words + box)
     - Define the k-fold commutant of a gate set G: operators on the
       k-copy space commuting with g^{⊗k} for every g ∈ G. Concrete
       first: for the FULL unitary group at k = 1, only multiples of 1
       (Schur); at k = 2, span{1, SWAP} — this is R1 §3's twirl basis,
       now named as a commutant.
     - ANCHOR on commutant-of-a-gate-set definition (.key-eq or model-).
     - The structural fact, stated and used (proof sketch in box): the
       image of the k-fold twirl over the ensemble = the commutant.
       Averaging projects onto what commutes. Hence: SMALL commutant ⇒
       averaging erases almost everything ⇒ close to Haar moments; BIG
       commutant ⇒ conserved pattern survives every depth ⇒ floor above
       Haar. Frame potential = (squared) size bookkeeping of the
       commutant — F^{(k)}_G ≥ dim of the commutant story, connect to
       R2's k! (dim of permutation span).
     - Design language translated: G's circuits can at best be a
       k-design FOR G's own commutant structure — "maximal randomness
       modulo symmetry".
     - COLLAPSIBLE BOX: twirl-image = commutant argument (both
       inclusions, k = 2, elementary); dim(commutant) vs frame potential
       counting.
     ===================================================================== -->

## 2 · What survives the average

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 3 — Schur–Weyl, the minimal dose (~450 words + box)
     - State Schur–Weyl duality in the ONLY form this thread needs:
       on (C^d)^{⊗k}, the algebra generated by {U^{⊗k}} and the algebra
       of copy-permutations are each other's commutants. k = 2 instance
       worked completely: symmetric/antisymmetric decomposition, 1 and
       SWAP spanning the commutant, dimensions counted.
     - ANCHOR result-schur-weyl-duality (.key-eq).
     - Why THIS explains R1's twirl formulas and R2's k! floor in one
       breath: Weingarten weights are the inverse Gram matrix of the
       permutation basis; frame potential floor = number of permutations
       (k! for d ≥ k). One paragraph each, cite mele2024introduction /
       collins2006integration rather than re-deriving.
     - The turn (end-of-section tension): Schur–Weyl is a statement
       about the FULL unitary group. Restrict the group, and the
       commutant has no reason to stay small. Enter matchgates.
     - COLLAPSIBLE BOX: k = 2 Schur–Weyl from scratch on qubits —
       explicit 4×4 blocks, sym/antisym projectors, double-commutant
       check by direct computation.
     ===================================================================== -->

## 3 · Schur–Weyl, the minimal dose

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 4 — The matchgate commutant is bigger (~650 words + box)
     - Matchgates through the randomness lens: the gate set whose
       Heisenberg action is SO(2n) rotations of Majoranas (concept_link
       majorana-so2n-rotation — the circuits thread already proved it).
       On k = 2 copies, build the operators that commute with every
       U_R^{⊗2}: beyond 1 and SWAP, the Majorana-bilinear "pair hopping"
       between copies — Σ_a γ_a ⊗ γ_a and its powers / the generating
       function structure. Present the GENERATORS concretely on 2 copies
       of 2 modes: explicit small matrices the reader can multiply,
       verified numerically (note verification date in comment when
       written).
     - ANCHOR result-matchgate-commutant (.key-eq for the commutant
       basis / dimension statement).
     - Cite sierant2026theory for the full commutant theory (VERIFY
       entry) and bejan2025matchgate for the deep-thermalization
       consequence; keep the general-k structure descriptive (dimension
       growth quoted, not derived).
     - The consequence, drawn carefully (this is the post's summit):
       twirl image = commutant (§2) ⇒ matchgate averaging preserves the
       extra invariants ⇒ the ensemble CANNOT flow to Haar on U(2^n);
       the finest measure consistent with the surviving invariants is
       uniform on the Gaussian manifold — the GHE the measuring post
       found empirically (concept_link gaussian-haar-ensemble). The
       var(m) = 1/3 flatness is the second moment of the commutant-
       constrained measure; the 1/5 parabola is the unconstrained one.
       Work the two second-moment numbers side by side, explicitly.
     - COLLAPSIBLE BOX: verify Σ_a γ_a ⊗ γ_a commutes with U_R^{⊗2}
       directly from the SO(2n) rotation law (three lines); count the
       k = 2 matchgate commutant dimension for small n; reconcile the
       1/3 vs 1/5 variances from the two commutants' second-moment
       formulas.
     ===================================================================== -->

## 4 · The matchgate commutant is bigger

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 5 — Three ensembles, one histogram (~350 words + WIDGET)
     - WIDGET: EXTEND assets/js/projected-ensemble.js — do NOT fork it.
       Add a three-panel mode (opts.panels = ['haar','clifford',
       'matchgate']) sharing one m-axis: projected-ensemble histograms
       for deep Haar-random, random-Clifford, and random-matchgate
       circuits, with the two analytic curves overlaid on every panel —
       flat 1/2 (GHE, var 1/3) and ¾(1−m²) (Haar, var 1/5). Clifford
       lands ON the Haar parabola (3-design ⊇ 2nd moments — R2 §3 made
       visible); matchgate lands on the flat line. Per-panel var(m)
       readout against both analytic values.
       BACKWARD COMPATIBILITY IS A CONTRACT: the measuring post embeds
       createProjectedEnsemble(mount, {n, depth}) — the single-panel
       default must render pixel-identical; new behavior only behind new
       opts. Extend module in place.
     - Reading guide: one paragraph — the histogram shape is the
       commutant made visible; nothing about depth or system size moves
       a curve off its floor.
     - CLOSE on one open question (house rule): the commutant priced
       exactly how random a gate set can get — but randomness here was
       always the OBSTACLE'S size. When is a big commutant an ASSET —
       something you can spend? (Seeds R4/R5's shadows without naming
       them.)
     ===================================================================== -->

## 5 · Three ensembles, one histogram

<!-- (to be written; widget extension built last) -->

## References

{% bibliography --file refs_randomness --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public post: I write these to teach myself the physics behind my PhD, with
> **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
> {: .block-tip }

<script src="{{ '/assets/js/equation-numbers.js' | relative_url }}"></script>
