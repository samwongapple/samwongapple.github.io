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
