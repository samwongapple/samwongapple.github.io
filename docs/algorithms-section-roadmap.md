# Algorithms section — internal roadmap

Private planning note (lives in `docs/`, which is excluded from every build). The
**algorithms** section (`_algorithms/` collection, `/algorithms/` index) is where I take
apart the algorithms behind my research: implement from scratch and/or via a package, run
them, and check every number against an exact reference. Detail-oriented by design — the
point is the implementation, not a survey.

Public page groups entries by **thread** (an entry's `categories:` slug). Thread names,
blurbs, and order live in `_data/algorithm_threads.yml`; **empty threads are auto-skipped**,
so a family can be declared here before its first post exists and nothing leaks. One post
per future conversation.

House conventions (match the existing entries):
- `layout: post`, `related_posts: false`, `toc: {sidebar: left}`, `$$…$$` for all math
  (single `$` lets kramdown eat underscores), `.sec-divider` between sections, the amber
  `.thread-note` for a through-line, a `{% bibliography %}` References section, the closing
  "ABOUT THIS POST" `.block-tip`, and `<script src=".../equation-numbers.js">` at the end.
- Every quantitative claim backed by code actually run + an exact/independent referee.
- One open question at the end; keep the series arc internal (no published roadmap).

---

## Thread 1 — Tensor networks  `[tensor-networks]`
General tensor-network algorithms. Foundational family. **Plan agreed 2026-08-08.**

Arc (internal): P1–P4 are the 1D story — statics (shipped), then dynamics two ways, then
the thermodynamic limit; P5–P7 are the 2D arc — build the networks, contract them honestly,
then contract them approximately. Tooling is **decided per post** (noted on each); the
default is a from-scratch Julia core on raw arrays with an ITensor-ecosystem library as a
second referee — P3 inverts this (package-first, from-scratch core as the deep dive).
Shared bib for new posts: `_bibliography/refs_tn.bib` (P1 keeps `refs_dmrg`). Cross-cutting
topics (canonical forms & gauge, SVD truncation & discarded weight, entanglement from the
Schmidt spectrum) live in P2, which is their natural home; later posts reference back.

- [x] **P1 · DMRG (ground states)** — ITensor vs DMRJulia on the N=12 spin-1/2 Heisenberg
      chain, refereed by ED (E0 = −5.1420906328, matched to 10 digits) + bond-dimension
      convergence widget. *(shipped 2026-07-07; library-vs-library — the one exception to
      the from-scratch default)*
- [ ] **P2 · TEBD** — real- and imaginary-time evolution by Trotterized two-site gates,
      **from scratch** on raw MPS (canonical form, gate application, SVD truncation — the
      cross-cutting material lives here), with ITensorMPS `apply` as library referee.
      *Systems:* (a) real-time TFIM quench; (b) imaginary time on the *same* N=12
      Heisenberg chain as P1. *Referees:* (a1) ED `expm` at N=12; (a2) exact Jordan–Wigner
      free fermions at N≈100 (BdG one-body dynamics) — independent AND beyond ED reach,
      where truncation actually bites; (a3) Trotter-error scaling: log-log slope of error
      vs dt must be 2 for the 2nd-order splitting; (a4) discarded weight vs *true* error
      against the exact referee; (b) imaginary-time energy must land on P1's
      E0 = −5.1420906328. Entanglement light cone from the Schmidt spectrum (widget
      candidate: error vs t at several χ, or the light cone itself). ⚠ Pin conventions:
      TFIM as H = −J Σ σᶻσᶻ − g Σ σˣ with σ (not S=σ/2 — factors of 2/4 differ across
      references); open chain so the JW parity/boundary subtlety never enters.
- [ ] **P3 · TDVP** — variational time evolution on the MPS manifold; contrast with TEBD
      (long-range H, energy conservation, projection error vs truncation error).
      **Package-first**: ITensorMPS `tdvp` drives; from-scratch piece is the single-site
      effective-Hamiltonian + Lanczos `exp(−iH_eff dt)` update, to show what one step *is*.
      *Referees:* (i) the method's own exactness property — single-site TDVP conserves
      energy and norm to machine precision, so any drift is a bug, not the method; (ii) ED
      expm at N=12; (iii) P2's converged TEBD on the same quench; (iv) two-site vs
      single-site TDVP against each other. ⚠ Verify at write time that `tdvp` is exported
      from ITensorMPS (ITensorTDVP was merged in; memory pin: ITensorMPS v0.4.1).
- [ ] **P4 · iTEBD (infinite MPS)** — thermodynamic-limit ground states via imaginary-time
      iTEBD on a two-site unit cell, **from scratch** (Vidal Γ–λ form; orthogonality fixup).
      *System:* infinite TFIM across g. *Referees:* exact energy density
      e0(g) = −(1/2π)∫dk √(1+g²−2g cos k) (spot-check −4/π at g=1); order parameter
      m = (1−g²)^{1/8} for g<1; correlation length from the 2nd transfer-matrix eigenvalue
      vs the exact ξ(g); central-charge c=1/2 signature in S(χ) at criticality as a softer
      check. Transfer-matrix machinery here deliberately sets up P6. *Stretch:* VUMPS via
      ITensorInfiniteMPS.jl as a second method (verify package state at write time).
- [ ] **P5 · 2D tensor networks — construction** — why 2D is genuinely harder (no exact
      canonical form, contraction is #P-hard); build networks **from scratch**: the 2D
      classical Ising partition function as an exact TN (Boltzmann-weight matrix split
      across bonds), and an exact PEPS (toric code and/or square-lattice AKLT, D=2).
      *Referees:* brute-force exact contraction of small networks vs direct enumeration
      over spin configurations (L ≤ 4–5); known exact values for the PEPS examples (norms,
      parent-Hamiltonian energy = 0). No approximate contraction yet — that's P6's job.
- [ ] **P6 · Contracting 2D: boundary MPS vs CTMRG** — the two standard contractors, head
      to head on the same network (the P1 "two roads up the same mountain" format).
      **From scratch** both: boundary MPS reuses P2's MPO-compression machinery; CTMRG is
      new. *System:* 2D classical Ising across temperature. *Referees:* Onsager's
      closed-form free energy density; Yang's magnetization (1 − sinh⁻⁴(2βJ))^{1/8};
      βc = ln(1+√2)/2; correlation length from the CTM spectrum. Accuracy-vs-χ scaling near
      and away from Tc. ⚠ Onsager/Yang formulas have convention traps (J vs 2J in the
      argument) — re-derive the high-T check numerically before trusting any formula.
- [ ] **P7 · Belief propagation as a TN contractor** — message passing on the tensor
      network, **from scratch**, with ITensorNetworks.jl BP as library referee (⚠ evolving
      API — pin version at write time). *Referees:* (i) BP is *exact* on trees — check
      against brute-force contraction of a tree TN; (ii) on the square lattice the BP fixed
      point IS the Bethe (z=4) approximation, which has a closed-form solution — so the
      approximation itself has an exact reference; (iii) BP error vs Onsager, compared
      against P6's boundary-MPS error at matched cost. Connects to the research-side BP
      interest; loop corrections as the outlook.
- Key refs to seed `refs_tn.bib`: Vidal 2003/2004 (TEBD), Vidal 2007 (iTEBD),
  Haegeman et al. 2011 + 2016 (TDVP), Schollwöck 2011 (MPS review), Verstraete–Cirac 2004
  (PEPS), Nishino–Okunishi 1996 + Orús–Vidal 2009 (CTMRG), Onsager 1944, Yang 1952,
  Pfeuty 1970 (TFIM exact), Alkabetz–Arad 2021 + Tindall–Fishman 2023 (BP on TNs).

## Thread 2 — Influence matrices  `[influence-matrix]`
The Feynman–Vernon influence functional as a temporal MPS. **Already a complete 5-part
series** (Companions 1–5), read front-to-back.

- [x] 1 · Exact influence matrices, by brute force (dense 4^T, refereed by exact evolution)
- [x] 2 · A temporal MPS + truncated transverse contraction
- [x] 3 · Reading a phase diagram off one vector (four dynamical regimes)
- [x] 4 · Gaussian influence matrix of a free-fermion lead (Pfaffian-validated)
- [x] 5 · A toy impurity solver for the resonant level model (the Grassmann sign lesson)
- [ ] Possible extensions: coupling to Green's-function methods (bridges to Thread 4);
      non-Gaussian baths; longer-time bond-dimension scaling study.

## Thread 3 — Quantum control  `[quantum-control]`
Shaping control fields to steer a system. Not started. **Plan agreed 2026-08-08.**

Arc (internal): posts 1–4 are one family — *optimize a pulse against a cost function*
(same bilinear-control machinery, different optimizers/dynamics); post 5 is the capstone
contrast — *design* the effective dynamics analytically, then verify. Tooling stance for
the whole thread: **from-scratch Julia core every post** (the algorithm is the content),
with the `QuantumControl.jl` ecosystem (`GRAPE.jl`, `Krotov.jl`) as a second referee where
it supports the problem. Shared bib: `_bibliography/refs_qcontrol.bib`.

- [x] **P1 · GRAPE (pure states & gate synthesis)** — piecewise-constant controls, the
      first-order GRAPE gradient, and exact gradients (Van Loan augmented exponential /
      autodiff). *Systems:* driven qubit (σx,σy controls + detuning drift) as build-up,
      then two qubits with Ising ZZ drift + fast local controls for CNOT synthesis.
      *Referees:* (a) analytic resonant π-pulse and the quantum-speed-limit cliff
      T_min = π/Ω_max for the qubit flip; (b) the Khaneja–Glaser time-optimal bound for
      CNOT — fidelity vs gate time T snaps to 1 exactly at T_min. ⚠ Pin the convention:
      CNOT ≅ exp(−i(π/4)σz⊗σz) up to locals, so T_min = π/(4J) for drift J σz⊗σz (papers
      quoting π/(2J) use H = (J/2)σzσz); part of the post is deriving the bound and
      checking it by ED. (c) Internal referee: analytic gradient vs finite differences vs
      autodiff — three independent computations of one object. Cross-check optimum vs
      `GRAPE.jl`.
- [ ] **P2 · GRAPE for open systems** — Lindblad dynamics via vectorization, mixed-state
      transfer and average-gate fidelity, control under T1/T2. *Referees:* exact expm of
      the vectorized Lindbladian (small system); closed-form pure-dephasing qubit; the
      unital-noise purity no-go (optimizer must never beat it); Nielsen's average-gate-
      fidelity formula vs Monte Carlo over Haar states.
- [ ] **P3 · CRAB** — chirped random-basis, gradient-free (Nelder–Mead via `Optim.jl`);
      truncated-basis convergence study; when it beats/loses to GRAPE. *Systems:* the P1
      problems (so the converged GRAPE optima are referees) + one gradient-awkward case,
      e.g. state transfer down a small Heisenberg chain (ED-checkable). *Referees:* P1
      optima, the exact T_min anchors, basis-size sweep. Mention dCRAB for basis-limited
      traps.
- [ ] **P4 · Krotov (short companion)** — derive the update; the referee is the
      **monotonicity theorem itself**: fidelity must be non-decreasing every iteration
      (and show GRAPE violating it with a bad step size on the same problem). Natural home
      for `QuantumControl.jl`/`Krotov.jl` as primary package.
- [ ] **P5 · Hamiltonian engineering (capstone)** — average-Hamiltonian theory / Magnus,
      spin echo → CPMG → WAHUHA-style decoupling on 2–3 coupled spins. *Referee:* exact
      Floquet propagator over one period, matrix-log it to get the *exact* effective
      Hamiltonian, compare term-by-term against the AHT/Magnus prediction + leading-error
      scaling with the period. Fully from scratch.
- Key refs to seed the bib: Khaneja et al. 2005 (GRAPE); Khaneja–Brockett–Glaser 2001
  (time-optimal); de Fouquieres et al. 2011 (2nd-order GRAPE); Doria–Calarco–Montangero
  2011 + Caneva et al. 2011 (CRAB); Reich–Ndong–Koch 2012 (Krotov); Haeberlen–Waugh 1968
  (AHT); Goerz et al. (QuantumControl.jl).

## Thread 4 — Green's functions  `[green-functions]`
Extracting spectral / frequency-resolved information (poles = excitations, Im G = what
ARPES/STM see). Not started. Split out from QMC 2026-08-08 — enough here that isn't Monte
Carlo to stand alone. Free-fermion machinery makes most referees exact; bridges to the
tensor-networks and influence-matrix threads.

Two organizing axes: non-interacting (resolvent = linear algebra) vs interacting (Lehmann /
QMC / TN); and which frequency axis (real-time/real-ω, physical but unstable, vs
imaginary-time/Matsubara, what QMC gives) — the bridge between them, analytic continuation,
is its own ill-posed problem. Arc runs foundational → advanced.

- [ ] **P1 · Resolvent + recursion method (continued fractions)** — tridiagonalize H by
      Lanczos, local G as a Haydock continued fraction; poles-and-spectral-weight picture
      made concrete. *Referee:* direct `(ω−H)⁻¹` inversion / ED. **Best first post.**
- [ ] **P2 · Kernel Polynomial Method (KPM)** — Chebyshev expansion of DOS/spectral
      function, stochastic trace, Jackson kernel vs Gibbs; linear-scaling for large sparse H.
      *Referee:* analytic tight-binding DOS (1D √-edge, 2D van Hove, Bethe-lattice semicircle).
- [ ] **P3 · Lanczos spectral functions for interacting systems** — ⟨0|c (ω−H)⁻¹ c†|0⟩ via
      Lanczos → continued fraction; first taste of the Lehmann representation. *Referee:*
      full-ED Lehmann sum on a 2-site Hubbard model.
- [ ] **P4 · Analytic continuation as an ill-posed inverse** — MaxEnt vs Padé vs stochastic;
      recover A(ω) from G(τ)/G(iωₙ). *Referee is free:* synthetic G(τ) from a known A(ω) +
      controlled noise, measure recovery. A self-contained regularization lesson.
- [ ] **P5 · Tensor-network spectral functions** *(bridge to tensor-networks)* — evolve
      c†|0⟩ with TEBD/TDVP + Fourier, or correction-vector / Chebyshev-MPS (dynamical DMRG).
      *Referee:* ED Lehmann (small) or free-fermion exact.
- [ ] **P6 · Compact Matsubara representations (IR basis / DLR)** *(optional)* — compress
      G(iωₙ) to ~10–30 coefficients; tiny code. *Referee:* exact non-interacting G.
- [ ] **P7 · Transport / NEGF** *(bridge to influence-matrix)* — surface Green's functions
      by recursive decimation (Sancho–Rubio), Landauer/Meir–Wingreen conductance. *Referee:*
      analytic transmission of a clean chain / resonant transmission through the RLM.
- Key refs to seed the bib: Haydock–Heine–Kelly 1972 (recursion); Weiße et al. RMP 2006
  (KPM); Dagotto RMP 1994 (Lanczos spectra); Jarrell–Gubernatis 1996 (MaxEnt);
  Jeckelmann 2002 (dynamical DMRG); Shinaoka et al. 2017 (IR) / Kaye et al. 2022 (DLR);
  Meir–Wingreen 1992, Sancho et al. 1985 (NEGF/surface G).
- Note: the impurity Green's function (the DMFT engine, and the object behind
  influence-matrix Companion 5) can live here or in QMC via CT-QMC — decide when P3/P7 land.

## Thread 5 — Quantum Monte Carlo  `[quantum-monte-carlo]`
Tentative — sampling physics too big to diagonalize. Not started.

- [ ] **Variational Monte Carlo** — trial wavefunction + Metropolis; local energy estimator.
- [ ] **Stochastic Series Expansion (SSE)** — finite-T for spin models; benchmark energy vs ED.
- [ ] **Determinant / auxiliary-field QMC** — the fermion sign problem, seen head-on.
- [ ] **CT-QMC impurity solver** *(bridge to Green's functions & influence-matrix)* —
      hybridization/interaction expansion sampling G(τ); sign problem. *Referee:* ED impurity
      solver / exact RLM. The engine inside DMFT.

---

### Notes
- `_algorithms/template-algorithm-post.md` (`published: false`) is the reusable scaffold —
  copy it to start a real entry.
- Reassess whether **influence-matrix** should stay its own thread or fold under
  **tensor-networks** once Thread 1 has more entries.
