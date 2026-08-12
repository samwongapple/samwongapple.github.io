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
