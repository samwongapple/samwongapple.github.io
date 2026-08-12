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
