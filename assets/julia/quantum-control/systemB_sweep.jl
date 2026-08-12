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
