---
layout: post
title: "A toy impurity solver, benchmarked"
date: 2026-08-01 03:30:00-0700
description: Companion 5, the capstone of the influence-matrix ladder — a kernel-based solver for the resonant level model, graded against exact brute-force evolution in and out of equilibrium, with the Grassmann sign lesson that makes the case for exact referees better than any argument could.
tags: [influence-matrix, tensor-networks, julia]
categories: [programming]
related_posts: false
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
    --thread-color: #b3760a; /* amber — a 'narrative thread' colour, distinct from the teal accent */
    border-left: 4px solid var(--thread-color);
    background: color-mix(in srgb, var(--thread-color) 8%, transparent);
    border-radius: 0 6px 6px 0;
    padding: 0.6rem 0.9rem;
    margin: 1.4rem 0;
    font-size: 0.95rem;
  }
  html[data-theme="dark"] .thread-note {
    --thread-color: #e0a63a;
  }
  .thread-note .thread-label {
    text-transform: uppercase;
    font-size: 0.7rem;
    letter-spacing: 0.09em;
    font-weight: 700;
    color: var(--thread-color);
    margin-right: 0.5rem;
  }
</style>

Companion 5 of the influence-matrix series, paired with
[**Quantum Impurity Problems: The Influence Matrix Earns Its Keep**]({% post_url 2026-08-01-quantum-impurity-problems-the-influence-matrix-earns-its-keep %})
— and the top of the ladder that started with
[a dense 4^T vector]({{ '/programming/influence-matrix-01-exact-dense/' | relative_url }}).
The deliverable: a solver that computes an impurity's real-time dynamics from the leads'
influence kernels *alone*, graded against exact brute-force evolution of the full system.
The model: the resonant level (one level $$\varepsilon_d$$, coupling $$\gamma$$,
tight-binding leads) — chosen precisely *because* it is exactly solvable, so every claim
gets a number next to it.

The full script is
[`assets/julia/influence-matrix/c5_rlm_solver.jl`]({{ '/assets/julia/influence-matrix/c5_rlm_solver.jl' | relative_url }});
all numbers below are its output, cross-checked against an independent numpy
implementation written first.

<p class="thread-note"><span class="thread-label">The through-line</span> The ladder's
rule, applied one last time: no formula without an exact referee. This entry's referee is
the strongest yet — the full impurity+leads problem, brute-forced — and it earns its keep
within minutes of the first run (see §3).</p>

<div class="sec-divider" aria-hidden="true">•••</div>

## 1 · The solver is fifteen lines

Everything the leads do arrives through the contour kernels of
[Companion 4]({{ '/programming/influence-matrix-04-gaussian-im/' | relative_url }});
several leads just sum their kernels. The impurity side is the free contour propagator
$$G_0$$ and one linear solve:

```julia
G0 = [exp(-im*εd*(times[a]-times[b])) * (a >= b ? (1-n0) : -n0) for a in 1:n, b in 1:n]
Δ  = sum_of_lead_kernels(...)                 # companion 4, one per lead
G  = (I + G0 * Δ) \ G0                        # resummed contour Dyson equation
nd = [real(-G[j, 2T+1-j]) for j in 1:T]       # occupation from the mixed-branch element
```

Two structural points hide in those lines. The resummed form
$$G = (1 + G_0\Delta)^{-1} G_0$$ is not a stylistic choice: with the level initially
occupied ($$n_0 = 1$$), $$G_0$$ is *strictly triangular* and has no inverse, so the
textbook $$\left(G_0^{-1} - \Delta\right)^{-1}$$ is unusable — resumming the series is
what makes pure initial states legal. And the occupation comes from the element linking a
forward point to its backward partner — the discrete avatar of the lesser Green's
function at equal times.

## 2 · Report card 1: relaxation, graded

Quench: level occupied, lead a cold half-filled sea, coupling on at $$t=0$$. The exact
referee evolves impurity + 300 lead sites; the solver never sees a lead site in its life:

```text
dt = 0.40   T =  20    max|n_IF − n_exact| = 0.2513
dt = 0.20   T =  40    max|n_IF − n_exact| = 0.1345
dt = 0.10   T =  80    max|n_IF − n_exact| = 0.0689
dt = 0.05   T = 160    max|n_IF − n_exact| = 0.0348
```

The error halves with the step: clean first-order Trotter convergence, meaning the *only*
thing separating the kernel route from the exact answer is the time grid — the physics
content of the kernel is exact. (A second-order symmetrized discretization is the obvious
upgrade; it was left undone deliberately, because an honest first-order slope is worth
more pedagogically than a fancier scheme with the same lesson.)

## 3 · The sign lesson

The single most valuable output of this companion is a failure. The Dyson resummation
requires a Grassmann Wick contraction, and the crossed pairing carries a fermionic minus,
so the correct resummation is $$G = (1 + G_0\Delta)^{-1}G_0$$ — **plus**, not minus. My
first implementation had the minus. What happened is the reason this ladder insists on
referees:

```text
wrong sign:   dt=0.40 err=5.66   dt=0.20 err=8.67   dt=0.10 err=12.2   dt=0.05 err=15.5
right sign:   dt=0.40 err=0.25   dt=0.20 err=0.13   dt=0.10 err=0.069  dt=0.05 err=0.035
```

The wrong-sign solver does not crash, warn, or produce noise. It produces a *smooth,
plausible-looking curve* that quietly climbs to $$n_d \approx 10$$ — on an observable
bounded by one — and gets *worse* with refinement. Without the exact benchmark this is a
convention bug that ships; with it, it survived four minutes. Keldysh sign conventions
are where fermionic path integrals go to die, and the only reliable antidote is a solvable
limit wired into the test suite.

## 4 · Report card 2: nonequilibrium for free

The claim that separates the temporal method from everything else: a *biased* environment
costs nothing. Two leads, chemical potentials $$\pm V/2$$, two kernels summed —
the solver code does not change by a character:

```text
V = 1.0, ε_d = 0.2, γ = 0.4, dt = 0.1:
  t = 2.0    exact 0.6364    IF 0.6378
  t = 5.0    exact 0.4217    IF 0.4217
  t = 9.0    exact 0.4168    IF 0.4088
  max deviation over t ∈ [0, 10]:  0.0755  (early-transient dominated, first-order in dt)
```

The dot relaxes into a current-carrying steady state — the regime where spatial MPS pays
in entanglement and real-time QMC pays in signs — and here it is a $$200\times 200$$
linear solve. The widget in the main post shows the exact Landauer $$I(V)$$ this steady
state feeds; the honest gap between them (a discrete Meir–Wingreen current formula wired
to this solver) is noted below.

## 5 · Where the ladder ends, and what the next one starts with

What this capstone is *not*: an interacting solver. The resonant level is quadratic, so
the impurity side collapsed to a matrix — the leads' collapse was the point being
demonstrated, but the dot got one for free. Adding a genuine interaction $$U$$ breaks
only the impurity-side shortcut: the leads remain two kernels, and the dot's world-line
becomes a temporal MPS threaded through them — which is precisely the IF-MPS impurity
solver of the current literature, and precisely where a sixth rung would start. Also left
on the bench, in order of reach: the discrete current formula (Meir–Wingreen on the
contour grid), a second-order Trotter scheme, finite temperature in the kernels (one line:
the occupation factors), and the deferred spin-language cross-check from Companion 4's
notes. The ladder ends here; none of its rungs wobble.

## References

{% bibliography --file refs_influence_matrix --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public entry: I write these to teach myself the numerics behind my PhD,
> with **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
{: .block-tip }
