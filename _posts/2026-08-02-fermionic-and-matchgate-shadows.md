---
layout: post
title: "Fermionic and Matchgate Shadows"
date: 2026-08-02 04:40:00-0700
description: Classical shadows go native on fermions. Random matchgate rotations replace random Cliffords, the inverse channel closes in Pfaffians, and every k-body reduced density matrix comes out of one pool of shots — the covariance matrix meets the randomized-measurement toolbox, and each side makes the other cheap.
tags: [classical-shadows, matchgates, free-fermions, tomography]
categories: [emergent-randomness]
related_posts: false
provides_planned: [fermionic-classical-shadow, matchgate-shadow, k-rdm-estimation]
requires: [classical-shadow, shadow-norm, correlation-matrix, matchgate-family, majorana-operators-qubit, gaussian-measurement-update]
uses: [covariance-matrix, matchgate-weak-simulation, wicks-theorem, matchgate-commutant, jw-string-locality, median-of-means]
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
     THREAD: "Emergent randomness" — Post R5 of 6.
     Opens on R4's closing question: what replaces the Pauli/Clifford
     ensembles when the observables are fermionic?

     ROLE: the fusion post — the free-fermion/matchgate arc and the
     shadow toolbox meet. Everything the circuits thread built (Majorana
     dictionary, SO(2n) rotations, Γ updates, Pfaffian readout) becomes
     the engine that makes fermionic shadows TRACTABLE; everything R4
     built (channel inversion, shadow norms) tells us what to compute.

     THROUGH-LINE: THE SAME STRUCTURE THAT MADE MATCHGATES CLASSICALLY
     SIMULABLE MAKES THEM A PERFECT MEASUREMENT ENSEMBLE — the commutant
     that capped their randomness (R3) is precisely what closes the
     inverse channel in Pfaffians.

     ANCHOR PAPERS: zhao2021fermionic (PRL 127, 110504 — fermionic
     partial tomography); wan2023matchgate (CMP 404 — matchgate shadows);
     low2022classical (particle-number symmetry). All in refs_randomness.

     NOTATION: inherits the circuits thread wholesale (γ_a, Γ, R ∈
     SO(2n)) — no new glyphs expected; k-RDM's k is the SAME copy-
     counting k scoped in R1 (say so). Verify against /notation/ at
     writing time.
     ===================================================================== -->

<!-- =====================================================================
     SECTION 1 — The wrong ensemble for the right operators (~450 words)
     - Open on R4's cliffhanger made concrete: the operators chemistry
       and condensed matter actually want — c†_i c_j, pairing terms,
       k-body RDMs — are LOCAL in fermion language but Jordan–Wigner
       strings on qubits (concept_link jw-string-locality: the thread
       the reader already owns). A 2-body fermionic term is an n-site
       Pauli string; the Pauli-shadow 3^k price explodes on the string
       length, not the physical locality.
     - The fix is not a better qubit ensemble but a change of NATIVE
       LANGUAGE: randomize with fermionic Gaussian unitaries — matchgate
       circuits — so the ensemble's own symmetry matches the
       observables'. Thread-note: the through-line.
     - One honest paragraph on the two flavors treated here: fermionic
       Gaussian shadows (zhao2021fermionic) and matchgate shadows
       (wan2023matchgate) — same physics, different technical packaging;
       the post follows the covariance-matrix road.
     ===================================================================== -->

## 1 · The wrong ensemble for the right operators

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 2 — The matchgate measurement channel (~600 words + box)
     - The protocol: draw a random matchgate circuit U_R (R Haar on
       SO(2n) or a suitable discrete subgroup — state the choices and
       what each buys), apply, measure all qubits, keep (R, b). The
       snapshot is GAUSSIAN data: b fixes a computational-basis Γ_b, and
       the record is (R, Γ_b) — a rotation and a matrix, never a 2^n
       vector. Simulation-side, this is the measuring post's chain rule
       run in reverse (concept_link matchgate-weak-simulation).
     - The channel M in Majorana language: because the ensemble twirls
       within the matchgate group, M acts BLOCK-DIAGONALLY on the
       Majorana-degree ladder (degree-2k monomials don't mix) — R3's
       commutant, now an ASSET, exactly as the thread promised. For
       degree-2 (the covariance sector): M multiplies Γ by a known
       scalar; the inverse is a rescaling. Derived in the body for
       degree 2, quoted for general degree with the Pfaffian/closed-form
       coefficients (wan2023matchgate), box for details.
     - ANCHOR result-fermionic-classical-shadow on the protocol +
       degree-2 inverse (.key-eq); ANCHOR result-matchgate-shadow on
       the general-degree coefficient statement.
     - Why tractable, said plainly: the covariance matrix makes the
       snapshot storable (2n×2n), the rotation group makes the twirl
       computable (SO(2n) Weingarten needs only low moments), and
       Wick/Pfaffian makes the readout closed-form — every ingredient
       is a previous post.
     - COLLAPSIBLE BOX: the degree-2 channel coefficient from the
       SO(2n) twirl (the (2n choose 2)-dimensional sector average);
       unbiasedness of the Γ estimator; the particle-number-symmetric
       restriction (low2022classical) and what it saves.
     ===================================================================== -->

## 2 · The matchgate measurement channel

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 3 — k-RDMs at polynomial price (~550 words + box)
     - Define the k-RDM (all ⟨c†…c…⟩ with k creation + k annihilation
       indices); why chemistry stops at k = 2 (energies) and 3 (some
       response). Translate: degree-2k Majorana monomials.
     - The sample-complexity statement (zhao2021fermionic,
       wan2023matchgate): all k-RDM elements to precision ε from
       O(poly(n^k)/ε² · binomial factors) shots — the fermionic
       analogue of R4's 3^k-independent-of-n result, with the roles of
       "local" recast by fermionic degree, not string length. State the
       actual bounds honestly with their binomial coefficients; compare
       against the Jordan–Wigner + Pauli-shadow cost on the SAME
       operators in a small table.
     - ANCHOR result-k-rdm-estimation (.key-eq or the comparison table).
     - Variance / shadow-norm structure: which fermionic observables are
       cheap (low-degree, spread) vs expensive — the fermionic shadow
       norm in the degree-2 sector worked in the box.
     - COLLAPSIBLE BOX: degree-2 shadow-norm computation; the
       median-of-means wrapper carried over verbatim from R4 (one
       paragraph, concept_link median-of-means).
     ===================================================================== -->

## 3 · k-RDMs at polynomial price

<!-- (to be written) -->

<div class="sec-divider" aria-hidden="true">•••</div>

<!-- =====================================================================
     SECTION 4 — Reconstructing Γ, shot by shot (~350 words + WIDGET)
     - WIDGET: assets/js/fermionic-shadows.js — simulate shadow shots
       from a known Gaussian state (ground state of a random quadratic
       Hamiltonian, or the tight-binding chain for familiarity),
       reconstruct the covariance matrix via the §2 inverse, render a
       live error heatmap |Γ̂ − Γ| over matrix entries as shots
       accumulate; aggregate error trace vs shots (log-log, −1/2 slope)
       with the §3 bound overlaid. Controls: N (modes), shot count /
       run-pause, toggle particle-number-symmetric vs general BdG
       ensemble (the BdG mode visibly needs the bigger ensemble —
       show the symmetric ensemble FAILING to see pairing correlations:
       an honest null result on screen). Dark bg, teal #1fb2a6. All
       simulation via covariance matrices (measuring post's machinery);
       no statevectors.
     - Reading guide: heatmap pixels darken uniformly — every entry of
       every RDM is being estimated AT ONCE from the same shot pool;
       that simultaneity is the entire economic argument of shadows.
     - CLOSE on one open question (house rule): everything here still
       assumes you can APPLY a random matchgate circuit — a programmable
       device standing between the state and the detector. What if you
       can't drive the system at all — can dynamics the system performs
       BY ITSELF stand in for the random rotation? (Hangs; R6 exists but
       is not announced.)
     ===================================================================== -->

## 4 · Reconstructing Γ, shot by shot

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
