# p1_grape.jl — complete code behind "GRAPE — pure states and gate synthesis"
# (quantum-control entry 1). This file is the READ-THROUGH concatenation of the
# stage scripts, in the order they are discussed in the post; the individual
# runnable files live alongside it in this same directory:
#
#   grape_core.jl          the ~100-line GRAPE core (only LinearAlgebra)
#   check_gradients.jl     gradient triple-check: Van Loan vs FD vs Zygote
#   systemA.jl             driven qubit: Rabi referee + the QSL cliff
#   systemB_pin.jl         CNOT/ZZ convention pinning + locals-only ED envelope
#   systemB_sweep.jl       CNOT infidelity vs gate time (widget data)
#   systemB_floorK.jl      sub-cliff floor vs segment count K
#   systemB_cliffK.jl      1-F at T_min vs K (the fast-local limit)
#   crosscheck_grapejl.jl  same problems via QuantumControl.jl / GRAPE.jl
#
# Each stage runs standalone:  julia --project=. <stage>.jl
# Project deps: Optim, Zygote, QuantumControl, GRAPE, JSON.

# =============================================================================
# >>> grape_core.jl
# =============================================================================
# grape_core.jl — from-scratch GRAPE: piecewise-constant controls, exact
# propagators, first-order + exact (Van Loan) gradients. LinearAlgebra only.
#
# Conventions (pinned once, used everywhere):
#   · controls u :: K×M real matrix — K time segments, M control Hamiltonians
#   · segment Hamiltonian  H_k = H0 + Σ_j u[k,j] Hc[j]      (all Hermitian)
#   · segment propagator   U_k = exp(-i dt H_k),  dt = T/K
#   · total                U(T) = U_K ⋯ U_2 U_1
#   · state-transfer overlap   c = ⟨ψ_tgt| U(T) |ψ_0⟩,      F = |c|²
#   · gate overlap             c = Tr(V† U(T)) / d,          F = |c|²
#     (both phase-insensitive: global phase of U drops out of |c|²)

using LinearAlgebra

const sx = ComplexF64[0 1; 1 0]
const sy = ComplexF64[0 -im; im 0]
const sz = ComplexF64[1 0; 0 -1]
const id2 = Matrix{ComplexF64}(I, 2, 2)
⊗(a, b) = kron(a, b)

seg_ham(H0, Hc, uk) = H0 + sum(uk[j] * Hc[j] for j in eachindex(Hc))

"Segment propagators U_k = exp(-i dt H_k), k = 1..K."
function propagators(H0, Hc, u, dt)
    [exp(-im * dt * seg_ham(H0, Hc, view(u, k, :))) for k in 1:size(u, 1)]
end

"U(T) = U_K ⋯ U_1"
total_prop(Us) = foldl((acc, U) -> U * acc, Us)

# --- exact propagator derivative: Van Loan augmented exponential -------------
# ∂/∂u exp(-i dt (H + u Hj))  =  top-right d×d block of  exp([A B; 0 A])
# with A = -i dt H_k and B = -i dt Hj.
function dU_exact(H0, Hc, uk, dt, j)
    d = size(H0, 1)
    A = -im * dt * seg_ham(H0, Hc, uk)
    B = -im * dt * Hc[j]
    M = [A B; zero(A) A]
    exp(M)[1:d, d+1:2d]
end

# first-order (original GRAPE) approximation: ∂U_k/∂u ≈ -i dt Hj U_k
dU_first(Hc, Uk, dt, j) = -im * dt * Hc[j] * Uk

# --- fidelity + gradient -----------------------------------------------------
# Both problems share one structure. Forward accumulators Φ_k = U_k⋯U_1 |ψ0⟩
# (or ⋯U_1 as matrix), backward Λ_k = U_K⋯U_{k+1} applied to the target.
# ∂c/∂u_{k,j} = ⟨λ_k| ∂U_k |φ_{k-1}⟩  (state)  or  Tr(V† Λ_k ∂U_k Φ_{k-1})/d.
# F = |c|²  ⇒  ∂F/∂u = 2 Re( conj(c) ∂c/∂u ).

"""
    fid_grad_state(H0, Hc, u, dt, ψ0, ψt; exact=true)

Returns (F, ∇F) for F = |⟨ψt|U(T)|ψ0⟩|², ∇F a K×M matrix.
`exact=false` uses the first-order GRAPE propagator derivative.
"""
function fid_grad_state(H0, Hc, u, dt, ψ0, ψt; exact = true)
    K, M = size(u)
    Us = propagators(H0, Hc, u, dt)
    φ = Vector{Vector{ComplexF64}}(undef, K + 1)      # φ[k+1] = U_k⋯U_1 ψ0
    φ[1] = ψ0
    for k in 1:K
        φ[k+1] = Us[k] * φ[k]
    end
    λ = Vector{Vector{ComplexF64}}(undef, K + 1)      # λ[k] = (U_K⋯U_{k+1})' ψt
    λ[K+1] = ψt
    for k in K:-1:1
        λ[k] = Us[k]' * λ[k+1]
    end
    c = dot(λ[K+1], φ[K+1])                           # ⟨ψt|U(T)|ψ0⟩
    g = zeros(K, M)
    for k in 1:K, j in 1:M
        dU = exact ? dU_exact(H0, Hc, view(u, k, :), dt, j) : dU_first(Hc, Us[k], dt, j)
        dc = dot(λ[k+1], dU * φ[k])
        g[k, j] = 2 * real(conj(c) * dc)
    end
    abs2(c), g
end

"""
    fid_grad_gate(H0, Hc, u, dt, V; exact=true)

Returns (F, ∇F) for F = |Tr(V† U(T))|² / d².
"""
function fid_grad_gate(H0, Hc, u, dt, V; exact = true)
    K, M = size(u)
    d = size(V, 1)
    Us = propagators(H0, Hc, u, dt)
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
    c = tr(Λ[K+1] * Φ[K+1]) / d                       # Tr(V†U)/d
    g = zeros(K, M)
    for k in 1:K, j in 1:M
        dU = exact ? dU_exact(H0, Hc, view(u, k, :), dt, j) : dU_first(Hc, Us[k], dt, j)
        dc = tr(Λ[k+1] * dU * Φ[k]) / d
        g[k, j] = 2 * real(conj(c) * dc)
    end
    abs2(c), g
end

# fidelity only (no gradient) — for finite differences and referees
function fid_state(H0, Hc, u, dt, ψ0, ψt)
    abs2(dot(ψt, total_prop(propagators(H0, Hc, u, dt)) * ψ0))
end
fid_gate(H0, Hc, u, dt, V) = abs2(tr(V' * total_prop(propagators(H0, Hc, u, dt)))) / size(V, 1)^2

# =============================================================================
# >>> check_gradients.jl
# =============================================================================
# check_gradients.jl — triple-check the GRAPE gradient on a random instance:
# (1) analytic Van Loan gradient, (2) central finite differences, (3) Zygote autodiff.
# Also: error of the first-order gradient vs dt (expect ~dt scaling of the
# relative error, since each segment's neglected term is O(dt²) on a gradient of size O(dt)).

include("grape_core.jl")
using Zygote, Random, Printf

Random.seed!(42)

# test problem: 2 qubits, ZZ drift + 4 local controls, random controls, gate target CNOT
J = 1.0
H0 = J * (sz ⊗ sz)
Hc = [sx ⊗ id2, sy ⊗ id2, id2 ⊗ sx, id2 ⊗ sy] ./ 2
CNOT = ComplexF64[1 0 0 0; 0 1 0 0; 0 0 0 1; 0 0 1 0]
K, M = 8, 4
T = 0.6
dt = T / K
u = 2.0 .* randn(K, M)

F, g_vl = fid_grad_gate(H0, Hc, u, dt, CNOT; exact = true)
_, g_1st = fid_grad_gate(H0, Hc, u, dt, CNOT; exact = false)

# --- finite differences (central, h sweep) ---
function fd_grad(u, h)
    g = zeros(size(u))
    for i in eachindex(u)
        up = copy(u); up[i] += h
        um = copy(u); um[i] -= h
        g[i] = (fid_gate(H0, Hc, up, dt, CNOT) - fid_gate(H0, Hc, um, dt, CNOT)) / (2h)
    end
    g
end

# --- Zygote autodiff through the matrix exponentials ---
function fid_zygote(uvec)
    u = reshape(uvec, K, M)
    Utot = Matrix{ComplexF64}(I, 4, 4)
    for k in 1:K
        H = H0 + sum(u[k, j] * Hc[j] for j in 1:M)
        Utot = exp(-im * dt * H) * Utot
    end
    abs2(tr(CNOT' * Utot)) / 16
end

@printf("F = %.12f   |∇F|₂ = %.6e\n\n", F, norm(g_vl))

g_ad = Zygote.gradient(fid_zygote, vec(u))[1]
@printf("Zygote vs Van Loan:      max|Δ| = %.3e   rel = %.3e\n",
        maximum(abs.(reshape(g_ad, K, M) .- g_vl)), maximum(abs.(reshape(g_ad, K, M) .- g_vl)) / norm(g_vl, Inf))

for h in [1e-3, 1e-4, 1e-5, 1e-6]
    g_fd = fd_grad(u, h)
    @printf("FD (h=%.0e) vs Van Loan: max|Δ| = %.3e\n", h, maximum(abs.(g_fd .- g_vl)))
end

println("\nfirst-order GRAPE gradient vs exact, error scaling with dt (same T, more segments):")
for Kn in [8, 16, 32, 64, 128]
    dtn = T / Kn
    un = 2.0 .* randn(Xoshiro(7), Kn, M)
    _, ge = fid_grad_gate(H0, Hc, un, dtn, CNOT; exact = true)
    _, g1 = fid_grad_gate(H0, Hc, un, dtn, CNOT; exact = false)
    @printf("  K=%3d  dt=%.5f   max|Δ| = %.3e   max rel = %.3e\n",
            Kn, dtn, maximum(abs.(g1 .- ge)), maximum(abs.(g1 .- ge) ./ (abs.(ge) .+ 1e-300)))
end

# =============================================================================
# >>> systemA.jl
# =============================================================================
# systemA.jl — driven qubit.
#   H = (Δ/2) σz + (ux/2) σx + (uy/2) σy       (ux is the Rabi rate)
# Referee 1: propagator vs analytic resonant Rabi formula P_flip = sin²(ΩT/2).
# Demo:      GRAPE state transfer |0⟩→|1⟩ with detuning drift, unconstrained.
# Referee 2: QSL cliff — single bounded σx control, Δ=0, T_min = π/Ω_max;
#            below the cliff the exact envelope is F = sin²(Ω_max T / 2).
# Remark:    two independently-boxed controls move the cliff to π/(√2 Ω_max).

include("grape_core.jl")
using Optim, Random, Printf

const ψ0 = ComplexF64[1, 0]
const ψ1 = ComplexF64[0, 1]

# ---------- referee 1: the simulator itself --------------------------------
println("— referee 1: constant resonant drive vs analytic sin²(ΩT/2) —")
let Ω = 1.3, K = 50
    for T in [0.5, 1.7, π / Ω, 4.0]
        u = hcat(fill(Ω, K), zeros(K))                 # ux = Ω, uy = 0
        F = fid_state(sz .* 0, [sx ./ 2, sy ./ 2], u, T / K, ψ0, ψ1)
        @printf("  T=%.4f   F_sim=%.15f   sin²(ΩT/2)=%.15f   |Δ|=%.1e\n",
                T, F, sin(Ω * T / 2)^2, abs(F - sin(Ω * T / 2)^2))
    end
end

# ---------- optimizer wrapper ----------------------------------------------
"""maximize F, return (F_best, u_best). lo/hi = nothing → unconstrained LBFGS."""
function grape_opt(H0, Hc, K, T, obj; lo = nothing, hi = nothing,
                   restarts = 4, amp0 = 1.0, rng = Xoshiro(1), gtol = 1e-12)
    M = length(Hc)
    dt = T / K
    best = (-Inf, zeros(K, M))
    for _ in 1:restarts
        u0 = amp0 .* randn(rng, K, M)
        if lo !== nothing
            u0 .= clamp.(u0, 0.8 * lo, 0.8 * hi)
        end
        function fg!(f, g, x)
            F, G = obj(reshape(x, K, M), dt)
            if g !== nothing
                g .= -vec(G)
            end
            return f === nothing ? nothing : 1.0 - F
        end
        opts = Optim.Options(g_tol = gtol, iterations = 2000)
        res = lo === nothing ?
              optimize(Optim.only_fg!(fg!), vec(u0), LBFGS(), opts) :
              optimize(Optim.only_fg!(fg!), fill(lo, K * M), fill(hi, K * M),
                       vec(u0), Fminbox(LBFGS()), opts)
        F = 1.0 - Optim.minimum(res)
        F > best[1] && (best = (F, reshape(Optim.minimizer(res), K, M)))
    end
    best
end

# ---------- demo: detuned qubit, unconstrained -----------------------------
println("\n— GRAPE, detuned qubit (Δ=1), σx+σy controls, unconstrained, K=20 —")
let Δ = 1.0, K = 20
    H0 = Δ / 2 .* sz
    Hc = [sx ./ 2, sy ./ 2]
    obj(u, dt) = fid_grad_state(H0, Hc, u, dt, ψ0, ψ1)
    for T in [2.0, 3.0]
        F, u = grape_opt(H0, Hc, K, T, obj)
        @printf("  T=%.1f   1-F = %.3e   max|u| = %.2f\n", T, 1 - F, maximum(abs.(u)))
    end
end

# ---------- referee 2: the QSL cliff ---------------------------------------
println("\n— QSL cliff: single σx control, |u| ≤ Ω_max = 1, Δ = 0, K = 40 —")
println("   T/T_QSL    1-F(GRAPE)      1-F(analytic)   |Δ|")
let Ωmax = 1.0, K = 40, TQSL = π / Ωmax
    H0 = 0.0 .* sz
    Hc = [sx ./ 2]
    obj(u, dt) = fid_grad_state(H0, Hc, u, dt, ψ0, ψ1)
    for x in [0.60, 0.70, 0.80, 0.90, 0.95, 1.00, 1.05, 1.10, 1.25, 1.40]
        T = x * TQSL
        F, _ = grape_opt(H0, Hc, K, T, obj; lo = -Ωmax, hi = Ωmax, restarts = 4)
        Fan = min(1.0, sin(Ωmax * T / 2)^2)            # envelope; =1 above cliff
        @printf("   %.2f      %.6e    %.6e    %.1e\n", x, 1 - F, 1 - Fan, abs((1 - F) - (1 - Fan)))
    end
end

println("\n— constraint geometry: BOTH σx,σy boxed at Ω_max=1 ⇒ cliff at π/(√2 Ω_max) —")
let Ωmax = 1.0, K = 40
    H0 = 0.0 .* sz
    Hc = [sx ./ 2, sy ./ 2]
    obj(u, dt) = fid_grad_state(H0, Hc, u, dt, ψ0, ψ1)
    Tstar = π / (sqrt(2) * Ωmax)
    for x in [0.90, 0.97, 1.00, 1.03, 1.10]
        T = x * Tstar
        F, _ = grape_opt(H0, Hc, K, T, obj; lo = -Ωmax, hi = Ωmax, restarts = 4)
        @printf("   T = %.3f = %.2f·π/(√2)   1-F = %.6e\n", T, x, 1 - F)
    end
end

# =============================================================================
# >>> systemB_pin.jl
# =============================================================================
# systemB_pin.jl — pin the CNOT/ZZ convention numerically, BEFORE trusting any T_min formula.
#  (a) explicit identity: CNOT = (I⊗H) · CZ · (I⊗H)  with
#      CZ = e^{iπ/4} · e^{-i(π/4) Z⊗Z} · e^{i(π/4) Z⊗I} · e^{i(π/4) I⊗Z}
#      ⇒ CNOT needs ZZ-angle exactly π/4 (convention H_drift = J σz⊗σz ⇒ T_min = π/(4J)).
#  (b) Makhlin invariants: CNOT vs e^{-i(π/4)ZZ} — locally equivalent iff (G1,G2) equal.
#      Also: with the OTHER convention H = (J/2) σzσz, the class of e^{-iT(J/2)ZZ} hits
#      CNOT's invariants at T = π/(2J) — that's where the π/(2J) papers live.
#  (c) locals-only ED referee: for drift angle θ = JT < π/4, the best achievable
#      F = max over single-qubit dressings of |Tr((k1⊗k2 · e^{-iθZZ} · k3⊗k4)† CNOT)|²/16.
#      This curve is the floor GRAPE must sit on below the cliff.

include("grape_core.jl")
using Optim, Random, Printf

const CNOT = ComplexF64[1 0 0 0; 0 1 0 0; 0 0 0 1; 0 0 1 0]
const Had = ComplexF64[1 1; 1 -1] ./ sqrt(2)
ZZ = sz ⊗ sz

# ---------- (a) explicit identity ----------
CZ = exp(-im * π / 4) * exp(-im * π / 4 .* ZZ) * exp(im * π / 4 .* (sz ⊗ id2)) * exp(im * π / 4 .* (id2 ⊗ sz))
lhs = (id2 ⊗ Had) * CZ * (id2 ⊗ Had)
@printf("(a) ‖(I⊗H)·CZ(from ZZ)·(I⊗H) − CNOT‖_max = %.2e\n", maximum(abs.(lhs .- CNOT)))

# ---------- (b) Makhlin invariants ----------
const Q = ComplexF64[1 0 0 im; 0 im 1 0; 0 im -1 0; 1 0 0 -im] ./ sqrt(2)  # magic basis
function makhlin(U)
    V = U ./ det(U)^(1 / 4)              # take U into SU(4) (up to ±i ambiguity, G-invariant combo below)
    m = transpose(Q' * V * Q) * (Q' * V * Q)
    g1 = tr(m)^2 / 16
    g2 = (tr(m)^2 - tr(m^2)) / 4
    (g1, real(g2))
end
gC = makhlin(CNOT)
gZ = makhlin(exp(-im * π / 4 .* ZZ))
@printf("(b) Makhlin  CNOT:            G1 = %.6f%+.6fim   G2 = %.6f\n", real(gC[1]), imag(gC[1]), gC[2])
@printf("    Makhlin  e^{-iπ/4 ZZ}:    G1 = %.6f%+.6fim   G2 = %.6f\n", real(gZ[1]), imag(gZ[1]), gZ[2])
@printf("    max|Δ| = %.2e\n", max(abs(gC[1] - gZ[1]), abs(gC[2] - gZ[2])))
# the other convention: H = (J/2) ZZ, J=1 — where does its class hit CNOT's?
for T in [π / 4, π / 2]
    g = makhlin(exp(-im * T / 2 .* ZZ))
    @printf("    H=(J/2)ZZ, T=%6s:      G1 = %.6f%+.6fim   G2 = %.6f\n",
            T ≈ π / 4 ? "π/4" : "π/2", real(g[1]), imag(g[1]), g[2])
end

# ---------- (c) locals-only ED envelope ----------
# k(α,β,γ) = Rz(α) Ry(β) Rz(γ), built elementwise (ForwardDiff-safe).
function su2(α, β, γ)
    ca, sa = cos(α / 2), sin(α / 2)
    cb, sb = cos(β / 2), sin(β / 2)
    cg, sg = cos(γ / 2), sin(γ / 2)
    rz1 = [complex(ca, -sa) 0; 0 complex(ca, sa)]
    ry = [complex(cb) -complex(sb); complex(sb) complex(cb)]
    rz2 = [complex(cg, -sg) 0; 0 complex(cg, sg)]
    rz1 * ry * rz2
end

function locals_only_F(θ; restarts = 12, rng = Xoshiro(2))
    core = exp(-im * θ .* ZZ)
    function negF(p)
        k1 = su2(p[1], p[2], p[3]);  k2 = su2(p[4], p[5], p[6])
        k3 = su2(p[7], p[8], p[9]);  k4 = su2(p[10], p[11], p[12])
        U = (k1 ⊗ k2) * core * (k3 ⊗ k4)
        -abs2(tr(CNOT' * U)) / 16
    end
    best = Inf
    for _ in 1:restarts
        res = optimize(negF, 2π .* rand(rng, 12), LBFGS(),
                       Optim.Options(g_tol = 1e-13, iterations = 4000); autodiff = :forward)
        best = min(best, Optim.minimum(res))
    end
    -best
end

println("\n(c) locals-only ED envelope: best F from class (θ,0,0), θ = JT")
println("      θ/(π/4)    1-F(ED)         1-sin²... candidate cos²(π/4-θ)→F? report raw")
for x in [0.0, 0.25, 0.5, 0.75, 0.9, 1.0]
    θ = x * π / 4
    F = locals_only_F(θ)
    @printf("      %.2f       %.9f     [1+cos... cand: F=%.9f]\n", x, 1 - F,
            ((1 + sin(2θ)) / 2))
end

# =============================================================================
# >>> systemB_sweep.jl
# =============================================================================
# systemB_sweep.jl — CNOT synthesis: drift J σz⊗σz (J=1), four unbounded local
# controls (σx,σy)/2 on each qubit, K=32 segments. Sweep gate time T = x·π/(4J)
# and record the best GRAPE infidelity — expect the KBG cliff at x=1 with the
# sub-cliff floor on the locals-only ED envelope 1-F = (1-sin 2JT)/2.
# Exports widget data (x, 1-F, and optimized pulses at selected x) to JSON.

include("grape_core.jl")
using Optim, Random, Printf, JSON

const CNOT = ComplexF64[1 0 0 0; 0 1 0 0; 0 0 0 1; 0 0 1 0]
const J = 1.0
const H0 = J .* (sz ⊗ sz)
const Hc = [sx ⊗ id2, sy ⊗ id2, id2 ⊗ sx, id2 ⊗ sy] ./ 2
const K = 32
const Tmin = π / (4J)

function grape_cnot(T; restarts = 8, rng = Xoshiro(11), iters = 8000)
    dt = T / K
    best = (-Inf, zeros(K, 4))
    for r in 1:restarts
        u0 = (2.0 + 3r) .* randn(rng, K, 4)
        function fg!(f, g, x)
            F, G = fid_grad_gate(H0, Hc, reshape(x, K, 4), dt, CNOT)
            g === nothing || (g .= -vec(G))
            f === nothing ? nothing : 1.0 - F
        end
        res = optimize(Optim.only_fg!(fg!), vec(u0), LBFGS(),
                       Optim.Options(g_tol = 1e-14, iterations = iters))
        F = 1.0 - Optim.minimum(res)
        F > best[1] && (best = (F, reshape(Optim.minimizer(res), K, 4)))
    end
    best
end

xs = [0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.85, 0.90, 0.925, 0.95,
      0.975, 0.99, 1.00, 1.01, 1.025, 1.05, 1.10, 1.20, 1.30, 1.40]

println("   T/Tmin     1-F(GRAPE)       1-F(ED envelope)   ratio/note")
results = []
for x in xs
    T = x * Tmin
    F, u = grape_cnot(T)
    env = x < 1 ? (1 - sin(2 * J * T)) / 2 : 0.0
    infid = max(1 - F, 0.0)
    @printf("   %.3f     %.6e     %.6e\n", x, 1 - F, env)
    push!(results, (x = x, infid = infid, env = env, u = u, maxu = maximum(abs.(u))))
end

# widget export: full curve + pulses at a handful of representative x
sel = [0.50, 0.80, 0.95, 1.00, 1.05, 1.20]
data = Dict(
    "J" => J, "K" => K, "Tmin" => Tmin,
    "xs" => [r.x for r in results],
    "infid" => [r.infid for r in results],
    "env" => [r.env for r in results],
    "pulses" => [Dict("x" => r.x, "u" => [round.(r.u[:, j]; digits = 4) for j in 1:4],
                      "infid" => r.infid, "maxu" => round(r.maxu; digits = 2))
                 for r in results if r.x in sel],
)
open(joinpath(@__DIR__, "cnot_sweep.json"), "w") do io
    JSON.print(io, data)
end
println("\nmax|u| at selected x: ",
        join(["x=$(r.x): $(round(r.maxu; digits=1))" for r in results if r.x in sel], "   "))
println("wrote cnot_sweep.json")

# =============================================================================
# >>> systemB_floorK.jl
# =============================================================================
# systemB_floorK.jl — below the cliff (x = 0.80, θ = JT = 0.2π), the best
# piecewise-constant fidelity should approach the instantaneous-locals ED
# envelope (1 - sin 2θ)/2 = 2.447174e-02 from ABOVE as K → ∞, because the
# end-of-gate local dressings occupy segments of duration dt during which the
# ZZ accumulation is disturbed. Measure the floor vs K.

include("grape_core.jl")
using Optim, Random, Printf

const CNOT = ComplexF64[1 0 0 0; 0 1 0 0; 0 0 0 1; 0 0 1 0]
const J = 1.0
const H0 = J .* (sz ⊗ sz)
const Hc = [sx ⊗ id2, sy ⊗ id2, id2 ⊗ sx, id2 ⊗ sy] ./ 2

T = 0.80 * π / 4
env = (1 - sin(2 * J * T)) / 2

println("x = 0.80, ED envelope (instantaneous locals): 1-F = $(round(env; sigdigits=7))")
println("   K     best 1-F        excess over envelope   K·excess")
for K in [8, 16, 32, 64, 128]
    dt = T / K
    best = Inf
    rng = Xoshiro(5)
    for r in 1:8
        u0 = (3.0 + 2r) .* randn(rng, K, 4)
        function fg!(f, g, x)
            F, G = fid_grad_gate(H0, Hc, reshape(x, K, 4), dt, CNOT)
            g === nothing || (g .= -vec(G))
            f === nothing ? nothing : 1.0 - F
        end
        res = optimize(Optim.only_fg!(fg!), vec(u0), LBFGS(),
                       Optim.Options(g_tol = 1e-14, iterations = 8000))
        best = min(best, Optim.minimum(res))
    end
    @printf("   %3d   %.6e     %+.3e            %.4f\n", K, best, best - env, K * (best - env))
end

# =============================================================================
# >>> systemB_cliffK.jl
# =============================================================================
# systemB_cliffK.jl — the cliff as the fast-local limit: at T = T_min exactly,
# the K-segment floor should vanish as K → ∞ (expected ~1/K², since the
# envelope is quadratic around θ = π/4 and the dressing deficit is ~1/K).
# Also: cliff-region curves at K = 64, 128 for the widget overlay.

include("grape_core.jl")
using Optim, Random, Printf, JSON

const CNOT = ComplexF64[1 0 0 0; 0 1 0 0; 0 0 0 1; 0 0 1 0]
const J = 1.0
const H0 = J .* (sz ⊗ sz)
const Hc = [sx ⊗ id2, sy ⊗ id2, id2 ⊗ sx, id2 ⊗ sy] ./ 2
const Tmin = π / (4J)

function grape_cnot(T, K; restarts = 6, rng = Xoshiro(21), iters = 8000)
    dt = T / K
    best = Inf
    for r in 1:restarts
        u0 = (2.0 + 3r) .* randn(rng, K, 4)
        function fg!(f, g, x)
            F, G = fid_grad_gate(H0, Hc, reshape(x, K, 4), dt, CNOT)
            g === nothing || (g .= -vec(G))
            f === nothing ? nothing : 1.0 - F
        end
        res = optimize(Optim.only_fg!(fg!), vec(u0), LBFGS(),
                       Optim.Options(g_tol = 1e-14, iterations = iters))
        best = min(best, Optim.minimum(res))
    end
    best
end

println("— 1-F at T = T_min exactly, vs K —")
println("   K     1-F(best)       K²·(1-F)")
for K in [8, 16, 32, 64, 128, 256]
    b = grape_cnot(Tmin, K)
    @printf("   %3d   %.6e    %.4f\n", K, b, K^2 * b)
end

println("\n— cliff region at K = 64 and 128 (widget overlay) —")
overlay = Dict()
for K in [64, 128]
    println("   K = $K")
    row = []
    for x in [0.90, 0.95, 0.975, 1.00, 1.025, 1.05, 1.10]
        b = grape_cnot(x * Tmin, K; restarts = 4, iters = 6000)
        @printf("     x=%.3f   1-F = %.6e\n", x, max(b, 0.0))
        push!(row, (x, max(b, 0.0)))
    end
    overlay[string(K)] = row
end
open(joinpath(@__DIR__, "cliffK.json"), "w") do io
    JSON.print(io, overlay)
end
println("wrote cliffK.json")

# =============================================================================
# >>> crosscheck_grapejl.jl
# =============================================================================
# crosscheck_grapejl.jl — same problems, independent implementation:
# GRAPE.jl / QuantumControl.jl (Goerz et al.) vs the from-scratch code.
#  · driven qubit: Δ=1, σx,σy controls, T=3, K=20  → expect 1-F ≈ 0 (machine)
#  · CNOT: J=1 ZZ drift + 4 local controls, K=32, T = 1.10·π/4 and 0.80·π/4
#    → expect machine-zero infidelity above the cliff, and the ED-envelope
#    floor (1-sin2JT)/2 = 0.0954915 below it.

using QuantumControl
using QuantumControl.Functionals: J_T_sm
using QuantumControl.QuantumPropagators: ExpProp
import GRAPE
using LinearAlgebra, Printf, Random

const sx = ComplexF64[0 1; 1 0]
const sy = ComplexF64[0 -im; im 0]
const sz = ComplexF64[1 0; 0 -1]
const id2 = Matrix{ComplexF64}(I, 2, 2)
⊗(a, b) = kron(a, b)
const CNOT = ComplexF64[1 0 0 0; 0 1 0 0; 0 0 0 1; 0 0 1 0]

function run_problem(H0, Hcs, kets, targets, T, K; iter_stop = 3000, seed = 1)
    rng = Xoshiro(seed)
    tlist = collect(range(0, T; length = K + 1))
    guesses = [rand(rng, K) .- 0.5 for _ in Hcs]          # piecewise-constant on intervals
    H = hamiltonian(H0, [(Hc, g) for (Hc, g) in zip(Hcs, guesses)]...)
    trajs = [Trajectory(ψ, H; target_state = ϕ) for (ψ, ϕ) in zip(kets, targets)]
    problem = ControlProblem(trajs, tlist; J_T = J_T_sm, iter_stop = iter_stop,
                             prop_method = ExpProp, check_convergence = res -> begin
                                 if res.J_T < 1e-13
                                     res.converged = true
                                     res.message = "J_T < 1e-13"
                                 end
                             end)
    res = optimize(problem; method = GRAPE, print_iters = false)
    res
end

println("— GRAPE.jl cross-check —")

# driven qubit
let Δ = 1.0, T = 3.0, K = 20
    res = run_problem(Δ / 2 .* sz, [sx ./ 2, sy ./ 2],
                      [ComplexF64[1, 0]], [ComplexF64[0, 1]], T, K)
    @printf("qubit  Δ=1, T=3.0, K=20:      GRAPE.jl 1-F = %.3e   (%s)\n", res.J_T, res.message)
end

# CNOT above and below the cliff (below: multi-start, like the from-scratch code)
for (x, seeds) in [(1.10, 1:1), (0.80, 1:5)]
    J = 1.0
    T = x * π / 4
    K = 32
    kets = [ComplexF64[i == j for i in 1:4] for j in 1:4]
    best = minimum(seeds) do s
        run_problem(J .* (sz ⊗ sz), [sx ⊗ id2, sy ⊗ id2, id2 ⊗ sx, id2 ⊗ sy] ./ 2,
                    kets, [CNOT * k for k in kets], T, K;
                    iter_stop = 10000, seed = s).J_T
    end
    env = x < 1 ? (1 - sin(2 * J * T)) / 2 : 0.0
    @printf("CNOT   T=%.2f·π/4, K=32:      GRAPE.jl best 1-F = %.6e   [ED envelope: %.6e]\n",
            x, best, env)
end

