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
