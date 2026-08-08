---
layout: post
title: "One matrix in time"
date: 2026-07-31 09:00:00-0700
description: Companion 4 of the influence-matrix series — build the Gaussian influence matrix of a free-fermion lead from its spectral function, validate every formula in the pipeline against explicit Fock-space construction via Pfaffians, and measure the logarithmic growth of temporal entanglement from a 2T×2T kernel.
tags: [influence-matrix, tensor-networks, julia]
categories: [influence-matrix]
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

Companion 4 of the influence-matrix series, paired with
[**Gaussian Influence Matrices: Free Fermions in the Time Direction**]({% post_url 2026-07-31-gaussian-influence-matrices-free-fermions-in-the-time-direction %}).
The previous companions built the influence matrix as a $$4^T$$ vector, then as a
temporal MPS. This one builds it as a $$2T \times 2T$$ **kernel** — and because the whole
construction is a chain of closed-form linear algebra rather than a contraction
algorithm, the numerical work here is different in kind: not "implement and truncate"
but "**validate every formula, then measure**."

The full script is
[`assets/julia/influence-matrix/c4_gaussian_im.jl`]({{ '/assets/julia/influence-matrix/c4_gaussian_im.jl' | relative_url }});
every number below is its output, and the whole pipeline was independently cross-checked
against a second implementation in numpy before the Julia version was written.

<p class="thread-note"><span class="thread-label">The through-line</span> Companion 1's
referee was brute-force evolution; Companion 2's was Companion 1. Here the referee is an
explicit many-body Fock-space construction, Pfaffians and all, at small mode number —
because when your "algorithm" is four closed formulas, what needs testing is the
formulas.</p>

<div class="sec-divider" aria-hidden="true">•••</div>

## 1 · Part A — the machinery, proven guilty until innocent

The pipeline rests on three claims about a BCS-like state
$$\lvert\psi\rangle \propto \exp(\tfrac12 \sum A_{ij} \hat c^\dagger_i \hat c^\dagger_j)\lvert 0\rangle$$:

1. its Fock amplitudes are Pfaffians of sub-blocks of $$A$$;
2. its correlation matrices are
   $$\langle \hat c^\dagger \hat c\rangle = A^\dagger(1+AA^\dagger)^{-1}A$$ and
   $$\langle \hat c \hat c\rangle = -(1+AA^\dagger)^{-1}A$$;
3. mode-subset entanglement follows from the Majorana covariance's eigenvalues via the
   binary-entropy formula — the free-fermion post's recipe.

At $$n = 6$$ modes all three can be checked against the $$2^6$$-dimensional truth, with
operators built explicitly (Jordan–Wigner signs and all):

```julia
ψ  = bcs_state(A)                    # amplitudes = pfaffian(A[S, S]) per subset S
Cex = [ψ' * (cs[i]' * cs[j] * ψ) ...]   # brute-force ⟨c†c⟩
```

```text
covariance closed forms:  max|ΔC| = 1.14e-16   max|ΔF| = 1.46e-16
entanglement, modes 1–3:  RDM S = 1.3108701637   Γ-formula S = 1.3108701637   |Δ| = 4.4e-16
```

Two war stories from getting there, preserved for posterity. The $$\langle cc\rangle$$
formula's *sign* is easy to get wrong (my first candidate was off by exactly the
transpose-minus ambiguity — caught by the Fock referee in one comparison). And in the
JavaScript port of this pipeline, an overcautious factor-of-two "correction" in the
entropy accounting halved every result — caught the same way, in minutes, because the
reference numbers existed. Formulas without referees are rumors.

## 2 · Part B — the physical kernel

The bath: a semi-infinite tight-binding lead, hopping 1, half filled, coupling $$\gamma$$
to the impurity. Its finite-$$N$$ eigenbasis is analytic
($$\varepsilon_k = -2\cos\frac{k\pi}{N+1}$$, weights $$\propto \sin^2$$), so the surface
correlators $$g^\gtrless(t)$$ cost nothing, and the contour kernel is filled in one loop:

```julia
Δ[a, b] = s_a * s_b * γ^2 * dt^2 * (later ? g_greater(ta - tb) : -g_lesser(ta - tb))
```

The branch signs $$s_a$$ are a diagonal $$\pm1$$ congruence — provably irrelevant to any
entanglement of the resulting state, which is worth knowing because contour sign
conventions are where fermionic Keldysh calculations go to die.

Two measurements. The kernel's decay is the band structure speaking —

```text
t =  1.0   4.0   16.0   32.0
t^{3/2}|g| = 0.46  0.54  1.00  1.56      (~ constant ⇒ |g| ~ t^{-3/2}, semicircle band)
```

— and the temporal entanglement across the middle cut, from the $$\zeta$$-spectrum of the
restricted covariance, grows **logarithmically**:

```text
T =   8     16     24     32     40     48
S = 0.2449 0.3066 0.3384 0.3586 0.3745 0.3868       S / ln T → 0.100
```

That is Part 3's "gentle column" reproduced from a completely different representation —
no MPS, no truncation, no $$\chi$$; the only convergence parameter left in the problem is
the Trotter step.

## 3 · The size ledger

The reason this companion exists, in one table:

```text
representation                  cost at T = 48
------------------------------- ---------------------------------
dense folded vector (C1)        4^48 ≈ 8·10^28 complex numbers
temporal MPS (C2)               O(T χ²) — with χ growing as the phase dictates
Gaussian kernel (this)          one 96×96 matrix: 9216 complex numbers
```

The collapse is not an approximation — for a quadratic bath the kernel representation is
*exact*, and every quantity the earlier companions extracted with effort (TE profiles,
Schmidt spectra) is an eigenvalue routine away. The restriction is equally sharp: one
interacting term in the bath and the whole part-B pipeline is void, while C2's MPS
marches on obliviously. Structure buys everything, and only structure.

## 4 · What is deferred, and where it lands

One deliberate gap. This companion validates the *state-level* machinery to machine
precision and takes the kernel construction's physical output (decay laws, log TE) as
measurements — but it does not yet benchmark the kernel against exact impurity
*dynamics*: computing $$\langle n_d(t)\rangle$$ from $$\Delta$$ alone and comparing with
brute-force evolution of impurity+lead. That check belongs to Companion 5, because it is
exactly what an impurity solver does — and the resonant level model, being exactly
solvable, will referee it. The roadmap's promised cross-check against Companion 2's
spin-language code at small sizes is also parked there, with a caveat recorded: the
Jordan–Wigner string that maps the kicked chain to fermions does not commute innocently
with the system–bath cut, so the honest comparison needs care rather than optimism.

## References

{% bibliography --file refs_influence_matrix --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public entry: I write these to teach myself the numerics behind my PhD,
> with **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
{: .block-tip }
