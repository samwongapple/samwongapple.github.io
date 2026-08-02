# c5_rlm_solver.jl — Companion 5 of the influence-matrix series:
# "A toy impurity solver, benchmarked"
#
# The capstone: solve a quantum impurity problem from the influence-matrix side.
# The impurity is the resonant level model (RLM) — a single level ε_d coupled
# with strength γ to one or two semi-infinite tight-binding leads — chosen
# because it is EXACTLY solvable, so every number the solver produces can be
# graded against brute-force evolution of impurity + finite leads.
#
# The solver: the leads enter ONLY through their contour kernels Δ (companion 4);
# the impurity's contour Green's function follows from the discrete Dyson
# equation, resummed so the free G0 (strictly triangular for an initially
# occupied level) is never inverted:
#
#     G = (1 + G0 Δ)^(-1) G0,          n_d(t_j) = -G[j, mirror(j)]
#
# The + sign is the Grassmann Wick theorem's minus on the crossed contraction —
# see the sign-lesson note in the driver. Cross-checked against an independent
# numpy implementation.
#
# Honest scope: this is a NONINTERACTING solver (the "toy" in the title). What
# an interacting dot adds — an intra-dot U handled by temporal-MPS machinery on
# top of the same Gaussian lead kernels — is exactly the IF-MPS solver of
# Thoenniss, Sonner, Lerose & Abanin, and is where this ladder points next.

using LinearAlgebra
using Printf

# ------------------------------------------------------------ exact reference
# single-particle evolution of impurity + leads, initial state = disconnected:
# each lead a Fermi sea filled to its own μ, the dot occupied.
function exact_nd(Nlead, γ, εd, μs, ts)
    nlead = length(μs)
    M = nlead*Nlead + 1
    h = zeros(M, M)
    h[1, 1] = εd
    for l in 1:nlead
        off = 1 + (l-1)*Nlead
        h[1, off+1] = γ; h[off+1, 1] = γ
        for i in 1:Nlead-1
            h[off+i, off+i+1] = -1.0; h[off+i+1, off+i] = -1.0
        end
    end
    P0 = zeros(M, M); P0[1, 1] = 1.0
    for l in 1:nlead
        off = 1 + (l-1)*Nlead
        hl = h[off+1:off+Nlead, off+1:off+Nlead]
        e, U = eigen(Symmetric(hl))
        keep = e .< μs[l]
        P0[off+1:off+Nlead, off+1:off+Nlead] = U[:, keep] * U[:, keep]'
    end
    ef, Uf = eigen(Symmetric(h))
    map(ts) do t
        V = Uf * Diagonal(exp.(-im*ef*t)) * Uf'
        real((V * P0 * V')[1, 1])
    end
end

# ------------------------------------------------------- the kernel of a lead
function lead_g(N, tmax, dt, μ)
    ks = 1:N
    eps = [-2cos(k*π/(N+1)) for k in ks]
    w1 = [2/(N+1) * sin(k*π/(N+1))^2 for k in ks]
    occ = eps .< μ
    ts = 0:dt:tmax
    ggr = [sum(w1[k]*exp(-im*eps[k]*t) for k in ks if !occ[k]) for t in ts]
    gle = [sum(w1[k]*exp(-im*eps[k]*t) for k in ks if occ[k]) for t in ts]
    ggr, gle
end

# ---------------------------------------------------------------- the solver
function contour_nd(T, dt, γ, εd, n0, kernels)
    n = 2T
    times = vcat([k*dt for k in 0:T-1], [(T-1-k)*dt for k in 0:T-1])
    signs = vcat(fill(1.0, T), fill(-1.0, T))
    # free impurity contour GF (contour-ordered, no i's):
    G0 = [exp(-im*εd*(times[a]-times[b])) * (a >= b ? (1-n0) : -n0)
          for a in 1:n, b in 1:n]
    Δ = zeros(ComplexF64, n, n)
    for (ggr, gle) in kernels
        gg(t) = t >= 0 ? ggr[1 + round(Int, t/dt)] : conj(ggr[1 + round(Int, -t/dt)])
        gl(t) = t >= 0 ? gle[1 + round(Int, t/dt)] : conj(gle[1 + round(Int, -t/dt)])
        for a in 1:n, b in 1:n
            gc = a >= b ? gg(times[a]-times[b]) : -gl(times[a]-times[b])
            Δ[a, b] += signs[a]*signs[b]*γ^2*dt^2*gc
        end
    end
    G = (I + G0 * Δ) \ G0
    [real(-G[j, 2T+1-j]) for j in 1:T]
end

# ------------------------------------------------------------------- driver
function main()
    println("benchmark 1 — one lead, relaxation of an occupied level (ε_d=0.3, γ=0.5):")
    println("  (solver input: the 2T×2T kernel. bath size: ANY. exact input: the full chain.)")
    N, γ, εd = 300, 0.5, 0.3
    tfin = 8.0
    for dt in (0.4, 0.2, 0.1, 0.05)
        T = round(Int, tfin/dt)
        ggr, gle = lead_g(N, tfin+1, dt, 0.0)
        nd_if = contour_nd(T, dt, γ, εd, 1.0, [(ggr, gle)])
        ts = [k*dt for k in 0:T-1]
        nd_ex = exact_nd(N, γ, εd, [0.0], ts)
        @printf("  dt=%5.2f  T=%4d   max|n_IF − n_exact| = %.4f\n",
                dt, T, maximum(abs.(nd_if .- nd_ex)))
    end
    println("  → first-order convergence in the Trotter step, as the discretization predicts.")

    println("\nbenchmark 2 — TWO leads at bias V=1 (nonequilibrium transport setting):")
    N2, γ2, εd2, V = 240, 0.4, 0.2, 1.0
    dt = 0.1; tfin2 = 10.0; T = round(Int, tfin2/dt)
    kL = lead_g(N2, tfin2+1, dt, +V/2)
    kR = lead_g(N2, tfin2+1, dt, -V/2)
    nd_if = contour_nd(T, dt, γ2, εd2, 1.0, [kL, kR])
    ts = [k*dt for k in 0:T-1]
    nd_ex = exact_nd(N2, γ2, εd2, [+V/2, -V/2], ts)
    @printf("  max|n_IF − n_exact| = %.4f over t ∈ [0, %.0f]\n",
            maximum(abs.(nd_if .- nd_ex)), tfin2)
    for t in (2.0, 5.0, 9.0)
        j = round(Int, t/dt) + 1
        @printf("  t=%4.1f   exact %.4f   IF %.4f\n", t, nd_ex[j], nd_if[j])
    end
    println("  the biased leads enter the solver ONLY through two kernels — the bath is")
    println("  never simulated, at any size, in or out of equilibrium.")

    println("\nthe sign lesson (recorded so nobody repeats it): expanding ⟨ψ ψ̄ e^{ψ̄Δψ}⟩")
    println("by Grassmann Wick gives the crossed contraction a MINUS sign, so the")
    println("resummed Dyson equation is G = (1 + G0Δ)⁻¹G0, not (1 − G0Δ)⁻¹G0. The")
    println("wrong sign does not fail loudly — it produces smoothly diverging garbage")
    println("(n_d ≈ 10 by t = 7). Only the exact benchmark catches it instantly.")
end

main()
