---
layout: post
title: "GRAPE — pure states and gate synthesis"
date: 2026-08-08 09:00:00-0700
description: Entry 1 of the quantum-control thread — a from-scratch Julia GRAPE with piecewise-constant controls and exact Van Loan gradients, triple-checked (analytic vs finite differences vs autodiff), driven against two referees with teeth — the quantum-speed-limit cliff for a qubit flip, and the Khaneja–Glaser time-optimal bound for CNOT synthesis — then cross-checked against GRAPE.jl.
tags: [quantum-control, optimal-control, julia]
categories: [quantum-control]
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

GRAPE — gradient ascent pulse engineering {% cite khaneja2005grape --file refs_qcontrol %} —
is the workhorse of quantum optimal control: chop a control field into piecewise-constant
segments, compute the gradient of a fidelity with respect to every segment amplitude, and
climb. This entry builds it from scratch in Julia (~100 lines: exact propagators, exact
gradients via the Van Loan augmented exponential, L-BFGS from `Optim.jl`) and drives it
against two problems whose answers are known *exactly*: flipping a qubit against the
quantum speed limit, and synthesizing a CNOT against the Khaneja–Glaser time-optimal
bound {% cite khaneja2001timeoptimal --file refs_qcontrol %}. The
`QuantumControl.jl`/`GRAPE.jl` ecosystem {% cite goerz2022semiautomatic --file refs_qcontrol %}
runs the same problems as a second, independent implementation. The full script is at
[`assets/julia/quantum-control/p1_grape.jl`]({{ '/assets/julia/quantum-control/p1_grape.jl' | relative_url }});
every number below is its actual output on my laptop.

<p class="thread-note"><span class="thread-label">The through-line</span> An optimizer's
output is only as trustworthy as the referee grading it. Here every claim faces one with
teeth: an analytic Rabi formula, two provable time-optimal bounds, a closed-form
sub-cliff envelope — and the gradient itself is computed three independent ways before
it is allowed to steer anything.</p>

<div class="sec-divider" aria-hidden="true">•••</div>

## 1 · The algorithm

The setting is bilinear control. A drift Hamiltonian $$H_0$$ we do not choose, control
Hamiltonians $$H_j$$ whose amplitudes we do, and a total evolution time $$T$$ chopped into
$$K$$ segments of duration $$\delta t = T/K$$ on which the controls are constant:

$$
H_k = H_0 + \sum_{j=1}^{M} u_{kj} H_j ,
\qquad
U(T) = U_K \cdots U_2 U_1 ,
\qquad
U_k = e^{-i\,\delta t\, H_k} .
$$

The figure of merit, pinned once for the whole thread: for state transfer
$$\lvert\psi_0\rangle \to \lvert\psi_\mathrm{tgt}\rangle$$ and for gate synthesis toward
$$V$$,

$$
F_\mathrm{state} = \bigl|\langle \psi_\mathrm{tgt}\rvert U(T) \lvert\psi_0\rangle\bigr|^2 ,
\qquad
F_\mathrm{gate} = \frac{1}{d^2}\bigl|\operatorname{Tr}\bigl(V^\dagger U(T)\bigr)\bigr|^2 ,
$$

both insensitive to the global phase of $$U(T)$$. GRAPE is gradient ascent on $$F$$ over
the $$K \times M$$ real numbers $$u_{kj}$$. Both fidelities are $$F = |c|^2$$ for an
overlap $$c$$ that is *linear* in each segment propagator, so

$$
\frac{\partial c}{\partial u_{kj}}
 = \Big\langle \lambda_k \Big|\, \frac{\partial U_k}{\partial u_{kj}}\, \Big|\varphi_{k-1} \Big\rangle ,
\qquad
\frac{\partial F}{\partial u_{kj}} = 2\,\mathrm{Re}\Bigl( \bar c\, \frac{\partial c}{\partial u_{kj}} \Bigr),
$$

where $$\varphi_{k-1} = U_{k-1}\cdots U_1 \lvert\psi_0\rangle$$ is the state propagated
forward and $$\lambda_k = (U_K\cdots U_{k+1})^\dagger \lvert\psi_\mathrm{tgt}\rangle$$ the
target propagated backward — one forward sweep, one backward sweep, and every gradient
component falls out. That $$O(K)$$ structure, not the gradient formula itself, is GRAPE's
actual contribution: the naive cost ($$K$$ finite differences, each a fresh $$O(K)$$
propagation) is $$O(K^2)$$ matrix exponentials.

What remains is the derivative of one segment's propagator. The original GRAPE paper
{% cite khaneja2005grape --file refs_qcontrol %} uses the first-order approximation
$$\partial U_k/\partial u_{kj} \approx -i\,\delta t\, H_j U_k$$, valid when
$$\delta t \lVert H_k \rVert \ll 1$$ — the error term is the commutator
$$[H_k, H_j]$$ at order $$\delta t^2$$. But the *exact* derivative costs barely more: by
Van Loan's augmented-exponential identity
{% cite vanloan1978integrals --file refs_qcontrol %},

$$
\exp\!\begin{pmatrix} A & B \\ 0 & A \end{pmatrix}
 = \begin{pmatrix} e^{A} & \displaystyle\int_0^1 e^{A(1-s)} B\, e^{As}\, ds \\ 0 & e^{A} \end{pmatrix},
\qquad
A = -i\,\delta t\, H_k, \quad B = -i\,\delta t\, H_j ,
$$

whose top-right block is exactly $$\partial U_k / \partial u_{kj}$$ — one $$2d \times 2d$$
matrix exponential per gradient component, and the gradient is exact to machine
precision. Exact gradients are what let a quasi-Newton optimizer (L-BFGS, following
{% cite defouquieres2011secondorder --file refs_qcontrol %}) converge to $$1-F \sim
10^{-15}$$ instead of stalling at the accuracy of the gradient approximation.

## 2 · A reference to check against

Three referees, in increasing order of physics content.

**(a) The gradient itself, three ways.** Before the gradient steers anything it must
survive a triple computation: the Van Loan analytic gradient, central finite differences,
and reverse-mode autodiff (Zygote differentiating straight through the matrix
exponentials). Three unrelated codes, one vector — the expected agreements are machine
precision for autodiff and $$\sim\!10^{-12}$$ for central differences at their optimal
step (truncation $$h^2$$ balancing roundoff $$\varepsilon/h$$). The first-order
propagator derivative is graded too: its error against the exact gradient must scale as
$$\delta t^2$$ per component.

**(b) Driven qubit vs the quantum speed limit.** System A is a single qubit,

$$
H = \tfrac{\Delta}{2}\sigma_z + \tfrac{u_x(t)}{2}\sigma_x + \tfrac{u_y(t)}{2}\sigma_y ,
$$

so $$u_x$$ is the Rabi rate: on resonance ($$\Delta = 0$$) a constant drive gives
$$P_{0\to1}(T) = \sin^2(\Omega T/2)$$, the analytic formula the simulator must reproduce
before anything else is believed, and a $$\pi$$-pulse at $$T = \pi/\Omega$$. That
$$\pi$$-pulse is time-optimal: with the drive bounded by $$\lvert u_x \rvert \le
\Omega_\mathrm{max}$$, the flip cannot be done faster than

$$
T_\mathrm{min} = \frac{\pi}{\Omega_\mathrm{max}} ,
$$

and below it the best possible fidelity has a closed form — the bounded control can
accumulate rotation angle at most $$\Omega_\mathrm{max} T$$, so $$F_\mathrm{best}(T) =
\sin^2(\Omega_\mathrm{max} T/2)$$. The referee is therefore not one number but a whole
curve: GRAPE's optimum must trace the envelope below $$T_\mathrm{min}$$ and snap to
$$F = 1$$ exactly at it.

**(c) CNOT vs the Khaneja–Glaser bound.** System B is two qubits with an Ising drift and
fast local controls,

$$
H = J\,\sigma_z \otimes \sigma_z
 + \sum_{i=1,2} \tfrac{u_{ix}(t)}{2}\sigma_x^{(i)} + \tfrac{u_{iy}(t)}{2}\sigma_y^{(i)} ,
$$

with the locals unbounded (the "fast local control" idealization). The Cartan
decomposition of $$SU(4)$$ writes any two-qubit gate as
$$U = k_1 \exp\bigl(-i\sum_{a} c_a\, \sigma_a\otimes\sigma_a\bigr)\, k_2$$ with
$$k_{1,2}$$ local {% cite khaneja2001timeoptimal --file refs_qcontrol %}
{% cite zhang2003geometric --file refs_qcontrol %}; local rotations are free, and the
drift is the only term that can generate the nonlocal class vector
$$(c_x, c_y, c_z)$$, at rate at most $$J$$ in total class angle. CNOT sits in the class
$$(0, 0, \pi/4)$$, so

$$
T_\mathrm{min} = \frac{\pi}{4J} .
$$

⚠ **Convention trap, pinned numerically before trusting any formula.** The literature
also quotes $$T_\mathrm{min} = \pi/(2J)$$ — those papers write the drift as
$$H = \tfrac{J}{2}\sigma_z\sigma_z$$. Which world this post lives in is checked by
machine, three ways, in §4: an explicit identity building CNOT out of
$$e^{-i(\pi/4)\sigma_z\otimes\sigma_z}$$ and local gates, equality of Makhlin invariants
{% cite makhlin2002invariants --file refs_qcontrol %} (the complete local-equivalence
test for two-qubit gates), and the observation that under the $$J/2$$ convention the
CNOT class is only reached at $$T = \pi/(2J)$$.

The sub-cliff envelope also has a referee. For $$T < T_\mathrm{min}$$ the drift has only
accumulated class angle $$\theta = JT < \pi/4$$, and the best fidelity from the class
$$(0,0,\theta)$$ — maximizing over all four instantaneous local dressings by direct
numerical optimization over $$SU(2)^{\otimes 4}$$, a 12-parameter problem small enough
to solve exactly — turns out to match a closed form:

$$
F_\mathrm{best}(\theta) = \cos^2\!\Bigl(\frac{\pi}{4} - \theta\Bigr)
 = \frac{1 + \sin 2\theta}{2} .
$$

So System B's referee is again a full curve with a cliff: the locals-only envelope below
$$T_\mathrm{min} = \pi/(4J)$$, machine-precision fidelity above it.

## 3 · Implementation

The core is one screen of Julia. Conventions sit in a comment block at the top of the
script (segment ordering, fidelity definitions, the $$u_{kj}$$ layout); the algorithm is
three functions:

```julia
using LinearAlgebra

seg_ham(H0, Hc, uk) = H0 + sum(uk[j] * Hc[j] for j in eachindex(Hc))

"Segment propagators U_k = exp(-i δt H_k), k = 1..K."
propagators(H0, Hc, u, δt) =
    [exp(-im * δt * seg_ham(H0, Hc, view(u, k, :))) for k in 1:size(u, 1)]

# exact ∂U_k/∂u_kj: top-right d×d block of the Van Loan augmented exponential
function dU_exact(H0, Hc, uk, δt, j)
    d = size(H0, 1)
    A = -im * δt * seg_ham(H0, Hc, uk)
    B = -im * δt * Hc[j]
    exp([A B; zero(A) A])[1:d, d+1:2d]
end

"F = |Tr(V†U(T))|²/d² and its exact gradient — one forward + one backward sweep."
function fid_grad_gate(H0, Hc, u, δt, V)
    K, M = size(u)
    d = size(V, 1)
    Us = propagators(H0, Hc, u, δt)
    Φ = Vector{Matrix{ComplexF64}}(undef, K + 1)      # Φ[k+1] = U_k⋯U_1
    Φ[1] = Matrix{ComplexF64}(I, d, d)
    for k in 1:K
        Φ[k+1] = Us[k] * Φ[k]
    end
    Λ = Vector{Matrix{ComplexF64}}(undef, K + 1)      # Λ[k] = V† U_K⋯U_{k+1}
    Λ[K+1] = Matrix(V')
    for k in K:-1:1
        Λ[k] = Λ[k+1] * Us[k]
    end
    c = tr(Λ[K+1] * Φ[K+1]) / d                       # Tr(V† U(T))/d
    g = zeros(K, M)
    for k in 1:K, j in 1:M
        dU = dU_exact(H0, Hc, view(u, k, :), δt, j)
        g[k, j] = 2 * real(conj(c) * tr(Λ[k+1] * dU * Φ[k]) / d)
    end
    abs2(c), g
end
```

The state-transfer version is the same skeleton with vectors in place of matrices. The
two lines where the idea lives: the **augmented block matrix**
in `dU_exact` — exactness of the gradient costs one $$2d \times 2d$$ exponential — and
the **forward/backward accumulators** `Φ`, `Λ`, which turn $$KM$$ gradient components
into $$O(K)$$ propagations. Optimization is `Optim.jl`'s L-BFGS fed $$1-F$$ and
$$-\nabla F$$ (with `Fminbox` when amplitudes are bounded), multi-started from a few
random seeds because fidelity landscapes, benign as they turn out to be, still deserve
suspicion.

## 4 · Running it

**Gradient triple-check** (random two-qubit instance, $$K=8$$, $$M=4$$, $$T=0.6$$):

```text
F = 0.134060259583   |∇F|₂ = 1.732119e-02

Zygote autodiff  vs Van Loan:  max|Δ| = 4.34e-18     (machine precision)
central FD, h=1e-3:            max|Δ| = 6.89e-12
central FD, h=1e-4:            max|Δ| = 1.19e-12     (optimal h: h² ≈ ε/h)
central FD, h=1e-5:            max|Δ| = 1.47e-11
first-order GRAPE gradient vs exact, same T, shrinking δt:
  K=  8  δt=0.0750   max|Δ| = 1.16e-03
  K= 32  δt=0.0188   max|Δ| = 1.04e-04      ~δt² per fourfold K
  K=128  δt=0.0047   max|Δ| = 7.38e-06
```

All three graded: autodiff agrees to $$4\times10^{-18}$$ (target: machine precision ✓);
central differences to $$1.2\times10^{-12}$$ at their optimal step, degrading in both
directions away from it exactly as the $$h^2$$-truncation-vs-roundoff tradeoff predicts
✓; and the first-order gradient's error falls $$11$$–$$14\times$$ per fourfold
refinement of $$\delta t$$ (expected $$16\times$$ for $$\delta t^2$$; the test redraws
random controls at each $$K$$, so the prefactor wobbles) ✓.

**System A.** First the simulator against the analytic Rabi formula
($$\Omega = 1.3$$, $$K = 50$$): worst disagreement over four gate times
$$\lvert F_\mathrm{sim} - \sin^2(\Omega T/2)\rvert = 5.0\times10^{-15}$$ ✓. Then GRAPE
with a detuning drift ($$\Delta = 1$$, both controls, unconstrained, $$K = 20$$):
$$1-F \le 3\times10^{-15}$$ at both $$T = 2$$ and $$T = 3$$ — the optimizer finds exact
transfer where the constant-drive formula cannot (a constant resonant-amplitude drive at
$$\Delta = 1$$ tops out well below $$F = 1$$).

The speed-limit cliff ($$\Delta = 0$$, single control $$\lvert u_x\rvert \le
\Omega_\mathrm{max} = 1$$, $$K = 40$$, four restarts per point):

```text
 T/T_QSL   1-F (GRAPE)     1-F (envelope)   |Δ|
  0.60     3.454915e-01    3.454915e-01     3.6e-11
  0.80     9.549150e-02    9.549150e-02     6.4e-11
  0.90     2.447174e-02    2.447174e-02     8.0e-11
  0.95     6.155830e-03    6.155830e-03     8.9e-11
  1.00     ≤ 3e-15         0                —
  1.10     ≤ 2e-15         0                —
  1.40     ≤ 2e-15         0                —
```

Graded: below the cliff GRAPE traces the analytic envelope
$$\cos^2(\Omega_\mathrm{max}T/2)$$ to $$\lesssim 10^{-10}$$ (the box-constrained
optimizer's own tolerance), and fidelity snaps to machine-precision 1 *exactly* at
$$T_\mathrm{min} = \pi/\Omega_\mathrm{max}$$ ✓. A bonus check of constraint geometry:
boxing *both* $$u_x$$ and $$u_y$$ independently at $$\Omega_\mathrm{max}$$ lets the
optimizer run at the corner of the box, total amplitude $$\sqrt2\,\Omega_\mathrm{max}$$
— and the measured cliff moves to precisely $$\pi/(\sqrt2\,\Omega_\mathrm{max})$$
($$1-F = 2.2\times10^{-3}$$ at $$0.97\,T^\ast$$, $$2.2\times10^{-16}$$ at
$$1.00\,T^\ast$$). The speed limit knows the *shape* of your constraint set, not just
its scale.

**System B: pinning the convention.** Machine says, with $$Z\!Z \equiv
\sigma_z\otimes\sigma_z$$:

```text
(a) ‖(I⊗H)·CZ·(I⊗H) − CNOT‖              = 5.3e-16
    where CZ = e^{-iπ/4}·e^{-i(π/4)ZZ}·e^{i(π/4)Z⊗I}·e^{i(π/4)I⊗Z}
(b) Makhlin invariants   CNOT:           G1 = 0+0i,  G2 = 1
                         e^{-i(π/4)ZZ}:  G1 = 0+0i,  G2 = 1   (max|Δ| = 1.3e-31)
    other convention, H=(J/2)ZZ, J=1:    T = π/4  →  G1 = 0.5, G2 = 2   (NOT CNOT's class)
                                         T = π/2  →  G1 = 0,   G2 = 1   (CNOT's class)
```

So: with drift $$J\,\sigma_z\otimes\sigma_z$$ the CNOT class needs $$\theta = JT = \pi/4$$
exactly, and $$T_\mathrm{min} = \pi/(4J)$$; the $$\pi/(2J)$$ papers are simply using
$$H = (J/2)\,\sigma_z\sigma_z$$ ✓. The locals-only optimization over
$$SU(2)^{\otimes4}$$ (12 parameters, ForwardDiff + L-BFGS, 12 restarts) reproduces the
claimed envelope at every sampled $$\theta$$ — e.g. $$\theta = 0.5\cdot\pi/4$$: ED gives
$$1-F = 0.146446609$$, closed form $$(1-\sin2\theta)/2 = 0.146446609$$ ✓, and at
$$\theta = 0$$ the best locals-only "CNOT" has $$F = 1/2$$ exactly.

**System B: the payoff.** GRAPE on the full problem, $$J = 1$$, $$K = 32$$, eight
L-BFGS restarts per gate time (measured curve; the widget below replays the actual
optimized pulses):

<div style="margin:1.5rem 0;">
  <div id="grape-cliff-mount"></div>
  <div style="display:flex;justify-content:center;gap:0.6rem;flex-wrap:wrap;margin-top:0.6rem;" id="grape-cliff-btns"></div>
  <p style="font-size:0.8rem;opacity:0.75;margin:0.7rem 0 0;text-align:center;">
    Left: measured CNOT infidelity vs gate time (teal points — from-scratch GRAPE at K=32,
    best of eight restarts; fainter teal lines — K=64 and K=128 near the cliff), the
    locals-only envelope (dotted), and the Khaneja–Glaser bound (amber).
    Right: the actual optimized waveforms at the selected gate time. Every point is
    measured output of the post's Julia script — nothing is simulated in the browser.
  </p>
</div>

```text
 T/Tmin    1-F (GRAPE, K=32)   1-F (envelope)
  0.20     3.539585e-01        3.454915e-01
  0.40     2.183475e-01        2.061074e-01
  0.60     1.095591e-01        9.549150e-02
  0.80     3.459306e-02        2.447174e-02
  0.90     1.286183e-02        6.155830e-03
  0.95     5.820616e-03        1.541333e-03
  1.00     1.492118e-03        0
  1.025    5.132861e-04        0
  1.05     5.643035e-05        0
  1.10     ≤ 2e-15             0
  1.20     ≤ 2e-15             0
  1.40     ≤ 1e-15             0
```

The shape is right — infidelity falls off a cliff around $$T_\mathrm{min}$$ and hits
machine precision just past it — but graded strictly, the $$K = 32$$ curve does *not*
snap exactly at $$T/T_\mathrm{min} = 1$$: at the bound itself $$1-F = 1.5\times10^{-3}$$,
and machine zero only arrives by $$1.10\,T_\mathrm{min}$$. Below the cliff, the floor
sits consistently *above* the instantaneous-locals envelope (at $$0.80\,T_\mathrm{min}$$:
$$3.46\times10^{-2}$$ measured vs $$2.45\times10^{-2}$$). Before believing the bound has
been verified, that discrepancy has to be owned or explained.

It is physics, not optimizer failure. The Khaneja–Glaser protocol at $$T_\mathrm{min}$$
needs *instantaneous* local rotations, but a piecewise-constant pulse does its local
dressing in segments of duration $$\delta t = T/K$$ — during which the always-on drift
keeps acting, and the fast rotation partially echoes the accumulated
$$\sigma_z\sigma_z$$ angle away. The effective class angle falls short of $$JT$$ by
$$O(\delta t)$$, i.e. $$O(1/K)$$. Two quantitative predictions follow: the sub-cliff
excess over the envelope should decay as $$1/K$$, and the deficit at
$$T = T_\mathrm{min}$$ exactly — where the envelope is *quadratic* in the missing angle
($$\partial_\theta \sin 2\theta = 0$$ at $$\theta = \pi/4$$) — should decay as
$$1/K^2$$. Both measured:

```text
sub-cliff floor at T = 0.80·T_min vs K   (envelope: 2.447174e-02)
   K     best 1-F        excess           K·excess
    8    7.095557e-02    +4.648e-02       0.372
   16    5.118964e-02    +2.672e-02       0.428
   32    3.453042e-02    +1.006e-02       0.322
   64    3.026582e-02    +5.794e-03       0.371
  128    2.692773e-02    +2.456e-03       0.314
```

Graded: $$K\cdot\mathrm{excess}$$ is flat (0.31–0.43, no trend) across a factor of 16
in $$K$$ — the predicted $$1/K$$ decay toward the instantaneous-locals envelope ✓. And
at the bound itself:

```text
1-F at T = T_min exactly, vs K
   K     best 1-F        K²·(1-F)
    8    2.350237e-02    1.50
   16    7.933570e-03    2.03
   32    1.504816e-03    1.54
   64    4.694385e-04    1.92
  128    1.174138e-04    1.92
  256    3.469717e-05    2.27
```

Graded: $$K^2(1-F)$$ stays within $$[1.5, 2.3]$$ with no trend while $$K$$ spans a
factor of 32 and $$1-F$$ falls by a factor of nearly $$700$$ — the predicted $$1/K^2$$ ✓.
Meanwhile the machine-zero onset marches onto the bound from above: $$1.10\,T_\mathrm{min}$$
at $$K=32$$, $$1.05$$ at $$K=64$$, $$1.025$$ at $$K=128$$ (the fainter curves in the
widget). So the Khaneja–Glaser bound is verified in the terms it was stated in: as the
controls approach the fast-local idealization, the reachable set snaps to *exactly*
$$T_\mathrm{min} = \pi/(4J)$$ — a CNOT is synthesizable there and measurably not below
it, with the finite-$$K$$ corrections decaying at their predicted rates.

**Cross-check against `GRAPE.jl`.** Same problems, independent implementation
(`QuantumControl.jl` trajectories + `J_T_sm` functional, L-BFGS-B):

```text
qubit  Δ=1, T=3.0, K=20:    GRAPE.jl 1-F = -6.7e-16       from-scratch: ≤ 3e-15        ✓
CNOT   T=1.10·π/4, K=32:    GRAPE.jl 1-F = 3.04e-13       from-scratch: ≤ 2e-15        ✓
CNOT   T=0.80·π/4, K=32:    GRAPE.jl 1-F = 3.45930e-02    from-scratch: 3.45931e-02    ✓
```

The last line is the strong form of the cross-check: two unrelated codes agree not just
where the answer is trivial (machine zero above the cliff) but on the *nontrivial*
finite-$$K$$ sub-cliff floor — to five digits. (Both needed multi-start to get there —
one GRAPE.jl seed stalls at $$3.7\times10^{-2}$$ — and the agreement is on a shared
near-optimal basin rather than a sharp constant: the $$K$$-study's deeper multi-start
shaves the same floor to $$3.453\times10^{-2}$$. Either way, both implementations sit
the predicted $$\sim 0.33/K$$ above the instantaneous-locals envelope.)

## 5 · What it teaches

The speed limits did the teaching. GRAPE itself is almost disappointingly simple — two
sweeps and a matrix exponential identity — but the referees turned it into a measuring
instrument: the optimizer's converged fidelity *is* the reachability boundary, traced so
sharply that constraint-set geometry ($$\pi$$ vs $$\pi/\sqrt2$$), a Hamiltonian
normalization convention ($$\pi/4J$$ vs $$\pi/2J$$), and the finite-bandwidth cost of
"instantaneous" local gates are all legible in the fourth decimal place of $$1-F$$. An
optimizer graded against a provable bound stops being a black box and becomes an
experiment.

The open question that stays with me: L-BFGS walked from *random* initial pulses straight
to the global optimum, every seed, every gate time — even chasing supremum-not-maximum
optima at the cliff edge. Nothing in gradient ascent promises that; generic non-convex
landscapes eat optimizers for breakfast. Why is this landscape so benign — and what has
to change (constraints? segment count? system size? noise?) before it stops being so?

<div class="sec-divider" aria-hidden="true">•••</div>

## References

{% bibliography --file refs_qcontrol --cited --group_by none %}

> ##### ABOUT THIS POST
>
> A learning-in-public entry: I write these to teach myself the numerics behind my PhD,
> with **Claude AI** as a collaborator. Every number here was produced by actually
> running the code on my own machine and checked against an independent reference — the
> direction and the physics-checking are mine. Corrections welcome!
{: .block-tip }

<script src="{{ '/assets/js/grape-cnot-cliff.js' | relative_url }}"></script>
<script>
  (function () {
    var mount = document.getElementById("grape-cliff-mount");
    if (!mount || typeof createGrapeCnotCliff !== "function") return;
    var DATA = {"J":1.0,"K":32,"Tmin":0.785398,"xs":[0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.85,0.9,0.925,0.95,0.975,0.99,1.0,1.01,1.025,1.05,1.1,1.2,1.3,1.4],"infid":[0.426170680984583,0.353958525324125,0.282982964052193,0.218347458228431,0.160471625839247,0.109559088063468,0.067452706894418,0.034593059395524,0.022517059357198,0.012861834436939,0.009017842587453,0.005820615794189,0.003221984226745,0.002100488308897,0.001492117886604,0.001075961664862,0.000513286057536,5.6430349278e-05,0.0,0.0,0.0,0.0],"env":[0.4217827675,0.3454915028,0.2730047501,0.2061073739,0.1464466094,0.0954915028,0.0544967379,0.0244717419,0.0138150398,0.0061558297,0.0034657715,0.0015413331,0.0003854819,6.16838e-05,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],"pulses":[{"x":0.5,"infid":0.160471625839247,"maxu":279.29,"u":[[0.0892,-0.419,1.5274,-5.5422,20.1394,-279.2902,128.1575,-19.2828,4.9762,-1.2855,0.3312,-0.0851,0.0218,-0.0056,0.0014,-0.0004,0.0001,-0.0,0.0,-0.0,0.0,0.0,-0.0,-0.0,0.0,-0.0,0.0,-0.0001,0.0003,-0.0008,0.0018,-0.0014],[0.054,-0.274,1.0856,-4.254,16.6706,-90.066,263.9378,-17.5616,4.8784,-1.3556,0.3758,-0.104,0.0287,-0.0079,0.0022,-0.0006,0.0002,-0.0,0.0,-0.0,0.0,-0.0,0.0,0.0,-0.0,0.0,-0.0,0.0,-0.0001,0.0002,-0.0005,0.0006],[-1.6227,0.5892,-0.2283,0.2161,-0.6587,-59.3918,-230.6653,18.2491,-4.8629,1.3018,-0.3486,0.0934,-0.025,0.0067,-0.0018,0.0005,-0.0001,0.0,-0.0,0.0,0.0,-0.0,0.0,-0.0001,0.0005,-0.0017,0.0057,-0.0187,0.0604,-0.1905,0.58,-1.6201],[160.079,-40.9204,12.1995,-8.01,19.9259,-265.8506,-144.5438,5.7163,-1.539,0.4161,-0.1125,0.0304,-0.0082,0.0022,-0.0006,0.0002,-0.0,0.0,0.0,-0.0,0.0001,-0.0003,0.0011,-0.004,0.015,-0.0558,0.2083,-0.7773,2.9012,-10.8301,40.5554,-160.0035]]},{"x":0.8,"infid":0.034593059395524,"maxu":206.17,"u":[[-12.0617,152.6987,-6.9751,1.8816,-0.5093,0.1378,-0.0373,0.0101,-0.0027,0.0007,-0.0002,0.0001,-0.0,0.0001,-0.0003,0.0013,-0.0048,0.0177,-0.0659,0.2452,-0.9122,3.393,-12.6595,176.1001,-12.6404,3.3648,-0.8982,0.2393,-0.0622,0.0114,0.0127,-0.0527],[7.6672,-96.8177,4.4146,-1.1501,0.3004,-0.0784,0.0205,-0.0053,0.0014,-0.0004,0.0001,-0.0,0.0,0.0,-0.0,0.0001,-0.0006,0.0025,-0.0104,0.0424,-0.1721,0.6942,-2.7921,39.4361,-2.8737,0.8193,-0.2336,0.0669,-0.0204,0.0083,-0.0013,-0.0631],[-1.0524,0.7311,0.0837,-0.0842,0.0392,-0.0149,0.0052,-0.0017,0.0005,-0.0002,0.0,-0.0,-0.0,0.0001,-0.0002,0.0008,-0.0031,0.0116,-0.0442,0.1675,-0.6355,2.4099,-9.164,127.9782,-9.2233,2.5043,-0.69,0.2137,-0.13,0.2081,-0.34,-0.638],[114.3148,-206.1656,15.0254,-4.0179,1.0764,-0.2884,0.0772,-0.0207,0.0055,-0.0015,0.0004,-0.0001,0.0,0.0001,-0.0003,0.001,-0.0037,0.0136,-0.05,0.184,-0.6766,2.4872,-9.1689,127.23,-9.1004,2.3604,-0.5015,-0.3191,1.7693,-6.759,25.3528,-100.016]]},{"x":0.95,"infid":0.005820615794189,"maxu":158.0,"u":[[0.1802,-0.7955,2.9409,-10.9864,151.7481,-10.8843,2.9245,-0.7865,0.211,-0.0565,0.0151,-0.004,0.0011,-0.0003,0.0001,-0.0,0.0,0.0,-0.0,0.0001,-0.0003,0.001,-0.0035,0.0125,-0.0452,0.1626,-0.5823,2.0777,-7.4049,113.8435,-9.167,1.8194],[-0.0579,0.0151,0.2942,-0.7513,8.9587,-0.5176,-0.0148,0.0452,-0.0231,0.0092,-0.0032,0.0011,-0.0003,0.0001,-0.0,0.0,0.0,-0.0,0.0,-0.0,0.0001,-0.0004,0.0015,-0.0061,0.025,-0.1013,0.4066,-1.6201,6.4346,-101.1643,8.2493,-1.7211],[-0.141,0.805,1.5877,-7.7697,108.2851,-7.5737,1.9214,-0.4864,0.1224,-0.0306,0.0076,-0.0019,0.0005,-0.0001,0.0,-0.0,0.0,-0.0,0.0,-0.0,0.0001,-0.0004,0.0014,-0.0046,0.0141,-0.0417,0.1143,-0.2715,0.4353,-1.0108,1.045,-0.0304],[-84.3604,21.8365,-7.5916,9.0365,-106.9687,7.8947,-2.2204,0.6237,-0.1745,0.0486,-0.0135,0.0037,-0.001,0.0003,-0.0001,0.0,-0.0,0.0,-0.0,0.0001,-0.0003,0.0011,-0.0041,0.0153,-0.0577,0.2165,-0.8104,3.0274,-11.3154,157.997,-33.7816,86.8437]]},{"x":1.0,"infid":0.001492117886604,"maxu":136.79,"u":[[0.3196,0.007,-0.0185,0.0083,0.0005,-0.0144,0.0576,-0.2128,0.7734,-2.7825,9.9399,-136.79,9.7832,-2.5427,0.6562,-0.1675,0.0422,-0.0104,0.0025,-0.0005,0.0,-0.0001,0.0007,-0.0027,0.0091,-0.0314,0.1075,-0.3623,1.1967,-3.8507,12.0099,-65.6141],[-0.2104,0.5214,-0.2435,0.0929,-0.0312,0.0074,0.0032,-0.0022,-0.068,0.5445,-3.0997,46.2116,-3.5635,1.2547,-0.4154,0.1319,-0.0406,0.0122,-0.0036,0.0011,-0.0002,0.0,-0.0002,0.001,-0.0048,0.021,-0.0883,0.3629,-1.4653,5.8293,-23.0239,133.2057],[-2.4566,3.1641,-1.3773,0.5068,-0.1682,0.0402,0.0371,-0.1845,0.651,-2.2085,7.363,-99.7132,7.0151,-1.676,0.3917,-0.0886,0.019,-0.0037,0.0005,0.0,-0.0001,0.0002,-0.0002,0.0006,-0.0021,0.0071,-0.0225,0.0672,-0.1857,0.4477,-0.7525,-0.417],[-80.0186,20.1956,-5.3127,1.3888,-0.3602,0.0964,-0.0448,0.1032,-0.4236,1.7801,-7.3626,104.4224,-7.6951,2.2889,-0.6715,0.1942,-0.0554,0.0156,-0.0043,0.0012,-0.0003,-0.0,0.0002,-0.0007,0.0024,-0.0091,0.0336,-0.1224,0.4403,-1.5672,5.5923,-68.2987]]},{"x":1.05,"infid":5.6430349278e-05,"maxu":76.16,"u":[[-0.0741,0.1791,-0.0158,-0.5576,1.0811,-0.4721,-2.0229,4.9356,-3.6183,-6.4353,20.7581,-18.8863,-19.4076,59.3063,-25.945,-33.0194,35.8284,-8.2117,-9.0579,9.3528,-2.9513,-1.5219,2.1663,-0.9167,-0.1866,0.472,-0.251,-0.0038,0.0858,-0.0425,-0.0019,0.0038],[-0.0169,-0.1096,0.4037,-0.4109,-0.3833,1.8179,-2.2972,-0.6346,7.2146,-11.3312,1.3408,26.1662,-42.5909,1.5546,55.6486,-39.2368,-7.2646,22.4758,-12.0631,-0.5287,4.9735,-3.2208,0.3344,0.9877,-0.8057,0.1816,0.1753,-0.1806,0.052,0.0234,-0.0121,-0.0048],[-40.8505,40.463,-12.5193,0.5077,1.7306,-1.087,0.3537,-0.034,-0.0355,0.0347,-0.0361,0.0345,0.0012,-0.0637,0.0834,-0.0351,-0.0174,0.03,-0.016,0.0006,0.0071,-0.0139,0.0288,-0.0395,-0.029,0.3515,-1.0871,1.7313,0.5073,-12.5193,40.463,-40.8506],[-76.1565,3.3467,11.0755,-6.7327,2.0974,-0.1286,-0.2641,0.1767,-0.0673,0.0185,0.0038,-0.0317,0.0556,-0.0346,-0.0268,0.0595,-0.0378,0.0034,0.0129,-0.0121,0.0072,-0.0041,-0.0082,0.0596,-0.1749,0.2655,0.127,-2.0967,6.7327,-11.0757,-3.3466,76.1565]]},{"x":1.2,"infid":0.0,"maxu":76.29,"u":[[-5.8904,12.2116,-13.6166,16.7156,-1.5981,1.0436,-8.7372,0.0846,7.0754,-46.0242,-70.8102,0.0075,-5.6383,-76.2919,-26.5789,10.2859,0.0498,13.3857,-5.7262,-1.8487,-8.4238,6.1571,-3.5304,-62.2876,-21.1575,9.6786,-1.481,2.4495,1.5227,-3.7978,0.0703,0.7164],[-2.4984,13.5776,6.1779,-19.6278,7.3633,-2.879,-2.3567,2.6259,3.0011,-21.1082,-12.3022,0.4672,-8.3292,-22.1927,-8.5003,9.3221,-11.1875,11.3687,-4.0399,2.2975,0.4712,-1.7259,4.0913,56.0715,26.4696,-11.0819,-2.0292,-10.267,11.6523,-4.923,56.0207,53.5134],[-8.6188,13.3384,-3.6049,4.0618,-3.5028,11.0207,-12.0175,-5.5598,1.3142,34.6641,51.0058,0.9794,-12.569,-34.2797,-14.6421,5.5448,1.1702,9.0962,1.9155,-0.4167,-11.972,9.5326,-3.6843,-31.1318,0.5901,-7.658,10.6829,-15.575,1.3356,3.0535,0.0741,-30.1835],[-66.7232,7.4628,-5.6233,11.2431,-8.01,1.9696,6.5077,-5.6791,-16.3548,57.423,43.5423,1.3146,-21.2687,-65.4426,-17.8911,-5.7574,11.8127,-7.6655,14.5597,-5.3269,2.2857,-13.6417,9.7735,72.0022,33.2656,-2.7438,-8.4565,-0.4154,4.6996,-0.9418,-55.3703,-0.661]]}],"overlay":{"128":[[0.9,0.007819200212935],[0.95,0.002351201295255],[0.975,0.000930423593748],[1.0,0.0001174138],[1.025,2.4e-14],[1.05,0.0],[1.1,0.0]],"64":[[0.9,0.009247485970832],[0.95,0.003401792200064],[0.975,0.001570128692233],[1.0,0.000469438536865],[1.025,1.0104371302e-05],[1.05,0.0],[1.1,0.0]]}};
    var w = createGrapeCnotCliff(mount, DATA);
    var btns = document.getElementById("grape-cliff-btns");
    DATA.pulses.forEach(function (p, i) {
      var b = document.createElement("button");
      b.textContent = "T = " + p.x.toFixed(2) + "·T_min";
      b.style.cssText = "font-size:0.75rem;padding:0.15rem 0.55rem;border-radius:1rem;border:1px solid var(--global-theme-color);background:transparent;color:var(--global-text-color);cursor:pointer;";
      b.addEventListener("click", function () {
        w.setSel(i);
        Array.prototype.forEach.call(btns.children, function (c) { c.style.background = "transparent"; });
        b.style.background = "color-mix(in srgb, var(--global-theme-color) 22%, transparent)";
      });
      btns.appendChild(b);
      if (p.x === 1.0) b.click();
    });
  })();
</script>

<script src="{{ '/assets/js/equation-numbers.js' | relative_url }}"></script>
