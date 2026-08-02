# c4_gaussian_im.jl — Companion 4 of the influence-matrix series:
# "One matrix in time: the Gaussian influence matrix"
#
# For a bath of free fermions the influence matrix collapses from a temporal MPS
# to a GAUSSIAN state in the temporal fermionic Hilbert space — fully specified
# by one pairing kernel built from the bath's two-time correlators. This script
# validates the whole pipeline, then measures it on a physical bath:
#
#   part A (machinery, exact checks at small size):
#     · BCS state |ψ⟩ = exp(½ Σ A_ij c†_i c†_j)|0⟩ built explicitly via pfaffians
#     · closed-form covariances  ⟨c†c⟩ = A†(1+AA†)⁻¹A,  ⟨cc⟩ = −(1+AA†)⁻¹A
#     · Majorana covariance Γ from (C, F); entanglement from eig(iΓ) vs exact RDM
#   part B (physics: a semi-infinite tight-binding lead, half filled):
#     · surface correlators g≷(t)  (analytic eigenbasis — no diagonalization)
#     · discrete Keldysh contour kernel Δ (the hybridization, the "one matrix")
#     · kernel decay ~ t^{-3/2}; TE across time cuts: LOGARITHMIC growth
#
# Cross-checked line by line against an independent numpy implementation.
# Conventions: contour = T forward points then T backward points (reversed);
# branch signs folded into Δ (a diagonal ±1 congruence — entanglement-invariant).

using LinearAlgebra
using Printf

# all k-subsets of 1:n (tiny hand-rolled version — keeps the script dependency-free)
function combinations_(n, k)
    k == 0 && return [Int[]]
    out = Vector{Vector{Int}}()
    idx = collect(1:k)
    while true
        push!(out, copy(idx))
        i = k
        while i >= 1 && idx[i] == n - k + i; i -= 1; end
        i == 0 && break
        idx[i] += 1
        for j in i+1:k; idx[j] = idx[j-1] + 1; end
    end
    out
end

# =============================== part A ======================================
function pfaffian(M)
    n = size(M, 1)
    n == 0 && return 1.0 + 0im
    isodd(n) && return 0.0 + 0im
    n == 2 && return M[1, 2]
    tot = 0.0 + 0im
    rest = collect(2:n)
    for (idx, j) in enumerate(rest)
        sub = [k for k in rest if k != j]
        tot += (-1)^(idx-1) * M[1, j] * pfaffian(M[sub, sub])
    end
    tot
end

function bcs_state(A)
    n = size(A, 1)
    ψ = zeros(ComplexF64, 2^n)
    for k in 0:2:n
        for S in combinations_(n, k)
            ψ[1 + sum(1 << (s-1) for s in S; init=0)] = pfaffian(A[S, S])
        end
    end
    ψ / norm(ψ)
end

function op_c(n, i)                       # annihilation, mode i = bit (i-1), JW signs
    dim = 2^n
    M = zeros(ComplexF64, dim, dim)
    for s in 0:dim-1
        if (s >> (i-1)) & 1 == 1
            sgn = (-1)^count_ones(s & ((1 << (i-1)) - 1))
            M[(s ⊻ (1 << (i-1))) + 1, s + 1] = sgn
        end
    end
    M
end

function covariances_formula(A)
    n = size(A, 1); I0 = Matrix{ComplexF64}(I, n, n)
    X = A * A'
    C = A' * ((I0 + X) \ A)               # ⟨c†_i c_j⟩
    F = -((I0 + X) \ A)                   # ⟨c_i c_j⟩
    C, F
end

# Majorana covariance Γ (real antisymmetric) from the (C, F) blocks
function gamma_from_CF(C, F)
    n = size(C, 1)
    G = zeros(ComplexF64, 2n, 2n)
    for a in 1:n, b in 1:n
        cc = F[a, b]; cdagc = C[a, b]
        ccdag = (a == b ? 1.0 : 0.0) - C[b, a]
        cdcd = conj(F[b, a])
        G[2a-1, 2b-1] = cc + ccdag + cdagc + cdcd
        G[2a-1, 2b]   = -im*(cc - ccdag + cdagc - cdcd)
        G[2a,   2b-1] = -im*(cc + ccdag - cdagc - cdcd)
        G[2a,   2b]   = -(cc - ccdag - cdagc + cdcd)
    end
    real.((G - I) ./ im)
end

# entanglement of a mode subset from Γ: eigenvalues of iΓ|_subset in ±λ pairs,
# occupations ζ = (1±λ)/2, S = Σ binary entropies
function S_from_gamma(Γ, modes)
    idx = vcat([[2m-1, 2m] for m in modes]...)
    ev = eigvals(Hermitian(im .* Γ[idx, idx]))
    lam = sort(real.(ev); rev=true)[1:length(modes)]
    S = 0.0
    for l in lam, z in ((1+l)/2, (1-l)/2)
        z > 1e-12 && (S -= z*log(z))
    end
    S
end

function part_A()
    println("part A — the Gaussian machinery, exactly checked (n = 6 modes)")
    # deterministic pseudo-random antisymmetric A (reproducible across julia versions)
    vals = [sin(1.7k + 0.3) + im*cos(2.3k + 1.1) for k in 1:36]
    Araw = reshape(vals, 6, 6)
    A = (Araw - transpose(Araw)) / 2
    ψ = bcs_state(A)
    cs = [op_c(6, i) for i in 1:6]
    Cex = [ψ' * (cs[i]' * cs[j] * ψ) for i in 1:6, j in 1:6]
    Fex = [ψ' * (cs[i] * cs[j] * ψ) for i in 1:6, j in 1:6]
    Cf, Ff = covariances_formula(A)
    @printf("  covariance closed forms:  max|ΔC| = %.2e   max|ΔF| = %.2e\n",
            maximum(abs.(Cex .- Cf)), maximum(abs.(Fex .- Ff)))
    Γ = gamma_from_CF(Cf, Ff)
    # exact RDM entropy for modes 1:3 (trace out 4:6 in the occupation basis)
    S_exact = let
        sub = 1:3
        ρ = zeros(ComplexF64, 8, 8)
        for sB in 0:7
            v = zeros(ComplexF64, 8)
            for sA in 0:7
                # kept modes are the LOWEST bits, so no JW reordering signs arise
                v[sA + 1] = ψ[(sA | (sB << 3)) + 1]
            end
            ρ .+= v * v'
        end
        ev = real.(eigvals(Hermitian(ρ))); ev = ev[ev .> 1e-14]
        -sum(ev .* log.(ev))
    end
    S_gauss = S_from_gamma(Γ, 1:3)
    @printf("  entanglement, modes 1–3:  RDM S = %.10f   Γ-formula S = %.10f   |Δ| = %.1e\n",
            S_exact, S_gauss, abs(S_exact - S_gauss))
end

# =============================== part B ======================================
# semi-infinite tight-binding lead, hopping 1, half filled, via the analytic
# eigenbasis of the N-site chain: ε_k = -2cos(kπ/(N+1)), φ_k(1) ∝ sin(kπ/(N+1))
function lead_correlators(N, tmax, dt)
    ks = 1:N
    eps = [-2cos(k*π/(N+1)) for k in ks]
    w1 = [2/(N+1) * sin(k*π/(N+1))^2 for k in ks]
    occ = eps .< 0
    ts = 0:dt:tmax
    ggr = [sum(w1[k] * exp(-im*eps[k]*t) for k in ks if !occ[k]) for t in ts]
    gle = [sum(w1[k] * exp(-im*eps[k]*t) for k in ks if occ[k]) for t in ts]
    ggr, gle
end

function contour_kernel(T, dt, γ, ggr, gle)
    gg(t) = t >= 0 ? ggr[1 + round(Int, t/dt)] : conj(ggr[1 + round(Int, -t/dt)])
    gl(t) = t >= 0 ? gle[1 + round(Int, t/dt)] : conj(gle[1 + round(Int, -t/dt)])
    times = vcat([(k*dt, +1.0) for k in 0:T-1], [((T-1-k)*dt, -1.0) for k in 0:T-1])
    n = 2T
    Δ = zeros(ComplexF64, n, n)
    for a in 1:n, b in 1:n
        ta, sa = times[a]; tb, sb = times[b]
        later = a >= b                     # contour ordering = index order
        gc = later ? gg(ta - tb) : -gl(ta - tb)
        Δ[a, b] = sa * sb * γ^2 * dt^2 * gc
    end
    Δ
end

function te_gaussian(Δ, T, k)
    n = size(Δ, 1)
    A = zeros(ComplexF64, 2n, 2n)
    A[1:n, n+1:2n] = Δ
    A[n+1:2n, 1:n] = -transpose(Δ)
    C, F = covariances_formula(A)
    Γ = gamma_from_CF(C, F)
    pts = vcat(1:k, (2T - k + 1):2T)      # both branches, times ≤ t_k
    modes = vcat(pts, pts .+ n)           # both mode families
    S_from_gamma(Γ, modes)
end

function part_B()
    println("\npart B — a physical bath: semi-infinite tight-binding lead (half filled)")
    N, dt, γ = 400, 0.4, 0.6
    ggr, gle = lead_correlators(N, 60.0, dt)

    println("  memory-kernel decay (semicircle band ⇒ |g(t)| ~ t^{-3/2}):")
    for t in (1.0, 4.0, 16.0, 32.0)
        g = abs(ggr[1 + round(Int, t/dt)])
        @printf("    t=%5.1f   |g| = %.4f    t^{3/2}|g| = %.2f\n", t, g, t^1.5 * g)
    end

    println("  temporal entanglement of the Gaussian IM (mid cut) — logarithmic growth:")
    for T in (8, 16, 24, 32, 40, 48)
        Δ = contour_kernel(T, dt, γ, ggr, gle)
        S = te_gaussian(Δ, T, T ÷ 2)
        @printf("    T=%3d (t=%5.1f)   S = %.4f    S/ln T = %.3f\n", T, T*dt, S, S/log(T))
    end

    println("  and the punchline of the whole part: the SIZE of the object.")
    T = 48
    @printf("    spin-chain IM at T=48:   4^48 ≈ 8·10^28 components (or an MPS)\n")
    @printf("    Gaussian IM at T=48:     one %d×%d kernel = %d complex numbers\n",
            2T, 2T, 4T^2)
end

part_A()
part_B()
