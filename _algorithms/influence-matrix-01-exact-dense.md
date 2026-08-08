---
layout: post
title: "Exact influence matrices, by brute force"
date: 2026-07-28 09:00:00-0700
description: Companion 1 of the influence-matrix series — build the influence matrix of a kicked Ising bath as a dense 4^T vector, two independent ways, verify it against brute-force evolution to machine precision, take its Schmidt spectrum across time cuts, and measure exactly where dense methods die.
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

This is the numerical companion to
[**The Influence Matrix: Integrating Out Everything But the Question**]({% post_url 2026-07-28-influence-matrix-integrating-out-everything-but-the-question %}) —
the first rung of a ladder that ends, several companions from now, at a toy impurity
solver. The rules of this rung: plain Julia, everything dense, everything exact, nothing
clever. The point is to hold the influence matrix in memory as an explicit vector of
$$4^T$$ complex numbers, poke it, and measure precisely where this brute-force approach
dies — because the wall we hit here is the entire motivation for Companion 2.

The full script is at
[`assets/julia/influence-matrix/c1_exact_dense.jl`]({{ '/assets/julia/influence-matrix/c1_exact_dense.jl' | relative_url }});
every number below is its actual output on my laptop.

<p class="thread-note"><span class="thread-label">The through-line</span> Same physics,
three codes: brute-force evolution in space, a transverse contraction in time, and a Gram
matrix of conditioned bath states. They agree to 10⁻¹⁵ — which is the whole point. When
Companion 2 starts compressing, this exact object is the referee.</p>

<div class="sec-divider" aria-hidden="true">•••</div>

## 1 · Conventions, once

All three constructions share the model of the blog post — kicked Ising chain, one Floquet
period = Ising layer $$e^{-iJ\sum Z_j Z_{j+1}}$$ then kick layer $$e^{-ib\sum X_j}$$, site
1 the system, everything initialized in $$\lvert\uparrow\cdots\uparrow\rangle$$ — and one
block of index conventions, stated in a single place at the top of the script:

```julia
#   · basis index of an n-spin register: 0-based integer; site j ∈ 1..n is bit
#     (n-j), i.e. site 1 is the MOST significant bit; bit 0 ⇒ spin up ⇒ z = +1.
#   · folded index σ = 2·(forward bit) + (backward bit) ∈ 0:3, so
#     σ=0 is (↑,↑), σ=3 is (↓,↓).
#   · a T-leg folded tensor is a length-4^T vector, σ_1 the MOST significant
#     base-4 digit.

zval(bit) = 1 - 2*bit                               # bit 0 → +1, bit 1 → −1
kick(b) = [cos(b) -im*sin(b); -im*sin(b) cos(b)]    # ⟨z'| e^{-ibX} |z⟩
```

Index bugs in this kind of code are silent — everything still runs, the numbers are just
wrong — so the only defense is redundancy: build the same object twice by unrelated routes
and insist they agree.

## 2 · Stage 1 — the referee: brute-force evolution

The reference implementation is ordinary state-vector evolution — the "contract in time"
order, carrying $$2^L$$ amplitudes. The Ising layer is a diagonal phase; the kicks are
$$2\times 2$$ gates applied site by site:

```julia
function brute_Z1(L, T, J, b_bath, b_sys_seq)
    dim = 2^L
    ψ = zeros(ComplexF64, dim); ψ[1] = 1                          # |↑…↑⟩
    ising = [exp(-im*J*sum(zval((idx >> (L-1-j)) & 1) * zval((idx >> (L-2-j)) & 1)
                           for j in 0:L-2)) for idx in 0:dim-1]
    Kb = kick(b_bath)
    out = Float64[]
    for t in 1:T
        ψ .*= ising                                               # Ising layer (diagonal)
        ψ = apply_site(kick(b_sys_seq[t]), ψ, L, 1)               # system kick
        for j in 2:L; ψ = apply_site(Kb, ψ, L, j); end            # bath kicks
        push!(out, sum(zval((idx >> (L-1)) & 1) * abs2(ψ[idx+1]) for idx in 0:dim-1))
    end
    out
end
```

Note the system's kick angle is a *sequence* — that generality is what stage 3's
"solve-once, reuse-everywhere" check needs.

## 3 · Stage 2 — the transverse contraction

Now the same network contracted sideways: absorb the bath one site at a time from the far
edge, carrying a temporal object the whole way. Absorbing a site means evaluating

$$
\mathrm{IM}_{\mathrm{new}}[\eta] = \sum_{z,\bar z\ \text{paths}}
\rho(z_1,\bar z_1) \prod_t \Big[ e^{-iJ \eta_t z_t} e^{+iJ \bar\eta_t \bar z_t}
K_{z_{t+1} z_t} \bar K_{\bar z_{t+1} \bar z_t} \Big] \delta_{z_{T+1} \bar z_{T+1}}
\cdot \mathrm{IM}_{\mathrm{old}}[(z,\bar z)],
$$

where $$\eta$$ is the trajectory of the next site inward, and — because the coupling is
diagonal — $$\mathrm{IM}_{\mathrm{old}}$$'s legs are *pinned* to this site's own path. The
implementation processes the sum one time step at a time. The working tensor `W` carries
three groups of legs — η-legs emitted so far, the current folded bond $$(z_t,\bar z_t)$$,
and the not-yet-consumed legs of the old IM — and never exceeds $$4^{T+1}$$ components:

```julia
function absorb_site(IMold, T, J, K)
    haslegs = length(IMold) > 1               # false only for the far-edge site
    W = zeros(ComplexF64, 1, 4, haslegs ? length(IMold) : 1)
    W[1, 1, :] = IMold                        # ρ_site = |↑⟩⟨↑| ⇒ (z_1,z̄_1) = (↑,↑)
    for t in 1:T
        # ... one time step: consume IM_old's leg t (pinned to the bond),
        #     emit the new η_t leg, kick the bond forward ...
    end
    vec(W[:, 1, 1] .+ W[:, 4, 1])             # trace closure: (↑,↑) or (↓,↓)
end

transverse_IM(L, T, J, b) = (IM = ComplexF64[1];
    for _ in 1:(L-1); IM = absorb_site(IM, T, J, kick(b)); end; IM)
```

(The elided loop body is thirty lines of explicit index bookkeeping in the script.) This
is exactly the post's picture: **exponential in $$T$$, linear in $$L$$** — each site costs
one pass over a $$4^{T+1}$$ tensor, and absorbing more bath is just more passes.

As an independent check the script also builds the IM a third way, as a **Gram matrix**:
with a pure bath state, $$\mathrm{IM}[s,\bar s] = \langle u_{\bar s} | u_s\rangle$$ where
$$u_s = V_s\lvert\psi_{\mathrm{bath}}\rangle$$ is the bath state conditioned on the system
trajectory $$s$$, built as a tree over trajectory prefixes. Two unrelated codes, one
object:

```text
J=0.7000  b=0.6000   transverse vs Gram construction: max|Δ| = 1.33e-15
J=0.7854  b=0.7854   transverse vs Gram construction: max|Δ| = 7.78e-16
J=0.3000  b=1.1000   transverse vs Gram construction: max|Δ| = 2.66e-15
```

## 4 · Stage 3 — the exactness check, and a causality trap

With the IM cached, $$\langle Z_1(t)\rangle$$ is a purely one-dimensional contraction:
system paths (with the observable inserted after $$t$$ periods) against the IM's first
$$t$$ legs. The measured verdict, one IM per $$(J,b)$$ reused across three different
system drives:

```text
J=0.7000  b=0.6000  b_sys=0.6000   max|Δ| = 9.44e-16   (same IM reused)
J=0.7000  b=0.6000  b_sys=0.3000   max|Δ| = 4.44e-15   (same IM reused)
J=0.7000  b=0.6000  b_sys=0.0000   max|Δ| = 1.11e-15   (same IM reused)
J=0.7854  b=0.7854  b_sys=0.7854   max|Δ| = 1.67e-16   (same IM reused)
J=0.3000  b=1.1000  b_sys=1.1000   max|Δ| = 1.44e-15   (same IM reused)
```

Machine precision, every combination — the qualitative content of the exact small-size
checks in Lerose–Sonner–Abanin
{% cite lerose2021influence --file refs_influence_matrix %}: IM-computed local dynamics
agrees with direct evolution, and one bath contraction serves every drive.

One genuine subtlety earned its own comment block in the script, because my first
implementation got it wrong. To evaluate $$\langle Z_1(t)\rangle$$ with $$t < T$$ you must
close the IM's *future* legs. Causality says the answer cannot depend on what the system
does after $$t$$ — so you may close the future with any drive you like, and the trivial
choice (no kicks) freezes the trajectory at the endpoint $$e$$ on both branches, pinning
every future leg to the *same* diagonal value $$\sigma = (e,e)$$:

```julia
function future_closed(IM, idx, t, T, e)
    j = idx
    σ = e == 0 ? 0 : 3                # (↑,↑) or (↓,↓), held for ALL future steps
    for _ in 1:(T - t);  j = 4j + σ;  end
    IM[j+1]
end
```

The trap: summing each future leg *independently* over the diagonal — which looks like
the innocuous "trace out the future" — is wrong, because the future legs are correlated
through the system's own world-line. The buggy version produced $$\lvert\Delta\rvert
\sim 30$$ on an observable bounded by 1. The referee caught it instantly; that is what
referees are for.

## 5 · Stage 4 — the Schmidt spectrum across time cuts

The IM is a state on a temporal lattice, so it has a Schmidt decomposition across every
cut between step $$k$$ and $$k+1$$ — its **temporal entanglement**:

```julia
function te_spectra(IM, T)
    v = IM / norm(IM)
    map(1:T-1) do k
        sv = svdvals(reshape(v, 4^(T-k), 4^k))
        p = sv.^2; p ./= sum(p)
        (k, -sum(x -> x > 1e-14 ? x*log(x) : 0.0, p), sv)
    end
end
```

Measured at $$L=5$$, $$T=6$$:

```text
generic    (J=0.70, b=0.60):  S(1)=0.0000  S(2)=0.6414  S(3)=0.7730  S(4)=0.8796  S(5)=0.5639
self-dual  (J=b=π/4):         S(1)=0.0000  S(2)=0.0000  S(3)=0.0000  S(4)=0.6931  S(5)=0.6931
```

Two things sit in that table, and Part 2 of the blog series is built on both. The generic
bath has order-one temporal entanglement at every interior cut. The self-dual bath has
*exactly zero* through the first three cuts — and the nonzero tail at cuts 4 and 5 is a
finite-size effect: this bath is only 4 sites deep, and a cut after step $$k$$ can only be
trivial once the bath outruns the light cone. (Rerun the script with a deeper bath and
watch the zeros march to the right.) One teaser sentence, as promised: *that pattern of
zeros is a maximally chaotic many-body system acting as a perfectly memoryless bath, and
it is the subject of the next post.* Here we compute; there we interpret.

## 6 · Stage 5 — where dense methods die

Finally, the honest accounting. Two walls, measured:

```text
the wall in T (transverse contraction, L=5):        the wall in L (brute force, T=6):
  T=4   4^T = 256          0.000 s      0.3 MB        L=8    2^L = 256        0.000 s
  T=5   4^T = 1024         0.000 s      1.5 MB        L=12   2^L = 4096       0.002 s
  T=6   4^T = 4096         0.005 s      6.6 MB        L=16   2^L = 65536      0.051 s
  T=7   4^T = 16384        0.020 s     29.7 MB        L=20   2^L = 1048576    0.625 s
  T=8   4^T = 65536        0.097 s    131.4 MB
  T=9   4^T = 262144       0.503 s    576.0 MB
```

Both are clean exponentials — a factor ~4–5 in time and memory per added Floquet step, a
factor ~2 per added site. Extrapolating the left column: $$T=12$$ wants ~40 GB of
allocations, $$T=14$$ is out of the question. **A dozen time steps is the ceiling of the
dense world**, exactly the "~8–10 folded qubits" the blog post promised — and note the
asymmetry of the trade: brute force handles $$L=20$$ effortlessly but is stuck with
whatever $$T$$ costs, while the transverse route handles any $$L$$ effortlessly but dies
in $$T$$.

The way out is the same trick that rescued spatial many-body physics: don't store the
state, compress it. The temporal entanglement we just computed is small — order one, not
order $$T$$ — which is precisely the invitation to write the IM as a matrix-product state
*in the time direction*. That is Companion 2: a from-scratch temporal MPS and the
transverse contraction with truncation, refereed at every step by the exact object built
here.

## References

{% bibliography --file refs_influence_matrix --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public entry: I write these to teach myself the numerics behind my PhD,
> with **Claude AI** as a collaborator. The direction and the physics-checking are mine —
> corrections welcome!
{: .block-tip }
