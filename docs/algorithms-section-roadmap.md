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
General tensor-network algorithms. Foundational family.

- [x] **DMRG (ground states)** — ITensor vs DMRJulia on the Heisenberg chain, refereed by ED. *(shipped)*
- [ ] **TEBD** — real- and imaginary-time evolution by Trotterized gates; truncation error vs step size; benchmark against exact small-system dynamics.
- [ ] **TDVP** — time-dependent variational principle on an MPS; contrast with TEBD (energy conservation, long-time behaviour). *(optional)*
- [ ] **iDMRG / infinite MPS** — thermodynamic-limit ground states; correlation length from the transfer matrix. *(optional)*
- [ ] **PEPS (2D) — construction** — why 2D is genuinely harder; the tensor, the double layer.
- [ ] **PEPS/TN contraction** — boundary MPS, CTMRG, and **belief propagation** as an approximate contractor; accuracy vs cost on a checkable 2D model (e.g. classical Ising partition function, or a solvable PEPS).
- Cross-cutting mini-topics to fold in where natural: canonical forms & gauge, SVD truncation & discarded weight, entanglement entropy from the Schmidt spectrum.

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
Shaping control fields to steer a system. Not started.

- [ ] **GRAPE — pure state** — gradient ascent pulse engineering; analytic vs autodiff
      gradients; state-transfer fidelity; benchmark on a single/two-qubit gate.
- [ ] **GRAPE — open systems / mixed states** — Lindblad dynamics, channel/average-gate
      fidelity, control under decoherence.
- [ ] **CRAB** — chirped random-basis, gradient-free optimization; when it beats/loses to
      GRAPE; landscape and truncated basis size.
- [ ] **Krotov** — monotonic-convergence companion to GRAPE. *(optional)*
- [ ] **Hamiltonian engineering** — Floquet / average-Hamiltonian theory, dynamical
      decoupling sequences; designing an effective Hamiltonian and verifying it.
- Candidate tooling: `QuantumControl.jl`, `Krotov.jl`, `GRAPE.jl`, QuTiP `qoc`.

## Thread 4 — Quantum Monte Carlo & Green's functions  `[quantum-monte-carlo]`
Tentative — sampling physics too big to diagonalize. Not started.

- [ ] **Variational Monte Carlo** — trial wavefunction + Metropolis; local energy estimator.
- [ ] **Stochastic Series Expansion (SSE)** — finite-T for spin models; benchmark energy vs ED.
- [ ] **Determinant / auxiliary-field QMC** — the fermion sign problem, seen head-on.
- [ ] **Green's functions** — Lehmann representation, spectral functions, and the pain of
      analytic continuation; CT-QMC / DMFT as a stretch goal.

---

### Notes
- `_algorithms/itensor-getting-started.md` is a leftover `published: false` scaffold from the
  earlier "learn a package" framing. Now redundant given the richer real entries — delete or
  repurpose.
- Reassess whether **influence-matrix** should stay its own thread or fold under
  **tensor-networks** once Thread 1 has more entries.
