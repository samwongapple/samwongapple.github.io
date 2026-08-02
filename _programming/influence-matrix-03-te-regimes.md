---
layout: post
title: "Reading a phase diagram off one vector"
date: 2026-07-30 09:00:00-0700
description: Companion 3 of the influence-matrix series — a mini research project. Generalize the temporal-MPS engine with longitudinal fields, sweep four dynamical regimes of the kicked Ising chain, disorder-average the localized case, and measure how the temporal entanglement's growth law diagnoses the bath's dynamical phase.
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

Companion 3 of the influence-matrix series, paired with
[**Dynamical Phases Through the Temporal Lens**]({% post_url 2026-07-30-dynamical-phases-through-the-temporal-lens %}).
This is the first companion with a research-project flavour: not "implement a method and
verify it" but "point a validated instrument at a physics question and take data." The
instrument is [Companion 2]({{ '/programming/influence-matrix-02-temporal-mps/' | relative_url }})'s
temporal MPS; the question is whether the temporal entanglement's *growth law* separates
the dynamical phases of the bath.

The full script is
[`assets/julia/influence-matrix/c3_te_regimes.jl`]({{ '/assets/julia/influence-matrix/c3_te_regimes.jl' | relative_url }});
all numbers below are its output.

<p class="thread-note"><span class="thread-label">The through-line</span> Same engine as
Companion 2 plus one generalization (longitudinal fields) and one discipline (convergence
tables you can audit). The deliverable is a four-row table whose rows have different
shapes — the shapes are the physics.</p>

<div class="sec-divider" aria-hidden="true">•••</div>

## 1 · One generalization

The engine change is nine characters in the MPO — the longitudinal angle enters the Ising
layer's phase:

```julia
ph = exp(-im*(J*(ηz*z - η̄z*z̄) + g*(z - z̄)))
```

with a per-site `gs` array threaded through `im_mps` so disorder is free. Everything else
is Companion 2's code verbatim: same conventions, same compression, same closures (bath at
infinite temperature throughout — the natural equilibrium choice, and the one for which
the perfect-dephaser form is exact at self-duality).

One war story worth recording: at $$\chi = 192$$ LAPACK's default divide-and-conquer SVD
(`gesdd`) intermittently fails to converge on these matrices. The fix is a fallback —

```julia
F = try svd(M) catch; svd(M; alg=LinearAlgebra.QRIteration()) end
```

— and it is now in Companion 2's `compress!` as well. If your tensor-network code has
never hit this, it will.

## 2 · The data

Half-cut temporal entanglement versus $$T$$, bath depth $$T+4$$ (past the light cone),
$$\chi_{\max} = 64$$ for the table, more where needed (see §3):

```text
T grid:                              4       8       12      16      20
integrable (J=0.7, b=0.6, g=0):      0.526   0.814   0.974   1.054   1.099
chaotic (J=0.7, b=0.6, g=0.4):       0.529   1.090   1.722   2.253*  2.529*
chaotic self-dual (π/4, π/4, g=0.4): 0.000   0.000   0.000   0.000   0.000
MBL (J=0.25, b=0.2, g random):       0.190   0.387   0.555   0.668   0.741
                                     (MBL row: mean over 6 disorder realizations)
```

The starred chaotic entries are $$\chi = 64$$ values, refined in §3. Read the rows as
shapes: shrinking increments (integrable, MBL — logarithmic), constant increments
(chaotic — linear), and identically zero (dual-unitary, longitudinal field
notwithstanding). The full cut-profile at $$T=20$$ makes the same point in one line each —
the chaotic profile is a genuine *barrier*, rising to mid-time and falling symmetrically:

```text
integrable   0.77  0.96  1.05  1.09  1.10  1.09  1.05  0.96  0.77
chaotic      1.00  1.77  2.31  2.51  2.53  2.42  2.18  1.71  0.98
self-dual    0.00  0.00  0.00  0.00  0.00  0.00  0.00  0.00  0.00
```

## 3 · The convergence table is part of the result

For a study whose headline is "this row grows linearly," the bond-dimension dependence is
not bookkeeping — it *is* the phenomenon, seen from the cost side:

```text
T=12  χ=64/128/256   TE(mid) = 1.7220 / 1.7220 / 1.7220     (converged)
T=16  χ=64/128/256   TE(mid) = 2.2527 / 2.3289 / 2.3355     (converged to ~3e-3)
T=20  χ=64/128/256   TE(mid) = 2.5289 / 2.7311 / 2.8171     (still drifting ~1%)
```

Linear $$S$$ means exponential $$\chi$$: by $$T=20$$ even $$\chi=256$$ is slightly short,
and the drift direction tells you the truth is a bit *above* 2.82. The other three regimes
are $$\chi=64$$-converged at every $$T$$ — their Schmidt spectra fall off a cliff. So the
practical summary for anyone building on this engine: integrable, localized and
dual-unitary baths are cheap indefinitely; a thermalizing bath is affordable to
$$T \sim 16$$ and exponential thereafter, exactly as its linear barrier demands.

## 4 · What a research version would add

This is a study at one parameter point per regime with 6 disorder realizations, five
$$T$$ values, and no extrapolations — deliberately minimal. The obvious next steps, left
undone here: the slope $$\alpha(g)$$ of the chaotic barrier as the integrability breaking
is dialed from 0 (it must vanish at both $$g=0$$ and the self-dual point — the open
question Part 3 ends on); per-realization distributions and larger disorder ensembles near
the MBL crossover; and profiles at fixed $$T$$ across the $$(b, J, g)$$ cube. The engine
runs all of these; what they cost is only time — except the chaotic slope at large
$$g$$, which costs $$\chi$$.

## References

{% bibliography --file refs_influence_matrix --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public entry: I write these to teach myself the numerics behind my PhD,
> with **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
{: .block-tip }
