---
layout: post
title: "A matrix-product state in the time direction"
date: 2026-07-29 09:00:00-0700
description: Companion 2 of the influence-matrix series — a from-scratch temporal MPS and the truncated transverse contraction in plain Julia, refereed by Companion 1's exact object, verifying the perfect dephaser to machine precision and measuring how little bond dimension a chaotic bath's memory actually needs.
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

Companion 2 of the influence-matrix series, paired with
[**Temporal Entanglement: When a Chaotic System Is a Perfect Bath**]({% post_url 2026-07-29-temporal-entanglement-when-a-chaotic-system-is-a-perfect-bath %}).
[Companion 1]({{ '/programming/influence-matrix-01-exact-dense/' | relative_url }}) ended
at a wall: the exact influence matrix is $$4^T$$ numbers, and $$T \approx 12$$ is where
dense dies. This entry knocks the wall down by writing the IM as a **matrix-product state
over the temporal lattice** and implementing the truncated transverse contraction — all of
it from scratch in plain Julia, because building the MPS machinery by hand is the point of
this rung. (A real tensor-network library enters the ladder next time, when performance
starts to matter.)

The full script is
[`assets/julia/influence-matrix/c2_temporal_mps.jl`]({{ '/assets/julia/influence-matrix/c2_temporal_mps.jl' | relative_url }});
every number below is its output.

<p class="thread-note"><span class="thread-label">The through-line</span> Companion 1
built the exact object; this companion compresses it and lets the exact object referee
the compression. Five checks, each one a claim from the Part 2 post turned into a
number.</p>

<div class="sec-divider" aria-hidden="true">•••</div>

## 1 · The pieces

Three ingredients, ~150 lines total.

**The MPS.** A `Vector` of rank-3 tensors `A[χl, 4, χr]`, one per time step, physical leg
$$\sigma_t = (s_t, \bar s_t)$$ — conventions inherited verbatim from Companion 1 (σ = 2·fwd
+ bwd, $$\sigma_1$$ leftmost).

**The MPO of one bath site.** One site's world-line read sideways. Its bond variable is
the site's own folded spin $$\beta = (z_t, \bar z_t)$$, dimension 4; because the coupling
is diagonal, the old IM's physical leg is *pinned* to that bond:

```julia
function site_mpo(J, K)
    W = zeros(ComplexF64, 4, 4, 4, 4)          # β_in, η, σ, β_out
    for βi in 1:4
        z, z̄ = zval((βi-1) >> 1), zval((βi-1) & 1)
        for η in 1:4
            ηz, η̄z = zval((η-1) >> 1), zval((η-1) & 1)
            ph = exp(-im*J*(ηz*z - η̄z*z̄))
            for βo in 1:4
                W[βi, η, βi, βo] = ph * K[zo(βo), zo(βi)...]   # kick factors
            end
        end
    end
    W        # σ index == β_in index: the "diagonal pin"
end
```

Applying it multiplies every bond by 4; the bottom boundary contracts with the site's
initial state (a selector for $$\lvert\uparrow\rangle$$, or $$\tfrac12[\delta_{z\bar z}]$$
for infinite temperature), the top with the trace $$\delta_{z \bar z}$$.

**Compression.** A right-to-left QR sweep (canonical form), then a left-to-right SVD
sweep keeping $$\chi_{\max}$$ singular values per cut. The kept values are, for free, the
**temporal entanglement spectrum** — the physics output and the numerics workhorse are the
same array:

```julia
F = svd(reshape(A, χl*d, χr))
keep = min(χmax, count(F.S .> cutoff*maximum(F.S)))
schmidt[t] = F.S[1:keep]                     # ← Part 2's S(k) comes from here
```

## 2 · Check 1 — the referee approves

First, no truncation: does the MPS pipeline reproduce Companion 1's exact dense IM?

```text
J=0.7000 b=0.6000   max|Δ| = 4.89e-15   bond dims: [4, 16, 64, 16, 4]
J=0.7854 b=0.7854   max|Δ| = 5.29e-15   bond dims: [4, 16, 64, 16, 4]
```

Machine precision, and a bonus observation: even *uncompressed*, the exact bond dimensions
`[4, 16, 64, 16, 4]` are far below the worst case — the light cone caps them from both
ends. (A leg-ordering bug in my dense-conversion routine produced $$\Delta \sim 1$$ on the
first run of this check; column-major reshapes and MSB-first conventions are natural
enemies, and the referee is the only reason the bug lived for minutes rather than weeks.)

## 3 · Check 2 — the perfect dephaser, both initial states

The Part 2 post's centerpiece, measured. At the self-dual point $$b = J = \pi/4$$, $$T=6$$:

```text
bath spins |↑⟩ (a solvable but polarized start):
  Lb=2    max TE over cuts = 2.08e+00   max|IM − Πδ| = 1.00e+00
  Lb=4    max TE over cuts = 6.93e-01   max|IM − Πδ| = 1.00e+00
  Lb=8    max TE over cuts = 0          max|IM − Πδ| = 1.00e+00
  Lb=16   max TE over cuts = 0          max|IM − Πδ| = 1.00e+00
bath at infinite temperature (maximally mixed):
  Lb=1    max TE over cuts = 1.39e+00   max|IM − Πδ| = 1.00e+00
  Lb=2    max TE over cuts = 1.39e+00   max|IM − Πδ| = 1.00e+00
  Lb=4    max TE over cuts = 0          max|IM − Πδ| = 1.09e-15
  Lb=8    max TE over cuts = 0          max|IM − Πδ| = 1.89e-15
  Lb=16   max TE over cuts = 0          max|IM − Πδ| = 3.01e-15
```

Both stories from the post, in one table. Once the bath outruns the light cone, the
infinite-temperature bath's IM **is** $$\prod_t \delta_{s_t \bar s_t}$$ — the perfect
dephaser, exact to $$10^{-15}$$. The polarized bath *also* reaches exactly zero temporal
entanglement (a product state in time — zero memory) but at distance 1 from
$$\prod\delta$$: memoryless without being pure dephasing. Two different perfect baths,
distinguished by their single-leg tensors.

## 4 · Check 3 — a generic bath's memory saturates

Away from self-duality ($$J=0.7$$, $$b=0.6$$, $$T=10$$), the TE profile across all nine
cuts, as the bath deepens:

```text
Lb=4    TE:  0.000 1.183 2.103 2.725 2.736 2.413 1.896 1.316 0.692
Lb=8    TE:  0.000 0.719 0.952 1.020 1.049 1.004 0.949 0.880 0.512
Lb=16   TE:  0.000 0.721 0.953 1.022 1.050 1.011 0.952 0.823 0.533
Lb=32   TE:  0.000 0.721 0.953 1.022 1.050 1.011 0.952 0.823 0.533
```

Two lessons. Converged in depth by $$L_b = 16$$ (the rows for 16 and 32 are identical to
three decimals): the influence matrix of a *semi-infinite* bath is a real, finite object.
And the converged profile hovers around 1 — **order one bit of memory** — which is the
entire economic case for the temporal MPS. Curious detail: the shallow bath ($$L_b=4$$) has
*more* temporal entanglement than the deep one. A small bath can't scramble; whatever the
system imprints on it sloshes back and forth coherently, and reflection off the far edge is
memory. Deepening the bath adds somewhere for the imprint to leave *to* — forgetting needs
room.

## 5 · Check 4 — what χ buys

Truncation turned on ($$L_b=16$$, $$T=10$$, generic point), relative $$L^2$$ error of the
compressed IM against the untruncated reference:

```text
χ=2      1.00e+00
χ=4      7.76e-01
χ=8      6.63e-01
χ=16     2.01e-01
χ=32     2.54e-02
```

An honest curve — no miracle at tiny $$\chi$$, then rapid convergence once $$\chi$$ clears
the entanglement scale, with a factor ~8 per doubling by the end. And the payoff line of
the whole companion: a $$T=20$$, 40-site bath — dense cost $$4^{20} \approx 10^{12}$$
complex numbers — runs in

```text
11.1 s;  max TE = 1.228;  final bond dims ≤ 64
```

on a laptop, in unoptimized textbook Julia. The wall Companion 1 measured is simply gone.

## 6 · What's deliberately missing

Three things are *not* in this code, on purpose. No fixed-point iteration in the proper
sense (we absorb a finite number of sites rather than solving
$$\mathrm{IM} = \hat{\mathcal T}[\mathrm{IM}]$$ directly — depth-convergence does the same
job here). No disorder, and no sweep over dynamical regimes: that is exactly Companion 3,
which takes this engine and turns it into a measurement apparatus for Part 3's claim that
TE scaling diagnoses the bath's dynamical phase. And no real tensor-network library — the
hand-rolled version was the point this time, but its limits (dense SVDs, no symmetry
blocks) are noted for when the ladder gets heavier.

## References

{% bibliography --file refs_influence_matrix --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public entry: I write these to teach myself the numerics behind my PhD,
> with **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
{: .block-tip }
